import numpy as np


def pick_threshold(target_scores, impostor_scores, max_wrong_name=0.02):
    """Pick tau from data.

    target_scores: top cosine score when the speaker IS enrolled.
    impostor_scores: top cosine score when the speaker is a stranger.
    Return (tau, stats): the tau with the lowest "Someone new" rate on enrolled
    speakers whose wrong-name rate (strangers scoring >= tau) is <= max_wrong_name.
    stats = {"wrong_name_rate", "someone_new_rate"}.
    Hint: sklearn.metrics.roc_curve(labels, scores) -> fpr, tpr, thresholds.
    TODO(Darren): implement.
    """
    raise NotImplementedError
