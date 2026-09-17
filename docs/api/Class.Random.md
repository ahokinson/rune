[**rune**](README.md)

***

[rune](README.md) / Random

# Class: Random

Defined in: math/random.ts:21

Seedable pseudo-random number generator. Deterministic for a given seed, so
replays and procedural layouts reproduce exactly. State is a single 32-bit
integer mutated in place.

## Example

```ts
const rng = new Random(1234)
rng.float(0, 1)    // deterministic in [0, 1)
rng.integer(1, 6)  // deterministic int in [1, 6]
rng.chance(0.25)   // true with probability 0.25
```

## Constructors

### Constructor

```ts
new Random(seed?): Random;
```

Defined in: math/random.ts:27

#### Parameters

##### seed?

`number` = `...`

Initial seed (default `Date.now()`); 0 is coerced to 1.

#### Returns

`Random`

## Methods

### chance()

```ts
chance(probability): boolean;
```

Defined in: math/random.ts:83

Bernoulli trial.

#### Parameters

##### probability

`number`

Probability of returning `true` in [0, 1].

#### Returns

`boolean`

`true` with the given probability.

***

### float()

```ts
float(low?, high?): number;
```

Defined in: math/random.ts:62

Uniform float in `[low, high)`.

#### Parameters

##### low?

`number` = `0`

Inclusive lower bound (default 0).

##### high?

`number` = `1`

Exclusive upper bound (default 1).

#### Returns

`number`

A float in [low, high).

***

### integer()

```ts
integer(low, high): number;
```

Defined in: math/random.ts:73

Uniform integer in `[low, high]` (both inclusive).

#### Parameters

##### low

`number`

Inclusive lower bound.

##### high

`number`

Inclusive upper bound.

#### Returns

`number`

An integer in [low, high].

***

### next()

```ts
next(): number;
```

Defined in: math/random.ts:47

Advance the generator and return the next value.

#### Returns

`number`

A float in [0, 1).

***

### pick()

```ts
pick<T>(array): T;
```

Defined in: math/random.ts:94

Pick a random element from `array`.

#### Type Parameters

##### T

`T`

#### Parameters

##### array

readonly `T`[]

Non-empty array to sample.

#### Returns

`T`

A random element.

#### Throws

if `array` is empty.

***

### seed()

```ts
seed(value): void;
```

Defined in: math/random.ts:37

Reset the generator's seed.

#### Parameters

##### value

`number`

New seed; 0 is coerced to 1.

#### Returns

`void`

***

### shuffle()

```ts
shuffle<T>(array): T[];
```

Defined in: math/random.ts:108

Shuffle `array` in place (Fisher–Yates) and return it.

#### Type Parameters

##### T

`T`

#### Parameters

##### array

`T`[]

Array to shuffle (mutated).

#### Returns

`T`[]

The same array, shuffled.
