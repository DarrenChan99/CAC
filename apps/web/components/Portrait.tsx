import { portraitFor, type Hair } from "@/lib/portraits";

/** A hair cap that sits on the crown and stops at the temples. */
const cap = <path d="M33 42C32 28 40 22 50 22s18 6 17 20c-4-6-10-9-17-9s-13 3-17 9Z" />;

/**
 * Hair in two layers around a head filled with the tile colour (head centre
 * 50,44 · radii 17×19): `back` sits behind the head, `front` covers it, so no
 * outline shows through. `ears: false` when the hair hides them.
 */
const hair: Record<Hair, { back?: React.ReactNode; front?: React.ReactNode; ears?: false }> = {
  short: { front: cap },
  parted: { front: <path d="M33 43C31 28 40 22 51 22s17 7 16 21c-3-6-7-10-12-11-9 1-17 5-22 11Z" /> },
  messy: { front: <path d="M33 41 35 27l6 4 4-10 6 7 5-8 4 9 6-3 1 15c-4-6-10-9-17-9s-13 3-17 9Z" /> },
  bald: {},
  bun: {
    back: <circle cx="50" cy="17" r="6" />,
    front: cap,
  },
  bob: {
    back: <path d="M34 58c-7-6-7-21-2-29 4-6 10-8 18-8s14 2 18 8c5 8 5 23-2 29Z" />,
    front: <path d="M33 40c2-11 9-17 17-17s15 6 17 17c-6-3-12-8-17-14-5 6-11 11-17 14Z" />,
    ears: false,
  },
  long: {
    front: <path fill="none" d="M30 74c4-12 0-24 3-34 2-11 9-18 17-18s15 7 17 18c3 10-1 22 3 34M33 38c8-5 26-5 34 0" />,
    ears: false,
  },
  ponytail: {
    back: <path fill="none" d="M66 32c9 3 12 15 6 28" />,
    front: cap,
  },
  curly: {
    front: (
      <>
        {[
          [34, 42],
          [35, 31],
          [42, 24],
          [51, 21],
          [59, 24],
          [65, 31],
          [66, 42],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="6" />
        ))}
      </>
    ),
    ears: false,
  },
  braids: {
    back: <path fill="none" d="M34 48l-3 6 3 6-3 6M66 48l3 6-3 6 3 6" />,
    front: cap,
  },
  pigtails: {
    back: (
      <>
        <circle cx="31" cy="30" r="5" />
        <circle cx="69" cy="30" r="5" />
      </>
    ),
    front: <path d="M35 37c3-7 9-11 15-11s12 4 15 11c-4-3-9-4-15-4s-11 1-15 4Z" />,
  },
};

/**
 * A simple line drawing of one family member, in the view's primary green.
 * Unknown ids draw nothing — callers keep the "?" for those.
 */
export function Portrait({
  personId,
  bold = false,
  className = "",
}: {
  personId: string;
  /** Thicker lines, for small sizes. */
  bold?: boolean;
  className?: string;
}) {
  const t = portraitFor(personId);
  if (!t) return null;
  const h = hair[t.hair];

  return (
    <svg
      viewBox="0 0 100 100"
      // Filled with the tile colour so front layers hide what is behind them.
      fill="var(--color-tint)"
      stroke="currentColor"
      strokeWidth={bold ? 3.5 : 2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {/* A child is the same drawing on a smaller body. */}
      <path d={t.child ? "M28 100c0-17 10-26 22-26s22 9 22 26" : "M18 100c0-20 14-29 32-29s32 9 32 29"} />
      <path d={t.child ? "M46 65v9M54 65v9" : "M44 62v9M56 62v9"} />
      <g transform={t.child ? "translate(10 15) scale(0.8)" : undefined}>
        {h.back}
        {h.ears !== false && <path d="M33 41c-5 0-5 9 0 9M67 41c5 0 5 9 0 9" />}
        <ellipse cx="50" cy="44" rx="17" ry="19" />
        <circle cx="43" cy="45" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="57" cy="45" r="1.6" fill="currentColor" stroke="none" />
        {t.beard && <path d="M34 49c1 13 7 20 16 20s15-7 16-20c-4 5-9 8-16 8s-12-3-16-8Z" />}
        {t.moustache && <path d="M43 51c2-3 5-3 7-1 2-2 5-2 7 1" />}
        <path fill="none" d={t.beard ? "M45 62q5 3 10 0" : "M44 54q6 5 12 0"} />
        {t.glasses && (
          <>
            <circle cx="43" cy="45" r="5" fill="none" />
            <circle cx="57" cy="45" r="5" fill="none" />
            <path d="M48 45h4" />
          </>
        )}
        {h.front}
      </g>
    </svg>
  );
}
