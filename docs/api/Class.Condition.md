[**rune**](README.md)

***

[rune](README.md) / Condition

# Class: Condition

Defined in: ai/behaviorTree.ts:256

Leaf that succeeds when a predicate is true, else fails — a guard for sequences.

## Implements

- [`BehaviorNode`](Interface.BehaviorNode.md)

## Constructors

### Constructor

```ts
new Condition(predicate): Condition;
```

Defined in: ai/behaviorTree.ts:260

#### Parameters

##### predicate

() => `boolean`

Returns true to succeed, false to fail.

#### Returns

`Condition`

## Methods

### tick()

```ts
tick(_deltaMilliseconds?): BehaviorStatus;
```

Defined in: ai/behaviorTree.ts:268

Evaluate the predicate.

#### Parameters

##### \_deltaMilliseconds?

`number`

Unused.

#### Returns

[`BehaviorStatus`](Enumeration.BehaviorStatus.md)

[BehaviorStatus.Success](Enumeration.BehaviorStatus.md#success) when the predicate holds, else [BehaviorStatus.Failure](Enumeration.BehaviorStatus.md#failure).

#### Implementation of

[`BehaviorNode`](Interface.BehaviorNode.md).[`tick`](Interface.BehaviorNode.md#tick)
