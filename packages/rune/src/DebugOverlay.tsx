/**
 * `<DebugOverlay>` component: a small HUD pinned to a corner of the terminal
 * showing framesPerSecond, ticksPerSecond, current tick, mouse position, the
 * active scene and entity count, plus a PAUSED indicator. Toggled by a key.
 *
 * @module
 */

import { useKeyboard } from "@opentui/solid"
import { createMemo, createSignal, type JSX, onCleanup } from "solid-js"
import { useApplicationContext } from "./context"

/** Corner of the terminal the {@link DebugOverlay} pins itself to. */
export type DebugOverlayCorner = "topLeft" | "topRight" | "bottomLeft" | "bottomRight"

/** Properties for the {@link DebugOverlay} component. */
export interface DebugOverlayProps {
  /** Corner to anchor the overlay to (default `topLeft`). */
  corner?: DebugOverlayCorner
  /** Key that toggles overlay visibility (default `` ` ``). */
  toggleKey?: string
}

interface KeyboardEventLike {
  name?: string
  eventType?: string
}

/**
 * Renders a small debug HUD pinned to a corner of the terminal. The HUD lists
 * framesPerSecond, ticksPerSecond, the current tick, mouse position, the active
 * scene and its entity count, and a PAUSED indicator when the simulation is
 * paused. Pressing {@link DebugOverlayProps.toggleKey} toggles visibility.
 *
 * @param props - Component properties.
 * @returns The Solid element tree (a positioned box, or `null` when hidden).
 */
export function DebugOverlay(props: DebugOverlayProps): JSX.Element {
  const application = useApplicationContext()
  const [visible, setVisible] = createSignal(true)
  const corner = (): DebugOverlayCorner => props.corner ?? "topLeft"
  const toggleKey = props.toggleKey ?? "`"

  useKeyboard((event: KeyboardEventLike) => {
    if (event.eventType === "release") return
    if (event.name === toggleKey) setVisible((value) => !value)
  })

  const lines = createMemo(() => {
    const current = application.scenes.current
    const sceneName = current ? current.name : "(none)"
    const entityCount = current ? current.entities.length : 0
    return [
      `framesPerSecond: ${application.framesPerSecond().toFixed(1)}`,
      `ticksPerSecond: ${application.ticksPerSecond().toFixed(1)}`,
      `tick: ${application.tick()}`,
      `mouse: ${application.mouse.x}, ${application.mouse.y}`,
      `scene: ${sceneName}`,
      `entities: ${entityCount}`,
      application.paused() ? "PAUSED" : "",
    ].filter(Boolean)
  })

  const positionProps = (): Record<string, number | string> => {
    switch (corner()) {
      case "topRight":
        return { position: "absolute", top: 0, right: 0 }
      case "bottomLeft":
        return { position: "absolute", bottom: 0, left: 0 }
      case "bottomRight":
        return { position: "absolute", bottom: 0, right: 0 }
      default:
        return { position: "absolute", top: 0, left: 0 }
    }
  }

  onCleanup(() => setVisible(false))

  return (
    <>
      {visible() ? (
        <box {...positionProps()} padding={1} zIndex={1000}>
          {lines().map((line) => (
            <text>{line}</text>
          ))}
        </box>
      ) : null}
    </>
  )
}
