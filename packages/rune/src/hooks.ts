/**
 * Solid `use*` hooks binding game subsystems to a component's lifetime:
 * accessors for the application, scene, canvas, camera and terminal; lifecycle
 * helpers (`useFixedUpdate`, `useUpdate`, `useTimer`, `useTween`, `useEvents`)
 * that auto-clean-up on unmount; and input shortcuts (`useInput`, `useMouse`,
 * `useAudio`, `useActions`).
 *
 * @module
 */

import { useTerminalDimensions } from "@opentui/solid"
import { type Accessor, onCleanup, onMount, useContext } from "solid-js"
import type { AudioContext } from "./audio/context"
import {
  ApplicationContext,
  type ApplicationEventMap,
  type ApplicationHandle,
  CanvasContext,
  type FixedUpdateCallback,
  SceneContext,
  type UpdateCallback,
  useApplicationContext,
  useCanvasContext,
  useSceneContext,
} from "./context"
import type { EventEmitter, EventListener } from "./core/events"
import type { TimerId } from "./core/scheduler"
import type { Camera } from "./draw/camera"
import type { Canvas } from "./draw/canvas"
import { type ActionBindings, type ActionSnapshot, createActionMap } from "./input/actions"
import type { GamepadSnapshot } from "./input/gamepad"
import type { KeyboardSnapshot } from "./input/keyboard"
import type { MouseSnapshot } from "./input/mouse"
import type { Entity2D } from "./scene/entity2d"
import { Tween, type TweenOptions } from "./tween/tween"

/**
 * Read the {@link ApplicationHandle} for the surrounding `<Application>`.
 *
 * @returns The active handle.
 */
export function useApplication(): ApplicationHandle {
  return useApplicationContext()
}

/**
 * Read the {@link Scene} provided by the nearest `<Scene>`.
 *
 * @returns The active scene.
 */
export function useScene() {
  return useSceneContext()
}

/**
 * Add entities to the nearest `<Scene>` on mount and remove them on cleanup, so
 * a component owns its scene contents without hand-rolling `onMount`/`onCleanup`
 * around `scene.add`/`scene.remove`. The `factory` runs immediately (during
 * component setup) so callers may capture the returned entities; the actual
 * `addAll` is deferred to mount.
 *
 * @param factory - Builds the entities to manage; run once at setup.
 * @returns The created entities, in iteration order.
 */
export function useSceneEntities(factory: () => Iterable<Entity2D>): Entity2D[] {
  const scene = useSceneContext()
  const entities = [...factory()]
  onMount(() => scene.addAll(entities))
  onCleanup(() => {
    for (const entity of entities) scene.remove(entity)
  })
  return entities
}

/**
 * Single-entity convenience over {@link useSceneEntities}: add one entity to the
 * nearest `<Scene>` on mount, remove it on cleanup, and return it.
 *
 * @param factory - Builds the entity to manage; run once at setup.
 * @returns The created entity.
 */
export function useEntity<T extends Entity2D>(factory: () => T): T {
  const scene = useSceneContext()
  const entity = factory()
  onMount(() => scene.add(entity))
  onCleanup(() => scene.remove(entity))
  return entity
}

/**
 * Read the canvas accessor from the nearest `<Canvas>`.
 *
 * @returns Accessor yielding the {@link Canvas} (or `null` before mount / after cleanup).
 */
export function useCanvas(): Accessor<Canvas | null> {
  return useCanvasContext()
}

/**
 * Read the camera of the nearest `<Scene>`.
 *
 * @returns The scene's camera, or `null` when called outside a `<Scene>`.
 */
export function useCamera(): Camera | null {
  const scene = useContext(SceneContext)
  return scene ? scene.camera : null
}

/**
 * Read the terminal dimensions as a reactive accessor.
 *
 * @returns Accessor yielding `{ width, height }` in cells.
 */
export function useTerminal(): Accessor<{ width: number; height: number }> {
  return useTerminalDimensions() as Accessor<{ width: number; height: number }>
}

/**
 * Register a callback fired once per fixed-update tick. The registration is
 * automatically removed when the calling component unmounts.
 *
 * @param callback - Invoked with `(deltaMilliseconds, tick)` each fixed step.
 */
