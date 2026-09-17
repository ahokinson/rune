[**rune**](README.md)

***

[rune](README.md) / Color

# Class: Color

Defined in: draw/color.ts:30

Immutable RGBA colour with channels normalised to 0–1.

## Example

```ts
const c = Color.fromHex("#ff8000")
c.withAlpha(0.5)                  // 50% transparent orange
Color.lerp(c, Color.BLACK, 0.5)   // darken toward black
```

## Constructors

### Constructor

```ts
new Color(
   red, 
   green, 
   blue, 
   alpha?
): Color;
```

Defined in: draw/color.ts:46

#### Parameters

##### red

`number`

Red (clamped to 0–1).

##### green

`number`

Green (clamped to 0–1).

##### blue

`number`

Blue (clamped to 0–1).

##### alpha?

`number` = `1`

Alpha (clamped to 0–1, default 1).

#### Returns

`Color`

## Properties

### alpha

```ts
readonly alpha: number;
```

Defined in: draw/color.ts:38

Alpha channel (0–1, 1 = opaque).

***

### blue

```ts
readonly blue: number;
```

Defined in: draw/color.ts:36

Blue channel (0–1).

***

### green

```ts
readonly green: number;
```

Defined in: draw/color.ts:34

Green channel (0–1).

***

### red

```ts
readonly red: number;
```

Defined in: draw/color.ts:32

Red channel (0–1).

***

### BLACK

```ts
readonly static BLACK: Color;
```

Defined in: draw/color.ts:149

Opaque black.

***

### BLUE

```ts
readonly static BLUE: Color;
```

Defined in: draw/color.ts:157

Opaque blue.

***

### CYAN

```ts
readonly static CYAN: Color;
```

Defined in: draw/color.ts:161

Opaque cyan.

***

### GREEN

```ts
readonly static GREEN: Color;
```

Defined in: draw/color.ts:155

Opaque green.

***

### MAGENTA

```ts
readonly static MAGENTA: Color;
```

Defined in: draw/color.ts:163

Opaque magenta.

***

### RED

```ts
readonly static RED: Color;
```

Defined in: draw/color.ts:153

Opaque red.

***

### TRANSPARENT

```ts
readonly static TRANSPARENT: Color;
```

Defined in: draw/color.ts:165

Fully transparent black.

***

### WHITE

```ts
readonly static WHITE: Color;
```

Defined in: draw/color.ts:151

Opaque white.

***

### YELLOW

```ts
readonly static YELLOW: Color;
```

Defined in: draw/color.ts:159

Opaque yellow.

## Methods

### toBytes()

```ts
toBytes(): object;
```

Defined in: draw/color.ts:130

Convert to 0–255 byte channels.

#### Returns

`object`

An object with `red`, `green`, `blue`, `alpha` in 0–255.

##### alpha

```ts
alpha: number;
```

##### blue

```ts
blue: number;
```

##### green

```ts
green: number;
```

##### red

```ts
red: number;
```

***

### toRGBATuple()

```ts
toRGBATuple(): [number, number, number, number];
```

Defined in: draw/color.ts:144

Convert to a plain `[r, g, b, a]` tuple in 0–1.

#### Returns

\[`number`, `number`, `number`, `number`\]

The 4-tuple `[red, green, blue, alpha]`.

***

### withAlpha()

```ts
withAlpha(alpha): Color;
```

Defined in: draw/color.ts:104

Return a copy of this colour with `alpha` substituted.

#### Parameters

##### alpha

`number`

New alpha (clamped to 0–1).

#### Returns

`Color`

A new Color.

***

### fromBytes()

```ts
static fromBytes(
   red, 
   green, 
   blue, 
   alpha?
): Color;
```

Defined in: draw/color.ts:62

Build a colour from 0–255 byte channels.

#### Parameters

##### red

`number`

Red (0–255).

##### green

`number`

Green (0–255).

##### blue

`number`

Blue (0–255).

##### alpha?

`number` = `255`

Alpha (0–255, default 255).

#### Returns

`Color`

A new Color.

***

### fromHex()

```ts
static fromHex(hex): Color;
```

Defined in: draw/color.ts:73

Parse a CSS-style hex string (`#rgb`, `#rrggbb`, or `#rrggbbaa`, with or
without the leading `#`).

#### Parameters

##### hex

`string`

Hex string to parse.

#### Returns

`Color`

A new Color.

***

### lerp()

```ts
static lerp(
   a, 
   b, 
   t
): Color;
```

Defined in: draw/color.ts:116

Linear interpolation between two colours across all four channels.

#### Parameters

##### a

`Color`

Start colour.

##### b

`Color`

End colour.

##### t

`number`

Interpolation factor (0 = `a`, 1 = `b`).

#### Returns

`Color`

A new Color.
