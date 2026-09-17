[**rune**](README.md)

***

[rune](README.md) / PixelLegendData

# Type Alias: PixelLegendData

```ts
type PixelLegendData = Record<string, ColorData | null> & object;
```

Defined in: assets/types.ts:19

Pixel legend data: a character-to-color map with optional `extends` for
inheritance from another named legend. `null` colors mean "no fill".

## Type Declaration

### extends?

```ts
optional extends?: string;
```
