# Prompt for Claude Design: Caretaker people and cover

Paste everything below the line into Claude Design. Attach: `apps/web/public/tile.png`, a screenshot of `/resident/call`, and a screenshot of `/family/tree`. Replaces the old cover-only prompt.

---

You are making the illustrated people for **Caretaker**, a family video-call app that names who is speaking, live, for a grandparent (Mei) with memory loss. Each person appears as a call tile, a profile picture, and a small avatar (down to 36 px). This is the second pass. Keep what worked, fix what did not.

**Keep:** the flat, friendly, minimal illustration style, the soft circle behind each head, the cream background, and one colour per person.

**Fix from the first pass:**
- The roster was wrong (Ken, Tom and Sam do not exist). Use exactly the 11 people below.
- Do not use brown, orange, magenta, purple or any "warm" colour. Every person's colour stays in the **green family**: greens, sage, olive, mint, jade, and teal or blue-green (two at most). Skin, hair and clothes are all drawn with the person's one colour in light, mid and dark shades, as before.
- Faces must be told apart at **36 px**, so greens alone are not enough. Vary hair shape, hair length, glasses, clothing neckline, and the size of the head circle. Check all 11 side by side at 36 px before finishing.
- Normal, believable people: ordinary haircuts, natural proportions, no oversized curls or cartoonish shapes. Each person looks the age and role below.

**The family (draw them as a Chinese-heritage family, the Chens):**

| Person | Who they are to Grandma Mei | Look | Suggested green |
|---|---|---|---|
| Mei | the resident, Grandma, ~80 | short grey hair, kind face, glasses | deep forest `#2d6a4f` |
| Wei | Mei's late husband, ~80 | white hair; draw him softer and more muted than everyone else | muted sage `#8fa89a` |
| Ling | Mei's sister, ~78 | grey hair in a low bun | teal `#2a8a8a` |
| Lisa | Mei's daughter, ~55 | shoulder-length dark hair | olive green `#7a8f3a` |
| Kevin | Mei's son, ~52 | short dark hair, slight stubble, no glasses | blue-green `#1f6f78` |
| Karen | Kevin's wife, ~50 | bob haircut | seafoam `#4fae94` |
| Emily | Lisa's daughter, ~25 | long dark hair, ponytail | leaf green `#5aa469` |
| David | Lisa's son, **~17, just passed his driving test** | short messy dark hair, teen, big smile | slate-teal `#4a7c8c` |
| Jason | Kevin and Karen's son, ~22 | short neat dark hair | dark spruce `#24584a` |
| Sophie | Kevin and Karen's daughter, ~19 | dark hair, side part | light jade `#7fc4a5` |
| Ava | Emily's toddler, ~2 | tiny, two small tufts of hair | pale green `#a9d3b0` |

The hexes are a starting point. Change them if two people read as the same at 36 px or if the contrast between face and background is weak, but stay in the green family. **Do not draw Anna or any other unknown person**; an unknown speaker is shown as a plain "?" and never gets a face or a guessed name.

**Board 1: people (do this first).** Per person, three files in the same colour:
- Grid tile 680 x 480 (shown at 340 x 240), name label underneath.
- Profile tile 560 x 640 (shown at 280 x 320).
- A 36 px circle avatar crop.
Plus one row with all 11 side by side at 36 px so I can check they are distinguishable. Label each tile with just the first name.

**Board 2: cover.** One JPEG, **600 x 800 (3:4)**, shown as a thumbnail about 150 px wide. Keep the current direction as option A: the 家 tile mascot from `tile.png`, the wordmark **Caretaker**, and the tagline **"So Grandma always knows it's you."** (not "Never forget your loved ones again", which promises a cure). Then make **three extra draft heroes** as alternatives, each with one large tile with a thick accent-green ring and a big name label beneath it:
- B: "David · your grandson"
- C: "Kevin · your son"
- D: Grandma Mei at the centre with the family tiles around her, one tile ringed.
Fill the empty lower third; no small text, only the wordmark, the label and the tagline.

**Design system:**
- Background `#FAF8F2`, surfaces `#FFFFFF`, primary `#1E5B3C`, text `#1B2A21`, soft tint `#E3EDE2`.
- Accent `#9DBF97` is decorative only (rings, rules, borders), never text.
- One typeface: **Atkinson Hyperlegible** (the wordmark and labels are resident-side). No uppercase labels, no monospace. Name label at least 56 px and wordmark at least 64 px on the cover; tagline at least 36 px.
- All text meets WCAG AA. Check the name label and ring at 150 px wide.
- Do not invent logos, extra people, or extra text.

Stop after boards 1 and 2. Scenes (photos, memories, news) come later only if I ask.
