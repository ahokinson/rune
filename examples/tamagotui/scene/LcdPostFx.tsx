import { type OptimizedBuffer, VignetteEffect } from "@opentui/core"
import { useRenderer } from "@opentui/solid"
import type { JSX } from "solid-js"

// DMG LCD screen emulation, applied as an opentui renderer post-process pass so
// it rides on top of the whole composited frame (not the per-entity canvas).
// The 4-green palette + day/night inversion + chunky bezels already do the LCD
// work; a soft corner vignette is all the post-FX needed to sell the "lit
// screen" read without banding the pixel art. (Scanlines were tried and
// dropped — they're a CRT artifact, not an LCD one, and they sliced the sky
// and sprites into noisy horizontal stripes.)

const VIGNETTE_STRENGTH = 0.25 // 0..1 — corner attenuation

export function LcdPostFx(): JSX.Element {
  const renderer = useRenderer()
  const vignette = new VignetteEffect(VIGNETTE_STRENGTH)
  const vignettePass = (buffer: OptimizedBuffer, _dt: number): void => {
    vignette.apply(buffer)
  }
  renderer.addPostProcessFn(vignettePass)
  return null
}
