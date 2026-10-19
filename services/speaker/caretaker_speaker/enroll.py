"""Build voiceprints (one centroid per person) from enrollment recordings."""
import json
from pathlib import Path

import numpy as np

from .audio import SR, load_wav

ROOT = Path(__file__).resolve().parents[3]
CHUNK = 3 * SR


def centroid(embed, wav, seconds=None) -> np.ndarray:
    """Mean of embeddings of 3 s chunks (first `seconds` of audio), re-normalized."""
    if seconds:
        wav = wav[: int(seconds * SR)]
    chunks = [wav[i:i + CHUNK] for i in range(0, max(len(wav) - CHUNK // 2, 1), CHUNK)]
    c = np.mean([embed(c) for c in chunks], axis=0)
    return c / np.linalg.norm(c)


def load_config():
    return json.loads((ROOT / "demo.config.json").read_text())


def build(embed, seconds=None) -> dict[str, np.ndarray]:
    """Per person: mean of 3 s-chunk embeddings over every clip in data/enroll/<id>/**.wav
    (all sessions), falling back to the legacy single `enroll` file."""
    out = {}
    for p in load_config()["people"]:
        clips = sorted((ROOT / "data" / "enroll" / p["id"]).glob("*/*.wav"))
        if clips:
            wav = np.concatenate([load_wav(c) for c in clips])
        elif p.get("enroll") and (ROOT / p["enroll"]).exists():
            wav = load_wav(ROOT / p["enroll"])
        else:
            continue  # not recorded yet
        out[p["id"]] = centroid(embed, wav, seconds)
    return out


if __name__ == "__main__":
    from .embed import Embedder
    vp = build(Embedder())
    np.savez(ROOT / "data" / "voiceprints.npz", **vp)
    print("saved", list(vp))
