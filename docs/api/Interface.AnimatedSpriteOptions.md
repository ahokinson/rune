[**rune**](README.md)

***

[rune](README.md) / AnimatedSpriteOptions

# Interface: AnimatedSpriteOptions\<TFrame\>

Defined in: draw/animatedSprite.ts:21

Options for constructing an [AnimatedSprite](Class.AnimatedSprite.md).

## Type Parameters

### TFrame

`TFrame` = [`Sprite`](Class.Sprite.md)

## Properties

### clips

```ts
clips: Record<string, AnimationClip<TFrame>>;
```

Defined in: draw/animatedSprite.ts:23

Named clips keyed by their lookup name.

***

### initial

```ts
initial: string;
```

Defined in: draw/animatedSprite.ts:25

Name of the clip to play initially.
