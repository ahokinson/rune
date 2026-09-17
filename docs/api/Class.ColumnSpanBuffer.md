[**rune**](README.md)

***

[rune](README.md) / ColumnSpanBuffer

# Class: ColumnSpanBuffer

Defined in: draw/raycast/columnSpanBuffer.ts:13

Stores an optional inclusive (startRow, endRow) span per column in a packed
`Int16Array`. Unset columns read -1. Used to track filled row ranges during
raycast rendering.

## Constructors

### Constructor

```ts
new ColumnSpanBuffer(columnCount): ColumnSpanBuffer;
```

Defined in: draw/raycast/columnSpanBuffer.ts:21

#### Parameters

##### columnCount

`number`

Number of screen columns.

#### Returns

`ColumnSpanBuffer`

## Properties

### columnCount

```ts
readonly columnCount: number;
```

Defined in: draw/raycast/columnSpanBuffer.ts:15

Column count this buffer was created with.

## Methods

### clear()

```ts
clear(): void;
```

Defined in: draw/raycast/columnSpanBuffer.ts:28

Reset every column to unset (-1).

#### Returns

`void`

***

### hasSpan()

```ts
hasSpan(column): boolean;
```

Defined in: draw/raycast/columnSpanBuffer.ts:52

Whether `column` has a recorded span.

#### Parameters

##### column

`number`

Column index.

#### Returns

`boolean`

`true` if a span has been set.

***

### set()

```ts
set(
   column, 
   startRow, 
   endRow
): void;
```

Defined in: draw/raycast/columnSpanBuffer.ts:39

Record the inclusive span `[startRow, endRow]` for `column`.

#### Parameters

##### column

`number`

Column index.

##### startRow

`number`

First row of the span.

##### endRow

`number`

Last row of the span.

#### Returns

`void`

***

### spanEndAt()

```ts
spanEndAt(column): number;
```

Defined in: draw/raycast/columnSpanBuffer.ts:74

Last row of the span at `column`.

#### Parameters

##### column

`number`

Column index.

#### Returns

`number`

End row, or -1 if unset or out of bounds.

***

### spanStartAt()

```ts
spanStartAt(column): number;
```

Defined in: draw/raycast/columnSpanBuffer.ts:63

First row of the span at `column`.

#### Parameters

##### column

`number`

Column index.

#### Returns

`number`

Start row, or -1 if unset or out of bounds.
