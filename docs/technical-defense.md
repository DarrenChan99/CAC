# Caretaker — technical defense

How to explain every word on `/how-it-works` and every design choice, in your own voice.
Pattern for each term: **X does Y by Z, so that W.** Numbers marked ⟨live⟩ come from `apps/web/lib/how/stats.json`
(regenerate: `cd services/speaker && PYTHONPATH=../..:. .venv/bin/python -m ml.eval.voice_report`).

## The 30-second version
Caretaker identifies *who* is speaking when several people share one microphone. Audio is gated by a neural voice-activity
detector, cut into 2-second windows, converted to an 80-band log-Mel spectrogram, and fed to a pretrained ECAPA-TDNN network that
outputs a 192-number voiceprint on the unit sphere. The voiceprint is compared by cosine similarity with each enrolled family
member's average voiceprint. A name is shown only if the best score clears a threshold τ **and** beats the runner-up by a margin; a
smoother stops flicker. Otherwise the app says "Someone new". Whisper transcribes the same audio and its word timestamps are
aligned to each speaker turn.

## 1. The pipeline, term by term

**Voice activity detection (Silero VAD)** — decides speech vs. not-speech by running a small neural network over 512-sample (32 ms)
blocks, ending an utterance after 500 ms of silence, so that room noise and pauses never become voiceprints and every turn is one
clean unit.
- *Why a neural VAD and not an energy threshold?* A volume threshold fires on TV and keyboard noise and misses quiet speech; a trained model keys on speech structure.

**Sliding window (2 s window, 1 s hop)** — re-scores the last 2 seconds of the current utterance once per second, so that the
name appears within about 2 seconds of someone starting to talk and updates if the speaker changes. At the end of the utterance
the whole turn is scored once more (`speaker_final`).
- *Why 2 s?* ECAPA is unreliable under about 0.5 s (the embedder pads shorter input) and gets steadily better to a few seconds; 2 s is the shortest window that still scored 96–98 % on our own recordings ⟨live⟩.

**Short-time Fourier transform (STFT)** — measures energy at each frequency over 25 ms Hamming-windowed frames every 10 ms, by
sliding a tapered window and taking an FFT of each, so that a waveform becomes a spectrogram (time × frequency).

**80-bin log-Mel filterbank** — pools the spectrogram into 80 triangular bands spaced on the mel scale and takes the logarithm, so
that frequency resolution is finer where human hearing is finer and loudness is compressed the way ears perceive it.

