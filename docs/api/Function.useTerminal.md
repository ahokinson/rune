[**rune**](README.md)

***

[rune](README.md) / useTerminal

# Function: useTerminal()

```ts
function useTerminal(): Accessor<{
  height: number;
  width: number;
}>;
```

Defined in: hooks.ts:114

Read the terminal dimensions as a reactive accessor.

## Returns

`Accessor`\<\{
  `height`: `number`;
  `width`: `number`;
\}\>

Accessor yielding `{ width, height }` in cells.
