import numpy as np


def pick_threshold(target_scores, impostor_scores, max_wrong_name=0.02):
    """Pick tau from data.

    target_scores: top cosine score when the speaker IS enrolled.
    impostor_scores: top cosine score when the speaker is a stranger.
    Return (tau, stats): the tau with the lowest "Someone new" rate on enrolled
    speakers whose wrong-name rate (strangers scoring >= tau) is <= max_wrong_name.
    stats = {"wrong_name_rate", "someone_new_rate"}.
    Hint: sklearn.metrics.roc_curve(labels, scores) -> fpr, tpr, thresholds.
    """
    target_scores = np.asarray(target_scores)
    impostor_scores = np.asarray(impostor_scores)
    imp = np.sort(impostor_scores)[::-1]  # highest first
    n = len(imp)
    k = int(max_wrong_name * n)  # strangers we may name wrongly
    if k >= n:
        tau = float(imp.min())
    else:
        tau = float(np.nextafter(imp[k], np.inf))  # just above the (k+1)th highest stranger
    return tau, {"wrong_name_rate": float(np.mean(impostor_scores >= tau)),
                 "someone_new_rate": float(np.mean(target_scores < tau))}
