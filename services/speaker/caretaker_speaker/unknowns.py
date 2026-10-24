"""Group embeddings of unknown speakers so one stranger becomes one "Someone new"
person (feeds Enroll), not many."""
import numpy as np


def cluster_unknowns(embeddings, join_threshold):
    """One-pass clustering of embeddings from utterances where decide() returned None.

    embeddings: list of 1-D unit-length np.ndarray (same kind as `emb` in score.py).
    Returns: list of {"centroid": unit np.ndarray, "members": list of np.ndarray}.
    ponytail: order-dependent, no re-merge of clusters; fine for a few unknown voices,
    swap in sklearn AgglomerativeClustering if it over/under-splits.
    """
    clusters = []
    for emb in embeddings:
        scores = [float(emb @ c["centroid"]) for c in clusters]  # dot = cosine (unit vectors)
        if scores and max(scores) >= join_threshold:
            c = clusters[int(np.argmax(scores))]
            c["members"].append(emb)
            m = np.mean(c["members"], axis=0)
            c["centroid"] = m / np.linalg.norm(m)
        else:
            clusters.append({"centroid": emb, "members": [emb]})
    return clusters
