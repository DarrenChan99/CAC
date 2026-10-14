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

## Current state — judge-ready UI shell

The front end is built against mock data. There is **no backend**: no API
routes, no database, no LiveKit, no auth, no ML. Mock data lives in
`apps/web/lib/mocks/`; the demo's shared state (resolved approvals, corrected
speaker labels) is `lib/demo-store.ts`, persisted to sessionStorage.

One story: landing → family Home (recent calls) → Live call (named transcript,
wrench to fix a speaker, a silent notetaker that chips what it captured) →
Grandma's News shows it. Captured (`/family/approvals`) is where the family
removes a memory afterwards or confirms a new person / tree edit.

- Family: Home, Live call, Call detail, Captured, Family tree (+ person), News settings, Enroll.
- Resident: R1–R7 (Home has 3 tiles + Today card).
- `Utterance` in `lib/mocks/call-timeline.ts` is the contract the diarization
  service will emit; `useReplay` is the single seam a live source replaces.
- `lib/residentFeed.ts` is the only path from a call to the resident, and it
  admits memories that have not been removed (med notes are excluded; tested).
- The 家 tile mascot (`components/Mascot.tsx`) links the two views.

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
- Memories captured from a call auto-publish to the resident; the family can remove them afterwards. People and tree edits need a family confirm first. (This supersedes SPEC §8's approve-first rule — update the spec.)

The two type scales never mix inside one screen. One typeface per view: Inter (family), Atkinson Hyperlegible (resident); no mono, no uppercase labels. Tokens live in
`apps/web/styles/tokens.css` and nothing downstream hardcodes a hex.

## Commands

```bash
cd apps/web
pnpm dev     # http://localhost:3000
pnpm build
pnpm lint
pnpm test    # relationship derivation checks
```
