#!/usr/bin/env python3
"""THE COVERAGE RULER — per platform: what was found, what was read, what the answer stands on.

WHY IT EXISTS. On 2026-09-24 the CEO rejected a deep answer whose own ground had found 294 X
addresses; the hunters opened one of them and the answer cited none — and no line anywhere said so
before he read it. A ruler that PRINTS this defect is the first half of the repair (plan v2, B56):

    kapsama.py <run> [--answer <file>] [--legacy] [--format md|tsv]

    Platform | Bulundu | Okundu | Cevapta | Okunmadı / kapalı kapı

  Bulundu  distinct url_canonical in <run>/evidence.jsonl, by platform (scripts/platforms.py)
  Okundu   distinct addresses with a body (bytes > 0 and liveness alive)
  Cevapta  distinct addresses behind the [Lxxxx] ids the answer cites ("-" without --answer)
  Okunmadı kapı kapalı: <reason> ×k (blocked/dead, by reason) · denenmedi ×m (never tried) — and
           the ground's own search doors: a channel that failed leaves no address, so its closed
           door is read from ground*/<channel>.code/.err/.raw and .judge, or it would be silence.

One row per platform present (it has an address, or a ground channel of it ran) plus `web`.
--legacy reads a run made before v2 (no evidence.jsonl): Bulundu = the addresses in sources.json by
platform (X = x.com + twitter.com + t.co), Okundu = addresses handed to a body reader in the hunters'
*.jsonl tool calls, Cevapta = addresses in the answer file (default <run>/final.md); the rule is
printed under the table.

PRINTS, NEVER BLOCKS: exit 0 whatever the numbers — even when something here cannot be computed,
the reason is printed and the exit stays 0. Exit 1 only when <run> does not exist.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from pathlib import Path

sys.dont_write_bytecode = True     # the skill folder is read-only inside a hunter's jail
sys.path.insert(0, str(Path(__file__).resolve().parent))
import platforms as P  # noqa: E402

BRACKET = re.compile(r"\[[^\[\]\n]*\]")
# the body readers of the contract, as they appear in a hunter's Bash call
READER = re.compile(r"opencli\s+twitter\s+(?:thread|comments)\b|opencli\s+reddit\s+read\b|"
                    r"opencli\s+youtube\s+(?:transcript|comments)\b|hidden\.py[\"']?\s+read\b|fetch\.py\b")
MEASURED = ("x", "youtube", "tiktok", "instagram", "facebook", "linkedin", "reddit")


urls_in = P.urls_in


def read_jsonl(path: Path) -> list[dict]:
    out = []
    try:
        lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
    except OSError:
        return out
    for line in lines:
        try:
            obj = json.loads(line)
        except ValueError:
            continue
        if isinstance(obj, dict):
            out.append(obj)
    return out


def short_reason(note: str, liveness: str, status) -> str:
    if status:
        return f"{liveness} {status}"
    note = (note or "").strip()
    m = re.match(r"^(.+? kod -?\d+)", note)
    if m:
        return m.group(1)[:70]
    return (note.split(":")[0][:70] if note else liveness) or "kapalı"


def ground_doors(run: Path) -> tuple[set, dict]:
    """The sweep's channels per platform, and the ones that came back with nothing to read."""
    present, doors, first_err = set(), {}, {}
    for g in sorted(d for d in run.glob("ground*") if d.is_dir()):
        judge = {}
        try:
            for line in (g / ".judge").read_text(encoding="utf-8").splitlines():
                name, _, verdict = line.partition("\t")
                judge[name] = verdict.strip()
        except OSError:
            pass
        for cf in sorted(g.glob("*.code")):
            chan = cf.stem
            if "-via-" in chan:                   # a stand-in's run, not the platform's own door
                continue
            plat = P.CHANNEL_PLATFORM.get(chan, "web")
            present.add(plat)
            code = cf.read_text(encoding="utf-8", errors="replace").strip() or "?"
            raw = g / f"{chan}.raw"
            size = raw.stat().st_size if raw.is_file() else 0
            if code != "0":
                key = f"kapı kapalı: arama {chan} kod {code}"
                try:
                    err = P.door_said((g / f"{chan}.err").read_text(encoding="utf-8", errors="replace"))
                except OSError:
                    err = ""
                first_err.setdefault(key, err[:80])
            elif judge.get(chan) == "BROKEN":
                key = f"kapı kapalı: arama {chan} hata sayfası"
            elif size < 40:
                key = f"arama boş: {chan}"
            else:
                continue
            doors.setdefault(plat, Counter())[key] += 1
    out = {}
    for plat, c in doors.items():
        out[plat] = [f"{k}{(' — ' + first_err[k]) if first_err.get(k) else ''} ×{n}" for k, n in c.items()]
    return present, out


