**rune**

***

# rune

Public API barrel for the rune TUI game engine. Every engine export is
re-exported here; game code imports exclusively from `"@ahokinson/rune"`.

Naming collisions are resolved at re-export time: the `Canvas` *interface*
from `draw/canvas` is re-exported as `CanvasSurface` so it doesn't shadow the
`<Canvas>` Solid component, and the `Scene` *class* from `scene/scene` is
re-exported as `SceneInstance` so it doesn't shadow the `<Scene>` component.

## Enumerations

| Enumeration | Description |
| ------ | ------ |
| [Anchor](Enumeration.Anchor.md) | Nine-point anchor for placing a box inside the canvas: the three rows (top/middle/bottom) crossed with the three columns (left/centre/right). |
| [BehaviorStatus](Enumeration.BehaviorStatus.md) | Status a [BehaviorNode](Interface.BehaviorNode.md) returns from a tick. |
| [Cell](Enumeration.Cell.md) | Two-state tile enum used by the maze and dungeon generators. |
| [ColliderKind](Enumeration.ColliderKind.md) | Shape approximation used by the 3D rigid-body solver. |
| [Direction](Enumeration.Direction.md) | Cardinal direction used to index the adjacency rules. |
| [EdgeBit](Enumeration.EdgeBit.md) | Edge bits composing the 4-bit neighbour mask: North=1, East=2, South=4, West=8. |
| [GamepadAxis](Enumeration.GamepadAxis.md) | Analog axes (sticks in `-1..1`, triggers in `0..1`). |
| [GamepadButton](Enumeration.GamepadButton.md) | Standard-mapping gamepad buttons (Xbox/PlayStation layout, named by position so they read the same across brands). Values match the strings used in `"gamepad:<button>"` action bindings. |
| [GlitchKind](Enumeration.GlitchKind.md) | Transient CRT/retro glitch kinds the [GlitchEffect](Class.GlitchEffect.md) can fire. |
| [Heuristic](Enumeration.Heuristic.md) | Distance heuristic for the A* estimator. |
| [InputPhase](Enumeration.InputPhase.md) | Which pass of the frame is currently reading input. A frame runs the fixed simulation step (often several substeps) and then a once-per-frame update pass, and a single physical key press must be observable exactly once in each. The input state keeps a separate press/release edge buffer per phase and returns the one matching the active phase, so gameplay code in the fixed step never sees a press twice when a frame runs multiple substeps, while frame-level code (pause toggles, title screens) still sees it once per frame. |
| [InspectorCommandAction](Enumeration.InspectorCommandAction.md) | Commands the client can send to control the simulation. |
| [InspectorNodeKind](Enumeration.InspectorNodeKind.md) | Which transform/coordinate space a serialized node lives in. Drives how the inspector labels and edits its properties. |
| [MenuOrientation](Enumeration.MenuOrientation.md) | Layout direction for a [Menu](Class.Menu.md) and [drawMenu](Function.drawMenu.md). |
| [MouseButton](Enumeration.MouseButton.md) | Logical mouse buttons. Values match the binding strings used by the action layer (e.g. `"mouse:left"`). |
| [ParallelPolicy](Enumeration.ParallelPolicy.md) | How [Parallel](Class.Parallel.md) resolves its children's statuses into one result. |
| [TileAnchor](Enumeration.TileAnchor.md) | How a marker's tile coordinate maps to a world position. |
| [TransitionKind](Enumeration.TransitionKind.md) | How a [drawTransition](Function.drawTransition.md) overlay fills the canvas as coverage rises. |
| [TransitionPhase](Enumeration.TransitionPhase.md) | Lifecycle phase of a [SceneTransition](Class.SceneTransition.md). |
| [TweenState](Enumeration.TweenState.md) | Lifecycle state of a [Tween](Class.Tween.md). |
| [Waveform](Enumeration.Waveform.md) | Classic chiptune waveforms plus a uniform white-noise option. |
| [WorleyDistance](Enumeration.WorleyDistance.md) | Distance metric used by [Worley2D](Class.Worley2D.md). |

## Classes

