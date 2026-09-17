/**
 * Helpers for building {@link AnimatedSprite} instances from authored clip data.
 *
 * The parsing functions here are the asset-system entry points that turn raw
 * clip records into the runtime `AnimatedSprite` used by the renderer.
 *
 * @module
 */

import type { AnimationClip } from "@/draw/animatedSprite"
import { AnimatedSprite } from "@/draw/animatedSprite"

/**
 * Build an {@link AnimatedSprite} from a clip map and the initial clip name.
 *
 * @param clips - Map of clip name to clip definition.
 * @param initial - Name of the clip to play first.
 * @returns A new {@link AnimatedSprite}.
 */
export function parseAnimatedSprite<TFrame>(
  clips: Record<string, AnimationClip<TFrame>>,
  initial: string,
): AnimatedSprite<TFrame> {
  return new AnimatedSprite({ clips, initial })
}
