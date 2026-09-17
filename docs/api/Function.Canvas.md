[**rune**](README.md)

***

[rune](README.md) / Canvas

# Function: Canvas()

```ts
function Canvas(props): any;
```

Defined in: Canvas.tsx:333

Mounts a cell-based canvas: creates a `FrameBufferRenderable`, wraps it in a
frame-diffing FrameDiffCanvas, forwards mouse events to the
application's mouse state, and provides the surface via [CanvasContext](Variable.CanvasContext.md).
Tears down the renderable on cleanup.

## Parameters

### props

[`CanvasProps`](Interface.CanvasProps.md)

Component properties.

## Returns

`any`

The Solid element tree rooted at the canvas context provider.
