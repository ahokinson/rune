[**rune**](README.md)

***

[rune](README.md) / animatedTile

# Function: animatedTile()

```ts
function animatedTile(
   frames, 
   frameDuration, 
   loop?
): AnimatedSprite<Sprite>;
```

Defined in: draw/tileSet.ts:147

Wrap a list of frames into an animated tile appearance.

## Parameters

### frames

[`Sprite`](Class.Sprite.md)[]

Frames to cycle through.

### frameDuration

`number`

Milliseconds each frame is held.

### loop?

`boolean` = `true`

Whether to wrap after the last frame (default true).

## Returns

[`AnimatedSprite`](Class.AnimatedSprite.md)\<[`Sprite`](Class.Sprite.md)\>

An [AnimatedSprite](Class.AnimatedSprite.md) playing the frames as a single clip.
