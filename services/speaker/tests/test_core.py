import numpy as np
import pytest

from caretaker_speaker.score import decide

def test_decide_confident():
    assert decide({"a": 0.8, "b": 0.2}, tau=0.5, margin=0.05) == "a"

def test_decide_below_tau_is_unknown():
    assert decide({"a": 0.4, "b": 0.1}, tau=0.5, margin=0.05) is None

def test_decide_close_call_is_unknown():
    assert decide({"a": 0.62, "b": 0.60}, tau=0.5, margin=0.05) is None

def test_decide_single_person():
    assert decide({"a": 0.7}, tau=0.5, margin=0.05) == "a"
    assert decide({"a": 0.3}, tau=0.5, margin=0.05) is None

def test_decide_empty():
    assert decide({}, tau=0.5, margin=0.05) is None


# --- pick_threshold ---
from ml.eval.threshold import pick_threshold

def test_pick_threshold_meets_target():
    rng = np.random.default_rng(0)
    target = rng.normal(0.7, 0.08, 2000)
    impostor = rng.normal(0.2, 0.08, 2000)
    tau, stats = pick_threshold(target, impostor, max_wrong_name=0.02)
    assert (impostor >= tau).mean() <= 0.02
    # lowest such tau: a slightly lower one would break the target
    assert (impostor >= tau - 0.02).mean() > 0.02 or tau <= impostor.min()
    assert stats["wrong_name_rate"] <= 0.02
    assert 0 <= stats["someone_new_rate"] <= 1

def test_pick_threshold_overlapping():
    tau, stats = pick_threshold(np.array([0.5, 0.6, 0.7]), np.array([0.1, 0.55, 0.2]), 0.0)
    assert tau > 0.55


# --- Smoother ---
from caretaker_speaker.stickiness import Smoother

def test_smoother_needs_two_windows_to_switch():
    s = Smoother()
    assert [s.update(x) for x in ["a", "a", "b", "a", "a"]] == [None, "a", "a", "a", "a"]
    assert [s.update(x) for x in ["b", "b"]] == ["a", "b"]

def test_smoother_utterance_end_switches_immediately():
    s = Smoother()
    s.update("a"); s.update("a")
    assert s.update("b", utterance_ended=True) == "b"

def test_smoother_unknown_is_a_label():
    s = Smoother()
    s.update("a"); s.update("a")
    assert [s.update(None), s.update(None)] == ["a", None]


# --- cluster_unknowns ---
from caretaker_speaker.unknowns import cluster_unknowns

def _unit(v):
    v = np.array(v, float)
    return v / np.linalg.norm(v)

def test_cluster_unknowns_merges_same_voice():
    x1, x2, y = _unit([1, 0.1, 0]), _unit([1, -0.1, 0]), _unit([0, 0, 1])
    cl = cluster_unknowns([x1, y, x2], join_threshold=0.9)
    assert [len(c["members"]) for c in cl] == [2, 1]
    assert np.isclose(np.linalg.norm(cl[0]["centroid"]), 1.0)
    assert cluster_unknowns([], 0.9) == []


# --- stream.run (fake embedder: the "voice" is the sign of the first sample) ---
from caretaker_speaker.stream import run
from caretaker_speaker.audio import SR as _SR

def test_stream_labels_then_finalizes_and_collects_unknowns():
    emb = lambda w: np.array([1.0, 0.0]) if w[0] > 0 else np.array([0.0, 1.0])
    C = {"a": np.array([1.0, 0.0])}
    blk = lambda v: np.full(512, v, "float32")
    n = 4 * _SR // 512  # 4 s of speech
    blocks = [blk(1)] * n + [blk(0.0)] + [blk(-1)] * n + [blk(0.0)]
    # vad: start at block 0 and n+1, end at block n and 2n+1
    ev = {0: "start", n: "end", n + 1: "start", 2 * n + 1: "end"}
    it = iter(range(len(blocks)))
    unknowns = []
    out = list(run(blocks, emb, C, 0.5, 0.05, lambda b: ev.get(next(it)), unknowns))
    finals = [e for e in out if e["type"] == "speaker_final"]
    assert [f["person_id"] for f in finals] == ["a", None]   # voice a named, then "Someone new"
    assert any(e["type"] == "speaker" and e["person_id"] == "a" for e in out)
    assert len(unknowns) == 1