def citations(text: str) -> tuple[list[str], Counter]:
    """The ids the answer cites, and the bracket groups that only LOOK like a citation. A citation is
    exactly platforms.CITE_RE ([L0042] or [L0042, L0043]); `[bkz. L0002]`, `[L0001 ]` or `[l0003]`
    is not one — render.py would not number it — so it is not counted, it is named."""
    ids, bad = [], Counter()
    for m in BRACKET.finditer(text or ""):
        group = m.group(0)
        if P.CITE_RE.fullmatch(group):
            ids += re.findall(r"L\d{4}", group)
        elif re.search(r"\b[Ll]\d{4}\b", group):
            bad[group] += 1
    return ids, bad


def table_v2(run: Path, answer: Path | None) -> tuple[dict, list[str]]:
    notes: list[str] = []
    ev = run / "evidence.jsonl"
    if not ev.is_file():
        notes.append(f"(evidence.jsonl yok: {ev} — adres sayılamadı)")
    urls: dict[str, dict] = {}
    by_id: dict[str, str] = {}
    for r in read_jsonl(ev):
        canon = r.get("url_canonical") or P.canonical_url(r.get("url") or "")
        if not canon:
            continue
        plat = r.get("platform") if r.get("platform") in P.PLATFORMS else P.platform_of(canon)
        u = urls.setdefault(canon, {"platform": plat, "read": False, "closed": None})
        if (r.get("bytes") or 0) > 0 and r.get("liveness") == "alive":
            u["read"] = True
        if r.get("liveness") in ("blocked", "dead"):
            u["closed"] = short_reason(r.get("notes"), r["liveness"], r.get("http_status"))
        if r.get("id"):
            by_id[r["id"]] = canon
    cited = None
    if answer is not None:
        try:
            ids, bad = citations(answer.read_text(encoding="utf-8", errors="replace"))
            cited = {by_id[i] for i in ids if i in by_id}
            unknown = sorted({i for i in ids if i not in by_id})
            if unknown:
                notes.append("(cevaptaki bu kimlikler evidence.jsonl'da yok: " + " ".join(unknown[:12]) + ")")
            notes += [f"biçimsiz atıf: {g} ×{k}" for g, k in bad.items()]
        except OSError:
            notes.append(f"(cevap dosyası okunamadı: {answer})")
    rows: dict[str, dict] = {}
    for canon, u in urls.items():
        t = rows.setdefault(u["platform"], {"found": 0, "read": 0, "cited": 0 if cited is not None else None,
                                            "closed": Counter(), "untried": 0})
        t["found"] += 1
        if u["read"]:
            t["read"] += 1
        elif u["closed"]:
            t["closed"][u["closed"]] += 1
        else:
            t["untried"] += 1
        if cited is not None and canon in cited:
            t["cited"] += 1
    return rows, notes


