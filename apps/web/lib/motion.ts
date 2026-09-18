import type { Transition } from "motion/react";

/**
 * Spring presets. Apple's two designer-facing parameters map onto Motion's
 * `bounce` + `duration`: bounce 0 is critically damped, and duration is the
 * "response" — how fast it reaches the target, not a fixed run time.
 *
 * Default everything to no overshoot. Bounce is reserved for motion that the
 * user's own gesture put momentum into.
 */

/** Move / reposition. The house default. */
export const spring: Transition = { type: "spring", bounce: 0, duration: 0.4 };

/** Snappier variant for small elements that should feel immediate. */
export const springQuick: Transition = { type: "spring", bounce: 0, duration: 0.28 };

/** Only for releases that followed a drag or flick. */
export const springMomentum: Transition = { type: "spring", bounce: 0.22, duration: 0.4 };

/** Sheets and drawers — a touch of overshoot, they are grabbed things. */
export const springSheet: Transition = { type: "spring", bounce: 0.2, duration: 0.3 };

/** Non-spatial fades (opacity/colour only) where a spring would be theatre. */
export const fade: Transition = { duration: 0.2, ease: "easeOut" };

/**
 * Press feedback fires on pointer-down, not on click — waiting for the release
 * feels dead. Same shape in both views; only the scale differs, because a 72px
 * resident target moving 3% reads much larger than a 44px one.
 */
export const pressResident = { scale: 0.975 };
export const pressFamily = { scale: 0.97 };
export const pressTransition: Transition = { duration: 0.1, ease: "easeOut" };

/**
 * Momentum projection — where a flick is *going*, not where it was released.
 * Exponential decay, matching UIScrollView rather than the physics-textbook
 * v²/2a form.
 */
export function project(initialVelocity: number, decelerationRate = 0.998): number {
  return ((initialVelocity / 1000) * decelerationRate) / (1 - decelerationRate);
}
