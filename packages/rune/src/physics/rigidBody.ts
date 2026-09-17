/**
 * An impulse-based 3D rigid body. A body falls under gravity and is resolved
 * against the floor with collision impulses applied at contact points. Because
 * an impulse at a point off the centre of mass produces torque, the body tips,
 * tumbles, rolls, and settles the way a real solid does rather than hovering at
 * a fixed height.
 *
 * Three collider shapes approximate a mesh (see ./collider): a sphere (single
 * rolling contact, isotropic inertia), a box (eight corners), and a mesh
 * (sampled surface vertices, so a body settles on its real silhouette).
 *
 * Render space is Y-down (camera up is (0,-1,0)), so "down" is +Y and the floor
 * plane sits below the origin at y = floorY, its outward normal pointing up.
 *
 * @module
 */

import { Quaternion } from "@/math/quaternion"
import { Vector3 } from "@/math/vector3"
import { type Collider, ColliderKind } from "./collider"

/** Construction options for a {@link RigidBody3D}. */
export interface RigidBody3DOptions {
  /** Downward (+Y) acceleration, world units per second². */
  gravity?: number
  /**
   * Bounciness of the floor: fraction of normal speed returned per impact. Low, so
   * the body loses energy and beds down within a couple of bounces.
   */
  restitution?: number
  /**
   * Coulomb friction coefficient at floor contacts. Converts sliding into rolling
   * (it drives the contact-point velocity to zero) and arrests it once settled.
   */
  friction?: number
  /** The floor plane; its outward normal is (0,-1,0). */
  floorY?: number
  /**
   * Invisible side/depth walls that keep a moving body in frame. X is wider than Z
   * so it never drifts toward the camera's near plane.
   */
  wallX?: number
  /** See {@link RigidBody3DOptions.wallX}. */
  wallZ?: number
  /**
   * Contact solver: a few sequential-impulse passes per step damp the jitter of
   * multiple simultaneous contacts.
   */
  solverIterations?: number
  /**
   * Positional correction: push a fraction of the remaining penetration out each
   * step (Baumgarte) past a small slop, so the body neither sinks nor pops.
   */
  penetrationSlop?: number
  /** Baumgarte correction fraction per step. See {@link RigidBody3DOptions.penetrationSlop}. */
  correction?: number
  /**
   * Gentle per-second velocity decay standing in for air drag and rolling
   * resistance. Mostly this lets a sphere's vertical-axis spin — which the floor
   * contact sits on the axis of and so cannot brake — bleed off so the body sleeps
   * instead of topping forever.
   */
  linearDamping?: number
  /** Per-second angular velocity decay. See {@link RigidBody3DOptions.linearDamping}. */
  angularDamping?: number
  /**
   * Sleep: once linear and angular speed stay under these for `sleepTime`, freeze
   * the body so it rests dead still instead of shivering on the floor.
   */
  sleepLinear?: number
  /** Angular sleep threshold. See {@link RigidBody3DOptions.sleepLinear}. */
  sleepAngular?: number
  /** Seconds of stillness required before the body sleeps. */
  sleepTime?: number
}

/** An impulse-based 3D rigid body resolved against a floor plane. */
export class RigidBody3D {
  /** World-space centre-of-mass position. */
  readonly position = new Vector3()
  /** Body orientation. */
  readonly orientation = new Quaternion()
  /** Linear velocity (world units / second). */
  readonly velocity = new Vector3()
  /** Angular velocity (radians / second, world axes). */
  readonly angularVelocity = new Vector3()
  /** `true` once the body has gone to sleep; call {@link wake} to revive it. */
  resting = false

  private readonly gravity: number
  private readonly restitution: number
  private readonly friction: number
  private readonly floorY: number
  private readonly wallX: number
  private readonly wallZ: number
  private readonly solverIterations: number
  private readonly penetrationSlop: number
  private readonly correction: number
  private readonly linearDamping: number
  private readonly angularDamping: number
  private readonly sleepLinear: number
  private readonly sleepAngular: number
  private readonly sleepTime: number

  // Collision geometry of the active collider, set in setCollider().
  private kind: ColliderKind = ColliderKind.Box
  private radius = 0.5
  private points: readonly Vector3[] = []
  private readonly inverseInertia = new Vector3(1, 1, 1)
  private readonly invMass = 1

  // Scratch reused every step so the simulation never allocates. `contactLevers`
  // holds the world-space lever arm of each penetrating contact this step; it
  // grows to fit the active collider's point count.
  private contactLevers: Vector3[] = [new Vector3()]
  private readonly scratchA = new Vector3()
  private readonly scratchB = new Vector3()
  private sleepTimer = 0

