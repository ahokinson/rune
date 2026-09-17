/**
 * Minimal typed event emitter for engine subsystems.
 *
 * @module
 */

/**
 * Listener function for an event whose payload is `TPayload`.
 *
 * @typeParam TPayload - Payload type delivered to the listener.
 */
export type EventListener<TPayload> = (payload: TPayload) => void

/**
 * Type-safe pub/sub emitter keyed by an event map. Listeners are stored in a
 * `Map` of `Set`s so add/remove/emit are all O(1) average and duplicates are
 * ignored. `emit` snapshots the listeners before invoking them, so a listener
 * may safely remove itself or others mid-dispatch.
 *
 * @typeParam TEventMap - Map of event name to payload type.
 *
 * @example
 * ```ts
 * const emitter = new EventEmitter<{ ping: number }>()
 * const off = emitter.on("ping", (n) => console.log(n))
 * emitter.emit("ping", 42)  // logs 42
 * off()                     // unsubscribe
 * ```
 */
export class EventEmitter<TEventMap extends Record<string, unknown>> {
  private listeners = new Map<keyof TEventMap, Set<EventListener<unknown>>>()

  /**
   * Subscribe `listener` to `event`.
   *
   * @param event - Event name (key of {@link TEventMap}).
   * @param listener - Callback invoked with the event payload.
   * @returns An unsubscribe function; calling it removes the listener.
   */
  on<K extends keyof TEventMap>(event: K, listener: EventListener<TEventMap[K]>): () => void {
    let set = this.listeners.get(event)
    if (!set) {
      set = new Set()
      this.listeners.set(event, set)
    }
    set.add(listener as EventListener<unknown>)
    return () => this.off(event, listener)
  }

  /**
   * Subscribe `listener` to `event` for a single delivery; the listener is
   * automatically removed before it is invoked.
   *
   * @param event - Event name.
   * @param listener - Callback invoked once.
   * @returns An unsubscribe function (cancels before the event fires).
   */
  once<K extends keyof TEventMap>(event: K, listener: EventListener<TEventMap[K]>): () => void {
    const wrapper: EventListener<TEventMap[K]> = (payload) => {
      this.off(event, wrapper)
      listener(payload)
    }
    return this.on(event, wrapper)
  }

  /**
   * Remove a previously added `listener` from `event`. No-op if absent.
   *
   * @param event - Event name.
   * @param listener - The exact function passed to {@link on} / {@link once}.
   */
  off<K extends keyof TEventMap>(event: K, listener: EventListener<TEventMap[K]>): void {
    const set = this.listeners.get(event)
    if (!set) return
    set.delete(listener as EventListener<unknown>)
    if (set.size === 0) this.listeners.delete(event)
  }

  /**
   * Deliver `payload` to every listener subscribed to `event`. Iterates a
   * snapshot so listeners may mutate the subscription set during dispatch.
   *
   * @param event - Event name.
   * @param payload - Value passed to each listener.
   */
  emit<K extends keyof TEventMap>(event: K, payload: TEventMap[K]): void {
    const set = this.listeners.get(event)
    if (!set) return
    if (set.size === 1) {
      for (const listener of set) {
        ;(listener as EventListener<TEventMap[K]>)(payload)
      }
      return
    }
    const snapshot = [...set]
    for (const listener of snapshot) {
      ;(listener as EventListener<TEventMap[K]>)(payload)
    }
  }

  /** Remove all listeners for every event. */
  clear(): void {
    this.listeners.clear()
  }
}
