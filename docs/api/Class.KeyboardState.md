[**rune**](README.md)

***

[rune](README.md) / KeyboardState

# Class: KeyboardState

Defined in: input/keyboard.ts:57

Mutable keyboard state implementing [KeyboardSnapshot](Interface.KeyboardSnapshot.md). Maintains two
edge buffers per phase (fixed-step and per-frame) so a single physical press
is observable exactly once in each pass even when a frame runs multiple
fixed substeps. Call [decayHeld](#decayheld) from the frame loop to auto-release
keys whose terminal never sent a release.

## Example

```ts
const keyboard = new KeyboardState()
keyboard.press("space")
keyboard.setPhase(InputPhase.Fixed)
keyboard.wasPressed("space")  // true on the first substep
```

## Implements

- [`KeyboardSnapshot`](Interface.KeyboardSnapshot.md)

## Constructors

### Constructor

```ts
new KeyboardState(options?): KeyboardState;
```

Defined in: input/keyboard.ts:75

#### Parameters

##### options?

`KeyboardStateOptions` = `{}`

Optional hold-timeout override and clock source.

#### Returns

`KeyboardState`

## Methods

### axis()

```ts
axis(negative, positive): -1 | 0 | 1;
```

Defined in: input/keyboard.ts:208

Treat `negative` and `positive` as a 1D axis.

#### Parameters

##### negative

`string`

Key mapped to the `-1` direction.

##### positive

`string`

Key mapped to the `+1` direction.

#### Returns

`-1` \| `0` \| `1`

`-1`, `0`, or `1` (`0` when both or neither are held).

#### Implementation of

[`KeyboardSnapshot`](Interface.KeyboardSnapshot.md).[`axis`](Interface.KeyboardSnapshot.md#axis)

***

### commitFixed()

```ts
commitFixed(): void;
```

Defined in: input/keyboard.ts:142

Clear the fixed-step edges. Called after the first substep of a frame so a
press reaches exactly one tick regardless of how many substeps run.

#### Returns

`void`

***

### commitFrame()

```ts
commitFrame(): void;
```

Defined in: input/keyboard.ts:151

Clear the per-frame edges. Called at frame end so once-per-frame code
(useUpdate) observes each press once, independent of substep count.

#### Returns

`void`

***

### commitStep()

```ts
commitStep(): void;
```

Defined in: input/keyboard.ts:160

Clear both edge buffers in one call. Convenient for standalone/test use
where there is no distinct fixed/frame split.

#### Returns

`void`

***

### decayHeld()

```ts
decayHeld(): void;
```

Defined in: input/keyboard.ts:114

Auto-release any held keys whose last press arrived longer ago than the
hold timeout. Called from the application's frame loop so that terminals
which omit release events don't leave keys stuck "down".

#### Returns

`void`

***

### isDown()

```ts
isDown(key): boolean;
```

Defined in: input/keyboard.ts:179

#### Parameters

##### key

`string`

Logical key name.

#### Returns

`boolean`

`true` if `key` is currently held.

#### Implementation of

[`KeyboardSnapshot`](Interface.KeyboardSnapshot.md).[`isDown`](Interface.KeyboardSnapshot.md#isdown)

***

### press()

```ts
press(key): void;
```

Defined in: input/keyboard.ts:86

Record a press of `key`. Refreshes the held-key heartbeat so
[decayHeld](#decayheld) won't auto-release it prematurely.

#### Parameters

##### key

`string`

Logical key name (see [Keys](Variable.Keys.md)).

#### Returns

`void`

***

### release()

```ts
release(key): void;
```

Defined in: input/keyboard.ts:100

Record a release of `key`.

#### Parameters

##### key

`string`

Logical key name.

#### Returns

`void`

***

### reset()

```ts
reset(): void;
```

Defined in: input/keyboard.ts:166

Clear all held keys and edge buffers.

#### Returns

`void`

***

### setPhase()

```ts
setPhase(phase): void;
```

Defined in: input/keyboard.ts:134

Select which phase's edge buffer wasPressed/wasReleased read from. The
application sets this around the fixed-step and frame-update passes.

#### Parameters

##### phase

[`InputPhase`](Enumeration.InputPhase.md)

Phase to activate ([InputPhase.Fixed](Enumeration.InputPhase.md#fixed) or [InputPhase.Frame](Enumeration.InputPhase.md#frame)).

#### Returns

`void`

***

### wasPressed()

```ts
wasPressed(key): boolean;
```

Defined in: input/keyboard.ts:187

#### Parameters

##### key

`string`

Logical key name.

#### Returns

`boolean`

`true` if `key` transitioned up→down this phase.

#### Implementation of

[`KeyboardSnapshot`](Interface.KeyboardSnapshot.md).[`wasPressed`](Interface.KeyboardSnapshot.md#waspressed)

***

### wasReleased()

```ts
wasReleased(key): boolean;
```

Defined in: input/keyboard.ts:196

#### Parameters

##### key

`string`

Logical key name.

#### Returns

`boolean`

`true` if `key` transitioned down→up this phase.

#### Implementation of

[`KeyboardSnapshot`](Interface.KeyboardSnapshot.md).[`wasReleased`](Interface.KeyboardSnapshot.md#wasreleased)
