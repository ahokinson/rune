[**rune**](README.md)

***

[rune](README.md) / resolveAnchor

# Function: resolveAnchor()

```ts
function resolveAnchor(
   canvasWidth, 
   canvasHeight, 
   options
): Rectangle;
```

Defined in: draw/layout.ts:89

Resolve the screen-space [Rectangle](Class.Rectangle.md) for a `width`×`height` box anchored
inside a `canvasWidth`×`canvasHeight` grid. Left/right anchors inset by
`marginX`, top/bottom anchors by `marginY`; centred axes ignore the margin. The
origin is rounded to whole cells and clamped so the box never starts off the
left/top edge (it may still overflow right/bottom if larger than the canvas).

## Parameters

### canvasWidth

`number`

Grid width in cells.

### canvasHeight

`number`

Grid height in cells.

### options

[`AnchorOptions`](Interface.AnchorOptions.md)

Anchor, size, and margins.

## Returns

[`Rectangle`](Class.Rectangle.md)

The placed rectangle.
