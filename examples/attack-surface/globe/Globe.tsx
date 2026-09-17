import { Color, Scene, SceneRenderer, useApplication, useEntity } from "@ahokinson/rune"
import type { JSX } from "solid-js"
import { GlobeEntity } from "./GlobeEntity"

export interface GlobeProps {
  width: number
  height: number
}

export function Globe(props: GlobeProps): JSX.Element {
  return (
    <Scene name="globe">
      <GlobeInner width={props.width} height={props.height} />
    </Scene>
  )
}

function GlobeInner(props: { width: number; height: number }): JSX.Element {
  const app = useApplication()

  const ASPECT_Y = 0.5
  // Leave headroom around the globe so attack arcs, which bow out to ~1.5x the
  // radius from center, stay on screen instead of clipping at the edges.
  const GLOBE_FILL = 0.8
  const centerX = Math.floor(props.width / 2)
  const centerY = Math.floor(props.height / 2)
  const radius = Math.floor(
    Math.min(Math.floor(props.width / 2) - 4, Math.floor(props.height / (2 * ASPECT_Y)) - 2) * GLOBE_FILL,
  )

  useEntity(() => new GlobeEntity({ centerX, centerY, radius, mouse: app.mouse }))

  return <SceneRenderer clearColor={Color.BLACK} />
}
