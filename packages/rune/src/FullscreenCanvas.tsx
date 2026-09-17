/**
 * `<FullscreenCanvas>` convenience component: a {@link Canvas} automatically
 * sized to the terminal via {@link useTerminal}, replacing the manual
 * `useTerminal()` + `<Canvas width height>` wiring every full-screen game
 * otherwise repeats.
 *
 * @module
 */

import type { JSX } from "solid-js"
import { Canvas } from "./Canvas"
import type { Canvas as CanvasSurface } from "./draw/canvas"
import { useTerminal } from "./hooks"

/** Terminal dimensions in cells, passed to {@link FullscreenCanvasProps.children}. */
export interface TerminalSize {
  /** Width in cells. */
  width: number
  /** Height in cells. */
  height: number
}

/** Properties for the {@link FullscreenCanvas} component. */
export interface FullscreenCanvasProps {
  /** Optional ref callback invoked with the {@link CanvasSurface} once mounted. */
  ref?: (canvas: CanvasSurface) => void
  /**
   * Children, or a render function receiving the terminal size so games can size
   * their world/state from it (replaces the hand-rolled useTerminal + Canvas
   * boilerplate every example repeated).
   */
  children?: JSX.Element | ((size: TerminalSize) => JSX.Element)
}

/**
 * A {@link Canvas} sized to fill the terminal. The canonical entry for a
 * full-screen game: drop it straight inside `<Application>` instead of wiring
 * `useTerminal()` to a manual `<Canvas width height>` in every project.
 *
 * Children stay in the Canvas's JSX position (not hoisted to a const) so Solid
 * resolves them lazily inside the `CanvasContext.Provider` — hoisting would
 * create them under this component's owner, where `useCanvas()`/`useScene()`
 * can't see the canvas.
 *
 * @param props - Component properties.
 * @returns The Solid element tree rooted at the inner `<Canvas>`.
 */
export function FullscreenCanvas(props: FullscreenCanvasProps): JSX.Element {
  const terminal = useTerminal()
  const size = terminal()
  return (
    <Canvas width={size.width} height={size.height} ref={props.ref}>
      {typeof props.children === "function" ? props.children(size) : props.children}
    </Canvas>
  )
}
