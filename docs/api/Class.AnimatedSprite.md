[**rune**](README.md)

***

[rune](README.md) / AnimatedSprite

# Class: AnimatedSprite\<TFrame\>

Defined in: draw/animatedSprite.ts:42

Time-driven sprite animation player that switches between named clips and
tracks the current frame.

## Example

```ts
const sprite = new AnimatedSprite({
  clips: { idle: { frames: [a, b], frameDuration: 200, loop: true } },
  initial: "idle",
})
sprite.update(16)
sprite.currentFrame()  // advances based on elapsed time
```

## Type Parameters

### TFrame

`TFrame` = [`Sprite`](Class.Sprite.md)

## Constructors

### Constructor

```ts
new AnimatedSprite<TFrame>(options): AnimatedSprite<TFrame>;
```

Defined in: draw/animatedSprite.ts:51

#### Parameters

##### options

[`AnimatedSpriteOptions`](Interface.AnimatedSpriteOptions.md)\<`TFrame`\>

Clips and the initial clip name.

#### Returns

`AnimatedSprite`\<`TFrame`\>

## Accessors

### currentClipName

#### Get Signature

```ts
get currentClipName(): string;
```

Defined in: draw/animatedSprite.ts:63

Name of the clip currently playing.

##### Returns

`string`

## Methods

### clone()

```ts
clone(): AnimatedSprite<TFrame>;
```

Defined in: draw/animatedSprite.ts:127

Make an independent copy sharing the same clip definitions.

#### Returns

`AnimatedSprite`\<`TFrame`\>

A new AnimatedSprite.

***

### currentFrame()

```ts
currentFrame(): TFrame;
```

Defined in: draw/animatedSprite.ts:101

Resolve the frame the clip is currently showing.

#### Returns

`TFrame`

The current frame.

***

### isFinished()

```ts
isFinished(): boolean;
```

Defined in: draw/animatedSprite.ts:116

Whether the current (non-looping) clip has played its last frame.

#### Returns

`boolean`

`true` if a non-looping clip has finished.

***

### play()

```ts
play(name): void;
```

Defined in: draw/animatedSprite.ts:73

Switch to clip `name`, resetting elapsed time. No-op if `name` is the
current clip or unknown.

#### Parameters

##### name

`string`

Clip to play.

#### Returns

`void`

***

### restart()

```ts
restart(): void;
```

Defined in: draw/animatedSprite.ts:83

Reset the current clip to its first frame.

#### Returns

`void`

***

### update()

```ts
update(deltaMilliseconds): void;
```

Defined in: draw/animatedSprite.ts:92

Advance the animation clock.

#### Parameters

##### deltaMilliseconds

`number`

Time to advance in milliseconds.

#### Returns

`void`
