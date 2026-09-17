import {
  type Camera,
  type CanvasSurface,
  Color,
  clamp,
  drawBar,
  drawGauge,
  drawScanlines,
  drawSectionHeader,
  drawSparkline,
  drawTicker,
  Entity2D,
  FilterCanvas,
  GlitchEffect,
  type MouseSnapshot,
  OrbitControl,
  Particles3D,
  Scene3D,
  SurfaceMesh3D,
  type Viewport3D,
} from "@ahokinson/rune"
import { ATTACK_TYPES, AttackFeed } from "./attacks"
import {
  type ArcSpec,
  CITIES,
  CITY_VECTORS,
  createCityPoints,
  createTrailStyle,
  drawAttackEndpoints,
  drawTargetReticle,
  sampleArc,
} from "./connections"
import { ASPECT_Y, camera3D, GLOBE_TILT_PITCH, sphereProjection, sphereProjector } from "./projection"
import { createGlobeSurfaceSampler, drawAtmosphere, drawBorderBox, type GlobeSurfaceSampler } from "./render"

// The comet trail particle system shared by every live attack. As each attack's
// head sweeps its arc it emits trail particles here; each fades over TRAIL_LIFE_MS
// so when the head reaches the target the tail keeps fading and drains in (instead
// of the whole comet vanishing the frame the attack expires). TRAIL_EMIT_STEPS
// particles are dropped between the previous and current tick's head so the streak
// stays continuous regardless of arc speed; the cap bounds many simultaneous arcs.
const TRAIL_LIFE_MS = 750
const TRAIL_EMIT_STEPS = 2
const MAX_TRAIL_PARTICLES = 2048

// One Color per attack category, precomputed so emitting a trail particle never
// allocates. Indexed by attack type, matching ATTACK_TYPES.
const ATTACK_COLORS = ATTACK_TYPES.map((t) => Color.fromBytes(t.rgb[0], t.rgb[1], t.rgb[2]))

import { drawBigText, scrambleReveal } from "../../shared/overlay"
import { BG, BLACK, FRAME, GAUGE_TRACK, HEADER, LABEL_DIM, LIVE_ON, SPARK, VALUE } from "./theme"

function fmt(n: number): string {
  return n.toLocaleString("en-US")
}

// Auto-spin rate (radians per second); the globe turns about its polar axis.
// 0.24 ≈ the prior 0.008 rad/tick at 30 tps.
const SPIN_PER_SECOND = 0.24
// After the user releases a drag, hold still this many ticks (~0.6s at 30 tps)
// before the auto-spin picks back up.
const RESUME_DELAY_TICKS = 18
// Subtle tilt limit: the total pitch (base tilt + the user's drag) is clamped to
// this range so the globe nods but never tips toward a pole.
const PITCH_LIMIT = (30 * Math.PI) / 180
// Per-tick smoothing factor used to glide the user's tilt back to the default
// once the spin resumes; ~0.12 reads as a gentle ease-out over roughly a second.
const TILT_RESUME_EASE = 0.12

// Width of the rate sparkline in cells / seconds of history it retains.
const RATE_SAMPLES = 16
// Ticks a new feed entry spends "decrypting" from scrambled glyphs to text.
const DECODE_FRAMES = 9
// Left HUD rail: right-edge column, and how many live-feed rows it shows.
const RAIL_W = 34
const FEED_ROWS = 6

// Canned intel headlines for the bottom ticker, joined into one looping marquee.
const INTEL_MESSAGES = [
  "ANOMALOUS TRAFFIC SPIKE DETECTED · SECTOR 7",
  "BOTNET C2 BEACON IDENTIFIED · AS13335",
  "ZERO-DAY SIGNATURE PROPAGATING ACROSS EDGE",
  "CREDENTIAL-STUFFING WAVE · ATTEMPTS +312%",
  "DNS TUNNELING FLAGGED · 14 NODES ISOLATED",
  "FIRMWARE IMPLANT QUARANTINED · 3 HOSTS",
  "TLS DOWNGRADE ATTEMPT BLOCKED AT GATEWAY",
  "EXFIL CHANNEL SEVERED · 1.2TB WITHHELD",
]
const INTEL_TEXT = `   ◆   ${INTEL_MESSAGES.join("   ◆   ")}   ◆`
// Real-time (not tick-based) animation rates for the HUD. Wall-clock driven so
// motion stays smooth at the render frame rate regardless of the 30Hz sim tick.
const TICKER_MS_PER_CELL = 85 // marquee advances one cell every 85ms (~12 cells/s)
// Per-second attack rate treated as "full scale": the threat gauge tops out and
// the rate sparkline saturates here, so the two readouts stay in agreement.
const RATE_THREAT_MAX = 12

