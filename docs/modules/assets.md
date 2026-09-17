# assets

YAML-backed asset loading: an [`AssetPack`](../api/Class.AssetPack.md) mounts a directory of authored assets, parses each through a class-declared schema of [`Slot`](../api/Interface.Slot.md)s, and resolves inter-asset [`Ref`](../api/Class.Ref.md)s. This is the two-phase pipeline that turns authored YAML into typed, ref-resolved runtime objects.

## Overview

An [`Asset`](../api/Class.Asset.md) is the base class for every pack-resolved resource — sprites, tile maps, themes, anything your game authors in YAML. An [`AssetPack`](../api/Class.AssetPack.md) is constructed by the static `mount` / `mountAsync` factory (you don't call `new`), which reads the directory's `manifest.yaml` and parses only the listed assets, then exposes lookups by name: `get` (throws) / `tryGet` (`undefined`) / `getAll` (every asset of a class). Each asset class declares its schema with [`Slot`](../api/Interface.Slot.md) functions — the YAML → typed-value adapters — and a `finalize()` hook that runs after resolution (e.g. to bake a sprite or build a tile map).

The pipeline is deliberately two-phase so assets can reference each other freely without load-order constraints. **Phase 1 parse**: each YAML document is parsed into typed data via the schema's slots. **Phase 2 resolve + finalize**: cross-document [`Ref`](../api/Class.Ref.md)s are resolved to their target assets ([`RefResolveContext`](../api/Interface.RefResolveContext.md)), then each asset's `finalize()` runs. Built-in slots cover the common cases — [`data`](../api/Function.data.md) (passthrough), [`pixelSprite`](../api/Variable.pixelSprite.md) / [`terminalSprite`](../api/Variable.terminalSprite.md) (standalone sprites), [`pixelSpriteAnimation`](../api/Function.pixelSpriteAnimation.md) / [`terminalSpriteAnimation`](../api/Function.terminalSpriteAnimation.md) (clips), and [`ref`](../api/Function.ref.md) (a lazy pointer to another asset). Two asset classes ship: [`PixelSpriteAsset`](../api/Class.PixelSpriteAsset.md) and [`TerminalSpriteAsset`](../api/Class.TerminalSpriteAsset.md) (half-block vs. cell-grid sprites resolved against named legends); [`TileMapAsset`](../api/Class.TileMapAsset.md) brings authored tile maps into the same pack system. (`assets/index.ts` is the internal barrel re-exporting this surface.)

## Files

| File | Exports | Purpose |
| --- | --- | --- |
| `pack.ts` | [`AssetPack`](../api/Class.AssetPack.md) | Mounted directory of assets, keyed by name. |
| `asset.ts` | [`Asset`](../api/Class.Asset.md), [`AssetClass`](../api/Interface.AssetClass.md), [`AssetSchema`](../api/TypeAlias.AssetSchema.md), [`AssetOptions`](../api/Interface.AssetOptions.md) | Base class + schema/constructor types. |
| `slot.ts` | [`Slot`](../api/Interface.Slot.md), [`ParseContext`](../api/Interface.ParseContext.md), [`data`](../api/Function.data.md), [`ref`](../api/Function.ref.md), [`pixelSprite`](../api/Variable.pixelSprite.md), [`terminalSprite`](../api/Variable.terminalSprite.md), [`pixelSpriteAnimation`](../api/Function.pixelSpriteAnimation.md), [`terminalSpriteAnimation`](../api/Function.terminalSpriteAnimation.md) | Schema field parsers (slots). |
| `ref.ts` | [`Ref`](../api/Class.Ref.md), [`isRef`](../api/Function.isRef.md), [`RefResolveContext`](../api/Interface.RefResolveContext.md) | Lazy inter-asset reference. |
| `pixelSprite.ts` | [`PixelSpriteAsset`](../api/Class.PixelSpriteAsset.md), [`parsePixelSprite`](../api/Function.parsePixelSprite.md) | Pixel-sprite asset + art parser. |
| `sprite.ts` | [`TerminalSpriteAsset`](../api/Class.TerminalSpriteAsset.md), [`parseSprite`](../api/Function.parseSprite.md), [`parseTerminalLegend`](../api/Function.parseTerminalLegend.md) | Terminal-sprite asset + art/legend parsers. |
| `animatedSprite.ts` | [`parseAnimatedSprite`](../api/Function.parseAnimatedSprite.md) | Build an [`AnimatedSprite`](../api/Class.AnimatedSprite.md) from a clip map. |
| `tileMap.ts` | [`TileMapAsset`](../api/Class.TileMapAsset.md) | Authored tile map as a pack asset. |
| `color.ts` | [`parseColor`](../api/Function.parseColor.md), [`parsePixelLegend`](../api/Function.parsePixelLegend.md), [`resolvePixelLegends`](../api/Function.resolvePixelLegends.md) | Color/legend parsing. |
| `load.ts` | [`loadYaml`](../api/Function.loadYaml.md), [`loadYamlSync`](../api/Function.loadYamlSync.md) | Thin `Bun.YAML.parse` wrappers. |
| `types.ts` | [`ColorData`](../api/TypeAlias.ColorData.md), [`PixelLegendData`](../api/TypeAlias.PixelLegendData.md), [`TerminalLegendData`](../api/TypeAlias.TerminalLegendData.md), [`SpriteAssetData`](../api/TypeAlias.SpriteAssetData.md), … | Authored YAML data shapes. |

## Key types

### Pack & asset base
- [`AssetPack`](../api/Class.AssetPack.md) — Mounted directory of assets; static `mount(dir, types)` (sync) / `mountAsync(dir, types)` (async); `get<T>(name)` / `tryGet<T>(name)` / `getAll<T>(AssetClass)`.
- [`Asset`](../api/Class.Asset.md) — Base class for all pack-resolved assets; declare a static `schema` and a `finalize()` hook.
- [`AssetClass`](../api/Interface.AssetClass.md) — Constructor type for an `Asset` subclass.
- [`AssetSchema`](../api/TypeAlias.AssetSchema.md) — Read-only mapping of field name to [`Slot`](../api/Interface.Slot.md).
- [`AssetOptions`](../api/Interface.AssetOptions.md) — Options passed to an `Asset` constructor.

### Slots & refs
- [`Slot`](../api/Interface.Slot.md) — A parser for one field of an asset's schema.
- [`data`](../api/Function.data.md) — Slot returning raw data, optionally projected through `pick`.
- [`ref`](../api/Function.ref.md) — Slot parsing a [`Ref`](../api/Class.Ref.md) to another asset by name; the target class is the `Ref<T>` type you declare on the field.
- [`pixelSprite`](../api/Variable.pixelSprite.md) / [`terminalSprite`](../api/Variable.terminalSprite.md) — Slots parsing standalone sprites.
- [`pixelSpriteAnimation`](../api/Function.pixelSpriteAnimation.md) / [`terminalSpriteAnimation`](../api/Function.terminalSpriteAnimation.md) — Slots parsing sprite-animation clips.
- [`Ref`](../api/Class.Ref.md) — Lazy pointer to another asset, resolved in phase 2.
- [`isRef`](../api/Function.isRef.md) — Type guard for `Ref` instances.
- [`RefResolveContext`](../api/Interface.RefResolveContext.md) — Context that looks up an asset by name during resolution.
- [`ParseContext`](../api/Interface.ParseContext.md) — Context passed to a slot's `parse`, identifying the field.

### Sprite assets & parsers
- [`PixelSpriteAsset`](../api/Class.PixelSpriteAsset.md) — One or more pixel sprites resolved against named pixel legends.
- [`TerminalSpriteAsset`](../api/Class.TerminalSpriteAsset.md) — One or more terminal sprites resolved against character legends.
- [`TileMapAsset`](../api/Class.TileMapAsset.md) — Authored tile map loaded through the pack system.
- [`parsePixelSprite`](../api/Function.parsePixelSprite.md) / [`parseSprite`](../api/Function.parseSprite.md) — Art-string → sprite parsers.
- [`parseAnimatedSprite`](../api/Function.parseAnimatedSprite.md) — Build an [`AnimatedSprite`](../api/Class.AnimatedSprite.md) from a clip map + initial clip.
- [`parseTerminalLegend`](../api/Function.parseTerminalLegend.md) — Terminal legend → character-to-entry map.

### Colors, legends & YAML
- [`parseColor`](../api/Function.parseColor.md) — Parse a hex string or RGB/RGBA tuple into a [`Color`](../api/Class.Color.md).
- [`parsePixelLegend`](../api/Function.parsePixelLegend.md) / [`resolvePixelLegends`](../api/Function.resolvePixelLegends.md) — Flatten / resolve pixel legends (following `extends` chains).
- [`loadYaml`](../api/Function.loadYaml.md) / [`loadYamlSync`](../api/Function.loadYamlSync.md) — Read + parse a YAML file (the pack does this for you).
- [`ColorData`](../api/TypeAlias.ColorData.md) / [`PixelLegendData`](../api/TypeAlias.PixelLegendData.md) / [`TerminalLegendData`](../api/TypeAlias.TerminalLegendData.md) / [`SpriteAssetData`](../api/TypeAlias.SpriteAssetData.md) — Authored YAML data shapes.

## Usage

```ts
import { AssetPack, Ref, ref, data, type Asset } from "@ahokinson/rune"

class WeaponAsset extends Asset {
  static schema = {
    name: data<string>(),
    damage: data<number>(),
    sprite: ref<SpriteAsset>(), // a Ref, resolved in phase 2
  }
  name!: string
  damage!: number
  sprite!: Ref<SpriteAsset>
  override finalize() {
    const s = this.sprite.target // the resolved SpriteAsset
  }
}

const pack = AssetPack.mount("assets", { weapon: WeaponAsset, sprite: SpriteAsset })

const pistol = pack.get<WeaponAsset>("pistol")
console.log(pistol.name, pistol.damage)
```

## See also

- [Assets](../concepts/assets.md) — the two-phase parse, slots, refs, colors and legends.
- [world](world.md) — [`TileMapAsset`](../api/Class.TileMapAsset.md) delegates to [`buildTileMap`](../api/Function.buildTileMap.md); the standalone [`loadTileMap`](../api/Function.loadTileMap.md) for the pack-free path.
- [draw](draw.md) — [`Sprite`](../api/Class.Sprite.md) / [`PixelSprite`](../api/Class.PixelSprite.md) / [`AnimatedSprite`](../api/Class.AnimatedSprite.md) that assets resolve into.
- [Inspection](../concepts/inspection.md) — `rune preview` scans asset YAML via [`loadYamlSync`](../api/Function.loadYamlSync.md).
