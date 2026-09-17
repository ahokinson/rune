[**rune**](README.md)

***

[rune](README.md) / resolvePixelLegends

# Function: resolvePixelLegends()

```ts
function resolvePixelLegends(legends): Record<string, Record<string, Color | null>>;
```

Defined in: assets/color.ts:69

Resolve every legend in a map, following `extends` chains and detecting
cycles.

## Parameters

### legends

`Record`\<`string`, [`PixelLegendData`](TypeAlias.PixelLegendData.md)\>

Map of legend name to legend data.

## Returns

`Record`\<`string`, `Record`\<`string`, [`Color`](Class.Color.md) \| `null`\>\>

Map of legend name to flat character-to-`Color | null` map.
