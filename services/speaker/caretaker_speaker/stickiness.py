"""Stickiness: hysteresis so speaker labels don't flicker (SPEC: switch only after
2 consecutive windows agree, or at utterance end)."""


class Smoother:
    """State: current (label shown), candidate (disagreeing label), streak (int).
    A label is a person id (str) or None (unknown); None is a real value, so compare with ==."""

    def __init__(self):
        self.current = None
        self.candidate = None
        self.streak = 0

    def update(self, label, utterance_ended: bool = False):
        """Feed one window's label; returns the label to SHOW."""
        if label == self.current:
            self.candidate, self.streak = None, 0
            return self.current
        if label == self.candidate:
            self.streak += 1
        else:
            self.candidate, self.streak = label, 1
        if self.streak >= 2 or utterance_ended:
            self.current = self.candidate
            self.candidate, self.streak = None, 0
        return self.current
