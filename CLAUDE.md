# Caretaker

Family video calls that name who is speaking, live, and turn what was said into
a family tree the family keeps. Congressional App Challenge 2026.

## Where things are

| | |
|---|---|
| Product + technical spec | `~/Downloads/SPEC.md` (v1.0, locked 2026-09-16) — **not yet copied into this repo** |
| Design system + screen mocks | `~/Downloads/design-system-session-one/` (Claude Design handoff bundle) |
| Web app | `apps/web/` — Next.js App Router, TS, Tailwind 4 |

Spec §12.1 expects `SPEC.md` at the repo root. It could not be copied in
automatically (macOS blocks terminal access to `~/Downloads`); copy it manually.

## Current state — UI shell only

The front end of 12 screens is built against mock data. There is **no backend**:
no API routes, no database, no LiveKit, no auth, no ML. Everything the UI shows
comes from `apps/web/lib/mocks/`.

Built: P1 landing, R1–R7 (resident), F1/F3/F5/F8 (family).
Not built: F2, F4, F6, F7, F9–F13 — they have no mock yet and render as
disabled "soon" entries in the family sidebar.

## The rules that are not negotiable

These come from the spec and are enforced in code, not just in comments. Do not
"tidy" them away.

**Resident view** (`app/resident/`, iPad on a stand, landscape):
- Body text never below 28px. Tap targets never below 72px. Gaps never below 24px.
- Tap only. **No hover states**, no swipe-only gestures, no timeouts.
- Icons always carry a text label.
- Nothing moves unless it means something. The active-speaker ring is the only
  looping animation in the view.
- No destructive actions. The resident cannot delete, edit or approve anything.
- Relationships are always shown from her point of view ("your grandson").

**Family view** (`app/family/`): 44px targets, 16px body, full motion, hover fine.

**Both:**
- `#9DBF97` (accent) is decorative only — rings, rules, borders. Never text.
- An unknown speaker is never given a guessed name.
- Med notes never render in the resident view.
- Nothing captured from a call reaches the resident until it is approved.

The two type scales never mix inside one screen. Tokens live in
`apps/web/styles/tokens.css` and nothing downstream hardcodes a hex.

## Commands

```bash
cd apps/web
pnpm dev     # http://localhost:3000
pnpm build
pnpm lint
pnpm test    # relationship derivation checks
```
