[**rune**](README.md)

***

[rune](README.md) / Envelope

# Interface: Envelope

Defined in: audio/synth.ts:30

Attack/Decay/Sustain/Release envelope, all times in seconds except `sustain`
which is the held amplitude (0–1). Defaults give a quick percussive blip.

## Properties

### attack?

```ts
optional attack?: number;
```

Defined in: audio/synth.ts:32

Attack time (rise from 0 to peak) in seconds.

***

### decay?

```ts
optional decay?: number;
```

Defined in: audio/synth.ts:34

Decay time (fall from peak to sustain) in seconds.

***

### release?

```ts
optional release?: number;
```

Defined in: audio/synth.ts:38

Release time (fall from sustain to 0) in seconds.

***

### sustain?

```ts
optional sustain?: number;
```

Defined in: audio/synth.ts:36

Sustained amplitude 0–1 held after decay.
