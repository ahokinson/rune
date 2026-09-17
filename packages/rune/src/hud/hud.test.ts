import { describe, expect, it } from "bun:test"
import { InMemoryCanvas } from "@/draw/canvas"
import { Color } from "@/draw/color"
import { Button, drawButton } from "@/hud/button"
import { FocusRing } from "@/hud/focus"
import { drawMenu, Menu, MenuOrientation, menuItemAt } from "@/hud/menu"
import { MouseButton, MouseState } from "@/input/mouse"

const WHITE = Color.WHITE
const BLACK = Color.BLACK

describe("Menu navigation", () => {
  const make = () =>
    new Menu({
      items: [
        { value: "a", label: "Start" },
        { value: "b", label: "Options", enabled: false },
        { value: "c", label: "Quit" },
      ],
    })

  it("starts on the first enabled item", () => {
    expect(make().value).toBe("a")
  })

  it("skips disabled items when moving", () => {
    const menu = make()
    menu.next()
    expect(menu.value).toBe("c") // skipped the disabled "Options"
  })

  it("wraps around the ends by default", () => {
    const menu = make()
    menu.previous()
    expect(menu.value).toBe("c")
    menu.next()
    expect(menu.value).toBe("a")
  })

  it("stops at the ends when wrap is off", () => {
    const menu = new Menu({
      items: [
        { value: 1, label: "one" },
        { value: 2, label: "two" },
      ],
      wrap: false,
    })
    menu.previous()
    expect(menu.value).toBe(1)
    menu.next()
    menu.next()
    expect(menu.value).toBe(2)
  })

  it("refuses setCursor onto a disabled item", () => {
    const menu = make()
    expect(menu.setCursor(1)).toBe(false)
    expect(menu.setCursor(2)).toBe(true)
    expect(menu.value).toBe("c")
  })
})

describe("drawMenu + hit-testing", () => {
  it("returns one rect per item and resolves a pointer to an index", () => {
    const canvas = new InMemoryCanvas(40, 10)
    const menu = new Menu({
      items: [
        { value: "a", label: "Start" },
        { value: "c", label: "Quit" },
      ],
    })
    const rects = drawMenu(canvas, menu, {
      x: 2,
      y: 1,
      itemColor: WHITE,
      selectedColor: BLACK,
      selectedBackground: WHITE,
      background: BLACK,
    })
    expect(rects).toHaveLength(2)
    // Rows stack vertically.
    expect(rects[0]!.y).toBe(1)
    expect(rects[1]!.y).toBe(2)
    expect(menuItemAt(rects, 3, 2)).toBe(1)
    expect(menuItemAt(rects, 100, 100)).toBe(-1)
  })

  it("lays a horizontal menu out left to right with a gap", () => {
    const canvas = new InMemoryCanvas(40, 4)
    const menu = new Menu({
      items: [
        { value: "a", label: "A" },
        { value: "b", label: "B" },
      ],
      orientation: MenuOrientation.Horizontal,
    })
    const rects = drawMenu(canvas, menu, {
      x: 0,
      y: 0,
      itemColor: WHITE,
      selectedColor: BLACK,
      selectedBackground: WHITE,
      background: BLACK,
      gap: 1,
      padding: 1,
    })
    // " A " = 3 wide, gap 1 → next chip starts at x 4.
    expect(rects[0]!.x).toBe(0)
    expect(rects[0]!.width).toBe(3)
    expect(rects[1]!.x).toBe(4)
  })
})

describe("Button", () => {
  it("hovers, then reports a click on press-and-release inside", () => {
    const canvas = new InMemoryCanvas(40, 5)
    const button = new Button({ label: "OK" })
    const mouse = new MouseState()
    const draw = () =>
      drawButton(canvas, button, {
        x: 5,
        y: 2,
        normal: { foreground: WHITE, background: BLACK },
      })
    draw()

    // Pointer outside → no hover, no click.
    mouse.setPosition(0, 0)
    expect(button.update(mouse)).toBe(false)
    expect(button.hovered).toBe(false)

    // Press inside, then release inside → click.
    mouse.setPosition(6, 2)
    mouse.press(MouseButton.Left)
    expect(button.update(mouse)).toBe(false) // press only
    expect(button.hovered).toBe(true)
    expect(button.pressed).toBe(true)
    mouse.commitStep()
    mouse.release(MouseButton.Left)
    expect(button.update(mouse)).toBe(true) // release completes the click
  })

  it("does not click when released outside", () => {
    const button = new Button({ label: "OK" })
    button.bounds.x = 5
    button.bounds.y = 2
    button.bounds.width = 4
    button.bounds.height = 1
    const mouse = new MouseState()
    mouse.setPosition(6, 2)
    mouse.press(MouseButton.Left)
    button.update(mouse)
    mouse.commitStep()
    mouse.setPosition(0, 0)
    mouse.release(MouseButton.Left)
    expect(button.update(mouse)).toBe(false)
  })

  it("ignores input while disabled", () => {
    const button = new Button({ label: "OK", enabled: false })
    button.bounds = { x: 0, y: 0, width: 10, height: 1 } as never
    const mouse = new MouseState()
    mouse.setPosition(1, 0)
    mouse.press(MouseButton.Left)
    expect(button.update(mouse)).toBe(false)
    expect(button.hovered).toBe(false)
  })
})

describe("FocusRing", () => {
  it("starts on the first enabled control and skips disabled ones", () => {
    const a = new Button({ label: "a" })
    const b = new Button({ label: "b", enabled: false })
    const c = new Button({ label: "c" })
    const ring = new FocusRing({ items: [a, b, c], isEnabled: (button) => button.enabled })
    expect(ring.focused).toBe(a)
    ring.focusNext()
    expect(ring.focused).toBe(c)
    ring.focusNext()
    expect(ring.focused).toBe(a) // wrapped
  })

  it("focuses a specific enabled control and refuses a disabled one", () => {
    const a = new Button({ label: "a" })
    const b = new Button({ label: "b", enabled: false })
    const ring = new FocusRing({ items: [a, b], isEnabled: (button) => button.enabled })
    expect(ring.focus(b)).toBe(false)
    expect(ring.focus(a)).toBe(true)
    expect(ring.focused).toBe(a)
  })
})
