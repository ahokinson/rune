[**rune**](README.md)

***

[rune](README.md) / drawPixelBillboard

# Function: drawPixelBillboard()

```ts
function drawPixelBillboard(
   canvas, 
   depthBuffer, 
   camera, 
   worldPosition, 
   sprite, 
   options?
): void;
```

Defined in: draw/raycast/pixelBillboard.ts:68

Draw a billboarded [PixelSprite](Class.PixelSprite.md) at `worldPosition` into `canvas`,
occluded by `depthBuffer`. Each terminal cell covers two sprite half-rows; the
covered pixels are averaged into upper/lower colours and emitted via the ▀/▄
half blocks. Each covered cell is depth-tested against the column and per-cell
buffers.

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

Sprite anchor in world cells.

#### x

`number`

#### y

`number`

### sprite

[`PixelSprite`](Class.PixelSprite.md)

Pixel sprite to draw.

### options?

[`DrawPixelBillboardOptions`](Interface.DrawPixelBillboardOptions.md) = `{}`

Offset and scale; see [DrawPixelBillboardOptions](Interface.DrawPixelBillboardOptions.md).

## Returns

`void`
