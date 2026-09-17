import { ChangeKind, type Commit } from "../git/commit"
import type { Tree, TreeNode } from "./Tree"

// How fast the replay clock advances through repo time, in git-days per real
// second. Stepped through with the ←/→ keys.
const SPEED_PRESETS = [0.25, 0.5, 1, 2, 4, 8, 16, 32] as const
const DEFAULT_SPEED_INDEX = 3 // 2 days/sec
const SECONDS_PER_DAY = 86_400

export interface ReplayStatus {
  index: number
  total: number
  timestamp: number
  commit: Commit | null
  paused: boolean
  speedLabel: string
}

// Side effects the replay fires as history plays: `onCommit` hands the view the
// author and the buildings a commit touched (so it can burst construction sparks
// over them), and `onReset` lets it clear transient effects on restart.
export interface ReplayHooks {
  onCommit(author: string, touched: TreeNode[]): void
  onReset(): void
}

// Advances a clock across the commit timestamps and applies each commit to the
// city as its moment arrives, so history "plays" forward. Commits are fed in
// oldest-first via append() as they stream from git, so playback begins on the
// first commit instead of waiting for the whole history to load; the loader stays
// well ahead of the days/sec clock. Forward-only: restart() rebuilds from the
// first commit (full reverse-scrub would need to un-apply commits and is left as
// a stretch goal).
export class Replay {
  paused = false
  private readonly commits: Commit[] = []
  private index = 0
  private simSeconds = 0
  private started = false
  private speedIndex = DEFAULT_SPEED_INDEX
  private applied: Commit | null = null
  // Reused scratch so apply() doesn't allocate a touched-list per commit.
  private readonly touched: TreeNode[] = []

  constructor(
    private readonly tree: Tree,
    private readonly hooks: ReplayHooks,
  ) {}

  // Add a newly-loaded commit to the tail; anchors the clock on the very first one.
  append(commit: Commit): void {
    if (!this.started) {
      this.simSeconds = commit.timestamp
      this.started = true
    }
    this.commits.push(commit)
  }

  restart(): void {
    this.index = 0
    this.applied = null
    this.simSeconds = this.commits[0]?.timestamp ?? 0
    this.tree.reset()
    this.hooks.onReset()
  }

  faster(): void {
    this.speedIndex = Math.min(SPEED_PRESETS.length - 1, this.speedIndex + 1)
  }

  slower(): void {
    this.speedIndex = Math.max(0, this.speedIndex - 1)
  }

  get status(): ReplayStatus {
    return {
      index: this.index,
      total: this.commits.length,
      timestamp: this.simSeconds,
      commit: this.applied,
      paused: this.paused,
      speedLabel: `${SPEED_PRESETS[this.speedIndex]}d/s`,
    }
  }

  update(deltaSeconds: number): void {
    if (this.paused || this.index >= this.commits.length) return
    this.simSeconds += SPEED_PRESETS[this.speedIndex]! * SECONDS_PER_DAY * deltaSeconds
    while (this.index < this.commits.length) {
      const commit = this.commits[this.index]!
      if (commit.timestamp > this.simSeconds) break
      this.apply(commit)
      this.index++
    }
  }

  private apply(commit: Commit): void {
    this.touched.length = 0
    for (const change of commit.changes) {
      if (change.kind === ChangeKind.Deleted) {
        this.tree.kill(change.path)
      } else {
        this.touched.push(this.tree.touch(change.path))
      }
    }
    this.hooks.onCommit(commit.author, this.touched)
    this.applied = commit
  }
}
