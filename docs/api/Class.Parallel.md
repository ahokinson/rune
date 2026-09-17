[**rune**](README.md)

***

[rune](README.md) / Parallel

# Class: Parallel

Defined in: ai/behaviorTree.ts:126

Ticks every child each tick. Resolves to Success/Failure per `policy`; otherwise
stays Running. Good for "do these at once" (move while scanning).

## Implements

- [`BehaviorNode`](Interface.BehaviorNode.md)

## Constructors

### Constructor

```ts
new Parallel(children, policy?): Parallel;
```

Defined in: ai/behaviorTree.ts:131

#### Parameters

##### children

[`BehaviorNode`](Interface.BehaviorNode.md)[]

Nodes to tick in parallel.

##### policy?

[`ParallelPolicy`](Enumeration.ParallelPolicy.md) = `ParallelPolicy.RequireAll`

How the parallel resolves Success/Failure. Defaults to [ParallelPolicy.RequireAll](Enumeration.ParallelPolicy.md#requireall).

#### Returns

`Parallel`

## Methods

### reset()

```ts
reset(): void;
```

Defined in: ai/behaviorTree.ts:158

Propagate reset to every child.

#### Returns

`void`

#### Implementation of

[`BehaviorNode`](Interface.BehaviorNode.md).[`reset`](Interface.BehaviorNode.md#reset)

***

### tick()

```ts
tick(deltaMilliseconds): BehaviorStatus;
```

Defined in: ai/behaviorTree.ts:142

Advance every child by one tick and resolve per the policy.

#### Parameters

##### deltaMilliseconds

`number`

Time elapsed since the previous tick.

#### Returns

[`BehaviorStatus`](Enumeration.BehaviorStatus.md)

Success/Failure per `policy`, otherwise Running.

#### Implementation of

[`BehaviorNode`](Interface.BehaviorNode.md).[`tick`](Interface.BehaviorNode.md#tick)
