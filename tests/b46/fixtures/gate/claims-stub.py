#!/usr/bin/env python3
"""THE CLAIM LEDGER'S STAND-IN FOR THE FLEET'S TAIL (tests/b46/completion-gate.test.ts).

Copied over scripts/claims.py INSIDE the gate bench's copy of the engine, never in the repository. It keeps
real state in <run>/claims*.jsonl and answers what the fleet and its stand-in claim hunters call, in the
shapes the contract fixes (EVIDENCE-B56-K2 §2.2): extract [--answer] [--out] [--keep-links], list --todo
counter|gap [--cap] [--candidates], link, status [--format md|json], brief [--ledger]. list, link and status
work on claims.draft.jsonl while the draft pass's ledger is there, else on claims.jsonl. The real claims.py
is Lane A's and has its own cases; what is measured here is what the FLEET does with the answers.
FAKE_CLAIM_STATUS=unreadable makes `status` print nothing and leave with code 2; FAKE_CLAIM_STATUS=garbage
makes it print a line that is not JSON and leave with code 0. FAKE_CLAIM_EXTRACT=draft-fails makes the
draft pass's extract (--out claims.draft.jsonl) write nothing and leave with code 2. A --keep-links ledger
that cannot be read is refused with code 2, as the real claims.py refuses it.
"""
import argparse
import fcntl
import json
import os
import re
import sys
from contextlib import contextmanager
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import evidence  # noqa: E402 — the gate's ledger stand-in, beside this file in the bench

ID = re.compile(r"L\d{4,}")
SEP = re.compile(r"^\s*\|?[\s:|-]+\|?\s*$")
GENERIC = re.compile(r"commenter|author|user|anonymous|unknown|anon|redditor|digest|via |blog", re.I)
WORD = re.compile(r"[^\W\d_]{4,}")
TALLY = (("todo", "unchecked"), ("sent", "sent"), ("found", "found"), ("none", "none"), ("cap", "not-sent (cap)"))


@contextmanager
def locked(run):
    with open(run / "evidence.lock", "a") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        yield


def read(p):
    try:
        return [json.loads(x) for x in p.read_text(encoding="utf-8").splitlines() if x.strip()]
    except (OSError, ValueError):
        return None


def write(p, claims):
    p.write_text("".join(json.dumps(c, ensure_ascii=False) + "\n" for c in claims), encoding="utf-8")


def rows_of(run):
    return {r["id"]: r for r in evidence.load(run)}


def ok(rows, i):
    return evidence.admissible(rows[i], evidence.address_of(list(rows.values()), rows[i])) if i in rows else (False, "defterde yok")


def source_key(r):
    a = str(r.get("author") or "").strip()
    real = a and a not in ("?", "-") and not GENERIC.search(a)
    return f"{r.get('platform')}:{a.casefold()}" if real else (r.get("url_canonical") or r.get("url"))


def cited(text):
    return [i for b in re.findall(r"\[([^\]]*)\]", text) for i in ID.findall(b)]


def sides(line):
    parts = line.split("↔")
    if len(parts) >= 2 and cited(parts[0]) and cited("".join(parts[1:])):
        return cited(parts[0]), cited("".join(parts[1:]))
    return cited(line), []


