/**
 * `<Canvas>` component: allocates an OpenTUI `FrameBufferRenderable`, wraps it
 * in a frame-diffing {@link FrameDiffCanvas} surface, wires mouse input to the
 * application, and exposes the surface to descendants via {@link CanvasContext}
 * (and an optional `ref` callback).
 *
 * @module
 */

import { FrameBufferRenderable, type MouseEvent, RGBA } from "@opentui/core"
import { useRenderer } from "@opentui/solid"
import { createSignal, type JSX, onCleanup, onMount } from "solid-js"
import { CanvasContext, useApplicationContext } from "./context"
import type { Canvas as CanvasSurface } from "./draw/canvas"
import { Color } from "./draw/color"
import { MouseButton } from "./input/mouse"

const BYTE_TO_FLOAT = new Float32Array(256)
for (let i = 0; i < 256; i++) BYTE_TO_FLOAT[i] = i / 255

const DEFAULT_FG_R = 255
const DEFAULT_FG_G = 255
const DEFAULT_FG_B = 255
const DEFAULT_FG_A = 255

const SPACE_CODE = 32

/** Properties for the {@link Canvas} component. */
export interface CanvasProps {
  /** Surface width in cells. */
  width: number
  /** Surface height in cells. */
  height: number
  /** Optional ref callback invoked with the {@link CanvasSurface} once mounted. */
  ref?: ((canvas: CanvasSurface) => void) | undefined
  /** Children rendered inside the canvas context provider. */
  children?: JSX.Element
}

/**
 * Maps an OpenTUI mouse `button` index to a rune {@link MouseButton}.
 *
 * @param event - The mouse event to read `button` from.
 * @returns The matching {@link MouseButton}, or `null` for unsupported buttons.
 */
function buttonFromMouseEvent(event: MouseEvent): MouseButton | null {
  switch (event.button) {
    case 0:
      return MouseButton.Left
    case 1:
      return MouseButton.Middle
    case 2:
      return MouseButton.Right
    default:
      return null
  }
}

class FrameDiffCanvas implements CanvasSurface {
  readonly width: number
  readonly height: number
  private readonly size: number

  private chars: Uint16Array
  private fR: Uint8Array
  private fG: Uint8Array
  private fB: Uint8Array
  private fA: Uint8Array
  private bR: Uint8Array
  private bG: Uint8Array
  private bB: Uint8Array
  private bA: Uint8Array

  private prevChars: Uint16Array
  private prevFR: Uint8Array
  private prevFG: Uint8Array
  private prevFB: Uint8Array
  private prevFA: Uint8Array
  private prevBR: Uint8Array
  private prevBG: Uint8Array
  private prevBB: Uint8Array
  private prevBA: Uint8Array

  private clearR = 0
  private clearG = 0
  private clearB = 0
  private clearA = 0
  private clearColor: Color

  private buffer: FrameBufferRenderable["frameBuffer"]
  private flushFg: RGBA
  private flushBg: RGBA

  constructor(buffer: FrameBufferRenderable["frameBuffer"], width: number, height: number) {
    this.buffer = buffer
    this.width = width
    this.height = height
    this.size = width * height

    this.chars = new Uint16Array(this.size)
    this.fR = new Uint8Array(this.size)
    this.fG = new Uint8Array(this.size)
    this.fB = new Uint8Array(this.size)
    this.fA = new Uint8Array(this.size)
    this.bR = new Uint8Array(this.size)
    this.bG = new Uint8Array(this.size)
    this.bB = new Uint8Array(this.size)
    this.bA = new Uint8Array(this.size)

    this.prevChars = new Uint16Array(this.size)
    this.prevFR = new Uint8Array(this.size)
    this.prevFG = new Uint8Array(this.size)
    this.prevFB = new Uint8Array(this.size)
    this.prevFA = new Uint8Array(this.size)
    this.prevBR = new Uint8Array(this.size)
    this.prevBG = new Uint8Array(this.size)
    this.prevBB = new Uint8Array(this.size)
    this.prevBA = new Uint8Array(this.size)

    this.clearColor = Color.TRANSPARENT
    this.clearR = 0
    this.clearG = 0
    this.clearB = 0
    this.clearA = 0

    this.flushFg = RGBA.fromInts(255, 255, 255, 255)
    this.flushBg = RGBA.fromInts(0, 0, 0, 0)

    this.clear(Color.TRANSPARENT)

    this.prevChars.fill(0xffff)
    this.prevFR.fill(0xff)
    this.prevFG.fill(0xff)
    this.prevFA.fill(0xff)
  }

