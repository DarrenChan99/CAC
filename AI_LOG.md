# AI log (CAC disclosure)

Every AI-assisted session: date, tool, files touched, what it did. Core logic
(`decide`, `smooth`, `pick_threshold`, `cluster_unknowns`) is written by Darren.

| Date | Tool | Files | What the AI did |
|---|---|---|---|
| 2026-10-18 | Claude Code | `services/speaker/**` (audio, embed, enroll, score scaffold), `ml/eval/**` (dataset, run_eval, charts), `demo.config.json`, failing tests | Scaffolded the Python speaker-ID project and evaluation harness; left the 4 core functions as stubs with docstrings + failing tests for Darren to implement. |
| 2026-10-18 | Claude Code | `services/speaker/caretaker_speaker/record.py`, `record.html`, `enroll.py`, `tests/test_quality.py`, `demo.config.json` | Built the local voice-enrollment recorder (guided sentences, per-clip quality check, saved after every sentence) and multi-session voiceprint building. |
| 2026-10-19 | Claude Code | `services/speaker/caretaker_speaker/record.py`, `record.html`, `services/speaker/record`, `tests/test_quality.py` | Made enrollment coach instead of reject: room-relative speech detection, colored live level meter + speech-time bar, no silence auto-stop, mic check before recording, take playback, rejected takes saved to `data/rejected/`, one-command launcher. |
