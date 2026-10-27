# Caretaker — demo video script (target 2:45, hard limit 3:00)

Required by the rules: your name, app title, one-sentence purpose, audience, tools/languages, a working demo. Beats 2 and 5 cover them. `[FILL]` = only you know it.

The call in the demo is a **recorded call, edited for pacing** (cut at speaker changes, pauses added, trimmed), replayed with real model output. Say so once, plainly, and show a "Recorded call · edited for pacing" caption. The notetaker chips are scripted. Everything under "How it works" is real measured data.

## Beats

| Time | On screen | Voiceover | Caption |
|---|---|---|---|
| **0:00–0:12 Hook** | `/resident/call`, one tile glowing with a name | "When the whole family calls Grandma on one phone, she hears voices and no names." | Who is talking? |
| **0:12–0:35 Story** | You on camera, then landing page `/` | "[FILL: one real moment with your grandma, one sentence.] I'm [FILL name]. Caretaker is a video-call app that names who is speaking, live, for nursing-home residents with memory loss and the families who call them." | Caretaker · [your name] |
| **0:35–1:40 Demo** | See "Demo shots" below | See below | Recorded call · edited for pacing |
| **1:40–2:30 How it works** | `/how-it-works` then `/how-it-works/stats` | See below | Real data from our recordings |
| **2:30–2:50 Close** | Code/repo, then `/resident` home | See below | |

### Demo shots (0:35–1:40) — one idea per shot, tight crops, slow zooms
1. `/family` → click **Start call** (3 s). VO: "This is the family side. This is a recorded call from my family, so you can see every behaviour in order."
2. `/family/call`, press Play. Zoom on the Kevin tile glowing with "Kevin · your son" (8 s). VO: "Each time someone speaks, their tile lights up with their name, and Grandma sees how they're related to her."
3. The "Someone new" moment (8 s). VO: "This voice isn't enrolled. The app says Someone new. It never guesses a name, because a wrong name is worse than no name for someone with dementia."
4. Click the wrench, fix a speaker label (8 s). VO: "If it gets a label wrong, a relative corrects it in one tap."
5. Notetaker chips appearing (8 s). VO: "A silent notetaker chips what it captured — David's driving test. In this prototype those are scripted; extracting them automatically is my 2.0 goal."
6. `/resident/call`, then `/resident` → news (10 s). VO: "This is Grandma's screen. Text never under 28 pixels, buttons never under 72, tap only, nothing moves unless it means something. After the call, the good news is waiting for her."
7. `/family/approvals` (8 s). VO: "And the family stays in control: they can remove anything it captured, and new people or tree changes need their confirmation."

### How it works (1:40–2:30)
1. `/how-it-works`: spectrogram → voiceprint → 3-D voice map (20 s). VO: "Under the hood, a voice-activity detector gates the audio. A pretrained ECAPA-TDNN network turns every two seconds of voice into a 192-number voiceprint, and each family member is a point in this space."
2. Decision map (8 s). VO: "A name is given only if the voice is close enough to one person and clearly closer than the runner-up. Otherwise: Someone new."
3. `/how-it-works/stats`: **drag the ThresholdLab slider** (15 s). VO: "I picked the cut-off from data — a two-percent wrong-name budget first, then the threshold. Drag it and every chart updates. On held-out recordings, zero of two hundred forty stranger windows got a family name; equal error rate [FILL: read from the stats page]."
4. StressCharts (7 s). VO: "I also stress-tested it — more family members, background noise, a second talker, shorter clips — and report where it breaks."

### Close (2:30–2:50)
VO: "Built with TypeScript, Next.js, Tailwind and three.js on the front, and Python, PyTorch, SpeechBrain, Silero and Whisper for the voice. I used Claude Code as an AI assistant; [FILL: one honest sentence on what you did yourself — the spec, the rules, the recording and evaluation, the decisions]. Voices were recorded with consent and stay on my machine. Next: live calls, automatic note-taking, overlapping speech, and a care-home pilot."

## Recording mechanics
- `cd apps/web && pnpm dev`, browser window 1440×900 at 100 % zoom, hide bookmarks bar.
- Clear sessionStorage before each take (DevTools → Application → Clear) so the demo store starts fresh.
- QuickTime → File → New Screen Recording. Record each beat as its own clip; record voiceover separately (Voice Memos is fine) and lay it over in iMovie.
- iMovie: slow zoom (Ken Burns / crop) on the tiles, captions from the table, no music over voiceover.
- Check total length < 3:00. Upload to YouTube as **Public**, open the link logged out, paste into the form.