  clear(background?: Color): void {
    const bg = background ?? this.clearColor
    this.clearColor = bg
    this.clearR = Math.round(bg.red * 255)
    this.clearG = Math.round(bg.green * 255)
    this.clearB = Math.round(bg.blue * 255)
    this.clearA = Math.round(bg.alpha * 255)
    this.chars.fill(SPACE_CODE)
    this.fR.fill(DEFAULT_FG_R)
    this.fG.fill(DEFAULT_FG_G)
    this.fB.fill(DEFAULT_FG_B)
    this.fA.fill(DEFAULT_FG_A)
    this.bR.fill(this.clearR)
    this.bG.fill(this.clearG)
    this.bB.fill(this.clearB)
    this.bA.fill(this.clearA)
  }

  setCell(x: number, y: number, character: string, foreground?: Color, background?: Color): void {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return
    const i = y * this.width + x
    const fg = foreground ?? Color.WHITE
    const bg = background ?? this.clearColor
    this.chars[i] = character.charCodeAt(0)
    this.fR[i] = Math.round(fg.red * 255)
    this.fG[i] = Math.round(fg.green * 255)
    this.fB[i] = Math.round(fg.blue * 255)
    this.fA[i] = Math.round(fg.alpha * 255)
    this.bR[i] = Math.round(bg.red * 255)
    this.bG[i] = Math.round(bg.green * 255)
    this.bB[i] = Math.round(bg.blue * 255)
    this.bA[i] = Math.round(bg.alpha * 255)
  }

  setCellBytes(
    x: number,
    y: number,
    character: string,
    fgR: number,
    fgG: number,
    fgB: number,
    bgR: number,
    bgG: number,
    bgB: number,
  ): void {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return
    const i = y * this.width + x
    this.chars[i] = character.charCodeAt(0)
    this.fR[i] = fgR
    this.fG[i] = fgG
    this.fB[i] = fgB
    this.fA[i] = 255
    this.bR[i] = bgR
    this.bG[i] = bgG
    this.bB[i] = bgB
    this.bA[i] = 255
  }

  setCellBytesUnsafe(
    x: number,
    y: number,
    character: string,
    fgR: number,
    fgG: number,
    fgB: number,
    bgR: number,
    bgG: number,
    bgB: number,
  ): void {
    const i = y * this.width + x
    this.chars[i] = character.charCodeAt(0)
    this.fR[i] = fgR
    this.fG[i] = fgG
    this.fB[i] = fgB
    this.fA[i] = 255
    this.bR[i] = bgR
    this.bG[i] = bgG
    this.bB[i] = bgB
    this.bA[i] = 255
  }

  drawText(x: number, y: number, text: string, foreground?: Color, background?: Color): void {
    const fg = foreground ?? Color.WHITE
    const bg = background ?? this.clearColor
    const fgR = Math.round(fg.red * 255)
    const fgG = Math.round(fg.green * 255)
    const fgB = Math.round(fg.blue * 255)
    const bgR = Math.round(bg.red * 255)
    const bgG = Math.round(bg.green * 255)
    const bgB = Math.round(bg.blue * 255)
    for (let i = 0; i < text.length; i++) {
      const ch = text[i]
      if (ch === undefined) continue
      this.setCellBytes(x + i, y, ch, fgR, fgG, fgB, bgR, bgG, bgB)
    }
  }

  fillRectangle(x: number, y: number, width: number, height: number, color: Color): void {
    const bgR = Math.round(color.red * 255)
    const bgG = Math.round(color.green * 255)
    const bgB = Math.round(color.blue * 255)
    const bgA = Math.round(color.alpha * 255)
    for (let row = 0; row < height; row++) {
      const cy = y + row
      if (cy < 0 || cy >= this.height) continue
      const start = Math.max(0, x)
      const end = Math.min(this.width, x + width)
      for (let col = start; col < end; col++) {
        const i = cy * this.width + col
        this.chars[i] = SPACE_CODE
        this.fR[i] = DEFAULT_FG_R
        this.fG[i] = DEFAULT_FG_G
        this.fB[i] = DEFAULT_FG_B
        this.fA[i] = DEFAULT_FG_A
        this.bR[i] = bgR
        this.bG[i] = bgG
        this.bB[i] = bgB
        this.bA[i] = bgA
      }
    }
  }

