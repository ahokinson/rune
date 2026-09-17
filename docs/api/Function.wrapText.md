[**rune**](README.md)

***

[rune](README.md) / wrapText

# Function: wrapText()

```ts
function wrapText(text, width): string[];
```

Defined in: hud/dialogue.ts:105

Break `text` into lines no wider than `width` cells, splitting on spaces. Words
longer than `width` are hard-split. Operates on the plain string only — glyph
rendering stays with the canvas/terminal.

## Parameters

### text

`string`

Text to wrap.

### width

`number`

Maximum line width in cells.

## Returns

`string`[]

The wrapped lines.
