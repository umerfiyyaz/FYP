#!/usr/bin/env python3
"""
test_unlabeled_videos.py - Test cat behavior model on unlabeled videos in a folder.

Folder setup:
    multi_video_test/
        video1.mp4
        cat_playing.mov
        my_cat.avi

Output:
    - Printed timeline breakdown (e.g., 0.0s to 8.0s: grooming, 8.0s to 15.0s: running)
    - Whole-video summary (e.g., "Cat is running throughout the video")
    - Saved CSV timelines and summary report in multi_video_results/

Run:
    python test_unlabeled_videos.py
"""

import csv
import math
import sys
from collections import Counter
from pathlib import Path

import cv2
import numpy as np
from ultralytics import YOLO


def crop_cat(frame, box, pad):
    """Crops the cat bounding box from the frame with padding."""
    h, w = frame.shape[:2]
    x1, y1, x2, y2 = box
    px, py = (x2 - x1) * pad, (y2 - y1) * pad
    x1, y1 = max(0, int(x1 - px)), max(0, int(y1 - py))
    x2, y2 = min(w, int(x2 + px)), min(h, int(y2 + py))
    return frame[y1:y2, x1:x2], (x1, y1, x2, y2)


def small_gray(frame):
    """Generates a small grayscale copy of the frame for optical flow."""
    h, w = frame.shape[:2]
    sc = 320 / max(h, w)
    g = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    return cv2.resize(g, (max(1, int(w * sc)), max(1, int(h * sc)))) if sc < 1 else g


def background_motion(g0, g1, box0, box1, full_hw):
    """Estimates 2D affine transform of background motion between frames."""
    sc = g0.shape[1] / full_hw[1]
    mask = np.full(g0.shape, 255, np.uint8)
    for bx in (box0, box1):
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
    m[:, 2] /= sc
    return m


def add_camera_motion(samples, grays, full_hw):
    """Computes camera motion vector for each consecutive frame pair."""
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
    """Calculates median speed in body lengths per second within a time window."""
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
            if m is None or b["i"] - a["i"] != 1:
                continue
            ca = (m[0, 0] * ca[0] + m[0, 1] * ca[1] + m[0, 2], m[1, 0] * ca[0] + m[1, 1] * ca[1] + m[1, 2])
        size = (max(ba[2] - ba[0], ba[3] - ba[1]) + max(bb[2] - bb[0], bb[3] - bb[1])) / 2
        if size <= 0:
            continue
        speeds.append(math.hypot(cb[0] - ca[0], cb[1] - ca[1]) / size / dt)
    return float(np.median(speeds)) if len(speeds) >= 2 else None


def merge_label(label):
    """Maps raw model classes to output groups."""
    for out_name, members in MERGE_GROUPS.items():
        if label in members:
            return out_name
    return label


def analyse_video(path, detector, classifier, names):
    """Extracts frame crops, runs detection and classification."""
    cap = cv2.VideoCapture(str(path))
    fps = cap.get(cv2.CAP_PROP_FPS)
    if not fps or math.isnan(fps) or fps < 1 or fps > 240:
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
                samples.append({"t": t, "i": fi, "probs": None, "box": None})
                continue
            b = max(boxes, key=lambda b: (b[2] - b[0]) * (b[3] - b[1]))
            crop, bb = crop_cat(fr, b, PAD)
            if min(crop.shape[:2]) < MIN_CROP_SIDE:
                samples.append({"t": t, "i": fi, "probs": None, "box": None})
                continue
            crops.append(crop)
            meta.append((t, fi, bb))
        if crops:
            res = classifier.predict(crops, imgsz=IMAGE_SIZE, verbose=False)
            for (t, fi, bb), r in zip(meta, res):
                p = r.probs.data.cpu().numpy()
                samples.append({"t": t, "i": fi, "probs": p, "box": bb})
                
    samples.sort(key=lambda s: s["t"])
    if CAMERA_COMPENSATION:
        add_camera_motion(samples, grays, frames[0].shape[:2] if frames else (1, 1))
    return samples, duration


