import { describe, expect, it } from "bun:test"
import { PooledSet } from "@/core/pooledSet"

interface Item {
  value: number
}

describe("PooledSet", () => {
  it("spawn adds active items up to capacity, then returns null", () => {
    const set = new PooledSet<Item>({ create: () => ({ value: 0 }), capacity: 2 })
    expect(set.spawn()).not.toBeNull()
    expect(set.spawn()).not.toBeNull()
    expect(set.isFull).toBe(true)
    expect(set.spawn()).toBeNull()
    expect(set.size).toBe(2)
  })

  it("expire releases matching items via swap-pop and keeps the rest", () => {
    const set = new PooledSet<Item>({ create: () => ({ value: 0 }), capacity: 4 })
    for (let i = 0; i < 4; i++) set.spawn()!.value = i
    set.expire((item) => item.value % 2 === 0)
    expect(set.size).toBe(2)
    expect(set.active.map((i) => i.value).sort()).toEqual([1, 3])
  })

  it("recycles released items instead of allocating new ones", () => {
    let created = 0
    const set = new PooledSet<Item>({
      create: () => {
        created++
        return { value: 0 }
      },
      capacity: 2,
    })
    set.spawn()
    set.spawn()
    set.expire(() => true)
    set.spawn()
    set.spawn()
    expect(created).toBe(2)
  })

  it("clear releases every active item", () => {
    const set = new PooledSet<Item>({ create: () => ({ value: 0 }), capacity: 3 })
    set.spawn()
    set.spawn()
    set.clear()
    expect(set.size).toBe(0)
  })
})
