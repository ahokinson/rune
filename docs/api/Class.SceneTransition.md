[**rune**](README.md)

***

[rune](README.md) / SceneTransition

# Class: SceneTransition

Defined in: scene/transition.ts:113

Sequences a two-phase scene change: cover the screen, run a swap callback at the
fully-covered midpoint, then reveal. Advance it with the frame delta and call
[draw](#draw) after the scene each frame; it owns the timing and coverage so
games don't hand-roll the cover→swap→reveal handshake.

## Constructors

### Constructor

```ts
new SceneTransition(options): SceneTransition;
```

Defined in: scene/transition.ts:127

#### Parameters

##### options

[`SceneTransitionOptions`](Interface.SceneTransitionOptions.md)

Duration, pattern, colour, and easing.

#### Returns

`SceneTransition`

## Properties

### phase

```ts
phase: TransitionPhase = TransitionPhase.Idle;
```

Defined in: scene/transition.ts:115

Current phase.

## Accessors

### coverage

#### Get Signature

```ts
get coverage(): number;
```

Defined in: scene/transition.ts:140

Current overlay coverage, 0 (clear) to 1 (fully hidden).

##### Returns

`number`

***

### isActive

#### Get Signature

```ts
get isActive(): boolean;
```

Defined in: scene/transition.ts:135

`true` while a transition is covering or revealing.

##### Returns

`boolean`

## Methods

### advance()

```ts
advance(deltaMilliseconds): void;
```

Defined in: scene/transition.ts:167

Advance the transition by `deltaMilliseconds`, firing the swap callback at the
midpoint and ending after the reveal completes.

#### Parameters

##### deltaMilliseconds

`number`

Frame delta in milliseconds.

#### Returns

`void`

***

### draw()

```ts
draw(canvas): void;
```

Defined in: scene/transition.ts:189

Draw the overlay for the current coverage. A no-op while idle.

#### Parameters

##### canvas

[`CanvasSurface`](Interface.CanvasSurface.md)

Target canvas.

#### Returns

`void`

***

### start()

```ts
start(onCovered?): void;
```

Defined in: scene/transition.ts:153

Begin a transition. `onCovered` fires once when the screen is fully hidden —
the moment to swap scenes — before the reveal starts. Ignored if a transition
is already running.

#### Parameters

##### onCovered?

() => `void`

Callback invoked at the covered midpoint.

#### Returns

`void`