def compute_windows(samples, duration, names):
    """Groups frame predictions into smoothed time windows."""
    out = []
    n_win = max(1, int(np.ceil(duration / WINDOW_SECONDS)))
    moving_labels = {"moving", "walking", "running"}
    
    for w in range(n_win):
        t0, t1 = w * WINDOW_SECONDS, min((w + 1) * WINDOW_SECONDS, duration)
        got = [s["probs"] for s in samples if t0 <= s["t"] < t1 and s["probs"] is not None]
        if not got:
            out.append((t0, t1, None, 0.0, None))
            continue
        avg = np.mean(got, axis=0)
        grouped = {}
        for name, pr in zip(names, avg):
            m_name = merge_label(name)
            grouped[m_name] = grouped.get(m_name, 0.0) + float(pr)
            
        spd_cam = window_speed(samples, t0, t1)
        spd = spd_cam if spd_cam is not None else window_speed(samples, t0, t1, compensate=False)
        
        if STILL_SPEED and spd_cam is not None and spd_cam < STILL_SPEED:
            still_g = {k: v for k, v in grouped.items() if k not in moving_labels}
            if still_g and max(grouped, key=grouped.get) in moving_labels:
                grouped = still_g
                
        best = max(grouped, key=grouped.get)
        
        # Apply speed split logic for walking vs running
        final_label = best
        if best == "moving" and SPLIT_MOVING:
            final_label = "running" if (spd is not None and spd >= RUN_SPEED) else "walking"
            
        out.append((t0, t1, final_label, grouped[best], spd))
    return out


def consolidate_timeline(wins):
    """Merges consecutive windows with identical predictions into continuous intervals."""
    if not wins:
        return []
        
    intervals = []
    curr_label = wins[0][2] or "no cat detected"
    curr_start = wins[0][0]
    curr_end = wins[0][1]
    curr_confs = [wins[0][3]]
    
    for w in wins[1:]:
        t0, t1, lab, conf, _ = w
        lab = lab or "no cat detected"
        if lab == curr_label:
            curr_end = t1
            curr_confs.append(conf)
        else:
            avg_conf = sum(curr_confs) / len(curr_confs)
            intervals.append((curr_start, curr_end, curr_label, avg_conf))
            curr_label = lab
            curr_start = t0
            curr_end = t1
            curr_confs = [conf]
            
    avg_conf = sum(curr_confs) / len(curr_confs)
    intervals.append((curr_start, curr_end, curr_label, avg_conf))
    return intervals


def summarize_overall_behavior(wins, duration):
    """Generates a high-level summary sentence for the whole video."""
    durations = Counter()
    for t0, t1, lab, conf, _ in wins:
        durations[lab or "no cat detected"] += (t1 - t0)
        
    if not durations or (len(durations) == 1 and "no cat detected" in durations):
        return "No cat detected in video."
        
    top_label, top_dur = durations.most_common(1)[0]
    pct = (top_dur / max(duration, 1e-5)) * 100
    
    if len([k for k in durations if k != "no cat detected"]) == 1 or pct >= 85:
        return f"Cat is {top_label} throughout the video ({pct:.0f}% of total time)."
    else:
        return f"Cat is predominantly {top_label} in the video ({pct:.0f}% of total time)."


