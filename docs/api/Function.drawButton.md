[**rune**](README.md)

***

[rune](README.md) / drawButton

# Function: drawButton()

```ts
function drawButton(
   canvas, 
   button, 
   options
): Rectangle;
```

Defined in: hud/button.ts:123

Draw `button` as a ` label ` chip at `(x, y)` in the colours for its current
state, recording the drawn rectangle into [Button.bounds](Class.Button.md#bounds) so a subsequent
[Button.update](Class.Button.md#update) can hit-test it.

## Parameters

### canvas

[`CanvasSurface`](Interface.CanvasSurface.md)

Target canvas.

### button

[`Button`](Class.Button.md)

The button to draw (its `bounds` are updated).

### options

[`ButtonDrawOptions`](Interface.ButtonDrawOptions.md)

Placement, padding, and per-state colours.

## Returns

[`Rectangle`](Class.Rectangle.md)

The drawn rectangle.
