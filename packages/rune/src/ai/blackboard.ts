/**
 * A typed key/value store agents share to coordinate. Behaviour-tree nodes and
 * steering routines read and write a Blackboard instead of holding their own
 * scattered state — the tree's "perception/memory". Parameterise it with a record
 * type to get compile-time-checked keys and value types; `get` returns undefined
 * for unset keys so callers handle the "not yet known" case explicitly.
 *
 * @module
 */

/**
 * Typed key/value store shared between agents for coordination.
 *
 * @typeParam TSchema - Record mapping keys to value types.
 */
export class Blackboard<TSchema extends object = Record<string, unknown>> {
  private readonly values = new Map<keyof TSchema, TSchema[keyof TSchema]>()

  /**
   * Set `key` to `value`, overwriting any prior entry.
   *
   * @param key - Schema key.
   * @param value - Value to store.
   */
  set<K extends keyof TSchema>(key: K, value: TSchema[K]): void {
    this.values.set(key, value)
  }

  /**
   * Read `key`.
   *
   * @param key - Schema key.
   * @returns The stored value, or `undefined` if unset.
   */
  get<K extends keyof TSchema>(key: K): TSchema[K] | undefined {
    return this.values.get(key) as TSchema[K] | undefined
  }

  /**
   * Read with a fallback for unset keys.
   *
   * @param key - Schema key.
   * @param fallback - Value to return when the key is unset.
   * @returns The stored value, or `fallback` when unset.
   */
  getOr<K extends keyof TSchema>(key: K, fallback: TSchema[K]): TSchema[K] {
    return this.values.has(key) ? (this.values.get(key) as TSchema[K]) : fallback
  }

  /**
   * @param key - Schema key.
   * @returns `true` if `key` has been set.
   */
  has<K extends keyof TSchema>(key: K): boolean {
    return this.values.has(key)
  }

  /**
   * Remove `key` from the store.
   *
   * @param key - Schema key.
   * @returns `true` if the key was present and removed.
   */
  delete<K extends keyof TSchema>(key: K): boolean {
    return this.values.delete(key)
  }

  /** Remove every entry. */
  clear(): void {
    this.values.clear()
  }
}
