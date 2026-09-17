[**rune**](README.md)

***

[rune](README.md) / ColumnDepthBuffer

# Class: ColumnDepthBuffer

Defined in: draw/raycast/columnDepthBuffer.ts:17

Per-column depth buffer using the SMALLER = NEARER convention.

Used by the raycaster and billboard pass to resolve visibility and occlude
sprites behind walls. An optional per-cell grid refines occlusion row by row.

## Constructors

### Constructor

```ts
new ColumnDepthBuffer(columnCount, rowCount?): ColumnDepthBuffer;
```

Defined in: draw/raycast/columnDepthBuffer.ts:33

Create a new buffer, optionally with per-cell refinement.

#### Parameters

##### columnCount

`number`

Number of screen columns.

##### rowCount?

`number` = `0`

Per-cell row count for refinement (default 0, column-only).

#### Returns

`ColumnDepthBuffer`

## Properties

### columnCount

```ts
readonly columnCount: number;
```

Defined in: draw/raycast/columnDepthBuffer.ts:19

Column count this buffer was created with.

***

### rowCount

```ts
readonly rowCount: number;
```

Defined in: draw/raycast/columnDepthBuffer.ts:21

Per-cell refinement row count (0 means column-only depth).

## Methods

### clear()

```ts
clear(value?): void;
```

Defined in: draw/raycast/columnDepthBuffer.ts:51

Clear columns written since the last clear to `value`, and reset the per-cell
grid if present. Only dirty columns are reset, so it can be called every frame
cheaply.

#### Parameters

##### value?

`number` = `Number.POSITIVE_INFINITY`

Depth to fill with (default +Infinity, meaning "nothing nearer").

#### Returns

`void`

***

### get()

```ts
get(column): number;
```

Defined in: draw/raycast/columnDepthBuffer.ts:85

Read the column depth. Out-of-bounds reads return +Infinity.

#### Parameters

##### column

`number`

Column index.

#### Returns

`number`

Stored depth, or +Infinity if `column` is outside the buffer.

***

### getCell()

```ts
getCell(column, row): number;
```

Defined in: draw/raycast/columnDepthBuffer.ts:113

Read the per-cell depth at (column, row). Returns +Infinity when there is no
per-cell refinement or the index is out of bounds.

#### Parameters

##### column

`number`

Column index.

##### row

`number`

Row index.

#### Returns

`number`

Stored depth, or +Infinity if unavailable.

***

### set()

```ts
set(column, depth): void;
```

Defined in: draw/raycast/columnDepthBuffer.ts:72

Store `depth` for `column` and mark the column dirty.

#### Parameters

##### column

`number`

Column index.

##### depth

`number`

Depth value.

#### Returns

`void`

***

### setCell()

```ts
setCell(
   column, 
   row, 
   depth
): void;
```

Defined in: draw/raycast/columnDepthBuffer.ts:98

Store `depth` for the per-cell (column, row). No-op when the buffer has no
per-cell refinement.

#### Parameters

##### column

`number`

Column index.

##### row

`number`

Row index.

##### depth

`number`

Depth value.

#### Returns

`void`

***

### writeIfCloser()

```ts
writeIfCloser(column, depth): boolean;
```

Defined in: draw/raycast/columnDepthBuffer.ts:127

Write `depth` if it is strictly closer (smaller) than what's stored.

#### Parameters

##### column

`number`

Column index.

##### depth

`number`

Candidate depth (SMALLER = NEARER).

#### Returns

`boolean`

`true` if the depth won the test and was written.
