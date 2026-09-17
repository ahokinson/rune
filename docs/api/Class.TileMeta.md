[**rune**](README.md)

***

[rune](README.md) / TileMeta

# Class: TileMeta\<T\>

Defined in: world/tileMeta.ts:15

Sparse per-cell side-table keyed by (column, row).

## Type Parameters

### T

`T`

Stored value type.

## Constructors

### Constructor

```ts
new TileMeta<T>(): TileMeta<T>;
```

#### Returns

`TileMeta`\<`T`\>

## Accessors

### size

#### Get Signature

```ts
get size(): number;
```

Defined in: world/tileMeta.ts:63

Number of stored entries.

##### Returns

`number`

## Methods

### delete()

```ts
delete(column, row): boolean;
```

Defined in: world/tileMeta.ts:58

Remove the value at (column, row).

#### Parameters

##### column

`number`

Cell column.

##### row

`number`

Cell row.

#### Returns

`boolean`

`true` if a value was present and removed.

***

### forEach()

```ts
forEach(callback): void;
```

Defined in: world/tileMeta.ts:72

Iterate every stored entry.

#### Parameters

##### callback

(`value`, `column`, `row`) => `void`

Called per entry with the value and its (column, row).

#### Returns

`void`

***

### get()

```ts
get(column, row): T | undefined;
```

Defined in: world/tileMeta.ts:27

#### Parameters

##### column

`number`

Cell column.

##### row

`number`

Cell row.

#### Returns

`T` \| `undefined`

The value at (column, row), or `undefined` if unset.

***

### has()

```ts
has(column, row): boolean;
```

Defined in: world/tileMeta.ts:47

#### Parameters

##### column

`number`

Cell column.

##### row

`number`

Cell row.

#### Returns

`boolean`

`true` if a value is stored at (column, row).

***

### set()

```ts
set(
   column, 
   row, 
   value
): void;
```

Defined in: world/tileMeta.ts:38

Store `value` at (column, row).

#### Parameters

##### column

`number`

Cell column.

##### row

`number`

Cell row.

##### value

`T`

Value to store.

#### Returns

`void`
