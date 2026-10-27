import { portraitFor, type Hair } from "@/lib/portraits";

/** Hair, drawn over the head (head centre 50,44 · radii 17×19). */
const hair: Record<Hair, React.ReactNode> = {
  short: <path d="M33 42C32 27 41 22 50 22s18 5 17 20c-3-7-9-11-17-11s-14 4-17 11Z" />,
  messy: <path d="M33 41 35 27l6 4 4-10 6 7 5-8 4 9 6-3 1 15c-4-6-10-9-17-9s-13 3-17 9Z" />,
  receding: <path d="M33 46c0-8 2-12 5-13M67 46c0-8-2-12-5-13" />,
  bun: (
    <>
      <path d="M33 42C32 27 41 23 50 23s18 4 17 19c-4-6-10-9-17-9s-13 3-17 9Z" />
      <circle cx="50" cy="16" r="7" />
    </>
  ),
  bob: <path d="M33 58c-5-25 6-36 17-36s22 11 17 36M34 38c8-5 24-5 32 0" />,
  long: <path d="M30 74c4-12 0-24 3-34 2-11 9-18 17-18s15 7 17 18c3 10-1 22 3 34M33 38c8-5 26-5 34 0" />,
  ponytail: (
    <>
      <path d="M33 42C32 27 41 22 50 22s18 5 17 20c-3-7-9-11-17-11s-14 4-17 11Z" />
      <path d="M66 32c9 3 12 15 6 28" />
    </>
  ),
  curly: (
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
  braids: (
    <>
      <path d="M33 42C32 27 41 22 50 22s18 5 17 20c-3-7-9-11-17-11s-14 4-17 11Z" />
      <path d="M34 48l-3 6 3 6-3 6M66 48l3 6-3 6 3 6" />
    </>
  ),
  tuft: <path d="M50 26c-2-5 3-7 5-3" />,
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

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth={bold ? 3.5 : 2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <g transform={t.child ? "translate(12 18) scale(0.76)" : undefined}>
        <path d="M18 100c0-20 14-29 32-29s32 9 32 29" />
        <path d="M44 62v9M56 62v9" />
        <ellipse cx="50" cy="44" rx="17" ry="19" />
        <circle cx="43" cy="45" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="57" cy="45" r="1.6" fill="currentColor" stroke="none" />
        <path d="M44 53q6 5 12 0" />
        {t.glasses && (
          <>
            <circle cx="43" cy="45" r="5" />
            <circle cx="57" cy="45" r="5" />
            <path d="M48 45h4" />
          </>
        )}
        {t.older && <path d="M36 49q1 4 3 6M64 49q-1 4-3 6" />}
        {t.beard && <path d="M34 48c1 12 7 18 16 18s15-6 16-18" />}
        {hair[t.hair]}
      </g>
    </svg>
  );
}
