# Caretaker

**Family video calls that tell Grandma who is talking.**

When a family crowds around one phone to call someone with memory loss, she hears a
stream of voices with no names attached. She can't see who is speaking, and she may not
remember whose voice is whose. Most call apps assume one person per device, so they have
nothing to say about a room full of voices.

Caretaker is built for nursing-home residents with dementia and the families who call
them. It names each voice as it speaks, says how that person is related to her ("your
grandson David"), and keeps the good news from the call on her screen after everyone
hangs up.

Built for the Congressional App Challenge 2026.

## What it does

**It knows who is speaking.** Every two seconds of voice becomes a 192-number
*voiceprint*. Caretaker compares it with the voiceprints of family members who enrolled
by reading six short sentences, and lights up the matching person's tile with their name
and relationship to her.

**It never guesses.** If a voice doesn't clearly match one person, the app says
**"Someone new"**. A wrong name is worse than no name for someone with dementia: it
teaches her the wrong thing about the people she loves. So a name has to pass two tests,
a minimum similarity *and* a clear lead over the second-best match.

**It writes down what was said, with names.** Whisper speech recognition runs alongside,
and each word is filed under the speaker who said it. The family sees a live, named
transcript and can fix a wrong label with one tap.

**It keeps the good news.** A silent notetaker picks out moments worth remembering
("Emily passed her driving test") and puts them on her *Family News* screen.
Memories publish automatically and the family can remove them afterwards. New people
and family-tree changes wait for a family member to confirm them. Medical notes never
reach her screen.

**It is built for her, not for us.** The resident view runs on an iPad on a stand and
follows rules enforced in code, not just in comments:

- Text never below 28 px, tap targets never below 72 px.
- Tap only: no hover, no swipe-only gestures, no timeouts.
- Nothing moves unless it means something. The ring around the person speaking is the
  only looping animation.
- No destructive actions. She can't delete, edit or approve anything.
- Every relationship is shown from her point of view.

## How it knows who is speaking

```
microphone ─▶ find speech ─▶ take 2 s ─▶ map the pitch ─▶ voiceprint ─▶ match a name ─▶ hold it steady ─▶ show it
              (Silero VAD)   every 1 s    (80-band log-Mel)  (ECAPA-TDNN)   (cosine, τ + margin)  (hysteresis)
     └──────▶ write the words (Whisper) ─▶ file each word under its speaker ────────────────────────────────▲
```

| Step | What it does, plainly | Why it matters |
|---|---|---|
| Find speech | A small neural network marks where speech starts and stops | Silence and room noise never become a voiceprint |
| Take 2 seconds | Re-scores the last 2 s of speech once a second | The name appears about 2 s after someone starts talking |
| Map the pitch | Turns the sound into a map of 80 pitch bands over time | It's what the voice model reads |
| Voiceprint | A pretrained ECAPA-TDNN model (20.8 M parameters) turns the clip into 192 numbers | Clips of the same person land close together |
| Match a name | Compares that voiceprint with each family member's average (cosine similarity) | A name only if it clears τ = 0.45 *and* leads the runner-up by 0.05 |
| Hold it steady | Keeps the current name until a different one wins twice in a row | A cough or a laugh doesn't flip the name |

**I did not train the voice model.** I run a model already trained on thousands of
public, open-source voices (SpeechBrain's ECAPA-TDNN, trained on VoxCeleb). None of my
family's audio was used to train it. My recordings only build each person's voiceprint
and test the system. My own work is everything around the model: the enrollment
recorder, building voiceprints, the open-set decision rule, the smoothing, choosing the
threshold from data, the evaluation, and the app.

The `/how-it-works` page draws this whole pipeline from real recordings: the
spectrogram, the inside of the voice model, a 3-D map of the voiceprints, and the
decision zone on a sphere. `/how-it-works/stats` shows the accuracy charts.

## How well it works

Measured on my own recordings plus 40 strangers from LibriSpeech (a free library of
audiobook recordings). Every test clip was kept out of the voiceprint it was checked
against, so the system never saw the answer ahead of time.

| | Result |
|---|---|
| Whole sentences named correctly | 100 % |
| 2-second live slices named correctly | about 96–98 %. The rest show "Someone new", none get a wrong name |
| Stranger slices given a family name | **0 of 240** (40 LibriSpeech voices) |
| Equal error rate | 0.66 % |
| Separation score (ROC AUC) | 0.998 |
| Speed | about 32 ms of work per second of audio, roughly 30× faster than real time on a laptop |

**What I learned the hard way:**

- **A test is only as honest as its setup.** Scoring a clip against a voiceprint it
  helped build gives flattering numbers, so every clip is held out. A test with only
  family voices can't catch the worst mistake, naming a stranger, so strangers are
  always included.
- **The threshold is a product decision.** I chose how many wrong names I could accept
  first (at most 2 % of strangers), then let the data pick the cut-off: 0.453 on
  LibriSpeech. On my own recordings, 0.50 turned 8–17 % of correct slices into "Someone
  new", so I kept 0.45.
- **The room matters as much as the model.** Recordings from a different day scored
  about 0.10 lower. Enrollment should happen in the room the call uses.

**Limits:** few enrolled people (so mixing up two relatives is under-tested), one
microphone, quiet rooms, English only. I don't claim more than that.

## The settings

Each one was chosen from measurements, not intuition. τ and the margin live in
`demo.config.json`; the rest are in `services/speaker/caretaker_speaker/`.

| Setting | Value | What it does |
|---|---|---|
| τ (threshold) | 0.45 | Minimum similarity needed to name anyone |
| Margin | 0.05 | How far the best match must beat the runner-up. Below this it says "Someone new" instead of picking between two relatives |
| Window | 2 s, every 1 s | The shortest slice that still scored 96–98 % |
| End of turn | 500 ms of silence | When one person's turn is over |
| Stickiness | 2 windows | A different name has to win twice in a row before the label changes |
| Enrollment | 6 sentences, ~20 s | Accuracy stops improving at about 20 seconds of speech |

The guiding rule: **"Someone new" can be fixed with one tap; a wrong name can't be
undone in her head.** Where the two mistakes compete, the code chooses "Someone new".

## Stack

- **Voice ID:** Python 3.12, PyTorch, SpeechBrain (ECAPA-TDNN), Silero VAD
- **Transcription:** mlx-whisper (Whisper large-v3-turbo, running locally on Apple silicon)
- **Evaluation:** NumPy, scikit-learn, LibriSpeech; 24 pytest tests for the decision
  rule, smoother, quality gate, streaming loop and replay
- **App:** TypeScript, Next.js (App Router), React, Tailwind 4, motion, three.js for
  the 3-D explainers
- **Design:** one token file (`apps/web/styles/tokens.css`), two typefaces kept apart:
  Inter for the family view, Atkinson Hyperlegible for the resident view

```
apps/web/                  the app: family view, resident view, /how-it-works
services/speaker/          voice ID: recorder, enrollment, scoring, streaming loop, replay
ml/eval/                   evaluation: LibriSpeech tests, threshold picking, stats for the site
demo.config.json           who is enrolled, which family member they play, τ and margin
```

## Running it

**The app** (no setup beyond Node and pnpm):

```bash
cd apps/web
pnpm install
pnpm dev        # http://localhost:3000
pnpm test       # relationship, resident-feed and timeline checks
```

The call screens replay a recorded call through the real speaker-ID output, so the
demo works without a microphone or a second person. Pause and scrub it from the header
on `/family/call`.

**The voice pipeline** (Python 3.12):

```bash
cd services/speaker
uv venv --python 3.12 .venv && uv pip install --python .venv/bin/python -e .

.venv/bin/python -m caretaker_speaker.record     # local page that coaches each person through 6 sentences
.venv/bin/python -m caretaker_speaker.enroll     # one voiceprint per person -> data/voiceprints.npz
.venv/bin/python -m caretaker_speaker.replay call.wav out.json   # recorded call -> named timeline for the app
.venv/bin/python -m pytest
```

The recorder measures the room's noise floor, shows a live level meter, and rejects
takes that are too short, too quiet or clipped. Rejected takes go to a separate folder,
so they never reach a voiceprint.

**Re-measuring:**

```bash
cd services/speaker
PYTHONPATH=../..:. .venv/bin/python -m ml.eval.run_eval --set librispeech   # enrolled vs. stranger trials
PYTHONPATH=../..:. .venv/bin/python -m ml.eval.voice_report                 # regenerates the /how-it-works/stats data
PYTHONPATH=../..:. .venv/bin/python -m ml.eval.run_call score out.json labels.csv   # scores a call against hand labels
```

## Privacy

Voice recordings and voiceprints stay on the local machine in `data/`, which is
git-ignored. **This repository contains no one's voice.** Everyone recorded gave
consent. Speaker ID and Whisper both run locally; nothing is sent to a cloud service.

## Honest status

- **The call is a replay.** The demo plays a pre-recorded call (two people, one laptop,
  one microphone) through the real pipeline. The labels are the pipeline's real output.
  Live streaming uses the same scoring code behind a socket and is next.
- **The notetaker is scripted.** The captured memories in the demo are written by hand.
  Pulling them out of the transcript with a language model is a 2.0 goal.

## What's next

1. **Live calls:** stream real calls over WebRTC (LiveKit) into the same scoring code.
2. **A real notetaker:** a language model that suggests memories and family-tree changes
   for the family to review.
3. **Two people at once:** overlap-aware diarization, so both speakers are labelled.
4. **More voices:** test with children, older voices, noisy rooms and phone microphones;
   support Cantonese and Mandarin.
5. **A care-home pilot**, with a view for activity staff.

## About

Built by [@DarrenChan99](https://github.com/DarrenChan99) for the Congressional App
Challenge 2026.

**AI use:** I used Claude Code for scaffolding the stack, implmenting my design vision, brainstorming and researching ways to solve challenges (like diarization). 
