#!/usr/bin/env python3
"""Compose one H3 Ref2VA prompt for a storyboard folder.

The storyboard's ISTEM.md already holds a full 15-second commercial prompt (the treasure's
sources merged): the scene, product, cast, format, lighting, physics, audio and one block per
shot. Here each shot block is bound to its own storyboard frame (<Picture n>), the "(ours)"
editing marks and [brackets] are removed, and the negative is folded in as plain text
(H3's turbo LoRA runs at cfg 1.0, where a separate negative prompt is ignored).

Usage: build_prompt.py <storyboard-dir> <out-prompt.txt> <out-refs.txt> <input-prefix>
Writes the prompt, and the list of frame files (in order) that the caller copies into
ComfyUI/input as <input-prefix>_k<n>.png.
"""
import re
import sys
from pathlib import Path

board, out_prompt, out_refs, prefix = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3]), sys.argv[4]
text = (board / "ISTEM.md").read_text(encoding="utf-8")

merged = text.split("## Merged prompt", 1)[1]
body, _, negative = merged.partition("## Negative")
negative = negative.strip()

frames = sorted(
    (p for p in (board / "kareler").iterdir() if re.fullmatch(r"kare-\d+\.png", p.name)),
    key=lambda p: int(re.search(r"\d+", p.name).group()),
)
n_frames = len(frames)

shot_re = re.compile(r"^### Kare (\d+) \| ([^|]+?) \| .*$", re.M)
shots_seen = [int(m.group(1)) for m in shot_re.finditer(body)]
if shots_seen != list(range(1, n_frames + 1)):
    sys.exit(f"{board.name}: shots {shots_seen} do not match {n_frames} frames")

def shot_header(m):
    n, t = m.group(1), m.group(2).strip()
    return f"SHOT {n} ({t}) — composition, set, wardrobe and light exactly as <Picture {n}>:"

body = shot_re.sub(shot_header, body)
body = re.sub(r"^## Frames\s*$", "", body, flags=re.M)
body = body.replace(" (ours)", "").replace("**", "")
body = re.sub(r"\[([^\]]*)\]", r"\1", body)
body = re.sub(r"\b30-second\b", "15-second", body)
body = re.sub(r"\n{3,}", "\n\n", body).strip()

pics = ", ".join(f"<Picture {i}>" for i in range(1, n_frames + 1))
head = (
    f"One continuous 15-second vertical 9:16 commercial with sound, made of {n_frames} shots in this "
    f"exact order. {pics} are the approved storyboard frames: shot n looks like <Picture n> — the same "
    "product, the same people, the same set, framing and colour — and the film moves from one to the "
    "next with the cuts written below. Photoreal live action, no text overlays, no subtitles."
)
avoid = "AVOID — " + re.sub(r"\s+", " ", negative)

out_prompt.write_text(f"{head}\n\n{body}\n\n{avoid}\n", encoding="utf-8")
out_refs.write_text("".join(f"{p}\t{prefix}_k{i}.png\n" for i, p in enumerate(frames, 1)), encoding="utf-8")
print(f"{board.name}: {n_frames} frames, prompt {len(out_prompt.read_text())} chars")
