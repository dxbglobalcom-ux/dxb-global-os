#!/usr/bin/env python3
"""Count what the fleet brought back — never narrate it.

Since 2026-09-26 every hunter owns PLATFORMS and hands back three kinds of lines and nothing else
(fleet/ARSENAL.md, last section): one HÜKÜM line, one `PLATFORM <p>: bulundu N / okundu M /
okunmadı: … / kapı kapalı: …` line per platform, and `KULLANDIĞIM SATIRLAR: L0001, …`. The quotes
are rows of the run's ledger (evidence.jsonl), written by scripts/evidence.py and never by a model.
So this file counts, and of what a hunter wrote it prints only those lines, labelled as its claim:

  * the ledger, per platform: distinct addresses found, and distinct addresses whose body was read
    — kapsama.py's Bulundu and Okundu, by the same rule, so the two tables cannot disagree
  * each hunter: its seconds against the clock, its money, the addresses its tool calls actually
    opened, and how often it called `evidence.py fetch` and `add`
  * each hunter's own lines, the ids it cites that the ledger does not hold, and a report that
    cites no row at all
  * the crowd count from crowd.sh — the one number of people a machine counted
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
# `browser`: since 2026-09-24 a browser read is scripts/hidden.py; `opencli browser` is refused
# (exit 3) by bin/opencli and is matched only so an old transcript still reads the same.
# `google`: the ground's Google is `hidden.py google` (fleet/ARSENAL.md), so a hunter that searched
# Google through it opened the Google door too — the old pattern knew only `opencli google search`.
CHANNEL_PAT = [
    ("sweep", r"sweep\.sh"), ("google", r"opencli google search|hidden\.py\W{0,3}google\b"),
    ("ddg", r"opencli duckduckgo"), ("reddit", r"opencli reddit|crowd\.sh"),
    ("x", r"opencli twitter"), ("youtube", r"opencli youtube|yt-dlp"),
    ("hn", r"opencli hackernews|hn\.algolia"), ("github", r"gh search|gh api"),
    ("browser", r"opencli browser|hidden\.py"), ("quora", r"quora"), ("fb/ig", r"opencli facebook|opencli instagram"),
    ("cn", r"opencli zhihu|linux-do|opencli weibo|bili"), ("akademik", r"arxiv|crossref|openalex|europepmc"),
    ("zincir", r"fetch\.py"), ("model-arama", r'"WebSearch"|"WebFetch"'),
    ("defter", r"evidence\.py"),
]
# HOW OFTEN THE HUNTER CALLED THE TWO COMMANDS OF ITS BRIEF — read from its own Bash calls.
EVI_CALL = re.compile(r"evidence\.py[\"']?\s+(fetch|add)\b")

HERE = pathlib.Path(__file__).resolve().parent
LEDGER = "evidence.jsonl"

# THE LINES A HUNTER HANDS BACK, in every markdown shape it wraps them in — "- ", "**…**", "## ",
# "> ", a backtick. Measured on 2026-09-17 with the old blocks: a regex that allowed only asterisks
# read nothing for five lanes of seven that had written their block properly.
DECOR = re.compile(r"^[\s#>*`\-•|]+")
HUKUM_LINE = re.compile(r"^(?:H[UÜ]K[UÜ]M|SONU[CÇ])\s*[:.)\-–]?\s*(.*)$", re.I)
PLATFORM_LINE = re.compile(r"^PLATFORM\s+[A-Za-z0-9._-]+\s*[:\-–]", re.I)
ROWS_LINE = re.compile(r"^KULLAND\S*\s+SAT\S*RLAR\s*[:\-–]?\s*(.*)$", re.I)
ROW_ID = re.compile(r"\bL\d{4}\b")
ONLY_IDS = re.compile(r"^[\sL\d,;·.…\-]+$")
NO_MORE = re.compile(r"okunacak\s+adres\s+kalmad", re.I)


def parse_report(text: str) -> dict:
    """A hunter's report, taken apart into the lines its contract names — and nothing else.

    The HÜKÜM line, the PLATFORM lines as written, the row ids of KULLANDIĞIM SATIRLAR (also when
    they run on over the next lines), whether it said "okunacak adres kalmadı", and how many other
    lines it wrote: those are counted, never printed — the summary does not narrate.
    """
    rep = {"hukum": "", "platforms": [], "ids": [], "rows_line": False, "no_more": False, "prose": 0}
    in_ids = False
    for raw in text.splitlines():
        line = re.sub(r"[*`]+", "", DECOR.sub("", raw)).strip()
        if not line:
            in_ids = False
            continue
        if in_ids and ONLY_IDS.match(line) and ROW_ID.search(line):
            rep["ids"] += ROW_ID.findall(line)
            continue
        in_ids = False
        m = ROWS_LINE.match(line)
        if m:
            rep["rows_line"], in_ids = True, True
            rep["ids"] += ROW_ID.findall(m.group(1))
        elif PLATFORM_LINE.match(line):
            rep["platforms"].append(" ".join(line.split()))
        elif NO_MORE.search(line):
            rep["no_more"] = True
        elif not rep["hukum"] and HUKUM_LINE.match(line):
            rep["hukum"] = " ".join(HUKUM_LINE.match(line).group(1).split())
        else:
            rep["prose"] += 1
    rep["ids"] = list(dict.fromkeys(rep["ids"]))
    return rep


def fleet_roles() -> list:
    """roles.tsv as [(name, [platforms])], in the file's order — the order the summary prints in."""
    try:
        rows = (HERE / "roles.tsv").read_text(encoding="utf-8").splitlines()
    except OSError:
        return []
    return [(c[0].strip(), c[1].split()) for c in (r.split("\t") for r in rows) if len(c) >= 2 and c[0].strip()]