  /**
   * @param options - Simulation tuning; all fields optional (see {@link RigidBody3DOptions}).
   */
  constructor(options: RigidBody3DOptions = {}) {
    this.gravity = options.gravity ?? 7
    this.restitution = options.restitution ?? 0.3
    this.friction = options.friction ?? 0.5
    this.floorY = options.floorY ?? 0.95
    this.wallX = options.wallX ?? 1.3
    this.wallZ = options.wallZ ?? 0.7
    this.solverIterations = options.solverIterations ?? 8
    this.penetrationSlop = options.penetrationSlop ?? 0.005
    this.correction = options.correction ?? 0.4
    this.linearDamping = options.linearDamping ?? 0.15
    this.angularDamping = options.angularDamping ?? 0.5
    this.sleepLinear = options.sleepLinear ?? 0.06
    this.sleepAngular = options.sleepAngular ?? 0.12
    this.sleepTime = options.sleepTime ?? 0.4
  }

  /**
   * Adopt `collider`'s shape, contact points, and inverse inertia for this body.
   *
   * @param collider - Collider built by {@link colliderFor}.
   */
  setCollider(collider: Collider): void {
    this.kind = collider.kind
    this.radius = collider.radius
    this.points = collider.points
    this.inverseInertia.copyFrom(collider.inverseInertia)
    while (this.contactLevers.length < Math.max(1, this.points.length)) this.contactLevers.push(new Vector3())
  }

  /** Reset the sleep timer and mark the body awake. */
  wake(): void {
    this.sleepTimer = 0
    this.resting = false
  }

  /**
   * Advance the simulation by one step: integrate gravity and damping, gather
   * floor contacts, run the sequential-impulse solver, apply Baumgarte
   * positional correction, then contain the walls and update sleep.
   *
   * @param deltaSeconds - Step duration.
   */
  step(deltaSeconds: number): void {
    if (this.resting) return

    this.velocity.y += this.gravity * deltaSeconds
    this.velocity.scaleInPlace(Math.max(0, 1 - this.linearDamping * deltaSeconds))
    this.angularVelocity.scaleInPlace(Math.max(0, 1 - this.angularDamping * deltaSeconds))
    this.position.x += this.velocity.x * deltaSeconds
    this.position.y += this.velocity.y * deltaSeconds
    this.position.z += this.velocity.z * deltaSeconds
    this.orientation.integrateInPlace(this.angularVelocity, deltaSeconds)

    // Gather the contacts poking through the floor, then resolve them together
    // over several passes so simultaneous contacts converge instead of fighting.
    const contacts = this.gatherFloorContacts()
    let deepest = 0
    for (let c = 0; c < contacts; c++) {
      const penetration = this.position.y + this.contactLevers[c]!.y - this.floorY
      if (penetration > deepest) deepest = penetration
    }
    for (let pass = 0; pass < this.solverIterations; pass++) {
      for (let c = 0; c < contacts; c++) this.resolveFloorContact(this.contactLevers[c]!)
    }

    if (deepest > this.penetrationSlop) {
      // Lift the centre of mass out of the floor (toward smaller y = up).
      this.position.y -= (deepest - this.penetrationSlop) * this.correction
    }

    this.containWalls()
    this.updateSleep(contacts, deltaSeconds)
  }

  // Fill contactLevers with the world-space lever arm of each contact below the
  // floor and return how many there are. A sphere has at most one — its lowest
  // point, `radius` straight below the centre (orientation-independent). A box or
  // mesh tests each local point rotated into world space.
  private gatherFloorContacts(): number {
    if (this.kind === ColliderKind.Sphere) {
      if (this.position.y + this.radius <= this.floorY) return 0
      this.contactLevers[0]!.set(0, this.radius, 0)
      return 1
    }
    let contacts = 0
    for (const point of this.points) {
      const lever = this.contactLevers[contacts]!
      this.orientation.rotateVectorInto(lever, point)
      if (this.position.y + lever.y - this.floorY <= 0) continue
      contacts++
    }
    return contacts
  }

