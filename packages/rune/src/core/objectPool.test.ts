import { describe, expect, it } from "bun:test"
import { ObjectPool } from "@/core/objectPool"

describe("ObjectPool", () => {
  it("creates on first acquire when no preallocation", () => {
    let created = 0
    const pool = new ObjectPool<{ value: number }>({
      create: () => {
        created++
        return { value: 0 }
      },
    })
    pool.acquire()
    expect(created).toBe(1)
  })

  it("preallocates initialSize items", () => {
    let created = 0
    const pool = new ObjectPool<number>({
      create: () => ++created,
      initialSize: 5,
    })
    expect(created).toBe(5)
    expect(pool.freeCount).toBe(5)
  })

  it("reuses released items before allocating new ones", () => {
    let created = 0
    const pool = new ObjectPool<{ id: number }>({
      create: () => ({ id: ++created }),
    })
    const first = pool.acquire()
    pool.release(first)
    const second = pool.acquire()
    expect(second).toBe(first)
    expect(created).toBe(1)
  })

  it("reset is called when releasing", () => {
    const pool = new ObjectPool<{ value: number }>({
      create: () => ({ value: 0 }),
      reset: (item) => {
        item.value = 0
      },
    })
    const item = pool.acquire()
    item.value = 42
    pool.release(item)
    const reused = pool.acquire()
    expect(reused.value).toBe(0)
  })

  it("throws when maximumSize reached", () => {
    const pool = new ObjectPool<number>({
      create: () => 0,
      maximumSize: 2,
    })
    pool.acquire()
    pool.acquire()
    expect(() => pool.acquire()).toThrow()
  })

  it("inUseCount tracks acquired-not-released items", () => {
    const pool = new ObjectPool<number>({ create: () => 0 })
    pool.acquire()
    pool.acquire()
    expect(pool.inUseCount).toBe(2)
    const item = pool.acquire()
    pool.release(item)
    expect(pool.inUseCount).toBe(2)
  })
})
