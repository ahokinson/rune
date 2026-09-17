[**rune**](README.md)

***

[rune](README.md) / parseAnimatedSprite

# Function: parseAnimatedSprite()

```ts
function parseAnimatedSprite<TFrame>(clips, initial): AnimatedSprite<TFrame>;
```

Defined in: assets/animatedSprite.ts:20

Build an [AnimatedSprite](Class.AnimatedSprite.md) from a clip map and the initial clip name.

## Type Parameters

### TFrame

`TFrame`

## Parameters

### clips

`Record`\<`string`, [`AnimationClip`](Interface.AnimationClip.md)\<`TFrame`\>\>

Map of clip name to clip definition.

### initial

`string`

Name of the clip to play first.

## Returns

[`AnimatedSprite`](Class.AnimatedSprite.md)\<`TFrame`\>

A new [AnimatedSprite](Class.AnimatedSprite.md).
