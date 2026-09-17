[**rune**](README.md)

***

[rune](README.md) / Mixer

# Class: Mixer

Defined in: audio/mixer.ts:36

Offline mixer that sums [MixLayer](Interface.MixLayer.md)s into a single buffer.

## Constructors

### Constructor

```ts
new Mixer(sampleRate?): Mixer;
```

Defined in: audio/mixer.ts:42

#### Parameters

##### sampleRate?

`number` = `DEFAULT_SAMPLE_RATE`

Samples per second; must match the layers (default 44100).

#### Returns

`Mixer`

## Properties

### sampleRate

```ts
readonly sampleRate: number = DEFAULT_SAMPLE_RATE;
```

Defined in: audio/mixer.ts:42

Samples per second; must match the layers (default 44100).

## Methods

### add()

```ts
add(layer): this;
```

Defined in: audio/mixer.ts:50

Append a layer.

#### Parameters

##### layer

[`MixLayer`](Interface.MixLayer.md)

The layer to add.

#### Returns

`this`

`this` for chaining.

***

### addAt()

```ts
addAt(
   samples, 
   seconds, 
   gain?, 
   pan?
): this;
```

Defined in: audio/mixer.ts:64

Add a layer offset to begin `seconds` into the mix.

#### Parameters

##### samples

`Float32Array`

Sample buffer to mix in.

##### seconds

`number`

Time offset into the mix.

##### gain?

`number` = `1`

Linear gain (default 1).

##### pan?

`number` = `0`

Stereo pan, −1 … 1 (default 0).

#### Returns

`this`

`this` for chaining.

***

### render()

```ts
render(): MixResult;
```

Defined in: audio/mixer.ts:74

Sum the layers. Output is stereo if any layer is panned, else mono. Samples
are summed (not averaged) and left unclamped here; `encodeWav` clamps on write.

#### Returns

[`MixResult`](Interface.MixResult.md)

The mixed buffer and channel count.

***

### toWav()

```ts
toWav(): Uint8Array;
```

Defined in: audio/mixer.ts:105

Render the mix straight to WAV bytes.

#### Returns

`Uint8Array`

16-bit PCM WAV byte buffer.
