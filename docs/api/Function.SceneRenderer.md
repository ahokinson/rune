[**rune**](README.md)

***

[rune](README.md) / SceneRenderer

# Function: SceneRenderer()

```ts
function SceneRenderer(props): any;
```

Defined in: SceneRenderer.tsx:29

Renders the active scene into the surrounding `<Canvas>` every frame. Clears
the canvas, draws the application's current scene (falling back to the local
`<Scene>` context when the stack is empty) using [ApplicationHandle.renderAlpha](Interface.ApplicationHandle.md#renderalpha)
for interpolation, and flushes.

## Parameters

### props

[`SceneRendererProps`](Interface.SceneRendererProps.md)

Component properties.

## Returns

`any`

`null` — this component only produces side effects.
