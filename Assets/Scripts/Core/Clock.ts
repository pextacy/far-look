// Shared Lens clock. Pure: FarLookController advances it once per frame (it is
// first in the hierarchy), views read it instead of getTime()/getDeltaTime().
// `scale` is 1 in normal use; the controller's captureTimeScale input lowers it
// only for slow-motion video capture, so every animation slows down together.
export const clock = {
  scale: 1,
  /** Scaled seconds since the Lens started. */
  t: 0,
  /** Scaled delta of the current frame, seconds. */
  dt: 0,
}

export function advanceClock(realDtSec: number): void {
  clock.dt = realDtSec * clock.scale
  clock.t += clock.dt
}
