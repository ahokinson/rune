[**rune**](README.md)

***

[rune](README.md) / FullscreenCanvasProps

# Interface: FullscreenCanvasProps

Defined in: FullscreenCanvas.tsx:24

Properties for the [FullscreenCanvas](Function.FullscreenCanvas.md) component.

## Properties

### children?

```ts
optional children?: any;
```

Defined in: FullscreenCanvas.tsx:32

Children, or a render function receiving the terminal size so games can size
their world/state from it (replaces the hand-rolled useTerminal + Canvas
boilerplate every example repeated).

***

### ref?

```ts
optional ref?: (canvas) => void;
```

Defined in: FullscreenCanvas.tsx:26

Optional ref callback invoked with the [CanvasSurface](Interface.CanvasSurface.md) once mounted.

#### Parameters

##### canvas

[`CanvasSurface`](Interface.CanvasSurface.md)

#### Returns

`void`
