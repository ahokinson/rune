[**rune**](README.md)

***

[rune](README.md) / KinematicBody2DOptions

# Interface: KinematicBody2DOptions

Defined in: physics/kinematicBody2d.ts:17

Construction options for a [KinematicBody2D](Class.KinematicBody2D.md).

## Properties

### coyoteMilliseconds?

```ts
optional coyoteMilliseconds?: number;
```

Defined in: physics/kinematicBody2d.ts:34

Jump forgiveness. coyote: still jumpable for this long after leaving the ground.
jumpBuffer: a jump pressed this long before landing still fires on touchdown.

***

### friction

```ts
friction: number;
```

Defined in: physics/kinematicBody2d.ts:25

Horizontal deceleration while idle (cells / second²).

***

### gravity

```ts
gravity: number;
```

Defined in: physics/kinematicBody2d.ts:19

Downward acceleration (cells / second²) and the terminal fall speed it builds to.

***

### jumpBufferMilliseconds?

```ts
optional jumpBufferMilliseconds?: number;
```

Defined in: physics/kinematicBody2d.ts:36

See [KinematicBody2DOptions.coyoteMilliseconds](#coyotemilliseconds).

***

### jumpVelocity

```ts
jumpVelocity: number;
```

Defined in: physics/kinematicBody2d.ts:29

Upward impulse applied when a buffered jump fires (cells / second).

***

### maxFall

```ts
maxFall: number;
```

Defined in: physics/kinematicBody2d.ts:21

Terminal downward speed (cells / second).

***

### maxWalk

```ts
maxWalk: number;
```

Defined in: physics/kinematicBody2d.ts:27

Top horizontal speed (cells / second).

***

### walkAccel

```ts
walkAccel: number;
```

Defined in: physics/kinematicBody2d.ts:23

Horizontal acceleration while steering (cells / second²).
