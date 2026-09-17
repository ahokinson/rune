[**rune**](README.md)

***

[rune](README.md) / drawRectangle

# Function: drawRectangle()

```ts
function drawRectangle(
   canvas, 
   x, 
   y, 
   width, 
   height, 
   character, 
   foreground?, 
   background?
): void;
```

Defined in: draw/shapes.ts:72

Draw a single-glyph rectangle outline.

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

Rectangle width in cells.

### height

`number`

Rectangle height in cells.

### character

`string`

Glyph to plot.

### foreground?

[`Color`](Class.Color.md)

Glyph colour (optional).

### background?

[`Color`](Class.Color.md)

Cell background (optional).

## Returns

`void`
