import { describe, expect, it } from "bun:test"
import { Emitter, type EmitterUpdate } from "@/fx/emitter"

interface Bullet {
  born: number
  life: number
}

const hooks: EmitterUpdate<Bullet> = {
  expired: (b, tick) => tick - b.born >= b.life,
  initialize: (b, tick) => {
    b.born = tick
    b.life = 3
  },
}

describe("Emitter", () => {
  it("spawns and expires items, tracking total", () => {
    let r = 0
    const emitter = new Emitter<Bullet>({
      create: () => ({ born: 0, life: 0 }),
      capacity: 5,
      spawnChance: 1,
      random: () => r,
    })

    r = 0
    emitter.update(0, hooks) // spawns one (life 3, born 0)
    expect(emitter.size).toBe(1)
    expect(emitter.total).toBe(1)

    r = 1 // 1 >= spawnChance(1) -> no further spawns
    emitter.update(1, hooks)
    emitter.update(2, hooks)
    expect(emitter.size).toBe(1)
    emitter.update(3, hooks) // tick - born (3 - 0) >= life (3) -> expires
    expect(emitter.size).toBe(0)
    expect(emitter.total).toBe(1)
  })

  it("respects spawnChance against the injected RNG", () => {
    let r = 0
    const emitter = new Emitter<Bullet>({
      create: () => ({ born: 0, life: 0 }),
      capacity: 5,
      spawnChance: 0.5,
      random: () => r,
    })
    r = 0.9 // above threshold -> skip
    expect(emitter.update(0, hooks)).toBeNull()
    expect(emitter.total).toBe(0)
    r = 0.1 // below threshold -> spawn
    expect(emitter.update(1, hooks)).not.toBeNull()
    expect(emitter.total).toBe(1)
  })

  it("never exceeds capacity", () => {
    const emitter = new Emitter<Bullet>({
      create: () => ({ born: 0, life: 1000 }),
      capacity: 3,
      spawnChance: 1,
      random: () => 0,
    })
    for (let tick = 0; tick < 10; tick++) emitter.update(tick, hooks)
    expect(emitter.size).toBe(3)
  })

  it("reports spawn rate over the configured window", () => {
    const emitter = new Emitter<Bullet>({
      create: () => ({ born: 0, life: 1000 }),
      capacity: 100,
      spawnChance: 1,
      rateWindow: 5,
      random: () => 0,
    })
    for (let tick = 0; tick <= 4; tick++) emitter.update(tick, hooks)
    expect(emitter.ratePerWindow(4)).toBe(5) // spawns at ticks 0..4 all within window
    expect(emitter.ratePerWindow(20)).toBe(0) // all aged out
  })

  it("ratePerWindow is 0 when rate tracking is disabled", () => {
    const emitter = new Emitter<Bullet>({
      create: () => ({ born: 0, life: 1000 }),
      capacity: 5,
      spawnChance: 1,
      random: () => 0,
    })
    emitter.update(0, hooks)
    expect(emitter.ratePerWindow(0)).toBe(0)
  })
})
