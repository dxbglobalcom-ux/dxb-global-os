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
    # The block's heading comes back in every markdown shape a hunter feels like using:
    # "E)", "**E)**", "## E) AYRI İNSAN SAYISI". Measured 2026-09-17: a regex that allowed
    # only asterisks read "?" for five lanes of seven that had written the block properly.
    m = re.search(r"(?:^|\n)[#*\s]{0,6}E[\)\.:]\s*[^\n]{0,90}\n?(.{0,700})", text, re.S)
    if not m:
        # No E block means the lane did not state its denominator. A number lifted from
        # somewhere else in the prose is not that denominator: on the first fleet run this
        # printed 783 for a lane whose report had no E block at all. Say "?" and mean it.
        return "?"
    # STOP CHASING PROSE. Three regexes in one hour each read a different number out of the
    # same seven reports — "783" became 10, "9 farklı gerçek kişi" became nothing — because
    # every lane words its sentence differently. A hunter always BOLDS its denominator, so
    # take the first bolded number of the block, else the block's first number, and label
    # the column as what it is: the lane's own claim, not an independent count.
    blk = m.group(1)
    bold = re.search(r"\*\*\s*~?\s*([\d][\d.,]{0,6})", blk)
    if bold:
        return bold.group(1).rstrip(".,")
    plain = re.search(r"~?\s*([\d][\d.,]{0,6})", blk)
    return plain.group(1).rstrip(".,") if plain else "?"


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
    # A CALL IS NOT A FETCH. Measured 2026-09-17: a URL written inside an `echo` whose tool
    # result carried `is_error: true` was counted as one opened source AND as a ground read,
    # and the saturation number the CEO is shown rests on exactly this count. So a call is
    # held until its RESULT arrives, and it is harvested only if that result is not an error.
    pending: dict = {}
    for line in p.read_text(errors="replace").splitlines():
        try:
            d = json.loads(line)
        except Exception:
            continue
        if d.get("type") == "result":
            last = d
        for blk in (d.get("message") or {}).get("content") or []:
            if not isinstance(blk, dict):
                continue
            if blk.get("type") == "tool_use":
                tools[blk.get("name")] = tools.get(blk.get("name"), 0) + 1
                pending[blk.get("id")] = json.dumps(
                    {"n": blk.get("name"), "i": blk.get("input") or {}}, ensure_ascii=False)
            elif blk.get("type") == "tool_result":
                raw = pending.pop(blk.get("tool_use_id"), "")
                if blk.get("is_error"):
                    continue          # the door did not open — nothing here was read
                body = blk.get("content")
                if not isinstance(body, str):
                    body = json.dumps(body, ensure_ascii=False)
                harvest = raw + "\n" + body
                urls |= set(URL.findall(harvest))
                if "/ground" in raw:
                    doors.add("zemin-okudu")
                for label, pat in CHANNEL_PAT:
                    if re.search(pat, raw, re.I):
                        doors.add(label)
    if last:
        cost = last.get("total_cost_usd", 0.0) or 0.0
    return {"cost": cost, "tools": tools, "doors": doors,
            "touched": {u.rstrip('.,);\\"') for u in urls}}


def crowd_count(path: pathlib.Path) -> tuple | None:
    """The machine's own count, read back from crowd.sh's CROWD-COUNT line.

    THE DENOMINATOR IS THE WHOLE POINT OF THIS ENGINE, and until 2026-09-17 it was the only
    number here that nothing measured: `people_count()` lifts the first bold figure out of a
    hunter's prose, and on the one kept run it put 783 in front of the CEO while the hunter's
    own report said "783 person-rows, NOT de-duplicated … ~10 people spoke to the question".
    A number that is claimed is labelled a claim from here on; a number that is counted comes
    through this function and says so.
    """
    try:
        for line in path.read_text(errors="replace").splitlines():
            if line.startswith("CROWD-COUNT\t"):
                _, comments, people, threads = line.split("\t")[:4]
                return int(comments), int(people), int(threads)
    except Exception:
        return None
    return None