// Threat-level bands (highest first) keyed off the live rate. RGB tuples (not
// Color) so the big level banner can derive a dimmed bevel from the same hue.
const THREAT_LEVELS: { min: number; word: string; rgb: [number, number, number] }[] = [
  { min: 9, word: "CRITICAL", rgb: [255, 40, 40] },
  { min: 6, word: "SEVERE", rgb: [255, 140, 0] },
  { min: 3, word: "ELEVATED", rgb: [255, 225, 0] },
  { min: 0, word: "GUARDED", rgb: [80, 220, 120] },
]

export interface GlobeEntityOptions {
  centerX: number
  centerY: number
  radius: number
  mouse: MouseSnapshot
}

export class GlobeEntity extends Entity2D {
  private frameCount = 0
  private feed = new AttackFeed(
    CITIES.length,
    CITIES.map((c) => c.name),
  )
  // Persistent scratch buffer for projecting the live feed into draw specs each
  // frame; reused (objects mutated in place) so draw() doesn't allocate.
  private arcs: ArcSpec[] = []
  // Rolling per-second attack-rate samples (oldest first) feeding the HUD's rate
  // sparkline; one sample pushed per second in update(), capped at RATE_SAMPLES.
  private rateHistory: number[] = []
  // Wall-clock origin for presentational animations. draw() runs per render frame
  // (faster, variable) while update()/frameCount runs on the fixed 30Hz tick — so
  // continuous HUD motion (ticker, shimmer, blink) is driven off real elapsed ms,
  // not the tick counter, to stay smooth and tick-jitter-free.
  private readonly startMs = performance.now()
  // Shorter idle gap than the default [100,400) so glitches fire often (~0.8–3s
  // at 30 tps) for a busier, more unstable CRT feel.
  private glitch = new GlitchEffect({ width: 80, height: 40, cooldownTicks: [25, 90] })

  // The engine 3D world: it projects/culls/depth-orders/draws the globe surface,
  // city markers, and attack arcs from the shared Camera3D each frame. Built once
  // in the constructor; fed fresh spin/sweep/arc state before each draw.
  //
  // This owns its Scene3D directly rather than using the WorldView3D bridge (the
  // teapot example's approach). WorldView3D fits when the 3D scene is one layer
  // composited with sibling 2D entities by zIndex; here the globe draw must be
  // sandwiched between custom 2D background (border/scanlines/atmosphere) and
  // foreground (arcs/reticle/HUD) passes that all share one glitch FilterCanvas,
  // which a self-contained entity expresses far more cleanly.
  private readonly viewport: Viewport3D
  private readonly world: Scene3D
  private readonly surfaceSampler: GlobeSurfaceSampler
  // Single shared comet trail: a moving emitter whose origin the update loop sweeps
  // along each active attack's arc, dropping fading particles. Registered with the
  // world so it projects/culls/depth-occludes against the globe like the surface.
  private readonly trail: Particles3D

  // Click-and-drag turntable driving the globe's spin (yaw) and tilt (pitch).
  // Built in the constructor because its drag sensitivity scales with the radius.
  private readonly orbit: OrbitControl

  private readonly centerX: number
  private readonly centerY: number
  private readonly radius: number
  private readonly mouse: MouseSnapshot

