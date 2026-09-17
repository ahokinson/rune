[**rune**](README.md)

***

[rune](README.md) / Mesh

# Interface: Mesh

Defined in: draw/mesh/rasterizer.ts:23

An indexed triangle mesh in flat typed arrays. `positions` and `normals` hold
3 numbers per vertex, `uvs` 2, and `indices` 3 per triangle. `normals`/`uvs`
are optional: with no normals each face is flat-shaded from its geometric
normal; with no uvs texture coordinates read as (0, 0).

## Properties

### indices

```ts
indices: Uint32Array;
```

Defined in: draw/mesh/rasterizer.ts:25

***

### normals?

```ts
optional normals?: Float32Array<ArrayBufferLike>;
```

Defined in: draw/mesh/rasterizer.ts:27

***

### positions

```ts
positions: Float32Array;
```

Defined in: draw/mesh/rasterizer.ts:24

***

### uvs?

```ts
optional uvs?: Float32Array<ArrayBufferLike>;
```

Defined in: draw/mesh/rasterizer.ts:26
