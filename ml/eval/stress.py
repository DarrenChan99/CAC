"""Where does it break? Stress tests on 40 LibriSpeech speakers -> stats.json["stress"].

  cd services/speaker && PYTHONPATH=../..:. .venv/bin/python -m ml.eval.stress

Each speaker is enrolled from 20 s of audio; their later utterances are the test windows. A "family" is a random
subset of N speakers (voiceprints from clean audio, like a quiet enrollment); everyone else is a stranger.
Sweeps family size, background noise (white, and another person talking) and clip length. Same decision rule
(tau, margin) as the live loop. Merges into the existing stats.json so the real-family numbers are untouched.
"""
import json
import time

import numpy as np

from caretaker_speaker.audio import SR
from caretaker_speaker.embed import Embedder
from caretaker_speaker.enroll import centroid
from caretaker_speaker.score import decide
from . import dataset
from .voice_report import MARGIN, OUT, TAU, unit

PER_SPK, TRIALS, FAMILY_FOR_SWEEPS = 8, 40, 6
SIZES = [2, 3, 4, 6, 8, 10, 15, 20]
SNRS = [30, 20, 10, 5, 0]
LENGTHS = [0.5, 1, 2, 3]


def mix(x, noise, snr_db):
    """x plus noise scaled so signal power / noise power = snr_db."""
    n = np.resize(noise, len(x))
    k = np.sqrt((x ** 2).mean() / (n ** 2).mean() / 10 ** (snr_db / 10))
    return (x + k * n).astype("float32")


def rates(emb, cents, family, strangers):
    """emb: speaker -> [unit embeddings]. Share of family windows named right / wrongly, strangers named."""
    C = {s: cents[s] for s in family}
    right = wrong = n = named = m = 0
    for s in family:
        for e in emb[s]:
            got = decide({p: float(e @ c) for p, c in C.items()}, TAU, MARGIN)
            right += got == s; wrong += got not in (s, None); n += 1
    for s in strangers:
        for e in emb[s]:
            named += decide({p: float(e @ c) for p, c in C.items()}, TAU, MARGIN) is not None; m += 1
    return right / max(n, 1), wrong / max(n, 1), named / max(m, 1)


def sweep(emb, cents, spk, size, rng, trials=TRIALS):
    out = []
    for _ in range(trials):
        fam = list(rng.choice(spk, size, replace=False))
        out.append(rates(emb, cents, fam, [s for s in spk if s not in fam]))
    r, w, st = np.mean(out, 0)
    return {"right": round(float(r), 4), "wrong_name": round(float(w), 4), "stranger_named": round(float(st), 4)}


def main():
    t0 = time.time()
    embed = Embedder("mps")
    spk = dataset._speakers()
    ids = [p.name for p in spk]
    cents, crops = {}, {}
    for p in spk:
        wav, used = dataset.enroll_audio(p, 20)
        cents[p.name] = centroid(embed, wav)
        got = []
        for u in dataset._utts(p):
            x = dataset._read(u)
            if u not in used and len(x) >= 4 * SR:
                got.append(x[SR:SR + 3 * SR])  # 3 s crop; shorter/noisier test clips are cut from this
            if len(got) == PER_SPK:
                break
        crops[p.name] = got
    print(f"enrolled {len(ids)} speakers in {time.time() - t0:.0f}s", {s: len(c) for s, c in list(crops.items())[:3]})

    def embed_all(fn):
        return {s: [unit(embed(fn(s, i, x))) for i, x in enumerate(c)] for s, c in crops.items()}

    rng = np.random.default_rng(0)
    clean = embed_all(lambda s, i, x: x[:2 * SR])
    family_size = [{"n": n, **sweep(clean, cents, ids, n, rng)} for n in SIZES]
    print("family size:", family_size)

    def noisy(kind, snr):
        def f(s, i, x):
            x = x[:2 * SR]
            if kind == "white":
                return mix(x, rng.standard_normal(len(x)), snr)
            other = crops[ids[(ids.index(s) + 7) % len(ids)]][i % PER_SPK]  # someone else talking in the room
            return mix(x, other[:2 * SR], snr)
        return embed_all(f)
    noise = {k: [{"snr": snr, **sweep(noisy(k, snr), cents, ids, FAMILY_FOR_SWEEPS, rng)} for snr in SNRS] for k in ("white", "talker")}
    print("noise:", noise)

    clip_len = [{"seconds": L, **sweep(embed_all(lambda s, i, x, L=L: x[:int(L * SR)]), cents, ids, FAMILY_FOR_SWEEPS, rng)} for L in LENGTHS]
    print("clip length:", clip_len)

    M = np.array([cents[s] for s in ids])
    S = M @ M.T
    pair = S[np.triu_indices(len(ids), 1)]
    bins = np.linspace(-0.1, 1.0, 23)
    stress = {"family_size": family_size, "noise": noise, "clip_len": clip_len,
              "pairs": {"bins": bins.round(3).tolist(), "count": np.histogram(pair, bins)[0].tolist(),
                        "n_pairs": int(len(pair)), "closest": np.sort(pair)[::-1][:5].round(3).tolist(),
                        "over_tau": int((pair > TAU).sum())},
              "meta": {"speakers": len(ids), "windows_per_speaker": PER_SPK, "enroll_s": 20, "trials": TRIALS,
                       "family_for_sweeps": FAMILY_FOR_SWEEPS}}
    stats = json.loads(OUT.read_text())
    stats["stress"] = stress
    OUT.write_text(json.dumps(stats, separators=(",", ":")))
    # self-check: the easiest setting must beat the hardest one, or something is mislabelled
    assert family_size[0]["right"] >= family_size[-1]["right"] - 0.02, "bigger families should not be easier"
    assert noise["white"][0]["right"] >= noise["white"][-1]["right"], "0 dB should not beat 30 dB"
    print(f"wrote stress into {OUT} in {time.time() - t0:.0f}s")


if __name__ == "__main__":
    main()
