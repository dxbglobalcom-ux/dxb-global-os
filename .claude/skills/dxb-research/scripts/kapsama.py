#!/usr/bin/env python3
"""THE COVERAGE RULER — per platform: what was found, fetched, judged, read, and what the answer stands on.

WHY IT EXISTS. On 2026-09-24 the CEO rejected a deep answer whose own ground had found 294 X
addresses; the hunters opened one of them and the answer cited none — and no line anywhere said so
before he read it. A ruler that PRINTS this defect is the first half of the repair (plan v2, B56).
On 2026-09-26 he asked why 272 X addresses became 4 on the page and wanted to open the 130 X posts
himself ("130 gönderinin açıp okuyabileceğim linklerde olmalı"): the ledger now carries a triage state
and a machine-marked read state on every row (EVIDENCE-B56-K1 §2.1), and this table prints them (§2.5):

    kapsama.py <run> [--answer <file>] [--legacy] [--format md|tsv]

    Platform | Bulundu | İndirildi | İlgili | Okundu | Kısmen | Kanıt | Cevapta | Elenen | Kapalı kapı

  Bulundu     distinct url_canonical in <run>/evidence.jsonl, by platform (scripts/platforms.py)
  İndirildi   distinct addresses with a body (bytes > 0 and liveness alive)
  İlgili      addresses whose triage is `relevant`
  Okundu      relevant addresses whose read_status is `read` — set only by evidence.py batch/page, when
              the machine printed the body to a hunter; a hunter's own "okundu" line counts nothing
  Kısmen      relevant addresses whose read_status is `partial`
  Kanıt       distinct addresses the ledger admits — ≥ 1 row evidence.admissible admits: what `evidence.py
              writer-rows` hands the writer, by address (claims.py evidence_use, the one owner; render.py's
              drawer counts the same); "-" when claims.py cannot be loaded
  Cevapta     distinct addresses behind the [Lxxxx] ids the answer cites and the ledger admits ("-"
              without --answer): a cited row evidence.admissible refuses (EVIDENCE-B56-K2 §2.1) is not in
              the answer — render.py strikes it, its drawer's "N cevapta" leaves it out, and so does this
              column; a run older than the triage states admits none. An id in the answer's `## Alınmayan
              kanıt` section is no citation (claims.py without_unused) — but one evidence.jsonl lacks is named
              under the table like any unknown id of the answer: render.py refuses the page for it
  Elenen      `ilgisiz: <reason> ×k` per reason, then `tekrar ×k`; first of all `bekleyen ×n` when n of the
              platform's addresses have a body and are still `pending` — the triage never judged them, so no
              hunter's batch printed them (evidence.py's pending_with_body; K2c: a failed triage batch of the K2 run
              left 60 X posts so)
  Kapalı kapı `inaccessible` by its reason, `<reason> ×k`; a door that closed on a row no triage ever
              saw (a run made before the field) in the old words, `kapı kapalı: <reason> ×k`; and the
              ground's own search doors — a channel that failed leaves no address, so its closed door
              is read from ground*/<channel>.code/.err/.raw and .judge, or it would be silence.

ONE ADDRESS, ONE STATE — AND ONE OWNER OF THE RULE. The ground's body row and a hunter's quote rows
can share one address; the row that stands for the address and the sums over the states are
evidence.py's own (address_row, ledger_counts — imported, not copied), so this table and
`evidence.py status` cannot disagree. A row born before the fields reads as pending / unread (§2.1), so
an old run is all pending — and still reconciles.

UNDER THE TABLE, the ledger's arithmetic, per platform and in total, in one line:
    RECONCILED — bulundu = bekleyen + ilgili + ilgisiz + tekrar + kapalı · ilgili = okundu + kısmen +
                 okunmadı · okundu = hüküm verilen + hüküm bekleyen (the hunter's verdict on a read row)
or `MISMATCH: <platform>: …` naming what broke it (a state the contract does not know) and its rows.
With --answer, a second line: the claim ledger (EVIDENCE-B56-K2 §2.4) — <run>/claims.jsonl beside the
answer, else claims.py's extract over it; render.py prints the same four under its "İddia defteri":
    İDDİA: n iddia · t tek kaynak · c karşısız · i kabul edilmeyen alıntı
and a third, what the answer did with the admitted addresses (the CEO's word, 2026-09-26 ~19:45):
    KANIT: a kabul · c cevapta · k alınmadı · açıklanmadı u
a the Kanıt column's sum, c Cevapta's, k = a − c, and u those of the k whose ids the answer's
`## Alınmayan kanıt` section does not name — all k when it has no such section.

THE ANSWER'S SUB-QUESTIONS (B56 K3 stage 1). With --answer, when <run>/subquestions.json is there — the fleet split
his question into the sub-questions his DERT holds (scripts/split.py), and the writer gave each its `## S1 — …`
section (fleet/writer-prompt.md rule 11) — a second table follows those lines, one row per sub-question in S-order:

    Alt soru | İddia | Satır | Bağımsız kaynak | Karşı | Durum

  its claims and the distinct admitted rows, independent sources and counter rows they stand on (claims.py
  sub_counts over claims.py's extract of this answer — render.py's line under each S-heading counts the same),
  and Durum: `tam` ≥ 1 claim · `boş` no claim, its section holding `Bu alt soruya satır yok.` · `eksik` no claim
  and no such line — the writer dropped it. Under it: `ALT SORU: N · tam t · boş b (S3 …) · eksik e (…)`.
  Without subquestions.json nothing of this is printed.

THE AUDITOR (B56 K3 stage 3). With --answer, when the fleet's auditor has read the answer (scripts/audit.py) and its
record stands beside it, <run>/audit.jsonl, a line after KANIT:
    DENETÇİ: N okundu · d düzeltildi · r çıkarıldı · u denetlenmedi
audit.py's own tally — N the claims it gave a verdict, u those it did not read. Without audit.jsonl nothing is printed.

One row per platform present (it has an address, or a ground channel of it ran) plus `web`.
--legacy reads a run made before v2 (no evidence.jsonl) and prints its old five columns, unchanged:
Bulundu = the addresses in sources.json by platform (X = x.com + twitter.com + t.co), Okundu = addresses
handed to a body reader in the hunters' *.jsonl tool calls, Cevapta = addresses in the answer file
(default <run>/final.md); the rule is printed under the table.

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
COLUMNS = ("Platform", "Bulundu", "İndirildi", "İlgili", "Okundu", "Kısmen", "Kanıt", "Cevapta", "Elenen",
           "Kapalı kapı")
SUB_COLUMNS = ("Alt soru", "İddia", "Satır", "Bağımsız kaynak", "Karşı", "Durum")


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
    exactly platforms.CITE_RE ([L0042] or [L0042, L0043]), a paired one ([L0042 ↔ L0051]) the two it
    holds (platforms.split_paired, render.py's reading too); `[bkz. L0002]`, `[L0001 ]` or `[l0003]`
    is not one — render.py would not number it — so it is not counted, it is named."""
    ids, bad = [], Counter()
    for m in BRACKET.finditer(P.split_paired(text or "")):
        group = m.group(0)
        if P.CITE_RE.fullmatch(group):
            ids += re.findall(r"L\d{4}", group)
        elif re.search(r"\b[Ll]\d{4}\b", group):
            bad[group] += 1
    return ids, bad


