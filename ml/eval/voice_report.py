"""Every enrolled person -> apps/web/lib/how/stats.json (the data behind /how-it-works).

  cd services/speaker && PYTHONPATH=../..:. .venv/bin/python -m ml.eval.voice_report

Per person: leave-one-clip-out (voiceprint from their other clips, score the held-out clip as a whole
utterance and as 2 s / 1 s-hop windows, the way the live loop sees it). Strangers are 40 LibriSpeech
speakers. Reruns in minutes as people enroll.
"""
import json
import time
from pathlib import Path

import numpy as np
from sklearn.manifold import TSNE
from sklearn.metrics import roc_auc_score, roc_curve

from caretaker_speaker.audio import SR, load_wav
from caretaker_speaker.embed import Embedder
from caretaker_speaker.enroll import centroid
from caretaker_speaker.record import quality
from caretaker_speaker.score import decide
from . import dataset

ROOT = dataset.ROOT
OUT = ROOT / "apps" / "web" / "lib" / "how" / "stats.json"
WIN, HOP = 2 * SR, SR
SECONDS = [5, 10, 15, 20, 25]
cfg = json.loads((ROOT / "demo.config.json").read_text())
TAU, MARGIN = cfg["tau"], cfg["margin"]
unit = lambda v: v / np.linalg.norm(v)


def windows(w):
    return [w[i:i + WIN] for i in range(0, len(w) - WIN + 1, HOP)] or [w]


def rate(xs):
    return round(float(np.mean(xs)), 4) if len(xs) else 0.0


