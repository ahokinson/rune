[**rune**](README.md)

***

[rune](README.md) / rasterizeBrailleCell

# Function: rasterizeBrailleCell()

```ts
function rasterizeBrailleCell(
   cx, 
   cy, 
   sample
): number;
```

Defined in: draw/braille.ts:43

Rasterize one cell by sampling its 8 sub-pixels. `sample` is called with the
sub-pixel's centre in cell-space (e.g. cx + 0.25 ... cx + 0.75 horizontally)
and its dot bit; return true to light the dot. The caller can accumulate its
own per-sample state (lighting, depth, ...) inside `sample`.

## Parameters

### cx

`number`

Cell X coordinate.

### cy

`number`

Cell Y coordinate.

### sample

(`sampleX`, `sampleY`, `bit`) => `boolean`

Predicate called per sub-pixel with its centre and dot bit; return `true` to light it.

## Returns

`number`

The accumulated dot mask — pass to [brailleGlyph](Function.brailleGlyph.md).
