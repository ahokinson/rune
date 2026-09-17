/**
 * Position-based dynamics (Verlet) constraint system: a network of point masses
 * linked by constraints that are satisfied by directly nudging positions over a
 * few relaxation passes. This is the standard, stable way to simulate ropes,
 * chains, cloth and soft ragdolls — complementary to RigidBody (which handles
 * solid bodies). It is dimension-agnostic: leave z at 0 and gravity in the x/y
 * plane for a 2D rope, or use all three axes for 3D cloth. A particle with
 * inverseMass 0 is pinned (infinite mass) and never moves.
 *
 * @module
 */

import { Vector3 } from "@/math/vector3"

/**
 * A Verlet point mass. Position and previous position are both tracked so the
 * implied velocity is `position − previous`; integration advances both.
 */
export class PointMass {
  /** Current position. */
  readonly position: Vector3
  /** Previous position; the implicit velocity is `position − previous` (Verlet). */
  readonly previous: Vector3
  /** Reciprocal of mass; `0` means the particle is pinned (infinite mass). */
  inverseMass: number

  /**
   * @param x - Initial X (default 0).
   * @param y - Initial Y (default 0).
   * @param z - Initial Z (default 0).
   * @param mass - Mass; `<= 0` pins the particle (default 1).
   */
  constructor(x = 0, y = 0, z = 0, mass = 1) {
    this.position = new Vector3(x, y, z)
    this.previous = new Vector3(x, y, z)
    this.inverseMass = mass <= 0 ? 0 : 1 / mass
  }

  /** `true` when the particle is pinned (infinite mass) and never moves. */
  get pinned(): boolean {
    return this.inverseMass === 0
  }

  /**
   * Pin (mass 0) or release (finite mass) the particle in place.
   *
   * @param pinned - `true` to pin, `false` to release.
   * @param mass - Mass to restore when releasing (default 1); `<= 0` keeps it pinned.
   */
  setPinned(pinned: boolean, mass = 1): void {
    this.inverseMass = pinned ? 0 : mass <= 0 ? 0 : 1 / mass
  }

  /**
   * Verlet integration: advance by the implied velocity plus acceleration·dt²,
   * with `damping` bleeding off velocity (0 = none). Pinned particles ignore it.
   *
   * @param deltaSeconds - Time step.
   * @param acceleration - Per-axis acceleration (e.g. gravity).
   * @param damping - Fraction of implied velocity shed this step (0 = none).
   */
  integrate(deltaSeconds: number, acceleration: Vector3, damping: number): void {
    if (this.inverseMass === 0) return
    const velocityX = (this.position.x - this.previous.x) * (1 - damping)
    const velocityY = (this.position.y - this.previous.y) * (1 - damping)
    const velocityZ = (this.position.z - this.previous.z) * (1 - damping)
    this.previous.copyFrom(this.position)
    const dt2 = deltaSeconds * deltaSeconds
    this.position.x += velocityX + acceleration.x * dt2
    this.position.y += velocityY + acceleration.y * dt2
    this.position.z += velocityZ + acceleration.z * dt2
  }
}

/** A constraint over one or more {@link PointMass} instances, solved per relaxation pass. */
export interface Constraint {
  /** Push the constrained particles toward satisfying this constraint. */
  solve(): void
}

/**
 * Hold two particles at `restLength`. `stiffness` in (0, 1] scales the correction
 * per pass: 1 is a rigid rod (taut after enough iterations), lower is springier.
 */
export class DistanceConstraint implements Constraint {
  /**
   * @param a - First endpoint.
   * @param b - Second endpoint.
   * @param restLength - Target separation.
   * @param stiffness - Correction fraction per pass (default 1).
   */
  constructor(
    readonly a: PointMass,
    readonly b: PointMass,
    public restLength: number,
    public stiffness = 1,
  ) {}

