[**rune**](README.md)

***

[rune](README.md) / encodeWav

# Function: encodeWav()

```ts
function encodeWav(
   samples, 
   sampleRate?, 
   channels?
): Uint8Array;
```

Defined in: audio/synth.ts:143

Encode mono or interleaved-stereo float samples as a 16-bit PCM WAV byte buffer.

## Parameters

### samples

`Float32Array`

Float samples in [-1, 1]; stereo assumed interleaved L,R,L,R,…

### sampleRate?

`number` = `DEFAULT_SAMPLE_RATE`

Samples per second (default [DEFAULT\_SAMPLE\_RATE](Variable.DEFAULT_SAMPLE_RATE.md)).

### channels?

`number` = `1`

1 for mono, 2 for interleaved stereo (default 1).

## Returns

`Uint8Array`

WAV file bytes ready to write or play.
