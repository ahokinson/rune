import { beforeEach, describe, expect, it } from "bun:test"
import { OrbitControl, type OrbitOptions } from "@/geom/orbitControl"
import { MouseButton, type MouseSnapshot } from "@/input/mouse"

// A scriptable mouse: set position and per-tick press/release edges by hand.
class FakeMouse implements MouseSnapshot {
  x = 0
  y = 0
  deltaX = 0
  deltaY = 0
  private down = new Set<MouseButton>()
  private pressed = new Set<MouseButton>()
  private released = new Set<MouseButton>()

  moveTo(x: number, y: number): void {
    this.x = x
    this.y = y
  }
  press(button: MouseButton): void {
    this.down.add(button)
    this.pressed.add(button)
  }
  release(button: MouseButton): void {
    this.down.delete(button)
    this.released.add(button)
  }
  // Clear the one-tick edges, mirroring the engine's per-tick commit.
  commit(): void {
    this.pressed.clear()
    this.released.clear()
  }
  isDown(button: MouseButton): boolean {
    return this.down.has(button)
  }
  wasPressed(button: MouseButton): boolean {
    return this.pressed.has(button)
  }
  wasReleased(button: MouseButton): boolean {
    return this.released.has(button)
  }
}

const OPTIONS: OrbitOptions = {
  yawSensitivity: 0.01,
  pitchSensitivity: 0.01,
  restPitch: 0.2,
  minPitch: -1,
  maxPitch: 1,
  spinPerSecond: 1,
  resumeDelayTicks: 3,
  tiltResumeEase: 0.5,
}

describe("OrbitControl", () => {
  let mouse: FakeMouse
  let orbit: OrbitControl

  beforeEach(() => {
    mouse = new FakeMouse()
    orbit = new OrbitControl(OPTIONS)
  })

  it("starts at rest pitch and auto-spins about yaw", () => {
    expect(orbit.pitch).toBe(OPTIONS.restPitch)
    orbit.update(mouse, 1000)
    mouse.commit()
    expect(orbit.yaw).toBeCloseTo(1, 6) // spinPerSecond * 1s
  })

  it("tracks the cursor relative to the press anchor while dragging", () => {
    mouse.moveTo(100, 100)
    mouse.press(MouseButton.Left)
    orbit.update(mouse, 16)
    mouse.commit()
    expect(orbit.dragging).toBe(true)

    mouse.moveTo(150, 80) // +50 x, -20 y from anchor
    orbit.update(mouse, 16)
    expect(orbit.yaw).toBeCloseTo(50 * OPTIONS.yawSensitivity, 6)
    expect(orbit.pitch).toBeCloseTo(OPTIONS.restPitch + 20 * OPTIONS.pitchSensitivity, 6)
  })

  it("clamps pitch to the configured bounds while dragging", () => {
    mouse.moveTo(0, 0)
    mouse.press(MouseButton.Left)
    orbit.update(mouse, 16)
    mouse.commit()
    mouse.moveTo(0, -100000) // huge upward drag
    orbit.update(mouse, 16)
    expect(orbit.pitch).toBe(OPTIONS.maxPitch)
  })

  it("holds still for the resume delay after release, then spins again", () => {
    mouse.moveTo(0, 0)
    mouse.press(MouseButton.Left)
    orbit.update(mouse, 16)
    mouse.commit()
    mouse.release(MouseButton.Left)
    orbit.update(mouse, 16)
    mouse.commit()
    expect(orbit.dragging).toBe(false)

    const yawAfterRelease = orbit.yaw
    // Hold for resumeDelayTicks ticks — yaw must not advance.
    for (let i = 0; i < OPTIONS.resumeDelayTicks; i++) orbit.update(mouse, 1000)
    expect(orbit.yaw).toBe(yawAfterRelease)
    // The next tick resumes the auto-spin.
    orbit.update(mouse, 1000)
    expect(orbit.yaw).toBeGreaterThan(yawAfterRelease)
  })

  it("does not advance the spin while paused", () => {
    orbit.update(mouse, 1000, true)
    expect(orbit.yaw).toBe(0)
  })

  it("respects canStartDrag as a drag gate", () => {
    const gated = new OrbitControl({ ...OPTIONS, canStartDrag: (x) => x > 10 })
    mouse.moveTo(5, 0)
    mouse.press(MouseButton.Left)
    gated.update(mouse, 16)
    expect(gated.dragging).toBe(false)
  })
})
