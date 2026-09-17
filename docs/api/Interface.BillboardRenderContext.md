[**rune**](README.md)

***

[rune](README.md) / BillboardRenderContext

# Interface: BillboardRenderContext

Defined in: draw/raycast/billboards.ts:36

Options for [renderBillboards](Function.renderBillboards.md).

## Properties

### camera

```ts
camera: Camera;
```

Defined in: draw/raycast/billboards.ts:40

View camera.

***

### canvas

```ts
canvas: CanvasSurface;
```

Defined in: draw/raycast/billboards.ts:38

Canvas to draw onto.

***

### depthBuffer

```ts
depthBuffer: ColumnDepthBuffer;
```

Defined in: draw/raycast/billboards.ts:42

Raycast depth buffer for occlusion.

***

### entries

```ts
entries: readonly BillboardEntry[];
```

Defined in: draw/raycast/billboards.ts:44

Billboards to render this frame.

***

### eyeZ

```ts
eyeZ: number;
```

Defined in: draw/raycast/billboards.ts:48

Camera eye height in world Z, for vertical offset.

***

### rowCount

```ts
rowCount: number;
```

Defined in: draw/raycast/billboards.ts:50

Viewport row count, used to scale world-Z offsets to rows.

***

### timeMilliseconds

```ts
timeMilliseconds: number;
```

Defined in: draw/raycast/billboards.ts:46

Current animation time, passed to each entry's `spriteAt`.
