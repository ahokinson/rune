[**rune**](README.md)

***

[rune](README.md) / FullscreenCanvas

# Function: FullscreenCanvas()

```ts
function FullscreenCanvas(props): any;
```

Defined in: FullscreenCanvas.tsx:48

A [Canvas](Function.Canvas.md) sized to fill the terminal. The canonical entry for a
full-screen game: drop it straight inside `<Application>` instead of wiring
`useTerminal()` to a manual `<Canvas width height>` in every project.

Children stay in the Canvas's JSX position (not hoisted to a const) so Solid
resolves them lazily inside the `CanvasContext.Provider` — hoisting would
create them under this component's owner, where `useCanvas()`/`useScene()`
can't see the canvas.

## Parameters

### props

[`FullscreenCanvasProps`](Interface.FullscreenCanvasProps.md)

Component properties.

## Returns

`any`

The Solid element tree rooted at the inner `<Canvas>`.
