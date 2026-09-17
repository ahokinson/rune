[**rune**](README.md)

***

[rune](README.md) / PolylineStyle

# Interface: PolylineStyle

Defined in: geom/geometry3d.ts:110

Per-cell draw callback for the connected, depth-interpolated path. `t` is the
interpolated param at this cell; `lineIndex` distinguishes pooled polylines.

## Methods

### drawSegment()

```ts
drawSegment(
   canvas, 
   x, 
   y, 
   depth, 
   t, 
   lineIndex
): void;
```

Defined in: geom/geometry3d.ts:111

#### Parameters

##### canvas

[`CanvasSurface`](Interface.CanvasSurface.md)

##### x

`number`

##### y

`number`

##### depth

`number`

##### t

`number`

##### lineIndex

`number`

#### Returns

`void`
