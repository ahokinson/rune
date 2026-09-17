[**rune**](README.md)

***

[rune](README.md) / Particles3DOptions

# Interface: Particles3DOptions

Defined in: fx/particles3d.ts:50

Options for constructing a [Particles3D](Class.Particles3D.md) entity.

## Properties

### color?

```ts
optional color?: Color;
```

Defined in: fx/particles3d.ts:65

Base colour (per-particle colour is snapshotted at spawn). Default white.

***

### drift?

```ts
optional drift?: Vector3;
```

Defined in: fx/particles3d.ts:70

Constant acceleration applied to every particle's velocity each update
(gravity-like); defaults to none.

***

### lifetimeMilliseconds

```ts
lifetimeMilliseconds: number;
```

Defined in: fx/particles3d.ts:54

Particle lifetime in milliseconds.

***

### maximumParticles?

```ts
optional maximumParticles?: number;
```

Defined in: fx/particles3d.ts:56

Pool cap. Default 256.

***

### minDepth?

```ts
optional minDepth?: number;
```

Defined in: fx/particles3d.ts:63

Particles nearer-facing than this depth are kept; the rest (grazing/far side)
are culled. Defaults to 0.1 to match the globe's city markers and arcs.

***

### style

```ts
style: Particle3DStyle;
```

Defined in: fx/particles3d.ts:52

Per-particle draw callback.

***

### zIndex?

```ts
optional zIndex?: number;
```

Defined in: fx/particles3d.ts:58

Draw order within the World3D pass.
