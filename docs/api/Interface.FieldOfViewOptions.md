[**rune**](README.md)

***

[rune](README.md) / FieldOfViewOptions

# Interface: FieldOfViewOptions

Defined in: light/shadowcast.ts:15

Options for [computeFieldOfView](Function.computeFieldOfView.md).

## Properties

### isBlocking

```ts
isBlocking: CellPredicate;
```

Defined in: light/shadowcast.ts:23

Reports whether a cell blocks sight.

***

### originX

```ts
originX: number;
```

Defined in: light/shadowcast.ts:17

Origin column.

***

### originY

```ts
originY: number;
```

Defined in: light/shadowcast.ts:19

Origin row.

***

### radius

```ts
radius: number;
```

Defined in: light/shadowcast.ts:21

Maximum sight distance in cells (Euclidean).

***

### reveal

```ts
reveal: (column, row, distance) => void;
```

Defined in: light/shadowcast.ts:25

Called once per visible cell with its coordinates and distance from origin.

#### Parameters

##### column

`number`

##### row

`number`

##### distance

`number`

#### Returns

`void`
