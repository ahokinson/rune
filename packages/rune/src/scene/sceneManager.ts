/**
 * Stack-based scene manager: pushes, pops, replaces, and clears 2D {@link Scene}s.
 *
 * @module
 */

import type { Scene } from "./scene"

/**
 * A stack of {@link Scene}s with one active top-of-stack scene.
 *
 * Use it as the engine's central scene switch: `push` to enter a new scene, `pop`
 * to return to the previous one, `replace` to swap.
 */
export class SceneManager {
  private stack: Scene[] = []

  /** The active (top-of-stack) scene, or `null` when the stack is empty. */
  get current(): Scene | null {
    return this.stack[this.stack.length - 1] ?? null
  }

  /** Number of scenes on the stack. */
  get size(): number {
    return this.stack.length
  }

  /**
   * Push a scene onto the stack and fire its {@link Scene.onEnter}.
   *
   * @param scene - Scene to enter.
   * @returns The same `scene`, for chaining.
   */
  push(scene: Scene): Scene {
    this.stack.push(scene)
    scene.onEnter()
    return scene
  }

  /**
   * Pop the active scene off the stack and fire its {@link Scene.onExit}.
   *
   * @returns The removed scene, or `null` if the stack was empty.
   */
  pop(): Scene | null {
    const scene = this.stack.pop() ?? null
    if (scene) scene.onExit()
    return scene
  }

  /**
   * Replace the active scene with `scene`: pop the current one, then push the new.
   *
   * @param scene - Scene to enter.
   * @returns The same `scene`, for chaining.
   */
  replace(scene: Scene): Scene {
    this.pop()
    return this.push(scene)
  }

  /** Pop every scene off the stack, firing {@link Scene.onExit} on each. */
  clear(): void {
    while (this.stack.length > 0) this.pop()
  }

  /**
   * Read-only view of the stack, bottom to top.
   *
   * @returns A readonly array of scenes.
   */
  scenes(): readonly Scene[] {
    return this.stack
  }
}
