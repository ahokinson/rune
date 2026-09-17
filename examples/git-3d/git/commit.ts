// The git history model the visualizer replays. Everything here is derived purely
// from `git log` — no source files are read.

// How a file was affected by a commit. A closed set, so it is an enum rather than
// a string union.
export enum ChangeKind {
  Added = 0,
  Modified = 1,
  Deleted = 2,
}

export interface FileChange {
  kind: ChangeKind
  // Repo-relative POSIX path; the stable identity key for a file node.
  path: string
}

export interface Commit {
  hash: string
  author: string
  email: string
  // Author timestamp, in seconds since the epoch (git's %at).
  timestamp: number
  subject: string
  changes: FileChange[]
}
