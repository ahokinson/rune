[**rune**](README.md)

***

[rune](README.md) / ToneOptions

# Interface: ToneOptions

Defined in: audio/synth.ts:42

Options describing one tone to render.

## Properties

### durationSeconds

```ts
durationSeconds: number;
```

Defined in: audio/synth.ts:48

Duration in seconds.

***

### envelope?

```ts
optional envelope?: Envelope;
```

Defined in: audio/synth.ts:54

Amplitude envelope (default quick percussive blip).

***

### frequency

```ts
frequency: number;
```

Defined in: audio/synth.ts:46

Frequency in Hz.

***

### sampleRate?

```ts
optional sampleRate?: number;
```

Defined in: audio/synth.ts:52

Sample rate (default [DEFAULT\_SAMPLE\_RATE](Variable.DEFAULT_SAMPLE_RATE.md)).

***

### volume?

```ts
optional volume?: number;
```

Defined in: audio/synth.ts:50

Peak amplitude, 0–1.

***

### waveform?

```ts
optional waveform?: Waveform;
```

Defined in: audio/synth.ts:44

Waveform (default [Waveform.Square](Enumeration.Waveform.md#square)).
