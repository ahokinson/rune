[**rune**](README.md)

***

[rune](README.md) / MenuDrawOptions

# Interface: MenuDrawOptions

Defined in: hud/menu.ts:139

Visual options for [drawMenu](Function.drawMenu.md).

## Properties

### background

```ts
background: Color;
```

Defined in: hud/menu.ts:151

Cell background for unselected items.

***

### disabledColor?

```ts
optional disabledColor?: Color;
```

Defined in: hud/menu.ts:153

Colour for disabled items (default `itemColor`).

***

### gap?

```ts
optional gap?: number;
```

Defined in: hud/menu.ts:155

Cells between items (default 0 vertical, 1 horizontal).

***

### itemColor

```ts
itemColor: Color;
```

Defined in: hud/menu.ts:145

Colour for an unselected, enabled item.

***

### padding?

```ts
optional padding?: number;
```

Defined in: hud/menu.ts:157

Horizontal padding cells around each chip label (horizontal only, default 1).

***

### selectedBackground

```ts
selectedBackground: Color;
```

Defined in: hud/menu.ts:149

Background highlight for the selected item.

***

### selectedColor

```ts
selectedColor: Color;
```

Defined in: hud/menu.ts:147

Foreground for the selected item.

***

### x

```ts
x: number;
```

Defined in: hud/menu.ts:141

Left column of the first item.

***

### y

```ts
y: number;
```

Defined in: hud/menu.ts:143

Top row of the first item.
