[**rune**](README.md)

***

[rune](README.md) / CanvasProps

# Interface: CanvasProps

Defined in: Canvas.tsx:29

Properties for the [Canvas](Function.Canvas.md) component.

## Properties

### children?

```ts
optional children?: any;
```

Defined in: Canvas.tsx:37

Children rendered inside the canvas context provider.

***

### height

```ts
height: number;
```

Defined in: Canvas.tsx:33

Surface height in cells.

***

### ref?

```ts
optional ref?: (canvas) => void;
```

Defined in: Canvas.tsx:35

Optional ref callback invoked with the [CanvasSurface](Interface.CanvasSurface.md) once mounted.

#### Parameters

##### canvas

[`CanvasSurface`](Interface.CanvasSurface.md)

#### Returns

`void`

***

### width

```ts
width: number;
```

Defined in: Canvas.tsx:31

Surface width in cells.