def tally(answered: bool, ledger: Counter | None = None, admitted: bool = True) -> dict:
    """One platform's row: the ledger's own counts (evidence.py ledger_counts), plus what this table adds."""
    c = ledger or Counter()
    return {"found": c["discovered"], "relevant": c["relevant"], "read": c["read"], "partial": c["partial"],
            "duplicate": c["duplicate"], "fetched": 0, "admitted": 0 if admitted else None,
            "cited": 0 if answered else None, "waiting": c["pending_with_body"],
            "irrelevant": Counter(), "inaccessible": Counter(), "closed": Counter()}


def one_line(text, limit: int = 80) -> str:
    return " ".join(str(text or "").split()).replace("|", "/")[:limit]


def by_count(c: Counter) -> list[tuple[str, int]]:
    return sorted(c.items(), key=lambda kv: (-kv[1], kv[0]))


def table_v2(run: Path, answer: Path | None) -> tuple[dict, list[str], str, str, str, list[dict] | str | None]:
    """The ten columns, the notes, the ledger's line and, with an answer, the claim ledger's line
    (claim_line) and the admitted addresses' (kanit_line); "" without one — and the sub-questions' table
    (sub_table; None without an answer or subquestions.json). evidence.py and claims.py are
    imported here, not at the top: --legacy never needs them, and a failure to load evidence.py is printed
    by main, never raised; without claims.py Kanıt is "-" and the KANIT line says why."""
    import evidence as E  # noqa: E402 — the ledger's owner: the address row, the states, their sums
    try:
        import claims as CL  # noqa: E402 — the admitted addresses, the answer's `## Alınmayan kanıt` section
        no_claims = ""
    except Exception as e:
        CL, no_claims = None, f"{type(e).__name__}: {e}"
    notes: list[str] = []
    ev = run / "evidence.jsonl"
    if not ev.is_file():
        notes.append(f"(evidence.jsonl yok: {ev} — adres sayılamadı)")
    every = read_jsonl(ev)
    ledger, odd = E.ledger_counts(run, every)
    by_id: dict[str, str] = {}
    row_of: dict[str, dict] = {}
    for r in every:
        canon = r.get("url_canonical") or P.canonical_url(r.get("url") or "")
        if canon and r.get("id"):
            by_id[r["id"]], row_of[r["id"]] = canon, r
    cited, said, md = None, "", ""
    if answer is not None:
        try:
            md = answer.read_text(encoding="utf-8", errors="replace")
            ids, bad = citations(md)     # named when unknown or malformed wherever they stand, as render.py refuses them
            body = citations(CL.without_unused(md))[0] if CL else ids      # its `## Alınmayan kanıt` section cites nothing
            index = E.address_index(every) if hasattr(E, "admissible") else None     # render.py's rule, one owner
            cited = {by_id[i] for i in body if i in by_id and (index is None or E.admissible(row_of[i], index.get(i))[0])}
            unknown = sorted({i for i in ids if i not in by_id})
            if unknown:
                notes.append("(cevaptaki bu kimlikler evidence.jsonl'da yok: " + " ".join(unknown[:12]) + ")")
            notes += [f"biçimsiz atıf: {g} ×{k}" for g, k in bad.items()]
            said = claim_line(answer, md, every)
        except OSError:
            notes.append(f"(cevap dosyası okunamadı: {answer})")
    use = CL.evidence_use(md, every) if CL else None
    rows: dict[str, dict] = {}
    for canon, rs in E.by_canon(every).items():
        addr = E.address_row(rs)
        if not canon or addr is None:
            continue
        p = E.row_platform(addr, canon)
        t = rows.setdefault(p, tally(cited is not None, ledger.get(p), use is not None))
        if any((r.get("bytes") or 0) > 0 and r.get("liveness") == "alive" for r in rs):
            t["fetched"] += 1
        if use is not None and canon in use:
            t["admitted"] += 1
        if cited is not None and canon in cited:
            t["cited"] += 1
        state = E.triage_of(addr)
        if state == "irrelevant":
            t["irrelevant"][one_line(addr.get("triage_reason")) or "gerekçe yok"] += 1
        elif state == "inaccessible":
            t["inaccessible"][one_line(short_reason(addr.get("triage_reason"), "kapalı", None))] += 1
        elif state == "pending":                 # a door that closed before any triage saw the row
            shut = [r for r in rs if r.get("liveness") in ("blocked", "dead")]
            if shut:
                t["closed"][short_reason(shut[-1].get("notes"), shut[-1]["liveness"], shut[-1].get("http_status"))] += 1
    kanit = "" if cited is None else kanit_line(use, cited) if use is not None else f"KANIT: hesaplanamadı ({no_claims})"
    alt = None if cited is None else sub_table(run, md, every, CL, no_claims)
    return rows, notes, ledger_line(E, ledger, odd), said, kanit, alt


