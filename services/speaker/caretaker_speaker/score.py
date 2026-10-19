"""Scoring: cosine similarity against enrolled centroids, then the open-set decision."""
import numpy as np


def cosine_scores(emb: np.ndarray, centroids: dict[str, np.ndarray]) -> dict[str, float]:
    """Embeddings and centroids are unit vectors, so cosine = dot product."""
    return {pid: float(emb @ c) for pid, c in centroids.items()}


def decide(scores: dict[str, float], tau: float, margin: float):
    """Return the person id, or None ("Someone new").

    Top-1 wins only if top1 > tau AND top1 - top2 > margin. Never guesses.
    With a single enrolled person there is no top2: only tau applies.
    TODO(Darren): implement.
    """
    raise NotImplementedError
