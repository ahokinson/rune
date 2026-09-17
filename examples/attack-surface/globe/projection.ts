import { Camera3D, directionToScreenPlane, SphereProjection, SphereProjector, Vector3 } from "@ahokinson/rune"

// Axial tilt of the globe (radians), two axes, applied as Rz(roll)·Rx(pitch) on
// the globe so it reads like a globe on a stand while still spinning about its
// own axis. The disc and the screen-space lighting are unaffected.
//   PITCH (about camera X): negative leans the top/north pole toward the viewer,
//                           so the northern hemisphere faces us.
//   ROLL  (about camera Z): leans the polar axis sideways in the screen plane.
export const GLOBE_TILT_PITCH = (-6 * Math.PI) / 180
export const GLOBE_TILT_ROLL = (2 * Math.PI) / 180

// Terminal cells are about twice as tall as wide, so the globe's vertical extent
// is squashed by this factor everywhere it is drawn.
export const ASPECT_Y = 0.5

// The shared screen <-> sphere projection for the whole scene. Geography is fed
// in as radians (latitude -> theta, longitude -> phi) at each call site.
export const sphereProjection = new SphereProjection({
  tiltPitch: GLOBE_TILT_PITCH,
  tiltRoll: GLOBE_TILT_ROLL,
  aspectY: ASPECT_Y,
})

// Bind the sphere projection to the engine's generic 3D camera, so the globe's
// geometry (surface, cities, arcs) is auto-projected/culled/drawn by the engine's
// World3D rather than hand-iterated here. `sphereProjector.rotation` carries the
// spin and is refreshed each frame by GlobeEntity.
export const sphereProjector = new SphereProjector(sphereProjection)
export const camera3D = new Camera3D({ projector: sphereProjector })

// Fixed light direction in camera/screen space (upper-left, toward viewer), so
// the globe turns through a stable terminator instead of dragging the lit
// hemisphere along with it.
export const LIGHT = new Vector3(-0.5, -0.6, 0.6).normalize()

// Light direction projected onto the screen plane — the atmosphere uses this so
// its glow brightens on the same limb the surface highlight sits on, tying the
// halo to the sphere's lighting.
const lightPlane = directionToScreenPlane(LIGHT)
export const LIGHT_PLANE_X = lightPlane.x
export const LIGHT_PLANE_Y = lightPlane.y
