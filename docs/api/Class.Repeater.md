[**rune**](README.md)

***

[rune](README.md) / Repeater

# Class: Repeater

Defined in: ai/behaviorTree.ts:193

Re-runs its child up to `times` (or forever when `times` is undefined), staying
Running between repeats; fails if a repeat fails.

## Implements

- [`BehaviorNode`](Interface.BehaviorNode.md)

## Constructors

### Constructor

```ts
new Repeater(child, times?): Repeater;
```

Defined in: ai/behaviorTree.ts:200

#### Parameters

##### child

[`BehaviorNode`](Interface.BehaviorNode.md)

The node to repeat.

##### times?

`number`

Maximum repeats; undefined means repeat forever.

#### Returns

`Repeater`

## Methods

### reset()

```ts
reset(): void;
```

Defined in: ai/behaviorTree.ts:228

Reset the counter and propagate reset to the child.

#### Returns

`void`

#### Implementation of

[`BehaviorNode`](Interface.BehaviorNode.md).[`reset`](Interface.BehaviorNode.md#reset)

***

### tick()

```ts
tick(deltaMilliseconds): BehaviorStatus;
```

Defined in: ai/behaviorTree.ts:211

Tick the child; on Success, reset it and stay Running until the count is reached.

#### Parameters

##### deltaMilliseconds

`number`

Time elapsed since the previous tick.

#### Returns

[`BehaviorStatus`](Enumeration.BehaviorStatus.md)

Running between repeats, Success when the count is reached, Failure if a repeat fails.

#### Implementation of

[`BehaviorNode`](Interface.BehaviorNode.md).[`tick`](Interface.BehaviorNode.md#tick)
