[**rune**](README.md)

***

[rune](README.md) / drawSparkline

# Function: drawSparkline()

```ts
function drawSparkline(
   canvas, 
   x, 
   y, 
   samples, 
   maxVal, 
   color, 
   bg?
): void;
```

Defined in: draw/widgets.ts:206

Draw a sparkline of a numeric series, one column per sample (oldest left,
newest right), scaled to `maxVal`. Empty/zero samples render as a faint
baseline so the strip keeps a constant footprint.

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

### samples

`number`[]

Sample values (oldest first).

### maxVal

`number`

Value mapped to the tallest glyph.

### color

[`Color`](Class.Color.md)

Glyph colour.

### bg?

[`Color`](Class.Color.md) = `BLACK`

Cell background (default black).

## Returns

`void`
