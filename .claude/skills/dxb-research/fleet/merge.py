#!/usr/bin/env python3
"""Collect the hunters' reports and MEASURE whether the fleet earned its place.

The rule the CEO set on 2026-09-17: a fleet stays only if, at the same wall-clock, it at
least doubles the people a single agent reached and closes the holes that agent named.
So this file does not merely concatenate — it counts:

  * how many separate humans each hunter actually read (its own E block, and the URLs it cites)
  * what each hunter added that NOBODY else brought — the marginal contribution, which is
    the only honest answer to "did the seventh hunter earn its money"
  * saturation: the share of the last hunter's sources that were new
  * the closed doors, gathered from every lane, because a hole must never stay silent
"""
from __future__ import annotations

import json
import pathlib
import re
import sys

URL = re.compile(r"https?://[^\s\"'<>)\]},`\\]+")

# WHICH DOORS THIS LANE ACTUALLY OPENED. The CEO asked "was Google searched at all?" on the
# first fleet run (2026-09-17) and nobody could answer it without reading seven transcripts.
# A machine answers it now, on every run, from the hunter's own tool calls.
CHANNEL_PAT = [
    ("sweep", r"sweep\.sh"), ("google", r"opencli google search"),
    ("ddg", r"opencli duckduckgo"), ("reddit", r"opencli reddit|crowd\.sh"),
    ("x", r"opencli twitter"), ("youtube", r"opencli youtube|yt-dlp"),
    ("hn", r"opencli hackernews|hn\.algolia"), ("github", r"gh search|gh api"),
    ("browser", r"opencli browser"), ("quora", r"quora"), ("fb/ig", r"opencli facebook|opencli instagram"),
    ("cn", r"opencli zhihu|linux-do|opencli weibo|bili"), ("akademik", r"arxiv|crossref|openalex|europepmc"),
    ("zincir", r"fetch\.py"), ("model-arama", r'"WebSearch"|"WebFetch"'),
]
def people_count(text: str) -> str:
    """The E block's number: how many separate humans this lane actually read.

    Read from block E when it exists, else from any sentence that names distinct people —
    and the LARGEST such number in that block, because a lane usually lists its threads
    before it totals them.
    """
    m = re.search(r"(?:^|\n)\s*\**\s*E\)(.{0,800})", text, re.S)
    scope = m.group(1) if m else text
    hits = re.findall(r"(\d{1,5})\s*(?:ayr[ıi]|farkl[ıi]|distinct|separate)?\s*"
                      r"(?:insan|ki[şs]i|ki\u015fi|people|users?|kullan[ıi]c[ıi])", scope, re.I)
    if not hits and not m:
        return "-"
    return max(hits, key=lambda s: int(s)) if hits else "-"


def final_text(p: pathlib.Path) -> str:
    out = ""
    for line in p.read_text(errors="replace").splitlines():
        try:
            d = json.loads(line)
        except Exception:
            continue
        if d.get("type") == "result" and d.get("result"):
            out = d["result"]
    return out


def stats(p: pathlib.Path) -> dict:
    """Cost, tools, and the addresses the hunter actually TOUCHED.

    The first version of this file counted the urls written in the hunter's prose and read
    0 for all seven lanes — a detector that measures nothing always agrees with itself.
    The honest source is the tool call: what it fetched, not what it typed. Measured
    2026-09-17 on the first fleet run, which is why this is here.
    """
    cost, tools, last, urls, doors = 0.0, {}, None, set(), set()
    for line in p.read_text(errors="replace").splitlines():
        try:
            d = json.loads(line)
        except Exception:
            continue
        if d.get("type") == "result":
            last = d
        for blk in (d.get("message") or {}).get("content") or []:
            if isinstance(blk, dict) and blk.get("type") == "tool_use":
                tools[blk.get("name")] = tools.get(blk.get("name"), 0) + 1
                try:
                    raw = json.dumps({"n": blk.get("name"), "i": blk.get("input") or {}},
                                     ensure_ascii=False)
                    urls |= set(URL.findall(raw))
                    if "/ground" in raw:
                        doors.add("zemin-okudu")
                    for label, pat in CHANNEL_PAT:
                        if re.search(pat, raw, re.I):
                            doors.add(label)
                except Exception:
                    pass
    if last:
        cost = last.get("total_cost_usd", 0.0) or 0.0
    return {"cost": cost, "tools": tools, "doors": doors,
            "touched": {u.rstrip('.,);\\"') for u in urls}}


