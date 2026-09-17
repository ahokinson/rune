[**rune**](README.md)

***

[rune](README.md) / WaveCollapseOptions

# Interface: WaveCollapseOptions

Defined in: worldgen/waveCollapse.ts:39

Options for [generateWaveCollapse](Function.generateWaveCollapse.md).

## Properties

### adjacency

```ts
adjacency: readonly readonly readonly number[][][];
```

Defined in: worldgen/waveCollapse.ts:47

`adjacency[direction][tile]` = tiles allowed on that side of `tile`.

***

### height

```ts
height: number;
```

Defined in: worldgen/waveCollapse.ts:43

Grid height in cells.

***

### maxAttempts?

```ts
optional maxAttempts?: number;
```

Defined in: worldgen/waveCollapse.ts:53

Restart count when a contradiction (a cell with zero options) is hit.

***

### seed?

```ts
optional seed?: number;
```

Defined in: worldgen/waveCollapse.ts:51

RNG seed (default 0).

***

### tileCount

```ts
tileCount: number;
```

Defined in: worldgen/waveCollapse.ts:45

Number of distinct tiles the solver may place.

***

### weights?

```ts
optional weights?: readonly number[];
```

Defined in: worldgen/waveCollapse.ts:49

Relative selection weight per tile (defaults to uniform).

***

### width

```ts
width: number;
```

Defined in: worldgen/waveCollapse.ts:41

Grid width in cells.
