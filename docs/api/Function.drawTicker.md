[**rune**](README.md)

***

[rune](README.md) / drawTicker

# Function: drawTicker()

```ts
function drawTicker(
   canvas, 
   x, 
   y, 
   width, 
   text, 
   offset, 
   color, 
   bg?
): void;
```

Defined in: draw/widgets.ts:135

Draw a `width`-cell window onto an endlessly looping marquee string, scrolled
by `offset` characters — a news-style ticker. `text` should already include
its own separators so the wrap reads seamlessly.

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

### width

`number`

Visible window width in cells.

### text

`string`

Marquee string (looped).

### offset

`number`

Scroll offset in characters.

### color

[`Color`](Class.Color.md)

Glyph colour.

### bg?

[`Color`](Class.Color.md) = `BLACK`

Cell background (default black).

## Returns

`void`
