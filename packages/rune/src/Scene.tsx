/**
 * `<Scene>` component: pushes a {@link Scene} onto the application's scene
 * stack on mount and pops it on cleanup, exposing the instance to descendants
 * via {@link SceneContext}.
 *
 * @module
 */

import { type JSX, onCleanup, onMount } from "solid-js"
import { SceneContext, useApplicationContext } from "./context"
import { Scene as SceneInstance } from "./scene/scene"

/** Properties for the {@link Scene} component. */
export interface SceneProps {
  /** Scene name used for debugging and inspection. */
  name: string
  /** Existing scene instance to mount; a new scene is created from `name` when omitted. */
  scene?: SceneInstance
  /** Children rendered inside the scene context provider. */
  children?: JSX.Element
}

/**
 * Mounts a scene onto the application's scene stack for the lifetime of the
 * component. Emits `scene:enter` on mount and `scene:exit` on cleanup, popping
 * the stack only if it is still top, and provides the scene via
 * {@link SceneContext}.
 *
 * @param props - Component properties.
 * @returns The Solid element tree rooted at the scene context provider.
 */
export function Scene(props: SceneProps): JSX.Element {
  const application = useApplicationContext()
  const scene = props.scene ?? new SceneInstance(props.name)

  onMount(() => {
    application.scenes.push(scene)
    application.events.emit("scene:enter", { scene })
  })

  onCleanup(() => {
    application.events.emit("scene:exit", { scene })
    if (application.scenes.current === scene) {
      application.scenes.pop()
    }
  })

  return <SceneContext.Provider value={scene}>{props.children}</SceneContext.Provider>
}
