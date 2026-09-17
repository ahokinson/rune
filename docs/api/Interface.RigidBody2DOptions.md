[**rune**](README.md)

***

[rune](README.md) / RigidBody2DOptions

# Interface: RigidBody2DOptions

Defined in: physics/rigidBody2d.ts:21

Construction options for a [RigidBody2D](Class.RigidBody2D.md).

## Properties

### friction?

```ts
optional friction?: number;
```

Defined in: physics/rigidBody2d.ts:38

Ground friction: fraction of horizontal speed shed per second while grounded.

***

### gravity?

```ts
optional gravity?: number;
```

Defined in: physics/rigidBody2d.ts:31

Downward (+Y) acceleration, world units per second².

***

### height?

```ts
optional height?: number;
```

Defined in: physics/rigidBody2d.ts:29

Box height, in world units.

***

### linearDamping?

```ts
optional linearDamping?: number;
```

Defined in: physics/rigidBody2d.ts:40

Air drag: fraction of speed shed per second on both axes, always.

***

### restitution?

```ts
optional restitution?: number;
```

Defined in: physics/rigidBody2d.ts:36

Fraction of the incoming normal speed returned on impact (0 = stop dead,
1 = perfectly elastic). Applied on floor, ceiling and wall hits.

***

### restThreshold?

```ts
optional restThreshold?: number;
```

Defined in: physics/rigidBody2d.ts:45

Speeds below these (after a collision) are snapped to zero so the body comes
fully to rest instead of jittering.

***

### width?

```ts
optional width?: number;
```

Defined in: physics/rigidBody2d.ts:27

Box width, in world units.

***

### x?

```ts
optional x?: number;
```

Defined in: physics/rigidBody2d.ts:23

Top-left starting X position, in world units.

***

### y?

```ts
optional y?: number;
```

Defined in: physics/rigidBody2d.ts:25

Top-left starting Y position, in world units.
