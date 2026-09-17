[**rune**](README.md)

***

[rune](README.md) / PostProcessPipeline

# Class: PostProcessPipeline

Defined in: fx/pipeline.ts:24

Ordered chain of [PostEffect](TypeAlias.PostEffect.md)s applied to a finished frame.

## Constructors

### Constructor

```ts
new PostProcessPipeline(): PostProcessPipeline;
```

#### Returns

`PostProcessPipeline`

## Accessors

### length

#### Get Signature

```ts
get length(): number;
```

Defined in: fx/pipeline.ts:39

Number of passes in the chain.

##### Returns

`number`

## Methods

### add()

```ts
add(effect): this;
```

Defined in: fx/pipeline.ts:33

Append a pass to the chain.

#### Parameters

##### effect

[`PostEffect`](TypeAlias.PostEffect.md)

The post-processing pass.

#### Returns

`this`

`this` for chaining.

***

### apply()

```ts
apply(canvas, tick?): void;
```

Defined in: fx/pipeline.ts:50

Run every pass in order. Passes that read neighbouring cells snapshot the frame
themselves, so ordering composes cleanly (each sees the previous pass's output).

#### Parameters

##### canvas

[`InMemoryCanvas`](Class.InMemoryCanvas.md)

The composited frame.

##### tick?

`number` = `0`

Current tick number (default 0).

#### Returns

`void`