def main() -> int:
    argv = sys.argv[1:]
    crowd_file = None
    if "--crowd" in argv:
        i = argv.index("--crowd")
        crowd_file = pathlib.Path(argv[i + 1])
        del argv[i:i + 2]
    out = pathlib.Path(argv[0])
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
    print(f"{'AVCI':<12}{'SURE':>7}{'PARA':>8}{'KAYNAK':>8}{'YENI':>7}{'BEYAN':>7}  ACILAN KAPILAR")
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
    print("   (BEYAN = avcinin kendi cumlesinden okunan sayi — SAYIM DEGIL.)")

    # THE DENOMINATOR, named for what it is.
    cc = crowd_count(crowd_file) if crowd_file else None
    if cc:
        print(f"\nINSAN (sayildi): {cc[1]} ayri kisi · {cc[0]} yorum · {cc[2]} baslik "
              f"— crowd.sh'in makine sayimi.")
    else:
        print("\nINSAN: SAYILMADI — bu kosuda makine sayimi yok. Yukaridaki BEYAN sutunu "
              "avcilarin kendi cumlesidir ve payda olarak kullanilamaz.")

    # THE GROUND. Since 2026-09-17 the fleet opens it ITSELF before any hunter is launched,
    # so the question "was Google searched at all?" is answered from the files on disk, not
    # from what a hunter chose to do. (This detector had to be corrected twice: it first
    # counted urls written in prose — 0 for every lane — and then called a machine-opened
    # ground "HICBIRI" because no hunter had run the sweep by hand.)
    grounds = [d for d in sorted(out.glob("ground*")) if d.is_dir()]
    raws = [r for d in grounds for r in d.glob("*.raw")]
    if raws:
        def tot(name):
            # EVERY ground, not just the first. The fleet opens one per language, and the
            # first version of this line printed the Turkish ground's Google alone — which
            # is precisely the half-measure the CEO caught on 2026-09-17.
            return sum((d / name).stat().st_size for d in grounds if (d / name).exists())
        gs = tot("google.raw") + tot("google-deep.raw")
        ds = tot("duckduckgo.raw") + tot("duckduckgo2.raw")
        pages = sum(len(list((d / "pages").glob("*.md"))) for d in grounds if (d / "pages").exists())
        alive = sum(1 for r in raws if r.stat().st_size >= 40)
        print(f"\nGENIS ZEMIN (filo acti, avcilardan once): {len(grounds)} dil/sorgu · "
              f"{len(raws)} kanal dosyasi, {alive} tanesi dolu · GOOGLE (2 kapi) {gs} bayt · "
              f"DUCKDUCKGO {ds} bayt · okunan sayfa govdesi {pages}")
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
        # EVERY SHAPE A HUNTER WRITES. `people_count` above was taught this on 2026-09-17
        # and this line was not, so a lane that wrote "## D) Kapanan kapilar / Reddit
        # AUTH_REQUIRED" had its warning dropped from the only summary the CEO reads.
        m = re.search(r"(?:^|\n)[#*\s]{0,6}D[\)\.:](.{0,1200})", t, re.S)
        if m:
            doors.append((role, m.group(1).strip().splitlines()))
    if doors:
        print("\nKAPANAN KAPILAR (her avcinin D blogundan — delik sessiz kalmaz):")
        for role, lines in doors:
            head = [l for l in lines if l.strip()][:3]
            for l in head:
                print(f"   [{role}] {l.strip()[:110]}")

    # A REPORT WITH NO ADDRESS CANNOT BE CHECKED BY ANYBODY. Measured 2026-09-17 on the one
    # kept run: SEVEN reports out of seven carried ZERO source addresses, three of them no date
    # either, and the answer was saved and committed anyway. The skill's own rule says a quote
    # with no date is a reason to refuse the answer — so the holes are named here, in the only
    # summary the commander reads.
    naked = [r for r in order if not URL.search(reports[r]["text"])]
    if naked:
        print("\nKAYNAKSIZ RAPOR — bu seritlerin metninde tek bir adres yok, denetlenemezler:")
        for r in naked:
            print(f"   [{r}] HUNTER-{r}.md")

    # THE LANES' OWN VERDICTS, SIDE BY SIDE. On the first fleet run four hunters contradicted
    # each other — measure said 4 of 6 sources one way, foreign said 5 of 5 the other, crowd
    # said 6-2, video said 5 of 10 — and NONE of it surfaced: the merge laid seven reports next
    # to each other and left the comparison to a human who had not read them. A machine cannot
    # judge which lane is right, and this does not pretend to: it puts the sentences in one
    # place so the contradiction cannot hide in file six of seven.
    verdicts = []
    for role in order:
        m = re.search(r"(?:^|\n)[#*\s]{0,6}(?:HUKUM|HÜKÜM|SONUC|SONUÇ)[\)\.:]?\s*(.{0,220})",
                      reports[role]["text"], re.S)
        if not m:
            m = re.search(r"(?:^|\n)[#*\s]{0,6}A[\)\.:][^\n]{0,90}\n+([^\n]{20,220})",
                          reports[role]["text"], re.S)
        if m:
            verdicts.append((role, " ".join(m.group(1).split())[:200]))
    if verdicts:
        print("\nSERITLERIN KENDI HUKUMLERI — yan yana, celiski gizlenemesin diye:")
        for role, v in verdicts:
            print(f"   [{role}] {v}")
        print("   (Hangisinin dogru oldugu makinenin isi degildir; hepsini bir arada gormek odur.)")

    print(f"\nraporlar: {out}/HUNTER-*.md")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
