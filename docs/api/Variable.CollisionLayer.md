[**rune**](README.md)

***

[rune](README.md) / CollisionLayer

# Variable: CollisionLayer

```ts
CollisionLayer: object;
```

Defined in: physics/layers.ts:10

Helpers for building and testing CollisionLayers and [LayerMask](TypeAlias.LayerMask.md)s.

## Type Declaration

### all

```ts
all: number;
```

All-bits layer — matches every layer.

### none

```ts
none: number;
```

Empty layer — matches nothing.

### bit()

```ts
bit(index): number;
```

Build a single-bit layer from a bit `index`.

#### Parameters

##### index

`number`

Bit position in `[0, 32)`.

#### Returns

`number`

The layer with only bit `index` set.

### mask()

```ts
mask(...layers): number;
```

OR several layers into a single mask.

#### Parameters

##### layers

...`number`[]

Layers to combine.

#### Returns

`number`

The union mask.

### matches()

```ts
matches(layer, mask): boolean;
```

Test whether `layer` intersects `mask` (i.e. any shared bit is set).

#### Parameters

##### layer

`number`

Layer to test.

##### mask

`number`

Mask to test against.

#### Returns

`boolean`

`true` if `layer & mask` is non-zero.
