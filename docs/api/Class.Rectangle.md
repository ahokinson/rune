[**rune**](README.md)

***

[rune](README.md) / Rectangle

# Class: Rectangle

Defined in: math/rectangle.ts:22

Axis-aligned rectangle. `contains` and `intersects` use half-open intervals
on the right/bottom edges so adjacent rectangles don't overlap.

## Example

```ts
const r = new Rectangle(0, 0, 10, 10)
r.contains(new Vector2(5, 5))  // true
r.contains(new Vector2(10, 5)) // false (right edge excluded)
r.intersects(new Rectangle(5, 5, 10, 10))  // true
```

## Constructors

### Constructor

```ts
new Rectangle(
   x?, 
   y?, 
   width?, 
   height?
): Rectangle;
```

Defined in: math/rectangle.ts:38

#### Parameters

##### x?

`number` = `0`

Top-left X (default 0).

##### y?

`number` = `0`

Top-left Y (default 0).

##### width?

`number` = `0`

Width (default 0).

##### height?

`number` = `0`

Height (default 0).

#### Returns

`Rectangle`

## Properties

### height

```ts
height: number;
```

Defined in: math/rectangle.ts:30

Height.

***

### width

```ts
width: number;
```

Defined in: math/rectangle.ts:28

Width.

***

### x

```ts
x: number;
```

Defined in: math/rectangle.ts:24

X coordinate of the top-left corner.

***

### y

```ts
y: number;
```

Defined in: math/rectangle.ts:26

Y coordinate of the top-left corner.

## Accessors

### bottom

#### Get Signature

```ts
get bottom(): number;
```

Defined in: math/rectangle.ts:61

Bottom edge Y (`y + height`).

##### Returns

`number`

***

### centerX

#### Get Signature

```ts
get centerX(): number;
```

Defined in: math/rectangle.ts:66

Center X (`x + width / 2`).

##### Returns

`number`

***

### centerY

#### Get Signature

```ts
get centerY(): number;
```

Defined in: math/rectangle.ts:71

Center Y (`y + height / 2`).

##### Returns

`number`

***

### left

#### Get Signature

```ts
get left(): number;
```

Defined in: math/rectangle.ts:46

Left edge X (`x`).

##### Returns

`number`

***

### right

#### Get Signature

```ts
get right(): number;
```

Defined in: math/rectangle.ts:51

Right edge X (`x + width`).

##### Returns

`number`

***

### top

#### Get Signature

```ts
get top(): number;
```

Defined in: math/rectangle.ts:56

Top edge Y (`y`).

##### Returns

`number`

## Methods

### clone()

```ts
clone(): Rectangle;
```

Defined in: math/rectangle.ts:76

Return a copy of this rectangle.

#### Returns

`Rectangle`

***

### contains()

```ts
contains(point): boolean;
```

Defined in: math/rectangle.ts:86

Point-in-rectangle test (half-open: right/bottom edges excluded).

#### Parameters

##### point

[`Vector2`](Class.Vector2.md)

Point to test.

#### Returns

`boolean`

`true` if `point` lies inside.

***

### inflate()

```ts
inflate(amount): Rectangle;
```

Defined in: math/rectangle.ts:111

Return a new rectangle expanded by `amount` on every side.

#### Parameters

##### amount

`number`

Units to add to each edge.

#### Returns

`Rectangle`

A new inflated Rectangle.

***

### intersects()

```ts
intersects(other): boolean;
```

Defined in: math/rectangle.ts:96

Axis-aligned overlap test with `other`.

#### Parameters

##### other

`Rectangle`

Rectangle to test against.

#### Returns

`boolean`

`true` if the rectangles overlap.
