[**rune**](README.md)

***

[rune](README.md) / EmitterOptions

# Interface: EmitterOptions\<T\>

Defined in: fx/emitter.ts:5

Options for constructing an [Emitter](Class.Emitter.md).

## Type Parameters

### T

`T`

## Properties

### capacity

```ts
capacity: number;
```

Defined in: fx/emitter.ts:11

Maximum number of items live at once.

***

### create

```ts
create: () => T;
```

Defined in: fx/emitter.ts:7

Factory for a fresh pooled item.

#### Returns

`T`

***

### random?

```ts
optional random?: () => number;
```

Defined in: fx/emitter.ts:20

Injectable Random for deterministic tests. Default Math.random.

#### Returns

`number`

***

### rateWindow?

```ts
optional rateWindow?: number;
```

Defined in: fx/emitter.ts:18

Window (in the same unit as the `tick` passed to `update`) over which
`ratePerWindow` counts spawns. Omit to disable rate tracking.

***

### reset?

```ts
optional reset?: (item) => void;
```

Defined in: fx/emitter.ts:9

Reset an item before reuse (e.g. clear its state).

#### Parameters

##### item

`T`

#### Returns

`void`

***

### spawnChance?

```ts
optional spawnChance?: number;
```

Defined in: fx/emitter.ts:13

Probability in [0,1] of spawning one item per `update` call. Default 1.
