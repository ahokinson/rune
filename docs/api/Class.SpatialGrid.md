[**rune**](README.md)

***

[rune](README.md) / SpatialGrid

# Class: SpatialGrid

Defined in: physics/spatialGrid.ts:14

A uniform 2D hash grid that buckets [Entity2D](Class.Entity2D.md) instances by their bounds.

## Constructors

### Constructor

```ts
new SpatialGrid(cellSize): SpatialGrid;
```

Defined in: physics/spatialGrid.ts:22

#### Parameters

##### cellSize

`number`

Cell edge length; must be `> 0`.

#### Returns

`SpatialGrid`

## Properties

### cellSize

```ts
readonly cellSize: number;
```

Defined in: physics/spatialGrid.ts:16

Edge length of one cell.

## Methods

### clear()

```ts
clear(): void;
```

Defined in: physics/spatialGrid.ts:46

Drop every inserted entity.

#### Returns

`void`

***

### insert()

```ts
insert(entity): void;
```

Defined in: physics/spatialGrid.ts:55

File `entity` under every cell its bounds overlap.

#### Parameters

##### entity

[`Entity2D`](Class.Entity2D.md)

Entity to insert.

#### Returns

`void`

***

### query()

```ts
query(bounds): Set<Entity2D>;
```

Defined in: physics/spatialGrid.ts:74

Return every entity whose bounds overlap any cell intersected by `bounds`.
The result is deduplicated (a large entity spans several cells).

#### Parameters

##### bounds

[`Rectangle`](Class.Rectangle.md)

Query rectangle.

#### Returns

`Set`\<[`Entity2D`](Class.Entity2D.md)\>

Set of candidate entities.
