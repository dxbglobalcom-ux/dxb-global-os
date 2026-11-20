#!/usr/bin/env python3
"""Split a storyboard's ISTEM.md into one H3 first-frame prompt per shot.

Picture first, sound later (his word, 2026-11-20): each storyboard frame becomes the FIRST FRAME
of its own short shot, so the film follows the storyboard exactly and every shot fits the card.
Each shot prompt = the film's shared context (scene, product, cast, light, style, physics …)
+ that shot's own block. Sections about sound, dialogue, the multi-shot format and the first
frame of the whole film are left out: they belong to the cut film, not to one shot.

Usage: build_shots.py <storyboard-dir> <out-dir> <input-prefix>
Writes <out-dir>/shots.tsv: n, seconds, frame source path, input file name, prompt file.
"""
import re
import sys
from pathlib import Path

board, out, prefix = Path(sys.argv[1]), Path(sys.argv[2]), sys.argv[3]
out.mkdir(parents=True, exist_ok=True)
text = (board / "ISTEM.md").read_text(encoding="utf-8")
merged = text.split("## Merged prompt", 1)[1].split("## Negative", 1)
body, negative = merged[0], (merged[1].strip() if len(merged) > 1 else "")

first_shot = re.search(r"^### Kare 1 \|", body, re.M).start()
pre, shots_txt = body[:first_shot], body[first_shot:]
pre = re.sub(r"^## Frames\s*$", "", pre, flags=re.M)

DROP = re.compile(r"AUDIO|SOUND ONLY|NATURAL SOUND|DIALOGUE|FORMAT|FIRST FRAME|SCENE CONTEXT")
# Measured 2026-11-20 on film 01: whole-film words (pacing, transitions, the cast of four) made H3
# cut to another scene INSIDE a 2-second shot. A section that speaks of the film's editing is left
# out; the cast is given only to a shot that has people in it.
EDIT_WORDS = re.compile(r"\b(cuts?|pacing|transitions?|sequence|multi-shot)\b", re.I)
HANDS = re.compile(r"\b(hands?|fingers?|fingertips|gestures?|touch\w*|grip\w*)\b", re.I)
PEOPLE = re.compile(r"\b(m[ae]n|wom[ae]n|person|people|hands?|fingers?|fingertips|he|his|him|they|"
                    r"their|lead|player|runner|athlete|creator|face|feet|foot|legs?|steps?)\b", re.I)
sections = re.split(r"(?=^\*\*[A-Z])", pre.strip(), flags=re.M)
named = []
for s in sections:
    s = s.strip()
    if not s:
        continue
    name = s.split("**")[1] if s.startswith("**") else ""
    if DROP.search(name) or (EDIT_WORDS.search(s) and not re.match(r"PRODUCT|CHARACTER|CAST", name)):
        continue
    named.append((name, s))

def clean(t):
    t = t.replace(" (ours)", "").replace("**", "")
    t = re.sub(r"\[([^\]]*)\]", r"\1", t)
    t = re.sub(r"\b30-second\b", "15-second", t)
    return re.sub(r"\n{3,}", "\n\n", t).strip()

blocks = re.split(r"^### Kare (\d+) \| ([^|]+?) \| [^\n]*\n", shots_txt, flags=re.M)[1:]
rows = []
for i in range(0, len(blocks), 3):
    n, span, shot = int(blocks[i]), blocks[i + 1].strip(), blocks[i + 2]
    a, b = [float(x) for x in re.findall(r"[\d.]+", span)[:2]]
    # The cut INTO this shot is made in the edit; inside the shot it would ask H3 for a second shot.
    shot = re.sub(r"\b(?:HARD|WHIP|MATCH|SMASH|JUMP)[ -]CUT(?: to| into| —| -|:)?\s*", "", shot.strip(),
                  flags=re.I)
    frame = board / "kareler" / f"kare-{n}.png"
    assert frame.exists(), frame
    # Measured on film 01 (seed 2002): a macro with fingertips, given the cast, cut to the four men;
    # a packshot told only "no people" let a hand reach in. Hands alone get no cast and a hand rule.
    has_people = bool(PEOPLE.search(re.sub(r"\b(hands?|fingers?|fingertips)\b", "", shot, flags=re.I)))
    hands_only = not has_people and bool(re.search(r"\b(hands?|fingers?|fingertips)\b", shot, re.I))
    context = "\n\n".join(s for name, s in named
                          if has_people or not re.search(r"CHARACTER|CAST|PERFORMANCE|SKIN", name))
    if has_people:
        who = ""
    elif hands_only:
        who = (" Only the hand or fingers described below appear, close and partial; no face, no body,"
               " no other person ever enters the frame.")
    else:
        # Measured on film 01 shot 7, three seeds: naming the hand ("no hand", "fingers", "extra
        # fingers") called a hand into an empty packshot. An empty shot is described positively and
        # every sentence about hands is left out of it.
        who = (" The set is empty and still: the product stands alone exactly where it is, and only"
               " the camera and the light move.")
        context = "\n\n".join(
            ". ".join(x for x in s.split(". ") if not HANDS.search(x)) for s in context.split("\n\n"))
    avoid = re.sub(r"\s+", " ", negative)
    if not has_people and not hands_only:
        avoid = ", ".join(x for x in avoid.split(", ") if not re.search(r"finger|hand|face", x, re.I))
    prompt = clean(
        f"ONE SINGLE UNBROKEN TAKE, {b - a:.1f} seconds, vertical 9:16 photoreal commercial footage. "
        f"The first frame is the given picture exactly; from it only the action and the camera move "
        f"written below happen, in the same place, with the same subjects. The camera never cuts, "
        f"the scene never changes, nothing new is introduced.{who} No text overlays, no subtitles.\n\n"
        f"THIS SHOT — {shot.strip()}\n\nLOOK —\n{context}\n\n"
        f"AVOID — any cut, scene change or second shot; {avoid}"
    )
    pf = out / f"shot{n}.txt"
    pf.write_text(prompt + "\n", encoding="utf-8")
    rows.append(f"{n}\t{b - a:.2f}\t{frame}\t{prefix}_k{n}.png\t{pf}\n")
(out / "shots.tsv").write_text("".join(rows), encoding="utf-8")
print(f"{board.name}: {len(rows)} shots, total {sum(float(r.split()[1]) for r in rows):.1f} s")
