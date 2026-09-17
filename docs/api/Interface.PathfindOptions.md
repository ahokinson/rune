[**rune**](README.md)

***

[rune](README.md) / PathfindOptions

# Interface: PathfindOptions

Defined in: ai/pathfind.ts:20

Options for [findPath](Function.findPath.md).

## Properties

### allowDiagonal?

```ts
optional allowDiagonal?: boolean;
```

Defined in: ai/pathfind.ts:24

Allow 8-directional neighbour moves (default 4-directional).

***

### heuristic?

```ts
optional heuristic?: Heuristic;
```

Defined in: ai/pathfind.ts:22

Heuristic used by A*. Defaults to [Heuristic.Manhattan](Enumeration.Heuristic.md#manhattan).

***

### maxIterations?

```ts
optional maxIterations?: number;
```

Defined in: ai/pathfind.ts:26

Search cap to bound worst-case work; returns `null` when exceeded.
