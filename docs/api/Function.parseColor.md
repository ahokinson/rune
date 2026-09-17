[**rune**](README.md)

***

[rune](README.md) / parseColor

# Function: parseColor()

```ts
function parseColor(data): Color;
```

Defined in: assets/color.ts:23

Parse an authored color into a [Color](Class.Color.md).

Accepts a CSS hex string (`"#rrggbb"` / `"#rrggbbaa"`) or an
`[r, g, b]` / `[r, g, b, a]` byte tuple.

## Parameters

### data

[`ColorData`](TypeAlias.ColorData.md)

The raw color value.

## Returns

[`Color`](Class.Color.md)

A new [Color](Class.Color.md).
