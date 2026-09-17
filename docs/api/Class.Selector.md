[**rune**](README.md)

***

[rune](README.md) / Selector

# Class: Selector

Defined in: ai/behaviorTree.ts:79

Runs children in order until one succeeds (or is Running); fails only if all
fail. The "try A, else B, else C" / fallback node.

## Implements

- [`BehaviorNode`](Interface.BehaviorNode.md)

## Constructors

### Constructor

```ts
new Selector(children): Selector;
```

Defined in: ai/behaviorTree.ts:85

#### Parameters

##### children

[`BehaviorNode`](Interface.BehaviorNode.md)[]

Nodes to try in order.

#### Returns

`Selector`

## Methods

### reset()

```ts
reset(): void;
```

Defined in: ai/behaviorTree.ts:108

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

Defined in: ai/behaviorTree.ts:93

Advance the selector by one tick.

#### Parameters

##### deltaMilliseconds

`number`

Time elapsed since the previous tick.

#### Returns

[`BehaviorStatus`](Enumeration.BehaviorStatus.md)

Running while a child runs, Success on the first success, Failure once all children fail.

#### Implementation of

[`BehaviorNode`](Interface.BehaviorNode.md).[`tick`](Interface.BehaviorNode.md#tick)
