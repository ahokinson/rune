import { describe, expect, it } from "bun:test"
import { StateMachine } from "@/ai/stateMachine"
import { AnimatedSprite } from "@/draw/animatedSprite"
import { playClipForState } from "@/scene/spriteState"

type Mood = "idle" | "run"

function build(): { sprite: AnimatedSprite<string>; machine: StateMachine<Mood> } {
  const sprite = new AnimatedSprite<string>({
    clips: {
      idle: { frames: ["i"], frameDuration: 100, loop: true },
      run: { frames: ["r"], frameDuration: 100, loop: true },
    },
    initial: "idle",
  })
  const machine = new StateMachine<Mood>().addState("idle").addState("run")
  return { sprite, machine }
}

describe("playClipForState", () => {
  it("plays the clip mapped to the current state", () => {
    const { sprite, machine } = build()
    machine.transitionTo("run")
    playClipForState(machine, sprite, { idle: "idle", run: "run" })
    expect(sprite.currentClipName).toBe("run")
  })

  it("leaves the clip untouched for unmapped states", () => {
    const { sprite, machine } = build()
    machine.transitionTo("run")
    playClipForState(machine, sprite, { idle: "idle" })
    expect(sprite.currentClipName).toBe("idle")
  })

  it("is a no-op before the machine has a state", () => {
    const { sprite, machine } = build()
    playClipForState(machine, sprite, { idle: "idle", run: "run" })
    expect(sprite.currentClipName).toBe("idle")
  })
})
