[**rune**](README.md)

***

[rune](README.md) / InspectionServer

# Class: InspectionServer

Defined in: inspect/server.ts:42

Exposes a running game's live state over a Unix socket for `rune inspect`. The
engine constructs this only when RUNE_INSPECT_SOCKET is set, so it costs
nothing in a normal build. Broadcasts a serialized snapshot on each tick
(throttled) and applies inbound edits/commands to the live scene.

## Constructors

### Constructor

```ts
new InspectionServer(options): InspectionServer;
```

Defined in: inspect/server.ts:55

#### Parameters

##### options

[`InspectionServerOptions`](Interface.InspectionServerOptions.md)

Server configuration.

#### Returns

`InspectionServer`

## Methods

### start()

```ts
start(): void;
```

Defined in: inspect/server.ts:65

Start listening on the configured socket and subscribe to ticks. Pushes an
immediate snapshot to each new client so it isn't blank until the next tick.

#### Returns

`void`

***

### stop()

```ts
stop(): void;
```

Defined in: inspect/server.ts:94

Stop listening, disconnect all clients, and clean up the socket file.

#### Returns

`void`