  /** Nudge both endpoints toward the rest separation, split by inverse mass. */
  solve(): void {
    const dx = this.b.position.x - this.a.position.x
    const dy = this.b.position.y - this.a.position.y
    const dz = this.b.position.z - this.a.position.z
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
    if (distance < 1e-9) return
    const inverseMassSum = this.a.inverseMass + this.b.inverseMass
    if (inverseMassSum === 0) return
    // Fraction of the error each endpoint absorbs is proportional to its share of
    // the combined inverse mass — the heavier (smaller inverseMass) end moves less.
    const difference = ((distance - this.restLength) / distance) * this.stiffness
    const correctionX = dx * difference
    const correctionY = dy * difference
    const correctionZ = dz * difference
    const aShare = this.a.inverseMass / inverseMassSum
    const bShare = this.b.inverseMass / inverseMassSum
    this.a.position.x += correctionX * aShare
    this.a.position.y += correctionY * aShare
    this.a.position.z += correctionZ * aShare
    this.b.position.x -= correctionX * bShare
    this.b.position.y -= correctionY * bShare
    this.b.position.z -= correctionZ * bShare
  }
}

/**
 * Pin a particle to a fixed anchor point each pass (a moving attachment point —
 * for a static pin, set the particle's inverseMass to 0 instead).
 */
export class PinConstraint implements Constraint {
  /** The world-space point the particle is welded to. */
  readonly anchor: Vector3

  /**
   * @param particle - Particle to pin.
   * @param anchor - Anchor position (cloned; mutate `anchor` to drag the particle).
   */
  constructor(
    readonly particle: PointMass,
    anchor: Vector3,
  ) {
    this.anchor = anchor.clone()
  }

  /** Snap the particle to the anchor. */
  solve(): void {
    this.particle.position.copyFrom(this.anchor)
  }
}

/** Options for constructing a {@link ConstraintSolver}. */
export interface ConstraintSolverOptions {
  /** Acceleration applied to every particle each step (e.g. gravity). */
  gravity?: Vector3
  /** Relaxation passes per step; more passes make rigid constraints stiffer. */
  iterations?: number
  /** Velocity bleed per step (0 = none), standing in for air drag. */
  damping?: number
}

/**
 * Steps a network of {@link PointMass} instances and {@link Constraint}s:
 * integrates every particle, then satisfies the constraints over several
 * relaxation passes per step.
 */
export class ConstraintSolver {
  /** Particles owned by this solver. */
  readonly particles: PointMass[] = []
  /** Constraints owned by this solver. */
  readonly constraints: Constraint[] = []
  /** Acceleration applied to every particle each step. */
  readonly gravity: Vector3
  private readonly iterations: number
  private readonly damping: number

  /**
   * @param options - Construction options (all fields optional).
   */
  constructor(options: ConstraintSolverOptions = {}) {
    this.gravity = (options.gravity ?? new Vector3(0, 0, 0)).clone()
    this.iterations = options.iterations ?? 8
    this.damping = options.damping ?? 0
  }

  /**
   * Register a particle with the solver.
   *
   * @typeParam T - Particle subtype.
   * @param particle - Particle to add.
   * @returns `particle`, for chaining.
   */
  add<T extends PointMass>(particle: T): T {
    this.particles.push(particle)
    return particle
  }

  /**
   * Register a constraint with the solver.
   *
   * @typeParam T - Constraint subtype.
   * @param constraint - Constraint to add.
   * @returns `constraint`, for chaining.
   */
  addConstraint<T extends Constraint>(constraint: T): T {
    this.constraints.push(constraint)
    return constraint
  }

  /**
   * Integrate every particle, then satisfy the constraints over several passes.
   *
   * @param deltaSeconds - Time step.
   */
  step(deltaSeconds: number): void {
    for (const particle of this.particles) particle.integrate(deltaSeconds, this.gravity, this.damping)
    for (let pass = 0; pass < this.iterations; pass++) {
      for (const constraint of this.constraints) constraint.solve()
    }
  }
}
