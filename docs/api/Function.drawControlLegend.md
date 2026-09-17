[**rune**](README.md)

***

[rune](README.md) / drawControlLegend

# Function: drawControlLegend()

```ts
function drawControlLegend(canvas, options): Rectangle;
```

Defined in: draw/widgets.ts:316

Draw a one-line control legend — a framed panel that walks `controls`
left-to-right, each key in `keyColor` and its label in `labelColor`. Auto-sizes
to its contents and anchors itself, so callers don't measure or place it by
hand. This is the keys-then-labels footer most HUDs carry.

## Parameters

### canvas

[`CanvasSurface`](Interface.CanvasSurface.md)

Target canvas.

### options

[`ControlLegendOptions`](Interface.ControlLegendOptions.md)

Legend contents, colours, and placement.

## Returns

[`Rectangle`](Class.Rectangle.md)

The panel's resolved rectangle.
