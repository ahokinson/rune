[**rune**](README.md)

***

[rune](README.md) / InspectorEdit

# Interface: InspectorEdit

Defined in: inspect/protocol.ts:163

An edit request targeting one field of one entity.

## Properties

### id

```ts
id: number;
```

Defined in: inspect/protocol.ts:167

Stable id of the target entity.

***

### kind

```ts
kind: "edit";
```

Defined in: inspect/protocol.ts:165

Message discriminator (`"edit"`).

***

### prop

```ts
prop: EditableProp;
```

Defined in: inspect/protocol.ts:169

The field to edit.

***

### value

```ts
value: number | boolean;
```

Defined in: inspect/protocol.ts:171

The new value.
