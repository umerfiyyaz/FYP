#!/usr/bin/env python3
"""
5_test_videos.py - test the behavior model on whole videos it has never seen.

Folder layout (class name = folder name, one behavior per video):
    test_videos/eating/a.mp4 ...   test_videos/running/b.mp4 ...   (same 8 class names as training)

For every video: 5 frames/second -> find the cat -> crop -> classify -> average the answers
over 2-second windows (smoothing) -> one label per window -> one label for the whole video.
The model says "moving" for walking/running; the cat's SPEED then decides walking or running.
Then it compares with the folder name and prints everything in ONE run:
per-video results, per-class table, what-was-confused-with-what table, and the speed limit.

Run:   python 5_test_videos.py
Needs: pip install ultralytics opencv-python
"""

import csv
import zlib
import math
import sys
from collections import Counter
from pathlib import Path

import cv2
import numpy as np
from ultralytics import YOLO

VIDEO_EXTS = {".mp4", ".mov", ".avi", ".mkv", ".webm", ".m4v", ".mpg", ".mpeg", ".3gp"}
CAT_CLASS = 15            # "cat" in the ready-made COCO detector


def crop_cat(frame, box, pad):
    h, w = frame.shape[:2]
    x1, y1, x2, y2 = box
    px, py = (x2 - x1) * pad, (y2 - y1) * pad
    x1, y1 = max(0, int(x1 - px)), max(0, int(y1 - py))
    x2, y2 = min(w, int(x2 + px)), min(h, int(y2 + py))
    return frame[y1:y2, x1:x2], (x1, y1, x2, y2)


def debug_img(img, t):
    """Keep a small copy of about one image per second for the debug folder."""
    if not SAVE_DEBUG or int(round(t * SAMPLES_PER_SECOND)) % SAMPLES_PER_SECOND != 0:
        return None
    h, w = img.shape[:2]
    sc = 360 / max(h, w)
    return cv2.resize(img, (max(1, int(w * sc)), max(1, int(h * sc)))) if sc < 1 else img.copy()


def save_debug(out_dir, samples, names):
    """One jpg per second: the picture the classifier saw (or the full frame if no cat was found)."""
    out_dir.mkdir(parents=True, exist_ok=True)
    n = 0
    for s in samples:
        if s.get("crop") is None or n >= 40:
            continue
        if s["probs"] is None:
            label, conf = "NOCAT", 0.0
        else:
            k = int(s["probs"].argmax())
            label, conf = names[k], float(s["probs"][k])
        ok, buf = cv2.imencode(".jpg", s["crop"])
        if ok:
            (out_dir / f"{int(s['t']):03d}s_{label}_{conf:.2f}.jpg").write_bytes(buf.tobytes())
            n += 1


def analyse_video(path, detector, classifier, names):
    """Returns (list of per-sample dicts, duration seconds)."""
    cap = cv2.VideoCapture(str(path))
    fps = cap.get(cv2.CAP_PROP_FPS)
    if not fps or fps != fps or fps < 1 or fps > 240:
        fps = 30.0
    step = max(1, round(fps / SAMPLES_PER_SECOND))

    frames, times, grays, idx = [], [], [], 0
    while True:
        if not cap.grab():
            break
        if idx % step == 0:
            ok, fr = cap.retrieve()
            if ok:
                frames.append(fr)
                times.append(idx / fps)
                grays.append(small_gray(fr))
        idx += 1
    cap.release()
    duration = idx / fps

    samples = []
    for i in range(0, len(frames), 16):
        batch, btimes = frames[i:i + 16], times[i:i + 16]
        dets = detector.predict(batch, classes=[CAT_CLASS], conf=DETECT_CONF, verbose=False)
        crops, meta = [], []
        for k, (fr, t, d) in enumerate(zip(batch, btimes, dets)):
            fi = i + k
            boxes = d.boxes.xyxy.cpu().numpy() if d.boxes is not None and len(d.boxes) else []
            if len(boxes) == 0:
                samples.append({"t": t, "i": fi, "probs": None, "box": None, "crop": debug_img(fr, t)})
                continue
            b = max(boxes, key=lambda b: (b[2] - b[0]) * (b[3] - b[1]))
            crop, bb = crop_cat(fr, b, PAD)
            if min(crop.shape[:2]) < MIN_CROP_SIDE:
                samples.append({"t": t, "i": fi, "probs": None, "box": None, "crop": debug_img(fr, t)})
                continue
            crops.append(crop)
            meta.append((t, fi, bb, debug_img(crop, t)))
        if crops:
            res = classifier.predict(crops, imgsz=IMAGE_SIZE, verbose=False)
            for (t, fi, bb, dbg), r in zip(meta, res):
                p = r.probs.data.cpu().numpy()
                samples.append({"t": t, "i": fi, "probs": p, "box": bb, "crop": dbg})
    samples.sort(key=lambda s: s["t"])
    if CAMERA_COMPENSATION:
        add_camera_motion(samples, grays, frames[0].shape[:2] if frames else (1, 1))
    return samples, duration