  constructor(options: GlobeEntityOptions) {
    super({ zIndex: 0 })
    this.centerX = options.centerX
    this.centerY = options.centerY
    this.radius = options.radius
    this.mouse = options.mouse
    const radius = this.radius

    this.orbit = new OrbitControl({
      // Sensitivity scales with the rendered radius so a given drag turns the
      // globe by the same arc at any size. Negative yaw so the surface follows
      // the cursor (drag right → spins east); pitch tilts the poles toward you.
      yawSensitivity: -Math.PI / radius,
      pitchSensitivity: Math.PI / 2 / radius,
      restPitch: GLOBE_TILT_PITCH,
      minPitch: -PITCH_LIMIT,
      maxPitch: PITCH_LIMIT,
      spinPerSecond: SPIN_PER_SECOND,
      resumeDelayTicks: RESUME_DELAY_TICKS,
      tiltResumeEase: TILT_RESUME_EASE,
      canStartDrag: (x, y) => this.isOnGlobe(x, y),
    })

    // Wire the 3D world: surface (writes depth) below the city points below the
    // attack arcs, so the engine occludes near-side geometry against the globe.
    this.viewport = { centerX: this.centerX, centerY: this.centerY, radius, aspectY: ASPECT_Y }
    this.surfaceSampler = createGlobeSurfaceSampler()
    this.world = new Scene3D({ camera: camera3D, occlude: true })
    this.world.add(new SurfaceMesh3D(sphereProjector, this.surfaceSampler, { zIndex: 0 }))
    const cities = createCityPoints()
    cities.zIndex = 1
    this.world.add(cities)
    // zIndex 2: drawn after the surface (0) and city markers (1) so it depth-tests
    // against the globe and hides behind the far side.
    this.trail = new Particles3D({
      style: createTrailStyle(),
      lifetimeMilliseconds: TRAIL_LIFE_MS,
      maximumParticles: MAX_TRAIL_PARTICLES,
      minDepth: 0.1,
      zIndex: 2,
    })
    this.world.add(this.trail)
  }

  // Is the screen cell (x, y) on the globe disc? Mirrors the disc test in
  // SphereProjection.screenToSurfaceInto so grabbing matches the rendered globe.
  private isOnGlobe(x: number, y: number): boolean {
    const nx = (x - this.centerX) / this.radius
    const ny = (y - this.centerY) / this.radius / ASPECT_Y
    return nx * nx + ny * ny <= 1.0
  }

  override draw(canvas: CanvasSurface, _camera: Camera): void {
    const w = canvas.width
    const h = canvas.height

    this.glitch.resize(w, h)
    const gc = new FilterCanvas(canvas, [this.glitch])

    gc.clear(BG)

    drawBorderBox(gc, w, h)

    // CRT scanlines in the background: skip the border columns (drawn above) and
    // the globe's disc so the lines don't band the continents.
    drawScanlines(gc, {
      color: Color.fromBytes(6, 16, 30),
      skip: (x, y) => {
        if (x < 1 || x >= w - 1) return true
        const nx = (x - this.centerX) / this.radius
        const ny = (y - this.centerY) / (this.radius * ASPECT_Y)
        return nx * nx + ny * ny <= 1
      },
    })
    drawAtmosphere(gc, this.centerX, this.centerY, this.radius, this.frameCount)

    // Feed this frame's spin + sweep into the shared projection/sampler, then let
    // the engine draw all the 3D geometry (surface, cities, arcs) through the
    // glitch canvas so the post effects still apply.
    sphereProjector.rotation = this.orbit.yaw
    this.surfaceSampler.beginFrame(this.frameCount, this.viewport)

    const active = this.feed.active
    const arcs = this.arcs
    for (let i = 0; i < active.length; i++) {
      const a = active[i]!
      let arc = arcs[i]
      if (!arc) {
        arc = { src: 0, dst: 0, rgb: ATTACK_TYPES[0]!.rgb, born: 0, life: 0 }
        arcs[i] = arc
      }
      arc.src = a.src
      arc.dst = a.dst
      arc.rgb = ATTACK_TYPES[a.type]!.rgb
      arc.born = a.born
      arc.life = a.life
    }
    arcs.length = active.length

    // The trail particles are emitted in update() and ride the world; the world
    // draw projects/occludes them against the globe along with the surface.
    this.world.draw(gc, this.viewport)
    drawAttackEndpoints(gc, this.viewport, arcs, this.frameCount)

    // Targeting reticle locking onto the latest attack's destination city.
    const tgt = this.feed.lastTarget
    if (tgt >= 0) {
      const age = this.frameCount - this.feed.lastTargetTick
      const c = CITIES[tgt]!
      const ns = c.lat >= 0 ? "N" : "S"
      const ew = c.lon >= 0 ? "E" : "W"
      const label =
        age < 8 ? "◌ ACQUIRING" : `◉ ${c.name} ${Math.abs(c.lat).toFixed(0)}°${ns} ${Math.abs(c.lon).toFixed(0)}°${ew}`
      drawTargetReticle(gc, this.viewport, tgt, age, label)
    }

    this.drawHud(gc, w, h, performance.now() - this.startMs)

    gc.postPass(this.frameCount)
  }

