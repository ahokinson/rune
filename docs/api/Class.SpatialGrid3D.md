[**rune**](README.md)

***

[rune](README.md) / SpatialGrid3D

# Class: SpatialGrid3D\<T\>

Defined in: physics/spatialGrid3d.ts:30

A uniform 3D hash grid bucketing items of type `T` by an explicit [AABB3](Interface.AABB3.md).

## Type Parameters

### T

`T`

## Constructors

### Constructor

```ts
new SpatialGrid3D<T>(cellSize): SpatialGrid3D<T>;
```

Defined in: physics/spatialGrid3d.ts:38

#### Parameters

##### cellSize

`number`

Cell edge length; must be `> 0`.

#### Returns

`SpatialGrid3D`\<`T`\>

## Properties

### cellSize

```ts
readonly cellSize: number;
```

Defined in: physics/spatialGrid3d.ts:32

Edge length of one cubic cell.

## Methods

### clear()

```ts
clear(): void;
```

Defined in: physics/spatialGrid3d.ts:66

Drop every inserted item.

#### Returns

`void`

***

### insert()

```ts
insert(item, box): void;
```

Defined in: physics/spatialGrid3d.ts:76

File `item` under every cell its `box` overlaps.

#### Parameters

##### item

`T`

Item to insert.

##### box

[`AABB3`](Interface.AABB3.md)

The item's 3D bounds.

#### Returns

`void`

***

### query()

```ts
query(box): Set<T>;
```

Defined in: physics/spatialGrid3d.ts:96

Items whose cells overlap `box`. Deduplicated, since a large item spans cells.

#### Parameters

##### box

[`AABB3`](Interface.AABB3.md)

Query bounds.

#### Returns

`Set`\<`T`\>

Set of candidate items.
