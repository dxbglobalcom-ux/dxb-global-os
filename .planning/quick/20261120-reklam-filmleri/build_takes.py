#!/usr/bin/env python3
"""The director's pass: a film as a few long, natural takes instead of one stiff pose per frame.

His word, 2026-11-20, after film 01's first cut: "Daha doğal hareketler … insan gibi … gerçek bir insan
gibi hareket etmesini istiyorum … Böyle bir saçma bir şey reklam başlar mı?" — the pointing opening and the
seven glued poses are gone. A film is now 3-4 takes of 2-6 s. Each take starts from one storyboard frame
(the look he liked) and is written as real people doing something real, beat by beat, the camera moving
with them. The product, cast and light blocks still come from the storyboard's ISTEM.md (the treasure).

Usage: build_takes.py <storyboard-dir> <spec.json> <out-dir> <input-prefix>
spec.json: {"takes": [{"frame": "kare-2.png" | "reuse:<path to a verified .mp4>",
                       "seconds": 5.5, "people": true, "action": "..."}]}
Writes <out-dir>/shots.tsv (the renderer's format) and one prompt file per take.
"""
import json
import re
import sys
from pathlib import Path

board, spec_path, out, prefix = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3]), sys.argv[4]
out.mkdir(parents=True, exist_ok=True)
spec = json.loads(spec_path.read_text(encoding="utf-8"))
text = (board / "ISTEM.md").read_text(encoding="utf-8")
merged = text.split("## Merged prompt", 1)[1].split("## Negative", 1)
pre = merged[0].split("### Kare 1 |", 1)[0]
negative = re.sub(r"\s+", " ", merged[1].strip()) if len(merged) > 1 else ""

KEEP = re.compile(r"PRODUCT|CHARACTER|CAST|LIGHTING|COLOR|STYLE|OPTICS|REALISM|SKIN")
CUTWORDS = re.compile(r"transition|whip|match cut|hard cut|speed.?ramp|multi-shot|\bcuts\b", re.I)
blocks = {}
for s in re.split(r"(?=^\*\*[A-Z])", pre.strip(), flags=re.M):
    s = s.strip()
    if s.startswith("**"):
        name = s.split("**")[1]
        if KEEP.search(name):
            blocks[name] = s

def clean(t):
    t = t.replace(" (ours)", "").replace("**", "")
    t = re.sub(r"\[([^\]]*)\]", r"\1", t)
    return re.sub(r"\n{3,}", "\n\n", t).strip()

NATURAL = (
    "NATURAL PERFORMANCE — This is candid, observed live action, not a pose. Real people with real energy: "
    "they move continuously, shift their weight, talk to each other, react, laugh with open faces, glance at "
    "each other more than at the lens, and their hands do practical things. Unhurried, believable timing; "
    "nobody freezes, nobody points at the product, nobody presents it to the camera like a catalogue. The "
    "camera is operated by a person and drifts and follows naturally."
)
HANDS = (
    "CLOSE DETAIL — Only the one hand described appears, close and partial, entering from the edge of the "
    "frame; no face, no body and no other person is ever seen, and the scale of the product never changes."
)
EMPTY = (
    "STILL LIFE — The set is empty and still: the product stands alone exactly where it is, and only the "
    "camera and the light move."
)

rows = []
for n, t in enumerate(spec["takes"], 1):
    sec = float(t["seconds"])
    if t["frame"].startswith("reuse:"):
        rows.append(f"{n}\t{sec:.2f}\t{t['frame'][6:]}\t-\t-\t{t.get('in', 'hard')}\n")
        continue
    # "continue": the take starts on the last frame the previous take shows, so two storyboard frames of one
    # shot play as one shot (film 05: a dissolve between two nearly equal frames showed the man twice).
    # render_takes.sh writes shot<n-1>_last.png when take n-1 is rendered.
    tin = t.get("in", "hard")
    if t["frame"] == "continue":
        frame, tin = out / f"shot{n - 1}_last.png", "continue"
    else:
        frame = board / "kareler" / t["frame"]
        assert frame.exists(), frame
    people = t.get("people", True)
    # Measured on film 01 (seed 3003): a macro with fingertips, given the cast, ended with two men standing
    # beside a giant shoe. A take whose only person is a hand gets no cast and says so.
    hands_only = people and t.get("hands_only", False)
    look = [b for name, b in blocks.items()
            if (people and not hands_only) or not re.search(r"CHARACTER|CAST|SKIN", name)]
    # Measured on film 05 (seed 3003): look blocks that describe two places ("City: … Red room: …") made H3
    # carry the red room into the street take and the street into the room. A film with "places" gives each
    # take only the sentences of its own place, and names that place as the whole take's world.
    where = ""
    places = spec.get("places")
    if places and t.get("place"):
        others = [w for k, v in places.items() if k != t["place"] for w in v["words"]]
        def own(sentence):
            return not any(re.search(rf"\b{re.escape(w)}", sentence, re.I) for w in others)
        look = [" ".join(x for x in re.split(r"(?<=[.;])\s+|\s+(?=[A-Z][a-z]+ ?[a-z]*: )", b) if own(x))
                for b in look]
        where = f" The entire take stays in {places[t['place']]['name']}; no other place ever appears."
    # Measured on film 08 (seed 3003): a STYLE block promising "fast whip pans" and "speed ramping
    # transitions" made H3 cut to another set inside every take. A take is one continuous shot, so no look
    # sentence that speaks of cuts or transitions reaches it; the cut between takes is cut.py's.
    look = [" ".join(x for x in re.split(r"(?<=[.;])\s+", b) if not CUTWORDS.search(x)) for b in look]
    avoid = negative
    if not people:
        # Measured on film 04 (seeds 3003, 3005): an empty packshot told to avoid "numbers other than 9 on the
        # striker's kit" got a number-9 player walking in, twice. An empty take hears of no person at all.
        avoid = ", ".join(x for x in avoid.split(", ") if not re.search(
            r"finger|hand|face|kit|jersey|player|striker|uniform|number|\bm[ae]n\b|people|person|crowd|team|skin", x, re.I))
    prompt = clean(
        f"ONE CONTINUOUS TAKE, {sec:.1f} seconds, vertical 9:16 photoreal commercial footage. The first frame "
        f"is the given picture exactly; from it the scene plays on in the same place{' with the same people' if people else ''}.{where} "
        f"No cut, no scene change, no text overlays, no subtitles.\n\n"
        f"WHAT HAPPENS — {t['action'].strip()}\n\n"
        f"{HANDS if hands_only else NATURAL if people else EMPTY}\n\n" + "\n\n".join(look) +
        f"\n\nAVOID — any cut or second shot{', stiff posing, frozen smiles, pointing at the product' if people else ''}; {avoid}"
    )
    pf = out / f"shot{n}.txt"
    pf.write_text(prompt + "\n", encoding="utf-8")
    rows.append(f"{n}\t{sec:.2f}\t{frame}\t{prefix}_k{n}.png\t{pf}\t{tin}\n")
(out / "shots.tsv").write_text("".join(rows), encoding="utf-8")
# A film whose people speak (the UGC) keeps H3's own sound, cut with the picture.
(out / "keep_audio").unlink(missing_ok=True)
if spec.get("keep_audio"):
    (out / "keep_audio").touch()
print(f"{board.name}: {len(rows)} takes, {sum(float(r.split(chr(9))[1]) for r in rows):.1f} s")