def read_meta(p: pathlib.Path) -> dict:
    meta = {}
    if p.is_file():
        for ln in p.read_text(errors="replace").splitlines():
            if "=" in ln:
                k, v = ln.split("=", 1)
                meta[k.strip()] = v.strip()
    return meta


def ledger(out: pathlib.Path) -> dict | None:
    """The run's ledger, counted: per platform the distinct addresses found and the distinct
    addresses with a body read (`bytes` > 0, `liveness` alive — kapsama.py's rule), every id, who
    wrote the rows, and how many lines could not be parsed at all. None when there is no ledger."""
    p = out / LEDGER
    if not p.is_file():
        return None
    led = {"found": {}, "body": {}, "owners": {}, "ids": set(), "bad": 0, "rows": 0}
    for line in p.read_text(encoding="utf-8", errors="replace").splitlines():
        if not line.strip():
            continue
        try:
            r = json.loads(line)
        except ValueError:
            led["bad"] += 1
            continue
        if not isinstance(r, dict):
            led["bad"] += 1
            continue
        led["rows"] += 1
        if r.get("id"):
            led["ids"].add(str(r["id"]))
        if r.get("hunter"):
            who = str(r["hunter"])
            led["owners"][who] = led["owners"].get(who, 0) + 1
        url = r.get("url_canonical") or r.get("url")
        if not url:
            continue
        plat = str(r.get("platform") or "?")
        led["found"].setdefault(plat, set()).add(url)
        size = r.get("bytes")
        if isinstance(size, (int, float)) and not isinstance(size, bool) and size > 0 \
                and r.get("liveness") == "alive":
            led["body"].setdefault(plat, set()).add(url)
    return led


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

    PARA IS THE ROLE'S WHOLE BILL (B56 K2): <role>.jsonl joins every round the completion gate launched,
    each ending in its own `result` event, and the K1 run's summary printed 10.74 against the gate's own
    11.16 because only the last round's cost was read. Every result event's total_cost_usd is summed.
    """
    cost, tools, urls, doors = 0.0, {}, set(), set()
    calls = {"fetch": 0, "add": 0}
    # A CALL IS NOT A FETCH. Measured 2026-09-17: a URL written inside an `echo` whose tool
    # result carried `is_error: true` was counted as one opened source AND as a ground read,
    # and the KAYNAK column of the summary rests on exactly this count. So a call is
    # held until its RESULT arrives, and it is harvested only if that result is not an error.
    pending: dict = {}
    for line in p.read_text(errors="replace").splitlines():
        try:
            d = json.loads(line)
        except Exception:
            continue
        if d.get("type") == "result":
            c = d.get("total_cost_usd")
            if isinstance(c, (int, float)) and not isinstance(c, bool):
                cost += c
        for blk in (d.get("message") or {}).get("content") or []:
            if not isinstance(blk, dict):
                continue
            if blk.get("type") == "tool_use":
                tools[blk.get("name")] = tools.get(blk.get("name"), 0) + 1
                inp = blk.get("input") or {}
                for verb in EVI_CALL.findall(str(inp.get("command") or "") if isinstance(inp, dict) else ""):
                    calls[verb] += 1
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
    return {"cost": cost, "tools": tools, "doors": doors, **calls,
            "touched": {u.rstrip('.,);\\"') for u in urls}}


def crowd_count(path: pathlib.Path) -> tuple | None:
    """The machine's own count, read back from crowd.sh's CROWD-COUNT line.

    THE DENOMINATOR IS THE WHOLE POINT OF THIS ENGINE, and until 2026-09-17 it was the only
    number here that nothing measured: `people_count()` lifted the first bold figure out of a
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


