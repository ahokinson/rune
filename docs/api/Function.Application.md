[**rune**](README.md)

***

[rune](README.md) / Application

# Function: Application()

```ts
function Application(props): any;
```

Defined in: Application.tsx:64

Mounts a rune application: starts the renderer, wires the per-frame callback
that advances the fixed-step loop, input phases, tweens and scheduler, and
provides an [ApplicationHandle](Interface.ApplicationHandle.md) to descendants via
[ApplicationContext](Variable.ApplicationContext.md). Cleans everything up (and, in standalone runs,
exits the process) on unmount.

## Parameters

### props

[`ApplicationProps`](Interface.ApplicationProps.md)

Component properties.

## Returns

`any`

The Solid element tree rooted at the context provider.
