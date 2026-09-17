[**rune**](README.md)

***

[rune](README.md) / ControlLegendOptions

# Interface: ControlLegendOptions

Defined in: draw/widgets.ts:283

Options for [drawControlLegend](Function.drawControlLegend.md).

## Properties

### anchor?

```ts
optional anchor?: Anchor;
```

Defined in: draw/widgets.ts:285

Where the legend pins (default [Anchor.BottomLeft](Enumeration.Anchor.md#bottomleft)).

***

### bezel?

```ts
optional bezel?: PanelBezel;
```

Defined in: draw/widgets.ts:301

Frame look (default `"rounded"`).

***

### controls

```ts
controls: readonly ControlEntry[];
```

Defined in: draw/widgets.ts:291

The control hints, drawn left-to-right.

***

### frame

```ts
frame: Color;
```

Defined in: draw/widgets.ts:299

Panel frame colour.

***

### gap?

```ts
optional gap?: number;
```

Defined in: draw/widgets.ts:303

Cells between one label and the next key (default 3).

***

### keyColor

```ts
keyColor: Color;
```

Defined in: draw/widgets.ts:293

Colour for the key glyphs.

***

### labelColor

```ts
labelColor: Color;
```

Defined in: draw/widgets.ts:295

Colour for the action labels.

***

### marginX?

```ts
optional marginX?: number;
```

Defined in: draw/widgets.ts:287

Inset from the hugged horizontal edge (default 1).

***

### marginY?

```ts
optional marginY?: number;
```

Defined in: draw/widgets.ts:289

Inset from the hugged vertical edge (default 0).

***

### panel

```ts
panel: Color;
```

Defined in: draw/widgets.ts:297

Panel fill colour.
