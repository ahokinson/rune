[**rune**](README.md)

***

[rune](README.md) / pollWebGamepads

# Function: pollWebGamepads()

```ts
function pollWebGamepads(state, options?): boolean;
```

Defined in: input/gamepad.ts:294

Read the browser Gamepad API once and push the first (or `index`-th) connected
controller's state into `state`. A no-op returning `false` where
`navigator.getGamepads` is unavailable (e.g. a Bun terminal), so it is safe to
call unconditionally every frame.

## Parameters

### state

[`GamepadState`](Class.GamepadState.md)

Target [GamepadState](Class.GamepadState.md).

### options?

[`PollWebGamepadsOptions`](Interface.PollWebGamepadsOptions.md) = `{}`

Optional controller slot selection.

## Returns

`boolean`

`true` if a connected controller was read.