export function useFixedUpdate(callback: FixedUpdateCallback): void {
  const application = useApplicationContext()
  const unregister = application.registerFixedUpdate(callback)
  onCleanup(unregister)
}

/**
 * Register a callback fired once per rendered frame. The registration is
 * automatically removed when the calling component unmounts.
 *
 * @param callback - Invoked with `(deltaMilliseconds)` each frame.
 */
export function useUpdate(callback: UpdateCallback): void {
  const application = useApplicationContext()
  const unregister = application.registerUpdate(callback)
  onCleanup(unregister)
}

/**
 * Read the application's keyboard state.
 *
 * @returns The shared {@link KeyboardSnapshot}.
 */
export function useInput(): KeyboardSnapshot {
  const application = useApplicationContext()
  return application.keyboard
}

/**
 * Read the application's audio context.
 *
 * @returns The shared {@link AudioContext}.
 */
export function useAudio(): AudioContext {
  return useApplicationContext().audio
}

/**
 * Read the application's mouse state.
 *
 * @returns The shared {@link MouseSnapshot}.
 */
export function useMouse(): MouseSnapshot {
  const application = useApplicationContext()
  return application.mouse
}

/**
 * Read the application's gamepad state.
 *
 * @returns The shared {@link GamepadSnapshot}.
 */
export function useGamepad(): GamepadSnapshot {
  const application = useApplicationContext()
  return application.gamepad
}

/**
 * Build an action snapshot from a bindings map, wired to the application's
 * keyboard, mouse, and gamepad state (so `"mouse:"`/`"gamepad:"` bindings work
 * out of the box).
 *
 * @typeParam TAction - Union of action names.
 * @param bindings - Per-action keyboard/mouse/gamepad bindings.
 * @returns A snapshot to read resolved action state each frame.
 */
export function useActions<TAction extends string>(bindings: ActionBindings<TAction>): ActionSnapshot<TAction> {
  const application = useApplicationContext()
  return createActionMap(bindings, application.keyboard, application.mouse, application.gamepad)
}

/**
 * Timer handle returned by {@link useTimer} whose pending timers are cleared
 * automatically when the owning component unmounts.
 */
export interface ScopedTimer {
  /**
   * Schedule `callback` after `milliseconds` ms. The timer is tracked for
   * automatic cleanup on unmount.
   *
   * @param milliseconds - Delay in milliseconds.
   * @param callback - Fired once after the delay.
   * @returns A {@link TimerId} that can be passed to {@link ScopedTimer.clear}.
   */
  after(milliseconds: number, callback: () => void): TimerId
  /**
   * Schedule `callback` every `milliseconds` ms. The timer is tracked for
   * automatic cleanup on unmount.
   *
   * @param milliseconds - Interval in milliseconds.
   * @param callback - Fired on each interval.
   * @returns A {@link TimerId} that can be passed to {@link ScopedTimer.clear}.
   */
  every(milliseconds: number, callback: () => void): TimerId
  /**
   * Cancel a timer previously scheduled via {@link ScopedTimer.after} or
   * {@link ScopedTimer.every}.
   *
   * @param id - The timer id to cancel.
   */
  clear(id: TimerId): void
}

/**
 * Returns a {@link ScopedTimer} whose `after`/`every` timers are tracked and
 * cancelled automatically when the calling component unmounts.
 *
 * @returns The scoped timer handle.
 */
export function useTimer(): ScopedTimer {
  const application = useApplicationContext()
  const ids = new Set<TimerId>()
  onCleanup(() => {
    for (const id of ids) application.scheduler.clear(id)
    ids.clear()
  })
  return {
    after(milliseconds, callback) {
      const id = application.scheduler.after(milliseconds, () => {
        ids.delete(id)
        callback()
      })
      ids.add(id)
      return id
    },
    every(milliseconds, callback) {
      const id = application.scheduler.every(milliseconds, callback)
      ids.add(id)
      return id
    },
    clear(id) {
      application.scheduler.clear(id)
      ids.delete(id)
    },
  }
}

/**
 * Create a {@link Tween}, register it with the application's tween manager, and
 * cancel + remove it automatically when the calling component unmounts.
 *
 * @param options - Tween configuration.
 * @returns The created {@link Tween}.
 */
