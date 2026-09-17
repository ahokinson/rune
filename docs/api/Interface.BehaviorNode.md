[**rune**](README.md)

***

[rune](README.md) / BehaviorNode

# Interface: BehaviorNode

Defined in: ai/behaviorTree.ts:23

A node in a behaviour tree that progresses one tick at a time.

## Methods

### reset()?

```ts
optional reset(): void;
```

Defined in: ai/behaviorTree.ts:32

Clear any in-progress state so the node starts fresh next tick.

#### Returns

`void`

***

### tick()

```ts
tick(deltaMilliseconds): BehaviorStatus;
```

Defined in: ai/behaviorTree.ts:30

Advance the node by one tick.

#### Parameters

##### deltaMilliseconds

`number`

Time elapsed since the previous tick.

#### Returns

[`BehaviorStatus`](Enumeration.BehaviorStatus.md)

The node's status after this tick.
