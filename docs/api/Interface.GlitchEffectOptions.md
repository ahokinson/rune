[**rune**](README.md)

***

[rune](README.md) / GlitchEffectOptions

# Interface: GlitchEffectOptions

Defined in: fx/glitch.ts:70

Options for constructing a [GlitchEffect](Class.GlitchEffect.md).

## Properties

### cooldownTicks?

```ts
optional cooldownTicks?: [number, number];
```

Defined in: fx/glitch.ts:78

Idle gap between glitches in ticks [min, max). Default [100, 400).

***

### height

```ts
height: number;
```

Defined in: fx/glitch.ts:74

Canvas height in cells.

***

### kinds?

```ts
optional kinds?: GlitchKind[];
```

Defined in: fx/glitch.ts:76

Which glitch kinds may fire. Default: all.

***

### random?

```ts
optional random?: () => number;
```

Defined in: fx/glitch.ts:80

Injectable Random for deterministic tests. Default Math.random.

#### Returns

`number`

***

### width

```ts
width: number;
```

Defined in: fx/glitch.ts:72

Canvas width in cells.