def small_gray(frame):
    """Small grey copy of a frame (longest side 320 px), used only to measure camera movement."""
    h, w = frame.shape[:2]
    sc = 320 / max(h, w)
    g = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    return cv2.resize(g, (max(1, int(w * sc)), max(1, int(h * sc)))) if sc < 1 else g


def background_motion(g0, g1, box0, box1, full_hw):
    """How the BACKGROUND moved from picture 0 to picture 1 (camera pan / zoom / shake).
    Returns a 2x3 matrix (in full-picture pixels) that says: a point of the background that was at
    (x, y) in picture 0 is now at M @ (x, y, 1) in picture 1. None = could not measure."""
    sc = g0.shape[1] / full_hw[1]
    mask = np.full(g0.shape, 255, np.uint8)
    for bx in (box0, box1):                      # ignore the cat itself (it moves on its own)
        if bx is not None:
            w_, h_ = bx[2] - bx[0], bx[3] - bx[1]
            x1, y1 = int((bx[0] - 0.2 * w_) * sc), int((bx[1] - 0.2 * h_) * sc)
            x2, y2 = int((bx[2] + 0.2 * w_) * sc), int((bx[3] + 0.2 * h_) * sc)
            mask[max(0, y1):max(0, y2), max(0, x1):max(0, x2)] = 0
    p0 = cv2.goodFeaturesToTrack(g0, maxCorners=250, qualityLevel=0.01, minDistance=8, mask=mask)
    if p0 is None or len(p0) < 12:
        return None
    p1, st, _ = cv2.calcOpticalFlowPyrLK(g0, g1, p0, None, winSize=(21, 21), maxLevel=3)
    if p1 is None:
        return None
    ok = st.reshape(-1) == 1
    if ok.sum() < 12:
        return None
    a, b = p0.reshape(-1, 2)[ok], p1.reshape(-1, 2)[ok]
    m, inl = cv2.estimateAffinePartial2D(a, b, method=cv2.RANSAC, ransacReprojThreshold=2.0)
    if m is None or inl is None or int(inl.sum()) < 10 or inl.mean() < 0.5:
        return None
    m = m.copy()
    m[:, 2] /= sc                                 # small-picture pixels -> full-picture pixels
    return m


def add_camera_motion(samples, grays, full_hw):
    """For each sample, measure how the background moved since the previous sample (sample["cam"])."""
    prev = None
    for s in samples:
        s["cam"] = None
        if prev is not None and s["i"] - prev["i"] == 1:
            try:
                s["cam"] = background_motion(grays[prev["i"]], grays[s["i"]], prev["box"], s["box"], full_hw)
            except cv2.error:
                s["cam"] = None
        prev = s


