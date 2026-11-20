#!/usr/bin/env python3
"""Cut a film from its takes with the storyboard's own transitions, so it flows like a real commercial.

His word, 2026-11-20: the first cut was "birbirinden kopuk sahneleri birleştirmişsiniz" — seven takes glued
end to end with plain cuts. Then: "doğal bir akış olsun. Gerçek bir reklammış gibi" — a dissolve may show two
pictures in a natural flow; what must not happen is anything a real editor would not do. So each take enters
the way its storyboard says, as an editor would cut it:
  whip      the outgoing take smears sideways over its last frames, cut, the incoming one sharpens out of
            the same smear — a real fast pan, without a ghost of both;
  dissolve  a calm beat: a soft cross-dissolve, paid by the outgoing take's spare length;
  match     a straight cut on the continuing shape (a match cut is a cut);
  hard      a straight cut;
  dream     into a dream: the outgoing take opens into white light and the incoming one comes out of it
            (his word on 03, 2026-11-20: "gözlerini kapatıp rüya görme sahnesi olması lazım"); the incoming
            take's own still opening, hidden in the light, and the outgoing take's spare pay for it;
  continue  no cut at all: the take was rendered from the previous take's last frame, so the shot runs on.
Every take holds the screen for its storyboard length; the film is the sum of them.

Usage: cut.py <take-dir> <out.mp4>
<take-dir>/shots.tsv rows: n, seconds, source, input name, prompt file, in-transition.
<take-dir>/keep_audio present → the takes' own sound is cut with the picture; otherwise silent.
"""
import json
import subprocess
import sys
from pathlib import Path

HEAD = 0.35  # seconds of the still opening pose dropped from each rendered take (render_takes.sh renders them extra)
FPS = 24
WHIP = [8, 24, 64, 160]  # horizontal blur width, frame by frame toward the cut (and back, after it)
DISSOLVE = 0.40          # seconds of a calm beat's cross-dissolve, at most (the outgoing take's spare pays)
DREAM_OUT = 0.25         # at most this much of a dream's white light is paid by the outgoing take's spare

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
    tin = r[5] if len(r) > 5 and r[5] in ("whip", "match", "dissolve", "hard", "continue", "dream") else "hard"
    clip = take_dir / f"shot{n}.mp4"
    if not clip.exists():
        sys.exit(f"missing {clip}")
    takes.append({"n": n, "sec": sec, "in": tin, "clip": clip, "len": duration(clip),
                  "rendered": not r[2].endswith(".mp4")})


def whip_out(sec):
    # blurs stack: each later frame adds a wider one, so the smear grows into the cut
    k = len(WHIP)
    return [f"avgblur=sizeX={w}:sizeY=1:enable='gte(t,{sec - (k - j) / FPS:.4f})'" for j, w in enumerate(WHIP)]


def whip_in():
    k = len(WHIP)
    return [f"avgblur=sizeX={w}:sizeY=1:enable='lt(t,{(k - j) / FPS:.4f})'" for j, w in enumerate(WHIP)]


for i, t in enumerate(takes):
    # a "continue" take starts on the frame the previous one ended on: nothing is dropped, the shot runs on
    t["head"] = HEAD if t["rendered"] and t["in"] != "continue" and t["len"] >= t["sec"] + HEAD else 0.0
for i, t in enumerate(takes):
    # p: overlap paid by the outgoing take's spare end; s: paid by this take's own opening, which it then shows
    t["p"], t["s"] = 0.0, 0.0
    if i > 0 and t["in"] in ("dissolve", "dream"):
        prev = takes[i - 1]
        spare = max(0.0, prev["len"] - prev["head"] - prev["sec"] - 0.01)
        t["p"] = min(DISSOLVE if t["in"] == "dissolve" else DREAM_OUT, spare)
        if t["in"] == "dream":
            t["s"] = t["head"]
    t["d"] = t["p"] + t["s"]

args, filt = [], []
for i, t in enumerate(takes):
    args += ["-i", str(t["clip"])]
    # a rendered take drops its first HEAD s (the still storyboard pose); a reused, verified clip does not
    head = t["head"]
    nd = takes[i + 1]["p"] if i + 1 < len(takes) else 0.0
    if t["len"] < head + t["sec"] - 0.01:
        sys.exit(f"take {t['n']} is {t['len']:.2f} s, shorter than its {t['sec']:.2f} s")
    chain = [f"trim={head - t['s']:.4f}:{head + t['sec'] + nd:.4f}", "setpts=PTS-STARTPTS", f"fps={FPS}", "format=yuv420p"]
    nxt = takes[i + 1]["in"] if i + 1 < len(takes) else None
    if i > 0 and t["in"] == "whip":
        chain += whip_in()
    if nxt == "whip":
        chain += whip_out(t["sec"])
    filt.append(f"[{i}:v]" + ",".join(chain) + f",settb=1/{FPS}[v{i}]")

label, acc = "v0", takes[0]["sec"] + (takes[1]["p"] if len(takes) > 1 else 0.0)
for i in range(1, len(takes)):
    t = takes[i]
    nd = takes[i + 1]["p"] if i + 1 < len(takes) else 0.0
    if t["d"] > 0:
        kind = "fadewhite" if t["in"] == "dream" else "fade"
        filt.append(f"[{label}][v{i}]xfade=transition={kind}:duration={t['d']:.4f}:offset={acc - t['d']:.4f}[j{i}]")
    else:
        filt.append(f"[{label}][v{i}]concat=n=2:v=1:a=0,settb=1/{FPS}[j{i}]")
    label, acc = f"j{i}", acc - t["p"] + t["sec"] + nd
maps = ["-map", f"[{label}]"]
if keep_audio:
    for i, t in enumerate(takes):
        fo = max(0.0, t["sec"] - 0.04)
        h = t["head"]
        filt.append(f"[{i}:a]atrim={h:.4f}:{h + t['sec']:.4f},asetpts=PTS-STARTPTS,aresample=48000,"
                    f"afade=t=in:d=0.04,afade=t=out:st={fo:.4f}:d=0.04[a{i}]")
    filt.append("".join(f"[a{i}]" for i in range(len(takes))) + f"concat=n={len(takes)}:v=0:a=1[aout]")
    maps += ["-map", "[aout]", "-c:a", "aac", "-b:a", "192k"]

cmd = ["ffmpeg", "-y", "-loglevel", "error", *args, "-filter_complex", ";".join(filt), *maps,
       # phones cannot open High 4:4:4 (his phone, 2026-11-20: "Your device cannot open"), so the film is
       # written as 4:2:0 High profile, which every phone plays.
       "-c:v", "libx264", "-pix_fmt", "yuv420p", "-profile:v", "high", "-level", "4.1",
       "-crf", "14", "-preset", "slow", "-movflags", "+faststart", str(out)]
subprocess.run(cmd, check=True)
print(f"{out.name}: {duration(out):.2f} s, " + " ".join(f"{t['n']}:{t['in']}" for t in takes))
