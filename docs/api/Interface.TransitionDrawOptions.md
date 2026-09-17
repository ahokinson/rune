[**rune**](README.md)

***

[rune](README.md) / TransitionDrawOptions

# Interface: TransitionDrawOptions

Defined in: scene/transition.ts:37

Options for [drawTransition](Function.drawTransition.md).

## Properties

### color?

```ts
optional color?: Color;
```

Defined in: scene/transition.ts:43

Overlay colour (default black).

***

### coverage

```ts
coverage: number;
```

Defined in: scene/transition.ts:41

How covered the scene is, 0 (clear) to 1 (fully hidden).

***

### kind?

```ts
optional kind?: TransitionKind;
```

Defined in: scene/transition.ts:39

Overlay pattern (default [TransitionKind.Fade](Enumeration.TransitionKind.md#fade)).
