[**rune**](README.md)

***

[rune](README.md) / burstEmitter

# Function: burstEmitter()

```ts
function burstEmitter(options): Particles;
```

Defined in: fx/particles.ts:292

Build a manual-emit [Particles](Class.Particles.md) emitter — `ratePerSecond` 0, so nothing
spawns until [Particles.emit](Class.Particles.md#emit) fires on a gameplay event (a muzzle flash,
coin sparkle, blood spray, brick shatter). Defaults the origin to `(0, 0)` (the
owner repositions it each frame) and the pool to 64, and applies `zIndex` when
given. Continuous effects can start here and raise `ratePerSecond` at runtime.

## Parameters

### options

[`BurstEmitterOptions`](Interface.BurstEmitterOptions.md)

Burst configuration.

## Returns

[`Particles`](Class.Particles.md)

A configured [Particles](Class.Particles.md) entity.
