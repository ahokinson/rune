[**rune**](README.md)

***

[rune](README.md) / useActions

# Function: useActions()

```ts
function useActions<TAction>(bindings): ActionSnapshot<TAction>;
```

Defined in: hooks.ts:190

Build an action snapshot from a bindings map, wired to the application's
keyboard, mouse, and gamepad state (so `"mouse:"`/`"gamepad:"` bindings work
out of the box).

## Type Parameters

### TAction

`TAction` *extends* `string`

Union of action names.

## Parameters

### bindings

[`ActionBindings`](TypeAlias.ActionBindings.md)\<`TAction`\>

Per-action keyboard/mouse/gamepad bindings.

## Returns

[`ActionSnapshot`](Interface.ActionSnapshot.md)\<`TAction`\>

A snapshot to read resolved action state each frame.
