# Demo call — record tonight (≈40 s, audio only)

Three people, one laptop, one mic, nobody on camera. Record once, process, and the app replays the real model output (there is no live call pipeline yet, so don't try to run it live).

| Person | Config id | Shown as | Voiceprint |
|---|---|---|---|
| You | `test` | **David** · Grandma's grandson (the child who passed his driving test) | enrolled |
| KC (guy) | `kc` | **Kevin** · Grandma's son, David's dad | enrolled |
| MS (girl) | `ms` | **Someone new** (plays Anna, David's aunt) | `"enrolled": false` in `demo.config.json`; recordings kept, no voiceprint |

A fourth person is not worth it. The call already shows the two things that matter (two named voices, one never guessed). A third enrolled voice adds enrollment time and no new behaviour.

## Lines (leave ≥1 s of silence between every line; the VAD needs 0.5 s to end a turn)
| # | Who | Say | What the app does |
|---|---|---|---|
| 1 | KC | "Hi Mum, it's Kevin. David's here with me today." | Kevin tile glows |
| 2 | You | "Hi Grandma! I passed my driving test on the first try." | David glows, **Memory** chip |
| 3 | KC | "That's wonderful, David. Mum, please remember the blood pressure pill at eight in the morning." | **Med note** (family only, never on Grandma's screen) |
| 4 | MS | "Hi Mei, I'm Anna, David's aunt. It's lovely to finally meet you." | **Someone new**, never a guessed name, **New person** chip ("Anna — David's aunt?") |
| 5 | You | "Bye Grandma, we'll call again on Sunday!" | Label returns to David |

The site already ships with a placeholder replay in this exact order (`lib/mocks/replay/demo-call.json`), so every screen works before you record. The real take overwrites it.

## Record
- Quiet room, laptop on a table, all three within arm's reach of the mic. Normal volume, no overlapping speech.
- QuickTime → File → **New Audio Recording** → built-in microphone. Save as `~/Movies/call.m4a`.
- Do one 15 s dry run (lines 1–4) and run the commands below on it first. Check that line 4 comes out as "Someone new" with `ms` unenrolled.

## Process (≈2 min)
```bash
cd /Users/darren/CAC
mkdir -p data/calls apps/web/public/demo
ffmpeg -y -i ~/Movies/call.m4a -ac 1 -ar 16000 data/calls/demo.wav
ffmpeg -y -i ~/Movies/call.m4a -c:a aac -b:a 96k apps/web/public/demo/call.m4a
cd services/speaker
.venv/bin/python -m caretaker_speaker.enroll      # rebuilds voiceprints; skips ms because enrolled:false
.venv/bin/python -m caretaker_speaker.replay ../../data/calls/demo.wav ../../apps/web/lib/mocks/replay/demo-call.json --media /demo/call.m4a --offset 120
cd ../../apps/web && pnpm dev                      # open /family/call and /resident/call, press Play
```
No one is on camera (`camera` is unset for everyone), so the call pages play the recording from a hidden player and the tiles show initials.

Then tell me; I re-check that the Memory / Med note / New person chips sit on the right line ids and that the timestamps in Captured match, (done: the take was cut at speaker changes with 2 s pauses and trimmed after line 4; pill says "Recorded call · edited for pacing").

To enroll MS as a real family voice later, delete the `"enrolled": false` line and re-run `enroll`.
