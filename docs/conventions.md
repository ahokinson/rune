# Conventions

The style guide every rune codebase follows. These conventions are enforced by Biome and TypeScript where possible, and by example everywhere else.

## Naming

- **Full words over abbreviations** — `Vector2` not `Vec2`, `Random` not `RNG`, `deltaMilliseconds` not `dt`.
- **Verb forms over agent-nouns** — `castRay()` not `Raycaster`, `renderWalls()` not `Renderer`, `AnimatedSprite` not `SpriteAnimator`.
- **File names don't repeat their directory** — `audio/context.ts`, not `audio/audioContext.ts`.

## Engine vs. shared vs. game

- **Engine** — reusable primitives live in `packages/rune/src/`. If it's something multiple games would want and it's not specific to a game's art or logic, it belongs here.
- **Shared** — code shared across multiple examples but not engine-level (orbit controls, mesh generators, procedural textures, ASCII-font banners) lives in `examples/shared/`. Text/glyph rendering stays here or in opentui — the engine never rasterizes fonts.
- **Game** — specific effects (camera shake, hit-flash, door logic) stay example-side. The engine just makes them easy to compose.

## Imports

A source file reaches another module through the `@/*` path alias (mapped to `packages/rune/src/*` in `tsconfig.json`), never through `../`. Same-directory siblings use a plain `./name` relative import.

```ts
import { Vector3 } from "@/math/vector3"   // cross-module
import { lerp as lerpScalar } from "./scalar"  // same-directory sibling
```

Game code imports from `"@ahokinson/rune"` exclusively — never from internal engine paths.

## The options-object convention

Every entity is constructed from a single options object. Subclasses extend the `*Options` interface:

```ts
export interface PlayerOptions {
  spawn: Vector2
}

export class Player extends AnimatedSpriteEntity {
  constructor(options: PlayerOptions) {
    super({ animation: buildPlayerSprite(), position: options.spawn, zIndex: 10 })
  }
}
```

This is the one convention all entities share. `rune add entity <Name>` generates a stub that follows it.

## The `*Into` out-param idiom

Hot math types (`Vector2`, `Vector3`, `Matrix4`, `Quaternion`) provide three forms of each operation:

- **Allocating** (`add`, `scale`, `normalize`) — returns a new instance. Use for setup and one-shots.
- **In-place** (`addInPlace`, `scaleInPlace`) — mutates `this`, returns `this` for chaining. Use inside per-frame update code.
- **Into** (`Vector2.fromAngleInto(out, ...)`, `Vector2.lerpInto(out, a, b, t)`) — writes into a caller-supplied instance. Use inside render loops to avoid per-frame allocation.

## Fixed update vs. frame update

