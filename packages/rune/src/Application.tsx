/**
 * Root `<Application>` component: owns the renderer, the fixed-step loop, input
 * state, scene stack, scheduler, tweens and audio for a rune game, and exposes
 * them to its subtree via an {@link ApplicationContext} provider.
 *
 * @module
 */

import { useKeyboard, useRenderer } from "@opentui/solid"
import { type Accessor, createSignal, type JSX, onCleanup, onMount } from "solid-js"
import { type AudioContext, NullAudioContext } from "./audio/context"
import {
  ApplicationContext,
  type ApplicationEventMap,
  type ApplicationHandle,
  type FixedUpdateCallback,
  type UpdateCallback,
} from "./context"
import { EventEmitter } from "./core/events"
import { advanceLoop, createLoopState } from "./core/loop"
import { Scheduler } from "./core/scheduler"
import { FramesPerSecondCounter } from "./core/time"
import type { Canvas } from "./draw/canvas"
import { GamepadState, pollWebGamepads } from "./input/gamepad"
import { KeyboardState } from "./input/keyboard"
import { MouseState } from "./input/mouse"
import { InputPhase } from "./input/phase"
// Type-only: the implementation is pulled in via a dynamic import below so it is
// dropped entirely from compiled builds (see the RUNE_COMPILED guard).
import type { InspectionServer } from "./inspect/server"
import { Random } from "./math/random"
import { SceneManager } from "./scene/sceneManager"
import { TweenManager } from "./tween/tween"

/** Properties for the {@link Application} component. */
export interface ApplicationProps {
  /** Fixed-update rate in Hz (default 30). */
  ticksPerSecond?: number
  /** Maximum sub-steps allowed per frame to catch up (default 5). */
  maximumSubSteps?: number
  /** Seed for the shared deterministic {@link Random} (default `Date.now()`). */
  randomSeed?: number
  /** Audio context to use; defaults to a {@link NullAudioContext}. */
  audio?: AudioContext
  /** Component subtree that runs inside the application context. */
  children?: JSX.Element
}

interface KeyboardEventLike {
  name?: string
  eventType?: string
}

/**
 * Mounts a rune application: starts the renderer, wires the per-frame callback
 * that advances the fixed-step loop, input phases, tweens and scheduler, and
 * provides an {@link ApplicationHandle} to descendants via
 * {@link ApplicationContext}. Cleans everything up (and, in standalone runs,
 * exits the process) on unmount.
 *
 * @param props - Component properties.
 * @returns The Solid element tree rooted at the context provider.
 */
