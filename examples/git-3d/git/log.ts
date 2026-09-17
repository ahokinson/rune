import { ChangeKind, type Commit, type FileChange } from "./commit"

// Raised when the target directory is not inside a git work tree, so the scene
// can render a friendly message instead of crashing.
export class NotAGitRepositoryError extends Error {
  constructor(readonly directory: string) {
    super(`not a git repository: ${directory}`)
    this.name = "NotAGitRepositoryError"
  }
}

// Unit separator: git never emits it inside %H/%an/%ae/%at/%s, so it is a safe
// field delimiter even when a commit subject contains spaces, tabs, or pipes.
const UNIT = "\x1f"
const COMMIT_PREFIX = `C${UNIT}`

interface GitResult {
  stdout: string
  stderr: string
  code: number
}

async function runGit(args: string[], cwd: string): Promise<GitResult> {
  const child = Bun.spawn({ cmd: ["git", ...args], cwd, stdout: "pipe", stderr: "pipe" })
  const [stdout, stderr, code] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ])
  return { stdout, stderr, code }
}

function statusToKind(status: string): ChangeKind {
  // git status letters: A added, D deleted, M modified, plus T (type change),
  // C (copy). With --no-renames there are no R/rename rows; everything that is
  // not a clean add or delete is treated as a modification.
  if (status.startsWith("A")) return ChangeKind.Added
  if (status.startsWith("D")) return ChangeKind.Deleted
  return ChangeKind.Modified
}

// Stateful, line-at-a-time parser for the commit format below. Shared by the pure
// `parseLog` (whole-string, for tests) and the streaming `streamCommits` path so
// both interpret git's output identically. A commit is only "complete" once the
// next commit header (or end of stream) arrives, since its name-status rows follow
// the header; `onCommit` fires at that boundary so callers can consume commits as
// they stream in.
class LogParser {
  readonly commits: Commit[] = []
  private current: Commit | null = null
  private pending = false

  constructor(private readonly onCommit?: (commit: Commit) => void) {}

  feed(line: string): void {
    if (line.startsWith(COMMIT_PREFIX)) {
      this.finalize() // the previous commit's rows are done
      const [, hash = "", author = "", email = "", at = "0", ...rest] = line.split(UNIT)
      // %s can itself contain a unit separator only if someone typed one; rejoin
      // the tail so an exotic subject survives intact.
      this.current = {
        hash,
        author,
        email,
        timestamp: Number.parseInt(at, 10) || 0,
        subject: rest.join(UNIT),
        changes: [],
      }
      this.commits.push(this.current)
      this.pending = true
      return
    }
    if (!this.current) return
    // A name-status row: "<status>\t<path>". Anything else (blank lines) is skipped.
    const tab = line.indexOf("\t")
    if (tab <= 0) return
    const status = line.slice(0, tab)
    const path = line.slice(tab + 1).trim()
    if (path.length === 0) return
    const change: FileChange = { kind: statusToKind(status), path }
    this.current.changes.push(change)
  }

  // Emit the last commit once no more lines will follow.
  finish(): void {
    this.finalize()
  }

  private finalize(): void {
    if (this.pending && this.current) this.onCommit?.(this.current)
    this.pending = false
  }
}

// Parse the output of `gitLogArgs()` into commits, in the order git emitted them.
// Pure and exported so it can be unit-tested against a captured `git log` sample
// without spawning git. The streaming loader uses `LogParser` directly.
export function parseLog(text: string): Commit[] {
  const parser = new LogParser()
  for (const line of text.split("\n")) parser.feed(line)
  return parser.commits
}

// Hashes oldest-first. `--reverse` makes git buffer its whole walk before emitting,
// so on a huge repo this enumeration is the one unavoidable wait (the cost of
// finding the root) — but it carries no diffs, so it is far cheaper than computing
// every commit's patch. `-n N` caps it to the most recent N (then reversed), which
// also lets git stop early instead of walking to the root.
function revListArgs(maxCommits: number | null): string[] {
  const args = ["rev-list", "--reverse", "--date-order"]
  if (maxCommits !== null) args.push("-n", String(maxCommits))
  args.push("HEAD")
  return args
}

// Reads commit metadata + name-status for the hashes piped in on stdin, in that
// (oldest-first) order. `--no-walk=unsorted` keeps the input order and stops git
// from re-walking history; each commit's diff is computed lazily as it is reached,
// so the loader streams one commit at a time instead of buffering every diff.
function logArgs(): string[] {
  return [
    "log",
    "--no-walk=unsorted",
    "--stdin",
    "--no-renames",
    "--name-status",
    `--pretty=format:C${UNIT}%H${UNIT}%an${UNIT}%ae${UNIT}%at${UNIT}%s`,
  ]
}

function maxCommitsFromEnv(): number | null {
  const raw = process.env.GIT3D_MAX_COMMITS
  if (!raw) return null
  const value = Number.parseInt(raw, 10)
  return Number.isFinite(value) && value > 0 ? value : null
}

// The repository to visualize: GIT3D_REPO when set (the installed `git 3d`
// wrapper points it at wherever you invoked the command), otherwise the current
// working directory.
export function targetRepository(): string {
  return process.env.GIT3D_REPO ?? process.cwd()
}

export interface CommitStream {
  // Fired for each commit oldest-first, as soon as its diff has streamed in — so
  // playback can start on the first commit instead of waiting for the whole history.
  onCommit: (commit: Commit) => void
}

// Stream the history of the repo containing `cwd`, oldest commit first, invoking
// `onCommit` as each commit arrives. Enumerates hashes with `rev-list` and pipes
// them into `git log` so per-commit diffs are computed lazily and streamed rather
// than buffered — a huge repo begins playing after the one-time enumeration walk
// instead of reading its entire history up front. Throws NotAGitRepositoryError
// when `cwd` is not inside a work tree.
export async function streamCommits(cwd: string = targetRepository(), { onCommit }: CommitStream): Promise<void> {
  const root = await runGit(["rev-parse", "--show-toplevel"], cwd)
  if (root.code !== 0) throw new NotAGitRepositoryError(cwd)

  const revList = Bun.spawn({ cmd: ["git", ...revListArgs(maxCommitsFromEnv())], cwd, stdout: "pipe", stderr: "pipe" })
  const log = Bun.spawn({ cmd: ["git", ...logArgs()], cwd, stdin: revList.stdout, stdout: "pipe", stderr: "pipe" })

  const parser = new LogParser(onCommit)
  const decoder = new TextDecoder()
  let buffer = ""
  for await (const chunk of log.stdout as ReadableStream<Uint8Array>) {
    buffer += decoder.decode(chunk, { stream: true })
    let nl = buffer.indexOf("\n")
    while (nl >= 0) {
      parser.feed(buffer.slice(0, nl))
      buffer = buffer.slice(nl + 1)
      nl = buffer.indexOf("\n")
    }
    // Yield between chunks so a large burst of git output can't monopolize a frame.
    await Promise.resolve()
  }
  if (buffer.length > 0) parser.feed(buffer) // trailing line with no newline
  parser.finish()

  const [logCode, revCode] = await Promise.all([log.exited, revList.exited])
  if (revCode !== 0) throw new Error(`git rev-list failed (exit ${revCode})`)
  if (logCode !== 0) throw new Error(`git log failed (exit ${logCode})`)
}