def extract_claims(md, rows):
    lines, out, section, seen_h2 = md.splitlines(), [], None, False
    for n, line in enumerate(lines, 1):
        if line.startswith("## "):
            section, seen_h2 = line[3:].strip(), True
            continue
        if SEP.match(line) or (line.lstrip().startswith("|") and n < len(lines) and SEP.match(lines[n])):
            continue                                    # a table's separator, and its header row
        sup, cou = sides(line)
        if not sup and not cou:
            continue
        bad = [i for i in dict.fromkeys(sup + cou) if not ok(rows, i)[0]]
        s_ok, c_ok = [i for i in sup if i not in bad], [i for i in cou if i not in bad]
        sources = len({source_key(rows[i]) for i in s_ok})
        text = re.sub(r"\s+", " ", re.sub(r"\[[^\]]*\]|[|*#>↔`]", " ", line)).strip()
        out.append({"id": f"C{len(out) + 1:03d}", "line": n, "section": section, "text": text[:300],
                    "kind": "claim" if seen_h2 else "verdict", "support": sup, "counter": cou, "inadmissible": bad,
                    "rows": len(s_ok), "sources": sources,
                    "threads": len({rows[i].get("url_canonical") or rows[i]["url"] for i in s_ok}),
                    "domains": len({(rows[i].get("url") or "").split("/")[2] for i in s_ok}),
                    "counter_rows": len(c_ok), "counter_sources": len({source_key(rows[i]) for i in c_ok}),
                    "thin": sources < 2 and len(s_ok) >= 1,
                    "counter_status": "unchecked" if len(s_ok) >= 2 and not c_ok else "-",
                    "gap_status": "unchecked" if sources < 2 and s_ok else "-",
                    "links": [], "notes": [], "checked_by": None})
    return out


def carry(new, old):
    """--keep-links: the old claim whose support overlaps a new one's by >= 50 % (Jaccard), best first,
    one old to one new, hands over its links, statuses, notes and checker."""
    pairs = []
    for o in old:
        for c in new:
            a, b = set(o.get("support") or []), set(c["support"])
            if a and b and len(a & b) / len(a | b) >= 0.5:
                pairs.append((-len(a & b) / len(a | b), o["id"], c["id"], o, c))
    used, carried = set(), 0
    for _, oid, cid, o, c in sorted(pairs, key=lambda p: p[:3]):
        if oid in used or cid in used:
            continue
        used |= {oid, cid}
        for k in ("counter_status", "gap_status"):
            if o.get(k) in ("sent", "found", "none", "not-sent (cap)"):
                c[k] = o[k]
        c.update(links=list(o.get("links") or []), notes=list(o.get("notes") or []), checked_by=o.get("checked_by"))
        carried += bool(c["links"] or c["notes"] or c["checked_by"])
    return carried


def line160(r):
    said = re.sub(r"\s+", " ", str(r.get("passage") or r.get("title") or "")).strip()[:160]
    return f'[{r["id"]}] {r.get("platform") or "?"} · @{r.get("author") or "?"} · {r.get("pub_date") or "?"} · "{said}"'


def is_todo(c, kind):
    if kind == "counter":
        return c.get("counter_status") == "unchecked" and c.get("rows", 0) >= 2 and not c.get("counter_rows")
    return bool(c.get("thin")) and c.get("gap_status") == "unchecked"


def main():
    ap = argparse.ArgumentParser(prog="claims.py")
    sub = ap.add_subparsers(dest="cmd", required=True)
    for name in ("extract", "list", "link", "status", "brief"):
        sub.add_parser(name).add_argument("run")
    a = sub.choices
    a["extract"].add_argument("--answer")
    a["extract"].add_argument("--out")
    a["extract"].add_argument("--keep-links", dest="keep")
    a["list"].add_argument("--todo", required=True, choices=("counter", "gap"))
    a["list"].add_argument("--cap", type=int, default=20)
    a["list"].add_argument("--candidates", type=int, default=0)
    a["link"].add_argument("--claim", required=True)
    for k in ("--against", "--for", "--kind", "--reason", "--by"):
        a["link"].add_argument(k, dest=k[2:].replace("for", "for_ids"))
    a["link"].add_argument("--none", action="store_true")
    a["status"].add_argument("--format", choices=("md", "json"), default="md")
    for name in ("list", "link", "status", "brief"):
        a[name].add_argument("--ledger")
    g = ap.parse_args()
    run = Path(g.run)
    draft = run / "claims.draft.jsonl"
    ledger = Path(g.ledger) if getattr(g, "ledger", None) else (draft if draft.is_file() or g.cmd == "brief"
                                                                  else run / "claims.jsonl")
    return globals()["cmd_" + g.cmd](run, ledger, g)


