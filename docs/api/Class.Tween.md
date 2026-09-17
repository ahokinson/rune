[**rune**](README.md)

***

[rune](README.md) / Tween

# Class: Tween

Defined in: tween/tween.ts:56

Time-driven scalar tween between two values with optional easing, loop,
yoyo, and delay. Advance it each frame with [Tween.advance](#advance); read the
interpolated value via [Tween.value](#value) and the lifecycle via
[Tween.status](#status). Chain `onUpdate`/`onComplete` callbacks for effects.

## Example

```ts
const hp = tween({ from: 100, to: 0, durationMilliseconds: 500, easing: Easing.quadraticOut })
  .onUpdate((v) => drawBar(v))
  .onComplete(() => onDeath())
hp.start()
// each frame:
hp.advance(deltaMs)
```

## Constructors

### Constructor

```ts
new Tween(options): Tween;
```

Defined in: tween/tween.ts:81

#### Parameters

##### options

[`TweenOptions`](Interface.TweenOptions.md)

Tween configuration; see [TweenOptions](Interface.TweenOptions.md).

#### Returns

`Tween`

## Properties

### durationMilliseconds

```ts
readonly durationMilliseconds: number;
```

Defined in: tween/tween.ts:62

Transition length in milliseconds.

***

### easing

```ts
readonly easing: EasingFunction;
```

Defined in: tween/tween.ts:64

Easing curve applied to normalized progress.

***

### from

```ts
readonly from: number;
```

Defined in: tween/tween.ts:58

Starting value.

***

### loop

```ts
readonly loop: boolean;
```

Defined in: tween/tween.ts:66

Whether the tween restarts on completion.

***

### to

```ts
readonly to: number;
```

Defined in: tween/tween.ts:60

Ending value.

***

### yoyo

```ts
readonly yoyo: boolean;
```

Defined in: tween/tween.ts:68

Whether the tween reverses direction on each completion.

## Accessors

### status

#### Get Signature

```ts
get status(): TweenState;
```

Defined in: tween/tween.ts:131

Current [TweenState](Enumeration.TweenState.md).

##### Returns

[`TweenState`](Enumeration.TweenState.md)

***

### value

#### Get Signature

```ts
get value(): number;
```

Defined in: tween/tween.ts:136

Current interpolated value (clamped between `from` and `to`).

##### Returns

`number`

## Methods

### advance()

```ts
advance(deltaMilliseconds): void;
```

Defined in: tween/tween.ts:146

Advance the tween by `deltaMilliseconds`, firing update callbacks for the
new value and completing/looping/yoyo-ing as configured.

#### Parameters

##### deltaMilliseconds

`number`

Time to add (consumed by the delay first).

#### Returns

`void`

***

### cancel()

```ts
cancel(): void;
```

Defined in: tween/tween.ts:126

Immediately mark the tween [TweenState.Cancelled](Enumeration.TweenState.md#cancelled); no callbacks fire.

#### Returns

`void`

***

### onComplete()

```ts
onComplete(callback): this;
```

Defined in: tween/tween.ts:109

Register a callback fired once when the tween reaches completion.

#### Parameters

##### callback

() => `void`

Invoked with no arguments on completion.

#### Returns

`this`

`this` for chaining.

***

### onUpdate()

```ts
onUpdate(callback): this;
```

Defined in: tween/tween.ts:98

Register a callback fired every frame with the latest interpolated value.

#### Parameters

##### callback

(`value`) => `void`

Receives the current [value](#value).

#### Returns

`this`

`this` for chaining.

***

### start()

```ts
start(): this;
```

Defined in: tween/tween.ts:120

Transition a [TweenState.Pending](Enumeration.TweenState.md#pending) tween to [TweenState.Running](Enumeration.TweenState.md#running).
No-op if already running, completed, or cancelled.

#### Returns

`this`

`this` for chaining.