def main():
    in_dir = Path(INPUT_FOLDER).resolve()

    if not in_dir.is_dir():
        cwd = Path.cwd()
        existing = [d.name for d in cwd.iterdir() if d.is_dir()]
        sys.exit(
            f"\n[ERROR] Cannot find folder '{INPUT_FOLDER}' in:\n"
            f"  {cwd}\n\n"
            f"Existing folders found in directory:\n"
            f"  {existing if existing else 'No subfolders found'}\n\n"
            f"Please check the spelling of INPUT_FOLDER at the bottom of the script."
        )

    video_files = sorted([p for p in in_dir.iterdir() if p.suffix.lower() in VIDEO_EXTS])
    if not video_files:
        sys.exit(f"\nError: No video files found inside '{in_dir}'. Supported formats: {', '.join(VIDEO_EXTS)}")

    if not Path(WEIGHTS).is_file():
        sys.exit(f"\nError: Classifier weights file not found: {WEIGHTS}")

    out_dir = Path(OUTPUT_FOLDER)
    out_dir.mkdir(parents=True, exist_ok=True)

    print("\nLoading models...")
    detector = YOLO(DETECTOR)
    classifier = YOLO(WEIGHTS)
    names = [classifier.names[i] for i in range(len(classifier.names))]

    summary_rows = []

    print(f"\nProcessing {len(video_files)} video(s) from '{in_dir.name}/':\n")
    print("=" * 75)

    for vp in video_files:
        samples, dur = analyse_video(vp, detector, classifier, names)
        wins = compute_windows(samples, dur, names)
        timeline = consolidate_timeline(wins)
        overall_summary = summarize_overall_behavior(wins, dur)

        # Print console output
        print(f"Video: {vp.name} (Duration: {dur:.1f}s)")
        print("-" * 75)
        print("Timeline Breakdown:")
        for t0, t1, label, conf in timeline:
            print(f"  • {t0:>5.1f}s to {t1:>5.1f}s  :  {label:<18} (confidence: {conf:.2f})")
        print(f"\nOverall Summary: {overall_summary}")
        print("=" * 75)

        # Save individual CSV timeline
        csv_path = out_dir / f"{vp.stem}_timeline.csv"
        with open(csv_path, "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["start_second", "end_second", "behavior", "confidence"])
            for t0, t1, label, conf in timeline:
                writer.writerow([f"{t0:.1f}", f"{t1:.1f}", label, f"{conf:.2f}"])

        summary_rows.append({
            "video_name": vp.name,
            "duration_seconds": f"{dur:.1f}",
            "overall_summary": overall_summary
        })

    # Save summary report
    with open(out_dir / "all_videos_summary.csv", "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["video_name", "duration_seconds", "overall_summary"])
        writer.writeheader()
        writer.writerows(summary_rows)

    print(f"\nProcessing complete! Detailed outputs saved to '{OUTPUT_FOLDER}/'")


# =====================  CHANGE THESE IF NEEDED  =====================
INPUT_FOLDER = "multi_video_test"      # Name of folder containing videos
OUTPUT_FOLDER = "multi_video_results"  # Folder where CSV results will be saved
WEIGHTS = "behavior_best_v3.pt"        # Path to behavior classifier weights
DETECTOR = "yolov8m.pt"                # Path to cat detector weights

VIDEO_EXTS = {".mp4", ".mov", ".avi", ".mkv", ".webm", ".m4v", ".mpg", ".mpeg", ".3gp"}
CAT_CLASS = 15            # COCO class index for 'cat'
DETECT_CONF = 0.15        # Minimum detection confidence
PAD = 0.10                # Bounding box padding factor
MIN_CROP_SIDE = 64        # Minimum crop side in pixels
IMAGE_SIZE = 224          # Input image size for classifier
SAMPLES_PER_SECOND = 5    # Sampling rate (frames per second)
WINDOW_SECONDS = 2.0      # Duration of each prediction window

CAMERA_COMPENSATION = True  # Subtract background camera motion
STILL_SPEED = 0.10          # Speed threshold below which cat is considered still
SPLIT_MOVING = True         # True: use speed to split 'moving' into 'walking' vs 'running'
RUN_SPEED = 0.50            # Speed threshold for running (body lengths/s)

MERGE_GROUPS = {
    "resting": ["sitting", "lying"],
    "moving": ["walking", "running"],
}
# =====================================================================

if __name__ == "__main__":
    main()