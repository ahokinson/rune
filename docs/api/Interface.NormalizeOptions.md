[**rune**](README.md)

***

[rune](README.md) / NormalizeOptions

# Interface: NormalizeOptions

Defined in: geom/obj.ts:99

Options for [normalizeMesh](Function.normalizeMesh.md).

## Properties

### axisMap?

```ts
optional axisMap?: (x, y, z) => [number, number, number];
```

Defined in: geom/obj.ts:103

Remap axes per vertex, e.g. to turn a Z-up model Y-up. Returns `[x, y, z]`.

#### Parameters

##### x

`number`

##### y

`number`

##### z

`number`

#### Returns

\[`number`, `number`, `number`\]

***

### size?

```ts
optional size?: number;
```

Defined in: geom/obj.ts:101

Largest bounding-box extent after scaling (mesh is recentred on the origin).
