import { describe, expect, it } from "bun:test"
import { AnimatedSprite, type AnimationClip } from "@/draw/animatedSprite"
import { Sprite } from "@/draw/sprite"

function frame(label: string): Sprite {
  return Sprite.fromString(label)
}

function makeClip(frames: Sprite[], frameDuration: number, loop: boolean): AnimationClip {
  return { frames, frameDuration, loop }
}

describe("AnimatedSprite", () => {
  it("returns the first frame at time zero", () => {
    const frames = [frame("a"), frame("b")]
    const sprite = new AnimatedSprite({
      clips: { idle: makeClip(frames, 100, true) },
      initial: "idle",
    })
    expect(sprite.currentFrame()).toBe(frames[0]!)
  })

  it("advances frames according to frameDuration", () => {
    const frames = [frame("a"), frame("b"), frame("c")]
    const sprite = new AnimatedSprite({
      clips: { walk: makeClip(frames, 100, true) },
      initial: "walk",
    })
    sprite.update(150)
    expect(sprite.currentFrame()).toBe(frames[1]!)
    sprite.update(100)
    expect(sprite.currentFrame()).toBe(frames[2]!)
  })

  it("loops back to the start when loop is true", () => {
    const frames = [frame("a"), frame("b")]
    const sprite = new AnimatedSprite({
      clips: { idle: makeClip(frames, 100, true) },
      initial: "idle",
    })
    sprite.update(250)
    expect(sprite.currentFrame()).toBe(frames[0]!)
  })

  it("clamps to the last frame when loop is false", () => {
    const frames = [frame("a"), frame("b")]
    const sprite = new AnimatedSprite({
      clips: { die: makeClip(frames, 100, false) },
      initial: "die",
    })
    sprite.update(1000)
    expect(sprite.currentFrame()).toBe(frames[1]!)
    expect(sprite.isFinished()).toBe(true)
  })

  it("switching clips resets the elapsed time", () => {
    const idleFrames = [frame("i")]
    const walkFrames = [frame("w1"), frame("w2")]
    const sprite = new AnimatedSprite({
      clips: {
        idle: makeClip(idleFrames, 100, true),
        walk: makeClip(walkFrames, 100, true),
      },
      initial: "idle",
    })
    sprite.update(500)
    sprite.play("walk")
    expect(sprite.currentClipName).toBe("walk")
    expect(sprite.currentFrame()).toBe(walkFrames[0]!)
  })

  it("playing the same clip is a no-op", () => {
    const frames = [frame("a"), frame("b")]
    const sprite = new AnimatedSprite({
      clips: { idle: makeClip(frames, 100, true) },
      initial: "idle",
    })
    sprite.update(150)
    sprite.play("idle")
    expect(sprite.currentFrame()).toBe(frames[1]!)
  })

  it("unknown clip names are ignored", () => {
    const frames = [frame("a")]
    const sprite = new AnimatedSprite({
      clips: { idle: makeClip(frames, 100, true) },
      initial: "idle",
    })
    sprite.play("missing")
    expect(sprite.currentClipName).toBe("idle")
  })

  it("clone produces an independent sprite that does not share playback state", () => {
    const idleFrames = [frame("i1"), frame("i2")]
    const dieFrames = [frame("d1"), frame("d2")]
    const original = new AnimatedSprite({
      clips: {
        idle: makeClip(idleFrames, 100, true),
        die: makeClip(dieFrames, 100, false),
      },
      initial: "idle",
    })

    const copy = original.clone()
    copy.play("die")
    copy.update(50)

    expect(original.currentClipName).toBe("idle")
    expect(original.currentFrame()).toBe(idleFrames[0]!)
    expect(copy.currentClipName).toBe("die")
    expect(copy.currentFrame()).toBe(dieFrames[0]!)
  })

  it("throws if initial clip does not exist", () => {
    expect(
      () =>
        new AnimatedSprite({
          clips: { walk: makeClip([frame("a")], 100, true) },
          initial: "idle",
        }),
    ).toThrow()
  })
})