**Cepstral mean normalization (CMN)** — subtracts each band's average over the utterance, so that a constant microphone or room
colouring cancels and the same voice looks similar on a different laptop. (SpeechBrain's `InputNormalization` does this per sentence.)

**ECAPA-TDNN** (Emphasized Channel Attention, Propagation and Aggregation in a Time-Delay Neural Network; Desplanques et al., 2020) —
maps a variable-length spectrogram to one 192-number vector by stacking dilated 1-D convolutions with channel attention and
attentive pooling, so that clips from the same person land close together and different people land far apart. The checkpoint
we use (`speechbrain/spkrec-ecapa-voxceleb`) has 20.8 M parameters and was trained on VoxCeleb; **we do not train or fine-tune it**.
- **Dilated 1-D convolution** — a convolution that skips frames (dilation 2, 3, 4), so that each layer sees a wider span of time at no extra weight cost.
- **Res2Net block** — splits 1024 channels into 8 groups of 128 and feeds each group's output into the next group's convolution, so that one block captures several time scales at once.
- **Squeeze-excitation (SE)** — averages each channel over time, passes it through two small layers and a sigmoid, and rescales the channels, so that the network can emphasise the feature channels that matter for this clip.
- **Multi-layer feature aggregation (MFA)** — concatenates the outputs of all three blocks (3 × 1024) into a 1×1 convolution with 3072 channels, so that shallow detail (pitch, timbre) and deeper detail (speaking style) both reach the pooling layer.
- **Attentive statistical pooling (ASP)** — computes a learned attention weight for each frame (a small network looking at the frame plus the clip's mean and standard deviation, then tanh and softmax over time), then takes a *weighted* mean and standard deviation (2 × 3072 = 6144 numbers), so that frames carrying speaker information count more than silence or breaths and the pooled statistics are not dominated by pauses.
- **Fully-connected layer → 192-d x-vector** — projects 6144 → 192, so that the voiceprint is compact and cheap to compare.
- **Additive angular margin softmax (AAM-softmax; training only)** — penalises the angle between an embedding and its speaker's class centre by an added margin, so that each speaker's embeddings form a tight cone on the sphere with a gap to others. That is *why* comparing angles at test time works.
- **VoxCeleb** — a public set of over a million utterances from thousands of speakers, so that the model has already seen enormous voice variety; none of our family's audio was used.

**L2 normalization** — divides the vector by its length, so that only direction matters and a dot product *is* the cosine of the angle.

**Cosine similarity** — dot product of two unit vectors (1 = same direction, 0 = unrelated), so that loudness and recording gain are ignored and only voice character is compared.
- *Why cosine and not Euclidean or PLDA?* On unit vectors they are monotonic equivalents; cosine is what AAM training optimises, and PLDA needs training data we don't have.

**Voiceprint / centroid** — the mean of a person's enrollment embeddings (computed on 3-second chunks of their six recorded sentences), re-normalised, so that a few short recordings become one stable reference. About 20 seconds of speech is enough ⟨live: enrollment curve⟩.

**Open-set identification** — answers "who, or none of these" rather than forcing the closest family member, by rejecting weak or ambiguous matches, so that a stranger, a new relative or a TV is never labelled with a family name.
- **Threshold τ = 0.45** — minimum cosine to name anyone. Chosen from data: `ml/eval/threshold.py::pick_threshold` found 0.453 when allowing at most 2 % of strangers a name on LibriSpeech; we re-checked on our own recordings, where 0.50 let 8–17 % of live windows from the right person fall to "Someone new", and kept 0.45.
- **Margin = 0.05** — required lead over the runner-up, so that two similar voices (siblings) produce "Someone new" instead of a coin flip.

**Hysteresis (stickiness)** — keeps the displayed label until a *different* label wins two consecutive windows or the utterance ends, by holding a (current, candidate, streak) state, so that a cough or laugh doesn't flip the name. "Someone new" is a real label in this state machine (`stickiness.py`).

**Unknown clustering** — one-pass clustering of embeddings from "Someone new" turns (join if cosine ≥ threshold), so that one stranger becomes one new person to confirm, not many.

**Whisper (mlx-whisper, large-v3-turbo)** — a transformer speech recogniser that returns words with timestamps and probabilities. We run it once over the call and assign each word to the speaker turn it falls inside (`replay.py::assign_words`), so that every line has a name, a time and a transcript. Words under 0.5 probability mark the line "uncertain" rather than being hidden.

## 2. The metrics, term by term
- **Leave-one-clip-out** — for each held-out clip the voiceprint is rebuilt from that person's *other* clips, so that no clip is tested against a voiceprint it helped build.
- **Equal error rate (EER)** — threshold where false accepts equal false rejects; one number for separability. ⟨live: 0.66 % at 0.43⟩.
- **DET curve** — false reject vs. false accept at every threshold on log axes. A curve hugging the corner = cleanly separable.
- **ROC AUC** — probability a random correct-person score beats a random impostor score. ⟨live: 0.998⟩
- **Confusion matrix** — rows true speaker, columns shown label. Wrong-name cells are the dangerous ones; "Someone new" is the safe miss.
- **Diarization error rate (DER)** — missed speech + false alarm + wrong speaker, over total speech time. Used for the recorded demo call (`ml/eval/run_call.py score`).
- **PCA** — linear projection onto the 3 directions of greatest variance; distances stay faithful (but 3 axes keep only about a fifth of the variance of 192 dimensions ⟨live⟩).
- **t-SNE** — non-linear projection that preserves neighbours and exaggerates cluster separation; distances between clusters are not meaningful. We show both and say which is which.

## 3. Numbers to quote (and their limits) ⟨live⟩
- Family voices (leave-one-clip-out): whole utterances 100 % right; 2 s live windows about 96–98 % right, 0 wrong names, the rest "Someone new".
- Strangers: 0 of 240 windows and 0 of 125 utterances (40 LibriSpeech speakers) were given a family name.
- Earlier LibriSpeech-only test (20 enrolled, 20 strangers, 30 s enrollment): 96–97 % right at τ = 0.45–0.50, 0 % wrong name among enrolled speakers, 0.4–2 % of strangers named.
- Changing day or room dropped scores by about 0.10 (Oct 19 vs Oct 26 sessions) — that is why we record enrollment in the room the call uses.
- **Stress tests** (`ml/eval/stress.py`, 40 LibriSpeech speakers, 20 s enrollment each, 8 held-out 2 s windows each, 40 random families per point, same τ and margin; voiceprints always made in quiet):
  - Family size 2 → 20 people: 98.4 % → 97.9 % named correctly, 0 wrong names, ≤ 0.7 % of strangers named. Size is not the weak point.
  - Steady noise (SNR 30 / 20 / 10 / 5 / 0 dB): 97 / 95 / 79 / 55 / 25 % named correctly, 0 wrong names. It fails safe, into "Someone new".
  - Another person talking at the same time: 97 / 95 / 83 / 62 / 24 % correct; wrong names are 0.2 % at 20 dB, 0.7 % at 5 dB, **5.3 % at 0 dB**. This is the real weak point (a TV or a second speaker as loud as the voice).
  - Clip length 0.5 / 1 / 2 / 3 s: 30 / 82 / 98 / 99 % correct, wrong name ≈ 0 throughout. Why the live loop waits for 2 s.
  - Pairs of different people: 2 of 780 LibriSpeech pairs have voiceprints more alike than τ (closest 0.49); the margin rule is the guard for those.
  - Method limit: noise is synthetic (white noise, or a second LibriSpeech speaker mixed in), the "family" is read speech, not relatives.
- **Limits:** few enrolled people (so confusion between relatives is under-tested), one microphone, quiet-room speech, English. Do not claim more than this.

## 4. Why these design choices
| Choice | Why | Cost |
|---|---|---|
| Pretrained ECAPA, no fine-tuning | We have minutes of audio per person, not hours; fine-tuning would overfit and add no credible gain | Not adapted to phones/cheap mics |
| Centroid of enrollment embeddings | Simple, stable, explainable, works from ~20 s | Single point can't represent mood/illness changes |
| Two-test open-set rule + margin | A wrong name hurts a person with dementia more than "Someone new" | Some correct windows shown as "Someone new" (2–4 %) |
| τ chosen from data | A threshold is a product decision; we picked a wrong-name budget first | Needs re-checking per room/mic |
| Hysteresis | Labels flicker on short windows | ~1 s extra lag when the speaker really changes |
| Recorded call, replayed | Reproducible, and no GPU service during judging | Not a live call; edited for pacing; video says so |
| Next.js + Tailwind front end | One codebase for family and resident views | — |

## 5. Stack, and why each piece
- **Python 3.12 · PyTorch · SpeechBrain** — the model and audio feature code. **Silero VAD** — small, accurate, CPU-friendly gate. **mlx-whisper** — Whisper on Apple silicon. **NumPy · scikit-learn · SoundFile** — scoring, curves, PCA/t-SNE, audio I/O. **pytest** — 24 tests for the decision rule, smoother, quality gate, streaming loop, replay wrapper.
- **TypeScript · Next.js (App Router) · React · Tailwind 4 · motion · three.js** — the app and visuals. Design tokens in one CSS file; accessibility rules for the resident view enforced in code.
- **Recorder** (`record.py`/`record.html`) — local web page that coaches enrollment: room-relative noise floor, live level meter, rejects clipped/too-short takes, keeps rejected takes in a separate folder so they never reach voiceprints.

## 6. Questions judges might ask
1. **Did you train the model?** No — pretrained ECAPA-TDNN (VoxCeleb). My work: enrollment recorder, voiceprint construction, open-set decision, smoothing, threshold selection from data, evaluation, the app. Fine-tuning is 2.0 once there is enough consented data.
2. **How does it know someone is NOT in the family?** Their best cosine is below τ or too close to the runner-up. Tested on 40 unseen LibriSpeech speakers: 0 named.
3. **What if two people talk at once?** Overlap breaks single-speaker embeddings; the system shows "Someone new" or keeps the last confident speaker. Overlap-aware diarization (e.g. pyannote segmentation) is 2.0.
4. **Why 192 dimensions?** The pretrained network's output size; a trade-off between capacity and compactness set by its authors.
5. **How fast is it?** One 2 s window embeds in about 20 ms on the Apple GPU (65 ms on CPU), and the whole chain costs about 32 ms per second of audio (measured on the `/how-it-works` workflow graph), roughly 30× faster than real time; the label lags speech by about 1–2 s because of the window and the 2-window smoother.
6. **Is the demo live?** No. The call in the app is a recording of three family members, cut at speaker changes with pauses added, replayed with real model output (the video and the screen say so). The pipeline behind it is real: the accuracy, stranger-rejection and stress-test numbers on `/how-it-works/stats` come from recordings and held-out speakers. Streaming is the same `stream.run` code behind a socket — 2.0.
7. **Is the notetaker AI?** Not yet. The captured items in the demo are scripted; extracting them with an LLM is a 2.0 goal. I say that in the video.
8. **Privacy?** Voice recordings and voiceprints stay on the local machine (git-ignored `data/`); volunteers consented; no cloud speaker-ID. Whisper runs locally.
9. **Bias — accents, children, elderly voices?** Pretrained on celebrity speech, so performance can vary; enrollment in the user's own room and the open-set rule limit the damage, but a wider test set is needed. Stated as a limitation.
10. **What if someone is sick or the microphone changes?** Scores drop (we measured about 0.10 across days) → more "Someone new", not wrong names. Re-enrol, or add sessions.
11. **Why not just use Zoom's/Teams' per-participant audio?** One account per device gives names for free, but a family on one speakerphone is one audio track. That is the problem here.
12. **What did AI do and what did you do?** See `AI_LOG.md` and the AI-use answer; be specific and truthful.
13. **How would you scale it?** Per-family voiceprints are tiny (192 floats each); scoring is a handful of dot products; the cost is the encoder, run per window.
14. **Why is the threshold 0.45 and not 0.5?** Chosen from data with a wrong-name budget; real windows scored 0.47–0.49 at 0.50, so 0.5 would hide correct names.
15. **What's the biggest weakness?** Small enrolled group and quiet-room testing; I'd test with noisy rooms, more relatives and phones next.
