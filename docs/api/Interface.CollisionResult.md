[**rune**](README.md)

***

[rune](README.md) / CollisionResult

# Interface: CollisionResult

Defined in: physics/moveAndCollide.ts:13

Result of a `moveAndCollide` step: which axes hit, and any bonked ceiling.

## Properties

### ceiling

```ts
ceiling: Rectangle | null;
```

Defined in: physics/moveAndCollide.ts:19

The tile rectangle bonked from below this step, if any.

***

### grounded

```ts
grounded: boolean;
```

Defined in: physics/moveAndCollide.ts:17

`true` if the body landed on a floor this step (downward-facing normal).

***

### hitX

```ts
hitX: boolean;
```

Defined in: physics/moveAndCollide.ts:15

`true` if the X-axis sweep was arrested by an obstacle.
