[**rune**](README.md)

***

[rune](README.md) / SceneSwitch

# Function: SceneSwitch()

```ts
function SceneSwitch<TScreen>(props): any;
```

Defined in: SceneSwitch.tsx:28

Conditionally renders the child factory whose key equals `props.active()`,
using Solid's `<Show>` so inactive screens are unmounted. Iterates the
children map in declaration order.

## Type Parameters

### TScreen

`TScreen` *extends* `string`

Union of screen keys.

## Parameters

### props

[`SceneSwitchProps`](Interface.SceneSwitchProps.md)\<`TScreen`\>

Component properties.

## Returns

`any`

A fragment of `<Show>` blocks, one per child entry.
