[**rune**](README.md)

***

[rune](README.md) / TerminalSpriteAssetData

# Interface: TerminalSpriteAssetData

Defined in: assets/types.ts:87

Authored YAML for a `terminalSprite` asset.

## Properties

### clips?

```ts
optional clips?: Record<string, TerminalSpriteClipData>;
```

Defined in: assets/types.ts:95

Named animation clips.

***

### legends

```ts
legends: Record<string, TerminalLegendData>;
```

Defined in: assets/types.ts:91

Named terminal legends.

***

### standalone?

```ts
optional standalone?: object;
```

Defined in: assets/types.ts:93

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
type: "terminalSprite";
```

Defined in: assets/types.ts:89

Asset type discriminator (`"terminalSprite"`).
