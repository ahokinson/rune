[**rune**](README.md)

***

[rune](README.md) / Viewport3D

# Interface: Viewport3D

Defined in: geom/camera3d.ts:17

Where a 3D camera is drawing this frame, in screen cells. `radius` is the
world-unit -> cell scale on the horizontal axis; `aspectY` squashes the
vertical axis for non-square terminal cells (e.g. 0.5 for 2:1 cells). Mirrors
SphereView so the sphere consumer and the generic projectors share placement.

## Properties

### aspectY

```ts
aspectY: number;
```

Defined in: geom/camera3d.ts:21

***

### centerX

```ts
centerX: number;
```

Defined in: geom/camera3d.ts:18

***

### centerY

```ts
centerY: number;
```

Defined in: geom/camera3d.ts:19

***

### radius

```ts
radius: number;
```

Defined in: geom/camera3d.ts:20
