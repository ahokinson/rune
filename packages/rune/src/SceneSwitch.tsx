/**
 * `<SceneSwitch>` component: renders the child factory matching a reactive
 * `active` screen key, toggling branches via Solid's `<Show>` so only the
 * active screen is mounted.
 *
 * @module
 */

import { type Accessor, type JSX, Show } from "solid-js"

/** Properties for the {@link SceneSwitch} component. */
export interface SceneSwitchProps<TScreen extends string> {
  /** Reactive key identifying which screen to render. */
  active: Accessor<TScreen>
  /** Map of screen key to its render factory; only the active entry is mounted. */
  children: Partial<Record<TScreen, () => JSX.Element>>
}

/**
 * Conditionally renders the child factory whose key equals `props.active()`,
 * using Solid's `<Show>` so inactive screens are unmounted. Iterates the
 * children map in declaration order.
 *
 * @typeParam TScreen - Union of screen keys.
 * @param props - Component properties.
 * @returns A fragment of `<Show>` blocks, one per child entry.
 */
export function SceneSwitch<TScreen extends string>(props: SceneSwitchProps<TScreen>): JSX.Element {
  const entries = Object.entries(props.children) as Array<[TScreen, () => JSX.Element]>
  return (
    <>
      {entries.map(([key, factory]) => (
        <Show when={props.active() === key}>{factory()}</Show>
      ))}
    </>
  )
}
