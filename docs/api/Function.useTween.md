[**rune**](README.md)

***

[rune](README.md) / useTween

# Function: useTween()

```ts
function useTween(options): Tween;
```

Defined in: hooks.ts:268

Create a [Tween](Class.Tween.md), register it with the application's tween manager, and
cancel + remove it automatically when the calling component unmounts.

## Parameters

### options

[`TweenOptions`](Interface.TweenOptions.md)

Tween configuration.

## Returns

[`Tween`](Class.Tween.md)

The created [Tween](Class.Tween.md).
