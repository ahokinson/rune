[**rune**](README.md)

***

[rune](README.md) / menuItemAt

# Function: menuItemAt()

```ts
function menuItemAt(
   rects, 
   x, 
   y
): number;
```

Defined in: hud/menu.ts:215

Index of the item whose rectangle (from [drawMenu](Function.drawMenu.md)) contains `(x, y)`, or
`-1` if none. The bridge from a mouse cursor to a [Menu.setCursor](Class.Menu.md#setcursor) call.

## Parameters

### rects

readonly [`Rectangle`](Class.Rectangle.md)[]

Item rectangles returned by [drawMenu](Function.drawMenu.md).

### x

`number`

Pointer column.

### y

`number`

Pointer row.

## Returns

`number`

The hit item index, or `-1`.
