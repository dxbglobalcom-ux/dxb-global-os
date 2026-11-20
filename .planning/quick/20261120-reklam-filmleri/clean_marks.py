#!/usr/bin/env python3
"""Paint out the sportswear marks H3 invents on a plain coloured kit, frame by frame.

Film 03, 2026-11-20: on every close basketball take H3 drew a swoosh, a crest and a league mark on the plain
royal-blue jersey, although the storyboard frames are clean and the prompt names the jersey bare; three seeds
and two wordings did not stop it. A mark on a plain kit is a small light island inside the kit's colour, so
each frame's kit colour is masked, the light islands enclosed by it are found, the tall ones (the number's
digits) are kept, and the rest are inpainted from the fabric around them.

Usage: clean_marks.py <in.mp4> <out.mp4> [--hue LO HI] [--max-area PX] [--light V S] [--from S] [--to S]
  --hue      the kit colour in OpenCV hue (0-180); royal blue is 100-130 (default)
  --max-area the largest island painted out, in pixels (default 450)
  --from/--to the part of the clip to clean, in seconds (default the whole clip)
Prints how many islands it painted per second, so a run that touched nothing (or everything) is seen.
"""
import argparse
import subprocess

import cv2
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument("src")
ap.add_argument("dst")
ap.add_argument("--hue", nargs=2, type=int, default=[100, 130])
ap.add_argument("--max-area", type=int, default=450)
ap.add_argument("--light", nargs=2, type=int, default=[150, 110],
                help="a mark pixel is at least this bright (V) and at most this saturated (S); a faint mark needs lower V, higher S")
ap.add_argument("--box", nargs=4, type=int, action="append", default=[], metavar=("X", "Y", "W", "H"),
                help="a fixed area where every light pixel is a mark (a still take whose mark the island test misses)")
ap.add_argument("--from", dest="t0", type=float, default=0.0)
ap.add_argument("--to", dest="t1", type=float, default=1e9)
ap.add_argument("--debug", default=None, help="write the painted mask of every frame as a second video here")
a = ap.parse_args()

cap = cv2.VideoCapture(a.src)
fps = cap.get(cv2.CAP_PROP_FPS) or 24
w, h = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
enc = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24",
                        "-s", f"{w}x{h}", "-r", str(fps), "-i", "-", "-i", a.src, "-map", "0:v", "-map", "1:a?",
                        "-c:v", "libx264", "-crf", "12", "-preset", "slow", "-pix_fmt", "yuv420p", "-c:a", "copy",
                        a.dst], stdin=subprocess.PIPE)
dbg = None
if a.debug:
    dbg = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24",
                            "-s", f"{w}x{h}", "-r", str(fps), "-i", "-", "-c:v", "libx264", "-crf", "18",
                            "-pix_fmt", "yuv420p", a.debug], stdin=subprocess.PIPE)

k5 = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
k15 = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
i, per_sec = 0, {}
while True:
    ok, f = cap.read()
    if not ok:
        break
    t = i / fps
    paint = np.zeros((h, w), np.uint8)
    if a.t0 <= t <= a.t1:
        hsv = cv2.cvtColor(f, cv2.COLOR_BGR2HSV)
        kit = cv2.inRange(hsv, (a.hue[0], 50, 12), (a.hue[1], 255, 255))  # dark folds of the fabric count as the kit
        kit = cv2.morphologyEx(kit, cv2.MORPH_OPEN, k5)
        # the kit as a solid shape: what lies inside it but is not its colour is an island on it
        solid = cv2.morphologyEx(kit, cv2.MORPH_CLOSE, k15)
        light = cv2.inRange(hsv, (0, 0, a.light[0]), (180, a.light[1], 255)) | cv2.inRange(hsv, (0, 120, 120), (12, 255, 255)) \
            | cv2.inRange(hsv, (165, 120, 120), (180, 255, 255))
        cand = cv2.bitwise_and(light, cv2.bitwise_and(solid, cv2.bitwise_not(kit)))
        n, lab, st, _ = cv2.connectedComponentsWithStats(cand, 8)
        for c in range(1, n):
            x, y, bw, bh, area = st[c]
            if area < 6 or area > a.max_area:
                continue
            if bh > 1.6 * bw and area > 40:   # a digit of the number stays
                continue
            comp = (lab == c).astype(np.uint8) * 255
            ring = cv2.subtract(cv2.dilate(comp, k15), cv2.dilate(comp, k5))
            if ring.sum() == 0 or (cv2.bitwise_and(ring, kit) > 0).sum() / max(1, (ring > 0).sum()) < 0.8:
                continue                      # not enclosed by the kit: piping, skin, the ball, the crowd
            paint |= comp
        for x, y, bw, bh in a.box:
            paint[y:y + bh, x:x + bw] |= light[y:y + bh, x:x + bw]
        if paint.any():
            paint = cv2.dilate(paint, k5, iterations=2)  # the mark's soft edge goes too
            f = cv2.inpaint(f, paint, 5, cv2.INPAINT_TELEA)
            s = int(t)
            per_sec[s] = per_sec.get(s, 0) + 1
    enc.stdin.write(f.tobytes())
    if dbg:
        dbg.stdin.write(cv2.cvtColor(paint, cv2.COLOR_GRAY2BGR).tobytes())
    i += 1
enc.stdin.close()
enc.wait()
if dbg:
    dbg.stdin.close()
    dbg.wait()
print(f"{a.dst}: {i} frames, frames painted per second: {dict(sorted(per_sec.items()))}")
