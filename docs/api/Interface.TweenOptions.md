[**rune**](README.md)

***

[rune](README.md) / TweenOptions

# Interface: TweenOptions

Defined in: tween/tween.ts:11

Construction options for a [Tween](Class.Tween.md).

## Properties

### delayMilliseconds?

```ts
optional delayMilliseconds?: number;
```

Defined in: tween/tween.ts:25

Milliseconds to wait before the tween begins advancing.

***

### durationMilliseconds

```ts
durationMilliseconds: number;
```

Defined in: tween/tween.ts:17

Transition length in milliseconds.

***

### easing?

```ts
optional easing?: EasingFunction;
```

Defined in: tween/tween.ts:19

Easing curve applied to the normalized progress (default [Easing.linear](Variable.Easing.md#linear)).

***

### from

```ts
from: number;
```

Defined in: tween/tween.ts:13

Starting value.

***

### loop?

```ts
optional loop?: boolean;
```

Defined in: tween/tween.ts:21

Restart from `from` on completion, repeating forever.

***

### to

```ts
to: number;
```

Defined in: tween/tween.ts:15

Ending value.

***

### yoyo?

```ts
optional yoyo?: boolean;
```

Defined in: tween/tween.ts:23

Reverse direction on each completion, ping-ponging between `from` and `to`.
