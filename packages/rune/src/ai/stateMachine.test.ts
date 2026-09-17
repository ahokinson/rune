import { describe, expect, it } from "bun:test"
import { StateMachine } from "@/ai/stateMachine"

type State = "idle" | "chase" | "attack" | "die"

describe("StateMachine", () => {
  it("calls onEnter for the initial transition", () => {
    const machine = new StateMachine<State>()
    const enters: State[] = []
    machine.addState("idle", { onEnter: (previous) => enters.push(`from:${previous}` as State) })
    machine.transitionTo("idle")
    expect(machine.current).toBe("idle")
    expect(enters).toEqual(["from:null" as State])
  })

  it("calls onExit on the previous state and onEnter on the next", () => {
    const machine = new StateMachine<State>()
    const events: string[] = []
    machine.addState("idle", {
      onEnter: () => events.push("enter:idle"),
      onExit: (next) => events.push(`exit:idle->${next}`),
    })
    machine.addState("chase", {
      onEnter: (previous) => events.push(`enter:chase<-${previous}`),
    })
    machine.transitionTo("idle")
    machine.transitionTo("chase")
    expect(events).toEqual(["enter:idle", "exit:idle->chase", "enter:chase<-idle"])
  })

  it("transitionTo same state is a no-op", () => {
    const machine = new StateMachine<State>()
    let enterCount = 0
    machine.addState("idle", { onEnter: () => enterCount++ })
    machine.transitionTo("idle")
    machine.transitionTo("idle")
    expect(enterCount).toBe(1)
  })

  it("update invokes onUpdate of the current state only", () => {
    const machine = new StateMachine<State>()
    let idleTicks = 0
    let chaseTicks = 0
    machine.addState("idle", { onUpdate: () => idleTicks++ })
    machine.addState("chase", { onUpdate: () => chaseTicks++ })
    machine.transitionTo("idle")
    machine.update(16)
    machine.transitionTo("chase")
    machine.update(16)
    expect(idleTicks).toBe(1)
    expect(chaseTicks).toBe(1)
  })

  it("transitionTo throws for unknown state", () => {
    const machine = new StateMachine<State>()
    expect(() => machine.transitionTo("idle")).toThrow()
  })

  it("update before any transition is a no-op", () => {
    const machine = new StateMachine<State>()
    machine.addState("idle", { onUpdate: () => {} })
    machine.update(16)
    expect(machine.current).toBeNull()
  })
})