def window_speed(samples, t0, t1, compensate=True):
    """How fast the cat moved in this window, in BODY LENGTHS PER SECOND (median).
    The camera's own movement is subtracted: where the cat would be if it stood still in the room
    (it moves with the background) is compared with where it really is. If the camera movement
    cannot be measured for a pair of pictures, that pair is skipped. None = not enough data."""
    got = [s for s in samples if t0 <= s["t"] < t1 and s["box"] is not None]
    speeds = []
    for a, b in zip(got, got[1:]):
        dt = b["t"] - a["t"]
        if dt <= 0 or dt > 0.6:
            continue
        ba, bb = a["box"], b["box"]
        ca = ((ba[0] + ba[2]) / 2, (ba[1] + ba[3]) / 2)
        cb = ((bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2)
        if compensate and CAMERA_COMPENSATION:
            m = b.get("cam")
            if m is None or b["i"] - a["i"] != 1:     # camera movement is measured picture-to-picture
                continue
            ca = (m[0, 0] * ca[0] + m[0, 1] * ca[1] + m[0, 2], m[1, 0] * ca[0] + m[1, 1] * ca[1] + m[1, 2])
        size = (max(ba[2] - ba[0], ba[3] - ba[1]) + max(bb[2] - bb[0], bb[3] - bb[1])) / 2
        if size <= 0:
            continue
        speeds.append(math.hypot(cb[0] - ca[0], cb[1] - ca[1]) / size / dt)
    return float(np.median(speeds)) if len(speeds) >= 2 else None


def windows(samples, duration, names):
    """2-second windows: average the probabilities of the samples that have a cat.
    Returns a list of (from, to, label, confidence, speed, separate_label).
    label = what the app shows (sitting+lying = resting). separate_label = same, but sitting
    and lying kept apart, so you can see which of them is weak. 'moving' is split later by speed."""
    out = []
    n_win = max(1, int(np.ceil(duration / WINDOW_SECONDS)))
    for w in range(n_win):
        t0, t1 = w * WINDOW_SECONDS, (w + 1) * WINDOW_SECONDS
        got = [s["probs"] for s in samples if t0 <= s["t"] < t1 and s["probs"] is not None]
        if not got:
            out.append((t0, t1, None, 0.0, None, None))
            continue
        avg = np.mean(got, axis=0)
        grouped, grouped_d = {}, {}
        for name, pr in zip(names, avg):
            grouped[merge_model(name)] = grouped.get(merge_model(name), 0.0) + float(pr)
            grouped_d[merge_model_d(name)] = grouped_d.get(merge_model_d(name), 0.0) + float(pr)
        spd_cam = window_speed(samples, t0, t1)              # camera movement removed
        if spd_cam is None:
            STATS["speed_unknown"] += 1
        # plain background (camera cannot be measured): use the raw speed for walking/running only,
        # but never to decide "the cat is still" (a camera that follows the cat would fool it)
        spd = spd_cam if spd_cam is not None else window_speed(samples, t0, t1, compensate=False)
        if STILL_SPEED and spd_cam is not None and spd_cam < STILL_SPEED:
            # the cat did not move (camera movement already subtracted): it cannot be walking/running
            still_g = {k: v for k, v in grouped.items() if k not in MOVING_LABELS}
            still_d = {k: v for k, v in grouped_d.items() if k not in MOVING_LABELS}
            if still_g and max(grouped, key=grouped.get) in MOVING_LABELS:
                STATS["vetoed"] += 1
                grouped, grouped_d = still_g, still_d
        best = max(grouped, key=grouped.get)
        best_d = max(grouped_d, key=grouped_d.get)
        out.append((t0, t1, best, grouped[best], spd, best_d))
    return out


def apply_speed_rule(wins, thr):
    """The speed rule: a 'moving' window is running if fast, walking if slow (or speed unknown)."""
    def fix(lab, spd):
        if lab == "moving" and SPLIT_MOVING:
            return "running" if (spd is not None and spd >= thr) else "walking"
        return lab
    return [(t0, t1, fix(lab, spd), conf, spd, fix(dlab, spd)) for t0, t1, lab, conf, spd, dlab in wins]


def find_speed_limit(results):
    """Speeds of 'moving' windows from your walking/ and running/ folders -> best limit."""
    sp = {"walking": [], "running": []}
    for r in results:
        if r["truth"] in sp:
            sp[r["truth"]] += [w[4] for w in r["wins"] if w[2] == "moving" and w[4] is not None]
    w, r_ = np.array(sp["walking"]), np.array(sp["running"])
    print("\nSPEED (body lengths per second) of windows the model called 'moving':")
    for name, arr in (("walking videos", w), ("running videos", r_)):
        if len(arr) == 0:
            print(f"  {name}: no data")
        else:
            q = np.percentile(arr, [10, 50, 90])
            print(f"  {name}: {len(arr):>3} windows | 10%={q[0]:.2f}  median={q[1]:.2f}  90%={q[2]:.2f}")
    if len(w) < MIN_WINDOWS_FOR_AUTO or len(r_) < MIN_WINDOWS_FOR_AUTO:
        return None
    best = None
    for thr in np.arange(0.2, 6.01, 0.05):
        bal = (float((w < thr).mean()) + float((r_ >= thr).mean())) / 2
        if best is None or bal > best[0] + 1e-9:
            best = (bal, float(thr))
    return best[1], best[0]


MOVING_LABELS = {"moving", "walking", "running"}
STATS = {"vetoed": 0, "speed_unknown": 0}


def safe(stem):
    return "".join(ch if ch.isalnum() or ch in "-_" else "-" for ch in stem)[:40]


def merge_model(label):
    """Groups used to add probabilities BEFORE choosing the answer."""
    for out_name, members in MERGE_GROUPS.items():
        if label in members:
            return out_name
    return label


def scoring_groups():
    """Groups used when checking right/wrong. With the speed rule on, walking and
    running are scored separately again."""
    return {k: v for k, v in MERGE_GROUPS.items() if not (SPLIT_MOVING and k == "moving")}


def merge(label):
    for out_name, members in scoring_groups().items():
        if label in members:
            return out_name
    return label


def merge_model_d(label):
    """Like merge_model, but sitting and lying are NOT merged (diagnostic view)."""
    for out_name, members in MERGE_GROUPS.items():
        if out_name != "resting" and label in members:
            return out_name
    return label


def merge_d(label):
    """Like merge, but sitting and lying are NOT merged (diagnostic view)."""
    for out_name, members in scoring_groups().items():
        if out_name != "resting" and label in members:
            return out_name
    return label


def class_table(title, rows, mfn):
    print("\n" + "=" * 70)
    print(title)
    print(f"{'class':<10} {'videos':>6} {'video right':>12} {'windows right':>14}")
    tot_v = tot_vok = tot_w = tot_wok = 0
    for cls in sorted({mfn(r["truth"]) for r in rows}):
        rs = [r for r in rows if mfn(r["truth"]) == cls]
        vok = sum(mfn(r["predicted"]) == mfn(cls) for r in rs)
        w = sum(int(r["windows"]) for r in rs)
        wok = sum(int(r["windows_correct"]) for r in rs)
        print(f"{cls:<10} {len(rs):>6} {vok:>6} ({100 * vok / len(rs):3.0f}%) "
              f"{wok:>7}/{w:<5}({100 * wok / max(w, 1):3.0f}%)")
        tot_v += len(rs); tot_vok += vok; tot_w += w; tot_wok += wok
    print("-" * 62)
    print(f"{'ALL':<10} {tot_v:>6} {tot_vok:>6} ({100 * tot_vok / tot_v:3.0f}%) "
          f"{tot_wok:>7}/{tot_w:<5}({100 * tot_wok / max(tot_w, 1):3.0f}%)")


def confusion_table(title, conf_tab):
    order = ["eating", "grooming", "lying", "sitting", "resting", "walking", "running", "moving", "sleeping", "standing"]
    seen = {c for row in conf_tab.values() for c in row}
    cols = [c for c in order if c in seen] + sorted(c for c in seen if c not in order and c != "no cat")
    if "no cat" in seen:
        cols.append("no cat")
    print("\n" + title + "\n")
    print(f"{'':<10}" + "".join(f"{c[:7]:>8}" for c in cols) + f"{'total':>7}")
    for t in [c for c in order if c in conf_tab] + sorted(c for c in conf_tab if c not in order):
        row = conf_tab[t]
        print(f"{t:<10}" + "".join(f"{row.get(c, 0):>8}" for c in cols) + f"{sum(row.values()):>7}")


def main():
    root = Path(TEST_FOLDER)
    if not root.is_dir():
        sys.exit(f"Test folder not found: {root}")
    if not Path(WEIGHTS).is_file():
        sys.exit(f"Model file not found: {WEIGHTS}")

    detector = YOLO(DETECTOR)
    classifier = YOLO(WEIGHTS)
    names = classifier.names
    names = [names[i] for i in range(len(names))]

    out = Path(RESULTS_FOLDER)
    (out / "timelines").mkdir(parents=True, exist_ok=True)

    # ---- pass 1: look at every video ----
    results = []
    for cls_dir in sorted(p for p in root.iterdir() if p.is_dir()):
        truth = cls_dir.name
        if truth not in names:
            print(f"  skipped folder (not a trained class): {truth}")
            continue
        for vp in sorted(p for p in cls_dir.iterdir() if p.suffix.lower() in VIDEO_EXTS):
            samples, dur = analyse_video(vp, detector, classifier, names)
            results.append(dict(truth=truth, vp=vp, samples=samples, dur=dur,
                                wins=windows(samples, dur, names)))
            print(f"  analysed {truth}/{vp.name}")
    if not results:
        sys.exit("No videos found. Put them in test_videos/<class>/")

    # ---- the speed limit ----
    thr, note = RUN_SPEED, f"fixed value RUN_SPEED = {RUN_SPEED}"
    if SPLIT_MOVING:
        found = find_speed_limit(results)
        if AUTO_SPEED_LIMIT and found:
            thr = found[0]
            note = (f"found automatically = {thr:.2f} ({100 * found[1]:.0f}% of walking/running windows on the right "
                    f"side). It was tuned on THESE clips, so the walking/running score is a bit optimistic.")
        elif AUTO_SPEED_LIMIT:
            note = (f"not enough walking/running windows to tune it (need {MIN_WINDOWS_FOR_AUTO} of each); "
                    f"using the fixed value {RUN_SPEED}")
        print(f"  speed limit used: {note}")

    # ---- pass 2: final labels, scores, files ----
    print("\nRESULT PER VIDEO")
    rows, rows_d, conf_tab, conf_tab_d, per_video = [], [], {}, {}, []
    for r in results:
        truth, vp, samples, dur = r["truth"], r["vp"], r["samples"], r["dur"]
        wins = apply_speed_rule(r["wins"], thr)
        labelled = [w for w in wins if w[2] is not None]
        for w in wins:
            row = conf_tab.setdefault(merge(truth), {})
            row[w[2] or "no cat"] = row.get(w[2] or "no cat", 0) + 1
            row_d = conf_tab_d.setdefault(merge_d(truth), {})
            row_d[w[5] or "no cat"] = row_d.get(w[5] or "no cat", 0) + 1
        if not labelled:
            print(f"  [WRONG] {truth}/{vp.name}: no cat found in the whole video")
            base = dict(truth=truth, predicted="NO CAT", windows=len(wins), windows_correct=0)
            rows.append(dict(video=f"{truth}/{vp.name}", **base, window_acc="0.00",
                             no_cat_pct="100", seconds=f"{dur:.1f}", predicted_separate="NO CAT"))
            rows_d.append(dict(base))
            continue
        votes = Counter(w[2] for w in labelled)
        votes_d = Counter(w[5] for w in labelled)
        pred, pred_d = votes.most_common(1)[0][0], votes_d.most_common(1)[0][0]
        ok_w = sum(merge(w[2]) == merge(truth) for w in labelled)
        ok_w_d = sum(merge_d(w[5]) == merge_d(truth) for w in labelled)
        no_cat = 100 * (len(wins) - len(labelled)) / len(wins)
        rows.append(dict(video=f"{truth}/{vp.name}", truth=truth, predicted=pred,
                         windows=len(wins), windows_correct=ok_w,
                         window_acc=f"{ok_w / len(labelled):.2f}",
                         no_cat_pct=f"{no_cat:.0f}", seconds=f"{dur:.1f}", predicted_separate=pred_d))
        rows_d.append(dict(truth=truth, predicted=pred_d, windows=len(wins), windows_correct=ok_w_d))
        per_video.append((truth, vp.name, dur, votes_d if SHOW_SITTING_LYING_SEPARATE else votes, float(np.mean([w[3] for w in labelled]))))
        if SAVE_DEBUG:
            # long names get cut, so add the length and a short code: every video gets its own folder
            tag = f"{safe(vp.stem)[:25]}_{dur:.0f}s_{zlib.crc32(vp.name.encode()) % 10000:04d}"
            save_debug(out / "debug" / f"{truth}_{tag}", samples, names)
        with open(out / "timelines" / f"{truth}_{vp.stem}.csv", "w", newline="") as f:
            wr = csv.writer(f)
            wr.writerow(["from_s", "to_s", "behavior", "confidence", "speed_body_lengths_per_s", "sitting_lying_separate"])
            for t0, t1, lab, conf, spd, dlab in wins:
                wr.writerow([t0, t1, lab or "no cat", f"{conf:.2f}", "" if spd is None else f"{spd:.2f}", dlab or "no cat"])
        flag = "OK   " if merge(pred) == merge(truth) else "WRONG"
        print(f"  [{flag}] {truth}/{vp.name}: predicted {pred}  "
              f"({ok_w}/{len(labelled)} windows right, no cat {no_cat:.0f}%)")

    with open(out / "video_results.csv", "w", newline="") as f:
        wr = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        wr.writeheader()
        wr.writerows(rows)

    # ---- the main tables (what the app shows) ----
    class_table("PER CLASS  (merged outputs: " + ", ".join(
        f"{'+'.join(v)}={k}" for k, v in scoring_groups().items()) + ")", rows, merge)
    confusion_table("WINDOWS: rows = TRUE class, columns = what the model said", conf_tab)

    # ---- the diagnostic tables: sitting and lying kept apart ----
    if SHOW_SITTING_LYING_SEPARATE:
      class_table("SAME RESULTS WITH SITTING AND LYING SEPARATE  (to see which one is weak)", rows_d, merge_d)
      confusion_table("WINDOWS (sitting and lying separate): rows = TRUE class, columns = what the model said", conf_tab_d)

    # ---- per video ----
    print("\nPER VIDEO (true class | seconds | what it said | average confidence)")
    for truth, name, dur, votes, conf in sorted(per_video, key=lambda x: (x[0], x[1])):
        top = ", ".join(f"{k} {v}" for k, v in votes.most_common(3))
        print(f"{truth:<9} {name[:28]:<28} {dur:>4.0f}s  {top:<40} conf {conf:.2f}")
    print(f"\nCamera/speed check: {STATS['vetoed']} windows were changed from walking/running to a still "
          f"behavior because the cat did not move; camera movement could not be measured in {STATS['speed_unknown']} windows "
          f"(plain background): there the plain speed is used and no 'cat is still' check is made.")
    print(f"\nSaved in: {out}/  (video_results.csv, timelines/, debug/)")


# =====================  CHANGE THESE IF NEEDED  =====================
TEST_FOLDER = "test_videos_2"          # test_videos/<class>/<videos>
WEIGHTS = "behavior_best_v3.pt"      # your trained behavior model (v2)
DETECTOR = "yolov8m.pt"              # same cat finder as in training
DETECT_CONF = 0.15
PAD = 0.10
MIN_CROP_SIDE = 64
IMAGE_SIZE = 224
SAMPLES_PER_SECOND = 5               # look at 5 frames every second
WINDOW_SECONDS = 2                   # smoothing: one answer per 2 seconds
RESULTS_FOLDER = "video_results_v3"
SAVE_DEBUG = True                    # save ~1 picture per second in video_results/debug/ (see what the model saw)
# --- the SPEED RULE: walking vs running -------------------------------------------
CAMERA_COMPENSATION = True   # subtract the camera's own movement (pan/zoom/shake) from the cat's speed
STILL_SPEED = 0.10           # cat moved less than this (body lengths/s, camera removed) -> NOT walking/running. 0 = off
SPLIT_MOVING = False       # False: walking+running = ONE output "moving" (the 6 app classes). True: speed splits walking/running
SHOW_SITTING_LYING_SEPARATE = False   # True: also print tables with sitting and lying apart (to see which one is weak)
AUTO_SPEED_LIMIT = True    # True: find the best speed limit from your walking/ and running/ test videos
RUN_SPEED = 0.50           # body lengths per second; used when AUTO is off or there is too little data
MIN_WINDOWS_FOR_AUTO = 3   # walking and running windows needed before the limit is tuned
# classes that become ONE output (their probabilities are added before choosing the answer)
MERGE_GROUPS = {
    "resting": ["sitting", "lying"],
    "moving": ["walking", "running"],
}
# =====================================================================

if __name__ == "__main__":
    main()
