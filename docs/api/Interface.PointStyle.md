[**rune**](README.md)

***

[rune](README.md) / PointStyle

# Interface: PointStyle

Defined in: geom/geometry3d.ts:28

Per-point draw callback — the game keeps full control of glyph/colour. Only
called for points that pass projection, the near cull, and (when occluding)
the depth test.

## Methods

### draw()

```ts
draw(
   canvas, 
   x, 
   y, 
   depth, 
   index
): void;
```

Defined in: geom/geometry3d.ts:29

#### Parameters

##### canvas

[`CanvasSurface`](Interface.CanvasSurface.md)

##### x

`number`

##### y

`number`

##### depth

`number`

##### index

`number`

#### Returns

`void`
