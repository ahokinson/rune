/**
 * AssetPack: mounting and querying a directory of authored assets.
 *
 * A pack is rooted at a directory containing a `manifest.yaml` that lists asset
 * files. {@link AssetPack.mount} parses each asset through its registered
 * class's schema, resolves inter-asset {@link Ref}s, and runs each class's
 * optional `finalize` hook. The resulting pack is a name-to-{@link Asset} lookup
 * with typed accessors.
 *
 * @module
 */

import { basename, extname, isAbsolute, join } from "node:path"
import type { Asset, AssetClass } from "./asset"
import { loadYaml, loadYamlSync } from "./load"

interface PackManifest {
  assets: string[]
}

interface BaseAssetData {
  type: string
  name?: string
}

/** Throw unless the parsed manifest has an `assets` array; return it narrowed. */
function validateManifest(manifest: PackManifest, manifestPath: string): PackManifest {
  if (!manifest.assets || !Array.isArray(manifest.assets)) {
    throw new Error(`Pack manifest '${manifestPath}' missing 'assets' array`)
  }
  return manifest
}

/** Resolve a manifest entry to an absolute path against the pack root. */
function resolveEntry(rootDir: string, entry: string): string {
  return isAbsolute(entry) ? entry : join(rootDir, entry)
}

/**
 * A mounted directory of assets, keyed by name.
 *
 * Construct one with {@link AssetPack.mount}; then look up assets with
 * {@link get}, {@link tryGet}, or {@link getAll}.
 */
export class AssetPack {
  private readonly assets = new Map<string, Asset>()
  /** Absolute path to the pack's root directory. */
  readonly rootDir: string

  private constructor(rootDir: string) {
    this.rootDir = rootDir
  }

  /**
   * Mount a pack: read its manifest, parse each listed asset through its
   * registered class's schema, resolve inter-asset {@link Ref}s, and run each
   * class's `finalize` hook.
   *
   * @param rootDir - Pack root containing `manifest.yaml`.
   * @param types - Map of asset `type` string to {@link AssetClass}.
   * @returns A populated {@link AssetPack}.
   */
  static mount(rootDir: string, types: Record<string, AssetClass>): AssetPack {
    const pack = new AssetPack(rootDir)
    const manifestPath = join(rootDir, "manifest.yaml")
    const manifest = validateManifest(loadYamlSync<PackManifest>(manifestPath), manifestPath)

    // Phase 1: read + parse each asset.
    for (const entry of manifest.assets) {
      const fullPath = resolveEntry(rootDir, entry)
      pack.register(types, entry, fullPath, loadYamlSync<BaseAssetData>(fullPath))
    }

    pack.resolveAndFinalize()
    return pack
  }

  /**
   * Async counterpart to {@link mount}: read the manifest and every asset file
   * via async I/O (concurrently), then parse, resolve {@link Ref}s, and finalize
   * exactly as {@link mount} does. Prefer this for larger packs where blocking
   * the event loop on synchronous reads is undesirable.
   *
   * @param rootDir - Pack root containing `manifest.yaml`.
   * @param types - Map of asset `type` string to {@link AssetClass}.
   * @returns A promise of a populated {@link AssetPack}.
   */
  static async mountAsync(rootDir: string, types: Record<string, AssetClass>): Promise<AssetPack> {
    const pack = new AssetPack(rootDir)
    const manifestPath = join(rootDir, "manifest.yaml")
    const manifest = validateManifest(await loadYaml<PackManifest>(manifestPath), manifestPath)

    // Phase 1: read every asset concurrently, then parse in manifest order so
    // duplicate-name errors are deterministic.
    const entries = manifest.assets.map((entry) => {
      const fullPath = resolveEntry(rootDir, entry)
      return { entry, fullPath, raw: loadYaml<BaseAssetData>(fullPath) }
    })
    for (const { entry, fullPath, raw } of entries) {
      pack.register(types, entry, fullPath, await raw)
    }

    pack.resolveAndFinalize()
    return pack
  }

  /** Parse one asset's raw data through its registered class and store it. */
  private register(types: Record<string, AssetClass>, entry: string, fullPath: string, raw: BaseAssetData): void {
    const typeName = raw.type
    if (!typeName) {
      throw new Error(`Asset '${fullPath}' missing 'type' field`)
    }
    const AssetClass = types[typeName]
    if (!AssetClass) {
      const known = Object.keys(types).join(", ") || "<none>"
      throw new Error(`Unknown asset type '${typeName}' in '${fullPath}'. Known types: ${known}`)
    }

    const name = raw.name ?? basename(entry, extname(entry))
    const asset = new AssetClass({ name, path: fullPath })

    const schema = AssetClass.schema
    if (schema) {
      for (const [fieldKey, slot] of Object.entries(schema)) {
        const value = slot.parse(raw, {
          fieldKey,
          assetName: name,
          assetPath: fullPath,
        })
        asset.setField(fieldKey, value)
      }
    }

    if (this.assets.has(name)) {
      throw new Error(`Duplicate asset name '${name}' (from '${fullPath}' and existing entry)`)
    }
    this.assets.set(name, asset)
  }

  /** Phases 2 and 3: resolve inter-asset refs, then run finalize hooks. */
  private resolveAndFinalize(): void {
    // Phase 2: resolve refs.
    for (const asset of this.assets.values()) {
      const refs = asset.collectRefs()
      for (const ref of refs) {
        ref.resolve(this)
      }
    }

    // Phase 3: finalize.
    for (const asset of this.assets.values()) {
      const AssetClass = asset.constructor as AssetClass
      if (AssetClass.finalize) {
        AssetClass.finalize(asset, this)
      }
    }
  }

  /**
   * Look up an asset by name, throwing if it is missing.
   *
   * @param name - Asset name.
   * @returns The asset, cast to `T`.
   */
  get<T extends Asset = Asset>(name: string): T {
    const asset = this.assets.get(name)
    if (!asset) {
      throw new Error(`Asset '${name}' not found in pack '${this.rootDir}'`)
    }
    return asset as T
  }

  /**
   * Look up an asset by name, returning `undefined` if missing.
   *
   * @param name - Asset name.
   * @returns The asset cast to `T`, or `undefined`.
   */
  tryGet<T extends Asset = Asset>(name: string): T | undefined {
    return this.assets.get(name) as T | undefined
  }

  /**
   * Return every asset in the pack that is an instance of `cls`.
   *
   * @param cls - Class to filter by.
   * @returns All matching assets.
   */
  getAll<T extends Asset>(cls: AssetClass<T>): T[] {
    const result: T[] = []
    for (const asset of this.assets.values()) {
      if (asset instanceof cls) {
        result.push(asset as T)
      }
    }
    return result
  }

  /**
   * Check whether an asset with `name` exists in the pack.
   *
   * @param name - Asset name.
   * @returns `true` if present.
   */
  has(name: string): boolean {
    return this.assets.has(name)
  }

  /** Number of assets in the pack. */
  get size(): number {
    return this.assets.size
  }

  /**
   * List all asset names in the pack.
   *
   * @returns A new array of names.
   */
  names(): string[] {
    return [...this.assets.keys()]
  }
}
