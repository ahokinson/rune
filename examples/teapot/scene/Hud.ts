import {
  type Camera,
  type CanvasSurface,
  Color,
  type ControlEntry,
  drawControlLegend,
  drawLabeledPanel,
  Entity2D,
  FramesPerSecondCounter,
  triangleCount,
} from "@ahokinson/rune"
import type { MeshStage } from "./MeshEntity"

const HUD = Color.fromBytes(150, 200, 230)
const HUD_DIM = Color.fromBytes(70, 90, 110)
// Control keys pop in the demo's signature accent (the same teal-green the
// wireframe shader uses) so the legend reads as keys-then-labels at a glance.
const HUD_KEY = Color.fromBytes(120, 230, 170)
// A hair darker than the clear colour: fills the framed panels so the overlay
// text stays legible over the rendered mesh and floor behind it.
const PANEL_BG = Color.fromBytes(6, 8, 12)

// The bottom legend's static control list.
const CONTROLS: readonly ControlEntry[] = [
  { keys: "drag", label: "orbit" },
  { keys: "←/→", label: "mesh" },
  { keys: "S", label: "shader" },
  { keys: "T", label: "texture" },
  { keys: "H", label: "shadows" },
  { keys: "W", label: "wireframe" },
  { keys: "P", label: "physics" },
  { keys: "Space", label: "pause" },
]

// Screen-space overlay for the mesh viewer: a titled status panel (top-left) and
// a control legend (bottom), both engine HUD widgets that anchor and size
// themselves. Reads live state from the MeshStage it fronts.
export class Hud extends Entity2D {
  private readonly fps = new FramesPerSecondCounter()
  private lastDrawMs = performance.now()

  constructor(private readonly stage: MeshStage) {
    super({ zIndex: 1000 })
  }

  override draw(canvas: CanvasSurface, _camera: Camera): void {
    const now = performance.now()
    this.fps.record(now - this.lastDrawMs)
    this.lastDrawMs = now

    // Top-left status card: the mesh name inset in the frame, the current look,
    // and an fps line that grows status chips as modes turn on.
    const current = this.stage.current
    drawLabeledPanel(canvas, {
      title: current.name,
      titleColor: HUD,
      lines: [
        `${triangleCount(current.mesh)} tris · ${this.stage.look}`,
        `${this.fps.value.toFixed(0)} fps${this.stage.paused ? " · paused" : ""}${this.stage.chips}`,
      ],
      lineColor: HUD_DIM,
      panel: PANEL_BG,
      frame: HUD_DIM,
    })

    drawControlLegend(canvas, {
      controls: CONTROLS,
      keyColor: HUD_KEY,
      labelColor: HUD_DIM,
      panel: PANEL_BG,
      frame: HUD_DIM,
    })
  }
}
