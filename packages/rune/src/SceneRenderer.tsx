/**
 * `<SceneRenderer>` component: each frame, clears the canvas and draws the
 * application's active scene (or the local scene from `<Scene>` when no scene
 * is on the stack) into it using the loop's render alpha for interpolation.
 *
 * @module
 */

import type { JSX } from "solid-js"
import { useApplicationContext, useCanvasContext, useSceneContext } from "./context"
import type { Color } from "./draw/color"
import { useUpdate } from "./hooks"

/** Properties for the {@link SceneRenderer} component. */
export interface SceneRendererProps {
  /** Color used to clear the canvas each frame (default transparent). */
  clearColor?: Color
}

/**
 * Renders the active scene into the surrounding `<Canvas>` every frame. Clears
 * the canvas, draws the application's current scene (falling back to the local
 * `<Scene>` context when the stack is empty) using {@link ApplicationHandle.renderAlpha}
 * for interpolation, and flushes.
 *
 * @param props - Component properties.
 * @returns `null` — this component only produces side effects.
 */
export function SceneRenderer(props: SceneRendererProps): JSX.Element {
  const application = useApplicationContext()
  const canvasAccessor = useCanvasContext()
  const localScene = useSceneContext()
  useUpdate(() => {
    const canvas = canvasAccessor()
    if (!canvas) return
    canvas.clear(props.clearColor)
    const active = application.scenes.current ?? localScene
    active.draw(canvas, application.renderAlpha())
    canvas.flush()
  })
  return null
}
