[**rune**](README.md)

***

[rune](README.md) / Worley2D

# Class: Worley2D

Defined in: math/worley.ts:38

Seeded 2D Worley (cellular) noise. Space is tiled into unit cells, each holding
one feature point at a hashed position; the noise at a sample is the distance
to the Nth-nearest feature point. F1 (nearest) gives a bubbly Voronoi field;
F2−F1 traces the cell borders, which is the classic "cracked stone / scales /
reptile skin" look. Distances are unnormalised world units (a feature point is
at most ~1.5 cells away, so F1 stays in roughly [0, 1.5]). Deterministic.

## Example

```ts
const w = new Worley2D(1234)
w.f1(1.5, 2.5)     // bubbly Voronoi field, [0, ~1.5)
w.edges(1.5, 2.5)  // F2 - F1, ridged cell borders
```

## Constructors

### Constructor

```ts
new Worley2D(seed?, metric?): Worley2D;
```

Defined in: math/worley.ts:46

#### Parameters

##### seed?

`number` = `0`

Seed for the cell hash (default 0).

##### metric?

[`WorleyDistance`](Enumeration.WorleyDistance.md) = `WorleyDistance.Euclidean`

Distance metric (default [WorleyDistance.Euclidean](Enumeration.WorleyDistance.md#euclidean)).

#### Returns

`Worley2D`

## Methods

### edges()

```ts
edges(x, y): number;
```

Defined in: math/worley.ts:116

F2 − F1 — ridged cell borders ("cracked stone"), near 0 inside cells and
rising toward the edges.

#### Parameters

##### x

`number`

X coordinate.

##### y

`number`

Y coordinate.

#### Returns

`number`

`f2 - f1`.

***

### f1()

```ts
f1(x, y): number;
```

Defined in: math/worley.ts:104

Distance to the nearest feature point — the bubbly Voronoi field, in [0, ~1.5).

#### Parameters

##### x

`number`

X coordinate.

##### y

`number`

Y coordinate.

#### Returns

`number`

The F1 distance.

***

### sample()

```ts
sample(x, y): WorleyResult;
```

Defined in: math/worley.ts:75

Nearest (F1) and second-nearest (F2) feature-point distances at (x, y),
searching the 3×3 block of cells around the sample (feature points never sit
more than one cell away, so this window is exhaustive).

#### Parameters

##### x

`number`

X coordinate.

##### y

`number`

Y coordinate.

#### Returns

[`WorleyResult`](Interface.WorleyResult.md)

The F1 and F2 distances.