- **Fixed step** (`useFixedUpdate`, or an entity's `update(deltaMilliseconds)` which the scene advances on the fixed tick): deterministic rate. Put gameplay and physics here — movement, collision, simulation, reading `wasPressed`/`isDown`. This is what makes replays work.
- **Frame update** (`useUpdate`): render rate, variable, can fire several times between ticks. Use only for visuals/interpolation — camera smoothing, render-frame interpolation, visual effects. Never read `wasPressed`/`isDown` here.

Rule of thumb: if it mutates game state, it belongs on the fixed step; if it only affects how the current frame looks, it belongs in `useUpdate`.

`wasPressed()` never double-fires on the fixed step — the engine delivers each press to exactly one tick. `useUpdate` runs at render rate, so a press can be seen multiple times there.

## Bootstrap

A full-screen game is `<Application>` wrapping `<FullscreenCanvas>`. Don't hand-roll `useTerminal()` + a sized `<Canvas>`.

```tsx
export function App() {
  return (
    <Application ticksPerSecond={60}>
      <FullscreenCanvas>
        <World />
      </FullscreenCanvas>
    </Application>
  )
}
```

Need the terminal size to build your world/state? Use the render-prop form:

```tsx
<FullscreenCanvas>{(size) => <Globe width={size.width} height={size.height} />}</FullscreenCanvas>
```

## Input timing

Read **all gameplay input in the fixed step** — `useFixedUpdate`, or an entity's `update()`. The engine delivers each press to exactly one fixed tick, so `wasPressed()` there never double-fires.

```tsx
useFixedUpdate(() => {
  if (controls.wasPressed("confirm")) confirm()
})
```

## Movement

2D platformer movement (gravity, friction, coyote-time + buffered jump, swept tile collision) is [`KinematicBody2D`](api/Class.KinematicBody2D.md) — the kinematic sibling of [`RigidBody2D`](api/Class.RigidBody2D.md). The entity feeds it input each fixed step and reacts to the result; it owns velocity and grounding.

```ts
const result = this.body.step(this.box, { move, jump }, deltaMilliseconds, obstacles)
```

See `examples/overworld/scene/Player.ts`.

## Collision

- **Simple overlap** (pickups, triggers): give the actor a `collisionMask` and an `onCollide()`, the target a matching `collisionLayer`, and run [`detectCollisions(scene)`](api/Function.detectCollisions.md) once per fixed step (after movement). See `examples/overworld/scene/Coin.ts` + `World.tsx`.
- **Rich resolution** (stomp vs. hit vs. star, etc.): keep that in the entity — it's game logic, not a layer test. See `examples/overworld/scene/Player.ts` (`handleEnemies`).

## Animation

Drive an [`AnimatedSprite`](api/Class.AnimatedSprite.md)'s clip from a [`StateMachine`](api/Class.StateMachine.md) with [`playClipForState`](api/Function.playClipForState.md) instead of calling `animation.play()` by hand from transition methods.

```ts
playClipForState(this.ai, this.animation, { walk: "walk", shell: "shell", slide: "shell" })
```

See `examples/overworld/scene/Koopa.ts`.

## Audio

Distance-based sound uses [`playSpatial`](api/Function.playSpatial.md):

```ts
playSpatial(audio, "pickup", { listener: playerPosition, source: coinPosition, range: 8 })
```

Terminal players can't pan, so this is distance-volume only (via [`attenuation`](api/Function.attenuation.md)).

## HUD overlays

An in-game overlay is a screen-space [`Entity2D`](api/Class.Entity2D.md) (high `zIndex`, ignores the camera) that draws into the canvas grid. Compose it from the engine HUD widgets and **anchor** it — never hand-roll `canvas.height - h` or `(canvas.width - w) / 2` cell math.

- [`resolveAnchor`](api/Function.resolveAnchor.md) places a sized box from a nine-point [`Anchor`](api/Enumeration.Anchor.md) (+ margins); [`flowRow`](api/Function.flowRow.md)/[`flowColumn`](api/Function.flowColumn.md) lay out runs of sized items.
- [`drawLabeledPanel`](api/Function.drawLabeledPanel.md) — a titled status card, auto-sized to its title and lines.
- [`drawControlLegend`](api/Function.drawControlLegend.md) — the keys-then-labels footer (`drag orbit  Space pause …`).
- [`drawModal`](api/Function.drawModal.md) — a centered message box (loading / game-over / paused).
- The lower-level meter widgets ([`drawPanel`](api/Function.drawPanel.md), [`drawBar`](api/Function.drawBar.md), [`drawGauge`](api/Function.drawGauge.md), [`drawSparkline`](api/Function.drawSparkline.md), [`drawTicker`](api/Function.drawTicker.md)) compose inside those.

```ts
drawControlLegend(canvas, { controls, keyColor, labelColor, panel, frame }) // anchors bottom-left, sizes itself
```

See `examples/teapot/scene/Hud.ts` and `examples/git-3d/scene/Hud.ts`. A game with a deliberate flat look (the overworld SMB bar) can still draw raw text — but it gets its position from `resolveAnchor`, not arithmetic.

## Menus and buttons

A title screen, pause menu, or action bar uses the interactive controls. State is input-source-agnostic so keyboard and mouse drive the same widget.

- [`Menu`](api/Class.Menu.md) owns cursor state (skips disabled items, wraps); [`drawMenu`](api/Function.drawMenu.md) renders it and returns per-item rects, [`menuItemAt`](api/Function.menuItemAt.md) maps a pointer to an index.
- [`Button`](api/Class.Button.md) hit-tests a [`MouseSnapshot`](api/Interface.MouseSnapshot.md) for hover/click; [`FocusRing`](api/Class.FocusRing.md) moves keyboard focus across a set of controls.
- [`Dialogue`](api/Class.Dialogue.md) + [`drawDialogue`](api/Function.drawDialogue.md) is the typewriter text box ([`wrapText`](api/Function.wrapText.md) handles wrapping).

Drive selection in the fixed step (`menu.next()` on `wasPressed`), draw in `useUpdate`.

## Particles

Build a manual-emit burst (a muzzle flash, coin sparkle, blood spray) with [`burstEmitter`](api/Function.burstEmitter.md) — a [`Particles`](api/Class.Particles.md) at `ratePerSecond: 0` that the owner repositions and fires with `.emit(n)` on a gameplay event. Don't reach for `new Particles({ ... })` directly for bursts.

```ts
const sparks = burstEmitter({ characters: ["*", "+", "."], color, lifetimeMilliseconds: 220, speedRange: [4, 7], angleRange: [-0.4, 0.4], zIndex: 500 })
```

See `examples/tomb/game/particles.ts` and `examples/tamagotui/scene/fx.ts`.

## Scene transitions

Don't hard-cut between scenes. [`SceneTransition`](api/Class.SceneTransition.md) sequences cover → swap → reveal: it raises coverage to 1, fires a callback at the covered midpoint (swap scenes there), then reveals. Advance it with the frame delta and `draw()` it after the scene. [`drawTransition`](api/Function.drawTransition.md) paints a one-off overlay if you're driving coverage yourself (e.g. from a [`Tween`](api/Class.Tween.md)).

```ts
transition.start(() => state.setScreen("game")) // swap fires when fully covered
```

## Game state

- **Single scene** (overworld, tamagotui): a plain **mutable object** built by a `createSession()`/`createPetState()` factory. The sim mutates it on the fixed step; the HUD reads it.
- **Multiple scenes / screen switching** (tomb): hold cross-scene UI state in **Solid signals** so `<SceneSwitch>` reacts. Keep per-frame gameplay state in plain objects even then — signals are for what the UI tree must re-render on.

Pick by whether a screen switch reads the value, not by habit.

## Theme and palette

A game's colors are module-level `Color` constants in a `theme.ts`. Colors that change with game state (day/night, power level) are **derived functions**, not duplicated constant sets — see `examples/tamagotui/scene/sky.ts` (`fieldColor(state)`, `panelColor(state)`). Pass the resolved colors into the HUD widgets each frame; the widgets never reach for a global palette.

## Saving

Persist with [`SaveStore`](api/Class.SaveStore.md) over the snapshot format — `store.save(slot, plainState)` / `store.load(slot)`. The state must be plain data (the same [`Serializable`](api/TypeAlias.Serializable.md) tree [`saveState`](api/Function.saveState.md) takes), so snapshots round-trip and stay replay-comparable.

## Tooling

- **Biome** — 2-space indent, 120-col width, double quotes, semicolons "asNeeded", recommended lint rules. `style/noNonNullAssertion` is off; `suspicious/noExplicitAny` is off only inside `**/src/assets/**` (the slot parsers take `raw: any`).
- **TypeScript** — `strict`, `noImplicitOverride`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `isolatedModules`, `jsx: preserve` with `jsxImportSource: @opentui/solid`, `@/*` → `packages/rune/src/*`.

## Depth-buffer conventions

Two depth-buffer conventions coexist by design:

- [`GridDepthBuffer`](api/Class.GridDepthBuffer.md) — **LARGER = NEARER** (matches `SphereProjection` and the generic `Camera3D` projectors). Methods: `writeIfNearer` / `testNearer`.
- [`ColumnDepthBuffer`](api/Class.ColumnDepthBuffer.md) — **SMALLER = NEARER** (raycaster convention). Methods: `writeIfCloser`.

The deliberately distinct method names prevent the two conventions from being confused at a call site.