def main() -> int:
    out = pathlib.Path(sys.argv[1])
    reports, order = {}, []
    for j in sorted(out.glob("*.jsonl")):
        role = j.stem
        txt = final_text(j)
        if not txt:
            continue
        order.append(role)
        meta = {}
        mf = out / f"{role}.meta"
        if mf.exists():
            for ln in mf.read_text().splitlines():
                if "=" in ln:
                    k, v = ln.split("=", 1); meta[k] = v
        st = stats(j)
        reports[role] = {"text": txt, "urls": st.pop("touched"),
                         "read_ground": "zemin-okudu" in (st.get("doors") or set()), **st, **meta}
        (out / f"HUNTER-{role}.md").write_text(txt, encoding="utf-8")

    if not reports:
        print("hicbir avci rapor getirmedi — .err dosyalarina bak"); return 1

    seen: set[str] = set()
    print(f"{'AVCI':<12}{'SURE':>7}{'PARA':>8}{'KAYNAK':>8}{'YENI':>7}{'İNSAN':>7}  ACILAN KAPILAR")
    total_cost = 0.0
    marginal = {}
    for role in order:
        r = reports[role]
        new = len(r["urls"] - seen)
        seen |= r["urls"]
        marginal[role] = new
        ppl = people_count(r["text"])
        total_cost += r["cost"]
        top = " ".join(sorted(r.get("doors") or {"-"}))
        print(f"{role:<12}{r.get('secs','?'):>6}s{r['cost']:>8.2f}{len(r['urls']):>8}{new:>7}{ppl:>7}  {top}")
    print(f"{'TOPLAM':<12}{'':>7}{total_cost:>8.2f}{len(seen):>8}")

    # THE GROUND. Since 2026-09-17 the fleet opens it ITSELF before any hunter is launched,
    # so the question "was Google searched at all?" is answered from the files on disk, not
    # from what a hunter chose to do. (This detector had to be corrected twice: it first
    # counted urls written in prose — 0 for every lane — and then called a machine-opened
    # ground "HICBIRI" because no hunter had run the sweep by hand.)
    ground = out / "ground"
    raws = sorted(ground.glob("*.raw"))
    if raws:
        g = (ground / "google.raw"); d = (ground / "duckduckgo.raw")
        gs = g.stat().st_size if g.exists() else 0
        ds = d.stat().st_size if d.exists() else 0
        pages = len(list((ground / "pages").glob("*.md"))) if (ground / "pages").exists() else 0
        alive = sum(1 for r in raws if r.stat().st_size >= 40)
        print(f"\nGENIS ZEMIN (filo acti, avcilardan once): {len(raws)} kanal dosyasi, "
              f"{alive} tanesi dolu · GOOGLE {gs} bayt · DUCKDUCKGO {ds} bayt · "
              f"okunan sayfa govdesi {pages}")
        if gs < 40:
            print("   !! GOOGLE BOS DONDU — bu bir deliktir, rapora yazilir.")
        readers = [r for r in order if reports[r].get("read_ground")]
        print(f"   zemini okuyan avci: {len(readers)}/{len(order)}"
              f" ({', '.join(readers) if readers else 'hicbiri — kendi kapilarindan gittiler'})")
    else:
        swept = [r for r in order if "sweep" in (reports[r].get("doors") or set())]
        print(f"\nGENIS ZEMIN: filo acmadi; {len(swept)}/{len(order)} avci kendisi tarama yapti "
              f"({', '.join(swept) if swept else 'HICBIRI — bu bir kusurdur'}).")

    last = order[-1]
    share = (marginal[last] / len(reports[last]['urls']) * 100) if reports[last]["urls"] else 0.0
    print(f"\nDOYGUNLUK: son avci ({last}) getirdigi kaynaklarin %{share:.0f}'ini ilk kez getirdi.")
    print("   (%5'in altina dustugunde sefer biter — yeni avci eklemek para yakmaktir.)")

    doors = []
    for role in order:
        t = reports[role]["text"]
        m = re.search(r"(?:^|\n)\s*D\)(.{0,1200})", t, re.S)
        if m:
            doors.append((role, m.group(1).strip().splitlines()))
    if doors:
        print("\nKAPANAN KAPILAR (her avcinin D blogundan — delik sessiz kalmaz):")
        for role, lines in doors:
            head = [l for l in lines if l.strip()][:3]
            for l in head:
                print(f"   [{role}] {l.strip()[:110]}")

    print(f"\nraporlar: {out}/HUNTER-*.md")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