  // Resolve one normal+friction impulse for a contact with the floor. `lever` is
  // the contact offset from the centre of mass, in world space.
  private resolveFloorContact(lever: Vector3): void {
    // Downward component of the contact velocity v = linear + ω × r. The floor
    // normal is (0,-1,0), so only the y term matters here. Resolve only while the
    // point moves into the floor (vy > 0, i.e. downward in this Y-down space).
    const vy = this.velocity.y + (this.angularVelocity.z * lever.x - this.angularVelocity.x * lever.z)
    if (vy <= 0) return

    // Normal impulse. Effective mass k = invMass + n·((I⁻¹(r×n)) × r). With
    // n = (0,-1,0), r×n = (rz, 0, -rx).
    const angular = this.applyInverseInertia(lever.z, 0, -lever.x)
    const k = this.invMass + (angular.x * lever.z - angular.z * lever.x)
    const jn = ((1 + this.restitution) * vy) / k

    // Apply along n = (0,-1,0): velocity gains (0, -jn·invMass, 0); the torque
    // r × (0,-jn,0) = (rz·jn, 0, -rx·jn) drives the tumble.
    this.velocity.y -= jn * this.invMass
    const spin = this.applyInverseInertia(lever.z * jn, 0, -lever.x * jn)
    this.angularVelocity.x += spin.x
    this.angularVelocity.y += spin.y
    this.angularVelocity.z += spin.z

    this.resolveFriction(lever, jn)
  }

  // Coulomb friction in the floor's tangent plane (the x/z plane), clamped to
  // friction · normalImpulse. Driving the tangential contact velocity to zero is
  // exactly the rolling-without-slipping condition, so a sphere spins up to roll.
  private resolveFriction(lever: Vector3, normalImpulse: number): void {
    const vx = this.velocity.x + (this.angularVelocity.y * lever.z - this.angularVelocity.z * lever.y)
    const vz = this.velocity.z + (this.angularVelocity.x * lever.y - this.angularVelocity.y * lever.x)
    const speed = Math.hypot(vx, vz)
    if (speed < 1e-6) return

    const tx = vx / speed
    const tz = vz / speed
    // Effective mass along the tangent t = (tx, 0, tz): r×t then I⁻¹ then ·.
    const rtx = lever.y * tz - lever.z * 0
    const rty = lever.z * tx - lever.x * tz
    const rtz = lever.x * 0 - lever.y * tx
    const angular = this.applyInverseInertia(rtx, rty, rtz)
    // (angular × r) · t
    const cx = angular.y * lever.z - angular.z * lever.y
    const cz = angular.x * lever.y - angular.y * lever.x
    const k = this.invMass + cx * tx + cz * tz
    let jt = -speed / k

    const limit = this.friction * normalImpulse
    if (jt < -limit) jt = -limit
    else if (jt > limit) jt = limit

    const px = tx * jt
    const pz = tz * jt
    this.velocity.x += px * this.invMass
    this.velocity.z += pz * this.invMass
    const spin = this.applyInverseInertia(lever.y * pz, lever.z * px - lever.x * pz, -lever.y * px)
    this.angularVelocity.x += spin.x
    this.angularVelocity.y += spin.y
    this.angularVelocity.z += spin.z
  }

  // I⁻¹·v in world space: rotate v into the body frame, scale by the diagonal
  // inverse inertia, rotate back. Returns a shared scratch vector.
  private applyInverseInertia(x: number, y: number, z: number): Vector3 {
    this.scratchA.set(x, y, z)
    this.orientation.rotateVectorInverseInto(this.scratchB, this.scratchA)
    this.scratchB.x *= this.inverseInertia.x
    this.scratchB.y *= this.inverseInertia.y
    this.scratchB.z *= this.inverseInertia.z
    return this.orientation.rotateVectorInto(this.scratchA, this.scratchB)
  }

  // Keep the body in frame with simple reflecting walls on the centre of mass.
  // They are a containment net, not a precise contact, so a body can graze them
  // without a full impulse solve.
  private containWalls(): void {
    if (this.position.x > this.wallX) {
      this.position.x = this.wallX
      if (this.velocity.x > 0) this.velocity.x = -this.velocity.x * this.restitution
    } else if (this.position.x < -this.wallX) {
      this.position.x = -this.wallX
      if (this.velocity.x < 0) this.velocity.x = -this.velocity.x * this.restitution
    }
    if (this.position.z > this.wallZ) {
      this.position.z = this.wallZ
      if (this.velocity.z > 0) this.velocity.z = -this.velocity.z * this.restitution
    } else if (this.position.z < -this.wallZ) {
      this.position.z = -this.wallZ
      if (this.velocity.z < 0) this.velocity.z = -this.velocity.z * this.restitution
    }
  }

  private updateSleep(contacts: number, deltaSeconds: number): void {
    const slow =
      contacts > 0 &&
      this.velocity.lengthSquared() < this.sleepLinear &&
      this.angularVelocity.lengthSquared() < this.sleepAngular
    if (slow) {
      this.sleepTimer += deltaSeconds
      if (this.sleepTimer >= this.sleepTime) {
        this.velocity.set(0, 0, 0)
        this.angularVelocity.set(0, 0, 0)
        this.resting = true
      }
    } else {
      this.sleepTimer = 0
    }
  }
}
