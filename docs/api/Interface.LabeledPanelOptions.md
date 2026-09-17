[**rune**](README.md)

***

[rune](README.md) / LabeledPanelOptions

# Interface: LabeledPanelOptions

Defined in: draw/widgets.ts:344

Options for [drawLabeledPanel](Function.drawLabeledPanel.md).

## Properties

### anchor?

```ts
optional anchor?: Anchor;
```

Defined in: draw/widgets.ts:346

Where the panel pins (default [Anchor.TopLeft](Enumeration.Anchor.md#topleft)).

***

### bezel?

```ts
optional bezel?: PanelBezel;
```

Defined in: draw/widgets.ts:364

Frame look (default `"rounded"`).

***

### frame

```ts
frame: Color;
```

Defined in: draw/widgets.ts:362

Panel frame colour.

***

### lineColor

```ts
lineColor: Color;
```

Defined in: draw/widgets.ts:358

Body text colour.

***

### lines

```ts
lines: readonly string[];
```

Defined in: draw/widgets.ts:356

Body text, one entry per row.

***

### marginX?

```ts
optional marginX?: number;
```

Defined in: draw/widgets.ts:348

Inset from the hugged horizontal edge (default 1).

***

### marginY?

```ts
optional marginY?: number;
```

Defined in: draw/widgets.ts:350

Inset from the hugged vertical edge (default 0).

***

### panel

```ts
panel: Color;
```

Defined in: draw/widgets.ts:360

Panel fill colour.

***

### title?

```ts
optional title?: string;
```

Defined in: draw/widgets.ts:352

Optional label inset into the top edge.

***

### titleColor?

```ts
optional titleColor?: Color;
```

Defined in: draw/widgets.ts:354

Title colour (default `frame`).
