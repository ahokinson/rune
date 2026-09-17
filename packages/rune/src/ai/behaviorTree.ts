/**
 * Behaviour trees: compose agent logic from small nodes that each tick to a
 * status. Composite nodes (sequence, selector, parallel) route control to their
 * children; decorators wrap one child; leaves do the actual work (an action or a
 * condition). Trees scale to richer behaviour than a flat state machine because
 * behaviour is built by composition, and a Running result lets an action span many
 * ticks. Tick the root once per update; it returns the whole tree's status.
 *
 * @module
 */

/** Status a {@link BehaviorNode} returns from a tick. */
export enum BehaviorStatus {
  /** The node completed its task successfully. */
  Success = "success",
  /** The node failed its task. */
  Failure = "failure",
  /** The node is mid-task and wants to be ticked again next frame. */
  Running = "running",
}

/** A node in a behaviour tree that progresses one tick at a time. */
export interface BehaviorNode {
  /**
   * Advance the node by one tick.
   *
   * @param deltaMilliseconds - Time elapsed since the previous tick.
   * @returns The node's status after this tick.
   */
  tick(deltaMilliseconds: number): BehaviorStatus
  /** Clear any in-progress state so the node starts fresh next tick. */
  reset?(): void
}

/**
 * Runs children in order; fails on the first child that fails, stays Running while
 * a child is Running, and succeeds only when all children succeed. The "do A then
 * B then C" node.
 */
export class Sequence implements BehaviorNode {
  private cursor = 0

  /**
   * @param children - Nodes to run in order.
   */
  constructor(private readonly children: BehaviorNode[]) {}

  /**
   * Advance the sequence by one tick.
   *
   * @param deltaMilliseconds - Time elapsed since the previous tick.
   * @returns Running while a child runs, Failure on the first failure, Success once all children succeed.
   */
  tick(deltaMilliseconds: number): BehaviorStatus {
    while (this.cursor < this.children.length) {
      const status = this.children[this.cursor]!.tick(deltaMilliseconds)
      if (status === BehaviorStatus.Running) return BehaviorStatus.Running
      if (status === BehaviorStatus.Failure) {
        this.reset()
        return BehaviorStatus.Failure
      }
      this.cursor++
    }
    this.reset()
    return BehaviorStatus.Success
  }

  /** Reset the cursor and propagate reset to every child. */
  reset(): void {
    this.cursor = 0
    for (const child of this.children) child.reset?.()
  }
}

/**
 * Runs children in order until one succeeds (or is Running); fails only if all
 * fail. The "try A, else B, else C" / fallback node.
 */
export class Selector implements BehaviorNode {
  private cursor = 0

  /**
   * @param children - Nodes to try in order.
   */
  constructor(private readonly children: BehaviorNode[]) {}

  /**
   * Advance the selector by one tick.
   *
   * @param deltaMilliseconds - Time elapsed since the previous tick.
   * @returns Running while a child runs, Success on the first success, Failure once all children fail.
   */
  tick(deltaMilliseconds: number): BehaviorStatus {
    while (this.cursor < this.children.length) {
      const status = this.children[this.cursor]!.tick(deltaMilliseconds)
      if (status === BehaviorStatus.Running) return BehaviorStatus.Running
      if (status === BehaviorStatus.Success) {
        this.reset()
        return BehaviorStatus.Success
      }
      this.cursor++
    }
    this.reset()
    return BehaviorStatus.Failure
  }

  /** Reset the cursor and propagate reset to every child. */
  reset(): void {
    this.cursor = 0
    for (const child of this.children) child.reset?.()
  }
}

/** How {@link Parallel} resolves its children's statuses into one result. */
export enum ParallelPolicy {
  /** Succeed as soon as one child succeeds. */
  RequireOne = "requireOne",
  /** Succeed only when every child succeeds. */
  RequireAll = "requireAll",
}

/**
 * Ticks every child each tick. Resolves to Success/Failure per `policy`; otherwise
 * stays Running. Good for "do these at once" (move while scanning).
 */
export class Parallel implements BehaviorNode {
  /**
   * @param children - Nodes to tick in parallel.
   * @param policy - How the parallel resolves Success/Failure. Defaults to {@link ParallelPolicy.RequireAll}.
   */
  constructor(
    private readonly children: BehaviorNode[],
    private readonly policy: ParallelPolicy = ParallelPolicy.RequireAll,
  ) {}

