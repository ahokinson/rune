import { describe, expect, it } from "bun:test"
import {
  Action,
  BehaviorStatus,
  Condition,
  Inverter,
  Parallel,
  ParallelPolicy,
  Repeater,
  Selector,
  Sequence,
} from "@/ai/behaviorTree"

const succeed = new Action(() => BehaviorStatus.Success)
const fail = new Action(() => BehaviorStatus.Failure)

describe("Sequence", () => {
  it("succeeds when all children succeed", () => {
    expect(new Sequence([succeed, succeed]).tick(16)).toBe(BehaviorStatus.Success)
  })

  it("fails on the first failing child", () => {
    const ran: string[] = []
    const tree = new Sequence([
      new Action(() => {
        ran.push("a")
        return BehaviorStatus.Success
      }),
      new Action(() => {
        ran.push("b")
        return BehaviorStatus.Failure
      }),
      new Action(() => {
        ran.push("c")
        return BehaviorStatus.Success
      }),
    ])
    expect(tree.tick(16)).toBe(BehaviorStatus.Failure)
    expect(ran).toEqual(["a", "b"])
  })

  it("resumes a Running child without re-running earlier ones", () => {
    let aRuns = 0
    let bResult = BehaviorStatus.Running
    const tree = new Sequence([
      new Action(() => {
        aRuns++
        return BehaviorStatus.Success
      }),
      new Action(() => bResult),
    ])
    expect(tree.tick(16)).toBe(BehaviorStatus.Running)
    bResult = BehaviorStatus.Success
    expect(tree.tick(16)).toBe(BehaviorStatus.Success)
    expect(aRuns).toBe(1) // a did not re-run while b was Running
  })
})

describe("Selector", () => {
  it("succeeds on the first succeeding child", () => {
    expect(new Selector([fail, succeed, fail]).tick(16)).toBe(BehaviorStatus.Success)
  })

  it("fails when all children fail", () => {
    expect(new Selector([fail, fail]).tick(16)).toBe(BehaviorStatus.Failure)
  })
})

describe("decorators", () => {
  it("Inverter flips success and failure", () => {
    expect(new Inverter(succeed).tick(16)).toBe(BehaviorStatus.Failure)
    expect(new Inverter(fail).tick(16)).toBe(BehaviorStatus.Success)
  })

  it("Repeater succeeds after N repeats", () => {
    let runs = 0
    const repeater = new Repeater(
      new Action(() => {
        runs++
        return BehaviorStatus.Success
      }),
      3,
    )
    let status = BehaviorStatus.Running
    for (let i = 0; i < 5 && status === BehaviorStatus.Running; i++) status = repeater.tick(16)
    expect(status).toBe(BehaviorStatus.Success)
    expect(runs).toBe(3)
  })
})

describe("Condition + Parallel", () => {
  it("Condition reflects its predicate", () => {
    expect(new Condition(() => true).tick(16)).toBe(BehaviorStatus.Success)
    expect(new Condition(() => false).tick(16)).toBe(BehaviorStatus.Failure)
  })

  it("Parallel RequireAll succeeds only when all succeed", () => {
    expect(new Parallel([succeed, succeed], ParallelPolicy.RequireAll).tick(16)).toBe(BehaviorStatus.Success)
    expect(new Parallel([succeed, fail], ParallelPolicy.RequireAll).tick(16)).toBe(BehaviorStatus.Failure)
  })

  it("Parallel RequireOne succeeds when any succeeds", () => {
    expect(new Parallel([fail, succeed], ParallelPolicy.RequireOne).tick(16)).toBe(BehaviorStatus.Success)
  })
})
