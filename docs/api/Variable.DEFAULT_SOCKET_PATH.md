[**rune**](README.md)

***

[rune](README.md) / DEFAULT\_SOCKET\_PATH

# Variable: DEFAULT\_SOCKET\_PATH

```ts
const DEFAULT_SOCKET_PATH: ".rune/inspect.sock" = ".rune/inspect.sock";
```

Defined in: inspect/protocol.ts:20

Default socket path relative to a project root. `rune dev` (which sets
RUNE_INSPECT_SOCKET) and `rune inspect` both derive this from the cwd, so an
attach needs no configuration when run from the same project directory.