export function useTween(options: TweenOptions): Tween {
  const application = useApplicationContext()
  const tween = new Tween(options)
  application.tweens.add(tween)
  onCleanup(() => {
    tween.cancel()
    application.tweens.remove(tween)
  })
  return tween
}

/**
 * Scoped event bus wrapping an {@link EventEmitter}: `on`/`once` registrations
 * are tracked and unsubscribed automatically when the owning component unmounts.
 *
 * @typeParam TEventMap - Event name to payload map.
 */
export interface ScopedEventBus<TEventMap extends Record<string, unknown>> {
  /**
   * Emit `payload` for `event` to all current listeners.
   *
   * @param event - Event name.
   * @param payload - Event payload.
   */
  emit<K extends keyof TEventMap>(event: K, payload: TEventMap[K]): void
  /**
   * Subscribe `listener` to `event`. The subscription is removed on unmount.
   *
   * @param event - Event name.
   * @param listener - Callback for each emission.
   * @returns A function to unsubscribe early.
   */
  on<K extends keyof TEventMap>(event: K, listener: EventListener<TEventMap[K]>): () => void
  /**
   * Subscribe `listener` to `event` for a single emission. The subscription is
   * removed on unmount if it has not fired yet.
   *
   * @param event - Event name.
   * @param listener - Callback for the next emission.
   * @returns A function to unsubscribe early.
   */
  once<K extends keyof TEventMap>(event: K, listener: EventListener<TEventMap[K]>): () => void
  /**
   * Remove `listener` from `event` immediately.
   *
   * @param event - Event name.
   * @param listener - Previously-registered callback.
   */
  off<K extends keyof TEventMap>(event: K, listener: EventListener<TEventMap[K]>): void
}

/**
 * Wrap an {@link EventEmitter} in a {@link ScopedEventBus}, tracking
 * `on`/`once` subscriptions so they are unsubscribed on cleanup.
 *
 * @param emitter - The emitter to wrap.
 * @returns The scoped bus.
 */
function wrapEmitter<TEventMap extends Record<string, unknown>>(
  emitter: EventEmitter<TEventMap>,
): ScopedEventBus<TEventMap> {
  const unsubscribers = new Set<() => void>()
  onCleanup(() => {
    for (const unsubscribe of unsubscribers) unsubscribe()
    unsubscribers.clear()
  })
  return {
    emit<K extends keyof TEventMap>(event: K, payload: TEventMap[K]): void {
      emitter.emit(event, payload)
    },
    on<K extends keyof TEventMap>(event: K, listener: EventListener<TEventMap[K]>): () => void {
      const unsubscribe = emitter.on(event, listener)
      unsubscribers.add(unsubscribe)
      return () => {
        unsubscribe()
        unsubscribers.delete(unsubscribe)
      }
    },
    once<K extends keyof TEventMap>(event: K, listener: EventListener<TEventMap[K]>): () => void {
      const unsubscribe = emitter.once(event, listener)
      unsubscribers.add(unsubscribe)
      return () => {
        unsubscribe()
        unsubscribers.delete(unsubscribe)
      }
    },
    off<K extends keyof TEventMap>(event: K, listener: EventListener<TEventMap[K]>): void {
      emitter.off(event, listener)
    },
  }
}

/**
 * Returns a {@link ScopedEventBus} for the application's event bus. Subscribers
 * are unsubscribed automatically when the calling component unmounts.
 *
 * @returns A scoped bus wrapping the application's events.
 */
export function useEvents(): ScopedEventBus<ApplicationEventMap>
/**
 * Returns a {@link ScopedEventBus} wrapping the supplied `emitter`. Subscribers
 * are unsubscribed automatically when the calling component unmounts.
 *
 * @param emitter - The emitter to wrap.
 * @returns A scoped bus wrapping `emitter`.
 */
export function useEvents<TEventMap extends Record<string, unknown>>(
  emitter: EventEmitter<TEventMap>,
): ScopedEventBus<TEventMap>
export function useEvents<TEventMap extends Record<string, unknown>>(
  emitter?: EventEmitter<TEventMap>,
): ScopedEventBus<TEventMap> | ScopedEventBus<ApplicationEventMap> {
  if (emitter) return wrapEmitter(emitter)
  const application = useApplicationContext()
  return wrapEmitter(application.events)
}

export { ApplicationContext, CanvasContext, SceneContext }
