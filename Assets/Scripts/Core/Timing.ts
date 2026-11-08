// Break timings in milliseconds. Pure, no Lens APIs.

export type Timing = {
  workMs: number;
  lookMs: number;
  snoozeMs: number;
  cardMs: number;
  introMs: number;
};

/** Real use: 20 min work, 20 s look (20-20-20 rule). */
export const REAL: Timing = { workMs: 20 * 60_000, lookMs: 20_000, snoozeMs: 5 * 60_000, cardMs: 4_000, introMs: 1_200 };

/** Demo: shortened work and snooze, look stays 20 s. */
export const DEMO: Timing = { workMs: 60_000, lookMs: 20_000, snoozeMs: 30_000, cardMs: 4_000, introMs: 1_200 };

export function timingFor(demo: boolean): Timing {
  return demo ? DEMO : REAL;
}
