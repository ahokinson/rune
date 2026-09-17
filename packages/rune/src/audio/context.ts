/**
 * Audio playback backends. {@link AudioContext} is the abstraction games code
 * against; {@link SystemAudioContext} plays sounds by spawning the platform's
 * command-line player, and {@link NullAudioContext} is a recording test double.
 *
 * @module
 */

export interface PlayOptions {
  /** Linear volume multiplier, 0–1 (honoured on platforms whose player supports it, e.g. macOS afplay). Default 1. */
  volume?: number
  /** Loop the sound until stopped (re-spawns the player each time it finishes). */
  loop?: boolean
}

/** Handle on a playing sound; `stop()` halts it and `playing` reports liveness. */
export interface AudioSource {
  stop(): void
  readonly playing: boolean
}

/** Minimal audio backend: load sounds, play them, and stop everything. */
export interface AudioContext {
  load(name: string, path: string): Promise<void>
  /**
   * Register a sound from an in-memory buffer (e.g. a WAV synthesised at runtime),
   * so games need no on-disk audio assets. Optional: not every backend supports it.
   */
  loadBuffer?(name: string, bytes: Uint8Array): Promise<void>
  play(name: string, options?: PlayOptions): AudioSource | null
  stopAll(): void
}

/**
 * No-op {@link AudioContext} that records plays instead of making sound — the
 * test double for assertions about what a game "played".
 */
export class NullAudioContext implements AudioContext {
  /** Recorded `play` calls in order, for test assertions. */
  readonly playLog: Array<{ name: string; options: PlayOptions | undefined }> = []
  private readonly loadedNames = new Set<string>()

  /**
   * Record `name` as loaded (no file is touched).
   *
   * @param name - Sound key.
   * @param _path - Ignored.
   */
  async load(name: string, _path: string): Promise<void> {
    this.loadedNames.add(name)
  }

  /**
   * Record `name` as loaded (no bytes are touched).
   *
   * @param name - Sound key.
   * @param _bytes - Ignored.
   */
  async loadBuffer(name: string, _bytes: Uint8Array): Promise<void> {
    this.loadedNames.add(name)
  }

  /**
   * Append to {@link playLog} and return a fake {@link AudioSource}.
   *
   * @param name - Sound key.
   * @param options - Playback options (recorded).
   * @returns A handle whose `playing` flips to `false` on `stop()`.
   */
  play(name: string, options?: PlayOptions): AudioSource | null {
    this.playLog.push({ name, options })
    let stopped = false
    return {
      stop() {
        stopped = true
      },
      get playing() {
        return !stopped
      },
    }
  }

  /** No-op. */
  stopAll(): void {}

  /**
   * @param name - Sound key.
   * @returns `true` if `name` was registered via `load`/`loadBuffer`.
   */
  isLoaded(name: string): boolean {
    return this.loadedNames.has(name)
  }
}

interface SpawnLike {
  kill(): void
  exited: Promise<number>
}

interface BunLike {
  spawn(options: { cmd: string[]; stdout: "ignore"; stderr: "ignore" }): SpawnLike
  write(path: string, data: Uint8Array): Promise<number>
}

declare const Bun: BunLike | undefined
declare const process: { platform: string; env: Record<string, string | undefined> } | undefined

/**
 * Build the argv to play `path` on the given platform. macOS afplay takes a `-v`
 * volume multiplier; the Linux/Windows fallbacks play at system volume. Pass
 * `playerOverride` to force a specific command (e.g. "ffplay" on Linux). Pure and
 * platform-string-driven so it can be unit-tested without spawning anything.
 *
 * @param platform - `process.platform`-style string ("darwin", "win32", …).
 * @param path - File path to play.
 * @param volume - Linear volume 0–1 (forwarded to afplay's `-v`).
 * @param playerOverride - Force a specific player command.
 * @returns Argv array suitable for `spawn`.
 */
export function resolvePlayerCommand(
  platform: string,
  path: string,
  volume: number,
  playerOverride?: string,
): string[] {
  if (playerOverride) return [playerOverride, path]
  switch (platform) {
    case "darwin":
      return ["afplay", "-v", String(volume), path]
    case "win32":
      return ["powershell", "-NoProfile", "-Command", `(New-Object Media.SoundPlayer '${path}').PlaySync()`]
    default:
      // Linux/other: PulseAudio's paplay is the most widely present. Override with
      // `player` for ALSA (aplay) or ffmpeg (ffplay).
      return ["paplay", path]
  }
}