  /**
   * Advance every child by one tick and resolve per the policy.
   *
   * @param deltaMilliseconds - Time elapsed since the previous tick.
   * @returns Success/Failure per `policy`, otherwise Running.
   */
  tick(deltaMilliseconds: number): BehaviorStatus {
    let successes = 0
    let failures = 0
    for (const child of this.children) {
      const status = child.tick(deltaMilliseconds)
      if (status === BehaviorStatus.Success) successes++
      else if (status === BehaviorStatus.Failure) failures++
    }
    if (this.policy === ParallelPolicy.RequireOne && successes > 0) return BehaviorStatus.Success
    if (this.policy === ParallelPolicy.RequireAll && successes === this.children.length) return BehaviorStatus.Success
    if (this.policy === ParallelPolicy.RequireAll && failures > 0) return BehaviorStatus.Failure
    if (this.policy === ParallelPolicy.RequireOne && failures === this.children.length) return BehaviorStatus.Failure
    return BehaviorStatus.Running
  }

  /** Propagate reset to every child. */
  reset(): void {
    for (const child of this.children) child.reset?.()
  }
}

/** Flips Success ↔ Failure of its child (Running passes through). */
export class Inverter implements BehaviorNode {
  /**
   * @param child - The node to invert.
   */
  constructor(private readonly child: BehaviorNode) {}

  /**
   * Tick the child and invert its status.
   *
   * @param deltaMilliseconds - Time elapsed since the previous tick.
   * @returns The inverted status of the child.
   */
  tick(deltaMilliseconds: number): BehaviorStatus {
    const status = this.child.tick(deltaMilliseconds)
    if (status === BehaviorStatus.Success) return BehaviorStatus.Failure
    if (status === BehaviorStatus.Failure) return BehaviorStatus.Success
    return status
  }

  /** Propagate reset to the child. */
  reset(): void {
    this.child.reset?.()
  }
}

/**
 * Re-runs its child up to `times` (or forever when `times` is undefined), staying
 * Running between repeats; fails if a repeat fails.
 */
export class Repeater implements BehaviorNode {
  private count = 0

  /**
   * @param child - The node to repeat.
   * @param times - Maximum repeats; undefined means repeat forever.
   */
  constructor(
    private readonly child: BehaviorNode,
    private readonly times?: number,
  ) {}

  /**
   * Tick the child; on Success, reset it and stay Running until the count is reached.
   *
   * @param deltaMilliseconds - Time elapsed since the previous tick.
   * @returns Running between repeats, Success when the count is reached, Failure if a repeat fails.
   */
  tick(deltaMilliseconds: number): BehaviorStatus {
    const status = this.child.tick(deltaMilliseconds)
    if (status === BehaviorStatus.Running) return BehaviorStatus.Running
    if (status === BehaviorStatus.Failure) {
      this.reset()
      return BehaviorStatus.Failure
    }
    this.count++
    this.child.reset?.()
    if (this.times !== undefined && this.count >= this.times) {
      this.reset()
      return BehaviorStatus.Success
    }
    return BehaviorStatus.Running
  }

  /** Reset the counter and propagate reset to the child. */
  reset(): void {
    this.count = 0
    this.child.reset?.()
  }
}

/**
 * Leaf that runs a function each tick and returns its status. The function may
 * return Running across ticks for a multi-frame action.
 */
export class Action implements BehaviorNode {
  /**
   * @param run - Function called each tick.
   */
  constructor(private readonly run: (deltaMilliseconds: number) => BehaviorStatus) {}

  /**
   * Invoke the wrapped function.
   *
   * @param deltaMilliseconds - Time elapsed since the previous tick.
   * @returns Whatever `run` returns.
   */
  tick(deltaMilliseconds: number): BehaviorStatus {
    return this.run(deltaMilliseconds)
  }
}

/** Leaf that succeeds when a predicate is true, else fails — a guard for sequences. */
export class Condition implements BehaviorNode {
  /**
   * @param predicate - Returns true to succeed, false to fail.
   */
  constructor(private readonly predicate: () => boolean) {}

  /**
   * Evaluate the predicate.
   *
   * @param _deltaMilliseconds - Unused.
   * @returns {@link BehaviorStatus.Success} when the predicate holds, else {@link BehaviorStatus.Failure}.
   */
  tick(_deltaMilliseconds?: number): BehaviorStatus {
    return this.predicate() ? BehaviorStatus.Success : BehaviorStatus.Failure
  }
}
