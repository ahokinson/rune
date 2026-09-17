[**rune**](README.md)

***

[rune](README.md) / drawSectionHeader

# Function: drawSectionHeader()

```ts
function drawSectionHeader(
   canvas, 
   x, 
   y, 
   right, 
   title, 
   ruleCol, 
   titleCol, 
   bg?
): void;
```

Defined in: draw/widgets.ts:107

Draw a lightweight section header: the title, then a dim rule filling to
`right`. Lighter than a boxed panel, so a stack of sections reads as an airy
rail.

## Parameters

### canvas

[`CanvasSurface`](Interface.CanvasSurface.md)

Target canvas.

### x

`number`

Left column.

### y

`number`

Row.

### right

`number`

Last column the rule extends to.

### title

`string`

Header label.

### ruleCol

[`Color`](Class.Color.md)

Rule colour.

### titleCol

[`Color`](Class.Color.md)

Title colour.

### bg?

[`Color`](Class.Color.md) = `BLACK`

Cell background (default black).

## Returns

`void`
