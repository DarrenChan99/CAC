"""A second person's clip, in the same format as stats["signal"], so the page can put two voices side by side.

  cd services/speaker && PYTHONPATH=../..:. .venv/bin/python -m ml.eval.second_voice
"""
import json

import numpy as np
import torch
import torchaudio

from caretaker_speaker.audio import SR, load_wav
from caretaker_speaker.embed import Embedder
from caretaker_speaker.stream import silero_vad
from .voice_report import OUT, cfg, unit

COLS = 120  # same time resolution for every voice, so the terrain can morph between them


def signal_of(w, embed, person):
    env = np.abs(w[: len(w) // 200 * 200]).reshape(200, -1).max(1)
    vad, segs, start = silero_vad(), [], None
    for n, a in enumerate(range(0, len(w) - 511, 512)):
        ev = vad(w[a:a + 512])
        if ev == "start":
            start = n * 512 / SR
        if ev == "end" and start is not None:
            segs.append([round(start, 2), round(n * 512 / SR, 2)]); start = None
    if start is not None:
        segs.append([round(start, 2), round(len(w) / SR, 2)])
    mel = torchaudio.transforms.MelSpectrogram(SR, n_fft=400, win_length=400, hop_length=160, n_mels=80)(torch.from_numpy(w))
    lm = torch.log(mel + 1e-6)
    lm = (lm - lm.mean(1, keepdim=True)).numpy()  # same per-band mean normalisation as the first voice
    lm = lm[:, np.linspace(0, lm.shape[1] - 1, COLS).astype(int)]
    lm = ((lm - lm.min()) / (lm.max() - lm.min()) * 255).astype(int)
    return {"person": person, "seconds": round(len(w) / SR, 2), "envelope": env.round(3).tolist(), "vad": segs,
            "logmel": lm.tolist(), "embedding": unit(embed(w))[:192].round(3).tolist()}


def main():
    stats = json.loads(OUT.read_text())
    other = next(p["id"] for p in cfg["people"] if p["id"] != stats["signal"]["person"])
    clips = [load_wav(f) for f in sorted((OUT.parents[4] / "data" / "enroll" / other).glob("*/*.wav"))]
    # a clip about as long as the first voice's, so the two terrains are comparable
    w = min(clips, key=lambda c: abs(len(c) / SR - stats["signal"]["seconds"]))
    stats["signal2"] = signal_of(w, Embedder("mps"), other)
    OUT.write_text(json.dumps(stats, separators=(",", ":")))
    print("signal2", other, stats["signal2"]["seconds"], "s, vad", stats["signal2"]["vad"])


if __name__ == "__main__":
    main()
