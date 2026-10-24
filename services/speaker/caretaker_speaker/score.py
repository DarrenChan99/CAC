"""Scoring: cosine similarity against enrolled centroids, then the open-set decision."""
import numpy as np


def cosine_scores(emb: np.ndarray, centroids: dict[str, np.ndarray]) -> dict[str, float]:
    """Embeddings and centroids are unit vectors, so cosine = dot product."""
    return {pid: float(emb @ c) for pid, c in centroids.items()}


def decide(scores: dict[str, float], tau: float, margin: float):
    """Return the person id, or None ("Someone new").

    Top-1 wins only if top1 > tau AND top1 - top2 > margin. Never guesses.
    With a single enrolled person there is no top2: only tau applies.
    """
    if not scores:
        return None
    ranked = sorted(scores.items(), key=lambda kv: kv[1], reverse=True)  # [(id, score)], best first
    best_id, best = ranked[0]
    if best <= tau:
        return None  # too weak a match
    if len(ranked) > 1 and best - ranked[1][1] <= margin:
        return None  # too close to call
    return best_id
