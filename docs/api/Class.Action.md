[**rune**](README.md)

***

[rune](README.md) / Action

# Class: Action

Defined in: ai/behaviorTree.ts:238

Leaf that runs a function each tick and returns its status. The function may
return Running across ticks for a multi-frame action.

## Implements

- [`BehaviorNode`](Interface.BehaviorNode.md)

## Constructors

### Constructor

```ts
new Action(run): Action;
```

Defined in: ai/behaviorTree.ts:242

#### Parameters

##### run

(`deltaMilliseconds`) => [`BehaviorStatus`](Enumeration.BehaviorStatus.md)

Function called each tick.

#### Returns

`Action`

## Methods

### tick()

```ts
tick(deltaMilliseconds): BehaviorStatus;
```

Defined in: ai/behaviorTree.ts:250

Invoke the wrapped function.

#### Parameters

##### deltaMilliseconds

`number`

Time elapsed since the previous tick.

#### Returns

[`BehaviorStatus`](Enumeration.BehaviorStatus.md)

Whatever `run` returns.

#### Implementation of

[`BehaviorNode`](Interface.BehaviorNode.md).[`tick`](Interface.BehaviorNode.md#tick)
