/**
 * The wire protocol for the inspection channel between a running game and an
 * inspector client (`rune inspect`). The engine starts an InspectionServer when
 * RUNE_INSPECT_SOCKET is set; the client connects to that Unix socket. Transport
 * is newline-delimited JSON — every message below is one JSON object on its own
 * line. The same snapshot shape is reused by `rune preview` to describe a game
 * that is not running, so the inspector TUI renders both from one type.
 *
 * @module
 */

/** Protocol version for the inspection channel. */
export const INSPECT_PROTOCOL_VERSION = 1

/**
 * Default socket path relative to a project root. `rune dev` (which sets
 * RUNE_INSPECT_SOCKET) and `rune inspect` both derive this from the cwd, so an
 * attach needs no configuration when run from the same project directory.
 */
export const DEFAULT_SOCKET_PATH = ".rune/inspect.sock"

/**
 * Which transform/coordinate space a serialized node lives in. Drives how the
 * inspector labels and edits its properties.
 */
export enum InspectorNodeKind {
  /** A 2D entity (position in 2D, scalar rotation). */
  Entity2D = "entity2d",
  /** A 3D entity (position in 3D, quaternion rotation). */
  Entity3D = "entity3d",
  /** A 2D entity that owns a nested 3D scene (a `WorldView3D`). */
  WorldView3D = "worldview3d",
  /** An entity of unknown or unhandled kind. */
  Entity = "entity",
}

/** Serialized 2D vector. */
export interface Vector2Data {
  /** X component. */
  x: number
  /** Y component. */
  y: number
}

/** Serialized 3D vector. */
export interface Vector3Data {
  /** X component. */
  x: number
  /** Y component. */
  y: number
  /** Z component. */
  z: number
}

/** Serialized quaternion. */
export interface QuaternionData {
  /** X component. */
  x: number
  /** Y component. */
  y: number
  /** Z component. */
  z: number
  /** W component. */
  w: number
}

/**
 * Only the transform fields relevant to a node's kind are populated. 2D nodes
 * carry Vector2 position/scale + scalar rotation + size; 3D nodes carry Vector3
 * position/scale + a quaternion rotation.
 */
export interface InspectorProps {
  /** Position (2D or 3D depending on kind). */
  position?: Vector2Data | Vector3Data
  /** Rotation (scalar for 2D, quaternion for 3D). */
  rotation?: number | QuaternionData
  /** Scale (2D or 3D depending on kind). */
  scale?: Vector2Data | Vector3Data
  /** 2D size (2D entities only). */
  size?: Vector2Data
}

/**
 * A serialized entity. `id` is stable across snapshots (see identity.ts) so the
 * client can preserve selection and target edits. `world` is present on a
 * WorldView3D and holds its nested Scene3D tree.
 */
export interface InspectorNode {
  /** Stable inspector id (assigned by `inspectorId()` in `inspect/identity.ts`). */
  id: number
  /** Entity class name. */
  type: string
  /** Which coordinate space this node lives in. */
  kind: InspectorNodeKind
  /** Whether the entity is enabled. */
  enabled: boolean
  /** Whether the entity is visible. */
  visible: boolean
  /** Draw/sort order index. */
  zIndex: number
  /** Transform properties relevant to this node's kind. */
  props: InspectorProps
  /** Serialized children. */
  children: InspectorNode[]
  /** Nested 3D scene tree, present only on WorldView3D nodes. */
  world?: InspectorTree
  /**
   * Free-form descriptive lines for informational nodes (used by `rune preview`
   * to describe project files/assets). When present the inspector shows these in
   * the detail pane instead of editable transform properties.
   */
  detail?: string[]
}

/** A named tree of serialized entities (a scene or a nested world). */
export interface InspectorTree {
  /** Tree name (scene name or synthesized label). */
  name: string
  /** Top-level entities in the tree. */
  entities: InspectorNode[]
}

/**
 * One full description of the application state at a point in time. `scene` is
 * null when no scene is active (or, in preview mode, carries the project's
 * static structure under a synthetic tree).
 */
export interface InspectorSnapshot {
  /** Protocol version (matches {@link INSPECT_PROTOCOL_VERSION}). */
  protocol: number
  /** Current tick count. */
  tick: number
  /** Current frames per second. */
  framesPerSecond: number
  /** Current ticks per second. */
  ticksPerSecond: number
  /** Whether the simulation is paused. */
  paused: boolean
  /** Names of the active scene stack. */
  sceneStack: string[]
  /** Serialized scene tree, or `null` when no scene is active. */
  scene: InspectorTree | null
}

/**
 * The transform/state fields the server accepts edits for. 3D rotation
 * (a quaternion) is intentionally read-only — nudging raw components is not
 * meaningful, so it is omitted here.
 */
export type EditableProp =
  | "enabled"
  | "visible"
  | "zIndex"
  | "rotation"
  | "position.x"
  | "position.y"
  | "position.z"
  | "scale.x"
  | "scale.y"
  | "scale.z"

/** An edit request targeting one field of one entity. */
export interface InspectorEdit {
  /** Message discriminator (`"edit"`). */
  kind: "edit"
  /** Stable id of the target entity. */
  id: number
  /** The field to edit. */
  prop: EditableProp
  /** The new value. */
  value: number | boolean
}

/** Commands the client can send to control the simulation. */
export enum InspectorCommandAction {
  /** Pause the simulation. */
  Pause = "pause",
  /** Resume the simulation. */
  Resume = "resume",
}

/** A command message from the client. */
export interface InspectorCommand {
  /** Message discriminator (`"command"`). */
  kind: "command"
  /** The command to apply. */
  action: InspectorCommandAction
}

/** Anything the client may send to the server. */
export type InspectorMessage = InspectorEdit | InspectorCommand
