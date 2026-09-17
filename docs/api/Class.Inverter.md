[**rune**](README.md)

***

[rune](README.md) / Inverter

# Class: Inverter

Defined in: ai/behaviorTree.ts:164

Flips Success ↔ Failure of its child (Running passes through).

## Implements

- [`BehaviorNode`](Interface.BehaviorNode.md)

## Constructors

### Constructor

```ts
new Inverter(child): Inverter;
```

Defined in: ai/behaviorTree.ts:168

#### Parameters

##### child

[`BehaviorNode`](Interface.BehaviorNode.md)

The node to invert.

#### Returns

`Inverter`

## Methods

### reset()

```ts
reset(): void;
```

Defined in: ai/behaviorTree.ts:184

Propagate reset to the child.

#### Returns

`void`

#### Implementation of

[`BehaviorNode`](Interface.BehaviorNode.md).[`reset`](Interface.BehaviorNode.md#reset)

***

### tick()

```ts
tick(deltaMilliseconds): BehaviorStatus;
```

Defined in: ai/behaviorTree.ts:176

Tick the child and invert its status.

#### Parameters

##### deltaMilliseconds

`number`

Time elapsed since the previous tick.

#### Returns

[`BehaviorStatus`](Enumeration.BehaviorStatus.md)

The inverted status of the child.

#### Implementation of

[`BehaviorNode`](Interface.BehaviorNode.md).[`tick`](Interface.BehaviorNode.md#tick)
