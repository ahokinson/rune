[**rune**](README.md)

***

[rune](README.md) / FramePlanes

# Interface: FramePlanes

Defined in: fx/pipeline.ts:59

A read-only copy of a frame's colour planes, taken before a pass writes back, so
neighbour-sampling effects (aberration, bloom) read undisturbed source pixels.

## Properties

### bgB

```ts
bgB: Uint8Array;
```

Defined in: fx/pipeline.ts:77

Background blue plane (0–255 per cell).

***

### bgG

```ts
bgG: Uint8Array;
```

Defined in: fx/pipeline.ts:75

Background green plane (0–255 per cell).

***

### bgR

```ts
bgR: Uint8Array;
```

Defined in: fx/pipeline.ts:73

Background red plane (0–255 per cell).

***

### chars

```ts
chars: Uint16Array;
```

Defined in: fx/pipeline.ts:65

Glyph code per cell.

***

### fgB

```ts
fgB: Uint8Array;
```

Defined in: fx/pipeline.ts:71

Foreground blue plane (0–255 per cell).

***

### fgG

```ts
fgG: Uint8Array;
```

Defined in: fx/pipeline.ts:69

Foreground green plane (0–255 per cell).

***

### fgR

```ts
fgR: Uint8Array;
```

Defined in: fx/pipeline.ts:67

Foreground red plane (0–255 per cell).

***

### height

```ts
height: number;
```

Defined in: fx/pipeline.ts:63

Frame height in cells.

***

### width

```ts
width: number;
```

Defined in: fx/pipeline.ts:61

Frame width in cells.
