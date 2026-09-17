[**rune**](README.md)

***

[rune](README.md) / FlowField

# Class: FlowField

Defined in: ai/flowField.ts:107

Grid of cost-to-goal and steepest-descent directions produced by
[FlowField.compute](#compute).

## Constructors

### Constructor

```ts
new FlowField(width, height): FlowField;
```

Defined in: ai/flowField.ts:121

#### Parameters

##### width

`number`

Field width in cells.

##### height

`number`

Field height in cells.

#### Returns

`FlowField`

## Properties

### cost

```ts
readonly cost: Float32Array;
```

Defined in: ai/flowField.ts:113

Cost-to-goal per cell; Infinity for unreachable/blocked cells.

***

### height

```ts
readonly height: number;
```

Defined in: ai/flowField.ts:111

Field height in cells.

***

### width

```ts
readonly width: number;
```

Defined in: ai/flowField.ts:109

Field width in cells.

## Methods

### costAt()

```ts
costAt(column, row): number;
```

Defined in: ai/flowField.ts:194

#### Parameters

##### column

`number`

Cell column.

##### row

`number`

Cell row.

#### Returns

`number`

Cost-to-goal at the cell, or `Infinity` if out of bounds.

***

### directionAt()

```ts
directionAt(
   column, 
   row, 
   out?
): Vector2;
```

Defined in: ai/flowField.ts:208

The unit direction a cell should move to descend toward the goal. Returns the
zero vector at the goal itself and on unreachable cells.

#### Parameters

##### column

`number`

Cell column.

##### row

`number`

Cell row.

##### out?

[`Vector2`](Class.Vector2.md) = `...`

Optional scratch vector to write into (default allocates).

#### Returns

[`Vector2`](Class.Vector2.md)

The direction vector (or `out` for chaining).

***

### inBounds()

```ts
inBounds(column, row): boolean;
```

Defined in: ai/flowField.ts:185

#### Parameters

##### column

`number`

Cell column.

##### row

`number`

Cell row.

#### Returns

`boolean`

`true` if (column, row) is inside the field.

***

### compute()

```ts
static compute(
   goals, 
   width, 
   height, 
   isPassable, 
   options?
): FlowField;
```

Defined in: ai/flowField.ts:138

Build a flow field toward one or more goal cells over the passable grid.

#### Parameters

##### goals

  \| [`GridCell`](Interface.GridCell.md)
  \| readonly [`GridCell`](Interface.GridCell.md)[]

Goal cell or cells to flow toward.

##### width

`number`

Field width in cells.

##### height

`number`

Field height in cells.

##### isPassable

[`CellPredicate`](TypeAlias.CellPredicate.md)

Predicate reporting whether a cell is walkable.

##### options?

[`FlowFieldOptions`](Interface.FlowFieldOptions.md) = `{}`

Optional configuration.

#### Returns

`FlowField`

A populated FlowField.
