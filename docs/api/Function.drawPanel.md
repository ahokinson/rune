[**rune**](README.md)

***

[rune](README.md) / drawPanel

# Function: drawPanel()

```ts
function drawPanel(
   canvas, 
   x, 
   y, 
   w, 
   h, 
   panel, 
   frame, 
   bezel?, 
   title?, 
   titleCol?
): void;
```

Defined in: draw/widgets.ts:57

Draw a framed panel. `bezel: "block"` draws the chunky block-character frame
(▛▀▜ / ▙▄▟ / ▌▐), filled with `panel` and outlined in `frame`; any other
`bezel` is a [BoxStyleName](TypeAlias.BoxStyleName.md) passed to [drawBox](Function.drawBox.md) in `frame` over
`panel`. With a `title`, the line bezel insets the title into the top edge as
┤ TITLE ├ so the panel reads as a labelled card rather than a bare rectangle.
Does nothing if `w` or `h` is less than 2.

## Parameters

### canvas

[`CanvasSurface`](Interface.CanvasSurface.md)

Target canvas.

### x

`number`

Left column.

### y

`number`

Top row.

### w

`number`

Panel width in cells.

### h

`number`

Panel height in cells.

### panel

[`Color`](Class.Color.md)

Interior fill colour.

### frame

[`Color`](Class.Color.md)

Bezel/outline colour.

### bezel?

[`PanelBezel`](TypeAlias.PanelBezel.md) = `"single"`

Frame look (default `single`).

### title?

`string`

Optional label inset into the top edge (line bezels only).

### titleCol?

[`Color`](Class.Color.md) = `frame`

Title colour (default `frame`).

## Returns

`void`