def cmd_extract(run, _ledger, g):
    try:
        md = Path(g.answer or run / "answer.md").read_text(encoding="utf-8")
    except OSError as e:
        print(f"REFUSED the answer cannot be read: {e}")
        return 2
    if os.environ.get("FAKE_CLAIM_EXTRACT") == "draft-fails" and Path(g.out or "").name == "claims.draft.jsonl":
        print("stand-in: the draft's claim ledger was not written", file=sys.stderr)
        return 2
    claims = extract_claims(md, rows_of(run))
    carried = 0
    if g.keep:
        old = read(Path(g.keep))
        if old is None:
            print(f"REFUSED --keep-links: the claim ledger cannot be read: {g.keep}")
            return 2
        carried = carry(claims, old)
    write(Path(g.out or run / "claims.jsonl"), claims)
    print("id | satır | kaynak | başlık | karşı | durum | text")
    for c in claims:
        print(f"{c['id']} | {c['line']} | {c['sources']} | {c['threads']} | {c['counter_rows']} | "
              f"{c['counter_status']}/{c['gap_status']} | {c['text'][:60]}")
    print(f"CLAIMS: {len(claims)} · verdict {sum(c['kind'] == 'verdict' for c in claims)} · "
          f"thin {sum(c['thin'] for c in claims)} · counter-less {sum(not c['counter_rows'] for c in claims)} · "
          f"inadmissible-cited {len({i for c in claims for i in c['inadmissible']})} · carried {carried}")
    return 0


def cmd_list(run, ledger, g):
    key = g.todo + "_status"
    with locked(run):
        claims = read(ledger)
        if claims is None:
            print(f"REFUSED no claim ledger: {ledger}")
            return 2
        todo = sorted((c for c in claims if is_todo(c, g.todo)), key=lambda c: (c["kind"] != "verdict", -c["rows"]))
        sent, held = todo[:g.cap], todo[g.cap:]
        for c in sent:
            c[key] = "sent"
        for c in held:
            c[key] = "not-sent (cap)"
        if todo:
            write(ledger, claims)
    rows = rows_of(run)
    for c in sent:
        print(f"### {c['id']} | rows {c['rows']} · sources {c['sources']} · threads {c['threads']} · "
              f"counter {c['counter_rows']} | {c['text']}")
        print("dayanak:")
        for i in c["support"]:
            if i in rows and i not in c["inadmissible"]:
                print("  " + line160(rows[i]))
        if g.candidates > 0:
            on = set(c["support"]) | set(c["counter"]) | {x["id"] for x in c["links"]}
            words = {w.casefold() for w in WORD.findall(c["text"])}
            near = [r for i, r in sorted(rows.items()) if i not in on and ok(rows, i)[0]
                    and len(words & {w.casefold() for w in WORD.findall(str(r.get("passage") or ""))}) >= 3]
            print("adaylar (defterde, bağlanmamış):")
            for r in near[:g.candidates]:
                print("  " + line160(r))
            if not near:
                print("  (yok)")
        print()
    print(f"LIST: {g.todo} sent {len(sent)} · not-sent (cap) {len(held)}" + ("" if todo else " · nothing to send"))
    return 0


