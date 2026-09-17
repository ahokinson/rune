[**rune**](README.md)

***

[rune](README.md) / drawDialogue

# Function: drawDialogue()

```ts
function drawDialogue(
   canvas, 
   dialogue, 
   options
): Rectangle;
```

Defined in: hud/dialogue.ts:149

Draw `dialogue`'s currently visible text in a labelled panel `width` cells wide,
wrapping to fit, with an advance indicator appended once the page completes.

## Parameters

### canvas

[`CanvasSurface`](Interface.CanvasSurface.md)

Target canvas.

### dialogue

[`Dialogue`](Class.Dialogue.md)

The dialogue to render.

### options

[`DialogueDrawOptions`](Interface.DialogueDrawOptions.md)

Panel placement/colours plus the wrap width.

## Returns

[`Rectangle`](Class.Rectangle.md)

The panel's rectangle.
