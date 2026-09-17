[**rune**](README.md)

***

[rune](README.md) / drawLabeledPanel

# Function: drawLabeledPanel()

```ts
function drawLabeledPanel(canvas, options): Rectangle;
```

Defined in: draw/widgets.ts:376

Draw a titled status card: a framed panel sized to its `title` and `lines`, with
each line printed inside. Replaces the hand-rolled `inner`/`width` measuring and
`fillRectangle` + `drawPanel` + `forEach(drawText)` boilerplate HUDs repeat.

## Parameters

### canvas

[`CanvasSurface`](Interface.CanvasSurface.md)

Target canvas.

### options

[`LabeledPanelOptions`](Interface.LabeledPanelOptions.md)

Title, lines, colours, and placement.

## Returns

[`Rectangle`](Class.Rectangle.md)

The panel's resolved rectangle.
