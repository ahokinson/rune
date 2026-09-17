[**rune**](README.md)

***

[rune](README.md) / drawBillboard

# Function: drawBillboard()

```ts
function drawBillboard(
   canvas, 
   depthBuffer, 
   camera, 
   worldPosition, 
   sprite, 
   options?
): void;
```

Defined in: draw/raycast/billboard.ts:37

Draw a billboarded [Sprite](Class.Sprite.md) at `worldPosition` into `canvas`, occluded by
`depthBuffer`. The sprite faces the camera and is scaled by perspective; each
covered cell is depth-tested against the column and per-cell buffers.

## Parameters

### canvas

[`CanvasSurface`](Interface.CanvasSurface.md)

Target canvas.

### depthBuffer

[`ColumnDepthBuffer`](Class.ColumnDepthBuffer.md)

Raycast depth buffer for occlusion.

### camera

[`Camera`](Class.Camera.md)

View camera (must use a [RaycastProjection](Class.RaycastProjection.md)).

### worldPosition

[`Vector2`](Class.Vector2.md)

Sprite anchor in world cells.

### sprite

[`Sprite`](Class.Sprite.md)

Sprite to draw.

### options?

[`DrawBillboardOptions`](Interface.DrawBillboardOptions.md) = `{}`

Offset and scale; see [DrawBillboardOptions](Interface.DrawBillboardOptions.md).

## Returns

`void`