def main():
    t0 = time.time()
    embed = Embedder("mps")
    people = [p for p in cfg["people"] if sorted((ROOT / "data" / "enroll" / p["id"]).glob("*/*.wav"))]
    ids = [p["id"] for p in people]
    names = {p["id"]: p["name"] for p in people}
    clips = {i: [load_wav(f) for f in sorted((ROOT / "data" / "enroll" / i).glob("*/*.wav"))] for i in ids}
    print("people:", {i: f"{len(c)} clips {sum(map(len, c)) / SR:.0f}s" for i, c in clips.items()})

    full = {i: centroid(embed, np.concatenate(clips[i])) for i in ids}
    cl_emb = {i: [unit(embed(w)) for w in clips[i]] for i in ids}
    win_emb = {i: [[unit(embed(x)) for x in windows(w)] for w in clips[i]] for i in ids}

    spk = sum(dataset.split(), [])  # all 40 LibriSpeech speakers are strangers to our family
    s_win = np.array([unit(embed(w)) for s in spk for w in dataset.test_windows(s, n=6)])
    s_utt = []  # whole-utterance trials: one ~3.5 s crop per LibriSpeech utterance (up to 4 per speaker)
    for sp in spk:
        for u in dataset._utts(sp)[:4]:
            x = dataset._read(u)
            if len(x) > 4 * SR:
                s_utt.append(unit(embed(x[SR:SR + int(3.5 * SR)])))
    print(f"strangers: {len(s_win)} windows, {len(s_utt)} utterances")

    def loo(i, k):  # voiceprints with person i's clip k held out
        c = dict(full)
        rest = [w for j, w in enumerate(clips[i]) if j != k]
        c[i] = centroid(embed, np.concatenate(rest)) if rest else full[i]
        return c

    labels = ids + ["new"]
    conf_clip = np.zeros((len(ids) + 1, len(labels)), int)
    conf_win = np.zeros_like(conf_clip)
    tgt, imp_stranger, imp_person = [], [], []
    per_person = {}
    win_rec = {i: [] for i in ids}  # [score vs own voiceprint, outcome 0 right / 1 Someone new / 2 wrong name]
    for r, i in enumerate(ids):
        cw, cc = [], []
        for k, v in enumerate(cl_emb[i]):
            C = loo(i, k)
            for e, conf, acc in [(v, conf_clip, cc)] + [(x, conf_win, cw) for x in win_emb[i][k]]:
                sc = {p: float(e @ c) for p, c in C.items()}
                got = decide(sc, TAU, MARGIN)
                conf[r, labels.index(got) if got else len(ids)] += 1
                acc.append(got)
                if acc is cw:
                    tgt.append(sc[i])
                    win_rec[i].append([round(sc[i], 3), 0 if got == i else 1 if got is None else 2])
                    imp_person += [s for p, s in sc.items() if p != i]  # other people's score vs the wrong voiceprint
        per_person[i] = {"clips": len(clips[i]), "seconds": round(sum(map(len, clips[i])) / SR, 1),
                         "clip_right": rate([g == i for g in cc]), "window_right": rate([g == i for g in cw]),
                         "window_someone_new": rate([g is None for g in cw]),
                         "window_wrong_name": rate([g not in (i, None) for g in cw])}
    s_rec = []
    for e in s_win:
        sc = {p: float(e @ c) for p, c in full.items()}
        got = decide(sc, TAU, MARGIN)
        s_rec.append([round(max(sc.values()), 3), 1 if got is None else 2])
        conf_win[len(ids), labels.index(got) if got else len(ids)] += 1
        imp_stranger.append(max(sc.values()))
    for e in s_utt:
        got = decide({p: float(e @ c) for p, c in full.items()}, TAU, MARGIN)
        conf_clip[len(ids), labels.index(got) if got else len(ids)] += 1
    strangers_named = 1 - conf_win[len(ids), len(ids)] / max(conf_win[len(ids)].sum(), 1)

    # score distributions / DET over window scores: target = own voiceprint, impostor = strangers + other people
    imp = np.array(imp_stranger + imp_person)
    tgt = np.array(tgt)
    y = np.r_[np.ones(len(tgt)), np.zeros(len(imp))]
    s = np.r_[tgt, imp]
    fpr, tpr, thr = roc_curve(y, s)
    fnr = 1 - tpr
    k = int(np.nanargmin(np.abs(fnr - fpr)))
    eer = float((fnr[k] + fpr[k]) / 2)
    op = int(np.argmin(np.abs(thr - TAU)))
    keep = np.unique(np.linspace(0, len(fpr) - 1, 80).astype(int))
    bins = np.linspace(-0.1, 1.0, 45)
    hist = lambda x: np.histogram(x, bins)[0].tolist()
    det = {"fpr": fpr[keep].round(4).tolist(), "fnr": fnr[keep].round(4).tolist(), "eer": round(eer, 4),
           "eer_threshold": round(float(thr[k]), 3), "auc": round(float(roc_auc_score(y, s)), 5),
           "at_tau": {"fpr": round(float(fpr[op]), 4), "fnr": round(float(fnr[op]), 4)}}
    dist = {"bins": bins.round(3).tolist(), "target": hist(tgt), "stranger": hist(imp_stranger),
            "other_person": hist(imp_person), "tau": TAU, "margin": MARGIN}

    # enrollment-duration curve: voiceprint from the first N seconds of the OTHER clips
    curve = []
    for sec in SECONDS:
        ok, tot, wrong = 0, 0, 0
        for i in ids:
            for kk in range(len(clips[i])):
                rest = [w for j, w in enumerate(clips[i]) if j != kk]
                if not rest:
                    continue
                C = dict(full)
                C[i] = centroid(embed, np.concatenate(rest), sec)
                for e in win_emb[i][kk]:
                    got = decide({p: float(e @ c) for p, c in C.items()}, TAU, MARGIN)
                    ok += got == i; wrong += got not in (i, None); tot += 1
        curve.append({"seconds": sec, "right": round(ok / max(tot, 1), 4), "wrong_name": round(wrong / max(tot, 1), 4)})

    cross = [[round(float(full[a] @ full[b]), 3) for b in ids] for a in ids]

    quality_rows = []
    for i in ids:
        rej = {}
        for f in (ROOT / "data" / "rejected" / i).glob("*.wav"):
            reason = f.stem.rsplit("-", 1)[-1]
            rej[reason] = rej.get(reason, 0) + 1
        st = [quality(w)[1] for w in clips[i]]
        quality_rows.append({"id": i, "name": names[i], "clips": len(st), "speech_s": round(sum(x["speech_s"] for x in st), 1),
                             "level_db": round(float(np.mean([x["level_db"] for x in st]))),
                             "floor_db": round(float(np.mean([x["floor_db"] for x in st]))),
                             "snr_db": round(float(np.mean([x["level_db"] - x["floor_db"] for x in st]))),
                             "rejected": rej})

    # --- points for the 3D embedding view -------------------------------------------------------------
    pts, who = [], []
    for i in ids:
        for ws in win_emb[i]:
            pts += ws; who += [i] * len(ws)
    stranger_idx = np.random.default_rng(0).choice(len(s_win), min(120, len(s_win)), replace=False)
    pts += [s_win[j] for j in stranger_idx]; who += ["stranger"] * len(stranger_idx)
    pts += [full[i] for i in ids]; who += [f"centroid:{i}" for i in ids]
    X = np.array(pts)
    Xc = X - X.mean(0)
    U, S, Vt = np.linalg.svd(Xc, full_matrices=False)
    pca = Xc @ Vt[:3].T
    var = (S ** 2 / (S ** 2).sum())[:3]
    tsne = TSNE(3, perplexity=min(30, max(5, len(X) // 6)), metric="cosine", init="pca", random_state=0, method="exact").fit_transform(X)
    norm = lambda a: (a / np.abs(a).max() * 1.0).round(3).tolist()
    embeddings = {"who": who, "pca": norm(pca), "tsne": norm(tsne), "pca_explained": var.round(4).tolist(),
                  "centroid_sim": {i: [round(float(x @ full[i]), 3) for x in X] for i in ids}}

    # --- one real clip through the front end, for the signal-chain figure -------------------------------
    import torch
    import torchaudio
    from caretaker_speaker.stream import silero_vad
    cam = next((p["id"] for p in people if p.get("camera")), ids[0])
    w = max(clips[cam], key=len)
    env = np.abs(w[: len(w) // 200 * 200]).reshape(200, -1).max(1)
    def vad_pass(x):
        vad, out, start = silero_vad(), [], None
        for n_, a_ in enumerate(range(0, len(x) - 511, 512)):
            ev = vad(x[a_:a_ + 512])
            if ev == "start":
                start = n_ * 512 / SR
            if ev == "end" and start is not None:
                out.append([round(start, 2), round(n_ * 512 / SR, 2)]); start = None
        if start is not None:
            out.append([round(start, 2), round(len(x) / SR, 2)])
        return out
    segs = vad_pass(w)
    mel = torchaudio.transforms.MelSpectrogram(SR, n_fft=400, win_length=400, hop_length=160, n_mels=80)(torch.from_numpy(w))
    logmel = torch.log(mel + 1e-6)
    logmel = ((logmel - logmel.mean(1, keepdim=True))).numpy()  # per-bin mean normalisation (CMN)
    step = max(1, logmel.shape[1] // 120)
    lm = logmel[:, ::step]
    lm = ((lm - lm.min()) / (lm.max() - lm.min()) * 255).astype(int)
    signal = {"person": cam, "seconds": round(len(w) / SR, 2), "envelope": env.round(3).tolist(), "vad": segs,
              "logmel": lm.tolist(), "embedding": unit(embed(w))[:192].round(3).tolist()}

    def ms(f, n=1):
        t = time.perf_counter()
        for _ in range(n):
            f()
        return (time.perf_counter() - t) / n * 1000

    win2 = w[:WIN] if len(w) >= WIN else w
    e0 = unit(embed(win2))
    timing = {"clip_s": round(len(w) / SR, 2),
              "vad_ms_per_audio_s": round(ms(lambda: vad_pass(w)) / (len(w) / SR), 1),
              "fbank_ms": round(ms(lambda: embed.model.mods.compute_features(torch.from_numpy(win2)[None].to(embed.device)), 10), 1),
              "embed_ms": round(ms(lambda: embed(win2), 10), 1),
              "score_us": round(ms(lambda: decide({p: float(e0 @ c) for p, c in full.items()}, TAU, MARGIN), 2000) * 1000, 1)}
    from caretaker_speaker.stickiness import Smoother
    sm = Smoother()
    timing["smooth_us"] = round(ms(lambda: sm.update(ids[0]), 5000) * 1000, 2)
    try:
        import mlx_whisper
        from caretaker_speaker.replay import MODEL
        tr = lambda: mlx_whisper.transcribe(w, path_or_hf_repo=MODEL, language="en", word_timestamps=True)
        tr()  # load + warm
        timing["whisper_s_per_audio_s"] = round(ms(tr) / 1000 / (len(w) / SR), 3)
    except Exception as ex:  # report still useful without it
        print("whisper timing skipped:", ex)
    print("timing:", timing)

    import collections
    import subprocess
    files = subprocess.run(["git", "ls-files", "--cached", "--others", "--exclude-standard"], cwd=ROOT, capture_output=True, text=True).stdout.split()
    lang_of = {".py": "Python", ".ts": "TypeScript", ".tsx": "TypeScript", ".css": "CSS", ".html": "HTML", ".md": "Markdown"}
    loc = collections.Counter()
    for f in files:
        lg = lang_of.get(Path(f).suffix)
        if lg and (ROOT / f).is_file() and not f.startswith("design_handoff"):
            loc[lg] += sum(1 for _ in open(ROOT / f, errors="ignore"))
    n_py = sum(open(f).read().count("def test_") for f in (ROOT / "services" / "speaker" / "tests").glob("*.py"))
    n_ts = sum(open(f).read().count("\ntest(") for f in (ROOT / "apps" / "web" / "lib").glob("*.test.ts"))
    commits = subprocess.run(["git", "rev-list", "--count", "HEAD"], cwd=ROOT, capture_output=True, text=True).stdout.strip()
    repo = {"loc": dict(loc.most_common()), "files": len(files), "tests": {"python": n_py, "web": n_ts}, "commits": int(commits or 0)}

    stats = {"generated": time.strftime("%Y-%m-%d %H:%M"), "tau": TAU, "margin": MARGIN,
             "people": [{"id": i, "name": names[i], "as": next(p.get("as", p["id"]) for p in people if p["id"] == i)} for i in ids],
             "labels": labels, "strangers": {"speakers": len(spk), "windows": int(len(s_win)), "named": round(float(strangers_named), 4)},
             "confusion": {"clip": conf_clip.tolist(), "window": conf_win.tolist()}, "per_person": per_person,
             "distributions": dist, "det": det, "enrollment_curve": curve, "cross_similarity": cross,
             "quality": quality_rows, "embeddings": embeddings, "signal": signal,
             "windows": {**win_rec, "stranger": s_rec}, "centroids": {i: full[i].round(3).tolist() for i in ids},
             "probe": s_win[int(stranger_idx[0])].round(3).tolist(), "timing": timing, "repo": repo}
    call = ROOT / "ml" / "eval" / "out" / "call.json"
    if call.exists():
        stats["call"] = json.loads(call.read_text())
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(stats, separators=(",", ":")))
    print(f"wrote {OUT} ({OUT.stat().st_size // 1024} KB) in {time.time() - t0:.0f}s")
    print(f"EER {eer:.2%} @ {thr[k]:.2f}; AUC {det['auc']}; at tau {TAU}: fnr {fnr[op]:.2%} fpr {fpr[op]:.2%}; strangers named {strangers_named:.2%}")
    for i, p in per_person.items():
        print(i, p)
    print("enrollment curve:", curve)


if __name__ == "__main__":
    main()
