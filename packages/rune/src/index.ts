/**
 * Public API barrel for the rune TUI game engine. Every engine export is
 * re-exported here; game code imports exclusively from `"@ahokinson/rune"`.
 *
 * Naming collisions are resolved at re-export time: the `Canvas` *interface*
 * from `draw/canvas` is re-exported as `CanvasSurface` so it doesn't shadow the
 * `<Canvas>` Solid component, and the `Scene` *class* from `scene/scene` is
 * re-exported as `SceneInstance` so it doesn't shadow the `<Scene>` component.
 *
 * @module
 */

export type { ApplicationProps } from "./Application"
export { Application } from "./Application"
export type { BehaviorNode } from "./ai/behaviorTree"
export {
  Action,
  BehaviorStatus,
  Condition,
  Inverter,
  Parallel,
  ParallelPolicy,
  Repeater,
  Selector,
  Sequence,
} from "./ai/behaviorTree"
export { Blackboard } from "./ai/blackboard"
export type { FlowFieldOptions } from "./ai/flowField"
export { FlowField } from "./ai/flowField"
export type { NavPolygon } from "./ai/navmesh"
export { NavMesh } from "./ai/navmesh"
export type { PathfindOptions } from "./ai/pathfind"
export { findPath, Heuristic } from "./ai/pathfind"
export type { StateDefinition } from "./ai/stateMachine"
export { StateMachine } from "./ai/stateMachine"
export type { Boid } from "./ai/steering"
export { alignment, arrive, cohesion, flee, pursue, seek, separation, Wander } from "./ai/steering"
export { parseAnimatedSprite } from "./assets/animatedSprite"
export type { AssetClass, AssetOptions, AssetSchema } from "./assets/asset"
export { Asset } from "./assets/asset"
export { parseColor, parsePixelLegend, resolvePixelLegends } from "./assets/color"
export { loadYaml, loadYamlSync } from "./assets/load"
export { AssetPack } from "./assets/pack"
export { PixelSpriteAsset, parsePixelSprite } from "./assets/pixelSprite"
export type { RefResolveContext } from "./assets/ref"
export { isRef, Ref } from "./assets/ref"
export type { ParseContext, Slot } from "./assets/slot"
export {
  data,
  pixelSprite,
  pixelSpriteAnimation,
  ref,
  terminalSprite,
  terminalSpriteAnimation,
} from "./assets/slot"
export { parseSprite, parseTerminalLegend, TerminalSpriteAsset } from "./assets/sprite"
export { TileMapAsset } from "./assets/tileMap"
export type {
  ColorData,
  PixelLegendData,
  PixelSpriteAssetData,
  PixelSpriteClipData,
  PixelSpriteFrameData,
  SpriteAssetData,
  SpriteLegendEntryData,
  TerminalLegendData,
  TerminalSpriteAssetData,
  TerminalSpriteClipData,
  TerminalSpriteFrameData,
} from "./assets/types"
export type {
  AfplayAudioContextOptions,
  AudioContext,
  AudioSource,
  PlayOptions,
  SystemAudioContextOptions,
} from "./audio/context"
export { AfplayAudioContext, NullAudioContext, resolvePlayerCommand, SystemAudioContext } from "./audio/context"
export type { MixLayer, MixResult } from "./audio/mixer"
export { Mixer } from "./audio/mixer"
export type { SpatialPlayOptions, SpatialPoint } from "./audio/spatial"
export { attenuation, playSpatial } from "./audio/spatial"
export type { Envelope, ToneOptions } from "./audio/synth"
export { DEFAULT_SAMPLE_RATE, encodeWav, renderSequence, renderTone, synthTone, Waveform } from "./audio/synth"
export type { CanvasProps } from "./Canvas"
export { Canvas } from "./Canvas"
export type {
  ApplicationEventMap,
  ApplicationHandle,
  FixedUpdateCallback,
  UpdateCallback,
} from "./context"
export { Cooldown } from "./core/cooldown"
export type { EventListener } from "./core/events"
export { EventEmitter } from "./core/events"
export type { LoopState } from "./core/loop"
export { advanceLoop, createLoopState } from "./core/loop"
export type { ObjectPoolOptions } from "./core/objectPool"
export { ObjectPool } from "./core/objectPool"
export type { PooledSetOptions } from "./core/pooledSet"
export { PooledSet } from "./core/pooledSet"
export { RateCounter } from "./core/rateCounter"
export type { SaveStoreOptions } from "./core/save"
export { SaveStore } from "./core/save"
export type { TimerId } from "./core/scheduler"
export { Scheduler } from "./core/scheduler"
export { FramesPerSecondCounter } from "./core/time"
export type { DebugOverlayCorner, DebugOverlayProps } from "./DebugOverlay"
export { DebugOverlay } from "./DebugOverlay"
export type { AnimatedSpriteOptions, AnimationClip } from "./draw/animatedSprite"
export { AnimatedSprite } from "./draw/animatedSprite"
export { autoTile, EdgeBit, edgeMask } from "./draw/autotile"
export type { BoxStyle, BoxStyleName } from "./draw/box"
export { boxStyles } from "./draw/box"
export {
  BRAILLE_BITS,
  BRAILLE_COLS,
  BRAILLE_ROWS,
  brailleGlyph,
  rasterizeBrailleCell,
} from "./draw/braille"
export { Camera } from "./draw/camera"
// Re-exported explicitly so we can rename collisions with value exports
// (the `Canvas` interface from ./draw/canvas would otherwise shadow the
// `<Canvas>` Solid component, and vice versa).
export type { Canvas as CanvasSurface, CellBytes } from "./draw/canvas"
export { InMemoryCanvas } from "./draw/canvas"
export { brightnessToChar, DEFAULT_CHAR_RAMP } from "./draw/charRamp"
export type { SurfaceColor } from "./draw/color"
export { Color } from "./draw/color"
export type { AnchorOptions } from "./draw/layout"
export { Anchor, flowColumn, flowExtent, flowRow, resolveAnchor } from "./draw/layout"
export type { Fragment, Mesh, MeshShader, RenderMeshContext } from "./draw/mesh/rasterizer"
export { MESH_DEFAULT_CLEAR, renderMesh } from "./draw/mesh/rasterizer"
export type { LambertMeshShaderOptions, LitMeshShaderMode, LitMeshShaderOptions } from "./draw/mesh/shader"
export { LambertMeshShader, LitMeshShader } from "./draw/mesh/shader"
export type { ShadowCaster, ShadowMapOptions } from "./draw/mesh/shadowMap"
export { ShadowMap } from "./draw/mesh/shadowMap"
export { SubpixelTarget } from "./draw/mesh/subpixelTarget"
export { Palette } from "./draw/palette"
export { drawPixelSprite, PixelSprite } from "./draw/pixelSprite"
export { checkerTexture, uvGridTexture } from "./draw/proceduralTexture"
export type { DrawBillboardOptions } from "./draw/raycast/billboard"
export { drawBillboard } from "./draw/raycast/billboard"
export type { BillboardEntry, BillboardRenderContext } from "./draw/raycast/billboards"
export { renderBillboards } from "./draw/raycast/billboards"
export { ColumnDepthBuffer } from "./draw/raycast/columnDepthBuffer"
export { ColumnSpanBuffer } from "./draw/raycast/columnSpanBuffer"
export type { FirstPersonCameraOptions, FirstPersonView } from "./draw/raycast/firstPersonCamera"
export { createFirstPersonCamera, syncFirstPersonCamera } from "./draw/raycast/firstPersonCamera"
export type {
  FlatSample,
  GridSurfaces,
  RenderGridSurfacesContext,
  SurfaceShader,
  WallSample,
} from "./draw/raycast/grid"
export { renderGridSurfaces } from "./draw/raycast/grid"
export { GridDepthBuffer } from "./draw/raycast/gridDepthBuffer"
export type { DrawPixelBillboardOptions } from "./draw/raycast/pixelBillboard"
export { drawPixelBillboard } from "./draw/raycast/pixelBillboard"
export type { Projection, RaycastProjectionOptions } from "./draw/raycast/projection"
export { OrthographicProjection, RaycastProjection } from "./draw/raycast/projection"
export type {
  FlatTextureLookup,
  TextureSurfaceShaderOptions,
  WallTextureLookup,
} from "./draw/raycast/textureShader"
export { TextureSurfaceShader } from "./draw/raycast/textureShader"
export { colorToRGBA, rgbaToColor } from "./draw/rgba"
export {
  drawBox,
  drawCircle,
  drawFilledRectangle,
  drawLine,
  drawRectangle,
} from "./draw/shapes"
export type { SpriteCell, SpriteLegendEntry } from "./draw/sprite"
export { drawSprite, Sprite } from "./draw/sprite"
export { Texture } from "./draw/texture"
export type { TileAppearance, TileContext, TileDefinition } from "./draw/tileSet"
export { animatedTile, fillTile, TileSet } from "./draw/tileSet"
export type {
  ControlEntry,
  ControlLegendOptions,
  LabeledPanelOptions,
  ModalOptions,
  PanelBezel,
} from "./draw/widgets"
export {
  drawBar,
  drawControlLegend,
  drawGauge,
  drawLabeledPanel,
  drawModal,
  drawPanel,
  drawSectionHeader,
  drawSparkline,
  drawTicker,
} from "./draw/widgets"
export type { FullscreenCanvasProps, TerminalSize } from "./FullscreenCanvas"
export { FullscreenCanvas } from "./FullscreenCanvas"
export type { BloomOptions } from "./fx/bloom"
export { bloom } from "./fx/bloom"
export type { ChromaticAberrationOptions } from "./fx/chromaticAberration"
export { chromaticAberration } from "./fx/chromaticAberration"
export type { CrtOptions } from "./fx/crt"
export { crt } from "./fx/crt"
export type { DitherOptions } from "./fx/dither"
export { dither } from "./fx/dither"
export type { EmitterOptions, EmitterUpdate } from "./fx/emitter"
export { Emitter } from "./fx/emitter"
export type { ForceField } from "./fx/forceField"
export { directionalForce, drag, pointAttractor, vortex } from "./fx/forceField"
export type { GlitchEffectOptions } from "./fx/glitch"
export { GlitchEffect, GlitchKind } from "./fx/glitch"
export type { BurstEmitterOptions, ParticlesOptions } from "./fx/particles"
export { burstEmitter, Particles } from "./fx/particles"
export type { Particle3DStyle, Particles3DOptions } from "./fx/particles3d"
export { Particles3D } from "./fx/particles3d"
export type { FramePlanes, PostEffect } from "./fx/pipeline"
export { PostProcessPipeline, snapshotFrame } from "./fx/pipeline"
export type { ScanlineOptions } from "./fx/scanlines"
export { drawScanlines } from "./fx/scanlines"
export type { ScreenEffect } from "./fx/screen"
export { FilterCanvas } from "./fx/screen"
export type {
  Camera3DOptions,
  OrthographicProjector3DOptions,
  PerspectiveProjector3DOptions,
  ProjectedPoint,
  Projector3D,
  ScreenRay,
  Viewport3D,
} from "./geom/camera3d"
// 3D camera / world-space geometry (auto-projected/culled/drawn each frame)
export { Camera3D, OrthographicProjector3D, PerspectiveProjector3D } from "./geom/camera3d"
export type {
  PointCloud3DOptions,
  PointStyle,
  Polyline3DOptions,
  PolylineStyle,
  PolylineVertex,
  SurfaceCellResult,
  SurfaceMesh3DOptions,
  SurfaceSampler,
} from "./geom/geometry3d"
export { PointCloud3D, Polyline3D, SurfaceMesh3D } from "./geom/geometry3d"
export type { MeshPart } from "./geom/meshBuilder"
export { lathe, mergeParts, reverseWinding, sweepTube, triangleCount } from "./geom/meshBuilder"
export type { NormalizeOptions } from "./geom/obj"
export { normalizeMesh, parseObj } from "./geom/obj"
export type { OrbitOptions } from "./geom/orbitControl"
export { OrbitControl } from "./geom/orbitControl"
export { directionToScreenPlane, lambert } from "./geom/shading"
export type { PlaneMeshOptions, SphereMeshOptions, TorusMeshOptions } from "./geom/solids"
export { cubeMesh, planeMesh, sphereMesh, torusMesh } from "./geom/solids"
export {
  greatCircleAngle,
  sampleGreatCircleArc,
  slerp,
  slerpInto,
  sphericalToVector3,
  sphericalToVector3Into,
  vector3ToSpherical,
} from "./geom/sphere"
export type {
  ScreenPoint,
  SphereProjectionOptions,
  SphereView,
  SurfacePoint,
} from "./geom/sphereProjection"
export { SphereProjection } from "./geom/sphereProjection"
export type { SurfaceSample } from "./geom/sphereProjector"
export { SphereProjector } from "./geom/sphereProjector"
export { catmullRom, sampleSpline } from "./geom/spline"
export { equirectTexel } from "./geom/texture"
export type { ScopedEventBus, ScopedTimer } from "./hooks"
export {
  ApplicationContext,
  CanvasContext,
  SceneContext,
  useActions,
  useApplication,
  useAudio,
  useCamera,
  useCanvas,
  useEntity,
  useEvents,
  useFixedUpdate,
  useGamepad,
  useInput,
  useMouse,
  useScene,
  useSceneEntities,
  useTerminal,
  useTimer,
  useTween,
  useUpdate,
} from "./hooks"
export type { ButtonDrawOptions, ButtonOptions } from "./hud/button"
export { Button, drawButton } from "./hud/button"
export type { DialogueDrawOptions, DialogueOptions } from "./hud/dialogue"
export { Dialogue, drawDialogue, wrapText } from "./hud/dialogue"
export type { FocusRingOptions } from "./hud/focus"
export { FocusRing } from "./hud/focus"
export type { MenuDrawOptions, MenuItem, MenuOptions } from "./hud/menu"
export { drawMenu, Menu, MenuOrientation, menuItemAt } from "./hud/menu"
export type { ActionBindings, ActionSnapshot } from "./input/actions"
export { createActionMap } from "./input/actions"
export type { GamepadSnapshot, GamepadStateOptions, PollWebGamepadsOptions } from "./input/gamepad"
export { GamepadAxis, GamepadButton, GamepadState, pollWebGamepads } from "./input/gamepad"
export type { KeyboardSnapshot } from "./input/keyboard"
export { KeyboardState } from "./input/keyboard"
export { Keys } from "./input/keys"
export type { MouseSnapshot } from "./input/mouse"
export { MouseButton, MouseState } from "./input/mouse"
export { InputPhase } from "./input/phase"
// Inspection (live `rune inspect` channel + `rune preview` snapshot shape)
export type {
  EditableProp,
  InspectorCommand,
  InspectorEdit,
  InspectorMessage,
  InspectorNode,
  InspectorProps,
  InspectorSnapshot,
  InspectorTree,
  QuaternionData,
  Vector2Data,
  Vector3Data,
} from "./inspect/protocol"
export {
  DEFAULT_SOCKET_PATH,
  INSPECT_PROTOCOL_VERSION,
  InspectorCommandAction,
  InspectorNodeKind,
} from "./inspect/protocol"
export type { InspectionServerOptions } from "./inspect/server"
export { InspectionServer } from "./inspect/server"
export { applyEdit, serializeApplication } from "./inspect/snapshot"
export type { LightSource } from "./light/lightGrid"
export { LightGrid } from "./light/lightGrid"
export type { FieldOfViewOptions } from "./light/shadowcast"
export { computeFieldOfView, fieldOfViewSet } from "./light/shadowcast"
export { Angle } from "./math/angle"
export type { EasingFunction } from "./math/easing"
export { Easing } from "./math/easing"
export type { DomainWarpOptions, FbmOptions, NoiseSampler2D } from "./math/fbm"
export { domainWarp, fbm, ridged } from "./math/fbm"
export { Matrix4 } from "./math/matrix4"
export { Noise3D } from "./math/noise"
export { Noise2D } from "./math/noise2d"
export type { PoissonOptions } from "./math/poisson"
export { poissonDisk } from "./math/poisson"
export { Quaternion } from "./math/quaternion"
export { Random } from "./math/random"
export { Rectangle } from "./math/rectangle"
export { clamp, lerp, mapRange, sign, wrap } from "./math/scalar"
export { Vector2 } from "./math/vector2"
export { Vector3 } from "./math/vector3"
export type { WorleyResult } from "./math/worley"
export { Worley2D, WorleyDistance } from "./math/worley"
export type { SweepHit } from "./physics/boundingBox"
export { contains, intersects, sweep } from "./physics/boundingBox"
export type { Collider } from "./physics/collider"
export {
  boxCollider,
  boxInverseInertia,
  ColliderKind,
  colliderFor,
  meshBounds,
  meshCollider,
  sphereCollider,
} from "./physics/collider"
export type { Constraint, ConstraintSolverOptions } from "./physics/constraint"
export { ConstraintSolver, DistanceConstraint, PinConstraint, PointMass } from "./physics/constraint"
export type { CellPredicate, GridCell } from "./physics/grid"
export { cellAt, lineOfSight } from "./physics/grid"
export type { KinematicBody2DOptions, KinematicInput } from "./physics/kinematicBody2d"
export { KinematicBody2D } from "./physics/kinematicBody2d"
export type { LayerMask } from "./physics/layers"
export { CollisionLayer } from "./physics/layers"
export type { CollisionResult } from "./physics/moveAndCollide"
export { moveAndCollide } from "./physics/moveAndCollide"
export type { RaycastHit } from "./physics/raycast"
export { castRay } from "./physics/raycast"
export type { RigidBody3DOptions } from "./physics/rigidBody"
export { RigidBody3D } from "./physics/rigidBody"
export type { RigidBody2DOptions } from "./physics/rigidBody2d"
export { RigidBody2D } from "./physics/rigidBody2d"
export { SpatialGrid } from "./physics/spatialGrid"
export type { AABB3 } from "./physics/spatialGrid3d"
export { SpatialGrid3D } from "./physics/spatialGrid3d"
export { TriggerVolume, updateTriggers } from "./physics/triggers"
export { InputPlayback } from "./replay/playback"
export type { Recording } from "./replay/record"
export { InputRecorder } from "./replay/record"
export type { Serializable } from "./replay/snapshot"
export { hashState, loadState, saveState, serializeState } from "./replay/snapshot"
export type { TimelineEvent, TimelineOptions } from "./replay/timeline"
export { Timeline } from "./replay/timeline"
export type { SceneProps } from "./Scene"
export { Scene } from "./Scene"
export type { SceneRendererProps } from "./SceneRenderer"
export { SceneRenderer } from "./SceneRenderer"
export type { SceneSwitchProps } from "./SceneSwitch"
export { SceneSwitch } from "./SceneSwitch"
export type { AnimatedSpriteEntityOptions } from "./scene/animatedSpriteEntity"
export { AnimatedSpriteEntity } from "./scene/animatedSpriteEntity"
export { detectCollisions } from "./scene/collision"
export type { EntityOptions } from "./scene/entity"
export { Entity } from "./scene/entity"
export type { Entity2DOptions } from "./scene/entity2d"
export { Entity2D } from "./scene/entity2d"
export type { Draw3DContext, Entity3DOptions } from "./scene/entity3d"
export { Entity3D } from "./scene/entity3d"
export type { MeshEntity3DOptions } from "./scene/meshEntity3d"
export { MeshEntity3D } from "./scene/meshEntity3d"
export type { SceneEventMap } from "./scene/scene"
export { Scene as SceneInstance } from "./scene/scene"
export type { Scene3DOptions } from "./scene/scene3d"
export { Scene3D } from "./scene/scene3d"
export { SceneManager } from "./scene/sceneManager"
export type { SpriteEntityOptions } from "./scene/spriteEntity"
export { SpriteEntity } from "./scene/spriteEntity"
export { playClipForState } from "./scene/spriteState"
export type { TileLayerOptions } from "./scene/tileLayer"
export { TileLayer } from "./scene/tileLayer"
export type { SceneTransitionOptions, TransitionDrawOptions } from "./scene/transition"
export { drawTransition, SceneTransition, TransitionKind, TransitionPhase } from "./scene/transition"
export type { WorldView3DOptions } from "./scene/worldView3d"
export { WorldView3D } from "./scene/worldView3d"
export type { TweenOptions } from "./tween/tween"
export { Tween, TweenManager, TweenState, tween } from "./tween/tween"
export type {
  BuildTileMapOptions,
  TileMapData,
  TileMapDocument,
  TileMarker,
} from "./world/tileDocument"
export { buildTileMap, loadTileMap, TileAnchor } from "./world/tileDocument"
export { TileMap } from "./world/tileMap"
export { TileMeta } from "./world/tileMeta"
export { Cell } from "./worldgen/cell"
export type { DungeonOptions, DungeonResult, DungeonRoom } from "./worldgen/dungeon"
export { generateDungeon } from "./worldgen/dungeon"
export type { MazeOptions } from "./worldgen/maze"
export { generateMaze } from "./worldgen/maze"
export type { WaveCollapseOptions, WaveCollapseResult } from "./worldgen/waveCollapse"
export { Direction, generateWaveCollapse } from "./worldgen/waveCollapse"
