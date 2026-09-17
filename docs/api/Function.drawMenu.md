[**rune**](README.md)

***

[rune](README.md) / drawMenu

# Function: drawMenu()

```ts
function drawMenu<T>(
   canvas, 
   menu, 
   options
): Rectangle[];
```

Defined in: hud/menu.ts:171

Render `menu` and return each item's clickable [Rectangle](Class.Rectangle.md) (same order as
`menu.items`) so callers can hit-test the mouse. A vertical menu prints one item
per row with a `▶` caret on the selection; a horizontal menu prints ` label `
chips, the selection drawn inverted. Disabled items render dimmed.

## Type Parameters

### T

`T`

## Parameters

### canvas

[`CanvasSurface`](Interface.CanvasSurface.md)

Target canvas.

### menu

[`Menu`](Class.Menu.md)\<`T`\>

The menu to draw.

### options

[`MenuDrawOptions`](Interface.MenuDrawOptions.md)

Placement and colours.

## Returns

[`Rectangle`](Class.Rectangle.md)[]

Per-item bounding rectangles.
