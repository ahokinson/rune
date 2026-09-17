[**rune**](README.md)

***

[rune](README.md) / drawSprite

# Function: drawSprite()

```ts
function drawSprite(
   canvas, 
   sprite, 
   x, 
   y, 
   camera?
): void;
```

Defined in: draw/sprite.ts:185

Blit a [Sprite](Class.Sprite.md) onto `canvas` at `(x, y)`, optionally transformed by a
camera. Transparent cells are skipped.

## Parameters

### canvas

[`CanvasSurface`](Interface.CanvasSurface.md)

Target canvas.

### sprite

[`Sprite`](Class.Sprite.md)

Sprite to draw.

### x

`number`

World X (or screen X if no camera).

### y

`number`

World Y (or screen Y if no camera).

### camera?

[`Camera`](Class.Camera.md)

Optional camera to project `(x, y)` through.

## Returns

`void`
