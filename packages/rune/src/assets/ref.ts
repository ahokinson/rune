/**
 * `Ref`: a named, lazily-resolved pointer from one asset to another.
 *
 * A {@link Ref} stores the target asset's name until the pack loader resolves
 * it (see {@link Ref.resolve}). Resolution is deferred so asset YAML can
 * reference peers that are parsed later in the same pack.
 *
 * @module
 */

import type { Asset } from "./asset"

/** Context capable of looking up an asset by name, used during ref resolution. */
export interface RefResolveContext {
  tryGet(name: string): Asset | undefined
}

/**
 * A named pointer to another asset, resolved lazily by the pack loader.
 */
export class Ref<T extends Asset = Asset> {
  /** Name of the referenced asset. */
  readonly name: string
  private target: T | null = null
  private sourceAsset: string | null = null
  private sourceField: string | null = null

  /**
   * @param name - Name of the referenced asset.
   */
  constructor(name: string) {
    this.name = name
  }

  /**
   * Record which asset and field holds this ref, for error reporting when the
   * ref cannot be resolved.
   *
   * @param sourceAsset - Name of the owning asset.
   * @param sourceField - Field name on the owning asset.
   */
  bindSource(sourceAsset: string, sourceField: string): void {
    this.sourceAsset = sourceAsset
    this.sourceField = sourceField
  }

  /**
   * Resolve this ref against a context, throwing if the target is missing.
   *
   * @param ctx - Lookup context (typically the {@link AssetPack}).
   */
  resolve(ctx: RefResolveContext): void {
    const resolved = ctx.tryGet(this.name)
    if (!resolved) {
      const where = this.sourceAsset ? `${this.sourceAsset}.${this.sourceField ?? "?"}` : "<unknown>"
      throw new Error(`Unresolved Ref('${this.name}') referenced from ${where}`)
    }
    this.target = resolved as T
  }

  /**
   * Get the resolved target asset.
   *
   * @returns The resolved asset.
   */
  get(): T {
    if (!this.target) {
      throw new Error(`Ref('${this.name}') has not been resolved yet`)
    }
    return this.target
  }

  /** Whether the target has been resolved. */
  get isResolved(): boolean {
    return this.target !== null
  }
}

/**
 * Type guard for {@link Ref} instances.
 *
 * @param value - Any value.
 * @returns `true` if `value` is a {@link Ref}.
 */
export function isRef(value: unknown): value is Ref {
  return value instanceof Ref
}
