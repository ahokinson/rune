[**rune**](README.md)

***

[rune](README.md) / AnimationClip

# Interface: AnimationClip\<TFrame\>

Defined in: draw/animatedSprite.ts:11

A single playable animation: an ordered list of frames with a fixed duration and loop mode.

## Type Parameters

### TFrame

`TFrame` = [`Sprite`](Class.Sprite.md)

## Properties

### frameDuration

```ts
readonly frameDuration: number;
```

Defined in: draw/animatedSprite.ts:15

Milliseconds each frame is held before advancing.

***

### frames

```ts
readonly frames: readonly TFrame[];
```

Defined in: draw/animatedSprite.ts:13

Frames played in sequence.

***

### loop

```ts
readonly loop: boolean;
```

Defined in: draw/animatedSprite.ts:17

Whether playback wraps back to frame 0 after the last frame.