export interface SystemAudioContextOptions {
  /** Override the detected platform (mainly for testing). */
  platform?: string
  /** Force a specific player command on the current platform. */
  player?: string
  /** Directory for buffers written by loadBuffer (default $TMPDIR or "/tmp"). */
  tempDir?: string
}

/**
 * Plays sounds by spawning the platform's command-line audio player — the
 * terminal-friendly way to get audio without a native binding. Resolves the right
 * player per OS, honours per-play volume where the player supports it, and loops
 * by re-spawning on exit. `loadBuffer` writes a runtime-synthesised WAV to a temp
 * file so generated sounds (see ./synth) play the same as loaded ones.
 */
export class SystemAudioContext implements AudioContext {
  private readonly assets: Map<string, string> = new Map()
  private readonly active: Set<SpawnLike> = new Set()
  private readonly platform: string
  private readonly playerOverride?: string
  private readonly tempDir: string
  private bufferCounter = 0

  /**
   * @param options - Backend configuration; defaults inferred from `process`.
   */
  constructor(options: SystemAudioContextOptions = {}) {
    this.platform = options.platform ?? process?.platform ?? "linux"
    this.playerOverride = options.player
    this.tempDir = options.tempDir ?? process?.env?.TMPDIR ?? "/tmp"
  }

  /**
   * Register a sound at `path` under `name`.
   *
   * @param name - Sound key used by `play`.
   * @param path - Filesystem path to the audio file.
   */
  async load(name: string, path: string): Promise<void> {
    this.assets.set(name, path)
  }

  /**
   * Write `bytes` to a temp WAV file and register it under `name`. No-op outside Bun.
   *
   * @param name - Sound key.
   * @param bytes - WAV file bytes (e.g. from `synthTone`).
   */
  async loadBuffer(name: string, bytes: Uint8Array): Promise<void> {
    if (typeof Bun === "undefined") return
    const path = `${this.tempDir}/rune-audio-${name}-${this.bufferCounter++}.wav`
    await Bun.write(path, bytes)
    this.assets.set(name, path)
  }

  /**
   * Spawn the resolved player for `name`. Loops by re-spawning on exit when
   * `options.loop` is set.
   *
   * @param name - Sound key previously loaded.
   * @param options - Volume/loop options.
   * @returns A handle on the running player, or `null` if `name` is unknown or
   *   the runtime can't spawn.
   */
  play(name: string, options?: PlayOptions): AudioSource | null {
    const path = this.assets.get(name)
    if (!path) return null
    if (typeof Bun === "undefined") return null
    const volume = options?.volume ?? 1
    const loop = options?.loop ?? false
    const cmd = resolvePlayerCommand(this.platform, path, volume, this.playerOverride)

    let stopped = false
    let current: SpawnLike | null = null
    const spawnOnce = (): void => {
      if (stopped) return
      const proc = Bun!.spawn({ cmd, stdout: "ignore", stderr: "ignore" })
      current = proc
      this.active.add(proc)
      void proc.exited.then(() => {
        this.active.delete(proc)
        if (!stopped && loop) spawnOnce()
      })
    }
    spawnOnce()

    return {
      stop: () => {
        if (stopped) return
        stopped = true
        if (current) {
          current.kill()
          this.active.delete(current)
        }
      },
      get playing() {
        return !stopped
      },
    }
  }

  /** Kill every active player. */
  stopAll(): void {
    for (const proc of this.active) proc.kill()
    this.active.clear()
  }
}

export interface AfplayAudioContextOptions {
  /** Override the `afplay` binary name. */
  commandName?: string
}

/**
 * macOS preset of {@link SystemAudioContext} (plays through `afplay`). Kept for
 * back-compat and as the obvious choice on macOS; new code can use
 * {@link SystemAudioContext} directly for cross-platform behaviour.
 */
export class AfplayAudioContext extends SystemAudioContext {
  /**
   * @param options - Optional override of the `afplay` command name.
   */
  constructor(options: AfplayAudioContextOptions = {}) {
    super({ platform: "darwin", player: options.commandName })
  }
}
