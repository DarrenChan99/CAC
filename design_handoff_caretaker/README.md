# Handoff: Caretaker

**Start here → open `index.html`.** It is the complete, self-sufficient spec: tokens, both type scales, every screen (R1–R7, F1–F13, P1), interactions, state model, accessibility contract, and a file map. Point Claude Code at that file.

## What this is

Caretaker is a nursing-home connection product with two deliberately different front ends:

- a **resident iPad app** (1180×820) built for low vision and low confidence — 28px type floor, 72px+ controls, no settings, no chrome;
- a **family web app** (1440×900 desktop / 390×844 mobile) built for review and control — productivity density, 232px left rail, approval queues;
- plus a small **public landing page** (P1), the one expressive surface (Instrument Serif, dark green ground).

The resident is **Mei Chen**; the signed-in family user is her grandson **Ken Chen**. The whole prototype set uses that one family — reuse the names, the copy depends on them.

## About the design files

Everything in `designs/` is a **design reference written in HTML** — prototypes showing intended look, copy, and behavior. They are not production code to copy. The task is to **recreate these screens in the target codebase** using its existing framework, components, routing, and state conventions. If no environment exists yet, pick the right stack (React + TypeScript is a safe default for the family web app; SwiftUI or React Native for the resident tablet) and build the designs there.

The prototypes run on a small preview harness (`support.js`, `<x-dc>`, `<sc-for>`). **Ignore the harness.** Read the markup for structure, the inline styles for exact values, and the logic class for data shape and state transitions.

## Fidelity

**High fidelity.** Colors, type sizes, spacing, radii, copy, and interaction states are final — recreate exactly. Two areas need judgement: photography (placeholders) and family-tree canvas geometry (hand-positioned in the mock; a real layout algorithm is expected).

## The non-negotiables

1. **Nothing reaches the resident's device unreviewed.** F5 is the only path from extracted content to resident visibility. Enforce at the data layer.
2. **Med notes never appear on the resident device** (F10). Also a data-layer guarantee, not just a hidden route.
3. **Two type scales stay separate.** Resident never below 28px; family is a standard 11–32px productivity scale.
4. **Voice ID never blocks a call** (F2). "Someone new" — a dashed, unnamed, photo-less speaker — is a first-class state, not an error.
5. **Relationships are structured, never free text** (F6b). Every label like "great-granddaughter" is derived by traversing the tree.
6. **Speaker corrections are proposals** (F4b). Nothing changes until a *different* family member confirms.

## Files

```
index.html              ← the spec; read this
designs/                ← HTML design references (open in a browser)
  Caretaker Foundations.dc.html          tokens, type, components
  Caretaker Resident Screens.dc.html     R1 R2 R4 R5 R6 R7
  Caretaker In Call.dc.html              R3 F3
  Caretaker Family Screens.dc.html       F1 F5 F8
  Caretaker Calls.dc.html                F2 F4 F4b + empty states
  Caretaker Tree.dc.html                 F6 F6b F7
  Caretaker Content and Settings.dc.html F9 F9b F10 F11 F12 F13
  Caretaker Public.dc.html               P1 / P1b / P1 mobile
  Caretaker Responsive.dc.html           F1 F3 F5 at both breakpoints
  CaretakerScreen.dc.html                shared responsive shell
  assets/tile-icon.png                   app icon (ship as-is)
  support.js                             preview harness — ignore
```