| Class | Description |
| ------ | ------ |
| [Action](Class.Action.md) | Leaf that runs a function each tick and returns its status. The function may return Running across ticks for a multi-frame action. |
| [AfplayAudioContext](Class.AfplayAudioContext.md) | macOS preset of [SystemAudioContext](Class.SystemAudioContext.md) (plays through `afplay`). Kept for back-compat and as the obvious choice on macOS; new code can use [SystemAudioContext](Class.SystemAudioContext.md) directly for cross-platform behaviour. |
| [AnimatedSprite](Class.AnimatedSprite.md) | Time-driven sprite animation player that switches between named clips and tracks the current frame. |
| [AnimatedSpriteEntity](Class.AnimatedSpriteEntity.md) | An [Entity2D](Class.Entity2D.md) backed by an [AnimatedSprite](Class.AnimatedSprite.md). |
| [Asset](Class.Asset.md) | Base class for all pack-resolved assets. |
| [AssetPack](Class.AssetPack.md) | A mounted directory of assets, keyed by name. |
| [Blackboard](Class.Blackboard.md) | Typed key/value store shared between agents for coordination. |
| [Button](Class.Button.md) | A canvas-space push button. Its [bounds](Class.Button.md#bounds) are set by [drawButton](Function.drawButton.md) each frame; [update](Class.Button.md#update) reads a [MouseSnapshot](Interface.MouseSnapshot.md) to refresh hover/press and reports a completed click (press then release inside the bounds). |
| [Camera](Class.Camera.md) | View camera combining a world position with a projection. |
| [Camera3D](Class.Camera3D.md) | A free 3D camera: a position + orientation in world space plus a pluggable projector. Geometry is projected/culled through `projector`, so the same camera can drive an orthographic, perspective, or spherical view. |
| [Color](Class.Color.md) | Immutable RGBA colour with channels normalised to 0–1. |
| [ColumnDepthBuffer](Class.ColumnDepthBuffer.md) | Per-column depth buffer using the SMALLER = NEARER convention. |
| [ColumnSpanBuffer](Class.ColumnSpanBuffer.md) | Stores an optional inclusive (startRow, endRow) span per column in a packed `Int16Array`. Unset columns read -1. Used to track filled row ranges during raycast rendering. |
| [Condition](Class.Condition.md) | Leaf that succeeds when a predicate is true, else fails — a guard for sequences. |
| [ConstraintSolver](Class.ConstraintSolver.md) | Steps a network of [PointMass](Class.PointMass.md) instances and [Constraint](Interface.Constraint.md)s: integrates every particle, then satisfies the constraints over several relaxation passes per step. |
| [Cooldown](Class.Cooldown.md) | Cooldown timer that gates an action to at most once per `duration`. Call [Cooldown.tick](Class.Cooldown.md#tick) each frame with the frame delta, then probe [Cooldown.isReady](Class.Cooldown.md#isready) and [Cooldown.fire](Class.Cooldown.md#fire) when the gated action occurs. |
| [Dialogue](Class.Dialogue.md) | A paged, character-by-character text reveal. Drive it from the frame loop with [advance](Class.Dialogue.md#advance); read [visibleText](Class.Dialogue.md#visibletext) to render. [skip](Class.Dialogue.md#skip) completes the current page instantly and [next](Class.Dialogue.md#next) moves on, so a single "confirm" key can skip-then-advance the way dialogue boxes conventionally do. |
| [DistanceConstraint](Class.DistanceConstraint.md) | Hold two particles at `restLength`. `stiffness` in (0, 1] scales the correction per pass: 1 is a rigid rod (taut after enough iterations), lower is springier. |
| [Emitter](Class.Emitter.md) | A self-managing population of pooled items that appear over time, live, then expire. Each `update` expires finished items and, with probability `spawnChance`, spawns one more (up to `capacity`). Particles is one concrete emitter; AttackFeed-style event streams are another. Distinct from EventEmitter (pub/sub) in core/events. |
| [Entity](Class.Entity.md) | Base class for every game object. Subclass as [Entity2D](Class.Entity2D.md) or [Entity3D](Class.Entity3D.md) to add a transform and a `draw` implementation. |
| [Entity2D](Class.Entity2D.md) | A renderable node in a 2D [Scene](Class.SceneInstance.md). |
| [Entity3D](Class.Entity3D.md) | A renderable node in a [Scene3D](Class.Scene3D.md). |
| [EventEmitter](Class.EventEmitter.md) | Type-safe pub/sub emitter keyed by an event map. Listeners are stored in a `Map` of `Set`s so add/remove/emit are all O(1) average and duplicates are ignored. `emit` snapshots the listeners before invoking them, so a listener may safely remove itself or others mid-dispatch. |
| [FilterCanvas](Class.FilterCanvas.md) | Wraps a canvas and runs a stack of [ScreenEffect](Interface.ScreenEffect.md)s over everything drawn through it: each draw call is shifted by the summed `rowOffset(y)` and tinted by the product of every `brightness()`. Effects compose in array order. Drawing code targets a [FilterCanvas](Class.FilterCanvas.md) exactly like a plain canvas; call `postPass` once after the frame is drawn to let effects overlay artifacts onto the underlying canvas. |
| [FlowField](Class.FlowField.md) | Grid of cost-to-goal and steepest-descent directions produced by [FlowField.compute](Class.FlowField.md#compute). |
| [FocusRing](Class.FocusRing.md) | An ordered, wrapping focus cursor over a list of controls. Generic over the control type; pair an `isEnabled` predicate (e.g. reading [Button.enabled](Class.Button.md#enabled)) so traversal skips controls that can't take focus. |
| [FramesPerSecondCounter](Class.FramesPerSecondCounter.md) | Rolling FPS counter. Call [record](Class.FramesPerSecondCounter.md#record) each frame with the frame delta; the counter accumulates frames until at least 250 ms of time has passed, then publishes a fresh frames-per-second value to [value](Class.FramesPerSecondCounter.md#value). Smoothing window is bounded by `sampleCapacity` delta samples. |
| [GamepadState](Class.GamepadState.md) | Mutable gamepad state implementing [GamepadSnapshot](Interface.GamepadSnapshot.md). Maintains two edge buffers per phase (fixed-step and per-frame) so a single press is observable exactly once in each pass even when a frame runs multiple fixed substeps — identical to [KeyboardState](Class.KeyboardState.md). A source (e.g. [pollWebGamepads](Function.pollWebGamepads.md)) pushes the live controller state each frame via [setButton](Class.GamepadState.md#setbutton)/[setAxis](Class.GamepadState.md#setaxis). |
| [GlitchEffect](Class.GlitchEffect.md) | A CRT/retro glitch as a [ScreenEffect](Interface.ScreenEffect.md): it idles for a random cooldown, fires one transient glitch (tear, static, flicker, chroma aberration or block corruption) for a few ticks, then idles again. `rowOffset`/`brightness` feed a [FilterCanvas](Class.FilterCanvas.md) so tears and flicker warp the live frame; `postPass` paints the noisy kinds on top after the frame is drawn. |
| [GridDepthBuffer](Class.GridDepthBuffer.md) | Per-pixel depth buffer using the LARGER = NEARER convention. |
| [InMemoryCanvas](Class.InMemoryCanvas.md) | In-engine [Canvas](Interface.CanvasSurface.md) backed by flat typed arrays for the glyph and colour channels, with a second buffer for diffing against the previous frame. |
| [InputPlayback](Class.InputPlayback.md) | Frame-by-frame player for a recorded input stream. |
| [InputRecorder](Class.InputRecorder.md) | Collects one input frame per fixed tick into a [Recording](Interface.Recording.md). |
| [InspectionServer](Class.InspectionServer.md) | Exposes a running game's live state over a Unix socket for `rune inspect`. The engine constructs this only when RUNE_INSPECT_SOCKET is set, so it costs nothing in a normal build. Broadcasts a serialized snapshot on each tick (throttled) and applies inbound edits/commands to the live scene. |
| [Inverter](Class.Inverter.md) | Flips Success ↔ Failure of its child (Running passes through). |
| [KeyboardState](Class.KeyboardState.md) | Mutable keyboard state implementing [KeyboardSnapshot](Interface.KeyboardSnapshot.md). Maintains two edge buffers per phase (fixed-step and per-frame) so a single physical press is observable exactly once in each pass even when a frame runs multiple fixed substeps. Call [decayHeld](Class.KeyboardState.md#decayheld) from the frame loop to auto-release keys whose terminal never sent a release. |
| [KinematicBody2D](Class.KinematicBody2D.md) | A kinematic platformer body. See the module docstring for the movement model. |
| [LambertMeshShader](Class.LambertMeshShader.md) | A trivial default [MeshShader](Interface.MeshShader.md): Lambert diffuse from a single directional light times a base colour or texture sample. Richer looks belong in the game. |
| [LightGrid](Class.LightGrid.md) | Baked grid of accumulated coloured light intensity. |
| [LitMeshShader](Class.LitMeshShader.md) | One directional light with four switchable modes (Lambert diffuse, Blinn-Phong specular, toon bands, normal debug), optional texture, optional shadow-map lookup, and per-draw emissive glow. Material + mode are mutated before each renderMesh call so a single instance shades multiple meshes. Math is inlined (no per-fragment allocation) to match [LambertMeshShader](Class.LambertMeshShader.md). |
| [Matrix4](Class.Matrix4.md) | A column-major 4×4 matrix, the model transform fed to the triangle rasterizer (renderMesh). Storage is 16 contiguous numbers; element (row r, column c) lives at index c * 4 + r, so columns 0–2 are the basis axes and column 3 is the translation. Follows Vector3's `*Into(out)` idiom: every operation writes into an existing matrix/vector so a render loop never allocates. |
| [Menu](Class.Menu.md) | Cursor state over a list of [MenuItem](Interface.MenuItem.md)s. Navigation skips disabled items and, when `wrap` is set, rolls around the ends. Input-source agnostic: drive it from a keyboard snapshot, an action map, or mouse hit-testing — it only owns the selection. |
| [MeshEntity3D](Class.MeshEntity3D.md) | An [Entity3D](Class.Entity3D.md) that draws an indexed triangle mesh through the renderMesh rasterizer. |
| [Mixer](Class.Mixer.md) | Offline mixer that sums [MixLayer](Interface.MixLayer.md)s into a single buffer. |
| [MouseState](Class.MouseState.md) | Mutable mouse state implementing [MouseSnapshot](Interface.MouseSnapshot.md). Tracks cursor position and per-frame movement delta plus two phase-scoped button edge buffers mirroring [KeyboardState](Class.KeyboardState.md), so a click is observable exactly once per fixed substep and once per frame. |
| [NavMesh](Class.NavMesh.md) | Polygon navigation mesh supporting funnel-string-pulled paths between any two walkable points. |
| [Noise2D](Class.Noise2D.md) | Seeded 2D noise. Two flavours share one lattice hash: `sample` is value noise (a hashed value per integer corner, smootherstep-interpolated) in [0, 1), matching Noise3D's cheap blobby look; `perlin` is gradient noise (Perlin's dot-of-gradient construction) in roughly [-1, 1], which has no directional bias and reads as flowing rather than blobby. Pick value noise for masks and terrain heightfields, Perlin for flow/warp fields. Deterministic for a seed. |
| [Noise3D](Class.Noise3D.md) | Seeded 3D value noise with fractal-brownian-motion summation. Value noise (a hashed value per integer lattice corner, smootherstep-interpolated) rather than gradient/Perlin noise: cheaper, no gradient tables, and the soft blobby output suits volumetric looks like clouds or terrain masks. Sampling in 3D lets callers feed a unit surface vector so a field wraps seamlessly over a sphere — no equirectangular seam or pole pinch. Deterministic for a given seed. |
| [NullAudioContext](Class.NullAudioContext.md) | No-op [AudioContext](Interface.AudioContext.md) that records plays instead of making sound — the test double for assertions about what a game "played". |
| [ObjectPool](Class.ObjectPool.md) | Reusable object pool. [acquire](Class.ObjectPool.md#acquire) returns a recycled instance or creates one; [release](Class.ObjectPool.md#release) returns it to the free list after running the optional `reset` hook. Use this to keep churn-heavy allocations (particles, projectiles, scratch buffers) out of the hot path's GC pressure. |
| [OrbitControl](Class.OrbitControl.md) | Click-and-drag "turntable" orbit for 3D viewers. It owns the drag/spin/resume state machine and exposes the resulting absolute `yaw` and `pitch`; callers read those each frame and apply them to whatever transform or projection they drive (a model matrix, a camera position, a sphere view). While dragging, the auto-spin is suspended and the angles track the cursor relative to the anchor captured on press; after release it pauses briefly, then resumes spinning and glides the tilt back to rest. |
| [OrthographicProjection](Class.OrthographicProjection.md) | Orthographic projection: scales world space by `zoom` around the camera position with no perspective. |
| [OrthographicProjector3D](Class.OrthographicProjector3D.md) | Parallel projection: depth does not affect screen scale. `altitude` lifts the projected offset radially from the viewport centre (so it bows arcs the same way the sphere does). Culls points behind the camera. |
| [Parallel](Class.Parallel.md) | Ticks every child each tick. Resolves to Success/Failure per `policy`; otherwise stays Running. Good for "do these at once" (move while scanning). |
| [Particles](Class.Particles.md) | Pooled 2D particle emitter drawn as a scene entity. |
| [Particles3D](Class.Particles3D.md) | A pooled set of world-space particles drawn as a World3D geometry: each is projected/near-culled/depth-tested exactly like a PointCloud3D point, so a trail rides a rotating surface and hides behind it. Unlike the 2D Particles entity, the simulation step (`update`) is driven by the host and `draw` only renders, since World3D geometries are draw-only. |
| [PerspectiveProjector3D](Class.PerspectiveProjector3D.md) | Pinhole perspective: closer points project larger. Culls points at/behind the near plane and beyond `far`. `altitude` scales the projected offset outward for arc bowing, mirroring the orthographic/sphere behaviour. |
| [PinConstraint](Class.PinConstraint.md) | Pin a particle to a fixed anchor point each pass (a moving attachment point — for a static pin, set the particle's inverseMass to 0 instead). |
| [PixelSprite](Class.PixelSprite.md) | A pixel-art sprite where each cell is a full-color pixel (or transparent). Rendered through `drawPixelBillboard`, two stacked pixels share one terminal cell via the ▀/▄ half-block characters, doubling effective vertical resolution compared to a [Sprite](Class.Sprite.md) of the same cell footprint. |
| [PixelSpriteAsset](Class.PixelSpriteAsset.md) | Asset wrapping one or more pixel sprites (a standalone sprite and/or a set of animation clips) resolved against named pixel legends. |
| [PointCloud3D](Class.PointCloud3D.md) | A set of world-space points (e.g. map markers) projected to single glyphs. |
| [PointMass](Class.PointMass.md) | A Verlet point mass. Position and previous position are both tracked so the implied velocity is `position − previous`; integration advances both. |
| [Polyline3D](Class.Polyline3D.md) | A world-space polyline. Each vertex is projected (culled vertices break the line), consecutive screen points are connected with integer interpolation (depth and `t` interpolated along the way), and each cell is depth-tested when occluding. Vertices are a caller-owned buffer; set `count` to use only a prefix (so the buffer can be reused across frames without reallocating). |
| [PooledSet](Class.PooledSet.md) | A pool-backed set of live items with a fast spawn/expire lifecycle. Items are recycled through an [ObjectPool](Class.ObjectPool.md) so a steady churn of short-lived objects (particles, projectiles, transient events) allocates once and never GCs. The active list is mutated in place; [PooledSet.expire](Class.PooledSet.md#expire) uses swap-pop so removals stay O(1). |
| [PostProcessPipeline](Class.PostProcessPipeline.md) | Ordered chain of [PostEffect](TypeAlias.PostEffect.md)s applied to a finished frame. |
| [Quaternion](Class.Quaternion.md) | A unit quaternion for 3D orientation. Preferred over Euler angles for anything that accumulates rotation over time — it integrates angular velocity without gimbal lock and stays numerically stable under renormalization. Pairs with Matrix4.composeQuaternionInto to build a model matrix for rendering. |
| [Random](Class.Random.md) | Seedable pseudo-random number generator. Deterministic for a given seed, so replays and procedural layouts reproduce exactly. State is a single 32-bit integer mutated in place. |
| [RateCounter](Class.RateCounter.md) | Counts events over a trailing window. Unit-agnostic: callers pass a monotonic clock value to [record](Class.RateCounter.md#record)/[sample](Class.RateCounter.md#sample) (ticks, frames, or milliseconds) and the counter keeps only the entries within `window` of the latest value. Parallels [FramesPerSecondCounter](Class.FramesPerSecondCounter.md), but for arbitrary discrete events. |
| [RaycastProjection](Class.RaycastProjection.md) | First-person raycast projection. Derives the forward and right basis vectors and the camera-plane magnitude from `yaw` and `fieldOfView`, caching them until either changes. Provides per-column view rays for the DDA marcher. |
| [Rectangle](Class.Rectangle.md) | Axis-aligned rectangle. `contains` and `intersects` use half-open intervals on the right/bottom edges so adjacent rectangles don't overlap. |
| [Ref](Class.Ref.md) | A named pointer to another asset, resolved lazily by the pack loader. |
| [Repeater](Class.Repeater.md) | Re-runs its child up to `times` (or forever when `times` is undefined), staying Running between repeats; fails if a repeat fails. |
| [RigidBody2D](Class.RigidBody2D.md) | A translational 2D rigid body (AABB) with gravity, restitution, and friction. |
| [RigidBody3D](Class.RigidBody3D.md) | An impulse-based 3D rigid body resolved against a floor plane. |
| [SaveStore](Class.SaveStore.md) | A directory of named save slots. Each slot is one file holding the stable serialisation of a plain-data snapshot; reads parse it back. Methods are async (file I/O) and never throw on a missing slot — [load](Class.SaveStore.md#load) returns `null` and [has](Class.SaveStore.md#has) returns `false`. |
| [Scene3D](Class.Scene3D.md) | A tree of [Entity3D](Class.Entity3D.md) projected/culled/depth-ordered against one [Camera3D](Class.Camera3D.md) — the 3D counterpart to [Scene](Function.Scene.md). |
| [SceneInstance](Class.SceneInstance.md) | The top-level 2D container: a tree of [Entity2D](Class.Entity2D.md) drawn through one [Camera](Class.Camera.md). |
| [SceneManager](Class.SceneManager.md) | A stack of [Scene](Class.SceneInstance.md)s with one active top-of-stack scene. |
| [SceneTransition](Class.SceneTransition.md) | Sequences a two-phase scene change: cover the screen, run a swap callback at the fully-covered midpoint, then reveal. Advance it with the frame delta and call [draw](Class.SceneTransition.md#draw) after the scene each frame; it owns the timing and coverage so games don't hand-roll the cover→swap→reveal handshake. |
| [Scheduler](Class.Scheduler.md) | Timer registry advanced by an external time source. Schedule one-shot timers with [Scheduler.after](Class.Scheduler.md#after) or repeating timers with [Scheduler.every](Class.Scheduler.md#every), then call [Scheduler.advance](Class.Scheduler.md#advance) each frame with the frame delta to fire due callbacks. Pause-safe: no timer fires while [advance](Class.Scheduler.md#advance) isn't called. |
| [Selector](Class.Selector.md) | Runs children in order until one succeeds (or is Running); fails only if all fail. The "try A, else B, else C" / fallback node. |
| [Sequence](Class.Sequence.md) | Runs children in order; fails on the first child that fails, stays Running while a child is Running, and succeeds only when all children succeed. The "do A then B then C" node. |
| [ShadowMap](Class.ShadowMap.md) | A directional/spot shadow map. Renders caster depth from the light's point of view into its own [SubpixelTarget](Class.SubpixelTarget.md), then answers a lit↔shadowed query for any world point — multiply a surface's direct light by [shadowAt](Class.ShadowMap.md#shadowat) to drop cast and self shadows. The depth pass reuses [renderMesh](Function.renderMesh.md) (with no canvas so nothing blits), and [shadowAt](Class.ShadowMap.md#shadowat) reproduces renderMesh's exact perspective projection so the stored `1/zv` depths line up with the lookup. |
| [SpatialGrid](Class.SpatialGrid.md) | A uniform 2D hash grid that buckets [Entity2D](Class.Entity2D.md) instances by their bounds. |
| [SpatialGrid3D](Class.SpatialGrid3D.md) | A uniform 3D hash grid bucketing items of type `T` by an explicit [AABB3](Interface.AABB3.md). |
| [SphereProjection](Class.SphereProjection.md) | Maps between screen space and a tilted, spinning unit sphere. Owns both directions of the transform so the forward (surface → screen) and inverse (screen → surface) projections stay in lock-step. |
| [SphereProjector](Class.SphereProjector.md) | Adapts the proven SphereProjection (tilt/spin/aspect, lock-step forward and inverse) to the generic Projector3D, so a Camera3D can drive the globe while the actual pixels still come from the battle-tested sphere math. The spin (`rotation`) is owned here and refreshed by the game each frame, like the old per-call SphereView.rotation. |
| [Sprite](Class.Sprite.md) | A 2D grid of optionally transparent, coloured glyphs that can be blitted onto a canvas. |
| [SpriteEntity](Class.SpriteEntity.md) | The simplest renderable: an [Entity2D](Class.Entity2D.md) that draws a single [Sprite](Class.Sprite.md) at its position. |
| [StateMachine](Class.StateMachine.md) | State machine keyed by string state names. |
| [SubpixelTarget](Class.SubpixelTarget.md) | A persistent RGB + depth buffer at twice the terminal's vertical resolution, the render target for [renderMesh](Function.renderMesh.md). Each terminal cell maps to two stacked subpixels — row `2y` is the upper half, `2y+1` the lower — so a frame is resolved to the canvas through the ▀ half block (foreground = upper colour, background = lower). Allocate once per viewport and reuse: `clear` each frame, `resolveTo` to blit. Depth follows LARGER = NEARER (it stores 1/zv), matching the renderer's perspective-correct depth test. |
| [SurfaceMesh3D](Class.SurfaceMesh3D.md) | Renders an implicit surface by inverse-projecting each braille sub-pixel against the sphere (per-cell raycast), driving a game sampler, and writing the cell's far-most surface depth into the buffer so points/arcs occlude correctly. Coupled to SphereProjector because implicit-surface raycasting needs its surface-specialised inverse (`surfaceInto`). |
| [SystemAudioContext](Class.SystemAudioContext.md) | Plays sounds by spawning the platform's command-line audio player — the terminal-friendly way to get audio without a native binding. Resolves the right player per OS, honours per-play volume where the player supports it, and loops by re-spawning on exit. `loadBuffer` writes a runtime-synthesised WAV to a temp file so generated sounds (see ./synth) play the same as loaded ones. |
| [TerminalSpriteAsset](Class.TerminalSpriteAsset.md) | Asset wrapping one or more terminal sprites (a standalone sprite and/or a set of animation clips) resolved against named character legends. |
| [Texture](Class.Texture.md) | A sampleable RGBA bitmap. Pixels are stored row-major in a flat `Uint8ClampedArray` of `width * height * 4` bytes (r, g, b, a per pixel, each 0–255). Sampling is nearest-neighbour with wrapping, so a texture tiles naturally across repeated surface cells — see [TextureSurfaceShader](Class.TextureSurfaceShader.md). |
| [TextureSurfaceShader](Class.TextureSurfaceShader.md) | A [SurfaceShader](Interface.SurfaceShader.md) that paints walls/floors/ceilings from [Texture](Class.Texture.md) lookups instead of hand-written procedural code. Wall texels use the sample's `u`/`v`; floor and ceiling texels use the fractional world position so a texture tiles once per world cell. Supply `shade` to add fog/lighting. |
| [TileLayer](Class.TileLayer.md) | Renders a tile grid through a tile set: a camera-culled pass that looks up each visible cell's appearance (resolving animation and neighbour rules) and draws it, with optional per-tile transient effects layered on top. |
| [TileMap](Class.TileMap.md) | A 2D grid of cells addressed by (column, row). |
| [TileMapAsset](Class.TileMapAsset.md) | An authored tile map loaded through the asset system, so maps sit alongside sprites and themes in an AssetPack manifest. The raw document is parsed by the schema; games subclass this and call [build](Class.TileMapAsset.md#build) from their own `finalize` to turn the legend into concrete cells and attach any domain extras (light grids, theme refs, door bookkeeping). The standalone `loadTileMap` covers code that does not need a pack. |
| [TileMeta](Class.TileMeta.md) | Sparse per-cell side-table keyed by (column, row). |
| [TileSet](Class.TileSet.md) | A legend for rendering: it maps each cell value to how that cell is drawn (and whether it is solid). One animated appearance instance is shared by every cell of that type, so e.g. all coin tiles spin in sync, advanced once per frame by `update`. |
| [Timeline](Class.Timeline.md) | Clock-driven player over a list of [TimelineEvent](Interface.TimelineEvent.md)s. |
| [TriggerVolume](Class.TriggerVolume.md) | An entity that reports overlap enter/stay/exit events against other entities whose bounds intersect it and whose collision layer matches `triggerMask`. |
| [Tween](Class.Tween.md) | Time-driven scalar tween between two values with optional easing, loop, yoyo, and delay. Advance it each frame with [Tween.advance](Class.Tween.md#advance); read the interpolated value via [Tween.value](Class.Tween.md#value) and the lifecycle via [Tween.status](Class.Tween.md#status). Chain `onUpdate`/`onComplete` callbacks for effects. |
| [TweenManager](Class.TweenManager.md) | Registry that advances a collection of [Tween](Class.Tween.md)s together and reaps completed/cancelled ones automatically. Drive it from the frame loop with [TweenManager.advance](Class.TweenManager.md#advance). |
| [Vector2](Class.Vector2.md) | Mutable 2D vector. |
| [Vector3](Class.Vector3.md) | Mutable 3D vector. |
| [Wander](Class.Wander.md) | Wander holds the slowly-drifting target angle that gives smooth, non-jittery random roaming (a jittered point on a circle projected ahead of the agent). |
| [WorldView3D](Class.WorldView3D.md) | The bridge that makes "everything is an entity" hold for 3D: a normal [Entity2D](Class.Entity2D.md) that owns a [Scene3D](Class.Scene3D.md), ticks it each fixed update, and draws it at a viewport. |
| [Worley2D](Class.Worley2D.md) | Seeded 2D Worley (cellular) noise. Space is tiled into unit cells, each holding one feature point at a hashed position; the noise at a sample is the distance to the Nth-nearest feature point. F1 (nearest) gives a bubbly Voronoi field; F2−F1 traces the cell borders, which is the classic "cracked stone / scales / reptile skin" look. Distances are unnormalised world units (a feature point is at most ~1.5 cells away, so F1 stays in roughly [0, 1.5]). Deterministic. |

## Interfaces

| Interface | Description |
| ------ | ------ |
| [AABB3](Interface.AABB3.md) | A 3D axis-aligned bounding box in min/max form. |
| [ActionSnapshot](Interface.ActionSnapshot.md) | Read-only view of an action's current and edge state, mirroring the keyboard/mouse snapshot API but keyed by action name. |
| [AfplayAudioContextOptions](Interface.AfplayAudioContextOptions.md) | - |
| [AnchorOptions](Interface.AnchorOptions.md) | Options for [resolveAnchor](Function.resolveAnchor.md). |
| [AnimatedSpriteEntityOptions](Interface.AnimatedSpriteEntityOptions.md) | Options for constructing an [AnimatedSpriteEntity](Class.AnimatedSpriteEntity.md). |
| [AnimatedSpriteOptions](Interface.AnimatedSpriteOptions.md) | Options for constructing an [AnimatedSprite](Class.AnimatedSprite.md). |
| [AnimationClip](Interface.AnimationClip.md) | A single playable animation: an ordered list of frames with a fixed duration and loop mode. |
| [ApplicationHandle](Interface.ApplicationHandle.md) | Handle exposed to an [Application](Function.Application.md)'s subtree via [ApplicationContext](Variable.ApplicationContext.md). Components and hooks read input, the scene stack, scheduler, tweens, audio and loop signals through this object instead of reaching for globals. |
| [ApplicationProps](Interface.ApplicationProps.md) | Properties for the [Application](Function.Application.md) component. |
| [AssetClass](Interface.AssetClass.md) | Constructor type for an [Asset](Class.Asset.md) subclass. |
| [AssetOptions](Interface.AssetOptions.md) | Options passed to an [Asset](Class.Asset.md) constructor. |
| [AudioContext](Interface.AudioContext.md) | Minimal audio backend: load sounds, play them, and stop everything. |
| [AudioSource](Interface.AudioSource.md) | Handle on a playing sound; `stop()` halts it and `playing` reports liveness. |
| [BehaviorNode](Interface.BehaviorNode.md) | A node in a behaviour tree that progresses one tick at a time. |
| [BillboardEntry](Interface.BillboardEntry.md) | One billboarded actor handed to [renderBillboards](Function.renderBillboards.md). |
| [BillboardRenderContext](Interface.BillboardRenderContext.md) | Options for [renderBillboards](Function.renderBillboards.md). |
| [BloomOptions](Interface.BloomOptions.md) | Options for the [bloom](Function.bloom.md) post effect. |
| [Boid](Interface.Boid.md) | Lightweight agent shape used by the steering behaviours. |
| [BoxStyle](Interface.BoxStyle.md) | Glyphs for the corners and edges of a bordered box. |
| [BuildTileMapOptions](Interface.BuildTileMapOptions.md) | Build-time callbacks and overrides for [buildTileMap](Function.buildTileMap.md). |
| [BurstEmitterOptions](Interface.BurstEmitterOptions.md) | Options for [burstEmitter](Function.burstEmitter.md); the [ParticlesOptions](Interface.ParticlesOptions.md) fields a burst needs. |
| [ButtonDrawOptions](Interface.ButtonDrawOptions.md) | Options for [drawButton](Function.drawButton.md). |
| [ButtonOptions](Interface.ButtonOptions.md) | Options for constructing a [Button](Class.Button.md). |
| [Camera3DOptions](Interface.Camera3DOptions.md) | Options for constructing a [Camera3D](Class.Camera3D.md). |
| [CanvasProps](Interface.CanvasProps.md) | Properties for the [Canvas](Function.Canvas.md) component. |
| [CanvasSurface](Interface.CanvasSurface.md) | Cell-grid render target: a 2D buffer of coloured glyphs. |
| [CellBytes](Interface.CellBytes.md) | Mutable byte-range (0–255) view of a cell, for allocation-free read-back during post-processing. `char` is the glyph code point. |
| [ChromaticAberrationOptions](Interface.ChromaticAberrationOptions.md) | Options for the [chromaticAberration](Function.chromaticAberration.md) post effect. |
| [Collider](Interface.Collider.md) | Precomputed collision geometry for a body. `points` are local contact offsets (box corners or sampled mesh vertices); a sphere carries none and contacts the floor at its single lowest point, `radius` below the centre. `inverseInertia` is the diagonal of I⁻¹ in the body frame (unit mass). |
| [CollisionResult](Interface.CollisionResult.md) | Result of a `moveAndCollide` step: which axes hit, and any bonked ceiling. |
| [Constraint](Interface.Constraint.md) | A constraint over one or more [PointMass](Class.PointMass.md) instances, solved per relaxation pass. |
| [ConstraintSolverOptions](Interface.ConstraintSolverOptions.md) | Options for constructing a [ConstraintSolver](Class.ConstraintSolver.md). |
| [ControlEntry](Interface.ControlEntry.md) | One control hint in a [drawControlLegend](Function.drawControlLegend.md): a key glyph and its action label. |
| [ControlLegendOptions](Interface.ControlLegendOptions.md) | Options for [drawControlLegend](Function.drawControlLegend.md). |
| [CrtOptions](Interface.CrtOptions.md) | Options for the [crt](Function.crt.md) post effect. |
| [DebugOverlayProps](Interface.DebugOverlayProps.md) | Properties for the [DebugOverlay](Function.DebugOverlay.md) component. |
| [DialogueDrawOptions](Interface.DialogueDrawOptions.md) | Options for [drawDialogue](Function.drawDialogue.md); the [LabeledPanelOptions](Interface.LabeledPanelOptions.md) fields plus a wrap width. |
| [DialogueOptions](Interface.DialogueOptions.md) | Options for constructing a [Dialogue](Class.Dialogue.md). |
| [DitherOptions](Interface.DitherOptions.md) | Options for the [dither](Function.dither.md) post effect. |
| [DomainWarpOptions](Interface.DomainWarpOptions.md) | Options for [domainWarp](Function.domainWarp.md), extending [FbmOptions](Interface.FbmOptions.md) with a warp strength. |
| [Draw3DContext](Interface.Draw3DContext.md) | Everything a [Scene3D](Class.Scene3D.md) hands an [Entity3D](Class.Entity3D.md) to draw one frame. |
| [DrawBillboardOptions](Interface.DrawBillboardOptions.md) | Options for [drawBillboard](Function.drawBillboard.md). |
| [DrawPixelBillboardOptions](Interface.DrawPixelBillboardOptions.md) | Options for [drawPixelBillboard](Function.drawPixelBillboard.md). |
| [DungeonOptions](Interface.DungeonOptions.md) | Options for [generateDungeon](Function.generateDungeon.md). |
| [DungeonResult](Interface.DungeonResult.md) | Result of [generateDungeon](Function.generateDungeon.md): the tile map plus the carved rooms. |
| [DungeonRoom](Interface.DungeonRoom.md) | A carved room rectangle in dungeon coordinates. |
| [EmitterOptions](Interface.EmitterOptions.md) | Options for constructing an [Emitter](Class.Emitter.md). |
| [EmitterUpdate](Interface.EmitterUpdate.md) | Per-tick callbacks driving an [Emitter.update](Class.Emitter.md#update) step. |
| [Entity2DOptions](Interface.Entity2DOptions.md) | Options for constructing an [Entity2D](Class.Entity2D.md). |
| [Entity3DOptions](Interface.Entity3DOptions.md) | Options for constructing an [Entity3D](Class.Entity3D.md). |
| [EntityOptions](Interface.EntityOptions.md) | Construction options shared by every entity in the engine. |
| [Envelope](Interface.Envelope.md) | Attack/Decay/Sustain/Release envelope, all times in seconds except `sustain` which is the held amplitude (0–1). Defaults give a quick percussive blip. |
| [FbmOptions](Interface.FbmOptions.md) | Options shared by the fractal helpers. |
| [FieldOfViewOptions](Interface.FieldOfViewOptions.md) | Options for [computeFieldOfView](Function.computeFieldOfView.md). |
| [FirstPersonCameraOptions](Interface.FirstPersonCameraOptions.md) | Options for [createFirstPersonCamera](Function.createFirstPersonCamera.md). |
| [FirstPersonView](Interface.FirstPersonView.md) | Anything with a world position and a facing angle drives the view — the player, a spectator, a cutscene rig. |
| [FlatSample](Interface.FlatSample.md) | One floor or ceiling sub-pixel handed to a [SurfaceShader](Interface.SurfaceShader.md). |
| [FlowFieldOptions](Interface.FlowFieldOptions.md) | Options for [FlowField.compute](Class.FlowField.md#compute). |
| [FocusRingOptions](Interface.FocusRingOptions.md) | Options for constructing a [FocusRing](Class.FocusRing.md). |
| [Fragment](Interface.Fragment.md) | One covered subpixel handed to a [MeshShader](Interface.MeshShader.md). World position and normal are perspective-correct and in world space (the normal is interpolated, not renormalised — shaders that need a unit normal should normalise it). `depth` is view-space distance along the camera forward axis (for fog/debug). |
| [FramePlanes](Interface.FramePlanes.md) | A read-only copy of a frame's colour planes, taken before a pass writes back, so neighbour-sampling effects (aberration, bloom) read undisturbed source pixels. |
| [FullscreenCanvasProps](Interface.FullscreenCanvasProps.md) | Properties for the [FullscreenCanvas](Function.FullscreenCanvas.md) component. |
| [GamepadSnapshot](Interface.GamepadSnapshot.md) | Read-only view of gamepad state used by action mapping and gameplay code. |
| [GamepadStateOptions](Interface.GamepadStateOptions.md) | Construction options for a [GamepadState](Class.GamepadState.md). |
| [GlitchEffectOptions](Interface.GlitchEffectOptions.md) | Options for constructing a [GlitchEffect](Class.GlitchEffect.md). |
| [GridCell](Interface.GridCell.md) | A cell coordinate in a uniform grid. |
| [GridSurfaces](Interface.GridSurfaces.md) | Geometry sampler for [renderGridSurfaces](Function.renderGridSurfaces.md). The domain is infinite — the implementation owns out-of-bounds behaviour. A column terminates when `isSolid` returns `true`, so an adapter that returns `true` (and a finite floor/ceiling) for missing cells produces a closed world. |
| [InspectionServerOptions](Interface.InspectionServerOptions.md) | Options for constructing an [InspectionServer](Class.InspectionServer.md). |
| [InspectorCommand](Interface.InspectorCommand.md) | A command message from the client. |
| [InspectorEdit](Interface.InspectorEdit.md) | An edit request targeting one field of one entity. |
| [InspectorNode](Interface.InspectorNode.md) | A serialized entity. `id` is stable across snapshots (see identity.ts) so the client can preserve selection and target edits. `world` is present on a WorldView3D and holds its nested Scene3D tree. |
| [InspectorProps](Interface.InspectorProps.md) | Only the transform fields relevant to a node's kind are populated. 2D nodes carry Vector2 position/scale + scalar rotation + size; 3D nodes carry Vector3 position/scale + a quaternion rotation. |
| [InspectorSnapshot](Interface.InspectorSnapshot.md) | One full description of the application state at a point in time. `scene` is null when no scene is active (or, in preview mode, carries the project's static structure under a synthetic tree). |
| [InspectorTree](Interface.InspectorTree.md) | A named tree of serialized entities (a scene or a nested world). |
| [KeyboardSnapshot](Interface.KeyboardSnapshot.md) | Read-only view of keyboard state used by action mapping and gameplay code. |
| [KinematicBody2DOptions](Interface.KinematicBody2DOptions.md) | Construction options for a [KinematicBody2D](Class.KinematicBody2D.md). |
| [KinematicInput](Interface.KinematicInput.md) | Per-step input driving a [KinematicBody2D](Class.KinematicBody2D.md). |
| [LabeledPanelOptions](Interface.LabeledPanelOptions.md) | Options for [drawLabeledPanel](Function.drawLabeledPanel.md). |
| [LambertMeshShaderOptions](Interface.LambertMeshShaderOptions.md) | Options for [LambertMeshShader](Class.LambertMeshShader.md). |
| [LightSource](Interface.LightSource.md) | A coloured point light source. |
| [LitMeshShaderOptions](Interface.LitMeshShaderOptions.md) | Options for [LitMeshShader](Class.LitMeshShader.md). |
| [LoopState](Interface.LoopState.md) | Mutable state carried between frames by the fixed-step loop. |
| [MazeOptions](Interface.MazeOptions.md) | Options for [generateMaze](Function.generateMaze.md). |
| [MenuDrawOptions](Interface.MenuDrawOptions.md) | Visual options for [drawMenu](Function.drawMenu.md). |
| [MenuItem](Interface.MenuItem.md) | One entry in a [Menu](Class.Menu.md). |
| [MenuOptions](Interface.MenuOptions.md) | Options for constructing a [Menu](Class.Menu.md). |
| [Mesh](Interface.Mesh.md) | An indexed triangle mesh in flat typed arrays. `positions` and `normals` hold 3 numbers per vertex, `uvs` 2, and `indices` 3 per triangle. `normals`/`uvs` are optional: with no normals each face is flat-shaded from its geometric normal; with no uvs texture coordinates read as (0, 0). |
| [MeshEntity3DOptions](Interface.MeshEntity3DOptions.md) | Options for constructing a [MeshEntity3D](Class.MeshEntity3D.md). |
| [MeshPart](Interface.MeshPart.md) | A growing mesh part in plain arrays, ready to be concatenated by [mergeParts](Function.mergeParts.md). positions/normals hold 3 numbers per vertex, uvs 2, and indices 3 per triangle. |
| [MeshShader](Interface.MeshShader.md) | Per-fragment colour seam, mirroring [SurfaceShader](Interface.SurfaceShader.md). Fills `out` (RGB, 0–255) for the given fragment. The renderer adds no lighting or fog of its own. |
| [MixLayer](Interface.MixLayer.md) | One layer in a mix: a sample buffer plus gain, pan and time offset. |
| [MixResult](Interface.MixResult.md) | Output of [Mixer.render](Class.Mixer.md#render): interleaved samples and the channel count. |
| [ModalOptions](Interface.ModalOptions.md) | Options for [drawModal](Function.drawModal.md). |
| [MouseSnapshot](Interface.MouseSnapshot.md) | Read-only view of mouse state used by action mapping and gameplay code. |
| [NormalizeOptions](Interface.NormalizeOptions.md) | Options for [normalizeMesh](Function.normalizeMesh.md). |
| [ObjectPoolOptions](Interface.ObjectPoolOptions.md) | Construction options for an [ObjectPool](Class.ObjectPool.md). |
| [OrbitOptions](Interface.OrbitOptions.md) | Configuration for an [OrbitControl](Class.OrbitControl.md). All angles are in radians; drag sensitivities are signed so a caller can flip which way a drag turns the view. |
| [OrthographicProjector3DOptions](Interface.OrthographicProjector3DOptions.md) | Options for [OrthographicProjector3D](Class.OrthographicProjector3D.md). |
| [ParseContext](Interface.ParseContext.md) | Context passed to [Slot.parse](Interface.Slot.md#parse), identifying the field being parsed. |
| [Particle3DStyle](Interface.Particle3DStyle.md) | Per-particle draw callback — the game keeps full control of glyph/colour, the same split PointCloud3D/Polyline3D use. Only called for particles that pass projection, the near cull, and (when occluding) the depth test. `lifeFraction` runs 0 (just spawned) -> 1 (about to die) so the style can fade the trail. |
| [Particles3DOptions](Interface.Particles3DOptions.md) | Options for constructing a [Particles3D](Class.Particles3D.md) entity. |
| [ParticlesOptions](Interface.ParticlesOptions.md) | Options for constructing a [Particles](Class.Particles.md) entity. |
| [PathfindOptions](Interface.PathfindOptions.md) | Options for [findPath](Function.findPath.md). |
| [PerspectiveProjector3DOptions](Interface.PerspectiveProjector3DOptions.md) | Options for [PerspectiveProjector3D](Class.PerspectiveProjector3D.md). |
| [PixelSpriteAssetData](Interface.PixelSpriteAssetData.md) | Authored YAML for a `pixelSprite` asset. |
| [PixelSpriteClipData](Interface.PixelSpriteClipData.md) | A named clip in a pixel-sprite asset. |
| [PixelSpriteFrameData](Interface.PixelSpriteFrameData.md) | A single frame in a pixel-sprite clip, with its own legend reference and art. |
| [PlaneMeshOptions](Interface.PlaneMeshOptions.md) | Options for [planeMesh](Function.planeMesh.md). |
| [PlayOptions](Interface.PlayOptions.md) | - |
| [PointCloud3DOptions](Interface.PointCloud3DOptions.md) | Options for [PointCloud3D](Class.PointCloud3D.md). |
| [PointStyle](Interface.PointStyle.md) | Per-point draw callback — the game keeps full control of glyph/colour. Only called for points that pass projection, the near cull, and (when occluding) the depth test. |
| [PoissonOptions](Interface.PoissonOptions.md) | Options for [poissonDisk](Function.poissonDisk.md). |
| [PollWebGamepadsOptions](Interface.PollWebGamepadsOptions.md) | Options for [pollWebGamepads](Function.pollWebGamepads.md). |
| [Polyline3DOptions](Interface.Polyline3DOptions.md) | Options for [Polyline3D](Class.Polyline3D.md). |
| [PolylineStyle](Interface.PolylineStyle.md) | Per-cell draw callback for the connected, depth-interpolated path. `t` is the interpolated param at this cell; `lineIndex` distinguishes pooled polylines. |
| [PolylineVertex](Interface.PolylineVertex.md) | One vertex of a polyline: a world point, an optional radial `altitude` lift (>= 1, bows the line off a surface), and a param `t` (0..1 along the line) the style can map to colour/animation (e.g. a travelling comet head). |
| [PooledSetOptions](Interface.PooledSetOptions.md) | Construction options for a [PooledSet](Class.PooledSet.md). |
| [ProjectedPoint](Interface.ProjectedPoint.md) | A projected screen position with its camera-facing depth. Depth follows the LARGER = NEARER convention shared with GridDepthBuffer. |
| [Projection](Interface.Projection.md) | Project world points to screen space and back, driven by a [Camera](Class.Camera.md). |
| [Projector3D](Interface.Projector3D.md) | Strategy that maps between world space and screen space for a Camera3D. Both directions are provided so forward (point -> screen) and inverse (cell -> ray) projections can stay in lock-step. Implemented by OrthographicProjector3D and PerspectiveProjector3D (generic), and SphereProjector (the globe). |
| [QuaternionData](Interface.QuaternionData.md) | Serialized quaternion. |
| [RaycastHit](Interface.RaycastHit.md) | Result of a successful [castRay](Function.castRay.md): where and how the ray struck a cell. |
| [RaycastProjectionOptions](Interface.RaycastProjectionOptions.md) | Options for [RaycastProjection](Class.RaycastProjection.md). |
| [Recording](Interface.Recording.md) | Serialized input stream plus the seed needed to replay it. |
| [RefResolveContext](Interface.RefResolveContext.md) | Context capable of looking up an asset by name, used during ref resolution. |
| [RenderGridSurfacesContext](Interface.RenderGridSurfacesContext.md) | Options for [renderGridSurfaces](Function.renderGridSurfaces.md). |
| [RenderMeshContext](Interface.RenderMeshContext.md) | Options for [renderMesh](Function.renderMesh.md). |
| [RigidBody2DOptions](Interface.RigidBody2DOptions.md) | Construction options for a [RigidBody2D](Class.RigidBody2D.md). |
| [RigidBody3DOptions](Interface.RigidBody3DOptions.md) | Construction options for a [RigidBody3D](Class.RigidBody3D.md). |
| [SaveStoreOptions](Interface.SaveStoreOptions.md) | Options for constructing a [SaveStore](Class.SaveStore.md). |
| [ScanlineOptions](Interface.ScanlineOptions.md) | Options for [drawScanlines](Function.drawScanlines.md). |
| [Scene3DOptions](Interface.Scene3DOptions.md) | Options for constructing a [Scene3D](Class.Scene3D.md). |
| [SceneProps](Interface.SceneProps.md) | Properties for the [Scene](Function.Scene.md) component. |
| [SceneRendererProps](Interface.SceneRendererProps.md) | Properties for the [SceneRenderer](Function.SceneRenderer.md) component. |
| [SceneSwitchProps](Interface.SceneSwitchProps.md) | Properties for the [SceneSwitch](Function.SceneSwitch.md) component. |
| [SceneTransitionOptions](Interface.SceneTransitionOptions.md) | Options for constructing a [SceneTransition](Class.SceneTransition.md). |
| [ScopedEventBus](Interface.ScopedEventBus.md) | Scoped event bus wrapping an [EventEmitter](Class.EventEmitter.md): `on`/`once` registrations are tracked and unsubscribed automatically when the owning component unmounts. |
| [ScopedTimer](Interface.ScopedTimer.md) | Timer handle returned by [useTimer](Function.useTimer.md) whose pending timers are cleared automatically when the owning component unmounts. |
| [ScreenEffect](Interface.ScreenEffect.md) | Screen-space post-processing hook set. Implement only the hooks an effect needs. |
| [ScreenPoint](Interface.ScreenPoint.md) | A projected screen position with its depth toward the camera (the true surface depth, ignoring any altitude lift, so culling and shading stay correct). |
| [ScreenRay](Interface.ScreenRay.md) | A world-space ray for a screen cell (inverse projection), used for sampling implicit surfaces. `direction` is unit length. |
| [ShadowCaster](Interface.ShadowCaster.md) | One caster handed to [ShadowMap.render](Class.ShadowMap.md#render): a mesh and the model transform that places it in the world this frame. |
| [ShadowMapOptions](Interface.ShadowMapOptions.md) | Options for [ShadowMap](Class.ShadowMap.md). |
| [Slot](Interface.Slot.md) | A parser for one field of an asset's schema. |
| [SpatialPlayOptions](Interface.SpatialPlayOptions.md) | [PlayOptions](Interface.PlayOptions.md) plus the listener/source/range needed for spatial falloff. |
| [SpatialPoint](Interface.SpatialPoint.md) | A position in the game world. `z` is optional so 2D games can pass Vector2-like points and 3D games Vector3-like ones through the same helpers. |
| [SphereMeshOptions](Interface.SphereMeshOptions.md) | Options for [sphereMesh](Function.sphereMesh.md). |
| [SphereProjectionOptions](Interface.SphereProjectionOptions.md) | Options for constructing a [SphereProjection](Class.SphereProjection.md). |
| [SphereView](Interface.SphereView.md) | Where a sphere is drawn this frame. `radius` is the on-screen radius in cells; `rotation` is the spin about the polar axis (radians); `centerX/Y` is the disc centre. Passed per call because it changes every frame. |
| [SpriteCell](Interface.SpriteCell.md) | A single cell of a [Sprite](Class.Sprite.md): glyph, colours, and transparency flag. |
| [SpriteEntityOptions](Interface.SpriteEntityOptions.md) | Options for constructing a [SpriteEntity](Class.SpriteEntity.md). |
| [SpriteLegendEntry](Interface.SpriteLegendEntry.md) | A legend entry mapping an ASCII-art character to a [Sprite](Class.Sprite.md) cell spec. |
| [SpriteLegendEntryData](Interface.SpriteLegendEntryData.md) | One entry in a terminal sprite legend: a character with foreground/background colors. |
| [StateDefinition](Interface.StateDefinition.md) | Callbacks for a single state in a [StateMachine](Class.StateMachine.md). |
| [SurfaceCellResult](Interface.SurfaceCellResult.md) | The result of packing one screen cell of an implicit surface: a braille dot mask plus the cell's foreground/background colours. |
| [SurfaceColor](Interface.SurfaceColor.md) | Mutable RGB out-param, byte range 0–255. Shared by the raycaster and mesh pipelines. |
| [SurfaceMesh3DOptions](Interface.SurfaceMesh3DOptions.md) | Options for [SurfaceMesh3D](Class.SurfaceMesh3D.md). |
| [SurfacePoint](Interface.SurfacePoint.md) | A point on the sphere's surface: its spherical angles (radians, see sphere.ts for the theta/phi convention) plus the camera-space surface normal (also the unit screen-space direction, so it drives screen-fixed lighting directly). |
| [SurfaceSample](Interface.SurfaceSample.md) | One sampled point on an implicit sphere surface: its spherical angles, the camera-space normal (also the unit screen-space lighting direction), and the camera-facing depth (LARGER = NEARER, i.e. the normal's z). Extends the shape SphereProjection writes so it can be filled in place with no extra scratch. |
| [SurfaceSampler](Interface.SurfaceSampler.md) | Game-supplied callback that turns sampled surface points into a drawn cell. The engine walks the disc, runs the 2x4 braille sub-pixel grid per cell, and for each on-surface sub-pixel calls `subpixel`; the game accumulates coverage + shading, then `finishCell` packs it (return false to skip an empty cell). |
| [SurfaceShader](Interface.SurfaceShader.md) | Per-pixel colour seam. Each method is called twice per terminal cell — once for the upper sub-pixel, once for the lower — and fills `out` (0–255). The renderer adds no fog, lighting, or side-shading; implementations own all of that via the map coordinates on the sample. |
| [SweepHit](Interface.SweepHit.md) | Result of a swept-AABB collision: the contact time and contact normal of the first obstacle hit, plus the resolved position of the moving rectangle. |
| [SystemAudioContextOptions](Interface.SystemAudioContextOptions.md) | - |
| [TerminalSize](Interface.TerminalSize.md) | Terminal dimensions in cells, passed to [FullscreenCanvasProps.children](Interface.FullscreenCanvasProps.md#children). |
| [TerminalSpriteAssetData](Interface.TerminalSpriteAssetData.md) | Authored YAML for a `terminalSprite` asset. |
| [TerminalSpriteClipData](Interface.TerminalSpriteClipData.md) | A named clip in a terminal-sprite asset. |
| [TerminalSpriteFrameData](Interface.TerminalSpriteFrameData.md) | A single frame in a terminal-sprite clip, with its own legend reference and art. |
| [TextureSurfaceShaderOptions](Interface.TextureSurfaceShaderOptions.md) | - |
| [TileContext](Interface.TileContext.md) | Passed to a neighbour-aware appearance so it can vary a tile by what surrounds it (a pipe rim only where the tile above is open, ground edges, autotiling). |
| [TileDefinition](Interface.TileDefinition.md) | How a cell value is rendered and whether it blocks movement. |
| [TileLayerOptions](Interface.TileLayerOptions.md) | Options for constructing a [TileLayer](Class.TileLayer.md). |
| [TileMapData](Interface.TileMapData.md) | Result of building a tile map from a [TileMapDocument](Interface.TileMapDocument.md). |
| [TileMapDocument](Interface.TileMapDocument.md) | Authored YAML/document shape of a tile map. |
| [TileMarker](Interface.TileMarker.md) | A scanned-out marker occurrence with its world position. |
| [TimelineEvent](Interface.TimelineEvent.md) | A timestamped event on a timeline. |
| [TimelineOptions](Interface.TimelineOptions.md) | Configuration for a [Timeline](Class.Timeline.md). |
| [ToneOptions](Interface.ToneOptions.md) | Options describing one tone to render. |
| [TorusMeshOptions](Interface.TorusMeshOptions.md) | Options for [torusMesh](Function.torusMesh.md). |
| [TransitionDrawOptions](Interface.TransitionDrawOptions.md) | Options for [drawTransition](Function.drawTransition.md). |
| [TweenOptions](Interface.TweenOptions.md) | Construction options for a [Tween](Class.Tween.md). |
| [Vector2Data](Interface.Vector2Data.md) | Serialized 2D vector. |
| [Vector3Data](Interface.Vector3Data.md) | Serialized 3D vector. |
| [Viewport3D](Interface.Viewport3D.md) | Where a 3D camera is drawing this frame, in screen cells. `radius` is the world-unit -> cell scale on the horizontal axis; `aspectY` squashes the vertical axis for non-square terminal cells (e.g. 0.5 for 2:1 cells). Mirrors SphereView so the sphere consumer and the generic projectors share placement. |
| [WallSample](Interface.WallSample.md) | One wall sub-pixel handed to a [SurfaceShader](Interface.SurfaceShader.md). |
| [WaveCollapseOptions](Interface.WaveCollapseOptions.md) | Options for [generateWaveCollapse](Function.generateWaveCollapse.md). |
| [WaveCollapseResult](Interface.WaveCollapseResult.md) | Result of [generateWaveCollapse](Function.generateWaveCollapse.md). |
| [WorldView3DOptions](Interface.WorldView3DOptions.md) | Options for constructing a [WorldView3D](Class.WorldView3D.md). |
| [WorleyResult](Interface.WorleyResult.md) | Result of a [Worley2D](Class.Worley2D.md) sample: nearest and second-nearest distances. |

## Type Aliases

| Type Alias | Description |
| ------ | ------ |
| [ActionBindings](TypeAlias.ActionBindings.md) | Map of action name to the list of bindings that trigger it. A binding is a keyboard key string, a `"mouse:<button>"` string (`left`/`right`/`middle`), or a `"gamepad:<button>"` string (a [GamepadButton](Enumeration.GamepadButton.md) value, e.g. `"gamepad:south"`). |
| [ApplicationEventMap](TypeAlias.ApplicationEventMap.md) | Event payload map emitted by [ApplicationHandle.events](Interface.ApplicationHandle.md#events). |
| [AssetSchema](TypeAlias.AssetSchema.md) | A read-only mapping of field name to [Slot](Interface.Slot.md) describing an asset's schema. |
| [BoxStyleName](TypeAlias.BoxStyleName.md) | Names of the built-in [boxStyles](Variable.boxStyles.md) sets. |
| [CellPredicate](TypeAlias.CellPredicate.md) | Predicate over a cell coordinate — used to test whether a cell blocks a ray/line. |
| [CollisionLayer](TypeAlias.CollisionLayer.md) | A 32-bit collision layer (a single bit by convention). |
| [ColorData](TypeAlias.ColorData.md) | Authored color value: a hex string or an RGB/RGBA byte tuple. |
| [DebugOverlayCorner](TypeAlias.DebugOverlayCorner.md) | Corner of the terminal the [DebugOverlay](Function.DebugOverlay.md) pins itself to. |
| [EasingFunction](TypeAlias.EasingFunction.md) | A function mapping a normalized time `t` in [0, 1] to an eased value. |
| [EditableProp](TypeAlias.EditableProp.md) | The transform/state fields the server accepts edits for. 3D rotation (a quaternion) is intentionally read-only — nudging raw components is not meaningful, so it is omitted here. |
| [EventListener](TypeAlias.EventListener.md) | Listener function for an event whose payload is `TPayload`. |
| [FixedUpdateCallback](TypeAlias.FixedUpdateCallback.md) | Callback invoked once per fixed-update tick. |
| [FlatTextureLookup](TypeAlias.FlatTextureLookup.md) | Picks the texture for a floor or ceiling surface, or `null` to fall back to `background`. |
| [ForceField](TypeAlias.ForceField.md) | Force field function: add acceleration onto `out` for a particle at `position` with `velocity`. |
| [InspectorMessage](TypeAlias.InspectorMessage.md) | Anything the client may send to the server. |
| [LayerMask](TypeAlias.LayerMask.md) | A 32-bit mask OR-ing any number of [CollisionLayer](Variable.CollisionLayer.md)s. |
| [LitMeshShaderMode](TypeAlias.LitMeshShaderMode.md) | Shading mode selected by [LitMeshShader.mode](Class.LitMeshShader.md#mode): `lambert`, `phong`, `toon`, or `normals`. |
| [NavPolygon](TypeAlias.NavPolygon.md) | A convex polygon expressed as its vertex list (in polygon order). |
| [NoiseSampler2D](TypeAlias.NoiseSampler2D.md) | A 2D noise sampler: maps `(x, y)` to a scalar value. |
| [Palette](TypeAlias.Palette.md) | A named lookup from colour name to [Color](Class.Color.md). |
| [PanelBezel](TypeAlias.PanelBezel.md) | Selects a panel's bezel look: `"block"` draws the chunky block-character frame; any other value is a [BoxStyleName](TypeAlias.BoxStyleName.md) (`"single"`/`"double"`/…) drawn via [drawBox](Function.drawBox.md). |
| [PixelLegendData](TypeAlias.PixelLegendData.md) | Pixel legend data: a character-to-color map with optional `extends` for inheritance from another named legend. `null` colors mean "no fill". |
| [PostEffect](TypeAlias.PostEffect.md) | A full-frame post-processing pass run against the composited canvas. Passes that need undisturbed neighbours snapshot the frame themselves. |
| [SceneEventMap](TypeAlias.SceneEventMap.md) | Event map emitted by a [Scene](Class.SceneInstance.md) via its [EventEmitter](Class.EventEmitter.md). |
| [Serializable](TypeAlias.Serializable.md) | JSON-like plain data accepted by the snapshot helpers. |
| [SpriteAssetData](TypeAlias.SpriteAssetData.md) | Union of authored sprite asset data (pixel or terminal). |
| [TerminalLegendData](TypeAlias.TerminalLegendData.md) | Terminal legend data: a character-to-legend entry map. |
| [TileAppearance](TypeAlias.TileAppearance.md) | What a cell looks like: a fixed sprite, an animated sprite the tile set keeps ticking, or a function that chooses a sprite from its surroundings. |
| [TimerId](TypeAlias.TimerId.md) | Opaque handle identifying a scheduled timer; returned by [Scheduler.after](Class.Scheduler.md#after)/[Scheduler.every](Class.Scheduler.md#every). |
| [UpdateCallback](TypeAlias.UpdateCallback.md) | Callback invoked once per rendered frame. |
| [WallTextureLookup](TypeAlias.WallTextureLookup.md) | Picks the texture for a surface, or `null` to fall back to `background`. |

## Variables

| Variable | Description |
| ------ | ------ |
| [Angle](Variable.Angle.md) | Radians/degrees conversion and shortest-arc interpolation helpers. |
| [ApplicationContext](Variable.ApplicationContext.md) | Solid context holding the current [ApplicationHandle](Interface.ApplicationHandle.md) (or `null`). |
| [boxStyles](Variable.boxStyles.md) | Named box-drawing glyph sets: `single`, `double`, `rounded`, `heavy`, `ascii`. |
| [BRAILLE\_BITS](Variable.BRAILLE_BITS.md) | Dot bit for each [row][col] of the 2x4 grid, matching the U+2800 layout. |
| [BRAILLE\_COLS](Variable.BRAILLE_COLS.md) | Number of sub-pixel columns packed into one braille cell. |
| [BRAILLE\_ROWS](Variable.BRAILLE_ROWS.md) | Number of sub-pixel rows packed into one braille cell. |
| [CanvasContext](Variable.CanvasContext.md) | Solid context holding the canvas accessor from the nearest `<Canvas>` (or `null`). |
| [CollisionLayer](Variable.CollisionLayer.md) | Helpers for building and testing [CollisionLayer](Variable.CollisionLayer.md)s and [LayerMask](TypeAlias.LayerMask.md)s. |
| [DEFAULT\_CHAR\_RAMP](Variable.DEFAULT_CHAR_RAMP.md) | Default ramp from darkest (space) to brightest, for mapping a 0..1 brightness to a shade. |
| [DEFAULT\_SAMPLE\_RATE](Variable.DEFAULT_SAMPLE_RATE.md) | Default sample rate: 44.1 kHz CD audio. |
| [DEFAULT\_SOCKET\_PATH](Variable.DEFAULT_SOCKET_PATH.md) | Default socket path relative to a project root. `rune dev` (which sets RUNE_INSPECT_SOCKET) and `rune inspect` both derive this from the cwd, so an attach needs no configuration when run from the same project directory. |
| [Easing](Variable.Easing.md) | Collection of common easing functions. |
| [INSPECT\_PROTOCOL\_VERSION](Variable.INSPECT_PROTOCOL_VERSION.md) | Protocol version for the inspection channel. |
| [Keys](Variable.Keys.md) | Map of friendly key aliases to their `event.key` string values. Use these constants instead of raw strings so renames stay in one place. |
| [MESH\_DEFAULT\_CLEAR](Variable.MESH_DEFAULT_CLEAR.md) | Re-export so callers can build a default clear colour without a separate import. |
| [Palette](Variable.Palette.md) | Built-in palettes plus a [define](Variable.Palette.md#define) helper. |
| [pixelSprite](Variable.pixelSprite.md) | Slot that parses a standalone [PixelSprite](Class.PixelSprite.md) from inline pixel-sprite data. |
| [SceneContext](Variable.SceneContext.md) | Solid context holding the current [Scene](Class.SceneInstance.md) (or `null`). |
| [terminalSprite](Variable.terminalSprite.md) | Slot that parses a standalone terminal [Sprite](Class.Sprite.md) from inline terminal-sprite data. |

## Functions

| Function | Description |
| ------ | ------ |
| [advanceLoop](Function.advanceLoop.md) | Drain `deltaMilliseconds` of wall-clock time into fixed `stepMilliseconds` ticks, invoking `onTick` for each substep. Caps the accumulator to prevent the "spiral of death" when the sim can't keep up with real time. |
| [alignment](Function.alignment.md) | Steer toward the average heading of neighbours within `radius` — aligns a flock. |
| [animatedTile](Function.animatedTile.md) | Wrap a list of frames into an animated tile appearance. |
| [Application](Function.Application.md) | Mounts a rune application: starts the renderer, wires the per-frame callback that advances the fixed-step loop, input phases, tweens and scheduler, and provides an [ApplicationHandle](Interface.ApplicationHandle.md) to descendants via [ApplicationContext](Variable.ApplicationContext.md). Cleans everything up (and, in standalone runs, exits the process) on unmount. |
| [applyEdit](Function.applyEdit.md) | Apply a single whitelisted edit to an entity. Unknown/irrelevant props for the entity's kind are ignored. Re-sorts the owning container when zIndex changes so the new draw/update order takes effect on the next pass. |
| [arrive](Function.arrive.md) | Seek `target`, but ramp the speed down inside `slowRadius` so the agent eases to a stop on it instead of orbiting. |
| [attenuation](Function.attenuation.md) | Linear distance falloff: full volume at the listener, silent at `range` and beyond. Returns a 0–1 gain suitable for [PlayOptions.volume](Interface.PlayOptions.md#volume). |
| [autoTile](Function.autoTile.md) | Build a neighbour-aware [TileAppearance](TypeAlias.TileAppearance.md) from a 16-entry sprite table indexed by the edge mask. Drop the result straight into `TileSet.define({ appearance })`. |
| [bloom](Function.bloom.md) | Build a bloom [PostEffect](TypeAlias.PostEffect.md). |
| [boxCollider](Function.boxCollider.md) | An oriented box sized to the mesh's bounding half-extents: contacts at the eight corners, box inertia tensor. |
| [boxInverseInertia](Function.boxInverseInertia.md) | Inverse diagonal inertia of a solid box with half-extents `half` and unit mass: I = (1/3)·diag(hy²+hz², hx²+hz², hx²+hy²). |
| [brailleGlyph](Function.brailleGlyph.md) | Glyph for a dot mask. |
| [brightnessToChar](Function.brightnessToChar.md) | Pick a glyph from `ramp` for a 0..1 brightness. Out-of-range values clamp to the ends of the ramp. |
| [buildTileMap](Function.buildTileMap.md) | Build a tile map from an authored document. The terrain grid comes from `TileMap.fromString` over the legend; marker symbols are scanned out of the same layout into world-positioned TileMarkers. This is the shared core both the standalone loader and `TileMapAsset` delegate to. |
| [burstEmitter](Function.burstEmitter.md) | Build a manual-emit [Particles](Class.Particles.md) emitter — `ratePerSecond` 0, so nothing spawns until [Particles.emit](Class.Particles.md#emit) fires on a gameplay event (a muzzle flash, coin sparkle, blood spray, brick shatter). Defaults the origin to `(0, 0)` (the owner repositions it each frame) and the pool to 64, and applies `zIndex` when given. Continuous effects can start here and raise `ratePerSecond` at runtime. |
| [Canvas](Function.Canvas.md) | Mounts a cell-based canvas: creates a `FrameBufferRenderable`, wraps it in a frame-diffing FrameDiffCanvas, forwards mouse events to the application's mouse state, and provides the surface via [CanvasContext](Variable.CanvasContext.md). Tears down the renderable on cleanup. |
| [castRay](Function.castRay.md) | Cast a ray through a uniform cell grid using DDA, returning the first cell `isBlocking` accepts. An optional `out` [RaycastHit](Interface.RaycastHit.md) is filled in place to avoid per-cast allocation. |
| [catmullRom](Function.catmullRom.md) | Catmull–Rom interpolation of one scalar lane between p1 and p2. p0 and p3 are the neighbouring knots that set the tangents, t runs 0..1 across the p1→p2 span. |
| [cellAt](Function.cellAt.md) | Map a world-space point to its containing grid cell. |
| [checkerTexture](Function.checkerTexture.md) | A two-tone checkerboard of `cells × cells` squares. Reads how light wraps around a surface at a glance. |
| [chromaticAberration](Function.chromaticAberration.md) | Build a chromatic-aberration [PostEffect](TypeAlias.PostEffect.md). |
| [clamp](Function.clamp.md) | Clamp `value` to `[low, high]`. |
| [cohesion](Function.cohesion.md) | Steer toward the average position of neighbours within `radius` — pulls a flock together. |
| [colliderFor](Function.colliderFor.md) | Build the collider of the requested shape for `mesh`. |
| [colorToRGBA](Function.colorToRGBA.md) | Convert a [Color](Class.Color.md) to an opentui `RGBA` instance. |
| [computeFieldOfView](Function.computeFieldOfView.md) | Compute a symmetric, artifact-free field of view via recursive shadowcasting. `reveal` is called once per visible cell (including the origin). |
| [contains](Function.contains.md) | Test whether `point` lies inside `rectangle` (edges inclusive). |
| [createActionMap](Function.createActionMap.md) | Build an [ActionSnapshot](Interface.ActionSnapshot.md) from a binding map plus the current keyboard and (optionally) mouse and gamepad snapshots. Mouse/gamepad bindings are only consulted when the corresponding snapshot is supplied. |
| [createFirstPersonCamera](Function.createFirstPersonCamera.md) | Create a first-person [Camera](Class.Camera.md) with a [RaycastProjection](Class.RaycastProjection.md) at the origin, facing +X. |
| [createLoopState](Function.createLoopState.md) | Create a fresh [LoopState](Interface.LoopState.md) with a zeroed accumulator and tick. |
| [crt](Function.crt.md) | Build a CRT vignette + scanline [PostEffect](TypeAlias.PostEffect.md). |
| [cubeMesh](Function.cubeMesh.md) | A cube of edge length `size`, spanning `[-size/2, size/2]³`. Built as six independent quads so each face gets a flat outward normal and its own uv square (shared-vertex cubes average normals across edges and look unhelpfully smooth). |
| [data](Function.data.md) | Build a slot that returns raw data, optionally projected through `pick`. |
| [DebugOverlay](Function.DebugOverlay.md) | Renders a small debug HUD pinned to a corner of the terminal. The HUD lists framesPerSecond, ticksPerSecond, the current tick, mouse position, the active scene and its entity count, and a PAUSED indicator when the simulation is paused. Pressing [DebugOverlayProps.toggleKey](Interface.DebugOverlayProps.md#togglekey) toggles visibility. |
| [detectCollisions](Function.detectCollisions.md) | Dispatch `onCollide()` to overlapping entities, the solid-overlap counterpart to `updateTriggers()`. An entity is an "actor" when it defines both a `collisionMask` and an `onCollide` handler; it receives a callback for every other root entity whose `collisionLayer` matches that mask and whose AABB it overlaps this step. |
| [directionalForce](Function.directionalForce.md) | Constant directional force (wind, buoyancy). Gravity is just [directionalForce](Function.directionalForce.md) with a downward vector, but Particles already has a dedicated gravity option. |
| [directionToScreenPlane](Function.directionToScreenPlane.md) | Project a 3D direction onto the screen XY plane and renormalize to a 2D unit vector. Useful for tying screen-space effects (e.g. an atmospheric rim) to a light direction so they brighten on the same limb the surface highlight sits on. |
| [dither](Function.dither.md) | Build an ordered-dithering [PostEffect](TypeAlias.PostEffect.md). |
| [domainWarp](Function.domainWarp.md) | Domain warping: offset the lookup into `sampler` by an fbm of `warp`. The classic two-pass swirl — feed the same noise as both `sampler` and `warp` for a self-similar marbled field, or different noises for layered turbulence. |
| [drag](Function.drag.md) | Velocity-proportional drag (air resistance), `coefficient` ≥ 0. |
| [drawBar](Function.drawBar.md) | Draw a horizontal magnitude bar `cells` wide. `frac` (clamped 0..1) fills `fillChar` (default `█`; pass `▓` for a softer ramp look) left-to-right with an eighth-accurate end cell; the remainder is `░` in `trackCol` over `bg` so the bar's full extent still reads when nearly empty. |
| [drawBillboard](Function.drawBillboard.md) | Draw a billboarded [Sprite](Class.Sprite.md) at `worldPosition` into `canvas`, occluded by `depthBuffer`. The sprite faces the camera and is scaled by perspective; each covered cell is depth-tested against the column and per-cell buffers. |
| [drawBox](Function.drawBox.md) | Draw a bordered box using a named [BoxStyleName](TypeAlias.BoxStyleName.md) glyph set. Does nothing if `width` or `height` is less than 2. |
| [drawButton](Function.drawButton.md) | Draw `button` as a ` label ` chip at `(x, y)` in the colours for its current state, recording the drawn rectangle into [Button.bounds](Class.Button.md#bounds) so a subsequent [Button.update](Class.Button.md#update) can hit-test it. |
| [drawCircle](Function.drawCircle.md) | Draw a single-glyph circle outline using the midpoint algorithm. |
| [drawControlLegend](Function.drawControlLegend.md) | Draw a one-line control legend — a framed panel that walks `controls` left-to-right, each key in `keyColor` and its label in `labelColor`. Auto-sizes to its contents and anchors itself, so callers don't measure or place it by hand. This is the keys-then-labels footer most HUDs carry. |
| [drawDialogue](Function.drawDialogue.md) | Draw `dialogue`'s currently visible text in a labelled panel `width` cells wide, wrapping to fit, with an advance indicator appended once the page completes. |
| [drawFilledRectangle](Function.drawFilledRectangle.md) | Draw a single-glyph filled rectangle. |
| [drawGauge](Function.drawGauge.md) | Draw a segmented gauge meter: `[████████░░]` with `cells` inner segments. Filled segments use `fillCol`, the remainder `trackCol`. Returns the x just past the closing bracket so callers can place a label after it. |
| [drawLabeledPanel](Function.drawLabeledPanel.md) | Draw a titled status card: a framed panel sized to its `title` and `lines`, with each line printed inside. Replaces the hand-rolled `inner`/`width` measuring and `fillRectangle` + `drawPanel` + `forEach(drawText)` boilerplate HUDs repeat. |
| [drawLine](Function.drawLine.md) | Draw a single-glyph line between two points using Bresenham's algorithm. |
| [drawMenu](Function.drawMenu.md) | Render `menu` and return each item's clickable [Rectangle](Class.Rectangle.md) (same order as `menu.items`) so callers can hit-test the mouse. A vertical menu prints one item per row with a `▶` caret on the selection; a horizontal menu prints ` label ` chips, the selection drawn inverted. Disabled items render dimmed. |
| [drawModal](Function.drawModal.md) | Draw a centred message box — a framed `title` with an optional `detail` line under it, anchored to the middle of the canvas. The "loading"/"game over"/"not a git repo" modal HUDs reach for. |
| [drawPanel](Function.drawPanel.md) | Draw a framed panel. `bezel: "block"` draws the chunky block-character frame (▛▀▜ / ▙▄▟ / ▌▐), filled with `panel` and outlined in `frame`; any other `bezel` is a [BoxStyleName](TypeAlias.BoxStyleName.md) passed to [drawBox](Function.drawBox.md) in `frame` over `panel`. With a `title`, the line bezel insets the title into the top edge as ┤ TITLE ├ so the panel reads as a labelled card rather than a bare rectangle. Does nothing if `w` or `h` is less than 2. |
| [drawPixelBillboard](Function.drawPixelBillboard.md) | Draw a billboarded [PixelSprite](Class.PixelSprite.md) at `worldPosition` into `canvas`, occluded by `depthBuffer`. Each terminal cell covers two sprite half-rows; the covered pixels are averaged into upper/lower colours and emitted via the ▀/▄ half blocks. Each covered cell is depth-tested against the column and per-cell buffers. |
| [drawPixelSprite](Function.drawPixelSprite.md) | Blit a PixelSprite straight onto a 2D canvas (no camera or projection). Two stacked pixels share one terminal cell via the ▀/▄ half-blocks: the upper pixel paints the foreground of "▀" and the lower pixel its background, so the sprite renders at double vertical resolution. The 3D counterpart is [drawPixelBillboard](Function.drawPixelBillboard.md). |
| [drawRectangle](Function.drawRectangle.md) | Draw a single-glyph rectangle outline. |
| [drawScanlines](Function.drawScanlines.md) | Paint horizontal CRT scanlines across `canvas`, every `spacing` rows. A `skip` predicate masks out cells (the globe demo skips the sphere's disc so the lines stay in the background rather than banding the subject). |
| [drawSectionHeader](Function.drawSectionHeader.md) | Draw a lightweight section header: the title, then a dim rule filling to `right`. Lighter than a boxed panel, so a stack of sections reads as an airy rail. |
| [drawSparkline](Function.drawSparkline.md) | Draw a sparkline of a numeric series, one column per sample (oldest left, newest right), scaled to `maxVal`. Empty/zero samples render as a faint baseline so the strip keeps a constant footprint. |
| [drawSprite](Function.drawSprite.md) | Blit a [Sprite](Class.Sprite.md) onto `canvas` at `(x, y)`, optionally transformed by a camera. Transparent cells are skipped. |
| [drawTicker](Function.drawTicker.md) | Draw a `width`-cell window onto an endlessly looping marquee string, scrolled by `offset` characters — a news-style ticker. `text` should already include its own separators so the wrap reads seamlessly. |
| [drawTransition](Function.drawTransition.md) | Paint the transition overlay over the whole canvas for the given `coverage`. `coverage` 0 draws nothing; 1 fills every cell with `color`; in between, a dither fade stipples cells in and a wipe advances a solid edge. Cell-only, so it composites over whatever the scene already drew. |
| [edgeMask](Function.edgeMask.md) | Compute the 4-bit edge mask for the context cell: a bit is set when the neighbour on that side satisfies `same`. Out-of-bounds neighbours are treated as matching by default (so a tile at the map edge reads as continuing off-map) — pass `edgesMatch: false` to instead treat the void as a non-match. |
| [encodeWav](Function.encodeWav.md) | Encode mono or interleaved-stereo float samples as a 16-bit PCM WAV byte buffer. |
| [equirectTexel](Function.equirectTexel.md) | Map a spherical elevation/azimuth (radians, see sphere.ts for the theta/phi convention) to nearest-neighbour integer texel coordinates of an equirectangular texture: row 0 is the +y pole, column 0 is azimuth −π. Azimuth wraps; elevation clamps at the poles. Storage-agnostic — the caller indexes its own buffer at the returned (x, y). |
| [fbm](Function.fbm.md) | Sum `octaves` of `sampler` at rising frequency and falling amplitude. The result is normalised by total amplitude, so its range matches the sampler's own range (e.g. [0, 1) value noise stays [0, 1); [-1, 1] Perlin stays [-1, 1]). |
| [fieldOfViewSet](Function.fieldOfViewSet.md) | Collect a field of view into a Set of "column,row" keys, for callers that want a membership test rather than a streaming callback. |
| [fillTile](Function.fillTile.md) | Build a solid `size`×`size` sprite filled with one character/colour — the tile equivalent of a painted block, instead of hand-setting every cell. |
| [findPath](Function.findPath.md) | Find a path of grid cells from `start` to `goal` using A*. |
| [flee](Function.flee.md) | Steer directly away from `target`. |
| [flowColumn](Function.flowColumn.md) | Per-item Y offsets for a top-to-bottom stack of `itemSizes` (heights) separated by `gap`. See flow. |
| [flowExtent](Function.flowExtent.md) | Total extent of a flow run: the sum of `itemSizes` plus `gap` between each pair. Handy for sizing a panel to wrap a [flowRow](Function.flowRow.md)/[flowColumn](Function.flowColumn.md). |
| [flowRow](Function.flowRow.md) | Per-item X offsets for a left-to-right run of `itemSizes` (widths) separated by `gap`. See flow. |
| [FullscreenCanvas](Function.FullscreenCanvas.md) | A [Canvas](Function.Canvas.md) sized to fill the terminal. The canonical entry for a full-screen game: drop it straight inside `<Application>` instead of wiring `useTerminal()` to a manual `<Canvas width height>` in every project. |
| [generateDungeon](Function.generateDungeon.md) | Generate a room-and-corridor dungeon via BSP. |
| [generateMaze](Function.generateMaze.md) | Generate a perfect maze via the growing-tree algorithm. |
| [generateWaveCollapse](Function.generateWaveCollapse.md) | Solve a tiled wave-function-collapse. |
| [greatCircleAngle](Function.greatCircleAngle.md) | Angle (radians) of the great-circle arc between two directions. |
| [hashState](Function.hashState.md) | FNV-1a 32-bit hash of the stable serialisation — a compact fingerprint of the whole state for cheap equality checks in determinism tests. |
| [intersects](Function.intersects.md) | Test whether two axis-aligned rectangles overlap. |
| [isRef](Function.isRef.md) | Type guard for [Ref](Class.Ref.md) instances. |
| [lambert](Function.lambert.md) | Lambertian diffuse term for a surface normal lit by a directional light. Both vectors are assumed unit length. `ambient` keeps the unlit side visible; the diffuse term adds a directional highlight that falls off toward the terminator. |
| [lathe](Function.lathe.md) | Lathe a 2D profile of `[radius, height]` knots around the Y axis into a surface of revolution. `radialSegments` divides the sweep, `profileSamples` densifies each profile span (via Catmull–Rom). Meridian normals come from the finite-difference profile tangent rotated 90°, then swept. `vOffset` shifts the uv v-range so stacked parts tile cleanly. |
| [lerp](Function.lerp.md) | Linearly interpolate between `a` and `b`. |
| [lineOfSight](Function.lineOfSight.md) | Bresenham line-of-sight from `from` to `to`: walks the cells the line crosses and returns `false` as soon as `isBlocking` rejects one. |
| [loadState](Function.loadState.md) | Decode a snapshot produced by [saveState](Function.saveState.md). |
| [loadTileMap](Function.loadTileMap.md) | Load and build a tile map from a YAML document on disk. |
| [loadYaml](Function.loadYaml.md) | Read and parse a YAML file asynchronously. |
| [loadYamlSync](Function.loadYamlSync.md) | Read and parse a YAML file synchronously. |
| [mapRange](Function.mapRange.md) | Remap `value` from an input range to an output range. If the input range is zero-width, returns `outputLow`. |
| [menuItemAt](Function.menuItemAt.md) | Index of the item whose rectangle (from [drawMenu](Function.drawMenu.md)) contains `(x, y)`, or `-1` if none. The bridge from a mouse cursor to a [Menu.setCursor](Class.Menu.md#setcursor) call. |
| [mergeParts](Function.mergeParts.md) | Concatenate parts into one indexed mesh, offsetting each part's indices by the running vertex count. |
| [meshBounds](Function.meshBounds.md) | Half-extents (into `outHalf`) and bounding radius of a vertex array, assuming the mesh is centred on the origin (the loaders normalize it so). |
| [meshCollider](Function.meshCollider.md) | The mesh's own vertices (sampled to at most `maxPoints` for performance) as contact points, so the body rests on its real silhouette. Inertia is the box approximation from the bounding extents. |
| [moveAndCollide](Function.moveAndCollide.md) | Move `box` by `(deltaX, deltaY)` against axis-aligned obstacles, resolving each axis independently with the engine's swept-AABB test so the box stops flush against terrain instead of tunnelling through it at speed. `box` is mutated to the resolved position; the caller zeroes whatever velocity component collided. |
| [normalizeMesh](Function.normalizeMesh.md) | Recentre a mesh on the origin and uniformly scale it to `size`, optionally remapping axes (positions and normals alike). Mutates and returns the mesh — the axis map is a pure rotation/reflection, so a reflection's winding flip is corrected by reversing each triangle when the map is orientation-reversing. |
| [parseAnimatedSprite](Function.parseAnimatedSprite.md) | Build an [AnimatedSprite](Class.AnimatedSprite.md) from a clip map and the initial clip name. |
| [parseColor](Function.parseColor.md) | Parse an authored color into a [Color](Class.Color.md). |
| [parseObj](Function.parseObj.md) | A minimal Wavefront OBJ parser → [Mesh](Interface.Mesh.md). Handles `v`, `vn`, `vt`, and `f` with `a`, `a/b`, `a//c`, or `a/b/c` vertex references (1-based, negative allowed), triangulating polygons as a fan. Face-vertices with distinct position/uv/normal triples become distinct mesh vertices. Normals and uvs are emitted only when every face-vertex supplies them (so a normal-less OBJ falls back to the renderer's flat shading). |
| [parsePixelLegend](Function.parsePixelLegend.md) | Flatten a pixel legend into a character-to-color map, merging an optional base legend first (skipping the reserved `extends` key). `null` entries are preserved as `null` so callers can mark "no color for this character". |
| [parsePixelSprite](Function.parsePixelSprite.md) | Parse a pixel-art string into a [PixelSprite](Class.PixelSprite.md) using a character-to-`Color` legend. |
| [parseSprite](Function.parseSprite.md) | Parse a terminal-art string into a [Sprite](Class.Sprite.md) using a character legend. |
| [parseTerminalLegend](Function.parseTerminalLegend.md) | Parse a terminal legend into a character-to-[SpriteLegendEntry](Interface.SpriteLegendEntry.md) map. |
| [pixelSpriteAnimation](Function.pixelSpriteAnimation.md) | Build a slot that parses a pixel-sprite animation from inline data. |
| [planeMesh](Function.planeMesh.md) | A flat quad in the xz-plane at height `y`. The normal points to screen-up (−y, the engine's up hint) so the lit side faces the viewer; uvs tile `tiles` times. Handy as a floor/ground a mesh's shadow falls on. |
| [playClipForState](Function.playClipForState.md) | Drive an [AnimatedSprite](Class.AnimatedSprite.md)'s current clip from a [StateMachine](Class.StateMachine.md): each call plays the clip mapped to the machine's current state. |
| [playSpatial](Function.playSpatial.md) | Play `name` with its volume scaled by distance from the listener. Folds the distance gain into any explicit `volume`, and skips playback entirely (returns `null`) once the source is out of range, so off-screen sounds cost nothing. |
| [pointAttractor](Function.pointAttractor.md) | Pull toward (positive strength) or push from (negative) a point, with strength falling off as 1/distance so it stays finite near the centre. A gravity well, a black hole, an explosion shockwave (negative). |
| [poissonDisk](Function.poissonDisk.md) | Poisson-disk sampling via Bridson's algorithm: scatter points across a rectangle so no two are closer than `radius`, but the spacing stays organic (not a grid). The go-to distribution for tree/rock/enemy/star placement — it reads as natural clumping-free randomness. O(n) with a background grid; the grid cell size radius/√2 guarantees at most one sample per cell, so a new candidate only checks its 5×5 cell neighbourhood. Deterministic for a seed. |
| [pollWebGamepads](Function.pollWebGamepads.md) | Read the browser Gamepad API once and push the first (or `index`-th) connected controller's state into `state`. A no-op returning `false` where `navigator.getGamepads` is unavailable (e.g. a Bun terminal), so it is safe to call unconditionally every frame. |
| [pursue](Function.pursue.md) | Seek where the target will be, extrapolating from its velocity — the chase that leads a moving quarry. |
| [rasterizeBrailleCell](Function.rasterizeBrailleCell.md) | Rasterize one cell by sampling its 8 sub-pixels. `sample` is called with the sub-pixel's centre in cell-space (e.g. cx + 0.25 ... cx + 0.75 horizontally) and its dot bit; return true to light the dot. The caller can accumulate its own per-sample state (lighting, depth, ...) inside `sample`. |
| [ref](Function.ref.md) | Build a slot that parses a [Ref](Class.Ref.md) to another asset by name. |
| [renderBillboards](Function.renderBillboards.md) | Render billboarded sprites back-to-front with per-entry vertical offset from eye height. Filters removed entries, sorts by squared distance to the camera, then dispatches each to [drawPixelBillboard](Function.drawPixelBillboard.md) or [drawBillboard](Function.drawBillboard.md) depending on the sprite type. |
| [renderGridSurfaces](Function.renderGridSurfaces.md) | Render a first-person view of a grid of variable-height floor/ceiling cells via per-column DDA raycasting, writing colour to `canvas` (two vertical sub-pixels per cell through the ▀ half-block) and depth to `depthBuffer` for later billboard occlusion. Walls, floor/ceiling strips, and step walls (where a neighbour's floor or ceiling height differs) are all drawn. Geometry comes from [GridSurfaces](Interface.GridSurfaces.md); colour from [SurfaceShader](Interface.SurfaceShader.md). |
| [renderMesh](Function.renderMesh.md) | Render an indexed triangle mesh into `target` (a SubpixelTarget the caller cleared this frame) and resolve it onto `canvas`. The pipeline transforms by `model`, clips against the near plane in view space, projects with perspective, culls back faces, and fills each triangle perspective-correct with a per-subpixel depth test — colour comes from `shader`. |
| [renderSequence](Function.renderSequence.md) | Render a melody (notes played back-to-back) to one mono buffer. |
| [renderTone](Function.renderTone.md) | Render one tone to mono float samples in [-1, 1]. |
| [resolveAnchor](Function.resolveAnchor.md) | Resolve the screen-space [Rectangle](Class.Rectangle.md) for a `width`×`height` box anchored inside a `canvasWidth`×`canvasHeight` grid. Left/right anchors inset by `marginX`, top/bottom anchors by `marginY`; centred axes ignore the margin. The origin is rounded to whole cells and clamped so the box never starts off the left/top edge (it may still overflow right/bottom if larger than the canvas). |
| [resolvePixelLegends](Function.resolvePixelLegends.md) | Resolve every legend in a map, following `extends` chains and detecting cycles. |
| [resolvePlayerCommand](Function.resolvePlayerCommand.md) | Build the argv to play `path` on the given platform. macOS afplay takes a `-v` volume multiplier; the Linux/Windows fallbacks play at system volume. Pass `playerOverride` to force a specific command (e.g. "ffplay" on Linux). Pure and platform-string-driven so it can be unit-tested without spawning anything. |
| [reverseWinding](Function.reverseWinding.md) | Reverse each triangle's winding in place (swap the 2nd and 3rd index), flipping which side faces the camera. Normals are untouched, so lighting is unaffected. Returns the same mesh for chaining. |
| [rgbaToColor](Function.rgbaToColor.md) | Convert an opentui `RGBA` tuple to a rune [Color](Class.Color.md). |
| [ridged](Function.ridged.md) | Ridged multifractal: 1 − |sampler| folded each octave, biased toward sharp ridges. Best fed a signed sampler (Perlin); produces eroded mountain ridges and canyon networks. Returns [0, 1). |
| [sampleGreatCircleArc](Function.sampleGreatCircleArc.md) | Sample the great-circle arc from `a` to `b` at `steps + 1` evenly spaced points (inclusive of both endpoints). Points are unit directions — bowing an arc off the surface is a projection concern (see SphereProjection's altitude parameter), kept separate so depth/culling stay tied to the true surface. |
| [sampleSpline](Function.sampleSpline.md) | Sample a Catmull–Rom spline through `knots` (each an array of the same number of lanes/dimensions) into a dense polyline of `samplesPerSegment` points per span. End knots are duplicated so the curve passes through the first and last knot. Works in any dimension — pass 2D [radius, height] profiles to [lathe](Function.lathe.md) or 3D [x, y, z] paths to [sweepTube](Function.sweepTube.md). |
| [saveState](Function.saveState.md) | Encode a snapshot for persistence (the stable string is the save format). |
| [Scene](Function.Scene.md) | Mounts a scene onto the application's scene stack for the lifetime of the component. Emits `scene:enter` on mount and `scene:exit` on cleanup, popping the stack only if it is still top, and provides the scene via [SceneContext](Variable.SceneContext.md). |
| [SceneRenderer](Function.SceneRenderer.md) | Renders the active scene into the surrounding `<Canvas>` every frame. Clears the canvas, draws the application's current scene (falling back to the local `<Scene>` context when the stack is empty) using [ApplicationHandle.renderAlpha](Interface.ApplicationHandle.md#renderalpha) for interpolation, and flushes. |
| [SceneSwitch](Function.SceneSwitch.md) | Conditionally renders the child factory whose key equals `props.active()`, using Solid's `<Show>` so inactive screens are unmounted. Iterates the children map in declaration order. |
| [seek](Function.seek.md) | Steer toward `target` at full speed. |
| [separation](Function.separation.md) | Steer away from the average position of neighbours within `radius` — keeps a flock from clumping. Weighted by inverse distance so nearer crowders push harder. |
| [serializeApplication](Function.serializeApplication.md) | Serialize the live application into a single snapshot. When a `registry` is passed it is cleared and repopulated with id -> entity for every node walked, so the caller (the server) can resolve an incoming edit back to its entity. |
| [serializeState](Function.serializeState.md) | Stable JSON: identical for two structurally equal values regardless of key insertion order. Throws on cycles (state snapshots should be plain trees). |
| [sign](Function.sign.md) | Sign of `value`, distinguishing zero. |
| [slerp](Function.slerp.md) | Spherical linear interpolation along the great circle from `a` to `b`. Falls back to a plain lerp when the endpoints are nearly parallel (sin θ → 0). |
| [slerpInto](Function.slerpInto.md) | Allocation-free variant of [slerp](Function.slerp.md): writes the result into `out`. |
| [snapshotFrame](Function.snapshotFrame.md) | Snapshot the canvas's glyphs and fg/bg bytes into typed-array planes. Reuses `into` when its dimensions match, so a per-frame pass allocates nothing. |
| [sphereCollider](Function.sphereCollider.md) | A sphere sized to the mesh's bounding radius, with the isotropic inertia of a solid sphere: I = (2/5)·m·r², so I⁻¹ = 2.5/r² on every axis. |
| [sphereMesh](Function.sphereMesh.md) | A UV sphere. Normals are the unit position; uvs are `(longitude, latitude)`. |
| [sphericalToVector3](Function.sphericalToVector3.md) | Unit direction for an elevation/azimuth (radians). |
| [sphericalToVector3Into](Function.sphericalToVector3Into.md) | Allocation-free variant of [sphericalToVector3](Function.sphericalToVector3.md): writes the unit direction into `out`. |
| [sweep](Function.sweep.md) | Sweep `moving` by `(deltaX, deltaY)` and return the earliest obstacle hit in the normalized interval `[0, 1]`. Resolves each axis independently and picks the latest entry time across both axes as the contact moment. |
| [sweepTube](Function.sweepTube.md) | Sweep a circular cross-section of `radiusAt(t)` along a 3D Catmull–Rom path (`pathKnots` are `[x, y, z]` knots). `pathSamples` densifies the path, `tubeSegments` divides the tube. A parallel-transport-ish frame is rebuilt per sample from the path tangent and a reference up so the tube does not pinch. |
| [syncFirstPersonCamera](Function.syncFirstPersonCamera.md) | Copy a view's position and yaw onto a first-person camera. No-op on the yaw if the camera isn't using a [RaycastProjection](Class.RaycastProjection.md). |
| [synthTone](Function.synthTone.md) | Render a tone straight to WAV bytes — the one-liner for "make me a beep". |
| [terminalSpriteAnimation](Function.terminalSpriteAnimation.md) | Build a slot that parses a terminal-sprite animation from inline data. |
| [torusMesh](Function.torusMesh.md) | A torus in the xz-plane. Normals point radially out of the tube; uvs wrap `(around-ring, around-tube)`. |
| [triangleCount](Function.triangleCount.md) | Total triangle count of a mesh (indices / 3). |
| [tween](Function.tween.md) | Convenience factory for `new Tween`. |
| [updateTriggers](Function.updateTriggers.md) | Evaluate every [TriggerVolume](Class.TriggerVolume.md) in `scene` against every other enabled entity, dispatching enter/stay/exit callbacks. |
| [useActions](Function.useActions.md) | Build an action snapshot from a bindings map, wired to the application's keyboard, mouse, and gamepad state (so `"mouse:"`/`"gamepad:"` bindings work out of the box). |
| [useApplication](Function.useApplication.md) | Read the [ApplicationHandle](Interface.ApplicationHandle.md) for the surrounding `<Application>`. |
| [useAudio](Function.useAudio.md) | Read the application's audio context. |
| [useCamera](Function.useCamera.md) | Read the camera of the nearest `<Scene>`. |
| [useCanvas](Function.useCanvas.md) | Read the canvas accessor from the nearest `<Canvas>`. |
| [useEntity](Function.useEntity.md) | Single-entity convenience over [useSceneEntities](Function.useSceneEntities.md): add one entity to the nearest `<Scene>` on mount, remove it on cleanup, and return it. |
| [useEvents](Function.useEvents.md) | Returns a [ScopedEventBus](Interface.ScopedEventBus.md) for the application's event bus. Subscribers are unsubscribed automatically when the calling component unmounts. |
| [useFixedUpdate](Function.useFixedUpdate.md) | Register a callback fired once per fixed-update tick. The registration is automatically removed when the calling component unmounts. |
| [useGamepad](Function.useGamepad.md) | Read the application's gamepad state. |
| [useInput](Function.useInput.md) | Read the application's keyboard state. |
| [useMouse](Function.useMouse.md) | Read the application's mouse state. |
| [useScene](Function.useScene.md) | Read the [Scene](Function.Scene.md) provided by the nearest `<Scene>`. |
| [useSceneEntities](Function.useSceneEntities.md) | Add entities to the nearest `<Scene>` on mount and remove them on cleanup, so a component owns its scene contents without hand-rolling `onMount`/`onCleanup` around `scene.add`/`scene.remove`. The `factory` runs immediately (during component setup) so callers may capture the returned entities; the actual `addAll` is deferred to mount. |
| [useTerminal](Function.useTerminal.md) | Read the terminal dimensions as a reactive accessor. |
| [useTimer](Function.useTimer.md) | Returns a [ScopedTimer](Interface.ScopedTimer.md) whose `after`/`every` timers are tracked and cancelled automatically when the calling component unmounts. |
| [useTween](Function.useTween.md) | Create a [Tween](Class.Tween.md), register it with the application's tween manager, and cancel + remove it automatically when the calling component unmounts. |
| [useUpdate](Function.useUpdate.md) | Register a callback fired once per rendered frame. The registration is automatically removed when the calling component unmounts. |
| [uvGridTexture](Function.uvGridTexture.md) | The standard uv-debug map: coloured grid lines over a per-quadrant gradient, so the mesh's uv layout is legible. |
| [vector3ToSpherical](Function.vector3ToSpherical.md) | Inverse of [sphericalToVector3](Function.sphericalToVector3.md): recover elevation/azimuth (radians) from a direction. The azimuth tolerates a non-unit vector, but the elevation assumes a unit vector, so normalize first if unsure. |
| [vortex](Function.vortex.md) | Swirl around a centre (a whirlpool / tornado): force is perpendicular to the radius, magnitude `strength` scaled by 1/distance. |
| [wrap](Function.wrap.md) | Wrap `value` into `[minimum, maximum)`. If the range is non-positive, returns `minimum`. |
| [wrapText](Function.wrapText.md) | Break `text` into lines no wider than `width` cells, splitting on spaces. Words longer than `width` are hard-split. Operates on the plain string only — glyph rendering stays with the canvas/terminal. |
