// Hard-coded copy. Pure, no Lens APIs.

export const HINT_LINES = ["Study as usual. Pip will find you.", "Then you find Pip."];

export const FOOTER = "A break reminder, not medical advice.";

/** Two-line score card text. */
export function scoreLines(findMs: number, streak: number, lookMs: number): [string, string] {
  const found = Math.max(1, Math.round(findMs / 1000));
  const rested = Math.round(lookMs / 1000);
  return [`Found in ${found} s. Rested ${rested} s.`, `Streak ${streak}.`];
}

export function streakLabel(streak: number): string {
  return `Streak ${streak}`;
}
