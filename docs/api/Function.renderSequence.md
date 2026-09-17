[**rune**](README.md)

***

[rune](README.md) / renderSequence

# Function: renderSequence()

```ts
function renderSequence(notes): Float32Array;
```

Defined in: audio/synth.ts:123

Render a melody (notes played back-to-back) to one mono buffer.

## Parameters

### notes

[`ToneOptions`](Interface.ToneOptions.md)[]

Tones to concatenate.

## Returns

`Float32Array`

Monaural float sample buffer of the whole sequence.
