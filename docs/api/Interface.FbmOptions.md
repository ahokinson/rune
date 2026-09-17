[**rune**](README.md)

***

[rune](README.md) / FbmOptions

# Interface: FbmOptions

Defined in: math/fbm.ts:16

Options shared by the fractal helpers.

## Extended by

- [`DomainWarpOptions`](Interface.DomainWarpOptions.md)

## Properties

### frequency?

```ts
optional frequency?: number;
```

Defined in: math/fbm.ts:24

Base frequency applied before the first octave (default 1).

***

### gain?

```ts
optional gain?: number;
```

Defined in: math/fbm.ts:22

Amplitude multiplier per octave (default 0.5).

***

### lacunarity?

```ts
optional lacunarity?: number;
```

Defined in: math/fbm.ts:20

Frequency multiplier per octave (default 2).

***

### octaves?

```ts
optional octaves?: number;
```

Defined in: math/fbm.ts:18

Number of octave passes to sum (default 4).
