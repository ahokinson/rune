[**rune**](README.md)

***

[rune](README.md) / ApplicationHandle

# Interface: ApplicationHandle

Defined in: context.ts:42

Handle exposed to an [Application](Function.Application.md)'s subtree via [ApplicationContext](Variable.ApplicationContext.md).
Components and hooks read input, the scene stack, scheduler, tweens, audio and
loop signals through this object instead of reaching for globals.

## Properties

### audio

```ts
readonly audio: AudioContext;
```

Defined in: context.ts:68

Audio context (real or null) for the run.

***

### events

```ts
readonly events: EventEmitter<ApplicationEventMap>;
```

Defined in: context.ts:56

Application-level event bus.

***

### framesPerSecond

```ts
readonly framesPerSecond: Accessor<number>;
```

Defined in: context.ts:48

Measured render-frame rate in Hz, updated every frame.

***

### gamepad

```ts
readonly gamepad: GamepadState;
```

Defined in: context.ts:62

Gamepad state shared across the app, fed by a host input source.

***

### keyboard

```ts
readonly keyboard: KeyboardState;
```

Defined in: context.ts:58

Keyboard state shared across the app.

***

### mouse

```ts
readonly mouse: MouseState;
```

Defined in: context.ts:60

Mouse state shared across the app.

***

### paused

```ts
readonly paused: Accessor<boolean>;
```

Defined in: context.ts:50

Whether the simulation is paused (no fixed updates run).

***

### random

```ts
readonly random: Random;
```

Defined in: context.ts:52

Shared deterministic random source for the run.

***

### scenes

```ts
readonly scenes: SceneManager;
```

Defined in: context.ts:54

Scene stack; the top scene is updated and drawn each frame.

***

### scheduler

```ts
readonly scheduler: Scheduler;
```

Defined in: context.ts:64

One-shot and repeating timers tied to the app lifecycle.

***

### tick

```ts
readonly tick: Accessor<number>;
```

Defined in: context.ts:44

Current fixed-update tick, incremented once per simulated step.

***

### ticksPerSecond

```ts
readonly ticksPerSecond: Accessor<number>;
```

Defined in: context.ts:46

Configured fixed-update rate in Hz.

***

### tweens

```ts
readonly tweens: TweenManager;
```

Defined in: context.ts:66

Tween manager advanced each frame.

## Methods

### pause()

```ts
pause(): void;
```

Defined in: context.ts:91

Stop running fixed updates; frame updates continue.

#### Returns

`void`

***

### quit()

```ts
quit(): void;
```

Defined in: context.ts:95

Tear down the application and (in standalone runs) exit the process.

#### Returns

`void`

***

### registerFixedUpdate()

```ts
registerFixedUpdate(callback): () => void;
```

Defined in: context.ts:82

Register a callback fired once per fixed-update tick.

#### Parameters

##### callback

[`FixedUpdateCallback`](TypeAlias.FixedUpdateCallback.md)

Invoked with `(deltaMilliseconds, tick)`.

#### Returns

Unsubscribe function (also runs on Solid cleanup).

() => `void`

***

### registerUpdate()

```ts
registerUpdate(callback): () => void;
```

Defined in: context.ts:89

Register a callback fired once per rendered frame.

#### Parameters

##### callback

[`UpdateCallback`](TypeAlias.UpdateCallback.md)

Invoked with `(deltaMilliseconds)`.

#### Returns

Unsubscribe function (also runs on Solid cleanup).

() => `void`

***

### renderAlpha()

```ts
renderAlpha(): number;
```

Defined in: context.ts:75

How far the render frame is between the most recent fixed-update tick
(0) and the next one (1). Read this during draw to interpolate
between snapshotted and current positions for smooth motion at frame
rates higher than the fixed-tick rate.

#### Returns

`number`

***

### resume()

```ts
resume(): void;
```

Defined in: context.ts:93

Resume fixed updates after [pause](#pause).

#### Returns

`void`
