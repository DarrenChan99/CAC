"""LibriSpeech test-clean trials: 20 'family' speakers (enrolled) + 20 strangers."""
import random
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parents[2]
LS = ROOT / "data" / "librispeech" / "LibriSpeech" / "test-clean"
SR = 16000
WIN = 2 * SR  # same 2 s window the live loop scores


def _speakers():
    return sorted(p for p in LS.iterdir() if p.is_dir())


def _utts(spk: Path):
    return sorted(spk.glob("*/*.flac"))


def split(seed=0, n_family=20):
    spks = _speakers()
    random.Random(seed).shuffle(spks)
    return spks[:n_family], spks[n_family:]


def _read(p):
    return sf.read(str(p), dtype="float32")[0]


def enroll_audio(spk: Path, seconds=30):
    """First utterances of the speaker, concatenated to `seconds`. Returns (wav, used_paths)."""
    out, used = [], []
    for u in _utts(spk):
        out.append(_read(u)); used.append(u)
        if sum(map(len, out)) >= seconds * SR:
            break
    return np.concatenate(out)[: seconds * SR], used


def test_windows(spk: Path, exclude=(), n=12):
    """One 2 s crop per held-out utterance (never one used for enrollment)."""
    crops = []
    for u in _utts(spk):
        if u in exclude:
            continue
        x = _read(u)
        if len(x) >= WIN + SR:
            crops.append(x[SR: SR + WIN])
        if len(crops) == n:
            break
    return crops
