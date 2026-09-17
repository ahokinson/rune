import { Emitter } from "@ahokinson/rune"
import type { RGB } from "./connections"

// Each attack category renders in its own bright hue.
export interface AttackType {
  name: string
  rgb: RGB
}

export const ATTACK_TYPES: AttackType[] = [
  { name: "DDoS", rgb: [255, 45, 45] },
  { name: "Malware", rgb: [255, 140, 0] },
  { name: "Phishing", rgb: [255, 225, 0] },
  { name: "Ransomware", rgb: [255, 0, 110] },
  { name: "Botnet", rgb: [170, 80, 255] },
  { name: "Exploit", rgb: [0, 225, 255] },
  { name: "Trojan", rgb: [40, 255, 130] },
  { name: "Brute Force", rgb: [80, 140, 255] },
]

export interface Attack {
  src: number
  dst: number
  type: number
  born: number
  life: number
}

export interface FeedEvent {
  time: string
  label: string
  type: number
  born: number
}

const MAX_ACTIVE = 26
const SPAWN_CHANCE = 0.22 // per tick (~30 tps) -> a busy feed
const RATE_WINDOW = 30 // ticks counted for the per-second rate (30 tps = 1s)
const MAX_FEED = 7

function randInt(n: number): number {
  return Math.floor(Math.random() * n)
}

// Drives a fake live feed of attacks between cities. The engine's Emitter owns the
// pooled spawn/expire lifecycle and the per-second rate window; this class adds the
// domain bits — which cities/category a spawn picks, the running per-type counts,
// and the recent-events ring buffer the HUD reads.
export class AttackFeed {
  counts: number[]
  recent: FeedEvent[] = []
  // City index + spawn tick of the most recent attack target, for the HUD's
  // targeting reticle. -1 until the first attack lands.
  lastTarget = -1
  lastTargetTick = 0
  private tick = 0
  private emitter = new Emitter<Attack>({
    create: () => ({ src: 0, dst: 0, type: 0, born: 0, life: 0 }),
    capacity: MAX_ACTIVE,
    spawnChance: SPAWN_CHANCE,
    rateWindow: RATE_WINDOW,
  })

  constructor(
    private cityCount: number,
    private cityNames: string[],
  ) {
    this.counts = ATTACK_TYPES.map(() => 0)
  }

  get active(): Attack[] {
    return this.emitter.active
  }

  get total(): number {
    return this.emitter.total
  }

  update(tick: number): void {
    this.tick = tick
    this.emitter.update(tick, {
      expired: (a) => tick - a.born >= a.life,
      initialize: (a) => this.launch(a, tick),
    })
  }

  // Fill a freshly spawned attack and record it in the HUD stats.
  private launch(a: Attack, tick: number): void {
    const src = randInt(this.cityCount)
    let dst = randInt(this.cityCount)
    if (dst === src) dst = (dst + 1) % this.cityCount

    const type = randInt(ATTACK_TYPES.length)
    // How long the arc lives = how long its single pulse takes to cross. Since
    // this is independent of arc length, longer-distance attacks read as faster.
    const life = 70 + randInt(140)

    a.src = src
    a.dst = dst
    a.type = type
    a.born = tick
    a.life = life
    this.counts[type]!++
    this.lastTarget = dst
    this.lastTargetTick = tick

    this.recent.unshift({
      time: new Date().toISOString().substring(11, 19),
      label: `${this.cityNames[src]}→${this.cityNames[dst]}`,
      type,
      born: tick,
    })
    if (this.recent.length > MAX_FEED) this.recent.pop()
  }

  // Attacks launched in the last second.
  ratePerSec(): number {
    return this.emitter.ratePerWindow(this.tick)
  }
}
