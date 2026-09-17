[**rune**](README.md)

***

[rune](README.md) / SweepHit

# Interface: SweepHit

Defined in: physics/boundingBox.ts:38

Result of a swept-AABB collision: the contact time and contact normal of the
first obstacle hit, plus the resolved position of the moving rectangle.

## Properties

### normalX

```ts
normalX: number;
```

Defined in: physics/boundingBox.ts:42

X component of the contact normal (−1, 0, or +1).

***

### normalY

```ts
normalY: number;
```

Defined in: physics/boundingBox.ts:44

Y component of the contact normal (−1, 0, or +1).

***

### obstacle

```ts
obstacle: Rectangle;
```

Defined in: physics/boundingBox.ts:46

The obstacle rectangle that was hit.

***

### positionX

```ts
positionX: number;
```

Defined in: physics/boundingBox.ts:48

Resolved X position of the moving rectangle at the moment of impact.

***

### positionY

```ts
positionY: number;
```

Defined in: physics/boundingBox.ts:50

Resolved Y position of the moving rectangle at the moment of impact.

***

### time

```ts
time: number;
```

Defined in: physics/boundingBox.ts:40

Time of impact in `[0, 1]`, as a fraction of the swept displacement.
