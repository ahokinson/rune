[**rune**](README.md)

***

[rune](README.md) / BurstEmitterOptions

# Interface: BurstEmitterOptions

Defined in: fx/particles.ts:261

Options for [burstEmitter](Function.burstEmitter.md); the [ParticlesOptions](Interface.ParticlesOptions.md) fields a burst needs.

## Properties

### angleRange

```ts
angleRange: [number, number];
```

Defined in: fx/particles.ts:271

[min, max] initial heading in radians.

***

### characters

```ts
characters: string[];
```

Defined in: fx/particles.ts:263

Glyph table stepped through as a particle ages.

***

### color

```ts
color: Color;
```

Defined in: fx/particles.ts:265

Draw colour.

***

### gravity?

```ts
optional gravity?: Vector2;
```

Defined in: fx/particles.ts:273

Constant per-step acceleration (default none).

***

### lifetimeMilliseconds

```ts
lifetimeMilliseconds: number;
```

Defined in: fx/particles.ts:267

Particle lifetime in milliseconds.

***

### maximumParticles?

```ts
optional maximumParticles?: number;
```

Defined in: fx/particles.ts:275

Pool cap (default 64).

***

### origin?

```ts
optional origin?: Vector2;
```

Defined in: fx/particles.ts:279

Initial spawn origin in the owner's coordinate space (default `(0, 0)`).

***

### speedRange

```ts
speedRange: [number, number];
```

Defined in: fx/particles.ts:269

[min, max] initial speed.

***

### zIndex?

```ts
optional zIndex?: number;
```

Defined in: fx/particles.ts:277

Draw order; applied to the returned emitter when given.