def test_stream_finals_have_absolute_times_and_score():
    emb = lambda w: np.array([1.0, 0.0])
    C = {"a": np.array([1.0, 0.0])}
    blk = lambda v: np.full(512, v, "float32")
    n = 4 * _SR // 512
    blocks = [blk(0.0)] * 10 + [blk(1)] * n + [blk(0.0)] * 10 + [blk(1)] * n + [blk(0.0)]
    ev = {10: "start", 10 + n: "end", 20 + n: "start", 20 + 2 * n: "end"}
    it = iter(range(len(blocks)))
    finals = [e for e in run(blocks, emb, C, 0.5, 0.05, lambda b: ev.get(next(it)))
              if e["type"] == "speaker_final"]
    assert len(finals) == 2
    assert finals[0]["start_ms"] == 10 * 512 * 1000 // _SR
    assert finals[1]["start_ms"] > finals[0]["end_ms"] > finals[0]["start_ms"]
    assert all(0 <= f["score"] <= 1 for f in finals)


from caretaker_speaker.replay import assign_words, build_utterances

F = [{"person_id": "a", "start_ms": 0, "end_ms": 4000, "score": 0.8},
     {"person_id": None, "start_ms": 5000, "end_ms": 8000, "score": 0.3}]
W = lambda w, s, e, p=0.9: {"word": w, "start": s, "end": e, "probability": p}


def test_assign_words_by_midpoint_and_drops_far_words():
    words = [W(" Hello", 0.2, 0.6), W(" there", 0.7, 1.0, 0.3), W(" you", 5.1, 5.5), W(" noise", 30, 31)]
    got = assign_words(F, words)
    assert got[0] == ("Hello there", 0.3, "there")
    assert got[1][0] == "you"


def test_build_utterances_shape_and_null_speaker():
    out = build_utterances(F, [("Hello", 0.9, "Hello"), ("you", 0.9, "you")], offset_s=120)
    assert [u["id"] for u in out] == ["u1", "u2"]
    assert out[0]["at"] == 120 and out[1]["at"] == 125
    assert out[0]["speakerId"] == "a" and out[1]["speakerId"] is None
    assert out[0]["speakerScore"] == 0.8
    assert out[0]["speakFor"] == 3.0 and out[1]["speakFor"] == 3.0  # capped: dots, not duration


def test_build_utterances_drops_empty_and_flags_low_confidence():
    out = build_utterances(F, [("", 1.0, None), ("maybe", 0.2, "maybe")], offset_s=0)
    assert [u["id"] for u in out] == ["u1"] and out[0]["text"] == "maybe"
    assert out[0]["lowConfidence"] is True and out[0]["uncertainWord"] == "maybe"
    ok = build_utterances(F[:1], [("fine", 0.9, "fine")], 0)[0]
    assert "lowConfidence" not in ok and "uncertainWord" not in ok


def test_build_utterances_empty():
    assert build_utterances([], [], 0) == []


from ml.eval.run_call import score_call

LAB = [(0, 4, "a"), (5, 9, "b"), (10, 14, "c")]
U = lambda at, p: {"at": at, "speakFor": 3, "speakerId": p}


def test_score_call_counts():
    r = score_call([U(0, "a"), U(5, None), U(10, "a")], LAB)
    assert (r["right"], r["someone_new"], r["wrong_name"], r["n"]) == (1 / 3, 1 / 3, 1 / 3, 3)


def test_score_call_stranger_named_is_wrong():
    assert score_call([U(0, "a")], [(0, 4, None)])["wrong_name"] == 1
    assert score_call([U(0, None)], [(0, 4, None)])["right"] == 1
