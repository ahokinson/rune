import {
  type Camera,
  type CanvasSurface,
  Color,
  type ControlEntry,
  drawControlLegend,
  drawLabeledPanel,
  drawModal,
  Entity2D,
  FramesPerSecondCounter,
} from "@ahokinson/rune"

const HUD = Color.fromBytes(150, 200, 230)
const HUD_DIM = Color.fromBytes(80, 92, 108)
const HUD_KEY = Color.fromBytes(120, 230, 170)
const PANEL_BG = Color.fromBytes(6, 8, 12)

// Live snapshot the CityView assembles each frame for the overlay to render.
export interface HudModel {
  loading: boolean
  error: string | null
  date: string
  hash: string
  subject: string
  author: string
  authorColor: Color
  index: number
  total: number
  fileCount: number
  speedLabel: string
  paused: boolean
}

const CONTROLS: readonly ControlEntry[] = [
  { keys: "drag", label: "orbit" },
  { keys: "Space", label: "pause" },
  { keys: "←/→", label: "speed" },
  { keys: "R", label: "restart" },
  { keys: "L", label: "shadows" },
  { keys: "F", label: "reframe" },
]

// Screen-space overlay for the git visualizer: a status panel (top-left) with the
// current replay date, commit, and author; and a control legend (bottom). Reads a
// fresh HudModel each frame through the provider the CityView supplies.
export class Hud extends Entity2D {
  private readonly fps = new FramesPerSecondCounter()
  private lastDrawMilliseconds = performance.now()

  constructor(private readonly model: () => HudModel) {
    super({ zIndex: 1000 })
  }

  override draw(canvas: CanvasSurface, _camera: Camera): void {
    const now = performance.now()
    this.fps.record(now - this.lastDrawMilliseconds)
    this.lastDrawMilliseconds = now

    const model = this.model()
    if (model.error) {
      drawModal(canvas, {
        title: "Not a git repository",
        detail: model.error,
        titleColor: HUD,
        detailColor: HUD_DIM,
        panel: PANEL_BG,
        frame: HUD_DIM,
      })
      return
    }
    if (model.loading) {
      drawModal(canvas, {
        title: "Reading git history…",
        detail: "walking commits",
        titleColor: HUD,
        detailColor: HUD_DIM,
        panel: PANEL_BG,
        frame: HUD_DIM,
      })
      return
    }
    this.drawStatusPanel(canvas, model)
    drawControlLegend(canvas, {
      controls: CONTROLS,
      keyColor: HUD_KEY,
      labelColor: HUD_DIM,
      panel: PANEL_BG,
      frame: HUD_DIM,
    })
  }

  private drawStatusPanel(canvas: CanvasSurface, model: HudModel): void {
    const percent = model.total > 0 ? Math.floor((model.index / model.total) * 100) : 0
    const subject = model.subject.length > 38 ? `${model.subject.slice(0, 37)}…` : model.subject
    const rect = drawLabeledPanel(canvas, {
      title: "git-3d",
      titleColor: HUD,
      lines: [
        `${model.date}  ·  ${this.fps.value.toFixed(0)} fps${model.paused ? "  · paused" : ""}`,
        `${model.hash.slice(0, 7)}  ${subject}`,
        `commit ${model.index}/${model.total} (${percent}%)  ·  ${model.fileCount} files  ·  ${model.speedLabel}`,
        // Reserve a row for the author line drawn (in the contributor's colour) below.
        " ".repeat(model.author.length + 2),
      ],
      lineColor: HUD_DIM,
      panel: PANEL_BG,
      frame: HUD_DIM,
    })
    // Author line in the contributor's own accent colour, over the reserved row.
    canvas.drawText(rect.x + 2, rect.bottom - 2, `◉ ${model.author}`, model.authorColor, PANEL_BG)
  }
}
