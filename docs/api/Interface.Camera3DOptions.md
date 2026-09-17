[**rune**](README.md)

***

[rune](README.md) / Camera3DOptions

# Interface: Camera3DOptions

Defined in: geom/camera3d.ts:71

Options for constructing a [Camera3D](Class.Camera3D.md).

## Properties

### forward?

```ts
optional forward?: Vector3;
```

Defined in: geom/camera3d.ts:79

Orientation as a forward look direction + an up hint; the right axis and a
re-orthogonalised up are derived per projection. Both default to looking
down -z (toward the origin from +z), matching the sphere camera.

***

### position?

```ts
optional position?: Vector3;
```

Defined in: geom/camera3d.ts:73

Camera position in world space (default `(0, 0, 1)`).

***

### projector?

```ts
optional projector?: Projector3D;
```

Defined in: geom/camera3d.ts:83

Pluggable projector; `null` means projection calls return `null`.

***

### up?

```ts
optional up?: Vector3;
```

Defined in: geom/camera3d.ts:81

Up hint used to derive the camera's right axis (default screen-up).