def collect(out: pathlib.Path) -> dict:
    """Every hunter of the run, in roles.tsv's order.

    A hunter's transcript (`<role>.jsonl`) is the source: its final answer becomes HUNTER-<role>.md
    here — a hunter has no Write tool, so this is the only place that file is made. A transcript with
    no answer is a hunter that died or was cut off by the clock; it stays in the list, named. A
    HUNTER-<role>.md with no transcript beside it is read as it is.
    """
    found: dict = {}
    for j in sorted(out.glob("*.jsonl")):
        if j.name in (LEDGER, "claims.jsonl", "claims.draft.jsonl"):    # the ledgers (B56 K2), not a transcript
            continue
        role = j.stem
        txt = final_text(j)
        if txt:
            (out / f"HUNTER-{role}.md").write_text(txt, encoding="utf-8")
        found[role] = {"text": txt, "transcript": True, **stats(j), **read_meta(out / f"{role}.meta")}
    for h in sorted(out.glob("HUNTER-*.md")):
        role = h.stem[len("HUNTER-"):]
        if role not in found:
            found[role] = {"text": h.read_text(encoding="utf-8", errors="replace"), "transcript": False,
                           **read_meta(out / f"{role}.meta")}
    for h in found.values():
        h["parsed"] = parse_report(h["text"])
    known = [name for name, _ in fleet_roles()]
    order = [r for r in known if r in found] + sorted(r for r in found if r not in known)
    return {r: found[r] for r in order}