def cmd_link(run, ledger, g):
    with locked(run):
        claims = read(ledger)
        c = next((x for x in claims or [] if x["id"] == g.claim), None)
        if c is None:
            print(f"REFUSED unknown claim: {g.claim}")
            return 2
        rows = rows_of(run)
        if g.none:
            if g.kind not in ("counter", "gap") or not g.reason:
                print("REFUSED --none needs --kind counter|gap and --reason")
                return 2
            if c[g.kind + "_status"] != "found":
                c[g.kind + "_status"] = "none"
            note = f"{'karsi' if g.kind == 'counter' else 'bosluk'}: {g.reason}"
            c["notes"] += [] if note in c["notes"] else [note]
        else:
            ids = [i.strip() for i in (g.against or g.for_ids or "").split(",") if i.strip()]
            for i in ids:
                yes, why = ok(rows, i)
                if not yes:
                    print(f"REFUSED {i}: {why}")
                    return 2
            if g.against:
                if any(i in c["support"] for i in ids):
                    print("REFUSED --against names a row already in the claim's support")
                    return 2
                c["counter_status"] = "found"
            else:
                have = {source_key(rows[s]) for s in c["support"] if s in rows}
                if ids[0] in c["support"] or source_key(rows[ids[0]]) in have:
                    print(f"REFUSED aynı kaynak: {source_key(rows[ids[0]])}")
                    return 2
                c["gap_status"] = "found"
            kind = "against" if g.against else "for"
            for i in ids:
                if not any(x["id"] == i and x["kind"] == kind for x in c["links"]):
                    c["links"].append({"kind": kind, "id": i, "by": g.by, "at": "2026-09-26T00:00:00Z"})
        c["checked_by"] = g.by
        write(ledger, claims)
    print(f"OK {c['id']} counter {c['counter_status']} · gap {c['gap_status']}")
    return 0


def cmd_status(run, ledger, g):
    if os.environ.get("FAKE_CLAIM_STATUS") == "unreadable":
        print("stand-in: the claim ledger's status cannot be read", file=sys.stderr)
        return 2
    if os.environ.get("FAKE_CLAIM_STATUS") == "garbage":
        print("owed_counter: some · new_for_links: many")
        return 0
    claims = read(ledger)
    if claims is None:
        print(f"no claim ledger: {ledger}")
        return 1
    t = {"claims": len(claims), "verdict": sum(c["kind"] == "verdict" for c in claims),
         "thin": sum(bool(c["thin"]) for c in claims),
         "counter": {n: sum(c["counter_status"] == s for c in claims) for n, s in TALLY},
         "gap": {n: sum(c["gap_status"] == s for c in claims) for n, s in TALLY},
         "inadmissible_cited": sum(bool(c["inadmissible"]) for c in claims)}
    if g.format == "json":
        t.update(owed_counter=t["counter"]["sent"], owed_gap=t["gap"]["sent"],
                 new_for_links=sum(x["kind"] == "for" for c in claims for x in c["links"]))
        print(json.dumps(t))
        return 0
    part = lambda d: " · ".join(f"{n} {d[n]}" for n, _ in TALLY)  # noqa: E731
    print(f"claims {t['claims']} · verdict {t['verdict']} · thin {t['thin']} · counter: {part(t['counter'])} · "
          f"gap: {part(t['gap'])} · inadmissible-cited {t['inadmissible_cited']}")
    return 0


def cmd_brief(run, ledger, g):
    claims = read(ledger)
    if claims is None:
        print(f"REFUSED no claim ledger: {ledger}")
        return 2
    for c in claims:
        sup = [i for i in c["support"] if i not in c["inadmissible"]]
        against = [x["id"] for x in c["links"] if x["kind"] == "against"]
        new = [x["id"] for x in c["links"] if x["kind"] == "for"]
        cou = list(dict.fromkeys([i for i in c["counter"] if i not in c["inadmissible"]] + against))
        notes = (["tek kaynak"] if c["thin"] and not new else []) + \
                (["karşı arandı, yok"] if c["counter_status"] == "none" else []) + \
                ([f"kabul edilmeyen (YAZILMAZ): [{', '.join(c['inadmissible'])}]"] if c["inadmissible"] else [])
        print(" · ".join([c["id"], c["text"][:200],
                          f"dayanak [{', '.join(sup)}] ({c['rows']} satır · {c['sources']} bağımsız kaynak · "
                          f"{c['threads']} başlık)", f"karşı [{', '.join(cou)}] ({len(cou)})"]
                         + ([f"yeni kaynak [{', '.join(new)}]"] if new else [])
                         + ([f"not: {' | '.join(notes)}"] if notes else [])))
    return 0


if __name__ == "__main__":
    sys.exit(main())
