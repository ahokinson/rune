[**rune**](README.md)

***

[rune](README.md) / SceneTransitionOptions

# Interface: SceneTransitionOptions

Defined in: scene/transition.ts:96

Options for constructing a [SceneTransition](Class.SceneTransition.md).

## Properties

### color?

```ts
optional color?: Color;
```

Defined in: scene/transition.ts:102

Overlay colour (default black).

***

### durationMilliseconds

```ts
durationMilliseconds: number;
```

Defined in: scene/transition.ts:98

Duration of each half (cover and reveal), in milliseconds.

***

### easing?

```ts
optional easing?: EasingFunction;
```

Defined in: scene/transition.ts:104

Easing applied to each half's progress (default [Easing.quadraticInOut](Variable.Easing.md#quadraticinout)).

***

### kind?

```ts
optional kind?: TransitionKind;
```

Defined in: scene/transition.ts:100

Overlay pattern (default [TransitionKind.Fade](Enumeration.TransitionKind.md#fade)).
