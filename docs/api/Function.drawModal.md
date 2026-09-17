[**rune**](README.md)

***

[rune](README.md) / drawModal

# Function: drawModal()

```ts
function drawModal(canvas, options): Rectangle;
```

Defined in: draw/widgets.ts:424

Draw a centred message box — a framed `title` with an optional `detail` line
under it, anchored to the middle of the canvas. The "loading"/"game over"/"not a
git repo" modal HUDs reach for.

## Parameters

### canvas

[`CanvasSurface`](Interface.CanvasSurface.md)

Target canvas.

### options

[`ModalOptions`](Interface.ModalOptions.md)

Message text and colours.

## Returns

[`Rectangle`](Class.Rectangle.md)

The modal's resolved rectangle.
