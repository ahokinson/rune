[**rune**](README.md)

***

[rune](README.md) / TweenManager

# Class: TweenManager

Defined in: tween/tween.ts:211

Registry that advances a collection of [Tween](Class.Tween.md)s together and reaps
completed/cancelled ones automatically. Drive it from the frame loop with
[TweenManager.advance](#advance).

## Constructors

### Constructor

```ts
new TweenManager(): TweenManager;
```

#### Returns

`TweenManager`

## Accessors

### count

#### Get Signature

```ts
get count(): number;
```

Defined in: tween/tween.ts:257

Number of tweens currently active.

##### Returns

`number`

## Methods

### add()

```ts
add(tween): Tween;
```

Defined in: tween/tween.ts:220

Add `tween` to the active set.

#### Parameters

##### tween

[`Tween`](Class.Tween.md)

Tween to track.

#### Returns

[`Tween`](Class.Tween.md)

The same tween, for chaining.

***

### advance()

```ts
advance(deltaMilliseconds): void;
```

Defined in: tween/tween.ts:241

Advance every active tween by `deltaMilliseconds` and drop any that are
now completed or cancelled.

#### Parameters

##### deltaMilliseconds

`number`

Time to add to each tween.

#### Returns

`void`

***

### clear()

```ts
clear(): void;
```

Defined in: tween/tween.ts:251

Cancel every active tween and empty the set.

#### Returns

`void`

***

### remove()

```ts
remove(tween): void;
```

Defined in: tween/tween.ts:230

Remove `tween` from the active set (e.g. to cancel it without reaping).

#### Parameters

##### tween

[`Tween`](Class.Tween.md)

Tween to detach.

#### Returns

`void`
