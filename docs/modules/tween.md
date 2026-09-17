# tween

Eased scalar tweens with optional delay, loop, and yoyo — the time-driven animation primitive for values that change over a duration. Drive UI motion, fade-ins, camera shakes, and any scalar that should ease from one value to another without hand-rolling the interpolation each frame.

## Overview

A [`Tween`](../api/Class.Tween.md) interpolates between two values over a duration, eased by an [`EasingFunction`](../api/TypeAlias.EasingFunction.md) (from [math](math.md)'s [`Easing`](../api/Variable.Easing.md)). Advance it each frame with [`advance`](../api/Class.Tween.md); read the interpolated [`value`](../api/Class.Tween.md) and the lifecycle [`status`](../api/Class.Tween.md) (`Pending` / `Running` / `Done` / `Cancelled` via [`TweenState`](../api/Enumeration.TweenState.md)). Optional `delay` holds the tween before it starts, `loop` restarts it on completion, and `yoyo` reverses direction each loop. Chain `onUpdate` / `onComplete` callbacks for effects.

[`TweenManager`](../api/Class.TweenManager.md) is the registry that advances a collection of tweens together and reaps completed/cancelled ones automatically — `<Application>` owns one and advances it from the frame loop. The `useTween(options)` hook is the shortcut: it creates a `Tween`, registers it with the manager, and cancels + removes it automatically when the component unmounts. The [`tween(options)`](../api/Function.tween.md) factory is the bare constructor for non-component code.

## Files

| File | Exports | Purpose |
| --- | --- | --- |
| `tween.ts` | [`Tween`](../api/Class.Tween.md), [`TweenManager`](../api/Class.TweenManager.md), [`tween`](../api/Function.tween.md), [`TweenState`](../api/Enumeration.TweenState.md), [`TweenOptions`](../api/Interface.TweenOptions.md) | Eased scalar tween + registry. |

## Key types

### Classes
- [`Tween`](../api/Class.Tween.md) — Time-driven scalar tween between two values with easing, loop, yoyo, and delay.
- [`TweenManager`](../api/Class.TweenManager.md) — Registry advancing a collection of tweens; reaps finished ones.

### Functions
- [`tween`](../api/Function.tween.md) — Convenience factory for a new [`Tween`](../api/Class.Tween.md).

### Enums
- [`TweenState`](../api/Enumeration.TweenState.md) — `Pending` / `Running` / `Done` / `Cancelled`.

### Types & interfaces
- [`TweenOptions`](../api/Interface.TweenOptions.md) — `from`, `to`, `duration`, `easing`, `delay`, `loop`, `yoyo`, and lifecycle callbacks.

## Usage

```ts
import { Easing, useTween } from "@ahokinson/rune"

// In a component: auto-registered + cleaned up on unmount.
const fade = useTween({
  from: 0,
  to: 1,
  duration: 0.4,
  easing: Easing.easeOutCubic,
  onUpdate: (v) => (overlay.opacity = v),
})

createEffect(() => {
  if (showMenu()) fade.start()
  else fade.cancel()
})
```

```ts
// Bare tween for non-component code, driven by the app's manager.
import { tween } from "@ahokinson/rune"
const shake = tween({ from: 0, to: 1, duration: 0.25, yoyo: true, loop: 4 })
app.tweens.add(shake)
// each frame the manager calls shake.advance(delta)
```

## See also

- [math](math.md) — [`Easing`](../api/Variable.Easing.md) / [`EasingFunction`](../api/TypeAlias.EasingFunction.md).
- [Application & loop](../concepts/application-and-loop.md) — the `TweenManager` and `useTween` hook.
