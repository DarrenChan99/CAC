"""Score a replayed call against hand labels, or build a stand-in call from LibriSpeech.

  python -m ml.eval.run_call make                          # data/fixture/{call.wav,labels.csv,voiceprints.npz}
  python -m ml.eval.run_call score OUT.json LABELS.csv [--offset 0]
Run from services/speaker with PYTHONPATH=../..:.
labels.csv: start_s,end_s,person_id   (person_id empty = a voice that is not enrolled)
"""
import argparse
import csv
import json
from pathlib import Path


def score_call(utterances, labels):
    """Per label, the utterance overlapping it most decides: right / someone_new / wrong_name.
    Label with no utterance = nothing was named = someone_new. A stranger given a name is wrong."""
    counts = {"right": 0, "someone_new": 0, "wrong_name": 0}
    for s, e, truth in labels:
        best, best_ov = None, 0.0
        for u in utterances:
            ov = min(e, u["at"] + u["speakFor"]) - max(s, u["at"])
            if ov > best_ov:
                best, best_ov = u, ov
        got = best["speakerId"] if best else None
        if got == truth:
            counts["right"] += 1
        elif got is None:
            counts["someone_new"] += 1
        else:
            counts["wrong_name"] += 1
    n = len(labels)
    return {**{k: v / n for k, v in counts.items()}, "n": n} if n else {"right": 0, "someone_new": 0, "wrong_name": 0, "n": 0}


def read_labels(path):
    rows = csv.DictReader(open(path))
    return [(float(r["start_s"]), float(r["end_s"]), r["person_id"] or None) for r in rows]


def make(out=None):
    import numpy as np
    import soundfile as sf
    from caretaker_speaker.audio import SR
    from caretaker_speaker.embed import Embedder
    from caretaker_speaker.enroll import centroid
    from . import dataset

    out = Path(out or dataset.ROOT / "data" / "fixture")
    out.mkdir(parents=True, exist_ok=True)
    fam, strangers = dataset.split()
    ids = ["lisa", "emily", "david"]
    embed, vp, held = Embedder(), {}, {}
    for pid, spk in zip(ids, fam):
        wav, used = dataset.enroll_audio(spk)
        vp[pid] = centroid(embed, wav)
        held[pid] = [dataset._read(u) for u in dataset._utts(spk) if u not in used][:2]
    held[None] = [dataset._read(dataset._utts(strangers[0])[0])]
    order = [ids[0], ids[1], ids[2], None, ids[0], ids[1], ids[2]]
    gap, t, audio, rows = np.zeros(SR, "float32"), 0.0, [], []
    for who in order:
        x = held[who].pop(0)
        rows.append((round(t, 2), round(t + len(x) / SR, 2), who or ""))
        audio += [x, gap]
        t += len(x) / SR + 1
    sf.write(out / "call.wav", np.concatenate(audio), SR)
    np.savez(out / "voiceprints.npz", **vp)
    with open(out / "labels.csv", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["start_s", "end_s", "person_id"])
        w.writerows(rows)
    print("wrote", out, len(rows), "labelled turns")


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("make")
    sc = sub.add_parser("score")
    sc.add_argument("replay")
    sc.add_argument("labels")
    sc.add_argument("--offset", type=float, default=0, help="the --offset the replay was built with")
    a = ap.parse_args()
    if a.cmd == "make":
        return make()
    data = json.loads(Path(a.replay).read_text())
    data = data["utterances"] if isinstance(data, dict) else data  # new files wrap the list
    persona = {p["id"]: p.get("as", p["id"]) for p in json.loads((Path(__file__).parents[2] / "demo.config.json").read_text())["people"]}
    labels = [(s, e, persona.get(who, who)) for s, e, who in read_labels(a.labels)]  # labels use real ids
    utts = [{**u, "at": u["at"] - a.offset} for u in data]
    r = score_call(utts, labels)
    print(f'n={r["n"]}  right {r["right"]:.0%}  someone-new {r["someone_new"]:.0%}  wrong-name {r["wrong_name"]:.0%}')
    out = Path(__file__).parent / "out" / "call.json"
    out.write_text(json.dumps(r, indent=2))


if __name__ == "__main__":
    main()
