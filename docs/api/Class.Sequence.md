[**rune**](README.md)

***

[rune](README.md) / Sequence

# Class: Sequence

Defined in: ai/behaviorTree.ts:40

Runs children in order; fails on the first child that fails, stays Running while
a child is Running, and succeeds only when all children succeed. The "do A then
B then C" node.

## Implements

- [`BehaviorNode`](Interface.BehaviorNode.md)

## Constructors

### Constructor

```ts
new Sequence(children): Sequence;
```

Defined in: ai/behaviorTree.ts:46

#### Parameters

##### children

[`BehaviorNode`](Interface.BehaviorNode.md)[]

Nodes to run in order.

#### Returns

`Sequence`

## Methods

### reset()

```ts
reset(): void;
```

Defined in: ai/behaviorTree.ts:69

Reset the cursor and propagate reset to every child.

#### Returns

`void`

#### Implementation of

[`BehaviorNode`](Interface.BehaviorNode.md).[`reset`](Interface.BehaviorNode.md#reset)

***

### tick()

```ts
tick(deltaMilliseconds): BehaviorStatus;
```

Defined in: ai/behaviorTree.ts:54

Advance the sequence by one tick.

#### Parameters

##### deltaMilliseconds

`number`

Time elapsed since the previous tick.

#### Returns

[`BehaviorStatus`](Enumeration.BehaviorStatus.md)

Running while a child runs, Failure on the first failure, Success once all children succeed.

#### Implementation of

[`BehaviorNode`](Interface.BehaviorNode.md).[`tick`](Interface.BehaviorNode.md#tick)
