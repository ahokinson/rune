[**rune**](README.md)

***

[rune](README.md) / loadYaml

# Function: loadYaml()

```ts
function loadYaml<T>(path): Promise<T>;
```

Defined in: assets/load.ts:19

Read and parse a YAML file asynchronously.

## Type Parameters

### T

`T`

## Parameters

### path

`string`

Filesystem path to the YAML file.

## Returns

`Promise`\<`T`\>

The parsed contents, typed as `T`.
