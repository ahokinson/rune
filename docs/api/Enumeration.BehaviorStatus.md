[**rune**](README.md)

***

[rune](README.md) / BehaviorStatus

# Enumeration: BehaviorStatus

Defined in: ai/behaviorTree.ts:13

Status a [BehaviorNode](Interface.BehaviorNode.md) returns from a tick.

## Enumeration Members

### Failure

```ts
Failure: "failure";
```

Defined in: ai/behaviorTree.ts:17

The node failed its task.

***

### Running

```ts
Running: "running";
```

Defined in: ai/behaviorTree.ts:19

The node is mid-task and wants to be ticked again next frame.

***

### Success

```ts
Success: "success";
```

Defined in: ai/behaviorTree.ts:15

The node completed its task successfully.
