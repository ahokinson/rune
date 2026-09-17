import { describe, expect, it } from "bun:test"
import { InMemoryCanvas } from "@/draw/canvas"
import { Color } from "@/draw/color"
import { Entity2D } from "@/scene/entity2d"
import { Scene } from "@/scene/scene"
import { SceneManager } from "@/scene/sceneManager"

class CountingEntity extends Entity2D {
  enters = 0
  exits = 0
  updates = 0
  draws = 0
  override onEnter(): void {
    this.enters++
  }
  override onExit(): void {
    this.exits++
  }
  override update(): void {
    this.updates++
  }
  override draw(canvas: import("@/draw/canvas").Canvas): void {
    this.draws++
    canvas.setCell(0, 0, "x", Color.WHITE, Color.BLACK)
  }
}

describe("Scene", () => {
  it("emits entity:added and calls onEnter", () => {
    const scene = new Scene("test")
    const entity = new CountingEntity()
    let added = 0
    scene.events.on("entity:added", () => added++)
    scene.add(entity)
    expect(entity.scene).toBe(scene)
    expect(entity.enters).toBe(1)
    expect(added).toBe(1)
  })

  it("removes entities and calls onExit", () => {
    const scene = new Scene("test")
    const entity = new CountingEntity()
    scene.add(entity)
    scene.remove(entity)
    expect(entity.scene).toBeNull()
    expect(entity.exits).toBe(1)
  })

  it("sorts entities by zIndex on next read", () => {
    const scene = new Scene("test")
    const a = new CountingEntity()
    a.zIndex = 5
    const b = new CountingEntity()
    b.zIndex = 1
    scene.add(a)
    scene.add(b)
    expect(scene.entities[0]).toBe(b)
    expect(scene.entities[1]).toBe(a)
  })

  it("update calls every enabled entity", () => {
    const scene = new Scene("test")
    const a = new CountingEntity()
    const b = new CountingEntity()
    b.enabled = false
    scene.add(a)
    scene.add(b)
    scene.update(16)
    expect(a.updates).toBe(1)
    expect(b.updates).toBe(0)
  })

  it("draw calls every visible entity", () => {
    const scene = new Scene("test")
    const a = new CountingEntity()
    const b = new CountingEntity()
    b.visible = false
    scene.add(a)
    scene.add(b)
    const canvas = new InMemoryCanvas(4, 4)
    scene.draw(canvas)
    expect(a.draws).toBe(1)
    expect(b.draws).toBe(0)
  })
})

describe("SceneManager", () => {
  it("push and pop maintain the stack", () => {
    const manager = new SceneManager()
    const a = new Scene("a")
    const b = new Scene("b")
    manager.push(a)
    expect(manager.current).toBe(a)
    manager.push(b)
    expect(manager.current).toBe(b)
    manager.pop()
    expect(manager.current).toBe(a)
    manager.pop()
    expect(manager.current).toBeNull()
  })

  it("replace pops the current scene then pushes a new one", () => {
    const manager = new SceneManager()
    const a = new Scene("a")
    const b = new Scene("b")
    let aExits = 0
    a.events.on("exit", () => aExits++)
    manager.push(a)
    manager.replace(b)
    expect(manager.current).toBe(b)
    expect(aExits).toBe(1)
  })

  it("emits enter and exit events at the right time", () => {
    const manager = new SceneManager()
    const scene = new Scene("test")
    let enters = 0
    let exits = 0
    scene.events.on("enter", () => enters++)
    scene.events.on("exit", () => exits++)
    manager.push(scene)
    expect(enters).toBe(1)
    expect(exits).toBe(0)
    manager.pop()
    expect(exits).toBe(1)
  })
})
