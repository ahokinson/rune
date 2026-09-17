import { describe, expect, it } from "bun:test"
import { Easing } from "@/math/easing"
import { Tween, TweenManager, TweenState, tween } from "@/tween/tween"

describe("Tween", () => {
  it("does not advance until start() is called", () => {
    const animation = new Tween({ from: 0, to: 10, durationMilliseconds: 100 })
    animation.advance(50)
    expect(animation.value).toBe(0)
  })

  it("interpolates linearly toward the target", () => {
    const animation = tween({ from: 0, to: 10, durationMilliseconds: 100 }).start()
    animation.advance(50)
    expect(animation.value).toBeCloseTo(5, 6)
    animation.advance(50)
    expect(animation.value).toBeCloseTo(10, 6)
  })

  it("respects the supplied easing function", () => {
    const animation = tween({
      from: 0,
      to: 100,
      durationMilliseconds: 100,
      easing: Easing.quadraticIn,
    }).start()
    animation.advance(50)
    expect(animation.value).toBeCloseTo(25, 5)
  })

  it("fires onComplete once when reaching the end", () => {
    let completed = 0
    const animation = tween({ from: 0, to: 1, durationMilliseconds: 50 })
      .onComplete(() => completed++)
      .start()
    animation.advance(50)
    animation.advance(50)
    expect(completed).toBe(1)
    expect(animation.status).toBe(TweenState.Completed)
  })
})

describe("TweenManager", () => {
  it("advances every active tween and reclaims finished ones", () => {
    const manager = new TweenManager()
    const a = tween({ from: 0, to: 1, durationMilliseconds: 50 }).start()
    const b = tween({ from: 0, to: 10, durationMilliseconds: 200 }).start()
    manager.add(a)
    manager.add(b)
    manager.advance(50)
    expect(a.status).toBe(TweenState.Completed)
    expect(manager.count).toBe(1)
    expect(b.value).toBeCloseTo(2.5, 5)
  })
})
