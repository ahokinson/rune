/**
 * Solid context objects exposing the running {@link ApplicationHandle} and the
 * current {@link Scene} / {@link Canvas} to descendant components, plus the
 * `use*` accessor hooks that pull them out of the tree and throw with a helpful
 * message when used outside their provider.
 *
 * @module
 */

import { type Accessor, createContext, useContext } from "solid-js"
import type { AudioContext } from "./audio/context"
import type { EventEmitter } from "./core/events"
import type { Scheduler } from "./core/scheduler"
import type { Canvas } from "./draw/canvas"
import type { GamepadState } from "./input/gamepad"
import type { KeyboardState } from "./input/keyboard"
import type { MouseState } from "./input/mouse"
import type { Random } from "./math/random"
import type { Scene } from "./scene/scene"
import type { SceneManager } from "./scene/sceneManager"
import type { TweenManager } from "./tween/tween"

/** Event payload map emitted by {@link ApplicationHandle.events}. */
export type ApplicationEventMap = {
  tick: { tick: number; deltaMilliseconds: number }
  "scene:enter": { scene: Scene }
  "scene:exit": { scene: Scene }
  resize: { width: number; height: number }
} & Record<string, unknown>

/** Callback invoked once per fixed-update tick. */
export type FixedUpdateCallback = (deltaMilliseconds: number, tick: number) => void

/** Callback invoked once per rendered frame. */
export type UpdateCallback = (deltaMilliseconds: number) => void

/**
 * Handle exposed to an {@link Application}'s subtree via {@link ApplicationContext}.
 * Components and hooks read input, the scene stack, scheduler, tweens, audio and
 * loop signals through this object instead of reaching for globals.
 */
export interface ApplicationHandle {
  /** Current fixed-update tick, incremented once per simulated step. */
  readonly tick: Accessor<number>
  /** Configured fixed-update rate in Hz. */
  readonly ticksPerSecond: Accessor<number>
  /** Measured render-frame rate in Hz, updated every frame. */
  readonly framesPerSecond: Accessor<number>
  /** Whether the simulation is paused (no fixed updates run). */
  readonly paused: Accessor<boolean>
  /** Shared deterministic random source for the run. */
  readonly random: Random
  /** Scene stack; the top scene is updated and drawn each frame. */
  readonly scenes: SceneManager
  /** Application-level event bus. */
  readonly events: EventEmitter<ApplicationEventMap>
  /** Keyboard state shared across the app. */
  readonly keyboard: KeyboardState
  /** Mouse state shared across the app. */
  readonly mouse: MouseState
  /** Gamepad state shared across the app, fed by a host input source. */
  readonly gamepad: GamepadState
  /** One-shot and repeating timers tied to the app lifecycle. */
  readonly scheduler: Scheduler
  /** Tween manager advanced each frame. */
  readonly tweens: TweenManager
  /** Audio context (real or null) for the run. */
  readonly audio: AudioContext
  /**
   * How far the render frame is between the most recent fixed-update tick
   * (0) and the next one (1). Read this during draw to interpolate
   * between snapshotted and current positions for smooth motion at frame
   * rates higher than the fixed-tick rate.
   */
  renderAlpha(): number
  /**
   * Register a callback fired once per fixed-update tick.
   *
   * @param callback - Invoked with `(deltaMilliseconds, tick)`.
   * @returns Unsubscribe function (also runs on Solid cleanup).
   */
  registerFixedUpdate(callback: FixedUpdateCallback): () => void
  /**
   * Register a callback fired once per rendered frame.
   *
   * @param callback - Invoked with `(deltaMilliseconds)`.
   * @returns Unsubscribe function (also runs on Solid cleanup).
   */
  registerUpdate(callback: UpdateCallback): () => void
  /** Stop running fixed updates; frame updates continue. */
  pause(): void
  /** Resume fixed updates after {@link pause}. */
  resume(): void
  /** Tear down the application and (in standalone runs) exit the process. */
  quit(): void
}

/** Solid context holding the current {@link ApplicationHandle} (or `null`). */
export const ApplicationContext = createContext<ApplicationHandle | null>(null)

/**
 * Read the {@link ApplicationHandle} for the surrounding `<Application>`.
 *
 * @returns The active handle.
 * @throws if called outside an `<Application>`.
 */
export function useApplicationContext(): ApplicationHandle {
  const value = useContext(ApplicationContext)
  if (!value) {
    throw new Error("rune: useApplication() must be used inside an <Application> component.")
  }
  return value
}

/** Solid context holding the current {@link Scene} (or `null`). */
export const SceneContext = createContext<Scene | null>(null)

/**
 * Read the {@link Scene} provided by the nearest `<Scene>`.
 *
 * @returns The active scene.
 * @throws if called outside a `<Scene>`.
 */
export function useSceneContext(): Scene {
  const value = useContext(SceneContext)
  if (!value) {
    throw new Error("rune: useScene() must be used inside a <Scene> component.")
  }
  return value
}

/** Solid context holding the canvas accessor from the nearest `<Canvas>` (or `null`). */
export const CanvasContext = createContext<Accessor<Canvas | null> | null>(null)

/**
 * Read the canvas accessor from the nearest `<Canvas>`.
 *
 * @returns Accessor yielding the {@link Canvas} (or `null` before mount / after cleanup).
 * @throws if called outside a `<Canvas>`.
 */
export function useCanvasContext(): Accessor<Canvas | null> {
  const value = useContext(CanvasContext)
  if (!value) {
    throw new Error("rune: useCanvas() must be used inside a <Canvas> component.")
  }
  return value
}
