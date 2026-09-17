/**
 * Base class and schema machinery for the asset system.
 *
 * An {@link Asset} is a named, pack-resolved resource (sprite, tile map, theme,
 * …). Subclasses declare a static {@link AssetClass.schema | schema} of
 * {@link Slot}s that parse raw YAML into typed fields; the pack loader uses that
 * schema to populate instances and then walks the result to resolve {@link Ref}s
 * between assets.
 *
 * @module
 */

import { isRef, type Ref } from "./ref"
import type { Slot } from "./slot"

/** Options passed to an {@link Asset} constructor. */
export interface AssetOptions {
  /** Unique name of the asset within its pack. */
  name: string
  /** Absolute path to the asset's source file. */
  path: string
}

/** A read-only mapping of field name to {@link Slot} describing an asset's schema. */
export type AssetSchema = Readonly<Record<string, Slot<unknown>>>

/**
 * Constructor type for an {@link Asset} subclass.
 *
 * Optionally carries a static `schema` used by the pack loader to parse fields,
 * and an optional `finalize` hook invoked after all refs are resolved.
 */
export interface AssetClass<T extends Asset = Asset> {
  new (options: AssetOptions): T
  schema?: AssetSchema
  finalize?(asset: T, ctx: { tryGet(name: string): Asset | undefined; get<U extends Asset>(name: string): U }): void
}

/**
 * Base class for all pack-resolved assets.
 *
 * Subclasses populate typed fields via a static {@link AssetClass.schema | schema}
 * of {@link Slot}s; the pack loader sets fields through {@link setField} and then
 * collects inter-asset {@link Ref}s through {@link collectRefs}.
 */
export abstract class Asset {
  /** Unique name of this asset within its pack. */
  readonly name: string
  /** Absolute path to this asset's source file. */
  readonly path: string

  /**
   * @param options - Name and source path.
   */
  constructor(options: AssetOptions) {
    this.name = options.name
    this.path = options.path
  }

  /**
   * Set a schema field by key. Used by the pack loader while parsing.
   *
   * @param key - Field name declared in the schema.
   * @param value - Parsed value to assign.
   */
  setField(key: string, value: unknown): void {
    ;(this as unknown as Record<string, unknown>)[key] = value
  }

  /**
   * Read a schema field by key.
   *
   * @param key - Field name declared in the schema.
   * @returns The current value (or `undefined` if unset).
   */
  getField(key: string): unknown {
    return (this as unknown as Record<string, unknown>)[key]
  }

  /**
   * Walk the class schema and collect every {@link Ref} field, binding each
   * ref's source to this asset so unresolved references can be reported with
   * `asset.field` context.
   *
   * @returns All refs found on this asset.
   */
  collectRefs(): Ref[] {
    const schema = (this.constructor as AssetClass).schema
    if (!schema) return []
    const refs: Ref[] = []
    for (const key of Object.keys(schema)) {
      const value = this.getField(key)
      if (isRef(value)) {
        value.bindSource(this.name, key)
        refs.push(value)
      }
    }
    return refs
  }
}
