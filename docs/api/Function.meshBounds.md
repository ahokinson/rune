[**rune**](README.md)

***

[rune](README.md) / meshBounds

# Function: meshBounds()

```ts
function meshBounds(positions, outHalf): number;
```

Defined in: physics/collider.ts:123

Half-extents (into `outHalf`) and bounding radius of a vertex array, assuming
the mesh is centred on the origin (the loaders normalize it so).

## Parameters

### positions

`Float32Array`

Flat `[x, y, z, ...]` vertex buffer.

### outHalf

[`Vector3`](Class.Vector3.md)

Filled with the per-axis half-extents (floored at 0.5).

## Returns

`number`

The bounding radius (floored at 0.5).
