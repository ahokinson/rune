[**rune**](README.md)

***

[rune](README.md) / Cooldown

# Class: Cooldown

Defined in: core/cooldown.ts:23

Cooldown timer that gates an action to at most once per `duration`. Call
[Cooldown.tick](#tick) each frame with the frame delta, then probe
[Cooldown.isReady](#isready) and [Cooldown.fire](#fire) when the gated action
occurs.

## Example

```ts
const cooldown = new Cooldown(500)
cooldown.fire()            // true — arms the 500 ms window
cooldown.isReady           // false
cooldown.tick(16)          // call each frame
// …after ~500 ms of ticks…
cooldown.isReady           // true
```

## Constructors

### Constructor

```ts
new Cooldown(durationMilliseconds): Cooldown;
```

Defined in: core/cooldown.ts:31

#### Parameters

##### durationMilliseconds

`number`

Cooldown length in milliseconds.

#### Returns

`Cooldown`

## Properties

### durationMilliseconds

```ts
readonly durationMilliseconds: number;
```

Defined in: core/cooldown.ts:25

Total cooldown duration in milliseconds.

## Accessors

### isReady

#### Get Signature

```ts
get isReady(): boolean;
```

Defined in: core/cooldown.ts:36

`true` when the cooldown has elapsed and the action may fire again.

##### Returns

`boolean`

***

### remaining

#### Get Signature

```ts
get remaining(): number;
```

Defined in: core/cooldown.ts:41

Milliseconds left before the cooldown becomes ready (clamped at 0).

##### Returns

`number`

## Methods

### fire()

```ts
fire(): boolean;
```

Defined in: core/cooldown.ts:62

Attempt to fire the gated action. Succeeds only when ready.

#### Returns

`boolean`

`true` if the action fired and the cooldown was re-armed;
  `false` if still cooling down.

***

### reset()

```ts
reset(): void;
```

Defined in: core/cooldown.ts:69

Clear the cooldown immediately, making the action ready now.

#### Returns

`void`

***

### tick()

```ts
tick(deltaMilliseconds): void;
```

Defined in: core/cooldown.ts:50

Advance the cooldown by one frame's worth of time.

#### Parameters

##### deltaMilliseconds

`number`

Elapsed time since the last tick.

#### Returns

`void`
