"""Plain-English charts for judges. Axes say what a person would say."""
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

OUT = Path(__file__).parent / "out"
OUT.mkdir(exist_ok=True)


def chart1(someone_new, wrong_name, chosen=None):
    fig, ax = plt.subplots(figsize=(6, 4))
    ax.plot(someone_new, wrong_name, lw=2)
    if chosen:
        ax.scatter(*chosen, color="C3", zorder=3, s=60)
        ax.annotate("our setting", chosen, xytext=(8, 8), textcoords="offset points")
    ax.set_xlabel('How often it says "Someone new" for a family member (%)')
    ax.set_ylabel("How often it names the wrong person (%)")
    ax.set_title("Saying \"Someone new\" instead of guessing")
    ax.set_xlim(0, 30)
    ax.grid(alpha=.3)
    fig.tight_layout(); fig.savefig(OUT / "chart1.png", dpi=200); plt.close(fig)


def chart2(seconds, correct):
    fig, ax = plt.subplots(figsize=(6, 4))
    ax.plot(seconds, correct, marker="o", lw=2)
    ax.set_xlabel("Seconds of voice recorded when joining the family")
    ax.set_ylabel("Names the right person (%)")
    ax.set_ylim(0, 100); ax.set_title("How much voice does it need?")
    ax.grid(alpha=.3)
    fig.tight_layout(); fig.savefig(OUT / "chart2.png", dpi=200); plt.close(fig)
