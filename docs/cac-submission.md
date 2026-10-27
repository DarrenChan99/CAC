# CAC 2026 submission — Caretaker

**Deadline: Mon Oct 26, 12:00 pm ET = 9:00 am PT. Nothing can be edited after you submit.**
Drafts below are written to the real form. `[FILL]` = only you know it. `[CONFIRM]` = I drafted it from the repo; check it is true. Rewrite in your own voice.

## Checklist (in order)
- ~~Record the demo call~~ dropped: the demo call is simulated (`docs/demo-call-script.md` kept for 2.0)
- ~~Re-run stats after new people enroll~~ dropped: stats stay as they are
- [ ] Screen-record the video (`docs/video-script.md`), upload to YouTube as **Public**, open the link logged out
- [ ] Cover photo: 600×800 JPEG (3:4) of the resident call screen → `docs/cover.jpg`
- [ ] Decide on a project link (public GitHub and/or a deployed demo) — see "Link" below
- [ ] Paste answers, submit with the primary applicant account, save the confirmation

## Form fields

**App name:** Caretaker

**Programming languages:** Python · JavaScript · Other: TypeScript *(the web app is TypeScript, which compiles to JavaScript)*
**Platform:** Web

**Video link:** [FILL — https://…, public]

**Date coding completed (m/d/Y):** [FILL — 10/26/2026 if you are still finishing]
**Where did you do most of the coding:** [FILL]
**School/club project?** [FILL — No / Yes + names]
**Ambassador email:** [FILL or blank]

**Link (optional):** public GitHub repo and/or hosted demo. Open-sourcing also qualifies for Hack Club's Congressional Certification. `data/` (voice recordings, voiceprints) is git-ignored, so the repo contains no one's voice. I have **not** made anything public — say the word and I'll prepare it.

---

### 1. Briefly describe what your app does (≤400 words)
Caretaker is a family video-call app for nursing-home residents with memory loss. When several relatives share one laptop or speakerphone, a resident hears a stream of voices with no names. Caretaker names who is speaking, live, and shows how that person is related to the resident ("your grandson David").

It works by speaker identification. A neural network turns every two seconds of voice into a 192-number voiceprint and compares it with the voiceprints of the people who enrolled by reading six short sentences. If a voice doesn't clearly match anyone, the app says "Someone new" instead of guessing, because a wrong name is worse than no name for a person with dementia. A smoothing rule keeps names from flickering, and Whisper speech recognition adds a named transcript.

The app has two views. The resident view, built for an iPad on a stand, follows strict accessibility rules: text never below 28 px, tap targets of at least 72 px, tap only, no hover, no timeouts, nothing moves unless it means something, and no destructive actions. The family view shows the live named transcript, lets a relative correct a mislabelled speaker, and lists what a silent notetaker captured so the family can remove it or confirm new people and family-tree changes.

A "How it works" page shows the whole pipeline with real data from our recordings: the waveform and voice-activity detection, the spectrogram, the 192-number voiceprint, an interactive 3-D map of voices, and accuracy charts.

The call in the demo is simulated: a scripted call that shows how the screens behave. The speaker-identification pipeline behind it is real, and its measured accuracy is on the "How it works" and stats pages. The notetaker's captured items are scripted too; automatic extraction is a 2.0 goal.

### 2. What inspired you to create this app? (≤400 words)
[FILL — this must be your real story. Template to rewrite, keep only what is true:]
My [grandmother/relative] lives in [a care home/…]. When our family calls her, [we all crowd around one phone/laptop], and she [can't tell who is talking / asks "who is that?"]. [One specific moment.] I learned that [what you found out — e.g. from the facility interview]. Most call apps assume one person per device, so they have nothing to say about a room full of voices. I wanted every voice to arrive with a name and a relationship, and I wanted the good news from a call — a driving test passed, a new friend — to stay on her screen after we hang up instead of disappearing. That led me to speaker identification, something I had never worked with before.

### 3. What technical difficulties did you face? (≤400 words)
**Naming people on one shared microphone.** Ordinary diarization labels voices "Speaker 1, Speaker 2". I needed real names, and I needed the system to say "I don't know" for a voice it hasn't met. I treated it as open-set identification: a name needs both a similarity above a threshold and a clear lead over the second-best match. Otherwise the answer is "Someone new". Choosing the threshold was the hardest decision, because it trades missed names against wrong names. I picked it from data: on LibriSpeech with a 2% wrong-name budget it came out at 0.453, then I re-tested on our own recordings and set it to 0.45 after seeing that 0.50 turned 8–17% of correct live windows into "Someone new". On held-out recordings, 0 of 240 stranger windows received a family name.

**Short, noisy audio.** Two seconds is little. A neural voice-activity detector cuts utterances, and a hysteresis rule keeps a label until a different one wins twice in a row.

**Bad enrollment recordings.** My first clips were too quiet or clipped. I built a recorder that measures the room's noise floor, shows a live level meter, coaches the speaker, and rejects takes that are too short, too quiet or clipped, keeping them in a separate folder so they never reach a voiceprint. A further finding: recordings from different days scored about 0.10 lower, so enrollment should happen in the room the call uses.

**Honest evaluation.** I tested with leave-one-clip-out so no clip is scored against a voiceprint it helped build, used 40 unseen voices as strangers, and reported equal-error rate, a trade-off curve and confusion matrices instead of one accuracy number.

**A bug I found by testing the pipeline.** On a recording that ended while someone was still talking, the last speaker turn was silently dropped. I wrote a failing test, then fixed the streaming loop to finish an open turn.

**Designing for dementia.** Every resident-screen rule (large text and targets, no motion without meaning, relationships from her point of view) had to be enforced in code, not just intended.

[CONFIRM/ADD: anything that took you longest.]

### 4. What improvements would you make in a 2.0? (≤400 words)
1. **Live calls.** Stream real calls over WebRTC (LiveKit) into the same scoring code, which already works on 32 ms audio blocks, instead of a simulated call.
2. **A real notetaker.** Use a language model to extract memories, new people and family-tree edits from the transcript. Today those captured items are scripted. Anything extracted would still go through family review.
3. **Overlapping speech.** Add overlap-aware diarization so two people talking at once are both labelled.
4. **More voices and languages.** Test with many more relatives, children, elderly voices and noisy rooms; support Cantonese and Mandarin speech recognition for families who speak them.
5. **Better models for our setting.** Fine-tune the voice model on consented family and facility audio, and adapt to phone and laptop microphones.
6. **Names on faces.** Place the speaker's name on their face in the video using active-speaker detection.
7. **A care-staff view and a facility pilot.** Let activity staff see who has called, with the resident's and family's permission, and pilot with [FILL: a local care home].

### 5. Did you use AI? How, and what did you do yourself? (≤400 words)
**Tools:** Claude Code (Anthropic's Claude models), used throughout the project.

**What Claude Code did:** wrote most of the code from my specification and design — the Next.js/TypeScript app and its screens, the Python speaker-identification project (audio handling, enrollment, scoring, streaming loop, replay and evaluation scripts), the enrollment recorder, the "How it works" page and the evaluation report, and the tests. It also implemented the four core decision functions (the open-set decision rule, the label smoother, threshold selection, and clustering of unknown voices) from pseudocode and docstrings [CONFIRM: say how much of these you wrote before it finished them], and it helped debug.

**What I did myself:** [CONFIRM and edit each line to what is true]
- Came up with the idea, wrote the product and technical specification (`SPEC.md`), and decided the rules — what the resident may see, that unknown voices are never named, and that medical notes never reach her screen.
- Designed the screens and the visual system.
- Recorded and managed the voice data with consenting volunteers, ran the evaluations, read the results, and decided the threshold and enrollment length from them.
- Reviewed, tested and directed the changes the AI made, and chose what to cut for the deadline.
- Recorded the demo call and the video.

I kept a log of every AI session in `AI_LOG.md` (date, files, what the AI did) and the code is in the repository so judges can inspect it. I can explain every technique in the project (`docs/technical-defense.md`).

### 6. What did you learn? (≤400 words)
[FILL in your voice. Raw material that is true:]
I learned that a machine-learning result is only as honest as its test: scoring clips against a voiceprint they helped build gives flattering numbers, so I held clips out and added strangers the system had never heard. I learned that a threshold is a product decision, not just a number — I chose how many wrong names I could tolerate first, then let the data pick the cutoff. I learned that recording quality matters as much as the model: a room, a day or a microphone can move scores more than a clever algorithm. I learned to build for someone who cannot recover from confusion, which made "I don't know" a feature. And I learned how to work with an AI assistant without handing it my judgment: it is fast at code, but I had to supply the requirements, check its claims against data, and catch what it got wrong.

### Cover photo
600×800 px JPEG, 3:4. Best shot: the resident call screen with two tiles, one glowing and named ("David · your son"). I'll generate it from the app once the real call is in; tell me when.

---

## Video script — superseded by `docs/video-script.md` (simulated-call version). The table below is the old recorded-call draft.

| Time | On screen | Say |
|---|---|---|
| 0:00–0:15 | You, then the resident view | "[FILL: one line about your family.] When several of us call on one phone, she can't tell who's talking." |
| 0:15–0:30 | Landing page | "I'm [FILL]. This is Caretaker: video calls that name who is speaking, live, for nursing-home residents with memory loss and the families who call them." |
| 0:30–1:15 | `/family/call` with the recording, then `/resident/call` | "That's me and [name] on one laptop and one microphone. Each time someone speaks, their tile lights up with their name and how they're related to her. This voice isn't enrolled, so it says 'Someone new' — it never guesses. [Notetaker line, prototype.]" |
| 1:15–2:05 | `/how-it-works` (pipeline → 3-D voice space), then `/how-it-works/stats` | "Under the hood: a voice-activity detector gates the audio, a 20-million-parameter ECAPA-TDNN network turns each two-second window into a 192-number voiceprint, and open-set cosine scoring names the nearest family member only if it clears a threshold and a margin. On held-out recordings the equal error rate is [live], and none of 240 strangers got a family name." |
| 2:05–2:25 | Code / repo | "Tools: TypeScript, Next.js, Tailwind, three.js; Python, PyTorch, SpeechBrain, Silero VAD, Whisper. I used Claude Code as an AI assistant, and [FILL: one honest sentence — what you did]. Voices are recorded with consent and stay on my machine." |
| 2:25–2:40 | Resident home | "Next: live calls, automatic note-taking, overlapping speech, Cantonese and Mandarin, and a pilot at [FILL]." |

Recording: QuickTime → New Screen Recording; browser at 100 %, `pnpm dev`, press Play on the call page; record voiceover separately if easier; edit in iMovie.
