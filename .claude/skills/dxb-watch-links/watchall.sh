#!/usr/bin/env bash
# watchall.sh <job-dir> <video>  — step 3, for an item that is truly valuable: watch ALL of it.
# One frame per second plus every scene cut, labelled 4x3 contact sheets in time order.
# Read EVERY sheet it prints.
set -u
J="$1"; v="$2"
d="$J/frames/$(basename "${v%.*}")-all"; mkdir -p "$d"
if [ -z "$(ls "$d"/t*.jpg 2>/dev/null)" ]; then
  ffmpeg -v error -y -i "$v" -vf "fps=1" -q:v 3 "$d/t%04d.jpg" < /dev/null
  ffmpeg -v error -y -i "$v" -vf "select='gt(scene,0.25)',showinfo" -vsync vfr -q:v 3 "$d/s%04d.jpg" < /dev/null 2> "$d/scene.log"
fi
python3 -I - "$d" <<'PY'
import sys, re, pathlib
from PIL import Image, ImageDraw
d = pathlib.Path(sys.argv[1])
fr = [(int(p.stem[1:]) - 1, p, "") for p in sorted(d.glob("t*.jpg"))]          # t0001 = second 0
ts = [float(m) for m in re.findall(r"pts_time:([\d.]+)", (d / "scene.log").read_text(errors="ignore"))]
fr += [(t, p, " cut") for t, p in zip(ts, sorted(d.glob("s*.jpg")))]
fr.sort(key=lambda x: x[0])
for old in d.glob("sheet*.jpg"): old.unlink()
H, COLS, ROWS = 360, 4, 3
for n in range(0, len(fr), COLS * ROWS):
    chunk = fr[n:n + COLS * ROWS]
    ims = [Image.open(p).convert("RGB") for _, p, _ in chunk]
    ims = [im.resize((int(im.width * H / im.height), H)) for im in ims]
    w = max(im.width for im in ims)
    sheet = Image.new("RGB", (w * COLS, H * ROWS), "white"); dr = ImageDraw.Draw(sheet)
    for k, ((t, _, tag), im) in enumerate(zip(chunk, ims)):
        x, y = (k % COLS) * w, (k // COLS) * H
        sheet.paste(im, (x, y)); dr.rectangle([x, y, x + 120, y + 26], fill="black")
        dr.text((x + 6, y + 6), f"{int(t)//60:02d}:{int(t)%60:02d}{tag}", fill="yellow")
    out = d / f"sheet{n // (COLS * ROWS) + 1:02d}.jpg"; sheet.save(out, quality=85); print("SHEET", out)
print("FRAMES", len(fr))
PY
