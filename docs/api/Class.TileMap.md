[**rune**](README.md)

***

[rune](README.md) / TileMap

# Class: TileMap\<TCell\>

Defined in: world/tileMap.ts:15

A 2D grid of cells addressed by (column, row).

## Type Parameters

### TCell

`TCell`

Cell value type.

## Constructors

### Constructor

```ts
new TileMap<TCell>(
   width, 
   height, 
   fill
): TileMap<TCell>;
```

Defined in: world/tileMap.ts:28

#### Parameters

##### width

`number`

Grid width in cells.

##### height

`number`

Grid height in cells.

##### fill

`TCell`

Value every cell is initialised to.

#### Returns

`TileMap`\<`TCell`\>

## Properties

### cells

```ts
readonly cells: TCell[];
```

Defined in: world/tileMap.ts:21

Row-major cell storage; `cells[row * width + column]`.

***

### height

```ts
readonly height: number;
```

Defined in: world/tileMap.ts:19

Grid height in cells.

***

### width

```ts
readonly width: number;
```

Defined in: world/tileMap.ts:17

Grid width in cells.

## Methods

### forEach()

```ts
forEach(callback): void;
```

Defined in: world/tileMap.ts:77

Iterate every cell in row-major order.

#### Parameters

##### callback

(`cell`, `column`, `row`) => `void`

Called per cell with the cell value and its (column, row).

#### Returns

`void`

***

### get()

```ts
get(column, row): TCell | undefined;
```

Defined in: world/tileMap.ts:55

#### Parameters

##### column

`number`

Cell column.

##### row

`number`

Cell row.

#### Returns

`TCell` \| `undefined`

The cell at (column, row), or `undefined` if out of bounds.

***

### inBounds()

```ts
inBounds(column, row): boolean;
```

Defined in: world/tileMap.ts:46

#### Parameters

##### column

`number`

Cell column.

##### row

`number`

Cell row.

#### Returns

`boolean`

`true` if (column, row) is inside the grid.

***

### set()

```ts
set(
   column, 
   row, 
   value
): void;
```

Defined in: world/tileMap.ts:67

Write `value` to (column, row). No-ops silently when out of bounds.

#### Parameters

##### column

`number`

Cell column.

##### row

`number`

Cell row.

##### value

`TCell`

Value to write.

#### Returns

`void`

***

### fromString()

```ts
static fromString<TCell>(
   source, 
   mapping, 
   fallback
): TileMap<TCell>;
```

Defined in: world/tileMap.ts:97

Parse an ASCII `source` into a grid using `mapping` (symbol → cell); any
character missing from `mapping` keeps the `fallback` cell. Leading and
trailing blank lines are stripped; ragged rows are padded with `fallback`.

#### Type Parameters

##### TCell

`TCell`

Cell value type.

#### Parameters

##### source

`string`

Multi-line ASCII layout.

##### mapping

`Record`\<`string`, `TCell`\>

Symbol → cell lookup.

##### fallback

`TCell`

Cell for blank or unmapped characters.

#### Returns

`TileMap`\<`TCell`\>

A new TileMap.
