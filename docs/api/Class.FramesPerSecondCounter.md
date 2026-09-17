[**rune**](README.md)

***

[rune](README.md) / FramesPerSecondCounter

# Class: FramesPerSecondCounter

Defined in: core/time.ts:21

Rolling FPS counter. Call [record](#record) each frame with the frame delta; the
counter accumulates frames until at least 250 ms of time has passed, then
publishes a fresh frames-per-second value to [value](#value). Smoothing window
is bounded by `sampleCapacity` delta samples.

## Example

```ts
const fps = new FramesPerSecondCounter()
// each frame:
fps.record(deltaMs)
if (fps.value > 0) drawHud(fps.value)
```

## Constructors

### Constructor

```ts
new FramesPerSecondCounter(sampleCapacity?): FramesPerSecondCounter;
```

Defined in: core/time.ts:31

#### Parameters

##### sampleCapacity?

`number` = `60`

Maximum delta samples retained (default 60).

#### Returns

`FramesPerSecondCounter`

## Accessors

### value

#### Get Signature

```ts
get value(): number;
```

Defined in: core/time.ts:55

Latest computed frames-per-second, or 0 until enough samples accumulate.

##### Returns

`number`

## Methods

### record()

```ts
record(deltaMilliseconds): void;
```

Defined in: core/time.ts:40

Submit one frame's delta for averaging.

#### Parameters

##### deltaMilliseconds

`number`

Wall-clock time the frame took.

#### Returns

`void`

***

### reset()

```ts
reset(): void;
```

Defined in: core/time.ts:60

Clear all samples and the published value.

#### Returns

`void`
