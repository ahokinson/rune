[**rune**](README.md)

***

[rune](README.md) / TerminalSpriteClipData

# Interface: TerminalSpriteClipData

Defined in: assets/types.ts:75

A named clip in a terminal-sprite asset.

## Properties

### frameDuration

```ts
frameDuration: number;
```

Defined in: assets/types.ts:81

Duration of each frame in milliseconds.

***

### frames

```ts
frames: (
  | string
  | TerminalSpriteFrameData)[];
```

Defined in: assets/types.ts:79

Frames, as inline art strings or frame objects.

***

### legend?

```ts
optional legend?: string;
```

Defined in: assets/types.ts:77

Clip-level legend used for inline string frames.

***

### loop

```ts
loop: boolean;
```

Defined in: assets/types.ts:83

Whether the clip loops.
