[**rune**](README.md)

***

[rune](README.md) / PanelBezel

# Type Alias: PanelBezel

```ts
type PanelBezel = "block" | BoxStyleName;
```

Defined in: draw/widgets.ts:36

Selects a panel's bezel look: `"block"` draws the chunky block-character
frame; any other value is a [BoxStyleName](TypeAlias.BoxStyleName.md) (`"single"`/`"double"`/…)
drawn via [drawBox](Function.drawBox.md).
