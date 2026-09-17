# Canvas & rendering

Rune draws to the terminal through OpenTUI's `FrameBufferRenderable`. The engine wraps it in a `FrameDiffCanvas` that only flushes cells that changed frame-to-frame, and ties it to the Solid component tree with `<Canvas>`, `<FullscreenCanvas>`, and `<SceneRenderer>`.

## `<FullscreenCanvas>`

The canonical entry for a full-screen game. Drop it straight inside `<Application>` instead of wiring `useTerminal()` to a manual `<Canvas>`.

```tsx
<Application ticksPerSecond={60}>
  <FullscreenCanvas>
    <World />
  </FullscreenCanvas>
</Application>
```

### Render-prop form

If you need the terminal size to build your world or state, use the render-prop form — the function receives `{ width, height }`:

```tsx
<FullscreenCanvas>{(size) => <Globe width={size.width} height={size.height} />}</FullscreenCanvas>
```

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `ref?` | `(canvas: CanvasSurface) => void` | — | Invoked with the surface once mounted. |
| `children?` | `JSX.Element \| ((size: TerminalSize) => JSX.Element)` | — | Children, or a function receiving the terminal size. |

## `<Canvas>`

Use this when you need a fixed-size canvas (not full-screen), e.g. a side panel or a sub-window. `<FullscreenCanvas>` is just `<Canvas>` sized from `useTerminal()`.

```tsx
<Canvas width={80} height={24}>{/* … */}</Canvas>
```

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `width` | `number` | (required) | Surface width in cells. |
| `height` | `number` | (required) | Surface height in cells. |
| `ref?` | `(canvas: CanvasSurface) => void` | — | Invoked with the surface once mounted. |
| `children?` | `JSX.Element` | — | Rendered inside the canvas context provider. |

### What it does

On mount, `<Canvas>` creates an OpenTUI `FrameBufferRenderable`, wires mouse move/down/up/drag handlers to `application.mouse`, adds the renderable to the renderer root, and wraps its `frameBuffer` in a `FrameDiffCanvas`. It provides `CanvasContext` (an `Accessor<Canvas | null>`) so descendants can read the surface via `useCanvas()`.

On cleanup, it removes the renderable and destroys it.

### `FrameDiffCanvas`

The `CanvasSurface` implementation backing `<Canvas>`. It double-buffers chars + per-channel fg/bg byte arrays (current + previous). `flush()` only writes cells whose bytes differ from the previous frame into the OpenTUI `frameBuffer`, then copies current into prev. This makes partial redraws cheap — unchanged cells are never touched.

## `<SceneRenderer>`

Registers a `useUpdate` that draws the active scene every frame. Renders nothing itself.

```tsx
<Scene name="world">
  <SceneRenderer clearColor={Color.fromHex("#0f172a")} />
  {/* entities added in onMount */}
</Scene>
```

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `clearColor?` | [`Color`](../api/Class.Color.md) | transparent | Color used to clear the canvas each frame. |

### What it does each frame

1. Reads the canvas from `useCanvas()` (early-returns if null).
2. `canvas.clear(props.clearColor)`.
3. Resolves the active scene: `application.scenes.current ?? localScene` (the `<Scene>` from context if no scene is on the stack).
4. `active.draw(canvas, application.renderAlpha())`.
5. `canvas.flush()`.

The scene's `draw()` draws its entity tree in `zIndex` order, passing `renderAlpha` so entities can interpolate between the previous and current fixed-tick positions.

## The draw order

```
<SceneRenderer>   useUpdate, each frame:
  canvas.clear(clearColor)
  scene.draw(canvas, renderAlpha)   → draws entities in zIndex order
  canvas.flush()                    → only changed cells are written to the terminal
```

Entities are drawn in ascending `zIndex` order; ties break by insertion order. A `WorldView3D` entity (which owns a `Scene3D`) is just another 2D entity at a `zIndex`, so HUD and effect entities layer around it naturally.

## `CanvasSurface`

The interface every canvas implements. You'll rarely construct one yourself — `<Canvas>` and `<FullscreenCanvas>` do that — but you'll call its methods in `draw()`:

- `setCell(x, y, char, foreground?, background?)` — set a single cell's char and foreground color.
- `setCellBytes(x, y, char, fgR, fgG, fgB, bgR, bgG, bgB)` — set a cell from raw per-channel byte values (0–255); the fast path used by the 3D pipelines.
- `drawText(x, y, text, foreground?, background?)` — write a string starting at `(x, y)`.
- `fillRectangle(x, y, w, h, color)` — fill a rectangle with spaces and `color` as the background.
- `clear(background?)` — fill with spaces and the clear color.
- `flush()` — write changed cells to the terminal.

The full interface is in [`draw/canvas.ts`](../api/Interface.CanvasSurface.md). [`InMemoryCanvas`](../api/Class.InMemoryCanvas.md) is a non-rendering implementation used in tests.

## Reading the canvas in a component

```tsx
const canvas = useCanvas()

createEffect(() => {
  const c = canvas()
  if (!c) return
  c.setCell(10, 5, "●", Color.WHITE)
})
```

Most drawing happens inside entity `draw()` methods (called by `SceneRenderer`), not in effects. Use `useCanvas()` directly only for one-off drawing outside the entity model.

## See also

- [`FullscreenCanvas` component](../api/Function.FullscreenCanvas.md)
- [`Canvas` component](../api/Function.Canvas.md)
- [`SceneRenderer` component](../api/Function.SceneRenderer.md)
- [`CanvasSurface` interface](../api/Interface.CanvasSurface.md)
- [Scenes & entities](scenes-and-entities.md)
- [Application & loop](application-and-loop.md)
