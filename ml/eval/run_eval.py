"""python -m ml.eval.run_eval --set librispeech   (run from services/speaker)"""
import argparse
import json
import sys

import numpy as np

from caretaker_speaker.embed import Embedder
from caretaker_speaker.enroll import centroid
from . import charts, dataset
from .threshold import pick_threshold

SECONDS = [5, 10, 20, 30]
MARGIN = json.loads((dataset.ROOT / "demo.config.json").read_text())["margin"]


def top_scores(embs, C):
    """Per trial: (top1 index, top1 score, top2 score)."""
    S = embs @ C.T
    o = np.argsort(-S, axis=1)
    top1 = S[np.arange(len(S)), o[:, 0]]
    top2 = S[np.arange(len(S)), o[:, 1]]
    return o[:, 0], top1, top2


def outcomes(idx, t1, t2, truth, tau):
    """truth: enrolled index, or -1 for stranger. Vectorized equivalent of decide()."""
    named = (t1 > tau) & ((t1 - t2) > MARGIN)
    right = named & (idx == truth)
    wrong = named & (idx != truth)
    return right, wrong, ~named


def main():
    embed = Embedder("mps")
    fam, strangers = dataset.split()
    wavs = {s: dataset.enroll_audio(s) for s in fam}
    print("embedding test windows...")
    E, truth = [], []
    for i, s in enumerate(fam):
        for w in dataset.test_windows(s, exclude=wavs[s][1]):
            E.append(embed(w)); truth.append(i)
    for s in strangers:
        for w in dataset.test_windows(s):
            E.append(embed(w)); truth.append(-1)
    E, truth = np.array(E), np.array(truth)
    is_fam = truth >= 0

    def centroids(sec):
        return np.array([centroid(embed, wavs[s][0], sec) for s in fam])

    C = centroids(30)
    idx, t1, t2 = top_scores(E, C)
    taus = np.linspace(0.2, 0.9, 141)
    sn, wr = [], []
    for t in taus:
        r, w, u = outcomes(idx, t1, t2, truth, t)
        sn.append(100 * u[is_fam].mean()); wr.append(100 * w.mean())
    # Darren's pick_threshold: impostor = strangers' top score; target = family's top score
    chosen, tau = None, None
    try:
        tau, st = pick_threshold(t1[is_fam], t1[~is_fam], 0.02)
        chosen = (100 * st["someone_new_rate"], 100 * st["wrong_name_rate"])
        print(f"pick_threshold -> tau={tau:.3f}  {st}")
    except NotImplementedError:
        tau = json.loads((dataset.ROOT / "demo.config.json").read_text())["tau"]
        print(f"pick_threshold not implemented yet; using config tau={tau}")
    charts.chart1(sn, wr, chosen)

    r, w, u = outcomes(idx, t1, t2, truth, tau)
    print(f"@tau={tau:.3f} margin={MARGIN}: family right={100*r[is_fam].mean():.1f}% "
          f"someone-new={100*u[is_fam].mean():.1f}% wrong={100*w[is_fam].mean():.1f}% | "
          f"strangers called 'Someone new'={100*u[~is_fam].mean():.1f}% named={100*w[~is_fam].mean():.1f}%")

    acc = []
    for sec in SECONDS:
        i2, a, b = top_scores(E, centroids(sec))
        r2, _, _ = outcomes(i2, a, b, truth, tau)
        acc.append(100 * r2[is_fam].mean())
    print("accuracy by enrollment seconds:", dict(zip(SECONDS, np.round(acc, 1))))
    charts.chart2(SECONDS, acc)
    print("charts in ml/eval/out/")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(); ap.add_argument("--set", default="librispeech")
    if ap.parse_args().set != "librispeech":
        sys.exit("room set: Tuesday")
    main()
