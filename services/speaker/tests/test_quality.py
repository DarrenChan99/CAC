import numpy as np

from caretaker_speaker.audio import SR
from caretaker_speaker.record import quality

rng = np.random.default_rng(0)


def tone(sec, amp):
    t = np.arange(int(sec * SR)) / SR
    return (amp * np.sin(2 * np.pi * 180 * t) * (1 + 0.3 * rng.standard_normal(len(t)))).astype("float32")


def soft_speech():
    """6 s in a very quiet room (-64 dB) with ~3.5 s of soft speech (-40 dB) and pauses.
    The old fixed thresholds (rms > 0.01 / p95 >= 0.02) rejected this as too quiet."""
    x = (0.0006 * rng.standard_normal(6 * SR)).astype("float32")
    for a, b in [(0.5, 1.8), (2.3, 3.6), (4.1, 5.0)]:
        i, j = int(a * SR), int(b * SR)
        x[i:j] += tone((j - i) / SR, 0.014)
    return x


def test_quality():
    assert quality(np.zeros(5 * SR, "float32"))[0] == "silent"
    assert quality(tone(5, 0.005))[0] == "too quiet"
    assert quality(np.clip(tone(5, 3.0), -1, 1))[0] == "clipped"
    assert quality(tone(1.5, 0.2))[0] == "too short"
    assert quality(tone(5, 0.2))[0] is None


def test_soft_speech_in_quiet_room_passes():
    reason, stats = quality(soft_speech())
    assert reason is None, (reason, stats)
    assert 3.0 <= stats["speech_s"] <= 4.5