def sub_table(run: Path, md: str, every: list[dict], CL, no_claims: str) -> list[dict] | str | None:
    """One row per sub-question <run>/subquestions.json names, in its order: its claims, the distinct admitted
    rows, independent sources and counter rows they stand on (claims.py sub_counts over the extract of this
    answer) and its state — `tam` · `boş` (no claim, its section holds the gap line) · `eksik` (no claim, no gap
    line). None without subquestions.json; one line saying why when it cannot be counted."""
    path = run / "subquestions.json"
    if not path.is_file():
        return None
    try:
        items = [(str(i["id"]), one_line(i["title"], 60)) for i in json.loads(path.read_text(encoding="utf-8"))["items"]]
    except (OSError, ValueError, KeyError, TypeError) as e:
        return f"ALT SORU: hesaplanamadı (subquestions.json okunamadı: {type(e).__name__})"
    if CL is None:
        return f"ALT SORU: hesaplanamadı ({no_claims})"
    by_id = {r["id"]: r for r in every if isinstance(r.get("id"), str)}
    counts = CL.sub_counts(CL.extract_claims(P.split_paired(md), by_id), by_id)
    held = CL.sub_sections(md)
    out = []
    for sid, title in items:
        c = counts.get(sid) or {"claims": 0, "rows": 0, "sources": 0, "counter": 0}
        state = "tam" if c["claims"] else "boş" if held.get(sid, {}).get("gap") else "eksik"
        out.append({"id": sid, "title": title, **c, "state": state})
    return out


