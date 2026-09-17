[**rune**](README.md)

***

[rune](README.md) / drawTransition

# Function: drawTransition()

```ts
function drawTransition(canvas, options): void;
```

Defined in: scene/transition.ts:55

Paint the transition overlay over the whole canvas for the given `coverage`.
`coverage` 0 draws nothing; 1 fills every cell with `color`; in between, a
dither fade stipples cells in and a wipe advances a solid edge. Cell-only, so it
composites over whatever the scene already drew.

## Parameters

### canvas

[`CanvasSurface`](Interface.CanvasSurface.md)

Target canvas.

### options

[`TransitionDrawOptions`](Interface.TransitionDrawOptions.md)

Pattern, coverage, and colour.

## Returns

`void`