  private drawHud(canvas: CanvasSurface, w: number, h: number, nowMs: number): void {
    const time = new Date().toISOString().substring(11, 19)
    const rate = this.feed.ratePerSec()
    const live = Math.floor(nowMs / 500) % 2 === 0

    // ── Left rail ───────────────────────────────────────────────────────────
    // One column holding every readout, so the center/right stays clear for the
    // globe. Top group flows down from the header; the live feed is anchored to
    // the bottom of the rail, just above the status bar.
    const railR = Math.min(RAIL_W, w - 2)

    canvas.drawText(2, 1, live ? "● LIVE" : "○ LIVE", live ? LIVE_ON : LABEL_DIM, BLACK)
    canvas.drawText(9, 1, `${time} UTC`, LABEL_DIM, BLACK)

    // Headline total + supporting live/rate line and a rate sparkline.
    drawSectionHeader(canvas, 2, 3, railR, "TOTAL INTRUSIONS", FRAME, HEADER)
    drawBigText(canvas, 2, 4, fmt(this.feed.total), "tiny", VALUE, FRAME)
    canvas.drawText(2, 6, `${this.feed.active.length} ACTIVE · ${rate}/s`, VALUE, BLACK)
    drawSparkline(canvas, railR - RATE_SAMPLES + 1, 6, this.rateHistory, RATE_THREAT_MAX, SPARK)

    // Attack vectors as a live bar chart, scaled to the busiest category.
    drawSectionHeader(canvas, 2, 8, railR, "ATTACK VECTORS", FRAME, HEADER)
    const maxCount = Math.max(1, ...this.feed.counts)
    for (let i = 0; i < ATTACK_TYPES.length; i++) {
      const ty = ATTACK_TYPES[i]!
      const col = Color.fromBytes(ty.rgb[0], ty.rgb[1], ty.rgb[2])
      const y = 9 + i
      canvas.drawText(2, y, ty.name.padEnd(11), col, BLACK)
      drawBar(canvas, 14, y, 8, this.feed.counts[i]! / maxCount, col, GAUGE_TRACK)
      canvas.drawText(railR - 6, y, fmt(this.feed.counts[i]!).padStart(6), VALUE, BLACK)
    }

    // Live event feed, anchored to the bottom of the rail. Newest first, fading
    // with age; each new line "decrypts" from scrambled glyphs.
    const feedShown = Math.min(this.feed.recent.length, FEED_ROWS)
    if (feedShown > 0) {
      const feedHeaderY = h - 3 - feedShown
      drawSectionHeader(canvas, 2, feedHeaderY, railR, "LIVE FEED", FRAME, HEADER)
      for (let k = 0; k < feedShown; k++) {
        const ev = this.feed.recent[k]!
        const ty = ATTACK_TYPES[ev.type]!
        const fade = 1 - k * 0.1
        const col = Color.fromBytes(ty.rgb[0] * fade, ty.rgb[1] * fade, ty.rgb[2] * fade)
        const line = `${ev.time}  ${ev.label.padEnd(9)} ${ty.name}`
        const progress = clamp((this.frameCount - ev.born) / DECODE_FRAMES, 0, 1)
        canvas.drawText(2, feedHeaderY + 1 + k, scrambleReveal(line, progress, this.frameCount), col, BLACK)
      }
    }

    // ── Bottom status bar (row h-2) ─────────────────────────────────────────
    // Left: orientation + hint. Right: color-coded threat level + gauge, with a
    // white-hot strobe at CRITICAL.
    const spin = `SPIN ${(((this.orbit.yaw * 180) / Math.PI) % 360).toFixed(0)}°`
    canvas.drawText(2, h - 2, spin, this.orbit.dragging ? VALUE : LABEL_DIM, BLACK)
    canvas.drawText(2 + spin.length + 2, h - 2, this.orbit.dragging ? "DRAGGING" : "drag to rotate", LABEL_DIM, BLACK)

    const lv = THREAT_LEVELS.find((l) => rate >= l.min)!
    const critPulse = lv.min >= 9 && Math.floor(nowMs / 130) % 2 === 0
    const levelCol = critPulse ? Color.fromBytes(255, 200, 200) : Color.fromBytes(lv.rgb[0], lv.rgb[1], lv.rgb[2])
    const GAUGE_CELLS = 14
    const segW = 7 + (GAUGE_CELLS + 2) + 1 + lv.word.length
    const sx = w - segW - 2
    canvas.drawText(sx, h - 2, "THREAT ", LABEL_DIM, BLACK)
    const gEnd = drawGauge(canvas, sx + 7, h - 2, GAUGE_CELLS, rate / RATE_THREAT_MAX, levelCol, GAUGE_TRACK)
    canvas.drawText(gEnd + 1, h - 2, lv.word, levelCol, BLACK)

    // ── Intel ticker (bottom frame, row h-1) ────────────────────────────────
    const tag = "⚠ INTEL "
    const tw = Math.min(INTEL_TEXT.length, w - 52)
    if (tw > 12) {
      const tStart = Math.floor((w - tw - tag.length) / 2)
      canvas.setCell(tStart - 2, h - 1, "┤", FRAME, BLACK)
      canvas.drawText(tStart, h - 1, tag, LIVE_ON, BLACK)
      drawTicker(canvas, tStart + tag.length, h - 1, tw, INTEL_TEXT, Math.floor(nowMs / TICKER_MS_PER_CELL), LABEL_DIM)
      canvas.setCell(tStart + tag.length + tw + 1, h - 1, "├", FRAME, BLACK)
    }
  }

