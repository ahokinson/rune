[**rune**](README.md)

***

[rune](README.md) / Scene

# Function: Scene()

```ts
function Scene(props): any;
```

Defined in: Scene.tsx:32

Mounts a scene onto the application's scene stack for the lifetime of the
component. Emits `scene:enter` on mount and `scene:exit` on cleanup, popping
the stack only if it is still top, and provides the scene via
[SceneContext](Variable.SceneContext.md).

## Parameters

### props

[`SceneProps`](Interface.SceneProps.md)

Component properties.

## Returns

`any`

The Solid element tree rooted at the scene context provider.
