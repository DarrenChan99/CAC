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
