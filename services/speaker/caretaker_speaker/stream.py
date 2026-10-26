"""Live loop (SPEC 6.1): audio blocks -> VAD -> rolling 2 s window -> embed -> decide -> smooth.

Pure generator: embed and vad are injected so the logic is testable without the model.
Yields spec data-channel dicts: "speaker" every 1 s while talking, "speaker_final" at utterance end.
"""
from collections import deque

import numpy as np

from .audio import SR
from .score import cosine_scores, decide
from .stickiness import Smoother

WIN = 2 * SR      # window the embedder sees
HOP = 1 * SR      # score every second
MAX_UTT = 15 * SR  # spec: force-split long utterances


def silero_vad():
    """Block (512 samples) -> "start" | "end" | None. min silence 500 ms ends an utterance."""
    import torch
    from silero_vad import VADIterator, load_silero_vad
    it = VADIterator(load_silero_vad(), sampling_rate=SR, min_silence_duration_ms=500)

    def vad(block):
        r = it(torch.from_numpy(block))  # None, {"start": n} or {"end": n}
        return None if r is None else ("start" if "start" in r else "end")
    return vad


def run(blocks, embed, centroids, tau, margin, vad, unknowns=None):
    """unknowns: optional list; embeddings of utterances decide() called "Someone new" are appended."""
    smoother, recent, utt, since_hop, n_utt = Smoother(), deque(maxlen=WIN), [], 0, 0
    speaking, seen, start = False, 0, 0  # seen = samples before this block

    def label(wav):
        e = embed(wav)
        scores = cosine_scores(e, centroids)
        return decide(scores, tau, margin), e, max(scores.values(), default=0.0)

    def finish():
        nonlocal speaking, utt, since_hop, n_utt
        wav = np.concatenate(utt)
        person, e, score = label(wav)
        if person is None and unknowns is not None:
            unknowns.append(e)
        shown = smoother.update(person, utterance_ended=True)
        n_utt += 1
        speaking, utt, since_hop = False, [], 0
        start_ms = 1000 * start // SR
        return {"type": "speaker_final", "utt_id": n_utt, "person_id": shown, "score": score,
                "start_ms": start_ms, "end_ms": start_ms + 1000 * len(wav) // SR}

    for b in blocks:
        recent.extend(b)
        event = vad(b)
        seen += len(b)
        if event == "start":
            speaking, utt, since_hop, start = True, [b], 0, seen - len(b)
            continue
        if not speaking:
            continue
        utt.append(b)
        since_hop += len(b)
        if event == "end" or sum(map(len, utt)) >= MAX_UTT:
            yield finish()
        elif since_hop >= HOP and len(recent) >= WIN:
            since_hop = 0
            person, _, _ = label(np.array(recent, dtype="float32"))
            yield {"type": "speaker", "utt_id": n_utt + 1, "person_id": smoother.update(person)}
    if speaking and utt:  # the recording ended mid-sentence: still a turn
        yield finish()
