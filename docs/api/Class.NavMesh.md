[**rune**](README.md)

***

[rune](README.md) / NavMesh

# Class: NavMesh

Defined in: ai/navmesh.ts:58

Polygon navigation mesh supporting funnel-string-pulled paths between any two
walkable points.

## Constructors

### Constructor

```ts
new NavMesh(polygons): NavMesh;
```

Defined in: ai/navmesh.ts:67

#### Parameters

##### polygons

[`NavPolygon`](TypeAlias.NavPolygon.md)[]

Convex polygons tiling the walkable area.

#### Returns

`NavMesh`

## Methods

### findPath()

```ts
findPath(start, goal): Vector2[] | null;
```

Defined in: ai/navmesh.ts:226

Find a smooth path from `start` to `goal`, or null if either lies outside the
mesh or no polygon route connects them.

#### Parameters

##### start

[`Vector2`](Class.Vector2.md)

Walkable start point.

##### goal

[`Vector2`](Class.Vector2.md)

Walkable goal point.

#### Returns

[`Vector2`](Class.Vector2.md)[] \| `null`

Waypoint list with `start` and `goal` at the ends, or `null` if unreachable.
