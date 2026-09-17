[**rune**](README.md)

***

[rune](README.md) / drawBox

# Function: drawBox()

```ts
function drawBox(
   canvas, 
   x, 
   y, 
   width, 
   height, 
   style?, 
   foreground?, 
   background?
): void;
```

Defined in: draw/shapes.ts:135

Draw a bordered box using a named [BoxStyleName](TypeAlias.BoxStyleName.md) glyph set. Does
nothing if `width` or `height` is less than 2.

## Parameters

### canvas

[`CanvasSurface`](Interface.CanvasSurface.md)

Target canvas.

### x

`number`

Left column.

### y

`number`

Top row.

### width

`number`

Box width in cells.

### height

`number`

Box height in cells.

### style?

`"ascii"` \| `"single"` \| `"double"` \| `"rounded"` \| `"heavy"`

Glyph set name (default `single`).

### foreground?

[`Color`](Class.Color.md)

Glyph colour (optional).

### background?

[`Color`](Class.Color.md)

Cell background (optional).

## Returns

`void`
