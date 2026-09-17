[**rune**](README.md)

***

[rune](README.md) / LightSource

# Interface: LightSource

Defined in: light/lightGrid.ts:18

A coloured point light source.

## Properties

### color

```ts
color: Color;
```

Defined in: light/lightGrid.ts:24

Light colour.

***

### intensity?

```ts
optional intensity?: number;
```

Defined in: light/lightGrid.ts:28

Scales the light's contribution; defaults to 1.

***

### radius

```ts
radius: number;
```

Defined in: light/lightGrid.ts:26

Maximum reach in cells; intensity falls off linearly to zero here.

***

### x

```ts
x: number;
```

Defined in: light/lightGrid.ts:20

Origin X in cell units.

***

### y

```ts
y: number;
```

Defined in: light/lightGrid.ts:22

Origin Y in cell units.
