import { describe, expect, it } from "bun:test"
import { createActionMap } from "@/input/actions"
import { KeyboardState } from "@/input/keyboard"
import { MouseButton, MouseState } from "@/input/mouse"
import { InputPhase } from "@/input/phase"

describe("KeyboardState", () => {
  it("tracks held keys with isDown", () => {
    const keyboard = new KeyboardState()
    expect(keyboard.isDown("space")).toBe(false)
    keyboard.press("space")
    expect(keyboard.isDown("space")).toBe(true)
    keyboard.release("space")
    expect(keyboard.isDown("space")).toBe(false)
  })

  it("flags wasPressed only on the step the key first goes down", () => {
    const keyboard = new KeyboardState()
    keyboard.press("a")
    keyboard.press("a")
    expect(keyboard.wasPressed("a")).toBe(true)
    keyboard.commitStep()
    expect(keyboard.wasPressed("a")).toBe(false)
    expect(keyboard.isDown("a")).toBe(true)
  })

  it("flags wasReleased only on the step the key first goes up", () => {
    const keyboard = new KeyboardState()
    keyboard.press("a")
    keyboard.commitStep()
    keyboard.release("a")
    expect(keyboard.wasReleased("a")).toBe(true)
    keyboard.commitStep()
    expect(keyboard.wasReleased("a")).toBe(false)
    expect(keyboard.isDown("a")).toBe(false)
  })

  it("returns 0 from axis when both or neither are held", () => {
    const keyboard = new KeyboardState()
    expect(keyboard.axis("left", "right")).toBe(0)
    keyboard.press("left")
    keyboard.press("right")
    expect(keyboard.axis("left", "right")).toBe(0)
  })

  it("returns -1 or 1 from axis depending on which side is held", () => {
    const keyboard = new KeyboardState()
    keyboard.press("left")
    expect(keyboard.axis("left", "right")).toBe(-1)
    keyboard.release("left")
    keyboard.press("right")
    expect(keyboard.axis("left", "right")).toBe(1)
  })

  it("fires a fixed-phase press on exactly one substep across a multi-substep frame", () => {
    const keyboard = new KeyboardState()
    // One press arrives between frames.
    keyboard.press("a")
    keyboard.setPhase(InputPhase.Fixed)
    // First substep observes the press, then the fixed edges are committed.
    expect(keyboard.wasPressed("a")).toBe(true)
    keyboard.commitFixed()
    // Remaining substeps of the same frame must not see it again.
    expect(keyboard.wasPressed("a")).toBe(false)
    expect(keyboard.wasPressed("a")).toBe(false)
    // The key stays held the whole time.
    expect(keyboard.isDown("a")).toBe(true)
  })

  it("keeps the frame-phase press visible after the fixed edges are committed", () => {
    const keyboard = new KeyboardState()
    keyboard.press("a")
    // Fixed pass consumes its own buffer...
    keyboard.setPhase(InputPhase.Fixed)
    expect(keyboard.wasPressed("a")).toBe(true)
    keyboard.commitFixed()
    expect(keyboard.wasPressed("a")).toBe(false)
    // ...but the once-per-frame pass still sees the press exactly once.
    keyboard.setPhase(InputPhase.Frame)
    expect(keyboard.wasPressed("a")).toBe(true)
    keyboard.commitFrame()
    expect(keyboard.wasPressed("a")).toBe(false)
  })

  it("preserves fixed edges when a frame runs zero substeps", () => {
    const keyboard = new KeyboardState()
    keyboard.press("a")
    // A frame with no substep only commits the frame buffer.
    keyboard.setPhase(InputPhase.Frame)
    keyboard.commitFrame()
    // The press is still pending for the next fixed substep that runs.
    keyboard.setPhase(InputPhase.Fixed)
    expect(keyboard.wasPressed("a")).toBe(true)
  })
})

describe("MouseState", () => {
  it("tracks position and button edges", () => {
    const mouse = new MouseState()
    mouse.setPosition(5, 7)
    expect(mouse.x).toBe(5)
    expect(mouse.y).toBe(7)
    mouse.press(MouseButton.Left)
    expect(mouse.isDown(MouseButton.Left)).toBe(true)
    expect(mouse.wasPressed(MouseButton.Left)).toBe(true)
    mouse.commitStep()
    expect(mouse.wasPressed(MouseButton.Left)).toBe(false)
    mouse.release(MouseButton.Left)
    expect(mouse.wasReleased(MouseButton.Left)).toBe(true)
    expect(mouse.isDown(MouseButton.Left)).toBe(false)
  })

  it("first setPosition produces zero delta", () => {
    const mouse = new MouseState()
    mouse.setPosition(10, 20)
    expect(mouse.deltaX).toBe(0)
    expect(mouse.deltaY).toBe(0)
  })

  it("subsequent setPosition produces delta against last committed position", () => {
    const mouse = new MouseState()
    mouse.setPosition(10, 20)
    mouse.commitStep()
    mouse.setPosition(15, 18)
    expect(mouse.deltaX).toBe(5)
    expect(mouse.deltaY).toBe(-2)
  })

  it("commitStep zeroes the delta and anchors the next frame", () => {
    const mouse = new MouseState()
    mouse.setPosition(10, 20)
    mouse.commitStep()
    mouse.setPosition(15, 25)
    mouse.commitStep()
    expect(mouse.deltaX).toBe(0)
    expect(mouse.deltaY).toBe(0)
    mouse.setPosition(20, 25)
    expect(mouse.deltaX).toBe(5)
    expect(mouse.deltaY).toBe(0)
  })

  it("multiple setPosition calls in one frame accumulate against the same anchor", () => {
    const mouse = new MouseState()
    mouse.setPosition(10, 10)
    mouse.commitStep()
    mouse.setPosition(12, 10)
    expect(mouse.deltaX).toBe(2)
    mouse.setPosition(15, 10)
    expect(mouse.deltaX).toBe(5)
  })
})

describe("createActionMap", () => {
  it("collapses multiple bindings into action queries", () => {
    const keyboard = new KeyboardState()
    const actions = createActionMap({ jump: ["space", "w", "up"], left: ["a", "left"] }, keyboard)
    expect(actions.isDown("jump")).toBe(false)
    keyboard.press("up")
    expect(actions.isDown("jump")).toBe(true)
    expect(actions.wasPressed("jump")).toBe(true)
    keyboard.commitStep()
    expect(actions.wasPressed("jump")).toBe(false)
  })

  it("supports mouse button bindings via mouse: prefix", () => {
    const keyboard = new KeyboardState()
    const mouse = new MouseState()
    const actions = createActionMap({ fire: ["space", "mouse:left"] }, keyboard, mouse)
    expect(actions.isDown("fire")).toBe(false)
    mouse.press(MouseButton.Left)
    expect(actions.isDown("fire")).toBe(true)
    expect(actions.wasPressed("fire")).toBe(true)
    mouse.commitStep()
    expect(actions.wasPressed("fire")).toBe(false)
    mouse.release(MouseButton.Left)
    expect(actions.wasReleased("fire")).toBe(true)
    expect(actions.isDown("fire")).toBe(false)
  })

  it("ignores mouse bindings when no mouse is provided", () => {
    const keyboard = new KeyboardState()
    const actions = createActionMap({ fire: ["mouse:left", "space"] }, keyboard)
    keyboard.press("space")
    expect(actions.isDown("fire")).toBe(true)
  })
})
