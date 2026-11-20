#!/usr/bin/env python3
"""Cut a film from its takes with the storyboard's own transitions.

His word, 2026-11-20: the first cut was "birbirinden kopuk sahneleri birleştirmişsiniz" — seven takes glued
end to end with plain cuts. Here each take enters the way its storyboard says: a whip (a fast horizontal
blur pan), a match cut (a two-frame blend on the continuing shape), a dissolve for calm beats, or a hard
cut. Every take still holds the screen for exactly its storyboard length: the outgoing take is trimmed
longer by the transition's overlap (H3 renders a little past the asked length, which pays for it).

Usage: cut.py <take-dir> <out.mp4>
<take-dir>/shots.tsv rows: n, seconds, source, input name, prompt file, in-transition.
<take-dir>/keep_audio present → the takes' own sound is cut with the picture; otherwise silent.
"""
import json
import subprocess
import sys
from pathlib import Path

HEAD = 0.35  # seconds of the still opening pose dropped from each rendered take (render_takes.sh renders them extra)

TRANS = {  # name: (xfade transition, overlap seconds)
    "whip": ("hblur", 0.25),
    "match": ("fade", 0.10),
    "dissolve": ("fade", 0.40),
    "hard": ("fade", 0.042),  # one frame: reads as a cut
}

take_dir, out = Path(sys.argv[1]), Path(sys.argv[2])
rows = [l.rstrip("\n").split("\t") for l in (take_dir / "shots.tsv").read_text().splitlines() if l.strip()]
keep_audio = (take_dir / "keep_audio").exists()

def duration(p):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                        "format=duration", "-of", "json", str(p)], capture_output=True, text=True, check=True)
    return float(json.loads(r.stdout)["format"]["duration"])

takes = []
for r in rows:
    n, sec = int(r[0]), float(r[1])
    tin = r[5] if len(r) > 5 and r[5] in TRANS else "hard"
    clip = take_dir / f"shot{n}.mp4"
    if not clip.exists():
        sys.exit(f"missing {clip}")
    takes.append({"n": n, "sec": sec, "in": tin, "clip": clip, "len": duration(clip),
                  "rendered": not r[2].endswith(".mp4")})

# overlap of the transition into take i is paid by take i-1's spare length
for i, t in enumerate(takes):
    kind, d = TRANS[t["in"]]
    if i == 0:
        t["d"] = 0.0
        continue
    prev = takes[i - 1]
    spare = prev["len"] - prev["sec"] - (HEAD if prev["rendered"] else 0.0) - 0.01
    t["d"] = max(0.042, min(d, spare))
    t["kind"] = kind

args, filt = [], []
for i, t in enumerate(takes):
    nxt_d = takes[i + 1]["d"] if i + 1 < len(takes) else 0.0
    t["trim"] = t["sec"] + nxt_d
    args += ["-i", str(t["clip"])]
    # a rendered take drops its first HEAD s (the still storyboard pose); a reused, verified clip does not
    head = HEAD if t["rendered"] and t["len"] >= t["trim"] + HEAD else 0.0
    filt.append(f"[{i}:v]trim={head:.4f}:{head + t['trim']:.4f},setpts=PTS-STARTPTS,fps=24,format=yuv420p,"
                f"settb=1/24[v{i}]")

label, acc = "v0", takes[0]["trim"]
for i in range(1, len(takes)):
    t = takes[i]
    offset = acc - t["d"]
    filt.append(f"[{label}][v{i}]xfade=transition={t['kind']}:duration={t['d']:.4f}:offset={offset:.4f}[x{i}]")
    label = f"x{i}"
    acc = offset + t["trim"]

maps = ["-map", f"[{label}]"]
if keep_audio:
    for i, t in enumerate(takes):
        fo = max(0.0, t["sec"] - 0.04)
        h = HEAD if t["rendered"] else 0.0
        filt.append(f"[{i}:a]atrim={h:.4f}:{h + t['sec']:.4f},asetpts=PTS-STARTPTS,aresample=48000,"
                    f"afade=t=in:d=0.04,afade=t=out:st={fo:.4f}:d=0.04[a{i}]")
    filt.append("".join(f"[a{i}]" for i in range(len(takes))) + f"concat=n={len(takes)}:v=0:a=1[aout]")
    maps += ["-map", "[aout]", "-c:a", "aac", "-b:a", "192k"]

cmd = ["ffmpeg", "-y", "-loglevel", "error", *args, "-filter_complex", ";".join(filt), *maps,
       # xfade hands over 4:4:4; phones cannot open High 4:4:4 (his phone, 2026-11-20: "Your device cannot
       # open"), so the film is written as 4:2:0 High profile, which every phone plays.
       "-c:v", "libx264", "-pix_fmt", "yuv420p", "-profile:v", "high", "-level", "4.1",
       "-crf", "14", "-preset", "slow", "-movflags", "+faststart", str(out)]
subprocess.run(cmd, check=True)
print(f"{out.name}: {duration(out):.2f} s, "
      + " ".join(f"{t['n']}:{t['in']}{'' if i == 0 else f'({t[chr(100)]:.2f})'}" for i, t in enumerate(takes)))
