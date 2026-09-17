[**rune**](README.md)

***

[rune](README.md) / LightGrid

# Class: LightGrid

Defined in: light/lightGrid.ts:32

Baked grid of accumulated coloured light intensity.

## Constructors

### Constructor

```ts
new LightGrid(width, height): LightGrid;
```

Defined in: light/lightGrid.ts:44

#### Parameters

##### width

`number`

Grid width in cells.

##### height

`number`

Grid height in cells.

#### Returns

`LightGrid`

## Properties

### data

```ts
readonly data: Float32Array;
```

Defined in: light/lightGrid.ts:38

Interleaved r,g,b per cell.

***

### height

```ts
readonly height: number;
```

Defined in: light/lightGrid.ts:36

Grid height in cells.

***

### width

```ts
readonly width: number;
```

Defined in: light/lightGrid.ts:34

Grid width in cells.

## Methods

### addInto()

```ts
addInto(
   column, 
   row, 
   out
): void;
```

Defined in: light/lightGrid.ts:136

Add the accumulated light at a cell onto `out`, clamped to 255 — the form the
raycaster uses to tint an already-shaded surface byte colour.

#### Parameters

##### column

`number`

Cell column.

##### row

`number`

Cell row.

##### out

[`SurfaceColor`](Interface.SurfaceColor.md)

Surface colour to add light onto (mutated).

#### Returns

`void`

***

### addLight()

```ts
addLight(source, isBlocking?): this;
```

Defined in: light/lightGrid.ts:76

Accumulate one light. With `isBlocking`, shadowcasting restricts the light to
cells visible from its origin (walls cast shadows); without it, every cell in
the radius box is lit by straight-line distance falloff.

#### Parameters

##### source

[`LightSource`](Interface.LightSource.md)

Light to add.

##### isBlocking?

[`CellPredicate`](TypeAlias.CellPredicate.md)

Optional opacity predicate for shadowcasting.

#### Returns

`this`

`this` for chaining.

***

### clear()

```ts
clear(): void;
```

Defined in: light/lightGrid.ts:51

Zero every cell.

#### Returns

`void`

***

### sampleInto()

```ts
sampleInto(
   column, 
   row, 
   out
): void;
```

Defined in: light/lightGrid.ts:115

Write the accumulated light at a cell into `out` (0–255), replacing it.

#### Parameters

##### column

`number`

Cell column.

##### row

`number`

Cell row.

##### out

[`SurfaceColor`](Interface.SurfaceColor.md)

Target to overwrite.

#### Returns

`void`
