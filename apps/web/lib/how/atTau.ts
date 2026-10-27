import stats from "./stats.json" with { type: "json" };

/** [score, outcome]: outcome 0 right name, 1 "Someone new", 2 wrong name. */
export type Win = number[];

/**
 * What a stored test window would have become at a different cut-off. Windows are stored at stats.tau, so
 * this only moves the ones whose score sits between the two cut-offs; the margin rule is not re-run.
 */
export function outcomeAt(stranger: boolean, [s, o]: Win, tau: number): 0 | 1 | 2 {
  if (tau <= stats.tau) return (o === 1 && s > tau ? (stranger ? 2 : 0) : o) as 0 | 1 | 2;
  return (s <= tau && (stranger ? o === 2 : o === 0) ? 1 : o) as 0 | 1 | 2;
}

export function countsAt(tau: number) {
  const w = stats.windows as Record<string, Win[]>;
  let right = 0, family = 0, strangerNamed = 0;
  for (const [id, rows] of Object.entries(w)) {
    const stranger = id === "stranger";
    for (const r of rows) {
      const o = outcomeAt(stranger, r, tau);
      if (stranger) strangerNamed += o === 2 ? 1 : 0;
      else { family++; right += o === 0 ? 1 : 0; }
    }
  }
  return { right, family, strangerNamed, strangers: w.stranger.length };
}