def table_legacy(run: Path, answer: Path | None, default_answer: bool = True) -> tuple[dict, list[str]]:
    notes: list[str] = []
    found: dict[str, list[str]] = {}
    try:
        src = json.loads((run / "sources.json").read_text(encoding="utf-8", errors="replace")).get("sources") or []
    except (OSError, ValueError, AttributeError):
        src = []
        notes.append(f"(sources.json okunamadı: {run / 'sources.json'})")
    for s in src:
        url = str(s.get("url") or "") if isinstance(s, dict) else ""
        if url.startswith(("http://", "https://")):
            found.setdefault(P.platform_of(url), []).append(P.canonical_url(url))
    read: dict[str, set] = {}
    for jf in sorted(run.glob("*.jsonl")):
        for obj in read_jsonl(jf):
            if obj.get("type") != "assistant":
                continue
            for c in (obj.get("message") or {}).get("content") or []:
                if not isinstance(c, dict) or c.get("type") != "tool_use":
                    continue
                inp = c.get("input") or {}
                if c.get("name") == "WebFetch":
                    handed = urls_in(str(inp.get("url") or ""))
                elif c.get("name") == "Bash" and READER.search(str(inp.get("command") or "")):
                    handed = urls_in(str(inp.get("command") or ""))
                else:
                    continue
                for u in handed:
                    if P.reject(u) != "invalid":
                        canon = P.canonical_url(u)
                        read.setdefault(P.platform_of(canon), set()).add(canon)
    cited = None
    if answer is None and default_answer and (run / "final.md").is_file():
        answer = run / "final.md"
    if answer is not None:
        try:
            cited = {}
            for u in urls_in(answer.read_text(encoding="utf-8", errors="replace")):
                if P.reject(u) != "invalid":
                    canon = P.canonical_url(u)
                    cited.setdefault(P.platform_of(canon), set()).add(canon)
        except OSError:
            cited = None
            notes.append(f"(cevap dosyası okunamadı: {answer})")
    rows: dict[str, dict] = {}
    for plat in set(found) | set(read):
        rd = read.get(plat, set())
        rows[plat] = {"found": len(found.get(plat, [])), "read": len(rd),
                      "cited": len(cited.get(plat, set())) if cited is not None else None,
                      "closed": Counter(), "untried": sum(1 for c in found.get(plat, []) if c not in rd)}
    for plat in MEASURED:
        if 0 < len(read.get(plat, ())) <= 5:
            notes.append(f"Okundu — {P.LABEL[plat]}: " + " · ".join(sorted(read[plat])))
    notes.append(
        "Kural (--legacy): Bulundu = sources.json'daki adresler, platforma göre (X = x.com + twitter.com + "
        "t.co; alan adının kendisi, yardım alt alanları değil). Okundu = avcıların *.jsonl araç "
        "çağrılarında bir gövde okuyucusuna verilen farklı adresler: WebFetch'in url'si, ve okuyucu içeren "
        "her Bash çağrısındaki her adres (opencli twitter thread|comments · opencli reddit read · opencli "
        "youtube transcript|comments · hidden.py read · fetch.py). Cevapta = "
        f"{answer.name if answer else 'cevap dosyası'} içindeki farklı adresler. Okunmadı = Bulundu'dan "
        "Okundu'ya hiç girmeyenler (denenmedi).")
    return rows, notes


def render(rows: dict, doors: dict, present: set, fmt: str) -> str:
    plats = [p for p in P.PLATFORMS if p in rows or p in present or p in doors or p == "web"]
    empty = "—" if fmt == "md" else "-"
    answered = any(t.get("cited") is not None for t in rows.values())
    lines = ["| Platform | Bulundu | Okundu | Cevapta | Okunmadı / kapalı kapı |", "|---|---:|---:|---:|---|"] \
        if fmt == "md" else ["platform\tbulundu\tokundu\tcevapta\tokunmadi"]
    for p in plats:
        t = rows.get(p) or {"found": 0, "read": 0, "cited": 0 if answered else None, "closed": Counter(),
                            "untried": 0}
        parts = [f"denenmedi ×{t['untried']}"] if t["untried"] else []
        parts += [f"kapı kapalı: {k} ×{n}" for k, n in sorted(t["closed"].items(), key=lambda kv: -kv[1])]
        parts += doors.get(p, [])
        cited = "-" if t["cited"] is None else str(t["cited"])
        cell = " · ".join(parts) or empty
        if fmt == "md":
            lines.append(f"| {P.LABEL[p]} | {t['found']} | {t['read']} | {cited} | {cell.replace('|', '/')} |")
        else:
            lines.append(f"{p}\t{t['found']}\t{t['read']}\t{cited}\t{cell}")
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="kapsama.py", description="coverage per platform — prints, never blocks")
    ap.add_argument("run")
    ap.add_argument("--answer")
    ap.add_argument("--legacy", action="store_true")
    ap.add_argument("--format", choices=("md", "tsv"), default="md")
    a = ap.parse_args(argv)
    run = Path(a.run)
    if not run.is_dir():
        print(f"kapsama: koşu klasörü yok: {run}", file=sys.stderr)
        return 1
    try:
        answer = Path(a.answer) if a.answer else None
        if answer is not None and not answer.is_file():
            print(f"(cevap dosyası yok: {answer} — Cevapta sayılmadı)")
            answer = None
        rows, notes = table_legacy(run, answer, default_answer=not a.answer) if a.legacy \
            else table_v2(run, answer)
        present, doors = ground_doors(run)
        print(render(rows, doors, present, a.format))
        for n in notes:
            print(n)
    except Exception as e:                        # the ruler prints; it does not stop the page
        print(f"kapsama: hesaplanamadı ({type(e).__name__}: {e})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
