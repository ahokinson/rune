[**rune**](README.md)

***

[rune](README.md) / WaveCollapseResult

# Interface: WaveCollapseResult

Defined in: worldgen/waveCollapse.ts:57

Result of [generateWaveCollapse](Function.generateWaveCollapse.md).

## Properties

### map

```ts
map: TileMap<number>;
```

Defined in: worldgen/waveCollapse.ts:61

Tile index per cell. On failure every cell is the contradiction marker -1.

***

### success

```ts
success: boolean;
```

Defined in: worldgen/waveCollapse.ts:63

`false` if every attempt hit an unresolvable contradiction.
