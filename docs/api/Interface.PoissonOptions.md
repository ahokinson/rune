[**rune**](README.md)

***

[rune](README.md) / PoissonOptions

# Interface: PoissonOptions

Defined in: math/poisson.ts:12

Options for [poissonDisk](Function.poissonDisk.md).

## Properties

### attempts?

```ts
optional attempts?: number;
```

Defined in: math/poisson.ts:20

Candidates tried per active point before it is retired (Bridson's k, default 30).

***

### height

```ts
height: number;
```

Defined in: math/poisson.ts:16

Sample area height.

***

### radius

```ts
radius: number;
```

Defined in: math/poisson.ts:18

Minimum distance between any two points.

***

### seed?

```ts
optional seed?: number;
```

Defined in: math/poisson.ts:22

RNG seed (default 0).

***

### width

```ts
width: number;
```

Defined in: math/poisson.ts:14

Sample area width.
