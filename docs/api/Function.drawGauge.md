[**rune**](README.md)

***

[rune](README.md) / drawGauge

# Function: drawGauge()

```ts
function drawGauge(
   canvas, 
   x, 
   y, 
   cells, 
   frac, 
   fillCol, 
   trackCol, 
   bg?
): number;
```

Defined in: draw/widgets.ts:238

Draw a segmented gauge meter: `[████████░░]` with `cells` inner segments.
Filled segments use `fillCol`, the remainder `trackCol`. Returns the x just
past the closing bracket so callers can place a label after it.

## Parameters

### canvas

[`CanvasSurface`](Interface.CanvasSurface.md)

Target canvas.

### x

`number`

Left column (opening bracket).

### y

`number`

Row.

### cells

`number`

Number of inner segments.

### frac

`number`

Fill fraction (clamped 0..1).

### fillCol

[`Color`](Class.Color.md)

Filled-segment colour.

### trackCol

[`Color`](Class.Color.md)

Empty-segment and bracket colour.

### bg?

[`Color`](Class.Color.md) = `BLACK`

Cell background (default black).

## Returns

`number`

The x column just past the closing bracket.
