/**
 * Deterministic state serialisation for replay verification and save/load. A
 * fixed-step sim replayed from the same seed and inputs should reach byte-identical
 * state; `hashState` reduces a plain-data snapshot of the world to a number you can
 * compare between a live run and its replay to catch determinism drift (an
 * unseeded Math.random, iteration-order bugs, float nondeterminism). The same
 * stable string also round-trips through `saveState`/`loadState` for save files —
 * object keys are emitted in sorted order so the encoding never depends on
 * insertion order.
 *
 * @module
 */

/** JSON-like plain data accepted by the snapshot helpers. */
export type Serializable = null | boolean | number | string | Serializable[] | { [key: string]: Serializable }

/**
 * Stable JSON: identical for two structurally equal values regardless of key
 * insertion order. Throws on cycles (state snapshots should be plain trees).
 *
 * @param value - Plain-data value to serialize.
 * @returns Canonical JSON string with sorted object keys.
 */
export function serializeState(value: Serializable): string {
  return stringify(value)
}

function stringify(value: Serializable): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null"
  if (Array.isArray(value)) return `[${value.map(stringify).join(",")}]`
  const keys = Object.keys(value).sort()
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stringify(value[key]!)}`).join(",")}}`
}

/**
 * FNV-1a 32-bit hash of the stable serialisation — a compact fingerprint of the
 * whole state for cheap equality checks in determinism tests.
 *
 * @param value - Plain-data value to hash.
 * @returns Unsigned 32-bit hash of {@link serializeState}.
 */
export function hashState(value: Serializable): number {
  const text = serializeState(value)
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

/**
 * Encode a snapshot for persistence (the stable string is the save format).
 *
 * @param value - Plain-data value to save.
 * @returns The stable serialisation of `value`.
 */
export function saveState(value: Serializable): string {
  return serializeState(value)
}

/**
 * Decode a snapshot produced by {@link saveState}.
 *
 * @typeParam T - Concrete shape to cast to.
 * @param text - Stable serialisation produced by {@link saveState}.
 * @returns The parsed snapshot.
 */
export function loadState<T extends Serializable = Serializable>(text: string): T {
  return JSON.parse(text) as T
}
