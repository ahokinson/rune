[**rune**](README.md)

***

[rune](README.md) / parseTerminalLegend

# Function: parseTerminalLegend()

```ts
function parseTerminalLegend(data): Record<string, SpriteLegendEntry>;
```

Defined in: assets/sprite.ts:197

Parse a terminal legend into a character-to-[SpriteLegendEntry](Interface.SpriteLegendEntry.md) map.

## Parameters

### data

[`TerminalLegendData`](TypeAlias.TerminalLegendData.md)

Authored legend data.

## Returns

`Record`\<`string`, [`SpriteLegendEntry`](Interface.SpriteLegendEntry.md)\>

A flat character-to-legend entry map.
