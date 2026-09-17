[**rune**](README.md)

***

[rune](README.md) / playSpatial

# Function: playSpatial()

```ts
function playSpatial(
   audio, 
   name, 
   options
): AudioSource | null;
```

Defined in: audio/spatial.ts:59

Play `name` with its volume scaled by distance from the listener. Folds the
distance gain into any explicit `volume`, and skips playback entirely (returns
`null`) once the source is out of range, so off-screen sounds cost nothing.

## Parameters

### audio

[`AudioContext`](Interface.AudioContext.md)

Backend to play through.

### name

`string`

Sound key previously loaded.

### options

[`SpatialPlayOptions`](Interface.SpatialPlayOptions.md)

Listener, source, range, plus ordinary play options.

## Returns

[`AudioSource`](Interface.AudioSource.md) \| `null`

The playing source handle, or `null` if the sound is out of range.
