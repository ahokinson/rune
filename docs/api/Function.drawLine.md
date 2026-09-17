[**rune**](README.md)

***

[rune](README.md) / drawLine

# Function: drawLine()

```ts
function drawLine(
   canvas, 
   startX, 
   startY, 
   endX, 
   endY, 
   character, 
   foreground?, 
   background?
): void;
```

Defined in: draw/shapes.ts:24

Draw a single-glyph line between two points using Bresenham's algorithm.

## Parameters

### canvas

[`CanvasSurface`](Interface.CanvasSurface.md)

Target canvas.

### startX

`number`

Start X (rounded to the nearest cell).

### startY

`number`

Start Y (rounded to the nearest cell).

### endX

`number`

End X (rounded to the nearest cell).

### endY

`number`

End Y (rounded to the nearest cell).

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