  override update(deltaMilliseconds: number): void {
    // Drag grabs only on the globe disc (via the orbit's canStartDrag gate);
    // presses on the HUD or empty space are ignored and the spin keeps going.
    this.orbit.update(this.mouse, deltaMilliseconds)

    // Apply the spin + tilt to the shared projection so land, cities, and arcs
    // all turn and tilt together with the globe.
    sphereProjection.tiltPitch = this.orbit.pitch

    this.frameCount++
    this.feed.update(this.frameCount)

    // Sweep each active attack's comet head along its arc this tick and drop trail
    // particles between last tick's head and this tick's, so the streak stays
    // continuous however fast the head moves. Heads are derived analytically from
    // the attack's age, so no per-attack emit state is needed. Once a head reaches
    // the target (headPrev >= 1) emission stops and its particles fade out, the tail
    // completing the arc instead of popping when the attack expires.
    for (const a of this.feed.active) {
      const headNow = Math.min(1, (this.frameCount - a.born) / a.life)
      const headPrev = Math.max(0, Math.min(1, (this.frameCount - 1 - a.born) / a.life))
      if (headPrev >= 1) continue
      const src = CITY_VECTORS[a.src]!
      const dst = CITY_VECTORS[a.dst]!
      this.trail.color = ATTACK_COLORS[a.type]!
      for (let k = 1; k <= TRAIL_EMIT_STEPS; k++) {
        const t = headPrev + (headNow - headPrev) * (k / TRAIL_EMIT_STEPS)
        this.trail.altitude = sampleArc(this.trail.origin, src, dst, t)
        this.trail.emit(1)
      }
    }
    // Tick the 3D scene so the trail integrates (surface and cities are static).
    this.world.update(deltaMilliseconds)

    // Sample the live rate once per second (~30 tps) into the sparkline history.
    if (this.frameCount % 30 === 0) {
      this.rateHistory.push(this.feed.ratePerSec())
      if (this.rateHistory.length > RATE_SAMPLES) this.rateHistory.shift()
    }
    this.glitch.update(this.frameCount)
  }
}
