[**rune**](README.md)

***

[rune](README.md) / DebugOverlay

# Function: DebugOverlay()

```ts
function DebugOverlay(props): any;
```

Defined in: DebugOverlay.tsx:38

Renders a small debug HUD pinned to a corner of the terminal. The HUD lists
framesPerSecond, ticksPerSecond, the current tick, mouse position, the active
scene and its entity count, and a PAUSED indicator when the simulation is
paused. Pressing [DebugOverlayProps.toggleKey](Interface.DebugOverlayProps.md#togglekey) toggles visibility.

## Parameters

### props

[`DebugOverlayProps`](Interface.DebugOverlayProps.md)

Component properties.

## Returns

`any`

The Solid element tree (a positioned box, or `null` when hidden).
