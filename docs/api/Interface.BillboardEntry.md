[**rune**](README.md)

***

[rune](README.md) / BillboardEntry

# Interface: BillboardEntry

Defined in: draw/raycast/billboards.ts:20

One billboarded actor handed to [renderBillboards](Function.renderBillboards.md).

## Properties

### markedForRemoval?

```ts
optional markedForRemoval?: boolean;
```

Defined in: draw/raycast/billboards.ts:32

When true the entry is skipped and not drawn.

***

### position

```ts
position: Vector2;
```

Defined in: draw/raycast/billboards.ts:22

World position of the sprite anchor.

***

### spriteScale?

```ts
optional spriteScale?: number;
```

Defined in: draw/raycast/billboards.ts:30

Uniform scale multiplier. Default 1.

***

### verticalOffsetRows?

```ts
optional verticalOffsetRows?: number;
```

Defined in: draw/raycast/billboards.ts:28

Extra vertical offset in terminal rows on top of the eye-height offset.

## Methods

### spriteAt()

```ts
spriteAt(timeMilliseconds): Sprite | PixelSprite;
```

Defined in: draw/raycast/billboards.ts:24

Returns the sprite to display at `timeMilliseconds` (for animation).

#### Parameters

##### timeMilliseconds

`number`

#### Returns

[`Sprite`](Class.Sprite.md) \| [`PixelSprite`](Class.PixelSprite.md)

***

### worldZ()?

```ts
optional worldZ(): number;
```

Defined in: draw/raycast/billboards.ts:26

Optional world Z (height) of the sprite anchor, for vertical offset from eye height.

#### Returns

`number`