def main() -> int:
    argv = sys.argv[1:]
    crowd_file = None
    if "--crowd" in argv:
        i = argv.index("--crowd")
        crowd_file = pathlib.Path(argv[i + 1])
        del argv[i:i + 2]
    out = pathlib.Path(argv[0])
    hunters = collect(out)
    if not any(h["text"] for h in hunters.values()):
        print("hicbir avci rapor getirmedi — .err dosyalarina bak"); return 1

    # EACH HUNTER, FROM ITS OWN TRANSCRIPT. A call is not a fetch: an address counts under KAYNAK
    # only when the tool call that touched it came back without an error (measured 2026-09-17: a URL
    # inside a failing `echo` was counted as an opened source). SURE is set against the clock, so a
    # hunter that stopped at three minutes of ten is visible without opening a file.
    print(f"{'AVCI':<10}{'SURE':>10}{'PARA':>7}{'KAYNAK':>8}{'FETCH':>7}{'ADD':>6}  ACILAN KAPILAR")
    total_cost, seen = 0.0, set()
    for role, h in hunters.items():
        if not h["transcript"]:
            print(f"{role:<10}{'-':>10}{'-':>7}{'-':>8}{'-':>7}{'-':>6}  (transkript yok — rapor dosyadan okundu)")
            continue
        secs = h.get("secs", "?")
        sure = f"{secs}/{h['tmo']}s" if h.get("tmo") else f"{secs}s"
        total_cost += h["cost"]
        seen |= h["touched"]
        top = " ".join(sorted(h.get("doors") or {"-"}))
        print(f"{role:<10}{sure:>10}{h['cost']:>7.2f}{len(h['touched']):>8}{h['fetch']:>7}{h['add']:>6}  {top}")
    print(f"{'TOPLAM':<10}{'':>10}{total_cost:>7.2f}{len(seen):>8}")
    print("   (SURE = saniye / zaman asimi · KAYNAK = hatasiz arac cagrisinin actigi adres · "
          "FETCH, ADD = evidence.py komutu)")

    # THE LEDGER, COUNTED BY THE MACHINE. Every platform a hunter of this fleet owns is printed, a
    # zero included — zero is a real answer, and a platform that is not printed cannot be asked about.
    led = ledger(out)
    roles = fleet_roles()
    if led is None:
        print("\nDEFTER YOK — evidence.jsonl bulunamadi: hicbir satir sayilamadi, satir kimlikleri denetlenemedi.")
    else:
        # `rest` is the counter hunter's, `all` the claim roles' (karsi, bosluk): neither is a platform
        plats = list(dict.fromkeys([p for _, ps in roles for p in ps if p not in ("rest", "all")] + ["web"]))
        plats += sorted(p for p in led["found"] if p not in plats and p != "?")
        plats += ["?"] if "?" in led["found"] else []
        print("\nDEFTER — evidence.jsonl, makine sayimi (BULUNDU = ayri adres · GOVDELI = govdesi okunmus ayri adres)")
        print(f"{'PLATFORM':<16}{'BULUNDU':>8}{'GOVDELI':>9}")
        all_found, all_body = set(), set()
        for p in plats:
            f, b = led["found"].get(p, set()), led["body"].get(p, set())
            all_found |= f
            all_body |= b
            print(f"{p:<16}{len(f):>8}{len(b):>9}")
        print(f"{'TOPLAM':<16}{len(all_found):>8}{len(all_body):>9}")
        tail = f"   satir: {led['rows']}"
        if led["owners"]:
            tail += " · satir sahibi: " + " · ".join(
                f"{k} {v}" for k, v in sorted(led["owners"].items(), key=lambda kv: (-kv[1], kv[0])))
        if led["bad"]:
            tail += f" · OKUNAMAYAN SATIR: {led['bad']}"
        print(tail)

    # WHAT EACH HUNTER SAYS IT DID — its own lines, verbatim, and labelled as a claim. The count
    # stands one table up; an id it cites that the ledger does not hold is named, because a quote
    # that is not a row does not exist for the answer.
    print("\nAVCILARIN KENDI SATIRLARI — avcinin BEYANI, sayim degil (sayim: yukaridaki DEFTER)")
    for role, h in hunters.items():
        if not h["text"]:
            print(f"   [{role}] RAPOR YOK — kod {h.get('rc', '?')} · {h.get('secs', '?')}s: durum satiri gelmedi")
            continue
        rep = h["parsed"]
        for ln in rep["platforms"]:
            print(f"   [{role}] {ln[:220]}")
        if not rep["platforms"]:
            print(f"   [{role}] PLATFORM SATIRI YOK — hangi adresin okunup okunmadigini soylemedi")
        if rep["ids"]:
            if led is None:
                check = "defter yok, denetlenemedi"
            else:
                missing = [i for i in rep["ids"] if i not in led["ids"]]
                check = f"defterde {len(rep['ids']) - len(missing)} · DEFTERDE YOK {len(missing)}"
                check += f": {', '.join(missing[:12])}" if missing else ""
            print(f"   [{role}] KULLANDIGIM SATIRLAR: {len(rep['ids'])} kimlik — {check}")
        if rep["no_more"]:
            print(f"   [{role}] okunacak adres kalmadi (avcinin kendi satiri)")
        if rep["prose"]:
            print(f"   [{role}] +{rep['prose']} satir nesir — ozete alinmadi")

    # A REPORT THAT CITES NO ROW CANNOT BE CHECKED BY ANYBODY. Measured 2026-09-17 on the one kept
    # run: seven reports of seven carried zero source addresses and the answer was committed anyway.
    # A row carries its address by construction, so the hole is now a report with no row id.
    naked = [r for r, h in hunters.items() if h["text"] and not h["parsed"]["ids"]]
    if naked:
        print("\nSATIRSIZ RAPOR — bu avcilar defterden tek satir kimligi gostermedi, denetlenemezler:")
        for r in naked:
            print(f"   [{r}] HUNTER-{r}.md")

    # THE HUNTERS' OWN VERDICTS, SIDE BY SIDE. On the first fleet run four hunters contradicted each
    # other and NONE of it surfaced, because the comparison was left to a human who had not read
    # seven reports. A machine cannot judge which one is right, and this does not pretend to: it
    # puts the lines in one place so the contradiction cannot hide in file six of seven.
    verdicts = [(r, h["parsed"]["hukum"]) for r, h in hunters.items() if h["text"] and h["parsed"]["hukum"]]
    if verdicts:
        print("\nAVCILARIN KENDI HUKUMLERI — yan yana, celiski gizlenemesin diye:")
        for role, v in verdicts:
            print(f"   [{role}] {v[:200]}")
        print("   (Hangisinin dogru oldugu makinenin isi degildir; hepsini bir arada gormek odur.)")

    # THE DENOMINATOR, named for what it is.
    cc = crowd_count(crowd_file) if crowd_file else None
    if cc:
        print(f"\nINSAN (sayildi): {cc[1]} ayri kisi · {cc[0]} yorum · {cc[2]} baslik "
              f"— crowd.sh'in makine sayimi.")
    else:
        print("\nINSAN: SAYILMADI — bu kosuda makine sayimi yok. Bir avcinin kendi satirindaki sayi "
              "payda olarak kullanilamaz.")

    # THE GROUND. Since 2026-09-17 the fleet opens it ITSELF before any hunter is launched, so the
    # question "was Google searched at all?" is answered from the files on disk, not from what a
    # hunter chose to do.
    grounds = [d for d in sorted(out.glob("ground*")) if d.is_dir()]
    raws = [r for d in grounds for r in d.glob("*.raw")]
    if raws:
        def tot(name):
            # EVERY ground, not just the first: the fleet opens one per language, and the first
            # version of this line printed the Turkish ground's Google alone (2026-09-17).
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
    else:
        print("\nGENIS ZEMIN: bu kosunun klasorunde zemin yok.")

    print(f"\nraporlar: {out}/HUNTER-*.md")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
