# Assets

Rune's asset system loads authored YAML into typed, ref-resolved objects via an [`AssetPack`](../api/Class.AssetPack.md). It's a two-phase pipeline: parse each document into typed data, then resolve cross-document references and finalize.

## `AssetPack`

An `AssetPack` mounts a directory of YAML assets and lets you query them by name. It's constructed by the static `mount` (sync) or `mountAsync` (async) factory; you don't call `new` yourself.

```ts
import { AssetPack } from "@ahokinson/rune"
import { EnemyAsset, PickupAsset, LevelAsset } from "./assets"  // your asset classes

// Sync — reads manifest.yaml and every asset file synchronously.
const pack = AssetPack.mount("assets", {
  enemy: EnemyAsset,
  pickup: PickupAsset,
  level: LevelAsset,
})

// Or async — same pipeline, non-blocking I/O. Prefer this for larger packs.
// const pack = await AssetPack.mountAsync("assets", { enemy: EnemyAsset, … })

const enemy = pack.get<EnemyAsset>("imp")           // throws if missing
const maybePickup = pack.tryGet<PickupAsset>("health") // undefined if missing
const allLevels = pack.getAll(LevelAsset)            // every asset of a class
```

### `mount(dir, types)` / `mountAsync(dir, types)`

Mounts a directory (static). The directory must contain a `manifest.yaml` listing the assets to load — `mount` reads only `manifest.assets`, there is no per-class subdirectory scan. Each `types` entry maps the YAML `type` field to an [`Asset`](../api/Class.Asset.md) subclass that knows how to parse its schema. `mountAsync` is the non-blocking counterpart: it reads every asset file concurrently, then parses/resolve/finalizes in the same order.

### Querying

- `pack.get<T>(name)` — returns the asset, throws if missing (`T` is the asset class).
- `pack.tryGet<T>(name)` — returns the asset or `undefined`.
- `pack.getAll<T>(AssetClass)` — returns every loaded asset of that type.

## The two-phase parse

1. **Parse**: each YAML document is parsed into typed data via the asset class's schema (declared with `slot` functions). Raw strings/arrays become typed values.
2. **Resolve + finalize**: cross-document [`Ref`](../api/Class.Ref.md)s are resolved to their target assets, then each asset's `finalize()` runs (e.g. to bake a sprite or build a tile map).

This split lets assets reference each other freely without load-order constraints.

## Slots

[`Slot`](../api/Interface.Slot.md) functions are the schema field parsers — the YAML → typed-value adapters. They live in `assets/slot.ts`:

| Slot | Parses a YAML field into |
| --- | --- |
| `data<T>()` | A raw value passthrough. |
| `pixelSprite()` | A [`PixelSprite`](../api/Class.PixelSprite.md) (half-block pixel art). |
| `pixelSpriteAnimation()` | An [`AnimatedSprite`](../api/Class.AnimatedSprite.md) of pixel-sprite clips. |
| `terminalSprite()` | A [`Sprite`](../api/Class.Sprite.md) (cell-grid sprite). |
| `terminalSpriteAnimation()` | An [`AnimatedSprite`](../api/Class.AnimatedSprite.md) of terminal-sprite clips. |
| `ref<T>()` | A [`Ref`](../api/Class.Ref.md) to another asset, resolved in phase 2. The target class is the `Ref<T>` type you declare on the field. |

An asset class declares its schema with these in a static `schema` field. See `examples/tomb/assets/` for a full example.

## Refs

A [`Ref`](../api/Class.Ref.md) is a lazy reference to another asset. It's resolved during phase 2, after all documents are parsed.

```yaml
# weapons/pistol.yaml
type: weapon
name: pistol
sprite: bullet   # the target asset's name; resolved to a SpriteAsset in phase 2
```

In code:

```ts
class WeaponAsset extends Asset {
  static schema = {
    sprite: ref<SpriteAsset>(),
  }
  sprite!: Ref<SpriteAsset>
}

const pack = AssetPack.mount("assets", { weapon: WeaponAsset, sprite: SpriteAsset })
const weapon = pack.get<WeaponAsset>("pistol")
const sprite = weapon.sprite.target  // the resolved SpriteAsset — resolve() runs during mount
```

## Colors and legends

Asset YAML uses a compact color/legend syntax. [`parseColor`](../api/Function.parseColor.md) accepts hex (`"#ff0000"`) or `[r, g, b, a]` arrays. [`parsePixelLegend`](../api/Function.parsePixelLegend.md) / [`parseTerminalLegend`](../api/Function.parseTerminalLegend.md) map single-char glyphs to colors in a sprite's art block.

See `examples/tomb/assets/` and `examples/overworld/assets/` for full manifest + legend examples.

## Loading YAML

[`loadYaml`](../api/Function.loadYaml.md) / [`loadYamlSync`](../api/Function.loadYamlSync.md) are thin wrappers over `Bun.YAML.parse`:

```ts
import { loadYamlSync } from "@ahokinson/rune"

const doc = loadYamlSync("assets/levels/level-1.yaml")
```

You usually don't call these directly — `AssetPack` does. But `rune preview`'s scanner uses `loadYamlSync` to read asset metadata without loading the full asset pack.

## Tile maps as assets

A [`TileMapAsset`](../api/Class.TileMapAsset.md) loads an authored [`TileMapDocument`](../api/Interface.TileMapDocument.md) (legend + markers + ASCII layout) through the asset pack system. For the simpler, pack-free path, use [`loadTileMap`](../api/Function.loadTileMap.md) directly:

```ts
import { loadTileMap } from "@ahokinson/rune"

const level = loadTileMap<Cell>("assets/world-1-1.yaml", { /* options */ })
```

See `examples/overworld/level.ts` for the pack-free path and `examples/tomb/assets/level.ts` for the asset-pack path.

## See also

- [`AssetPack` class](../api/Class.AssetPack.md)
- [`Asset` class](../api/Class.Asset.md)
- [`Ref` class](../api/Class.Ref.md)
- [slot functions](../modules/assets.md)
- [`loadTileMap` function](../api/Function.loadTileMap.md)
- [`TileMapAsset` class](../api/Class.TileMapAsset.md)
- [the assets module](../modules/assets.md)
