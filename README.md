# Caretaker

Family video calls that name who is speaking, live, and turn what was said into a
family tree the family keeps.

Built for the Congressional App Challenge 2026.

---

## Current state: UI shell

The front end of 12 screens, running on mock data. There is no backend yet — no API
routes, no database, no LiveKit, no auth, no ML. Everything on screen comes from
`apps/web/lib/mocks/`.

| | Screens |
|---|---|
| Public | P1 Landing |
| Resident (iPad) | R1 Home · R2 Incoming call · R3 In call · R4 My family · R5 Person page · R6 Family news · R7 Today |
| Family (desktop) | F1 Dashboard · F3 In call · F5 Approval queue · F8 Voice enrollment |

The in-call screens run a scripted replay: a fixed call timeline plays through the real
UI, so live speaker labelling can be demonstrated without a GPU service or a second
person. Pause and scrub it from the header on `/family/call`.

## Run it

```bash
cd apps/web
pnpm install
pnpm dev      # http://localhost:3000
```

```bash
pnpm build    # production build
pnpm lint
pnpm test     # relationship-derivation checks
```

## Deploy to Vercel

The Next.js app lives in `apps/web`, not the repo root, so Vercel needs to be pointed at
it. Either way works — pick one.

**From the CLI** (sets the root directory for you, no dashboard visit):

```bash
npm i -g vercel
cd apps/web
vercel            # first run links the project and deploys a preview
vercel --prod     # promote to production
```

Run `vercel` from inside `apps/web`, not the repo root — that is what makes `apps/web`
the project root.

**From the dashboard**, importing `DarrenChan99/CAC` from GitHub:

1. Set **Root Directory** to `apps/web`.
2. Leave everything else on defaults — Next.js, pnpm and Node 24 are all detected.

If you see `NEXT_NOT_FOUND` in a build log, the root directory is wrong.

No environment variables are needed for this pass; nothing in the app calls a service.

## Repo layout

```
apps/web/
  app/(public)      landing
  app/resident/     R screens — Atkinson scale, tap-only
  app/family/       F screens — Inter scale, full motion
  components/       shared components from the Foundations sheet
  lib/mocks/        the Chen demo family, call timeline, approval queue
  lib/              relationship derivation, replay clock, spring presets
  styles/tokens.css design tokens — the single source of colour and type
```

`CLAUDE.md` holds the design rules that are not negotiable (28px text floor and no hover
in the resident view, accent colour never used as text, unknown speakers never given a
guessed name). Read it before changing UI.

## Design source

Screens were mocked in Claude Design and handed off as
`design-system-session-one/`. Sessions 5–8 (the remaining family screens, settings and
mobile) are still to be designed — see `CLAUDE.md`.
