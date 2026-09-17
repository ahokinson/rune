import { describe, expect, it } from "bun:test"
import { NullAudioContext, resolvePlayerCommand } from "@/audio/context"

describe("resolvePlayerCommand", () => {
  it("uses afplay with a volume flag on macOS", () => {
    expect(resolvePlayerCommand("darwin", "/x.wav", 0.5)).toEqual(["afplay", "-v", "0.5", "/x.wav"])
  })

  it("uses PowerShell SoundPlayer on Windows", () => {
    const cmd = resolvePlayerCommand("win32", "/x.wav", 1)
    expect(cmd[0]).toBe("powershell")
    expect(cmd.join(" ")).toContain("SoundPlayer")
  })

  it("falls back to paplay on Linux/other", () => {
    expect(resolvePlayerCommand("linux", "/x.wav", 1)).toEqual(["paplay", "/x.wav"])
  })

  it("honours a player override", () => {
    expect(resolvePlayerCommand("linux", "/x.wav", 1, "ffplay")).toEqual(["ffplay", "/x.wav"])
  })
})

describe("NullAudioContext.loadBuffer", () => {
  it("marks a buffer-loaded name as loaded", async () => {
    const audio = new NullAudioContext()
    await audio.loadBuffer("zap", new Uint8Array([1, 2, 3]))
    expect(audio.isLoaded("zap")).toBe(true)
  })
})
