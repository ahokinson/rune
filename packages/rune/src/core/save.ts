/**
 * Named save slots persisted to disk. A thin wrapper over the deterministic
 * snapshot format in {@link module:replay/snapshot} ({@link saveState} /
 * {@link loadState}): {@link SaveStore} writes each slot as a JSON file under a
 * directory and reads it back, giving games save/continue without rolling their
 * own file handling. The snapshot helpers stay the single serialisation path.
 *
 * @module
 */

import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { loadState, type Serializable, saveState } from "../replay/snapshot"

/** Options for constructing a {@link SaveStore}. */
export interface SaveStoreOptions {
  /** Directory the slot files live in (created on first write). */
  directory: string
  /** Filename extension for slot files (default `"json"`). */
  extension?: string
}

/**
 * A directory of named save slots. Each slot is one file holding the stable
 * serialisation of a plain-data snapshot; reads parse it back. Methods are async
 * (file I/O) and never throw on a missing slot — {@link load} returns `null` and
 * {@link has} returns `false`.
 */
export class SaveStore {
  private readonly directory: string
  private readonly extension: string

  /**
   * @param options - Target directory and file extension.
   */
  constructor(options: SaveStoreOptions) {
    this.directory = options.directory
    this.extension = options.extension ?? "json"
  }

  private pathFor(slot: string): string {
    return join(this.directory, `${slot}.${this.extension}`)
  }

  /**
   * Write `value` to `slot`, creating the directory if needed. Overwrites any
   * existing slot of the same name.
   *
   * @param slot - Slot name (used as the filename stem).
   * @param value - Plain-data snapshot to persist.
   */
  async save(slot: string, value: Serializable): Promise<void> {
    await mkdir(this.directory, { recursive: true })
    await writeFile(this.pathFor(slot), saveState(value), "utf8")
  }

  /**
   * Read `slot` back, or `null` if it doesn't exist.
   *
   * @typeParam T - Concrete shape to cast the snapshot to.
   * @param slot - Slot name.
   * @returns The parsed snapshot, or `null` when the slot is absent.
   */
  async load<T extends Serializable = Serializable>(slot: string): Promise<T | null> {
    try {
      return loadState<T>(await readFile(this.pathFor(slot), "utf8"))
    } catch {
      return null
    }
  }

  /**
   * @param slot - Slot name.
   * @returns `true` if the slot exists and is readable.
   */
  async has(slot: string): Promise<boolean> {
    try {
      await readFile(this.pathFor(slot), "utf8")
      return true
    } catch {
      return false
    }
  }

  /**
   * Delete `slot` if present (a no-op otherwise).
   *
   * @param slot - Slot name.
   */
  async delete(slot: string): Promise<void> {
    await rm(this.pathFor(slot), { force: true })
  }

  /**
   * List the slot names present in the directory (without the extension),
   * alphabetically. Returns an empty array if the directory doesn't exist yet.
   *
   * @returns Slot names.
   */
  async list(): Promise<string[]> {
    const suffix = `.${this.extension}`
    try {
      const entries = await readdir(this.directory)
      return entries
        .filter((name) => name.endsWith(suffix))
        .map((name) => name.slice(0, -suffix.length))
        .sort()
    } catch {
      return []
    }
  }
}
