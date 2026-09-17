[**rune**](README.md)

***

[rune](README.md) / createActionMap

# Function: createActionMap()

```ts
function createActionMap<TAction>(
   bindings, 
   keyboard, 
   mouse?, 
   gamepad?
): ActionSnapshot<TAction>;
```

Defined in: input/actions.ts:63

Build an [ActionSnapshot](Interface.ActionSnapshot.md) from a binding map plus the current keyboard
and (optionally) mouse and gamepad snapshots. Mouse/gamepad bindings are only
consulted when the corresponding snapshot is supplied.

## Type Parameters

### TAction

`TAction` *extends* `string`

Union of action names.

## Parameters

### bindings

[`ActionBindings`](TypeAlias.ActionBindings.md)\<`TAction`\>

Action → binding list map.

### keyboard

[`KeyboardSnapshot`](Interface.KeyboardSnapshot.md)

Keyboard snapshot backing key bindings.

### mouse?

[`MouseSnapshot`](Interface.MouseSnapshot.md)

Optional mouse snapshot backing `"mouse:<button>"` bindings.

### gamepad?

[`GamepadSnapshot`](Interface.GamepadSnapshot.md)

Optional gamepad snapshot backing `"gamepad:<button>"` bindings.

## Returns

[`ActionSnapshot`](Interface.ActionSnapshot.md)\<`TAction`\>

A snapshot exposing `isDown`/`wasPressed`/`wasReleased` per action.
