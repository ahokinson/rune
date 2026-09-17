[**rune**](README.md)

***

[rune](README.md) / DialogueDrawOptions

# Interface: DialogueDrawOptions

Defined in: hud/dialogue.ts:133

Options for [drawDialogue](Function.drawDialogue.md); the [LabeledPanelOptions](Interface.LabeledPanelOptions.md) fields plus a wrap width.

## Extends

- `Omit`\<[`LabeledPanelOptions`](Interface.LabeledPanelOptions.md), `"lines"`\>

## Properties

### advanceGlyph?

```ts
optional advanceGlyph?: string;
```

Defined in: hud/dialogue.ts:137

Glyph shown after the text once the page is fully revealed (default `"▼"`).

***

### anchor?

```ts
optional anchor?: Anchor;
```

Defined in: draw/widgets.ts:346

Where the panel pins (default [Anchor.TopLeft](Enumeration.Anchor.md#topleft)).

#### Inherited from

[`LabeledPanelOptions`](Interface.LabeledPanelOptions.md).[`anchor`](Interface.LabeledPanelOptions.md#anchor)

***

### bezel?

```ts
optional bezel?: PanelBezel;
```

Defined in: draw/widgets.ts:364

Frame look (default `"rounded"`).

#### Inherited from

[`LabeledPanelOptions`](Interface.LabeledPanelOptions.md).[`bezel`](Interface.LabeledPanelOptions.md#bezel)

***

### frame

```ts
frame: Color;
```

Defined in: draw/widgets.ts:362

Panel frame colour.

#### Inherited from

[`LabeledPanelOptions`](Interface.LabeledPanelOptions.md).[`frame`](Interface.LabeledPanelOptions.md#frame)

***

### lineColor

```ts
lineColor: Color;
```

Defined in: draw/widgets.ts:358

Body text colour.

#### Inherited from

[`LabeledPanelOptions`](Interface.LabeledPanelOptions.md).[`lineColor`](Interface.LabeledPanelOptions.md#linecolor)

***

### marginX?

```ts
optional marginX?: number;
```

Defined in: draw/widgets.ts:348

Inset from the hugged horizontal edge (default 1).

#### Inherited from

[`LabeledPanelOptions`](Interface.LabeledPanelOptions.md).[`marginX`](Interface.LabeledPanelOptions.md#marginx)

***

### marginY?

```ts
optional marginY?: number;
```

Defined in: draw/widgets.ts:350

Inset from the hugged vertical edge (default 0).

#### Inherited from

[`LabeledPanelOptions`](Interface.LabeledPanelOptions.md).[`marginY`](Interface.LabeledPanelOptions.md#marginy)

***

### panel

```ts
panel: Color;
```

Defined in: draw/widgets.ts:360

Panel fill colour.

#### Inherited from

[`LabeledPanelOptions`](Interface.LabeledPanelOptions.md).[`panel`](Interface.LabeledPanelOptions.md#panel)

***

### title?

```ts
optional title?: string;
```

Defined in: draw/widgets.ts:352

Optional label inset into the top edge.

#### Inherited from

[`LabeledPanelOptions`](Interface.LabeledPanelOptions.md).[`title`](Interface.LabeledPanelOptions.md#title)

***

### titleColor?

```ts
optional titleColor?: Color;
```

Defined in: draw/widgets.ts:354

Title colour (default `frame`).

#### Inherited from

[`LabeledPanelOptions`](Interface.LabeledPanelOptions.md).[`titleColor`](Interface.LabeledPanelOptions.md#titlecolor)

***

### width

```ts
width: number;
```

Defined in: hud/dialogue.ts:135

Inner text width in cells; the visible text wraps to this.
