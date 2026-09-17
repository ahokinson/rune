[**rune**](README.md)

***

[rune](README.md) / KinematicInput

# Interface: KinematicInput

Defined in: physics/kinematicBody2d.ts:40

Per-step input driving a [KinematicBody2D](Class.KinematicBody2D.md).

## Properties

### jump

```ts
jump: boolean;
```

Defined in: physics/kinematicBody2d.ts:47

`true` on the step the jump key was pressed (terminals don't report held keys,
so a single firm impulse is the reliable scheme — hence the buffer + coyote).

***

### move

```ts
move: number;
```

Defined in: physics/kinematicBody2d.ts:42

Horizontal intent in `[-1, 1]` (left … right).
