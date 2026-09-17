[**rune**](README.md)

***

[rune](README.md) / parsePixelLegend

# Function: parsePixelLegend()

```ts
function parsePixelLegend(legend, base?): Record<string, Color | null>;
```

Defined in: assets/color.ts:43

Flatten a pixel legend into a character-to-color map, merging an optional
base legend first (skipping the reserved `extends` key). `null` entries are
preserved as `null` so callers can mark "no color for this character".

## Parameters

### legend

[`PixelLegendData`](TypeAlias.PixelLegendData.md)

The legend to parse.

### base?

[`PixelLegendData`](TypeAlias.PixelLegendData.md)

Optional base legend to inherit from.

## Returns

`Record`\<`string`, [`Color`](Class.Color.md) \| `null`\>

A flat character-to-`Color | null` map.
