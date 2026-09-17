[**rune**](README.md)

***

[rune](README.md) / resolvePlayerCommand

# Function: resolvePlayerCommand()

```ts
function resolvePlayerCommand(
   platform, 
   path, 
   volume, 
   playerOverride?
): string[];
```

Defined in: audio/context.ts:120

Build the argv to play `path` on the given platform. macOS afplay takes a `-v`
volume multiplier; the Linux/Windows fallbacks play at system volume. Pass
`playerOverride` to force a specific command (e.g. "ffplay" on Linux). Pure and
platform-string-driven so it can be unit-tested without spawning anything.

## Parameters

### platform

`string`

`process.platform`-style string ("darwin", "win32", …).

### path

`string`

File path to play.

### volume

`number`

Linear volume 0–1 (forwarded to afplay's `-v`).

### playerOverride?

`string`

Force a specific player command.

## Returns

`string`[]

Argv array suitable for `spawn`.
