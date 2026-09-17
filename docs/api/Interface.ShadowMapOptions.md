[**rune**](README.md)

***

[rune](README.md) / ShadowMapOptions

# Interface: ShadowMapOptions

Defined in: draw/mesh/shadowMap.ts:26

Options for [ShadowMap](Class.ShadowMap.md).

## Properties

### bias?

```ts
optional bias?: number;
```

Defined in: draw/mesh/shadowMap.ts:55

Relative depth bias that fights self-shadow acne, loosened at grazing angles.
Default 0.004.

***

### distance?

```ts
optional distance?: number;
```

Defined in: draw/mesh/shadowMap.ts:43

How far the light camera sits from `focus`. A large distance with a narrow
`fieldOfView` approximates a parallel sun. Default 5.

***

### extent?

```ts
optional extent?: number;
```

Defined in: draw/mesh/shadowMap.ts:45

World half-extent the map should cover around `focus`. Default 2.2.

***

### fieldOfView?

```ts
optional fieldOfView?: number;
```

Defined in: draw/mesh/shadowMap.ts:50

Light camera field of view (radians). Narrow keeps the projection near
parallel. Default 0.5.

***

### focus?

```ts
optional focus?: object;
```

Defined in: draw/mesh/shadowMap.ts:38

World point the light camera frames. Default the origin.

#### x

```ts
x: number;
```

#### y

```ts
y: number;
```

#### z

```ts
z: number;
```

***

### light

```ts
light: object;
```

Defined in: draw/mesh/shadowMap.ts:36

Direction toward the light (world space); the depth pass renders the scene
from here. Normalised internally.

#### x

```ts
x: number;
```

#### y

```ts
y: number;
```

#### z

```ts
z: number;
```

***

### resolution?

```ts
optional resolution?: number;
```

Defined in: draw/mesh/shadowMap.ts:31

Square depth grid resolution in subpixels. Default 512. Lower it to trade
shadow crispness for the cost of the extra depth pass.
