[**rune**](README.md)

***

[rune](README.md) / MeshEntity3DOptions

# Interface: MeshEntity3DOptions

Defined in: scene/meshEntity3d.ts:15

Options for constructing a [MeshEntity3D](Class.MeshEntity3D.md).

## Extends

- [`Entity3DOptions`](Interface.Entity3DOptions.md)

## Properties

### cullBackface?

```ts
optional cullBackface?: boolean;
```

Defined in: scene/meshEntity3d.ts:23

Cull triangles facing away from the camera. Default `true`.

***

### enabled?

```ts
optional enabled?: boolean;
```

Defined in: scene/entity.ts:24

Whether the entity (and its subtree) is updated each tick. Default `true`.

#### Inherited from

[`Entity3DOptions`](Interface.Entity3DOptions.md).[`enabled`](Interface.Entity3DOptions.md#enabled)

***

### frameRadius?

```ts
optional frameRadius?: number;
```

Defined in: scene/meshEntity3d.ts:30

Projection radius as a fraction of the smaller target dimension. Default
`0.5` (the mesh fills the view, matching the standalone teapot framing).

***

### mesh

```ts
mesh: Mesh;
```

Defined in: scene/meshEntity3d.ts:17

Indexed triangle mesh to draw.

***

### near?

```ts
optional near?: number;
```

Defined in: scene/meshEntity3d.ts:25

View-space near plane. Default renderMesh's `0.05`.

***

### position?

```ts
optional position?: Vector3;
```

Defined in: scene/entity3d.ts:48

World-space position. Default `(0, 0, 0)`.

#### Inherited from

[`Entity3DOptions`](Interface.Entity3DOptions.md).[`position`](Interface.Entity3DOptions.md#position)

***

### rotation?

```ts
optional rotation?: Quaternion;
```

Defined in: scene/entity3d.ts:50

Quaternion rotation. Default identity.

#### Inherited from

[`Entity3DOptions`](Interface.Entity3DOptions.md).[`rotation`](Interface.Entity3DOptions.md#rotation)

***

### scale?

```ts
optional scale?: Vector3;
```

Defined in: scene/entity3d.ts:52

Per-axis scale. Default `(1, 1, 1)`.

#### Inherited from

[`Entity3DOptions`](Interface.Entity3DOptions.md).[`scale`](Interface.Entity3DOptions.md#scale)

***

### shader

```ts
shader: MeshShader;
```

Defined in: scene/meshEntity3d.ts:19

Shader used to colour each fragment.

***

### visible?

```ts
optional visible?: boolean;
```

Defined in: scene/entity.ts:26

Whether the entity (and its subtree) is drawn. Default `true`.

#### Inherited from

[`Entity3DOptions`](Interface.Entity3DOptions.md).[`visible`](Interface.Entity3DOptions.md#visible)

***

### wireframe?

```ts
optional wireframe?: boolean;
```

Defined in: scene/meshEntity3d.ts:21

Draw triangle edges instead of filled faces. Default `false`.

***

### zIndex?

```ts
optional zIndex?: number;
```

Defined in: scene/entity.ts:22

Draw/update order among siblings (low first). Mutating this after attaching
requires [Entity.markSortDirty](Class.Entity.md#marksortdirty) on the parent (or scene) so the next
pass re-sorts. Default `0`.

#### Inherited from

[`Entity3DOptions`](Interface.Entity3DOptions.md).[`zIndex`](Interface.Entity3DOptions.md#zindex)
