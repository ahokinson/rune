[**rune**](README.md)

***

[rune](README.md) / ActionBindings

# Type Alias: ActionBindings\<TAction\>

```ts
type ActionBindings<TAction> = Record<TAction, readonly string[]>;
```

Defined in: input/actions.ts:20

Map of action name to the list of bindings that trigger it. A binding is a
keyboard key string, a `"mouse:<button>"` string (`left`/`right`/`middle`),
or a `"gamepad:<button>"` string (a [GamepadButton](Enumeration.GamepadButton.md) value, e.g.
`"gamepad:south"`).

## Type Parameters

### TAction

`TAction` *extends* `string`

Union of action names.
