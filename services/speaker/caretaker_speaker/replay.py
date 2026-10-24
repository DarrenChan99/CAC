"""Recorded call (wav) -> Utterance[] JSON the web app replays (apps/web/lib/mocks/call-timeline.ts).

stream.run labels each utterance; Whisper runs once over the whole call and its words are
handed to the utterance they fall in.
"""
import argparse
import json
import sys

import numpy as np

from .audio import SR, load_wav

MODEL = "mlx-community/whisper-large-v3-turbo"
LOW_PROB = 0.5     # a word below this marks the line lowConfidence
MAX_GAP_S = 1.0    # words farther than this from any utterance are Whisper noise


def assign_words(finals, words):
    """-> per final: (text, lowest word probability, that word or None)."""
    buckets = [[] for _ in finals]
    for w in words:
        mid = 1000 * (w["start"] + w["end"]) / 2
        gaps = [max(f["start_ms"] - mid, mid - f["end_ms"], 0) for f in finals]
        if gaps and min(gaps) <= 1000 * MAX_GAP_S:
            buckets[gaps.index(min(gaps))].append(w)
    out = []
    for b in buckets:
        text = "".join(w["word"] for w in b).strip()
        low = min(b, key=lambda w: w["probability"], default=None)
        out.append((text, low["probability"] if low else 1.0, low["word"].strip(" .,!?") if low else None))
    return out


def build_utterances(finals, texts, offset_s=0.0):
    out = []
    for f, (text, prob, word) in zip(finals, texts):
        if not text:
            continue
        # speakFor is how long the UI shows "transcribing" dots, not the real duration
        dur = min(max((f["end_ms"] - f["start_ms"]) / 1000, 1.5), 3.0)
        u = {"id": f"u{len(out) + 1}", "at": round(f["start_ms"] / 1000 + offset_s, 1),
             "speakFor": round(dur, 1), "speakerId": f["person_id"],
             "speakerScore": round(f["score"], 2), "text": text}
        if prob < LOW_PROB:
            u["lowConfidence"], u["uncertainWord"] = True, word
        out.append(u)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("wav")
    ap.add_argument("out")
    ap.add_argument("--voiceprints", default=None)
    ap.add_argument("--offset", type=float, default=120)
    a = ap.parse_args()

    from pathlib import Path
    from .enroll import ROOT, load_config
    vp_path = Path(a.voiceprints) if a.voiceprints else ROOT / "data" / "voiceprints.npz"
    if not vp_path.exists():
        sys.exit(f"No voiceprints at {vp_path}. Record enrollment, then: python -m caretaker_speaker.enroll")
    cfg = load_config()
    z = np.load(vp_path)
    centroids = {k: z[k] for k in z.files}

    from .embed import Embedder
    from .stream import run, silero_vad
    wav = load_wav(a.wav)
    blocks = (wav[i:i + 512] for i in range(0, len(wav) - 511, 512))
    finals = [e for e in run(blocks, Embedder(), centroids, cfg["tau"], cfg["margin"], silero_vad())
              if e["type"] == "speaker_final"]

    print(f"{len(finals)} utterances; transcribing (first run downloads Whisper)...")
    import mlx_whisper
    r = mlx_whisper.transcribe(wav, path_or_hf_repo=MODEL, language="en", word_timestamps=True)
    words = [w for s in r["segments"] if s.get("no_speech_prob", 0) <= 0.6 for w in s.get("words", [])]
    utts = build_utterances(finals, assign_words(finals, words), a.offset)

    Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    Path(a.out).write_text(json.dumps(utts, indent=2, ensure_ascii=False) + "\n")
    for u in utts:
        print(f'{u["id"]:>4} {u["at"]:7.1f}s {str(u["speakerId"]):>6} {u["speakerScore"]:.2f}  {u["text"]}')


if __name__ == "__main__":
    main()
