import { describe, expect, test } from "bun:test"
import { ChangeKind } from "./commit"
import { parseLog } from "./log"

const UNIT = "\x1f"

// Build a `git log --pretty=format:... --name-status` block the way git emits it:
// the format line, then one name-status row per file.
function commitBlock(hash: string, author: string, email: string, at: number, subject: string, rows: string[]): string {
  const header = ["C", hash, author, email, String(at), subject].join(UNIT)
  return [header, ...rows].join("\n")
}

describe("parseLog", () => {
  test("parses commits, fields, and per-file change kinds", () => {
    const text = [
      commitBlock("a1b2c3d", "Ada Lovelace", "ada@example.com", 1_700_000_000, "first commit", [
        "A\tsrc/index.ts",
        "A\tREADME.md",
      ]),
      commitBlock("e4f5061", "Alan Turing", "alan@example.com", 1_700_100_000, "edit and remove", [
        "M\tsrc/index.ts",
        "D\tREADME.md",
      ]),
    ].join("\n")

    const commits = parseLog(text)
    expect(commits).toHaveLength(2)

    const [first, second] = commits
    expect(first!.hash).toBe("a1b2c3d")
    expect(first!.author).toBe("Ada Lovelace")
    expect(first!.email).toBe("ada@example.com")
    expect(first!.timestamp).toBe(1_700_000_000)
    expect(first!.subject).toBe("first commit")
    expect(first!.changes).toEqual([
      { kind: ChangeKind.Added, path: "src/index.ts" },
      { kind: ChangeKind.Added, path: "README.md" },
    ])

    expect(second!.changes).toEqual([
      { kind: ChangeKind.Modified, path: "src/index.ts" },
      { kind: ChangeKind.Deleted, path: "README.md" },
    ])
  })

  test("keeps a subject containing separators and pipes intact", () => {
    const subject = "fix: handle a|b and weird input"
    const text = commitBlock("deadbee", "Grace Hopper", "grace@example.com", 1_700_200_000, subject, [
      "M\tpackages/rune/src/index.ts",
    ])
    const [commit] = parseLog(text)
    expect(commit!.subject).toBe(subject)
    expect(commit!.changes).toHaveLength(1)
  })

  test("treats type-changes as modifications and ignores blank lines", () => {
    const text = `${commitBlock("c0ffee0", "Dev", "dev@example.com", 1_700_300_000, "retype", ["T\tscript.sh"])}\n\n`
    const [commit] = parseLog(text)
    expect(commit!.changes).toEqual([{ kind: ChangeKind.Modified, path: "script.sh" }])
  })

  test("returns an empty list for empty output", () => {
    expect(parseLog("")).toEqual([])
  })
})