  flush(): void {
    const w = this.width
    const h = this.height
    const chars = this.chars
    const fR = this.fR
    const fG = this.fG
    const fB = this.fB
    const fA = this.fA
    const bR = this.bR
    const bG = this.bG
    const bB = this.bB
    const bA = this.bA
    const pC = this.prevChars
    const pFR = this.prevFR
    const pFG = this.prevFG
    const pFB = this.prevFB
    const pFA = this.prevFA
    const pBR = this.prevBR
    const pBG = this.prevBG
    const pBB = this.prevBB
    const pBA = this.prevBA
    const fg = this.flushFg
    const bg = this.flushBg
    const buffer = this.buffer

    let i = 0
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (
          chars[i] !== pC[i] ||
          fR[i] !== pFR[i] ||
          fG[i] !== pFG[i] ||
          fB[i] !== pFB[i] ||
          fA[i] !== pFA[i] ||
          bR[i] !== pBR[i] ||
          bG[i] !== pBG[i] ||
          bB[i] !== pBB[i] ||
          bA[i] !== pBA[i]
        ) {
          fg.r = BYTE_TO_FLOAT[fR[i]!]!
          fg.g = BYTE_TO_FLOAT[fG[i]!]!
          fg.b = BYTE_TO_FLOAT[fB[i]!]!
          fg.a = BYTE_TO_FLOAT[fA[i]!]!
          bg.r = BYTE_TO_FLOAT[bR[i]!]!
          bg.g = BYTE_TO_FLOAT[bG[i]!]!
          bg.b = BYTE_TO_FLOAT[bB[i]!]!
          bg.a = BYTE_TO_FLOAT[bA[i]!]!
          buffer.setCell(x, y, String.fromCharCode(chars[i]!), fg, bg)
        }
        i++
      }
    }

    this.prevChars.set(this.chars)
    this.prevFR.set(this.fR)
    this.prevFG.set(this.fG)
    this.prevFB.set(this.fB)
    this.prevFA.set(this.fA)
    this.prevBR.set(this.bR)
    this.prevBG.set(this.bG)
    this.prevBB.set(this.bB)
    this.prevBA.set(this.bA)
  }
}

/**
 * Mounts a cell-based canvas: creates a `FrameBufferRenderable`, wraps it in a
 * frame-diffing {@link FrameDiffCanvas}, forwards mouse events to the
 * application's mouse state, and provides the surface via {@link CanvasContext}.
 * Tears down the renderable on cleanup.
 *
 * @param props - Component properties.
 * @returns The Solid element tree rooted at the canvas context provider.
 */
export function Canvas(props: CanvasProps): JSX.Element {
  const application = useApplicationContext()
  const renderer = useRenderer()
  const [canvas, setCanvas] = createSignal<CanvasSurface | null>(null)
  let renderable: FrameBufferRenderable | undefined

  const handleMouseMove = (event: MouseEvent) => {
    application.mouse.setPosition(event.x, event.y)
  }
  const handleMouseDown = (event: MouseEvent) => {
    application.mouse.setPosition(event.x, event.y)
    const button = buttonFromMouseEvent(event)
    if (button) application.mouse.press(button)
  }
  const handleMouseUp = (event: MouseEvent) => {
    application.mouse.setPosition(event.x, event.y)
    const button = buttonFromMouseEvent(event)
    if (button) application.mouse.release(button)
  }

  onMount(() => {
    const created = new FrameBufferRenderable(renderer, {
      id: "rune-canvas",
      width: props.width,
      height: props.height,
      respectAlpha: true,
    })
    created.onMouseMove = handleMouseMove
    created.onMouseDown = handleMouseDown
    created.onMouseUp = handleMouseUp
    created.onMouseDrag = handleMouseMove
    renderer.root.add(created)
    renderable = created
    const surface = new FrameDiffCanvas(created.frameBuffer, props.width, props.height)
    setCanvas(surface)
    props.ref?.(surface)
  })

  onCleanup(() => {
    setCanvas(null)
    if (renderable) {
      renderer.root.remove(renderable)
      renderable.destroy()
      renderable = undefined
    }
  })

  return <CanvasContext.Provider value={canvas}>{props.children}</CanvasContext.Provider>
}
