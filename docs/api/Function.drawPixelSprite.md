[**rune**](README.md)

***

[rune](README.md) / drawPixelSprite

# Function: drawPixelSprite()

```ts
function drawPixelSprite(
   canvas, 
   sprite, 
   screenX, 
   screenY
): void;
```

Defined in: draw/pixelSprite.ts:119

Blit a PixelSprite straight onto a 2D canvas (no camera or projection). Two
stacked pixels share one terminal cell via the ▀/▄ half-blocks: the upper
pixel paints the foreground of "▀" and the lower pixel its background, so the
sprite renders at double vertical resolution. The 3D counterpart is
[drawPixelBillboard](Function.drawPixelBillboard.md).

`screenX`/`screenY` are the top-left terminal cell. A sprite `height` pixels
tall occupies `ceil(height / 2)` rows; transparent pixels are skipped, and a
cell whose pair is fully transparent is left untouched.

## Parameters

### canvas

[`CanvasSurface`](Interface.CanvasSurface.md)

Target canvas.

### sprite

[`PixelSprite`](Class.PixelSprite.md)

Sprite to draw.

### screenX

`number`

Leftmost terminal column.

### screenY

`number`

Top terminal row.

## Returns

`void`
