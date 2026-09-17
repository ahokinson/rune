[**rune**](README.md)

***

[rune](README.md) / Particle3DStyle

# Interface: Particle3DStyle

Defined in: fx/particles3d.ts:34

Per-particle draw callback — the game keeps full control of glyph/colour, the
same split PointCloud3D/Polyline3D use. Only called for particles that pass
projection, the near cull, and (when occluding) the depth test. `lifeFraction`
runs 0 (just spawned) -> 1 (about to die) so the style can fade the trail.

## Methods

### draw()

```ts
draw(
   canvas, 
   x, 
   y, 
   depth, 
   lifeFraction, 
   color, 
   index
): void;
```

Defined in: fx/particles3d.ts:46

Render one visible particle.

#### Parameters

##### canvas

[`CanvasSurface`](Interface.CanvasSurface.md)

Target canvas.

##### x

`number`

Projected screen column.

##### y

`number`

Projected screen row.

##### depth

`number`

Projected depth (LARGER = NEARER).

##### lifeFraction

`number`

0 just spawned, 1 about to expire.

##### color

[`Color`](Class.Color.md)

Particle colour.

##### index

`number`

Index of this particle in the active list.

#### Returns

`void`
