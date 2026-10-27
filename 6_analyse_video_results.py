#!/usr/bin/env python3
"""
6_analyse_video_results.py - shows WHAT the model confuses on the test videos.
Run after 5_test_videos.py (same folder):   python 6_analyse_video_results.py
Reads video_results/timelines/*.csv and prints:
  1) for each true class: what the 2-second windows were predicted as
  2) per video: the true class, the most common answers, average confidence
"""
import csv
from collections import Counter, defaultdict
from pathlib import Path

RESULTS_FOLDER = "video_results"
# must be the same as MERGE_GROUPS in 5_test_videos.py
MERGE_GROUPS = {
    "resting": ["sitting", "lying"],
    "moving": ["walking", "running"],
}


SPLIT_MOVING = True    # must be the same as in 5_test_videos.py


def merge(label):
    for out_name, members in MERGE_GROUPS.items():
        if SPLIT_MOVING and out_name == "moving":
            continue
        if label in members:
            return out_name
    return label


CLASSES = ["eating", "grooming", "resting", "walking", "running", "sleeping", "standing"] if SPLIT_MOVING \
    else ["eating", "grooming", "resting", "moving", "sleeping", "standing"]

tl = sorted((Path(RESULTS_FOLDER) / "timelines").glob("*.csv"))
if not tl:
    raise SystemExit("No timelines found. Run 5_test_videos.py first.")

by_class = defaultdict(Counter)
per_video = []
for p in tl:
    truth_raw = p.stem.split("_", 1)[0]
    truth = merge(truth_raw)
    rows = list(csv.DictReader(open(p)))
    c = Counter(r["behavior"] for r in rows)
    by_class[truth].update(c)
    conf = [float(r["confidence"]) for r in rows if r["behavior"] != "no cat"]
    per_video.append((truth_raw, p.stem.split("_", 1)[1], len(rows), c,
                      sum(conf) / len(conf) if conf else 0.0))

cols = CLASSES + ["no cat"]
print("WINDOWS: rows = TRUE class, columns = what the model said\n")
print(f"{'':<10}" + "".join(f"{c[:7]:>8}" for c in cols) + f"{'total':>7}")
for t in CLASSES:
    if t not in by_class:
        continue
    row = by_class[t]
    print(f"{t:<10}" + "".join(f"{row.get(c, 0):>8}" for c in cols) + f"{sum(row.values()):>7}")

print("\nPER VIDEO (true class | seconds | what it said | average confidence)")
for truth, name, n, c, conf in sorted(per_video):
    top = ", ".join(f"{k} {v}" for k, v in c.most_common(3))
    print(f"{truth:<9} {name[:28]:<28} {n * 2:>4}s  {top:<40} conf {conf:.2f}")
