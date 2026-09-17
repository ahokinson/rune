[**rune**](README.md)

***

[rune](README.md) / ParticlesOptions

# Interface: ParticlesOptions

Defined in: fx/particles.ts:29

Options for constructing a [Particles](Class.Particles.md) entity.

## Properties

### angleRange?

```ts
optional angleRange?: [number, number];
```

Defined in: fx/particles.ts:39

[min, max] initial heading in radians. Default [0, 2π).

***

### bounce?

```ts
optional bounce?: number;
```

Defined in: fx/particles.ts:53

Restitution coefficient for `collideWith` (0 = stop, 1 = perfect bounce).

***

### characters

```ts
characters: string[];
```

Defined in: fx/particles.ts:43

Glyph table indexed by life-fraction; particles step through it as they age.

***

### collideWith?

```ts
optional collideWith?: readonly Rectangle[];
```

Defined in: fx/particles.ts:51

Solid rectangles particles bounce off; `bounce` is the restitution (0–1).

***

### color?

```ts
optional color?: Color;
```

Defined in: fx/particles.ts:45

Draw colour. Default white.

***

### forces?

```ts
optional forces?: ForceField[];
```

Defined in: fx/particles.ts:49

Force fields summed onto each particle every step (attractors, wind, drag).

***

### gravity?

```ts
optional gravity?: Vector2;
```

Defined in: fx/particles.ts:41

Constant acceleration per step. Default (0, 0).

***

### lifetimeMilliseconds

```ts
lifetimeMilliseconds: number;
```

Defined in: fx/particles.ts:35

Particle lifetime in milliseconds.

***

### maximumParticles?

```ts
optional maximumParticles?: number;
```

Defined in: fx/particles.ts:47

Pool cap. Default 256.

***

### onExpire?

```ts
optional onExpire?: (position, velocity) => void;
```

Defined in: fx/particles.ts:58

Called when a particle expires, with its final position and velocity — the
hook for sub-emitters (a spark dies into a puff of smoke).

#### Parameters

##### position

[`Vector2`](Class.Vector2.md)

##### velocity

[`Vector2`](Class.Vector2.md)

#### Returns

`void`

***

### origin

```ts
origin: Vector2;
```

Defined in: fx/particles.ts:31

World-space origin particles spawn at.

***

### ratePerSecond?

```ts
optional ratePerSecond?: number;
```

Defined in: fx/particles.ts:33

Continuous spawns per second (0 = manual `emit` only). Default 0.

***

### speedRange?

```ts
optional speedRange?: [number, number];
```

Defined in: fx/particles.ts:37

[min, max] initial speed. Default [0, 0].