export function Application(props: ApplicationProps): JSX.Element {
  const renderer = useRenderer()
  const ticksPerSecondValue = props.ticksPerSecond ?? 30
  const maximumSubSteps = props.maximumSubSteps ?? 5
  const stepMilliseconds = 1000 / ticksPerSecondValue

  const [tick, setTick] = createSignal(0)
  const [ticksPerSecond] = createSignal(ticksPerSecondValue)
  const [framesPerSecondSignal, setFramesPerSecondSignal] = createSignal(0)
  const [paused, setPaused] = createSignal(false)

  const events = new EventEmitter<ApplicationEventMap>()
  const keyboard = new KeyboardState()
  const mouse = new MouseState()
  const gamepad = new GamepadState()
  const scenes = new SceneManager()
  const scheduler = new Scheduler()
  const tweens = new TweenManager()
  const random = new Random(props.randomSeed ?? Date.now())
  const audio: AudioContext = props.audio ?? new NullAudioContext()
  const fpsCounter = new FramesPerSecondCounter()
  const loopState = createLoopState()
  const fixedUpdateCallbacks = new Set<FixedUpdateCallback>()
  const updateCallbacks = new Set<UpdateCallback>()

  // Tear the app down and, for a standalone run, exit the process. `renderer.destroy()`
  // restores the terminal and disposes the Solid root (firing onCleanup, which stops
  // the inspection socket) — but under `rune dev` the game runs inside `bun --watch`,
  // which keeps the process alive afterwards, so the shell never returns. Once the
  // renderer is destroyed we exit for real. Tests mount/unmount the app without owning
  // the process, so they set neither flag and are left untouched.
  const shutdown = () => {
    renderer.destroy()
    if (process.env.RUNE_DEV === "1" || process.env.RUNE_COMPILED === "1") {
      queueMicrotask(() => process.exit(0))
    }
  }

  useKeyboard(
    (event: KeyboardEventLike) => {
      const name = event.name
      if (!name) return
      if (event.eventType === "release") {
        keyboard.release(name)
        return
      }
      keyboard.press(name)
      if (name === "escape") {
        shutdown()
      }
    },
    { release: true },
  )

  /**
   * Frame-update callback driving the whole simulation. Advances input decay,
   * tweens, and the scheduler; runs the fixed-step loop (with per-substep scene
   * updates and edge-buffer commits) when not paused; then runs the per-frame
   * update callbacks and commits the frame input edges.
   *
   * @param deltaMilliseconds - Wall-clock delta for this frame.
   * @returns Resolves when the frame's updates are complete.
   */
  const handleFrame = async (deltaMilliseconds: number): Promise<void> => {
    keyboard.decayHeld()
    // Pull the latest controller state where the Web Gamepad API exists; a no-op
    // in a plain terminal, so a host that pushes its own readings is unaffected.
    pollWebGamepads(gamepad)
    fpsCounter.record(deltaMilliseconds)
    setFramesPerSecondSignal(fpsCounter.value)
    tweens.advance(deltaMilliseconds)
    scheduler.advance(deltaMilliseconds)
    if (!paused()) {
      // Fixed-step pass: gameplay reads the fixed edge buffer. The buffer is
      // cleared after the first substep so a single press fires on exactly one
      // tick even when a frame runs several substeps (the common case).
      keyboard.setPhase(InputPhase.Fixed)
      mouse.setPhase(InputPhase.Fixed)
      gamepad.setPhase(InputPhase.Fixed)
      let firstStep = true
      advanceLoop(
        loopState,
        deltaMilliseconds,
        stepMilliseconds,
        maximumSubSteps,
        (stepDeltaMilliseconds, currentTick) => {
          setTick(currentTick)
          const activeScene = scenes.current
          if (activeScene) activeScene.update(stepDeltaMilliseconds)
          for (const fixedUpdate of fixedUpdateCallbacks) fixedUpdate(stepDeltaMilliseconds, currentTick)
          events.emit("tick", { tick: currentTick, deltaMilliseconds: stepDeltaMilliseconds })
          if (firstStep) {
            keyboard.commitFixed()
            mouse.commitFixed()
            gamepad.commitFixed()
            firstStep = false
          }
        },
      )
      // When no substep ran this frame (rendering faster than the tick rate),
      // the fixed edges are intentionally left intact so the press reaches the
      // next tick that actually runs.
    } else {
      // Not simulating: drop fixed edges so a press made while paused doesn't
      // buffer up and fire on the tick that resumes.
      keyboard.commitFixed()
      mouse.commitFixed()
      gamepad.commitFixed()
    }
    // Frame-update pass: once-per-frame code (pause toggles, title screens)
    // reads the frame edge buffer, which is committed at frame end so each
    // press is seen exactly once regardless of substep count.
    keyboard.setPhase(InputPhase.Frame)
    mouse.setPhase(InputPhase.Frame)
    gamepad.setPhase(InputPhase.Frame)
    for (const update of updateCallbacks) update(deltaMilliseconds)
    keyboard.commitFrame()
    mouse.commitFrame()
    gamepad.commitFrame()
  }

  const handleResize = (width: number, height: number) => {
    events.emit("resize", { width, height })
  }

  // Live inspection (`rune inspect`), only ever available when running from
  // source under `rune dev` (which sets the socket path). `rune build` defines
  // `process.env.RUNE_COMPILED` to "1", so this whole branch — and the
  // InspectionServer it pulls in — is dead-code-eliminated from shipped binaries:
  // a compiled game cannot be inspected, no matter what env vars are set.
  let inspectionServer: InspectionServer | null = null
  let inspectionDisposed = false

  onMount(() => {
    renderer.start()
    renderer.requestLive()
    renderer.setFrameCallback(handleFrame)
    renderer.on("resize", handleResize as (...args: unknown[]) => void)

    if (process.env.RUNE_COMPILED !== "1") {
      const inspectSocket = process.env.RUNE_INSPECT_SOCKET
      if (inspectSocket) {
        // Dynamic import so the whole inspect module tree-shakes out when this
        // branch is folded away at build time — nothing to load, nothing to run.
        void import("./inspect/server").then(({ InspectionServer }) => {
          if (inspectionDisposed) return
          inspectionServer = new InspectionServer({ handle, socketPath: inspectSocket })
          inspectionServer.start()
        })
      }
    }
  })

  onCleanup(() => {
    renderer.removeFrameCallback(handleFrame)
    renderer.off?.("resize", handleResize as (...args: unknown[]) => void)
    inspectionDisposed = true
    inspectionServer?.stop()
    inspectionServer = null
    scheduler.clearAll()
    tweens.clear()
    renderer.dropLive()
    renderer.stop()
  })

  const handle: ApplicationHandle = {
    tick,
    ticksPerSecond,
    framesPerSecond: framesPerSecondSignal,
    paused,
    random,
    scenes,
    events,
    keyboard,
    mouse,
    gamepad,
    scheduler,
    tweens,
    audio,
    renderAlpha() {
      if (stepMilliseconds <= 0) return 0
      const value = loopState.accumulator / stepMilliseconds
      return value < 0 ? 0 : value > 1 ? 1 : value
    },
    registerFixedUpdate(callback) {
      fixedUpdateCallbacks.add(callback)
      return () => fixedUpdateCallbacks.delete(callback)
    },
    registerUpdate(callback) {
      updateCallbacks.add(callback)
      return () => updateCallbacks.delete(callback)
    },
    pause() {
      setPaused(true)
    },
    resume() {
      setPaused(false)
    },
    quit() {
      shutdown()
    },
  }

  return <ApplicationContext.Provider value={handle}>{props.children}</ApplicationContext.Provider>
}

/** Optional context shape carrying a canvas accessor down to descendants. */
export type ApplicationCanvasContext = {
  /** Canvas accessor (matches {@link CanvasContext}'s value). */
  canvas: Accessor<Canvas | null>
}
