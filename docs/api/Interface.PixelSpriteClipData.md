[**rune**](README.md)

***

[rune](README.md) / PixelSpriteClipData

# Interface: PixelSpriteClipData

Defined in: assets/types.ts:43

A named clip in a pixel-sprite asset.

## Properties

### frameDuration

```ts
frameDuration: number;
```

Defined in: assets/types.ts:47

Duration of each frame in milliseconds.

***

### frames

```ts
frames: (string | PixelSpriteFrameData)[];
```

Defined in: assets/types.ts:51

Frames, as inline art strings or frame objects.

***

### legend?

```ts
optional legend?: string;
```

Defined in: assets/types.ts:45

Clip-level legend used for inline string frames.

***

### loop

```ts
loop: boolean;
```

Defined in: assets/types.ts:49

Whether the clip loops.
