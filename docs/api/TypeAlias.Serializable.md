[**rune**](README.md)

***

[rune](README.md) / Serializable

# Type Alias: Serializable

```ts
type Serializable = 
  | null
  | boolean
  | number
  | string
  | Serializable[]
  | {
[key: string]: Serializable;
};
```

Defined in: replay/snapshot.ts:15

JSON-like plain data accepted by the snapshot helpers.
