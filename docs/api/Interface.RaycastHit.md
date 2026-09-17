[**rune**](README.md)

***

[rune](README.md) / RaycastHit

# Interface: RaycastHit

Defined in: physics/raycast.ts:13

Result of a successful [castRay](Function.castRay.md): where and how the ray struck a cell.

## Properties

### cellColumn

```ts
cellColumn: number;
```

Defined in: physics/raycast.ts:17

Column of the blocking cell.

***

### cellRow

```ts
cellRow: number;
```

Defined in: physics/raycast.ts:19

Row of the blocking cell.

***

### distance

```ts
distance: number;
```

Defined in: physics/raycast.ts:15

Perpendicular distance from the origin to the hit (corrected for fish-eye).

***

### hitPoint

```ts
hitPoint: Vector2;
```

Defined in: physics/raycast.ts:23

World-space hit point.

***

### side

```ts
side: "x" | "y";
```

Defined in: physics/raycast.ts:21

Which axis the ray crossed to enter the cell — `"x"` or `"y"`.

***

### wallU

```ts
wallU: number;
```

Defined in: physics/raycast.ts:25

Texture coordinate across the hit wall, in `[0, 1)`.
