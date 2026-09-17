[**rune**](README.md)

***

[rune](README.md) / drawCircle

# Function: drawCircle()

```ts
function drawCircle(
   canvas, 
   centerX, 
   centerY, 
   radius, 
   character, 
   foreground?, 
   background?
): void;
```

Defined in: draw/shapes.ts:172

Draw a single-glyph circle outline using the midpoint algorithm.

## Parameters

### canvas

[`CanvasSurface`](Interface.CanvasSurface.md)

Target canvas.

### centerX

`number`

Circle centre X.

### centerY

`number`

Circle centre Y.

### radius

`number`

Radius in cells.

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
