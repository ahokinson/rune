[**rune**](README.md)

***

[rune](README.md) / DomainWarpOptions

# Interface: DomainWarpOptions

Defined in: math/fbm.ts:88

Options for [domainWarp](Function.domainWarp.md), extending [FbmOptions](Interface.FbmOptions.md) with a warp
strength.

## Extends

- [`FbmOptions`](Interface.FbmOptions.md)

## Properties

### frequency?

```ts
optional frequency?: number;
```

Defined in: math/fbm.ts:24

Base frequency applied before the first octave (default 1).

#### Inherited from

[`FbmOptions`](Interface.FbmOptions.md).[`frequency`](Interface.FbmOptions.md#frequency)

***

### gain?

```ts
optional gain?: number;
```

Defined in: math/fbm.ts:22

Amplitude multiplier per octave (default 0.5).

#### Inherited from

[`FbmOptions`](Interface.FbmOptions.md).[`gain`](Interface.FbmOptions.md#gain)

***

### lacunarity?

```ts
optional lacunarity?: number;
```

Defined in: math/fbm.ts:20

Frequency multiplier per octave (default 2).

#### Inherited from

[`FbmOptions`](Interface.FbmOptions.md).[`lacunarity`](Interface.FbmOptions.md#lacunarity)

***

### octaves?

```ts
optional octaves?: number;
```

Defined in: math/fbm.ts:18

Number of octave passes to sum (default 4).

#### Inherited from

[`FbmOptions`](Interface.FbmOptions.md).[`octaves`](Interface.FbmOptions.md#octaves)

***

### strength?

```ts
optional strength?: number;
```

Defined in: math/fbm.ts:93

How far (in sample units) the warp field displaces the lookup. Larger values
give more turbulent, swirled output.
