[**rune**](README.md)

***

[rune](README.md) / PostEffect

# Type Alias: PostEffect

```ts
type PostEffect = (canvas, tick?) => void;
```

Defined in: fx/pipeline.ts:21

A full-frame post-processing pass run against the composited canvas. Passes
that need undisturbed neighbours snapshot the frame themselves.

## Parameters

### canvas

[`InMemoryCanvas`](Class.InMemoryCanvas.md)

The composited frame to read and rewrite.

### tick?

`number`

Optional current tick number.

## Returns

`void`
