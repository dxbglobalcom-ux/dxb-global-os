#!/usr/bin/env python3
"""Measure whether a rival's SCREEN moves, separately from whether the CAMERA moves.

WHY THIS EXISTS. Every source on this queue is filmed, and most are filmed by hand.
A raw frame-to-frame difference on a handheld shot measures the operator's wrist, not
the product. Source 18's motion reading had to be published as UNVERIFIED for exactly
that reason (its static control moved 25.83% against the screen's 43.47%). This script
takes a CONTROL REGION that carries no screen — a wall, a ceiling, a desk edge — and
reports the screen only over the frame-pairs where that control barely moved.

The refuter (scripts/governance/refuter.sh) can re-run any figure a report quotes:

    scripts/rival-intel/motion.py 24 --screen 70,620,590,920 --control 0,200,200,500

Regions are LEFT,TOP,RIGHT,BOTTOM in the frame's own pixels (frames are native, never
downscaled — ledger law 5). Frames come from frames/<source>/t*.jpg, one per second.

Requires Pillow only. No numpy, no OpenCV — this must run on any machine the queue
is worked from.
"""
import argparse
import pathlib
import sys

try:
    from PIL import Image, ImageChops, ImageStat
except ImportError:
    sys.exit("motion.py needs Pillow: python3 -m pip install --user Pillow")

ROOT = pathlib.Path(__file__).resolve().parents[2]


def box(text: str) -> tuple:
    parts = [int(p) for p in text.split(",")]
    if len(parts) != 4:
        raise argparse.ArgumentTypeError("region must be LEFT,TOP,RIGHT,BOTTOM")
    return tuple(parts)


def mean_diff(a: pathlib.Path, b: pathlib.Path, region: tuple) -> float:
    """Mean absolute luminance difference between two frames over one region."""
    ia = Image.open(a).convert("L").crop(region)
    ib = Image.open(b).convert("L").crop(region)
    return ImageStat.Stat(ImageChops.difference(ia, ib)).mean[0]


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("source", help="ledger row number, e.g. 24")
    ap.add_argument("--screen", type=box, required=True, help="LEFT,TOP,RIGHT,BOTTOM of the rival's screen")
    ap.add_argument("--control", type=box, required=True, help="LEFT,TOP,RIGHT,BOTTOM of a region with NO screen in it")
    ap.add_argument("--still", type=float, default=3.0, help="control difference below which the camera counts as still (default 3.0)")
    ap.add_argument("--frames", default=None, help="frame directory (default .planning/research/rival-intel/frames/<source>)")
    args = ap.parse_args()

    fdir = pathlib.Path(args.frames) if args.frames else ROOT / ".planning/research/rival-intel/frames" / args.source
    frames = sorted(fdir.glob("t*.jpg"))
    if len(frames) < 2:
        sys.exit(f"motion.py: fewer than two t*.jpg frames in {fdir}")

    rows = []
    for a, b in zip(frames, frames[1:]):
        rows.append((a.stem, mean_diff(a, b, args.screen), mean_diff(a, b, args.control)))

    still = [r for r in rows if r[2] < args.still]
    moving = [r for r in rows if r[2] >= args.still]

    print(f"source {args.source} — {len(frames)} frames, {len(rows)} consecutive pairs")
    print(f"  screen region  {args.screen}")
    print(f"  control region {args.control}   (camera-still threshold {args.still})")
    print(f"  camera STILL pairs : {len(still)}")
    print(f"  camera MOVING pairs: {len(moving)}  — excluded from the headline figure")

    if not still:
        print("\n  UNVERIFIED — the camera never held still; no honest screen-motion figure can be given.")
        return 0

    s = sum(r[1] for r in still) / len(still)
    c = sum(r[2] for r in still) / len(still)
    print(f"\n  ON CAMERA-STILL PAIRS: screen {s:.3f} · control {c:.3f} · ratio {s / c:.1f}x")
    print(f"  screen range on those pairs: {min(r[1] for r in still):.3f} .. {max(r[1] for r in still):.3f}")
    print("  pairs used: " + ", ".join(r[0] for r in still))

    alls = sum(r[1] for r in rows) / len(rows)
    allc = sum(r[2] for r in rows) / len(rows)
    print(f"\n  (unfiltered, for comparison only — contaminated by camera movement: screen {alls:.3f} · control {allc:.3f} · {alls / allc:.2f}x)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
