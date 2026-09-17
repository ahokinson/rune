[**rune**](README.md)

***

[rune](README.md) / PixelSpriteAssetData

# Interface: PixelSpriteAssetData

Defined in: assets/types.ts:55

Authored YAML for a `pixelSprite` asset.

## Properties

### clips?

```ts
optional clips?: Record<string, PixelSpriteClipData>;
```

Defined in: assets/types.ts:63

Named animation clips.

***

### legends

```ts
legends: Record<string, PixelLegendData>;
```

Defined in: assets/types.ts:59

Named pixel legends.

***

### standalone?

```ts
optional standalone?: object;
```

Defined in: assets/types.ts:61

Optional standalone (non-animated) sprite.

#### art

```ts
art: string;
```

#### legend

```ts
legend: string;
```

***

### type

```ts
type: "pixelSprite";
```

Defined in: assets/types.ts:57

Asset type discriminator (`"pixelSprite"`).