def render_sub(subs: list[dict], fmt: str) -> str:
    """The sub-questions' table and its line — `ALT SORU: N · tam t · boş b (S…) · eksik e (S…)` — after a blank
    line, so it stands as a table of its own under the platform table's lines."""
    if fmt == "md":
        lines = ["| " + " | ".join(SUB_COLUMNS) + " |", "|---|" + "---:|" * 4 + "---|"]
        lines += [f"| {s['id']} — {s['title']} | {s['claims']} | {s['rows']} | {s['sources']} | {s['counter']} | "
                  f"{s['state']} |" for s in subs]
    else:
        lines = ["alt_soru\tiddia\tsatir\tbagimsiz_kaynak\tkarsi\tdurum"]
        lines += [f"{s['id']}\t{s['claims']}\t{s['rows']}\t{s['sources']}\t{s['counter']}\t{s['state']}" for s in subs]
    said = [f"{st} {len(ids)}" + (f" ({' '.join(ids)})" if ids and st != "tam" else "")
            for st in ("tam", "boş", "eksik") for ids in [[s["id"] for s in subs if s["state"] == st]]]
    return "\n" + "\n".join(lines + [f"ALT SORU: {len(subs)} · " + " · ".join(said)])


def kanit_line(use: dict, cited: set) -> str:
    """What the answer did with the admitted addresses (the CEO's word, 2026-09-26 ~19:45), in one line: kabul
    — the Kanıt column's sum; cevapta — of those, the ones Cevapta counts; alınmadı — the rest; açıklanmadı —
    of the rest, the ones whose ids the answer's `## Alınmayan kanıt` section does not name."""
    left = [a for canon, a in use.items() if canon not in cited]
    quiet = sum(1 for a in left if a["reason"] is None)
    return f"KANIT: {len(use)} kabul · {len(use) - len(left)} cevapta · {len(left)} alınmadı · açıklanmadı {quiet}"


def audit_line(answer: Path) -> str:
    """The auditor's numbers in one line (B56 K3 stage 3) — `DENETÇİ: N okundu · d düzeltildi · r çıkarıldı · u
    denetlenmedi` — from <run>/audit.jsonl beside the answer, counted by audit.py's own tally (imported here, like
    claims.py); '' when there is no such file. It prints, never blocks: a record that cannot be counted is said."""
    path = answer.parent / "audit.jsonl"
    if not path.is_file():
        return ""
    try:
        import audit as AU  # noqa: E402 — the auditor's owner: its records and its tally
        records = AU.read_jsonl(path)
        if records is None:
            return "DENETÇİ: hesaplanamadı (audit.jsonl okunamadı)"
        t = AU.tally(records)
    except Exception as e:
        return f"DENETÇİ: hesaplanamadı ({type(e).__name__}: {e})"
    return (f"DENETÇİ: {t['read']} okundu · {t['corrected']} düzeltildi · {t['removed']} çıkarıldı · "
            f"{t['unaudited']} denetlenmedi")


def claim_line(answer: Path, md: str, every: list[dict]) -> str:
    """The claim ledger in one line: <run>/claims.jsonl beside the answer when it is there (the claim
    hunters' links and states live in it), else claims.py's extract over the answer — imported here, not
    at the top, like evidence.py. It prints, never blocks: a ledger that cannot be had is said."""
    try:
        if (answer.parent / "claims.jsonl").is_file():
            book = read_jsonl(answer.parent / "claims.jsonl")
        else:
            import claims as CL  # noqa: E402 — the claim ledger's owner: sides, admitted rows, sources
            book = CL.extract_claims(P.split_paired(md), {r["id"]: r for r in every if isinstance(r.get("id"), str)})
    except Exception as e:
        return f"İDDİA: hesaplanamadı ({type(e).__name__}: {e})"
    thin = sum(1 for c in book if c.get("thin"))
    bare = sum(1 for c in book if not c.get("counter_rows"))
    gone = len({i for c in book for i in c.get("inadmissible") or []})
    return f"İDDİA: {len(book)} iddia · {thin} tek kaynak · {bare} karşısız · {gone} kabul edilmeyen alıntı"


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
    """The five old columns — --legacy only."""
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


