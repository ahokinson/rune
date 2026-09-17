[**rune**](README.md)

***

[rune](README.md) / updateTriggers

# Function: updateTriggers()

```ts
function updateTriggers(scene): void;
```

Defined in: physics/triggers.ts:67

Evaluate every [TriggerVolume](Class.TriggerVolume.md) in `scene` against every other enabled
entity, dispatching enter/stay/exit callbacks.

## Parameters

### scene

[`SceneInstance`](Class.SceneInstance.md)

The scene whose triggers and entities to evaluate.

## Returns

`void`
