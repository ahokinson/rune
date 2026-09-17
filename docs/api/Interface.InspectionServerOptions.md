[**rune**](README.md)

***

[rune](README.md) / InspectionServerOptions

# Interface: InspectionServerOptions

Defined in: inspect/server.ts:27

Options for constructing an [InspectionServer](Class.InspectionServer.md).

## Properties

### handle

```ts
handle: ApplicationHandle;
```

Defined in: inspect/server.ts:29

The running application handle to inspect.

***

### intervalMilliseconds?

```ts
optional intervalMilliseconds?: number;
```

Defined in: inspect/server.ts:33

Minimum milliseconds between snapshot broadcasts (default ~15fps).

***

### socketPath

```ts
socketPath: string;
```

Defined in: inspect/server.ts:31

Path to the Unix socket to listen on.