def render_v2(rows: dict, doors: dict, present: set, fmt: str) -> str:
    plats = [p for p in P.PLATFORMS if p in rows or p in present or p in doors or p == "web"]
    empty = "—" if fmt == "md" else "-"
    answered = any(t.get("cited") is not None for t in rows.values())
    counted = any(t.get("admitted") is not None for t in rows.values())
    lines = ["| " + " | ".join(COLUMNS) + " |", "|---|" + "---:|" * 7 + "---|---|"] if fmt == "md" \
        else ["platform\tbulundu\tindirildi\tilgili\tokundu\tkismen\tkanit\tcevapta\telenen\tkapali"]
    for p in plats:
        t = rows.get(p) or tally(answered, None, counted)
        gone = [f"bekleyen ×{t['waiting']}"] if t["waiting"] else []
        gone += [f"ilgisiz: {k} ×{n}" for k, n in by_count(t["irrelevant"])]
        gone += [f"tekrar ×{t['duplicate']}"] if t["duplicate"] else []
        shut = [f"{k} ×{n}" for k, n in by_count(t["inaccessible"])]
        shut += [f"kapı kapalı: {k} ×{n}" for k, n in by_count(t["closed"])] + doors.get(p, [])
        cells = [P.LABEL[p] if fmt == "md" else p, t["found"], t["fetched"], t["relevant"], t["read"],
                 t["partial"], "-" if t["admitted"] is None else t["admitted"],
                 "-" if t["cited"] is None else t["cited"], " · ".join(gone) or empty, " · ".join(shut) or empty]
        if fmt == "md":
            lines.append("| " + " | ".join(str(c).replace("|", "/") for c in cells) + " |")
        else:
            lines.append("\t".join(str(c) for c in cells))
    return "\n".join(lines)


def ledger_line(E, ledger: dict, odd: dict) -> str:
    """The ledger's arithmetic (EVIDENCE-B56-K1 §2.2/§2.5) over evidence.py's own counts, per platform and
    in total, in his words. A state the contract does not know is counted nowhere, so a sum breaks and the
    line names the rows. One line, never an exit code."""
    total, bad = Counter(), []
    for p in sorted(ledger, key=lambda p: (P.PLATFORMS.index(p) if p in P.PLATFORMS else len(P.PLATFORMS), p)):
        total.update(ledger[p])
        bad += sums_broken(P.LABEL.get(p, p), ledger[p], E)
    bad += sums_broken("TOPLAM", total, E)
    if bad:
        named = [x for p in ledger for x in odd.get(p, [])]
        return "MISMATCH: " + "; ".join(bad) + (" — satırlar: " + ", ".join(named[:8]) if named else "")
    t = total
    return (f"RECONCILED — bulundu {t['discovered']} = bekleyen {t['pending']} + ilgili {t['relevant']} + ilgisiz "
            f"{t['irrelevant']} + tekrar {t['duplicate']} + kapalı {t['inaccessible']} · ilgili {t['relevant']} = "
            f"okundu {t['read']} + kısmen {t['partial']} + okunmadı {t['unread']} · okundu {t['read']} = hüküm "
            f"verilen {t['judged']} + hüküm bekleyen {t['unjudged']}")


def sums_broken(name: str, c: Counter, E) -> list[str]:
    out = []
    states = sum(c[k] for k in E.TRIAGE_STATES)
    if c["discovered"] != states:
        out.append(f"{name}: bulundu {c['discovered']} ≠ bekleyen+ilgili+ilgisiz+tekrar+kapalı {states}")
    if c["relevant"] != c["read"] + c["partial"] + c["unread"]:
        out.append(f"{name}: ilgili {c['relevant']} ≠ okundu+kısmen+okunmadı {c['read'] + c['partial'] + c['unread']}")
    if c["read"] != c["judged"] + c["unjudged"]:
        out.append(f"{name}: okundu {c['read']} ≠ hüküm verilen+bekleyen {c['judged'] + c['unjudged']}")
    return out


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
        present, doors = ground_doors(run)
        if a.legacy:
            rows, notes = table_legacy(run, answer, default_answer=not a.answer)
            print(render(rows, doors, present, a.format))
        else:
            rows, notes, line, said, kanit, alt = table_v2(run, answer)
            print(render_v2(rows, doors, present, a.format))
            print(line)
            if said:
                print(said)
            if kanit:
                print(kanit)
            audit = audit_line(answer) if answer is not None else ""
            if audit:
                print(audit)
            if alt is not None:
                print(alt if isinstance(alt, str) else render_sub(alt, a.format))
        for n in notes:
            print(n)
    except Exception as e:                        # the ruler prints; it does not stop the page
        print(f"kapsama: hesaplanamadı ({type(e).__name__}: {e})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
