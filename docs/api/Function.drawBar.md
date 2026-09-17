[**rune**](README.md)

***

[rune](README.md) / drawBar

# Function: drawBar()

```ts
function drawBar(
   canvas, 
   x, 
   y, 
   cells, 
   frac, 
   color, 
   trackCol, 
   bg?, 
   fillChar?
): void;
```

Defined in: draw/widgets.ts:168

Draw a horizontal magnitude bar `cells` wide. `frac` (clamped 0..1) fills
`fillChar` (default `█`; pass `▓` for a softer ramp look) left-to-right with an
eighth-accurate end cell; the remainder is `░` in `trackCol` over `bg` so the
bar's full extent still reads when nearly empty.

## Parameters

### canvas

[`CanvasSurface`](Interface.CanvasSurface.md)

Target canvas.

### x

`number`

Left column.

### y

`number`

Row.

### cells

`number`

Bar width in cells.

### frac

`number`

Fill fraction (clamped 0..1).

### color

[`Color`](Class.Color.md)

Fill colour.

### trackCol

[`Color`](Class.Color.md)

Empty-track colour.

### bg?

[`Color`](Class.Color.md) = `BLACK`

Cell background (default black).

### fillChar?

`string` = `"█"`

Fill glyph (default `█`).

## Returns

`void`
