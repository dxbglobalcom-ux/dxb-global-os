#!/usr/bin/env python3
"""HIS QUESTION, SPLIT BEFORE THE FLEET RUNS — the 3–6 sub-questions his DERT holds, each to own a section (B56 K3).

WHY. The K2 answer of 2026-09-26 (kept: .planning/research/answers/20260926-2143-astra-6-vs-fable-5-1/) stood in
nine sections of the writer's own choosing: no line of the page said which part of his question a section
answered, and a part no row spoke to was simply not there. The CEO took the K3 plan on 2026-09-26 23:05 ("Tamam
o zaman önerini kabul ediyorum. Devam edin."), its stage 1 this: before the ground opens, one claude-opus-5-5
call at low effort names the sub-questions his DERT holds; each owns a section of the answer
(fleet/writer-prompt.md rule 11), its counts on the page (render.py) and a row of the coverage ruler's second
table (kapsama.py); a sub-question no row speaks to stands there as a gap — `Bu alt soruya satır yok.` — and is
never dropped.

    split.py <run> [--model claude-opus-5-5] [--effort low] [--timeout 120] [--reuse]
             [--shape karsilastirma|pazar|profil|karar]
    split.py <run> --shape-only
    split.py --selftest

READS <run>/question.txt — fleet.sh writes its DERT block and its SORGULAR — less an ALT SORULAR block an
earlier split left in it.
ASKS `claude -p --model M --effort E --tools "" --strict-mcp-config --output-format json` once, the prompt on
stdin, the binary $DXB_CLAUDE or `claude` on PATH, standing in a folder of its own outside the repository —
${XDG_RUNTIME_DIR:-/tmp}/dxb-hunters/<run>.split.XXXXXX, fleet.sh's away_dir: a `claude` started inside the
repository loads its CLAUDE.md and its hooks —; what it leaves there comes back into <run>/split/ and the
folder goes. The answer is read as JSON — bare, in a ``` fence, or the first brace-matched {…} holding "items"
(triage.py's reading, K2c F1) — and 3 to 6 sub-questions are kept, numbered S1… in its order; more than 6: the
first 6, and stderr says so. An answer that yields fewer is asked for once more; still fewer, or the call
failing or out of time: `source: fallback`, ONE sub-question — S1, the DERT itself — and on stderr `split:
model cevabı okunamadı — tek alt soru (DERT)`. The run never blocks on the split: each of those ends in exit 0.
WRITES <run>/subquestions.json — {"source": "model"|"fallback", "cost_usd": x, "items": [{"id": "S1", "title":
"<≤ 6 words>", "question": "<one sentence>", "signals": ["…"]}, …]} — and at the end of question.txt the block

    ALT SORULAR (S-kimlik · başlık · soru):
      - S1 · <title> · <question>

(an existing block is replaced, never doubled), which reaches every role through {{QUESTION}}. Its first line on
stdout: `alt sorular: N (kaynak: model|fallback · $cost · Ns) — S1 <title> · S2 <title> · …`.
--reuse (fleet.sh --write-only): <run>/subquestions.json when it holds sub-questions — no call; the block is
written from it again — else the split above.
FAKE_SPLIT=<file>: the answer is read from that file — the model's text, or claude's JSON envelope — instead of
calling claude (the fleet's tests). --selftest: the reading, on the four answers kept below (good · fenced ·
cut → fallback · shaped, its research type read beside its items); its last line `SELFTEST OK 4/4`.

THE RESEARCH TYPE (B56 K3 stage 2, the CEO's word on the K3 plan, 2026-09-26 23:05): the page takes the shape of
the kind of research his question is. The same call names it beside the items — "shape", one key of SHAPES below,
and "shape_reason", one Turkish sentence — and subquestions.json carries `shape`, `shape_name` (SHAPES' name: the
page's type line, kapsama.py's ŞEKİL line and the heading of fleet/shapes/<shape>.md, the skeleton the writer is
handed, all read it from here), `shape_reason` and `shape_source`: `model`; `fallback` when the call failed or named
no key of SHAPES — then the text rule, shape_of(), decides (the items stay the model's when it read them); `ceo`
with --shape, his one word on the run (fleet.sh --shape), which overrides both. --reuse keeps the json's shape
fields as they are — an older json without them stays without them — unless --shape is given. On stdout, right
after the `alt sorular:` line and on every path: `rapor tipi: <shape_name, lower case> (kaynak: model | kural | CEO
· <shape_reason>)` — none when the json carries no shape. --shape-only: the text rule's line on <run>/question.txt,
and nothing is written or asked.
Exit: 0 split, fallen back, reused or typed · 1 --selftest failed · 2 refused (no run folder, no question.txt, a
bad argument).
"""
from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

sys.dont_write_bytecode = True     # the skill folder is read-only inside a hunter's jail

MODEL = "claude-opus-5-5"
EFFORT = "low"
TIMEOUT = 120
FEWEST, MOST = 3, 6                # the sub-questions a readable answer names
TITLE_WORDS = 6
QUESTION_CHARS = 8000              # his DERT and the queries; the K2 run's question.txt is 673 bytes
HEAD = "ALT SORULAR (S-kimlik · başlık · soru):"
ITEM = re.compile(r"^\s+- S\d+ · ")                      # a line of that block
HEADER = re.compile(r"^(DERT|SORGULAR|ALT SORULAR) \(")  # question.txt's three headers
ID_LEAD = re.compile(r"^S\d+\s*[—–:·.-]\s*")             # a title the model began with its own id
WHOLE = "Sorunun tamamı"           # the fallback's one title: the DERT itself
FELL_BACK = "split: model cevabı okunamadı — tek alt soru (DERT)"
# THE RESEARCH TYPE (K3 stage 2): the one mapping, key → the name every reader prints; shape_source → the word it says
SHAPES = {"karsilastirma": "Karşılaştırma", "pazar": "Pazar levhası", "profil": "Profil", "karar": "Karar"}
SOURCE_WORD = {"model": "model", "fallback": "kural", "ceo": "CEO"}
SHAPE_KEYS = ("shape", "shape_name", "shape_reason", "shape_source")

PROMPT = """You split a research question into its sub-questions before a research run starts. Below is what the
run was given: the CEO's own words (DERT — what the answer must meet; when there is no DERT, the queries are the
question) and the short queries its search was opened with.

{question}

Name the 3 to 6 sub-questions the DERT holds: the separate things the answer must each settle. Each becomes a
section of the answer and is counted on its own, so they must not overlap, and together they must cover all the
DERT asks. When the DERT names its parts (per platform, for what work, the cost, who switched, the
counter-evidence…), those are its sub-questions. Never add one it does not ask.

For each:
- "title": at most 6 words, in Turkish
- "question": one sentence, in Turkish
- "signals": 2 to 4 short words or phrases a source that speaks to it would use, in the source's own language

Then name the research type of the question — the shape its answer's page takes — as "shape", exactly one of:
- "karsilastirma": two or more named things compared ("vs", "mı yoksa", "karşı", "hangisi")
- "pazar": a market, a size, a price, a demand, a potential
- "profil": one company, product, person or tool studied on its own
- "karar": the question asks what to do, whether to do it, or which to choose for US
and "shape_reason": one sentence in Turkish saying why.

Output ONLY valid JSON, no code fence and nothing around it:
{{"shape":"...","shape_reason":"...","items":[{{"id":"S1","title":"...","question":"...","signals":["...","..."]}}]}}
"""

# THE THREE ANSWERS --selftest reads: a bare one, the same shape in a ``` fence, and one cut in the middle of its
# list — the K2 run's failed triage batch was a fenced JSON that had lost a brace (K2c F1).
SAMPLE = [("Platformlara göre kim neyi seçiyor", "Her platformda profesyoneller Astra 6'yı mı Fable 5.1'i mi seçiyor?",
           ["prefer Astra", "prefer Fable"]),
          ("Hangi iş için hangisi", "Hangi iş türünde hangisi öne çıkıyor ve neden?", ["coding", "agentic"]),
          ("Maliyet ve kota", "Kullanıcılar hangi maliyet ve kota rakamlarını veriyor?", ["quota", "price"]),
          ("Kim geçti, neden", "Kim hangisinden hangisine geçti ve neden?", ["switched from", "moved back"])]
GOOD = json.dumps({"items": [{"id": f"S{n}", "title": t, "question": q, "signals": s}
                             for n, (t, q, s) in enumerate(SAMPLE, 1)]}, ensure_ascii=False)
FENCED = "```json\n" + json.dumps({"items": [{"id": f"S{n}", "title": t, "question": q, "signals": s}
                                              for n, (t, q, s) in enumerate(SAMPLE[:3], 1)]},
                                   ensure_ascii=False, indent=1) + "\n```"
CUT = GOOD[:GOOD.index('{"id": "S3"')]
SHAPED = json.dumps({"shape": "karar", "shape_reason": "Soru bizim hangisine geçmemiz gerektiğini soruyor.",
                     "items": json.loads(GOOD)["items"]}, ensure_ascii=False)
SAMPLE_QUESTION = ("DERT (CEO'nun kendi cumlesi — ARANMAZ, cevabin bunu karsilamasi gerekir):\n"
                   "Who prefers Astra 6 or Fable 5.1, for what work, and why?\n\n"
                   "SORGULAR (zemin bunlarla acildi):\n  - Astra 6 vs Fable 5.1\n")


def one(v) -> str:
    """A value as one line: None is empty, every run of whitespace one space."""
    return " ".join(str(v).split()) if v is not None else ""


# =================================================================== question.txt
def without_block(text: str) -> str:
    """question.txt without its ALT SORULAR block — the header and the `  - S<n> · ` lines under it — and without
    the blank lines it leaves at the end."""
    out, inside = [], False
    for line in text.splitlines():
        if line.startswith("ALT SORULAR ("):
            inside = True
            continue
        if inside and ITEM.match(line):
            continue
        inside = False
        out.append(line)
    return "\n".join(out).rstrip()


def with_block(text: str, items: list[dict]) -> str:
    """question.txt with the ALT SORULAR block at its end — an earlier one taken out first, so a second split
    replaces it and never doubles it."""
    base = without_block(text)
    lines = [HEAD] + [f"  - {one(i['id'])} · {one(i['title'])} · {one(i['question'])}" for i in items]
    return (base + "\n\n" if base else "") + "\n".join(lines) + "\n"


def parts(text: str) -> tuple[str, list[str]]:
    """question.txt's DERT — its lines under `DERT (`, as one line — and its SORGULAR queries."""
    dert, queries, under = [], [], ""
    for line in text.splitlines():
        s = line.strip()
        m = HEADER.match(s)
        if m:
            under = m.group(1)
        elif under == "DERT" and s:
            dert.append(s)
        elif under == "SORGULAR" and s.startswith("- "):
            queries.append(s[2:].strip())
    return " ".join(dert), queries


def fallback(text: str) -> list[dict]:
    """ONE sub-question, S1: the DERT itself — the queries when there is none, else the question as written."""
    dert, queries = parts(text)
    return [{"id": "S1", "title": WHOLE, "question": dert or "; ".join(queries) or one(text), "signals": queries}]


# THE TEXT RULE (K3 stage 2, the lead's A12): tried in this order on the question — its DERT and its queries, as
# folded() writes them — the first that matches is the type. `karar` first: its own example, "hangisini seçelim",
# holds `hangisi`, so tried after `karsilastirma` it would be typed a comparison.
ASCII = str.maketrans("çğıöşüâîûÇĞİÖŞÜÂÎÛ", "cgiosuaiuCGIOSUAIU")
DECIDE = re.compile(r"\b(?:abone olalim mi|yapalim mi|girelim mi|alalim mi|secelim)\b")
DECIDE_LAST = re.compile(r"\b\w*(?:alim|elim) mi\b")          # "-alım mı / -elim mi", on the DERT's last sentence
COMPARE = re.compile(r"\bvs\b|\bm[iu],?\s+yoksa\b|\bkarsi\b|\bhangisi")
MARKET = re.compile(r"\bpazar(?!lam)|\bmarkets?\b|\bfiyat|\bpotansiyel|\bbuyuklu|\btale[pb]")  # not "pazarlama"
RULE_SAYS = {"karar": "soru ne yapılacağını soruyor", "karsilastirma": "soru adı geçenleri karşılaştırıyor",
             "pazar": "soru bir pazarı, fiyatı ya da talebi soruyor"}
NO_SIGN = "soruda karar, karşılaştırma ya da pazar işareti yok — tek konu inceleniyor"


def folded(s: str) -> str:
    """Lower case without the Turkish letters — ş → s, ı and İ → i, ü → u … —, one character for one, so a match's
    span is the span of the words as written."""
    return s.translate(ASCII).lower()


def shape_of(text: str) -> tuple[str, str]:
    """The text rule on question.txt (its ALT SORULAR block aside): (a key of SHAPES, why, in Turkish, with the words
    that decided it). karar — abone olalım mı · yapalım mı · girelim mi · alalım mı · seçelim anywhere, or a
    "-alım mı / -elim mi" on the DERT's last sentence —, then karsilastirma (vs · mı yoksa · karşı · hangisi), then
    pazar (pazar · market · fiyat · potansiyel · büyüklük · talep), else profil."""
    base = without_block(text)
    dert, queries = parts(base)
    said = " ".join(x for x in (dert, "; ".join(queries)) if x) or " ".join(base.split())
    last = ([s for s in re.split(r"(?<=[.!?…])\s+", dert or said) if s.strip()] or [""])[-1]
    for key, where, pattern in (("karar", said, DECIDE), ("karar", last, DECIDE_LAST), ("karsilastirma", said, COMPARE),
                                ("pazar", said, MARKET)):
        m = pattern.search(folded(where))
        if m:
            return key, f'{RULE_SAYS[key]}: "{where[m.start():m.end()]}"'
    return "profil", NO_SIGN


def shaped(key: str, reason: str, source: str) -> dict:
    """subquestions.json's four shape fields."""
    return {"shape": key, "shape_name": SHAPES[key], "shape_reason": reason, "shape_source": source}


def shape_line(doc: dict) -> str | None:
    """`rapor tipi: <name, lower case> (kaynak: model | kural | CEO · <reason>)` for a json that carries a shape;
    None for one that carries none."""
    key = one(doc.get("shape"))
    if not key:
        return None
    name, src, why = one(doc.get("shape_name")) or key, one(doc.get("shape_source")), one(doc.get("shape_reason"))
    return f"rapor tipi: {name.lower()} (kaynak: {SOURCE_WORD.get(src, src or '?')}" + (f" · {why})" if why else ")")


def write(path: Path, text: str) -> None:
    tmp = path.with_name(f".{path.name}.{os.getpid()}.tmp")
    tmp.write_text(text, encoding="utf-8")
    os.replace(tmp, path)


# =================================================================== the answer
def objects(s: str):
    """Every balanced {…} of `s`, in the order of its opening brace; a brace inside a JSON string is text —
    triage.py's own reading of a model's answer, copied and not imported: in the fleet's benches a stand-in takes
    triage.py's place, and a split that cannot start would cost the run its sub-questions."""
    for start in (i for i, ch in enumerate(s) if ch == "{"):
        depth, quoted, escaped = 0, False, False
        for j in range(start, len(s)):
            ch = s[j]
            if quoted:
                escaped, quoted = (False, True) if escaped else (ch == "\\", ch != '"')
            elif ch == '"':
                quoted = True
            elif ch in "{}":
                depth += 1 if ch == "{" else -1
                if depth == 0:
                    yield s[start:j + 1]
                    break


def answer_json(text) -> list | dict | None:
    """An answer's JSON: bare — {"items": […]}, or the list itself —; the same in a ``` fence, stripped first; or
    the first brace-matched {…} holding "items", with words around it. None: nothing in it parses to one."""
    if not isinstance(text, str):
        return None
    s = re.sub(r"```\s*$", "", re.sub(r"^```[A-Za-z]*", "", text.strip())).strip()
    for cand in (s, *objects(s)):
        try:
            obj = json.loads(cand)
        except ValueError:
            continue
        if isinstance(obj, list) or (isinstance(obj, dict) and isinstance(obj.get("items"), list)):
            return obj
    return None


def entries(text) -> list | None:
    """The sub-question entries of an answer (answer_json): its list, or its "items". None: none parse."""
    obj = answer_json(text)
    return obj["items"] if isinstance(obj, dict) else obj


def shape_in(text) -> tuple[str | None, str]:
    """The research type an answer names beside its items — (a key of SHAPES, its reason) — or (None, ""): it names
    none, or one SHAPES does not hold (A10: the text rule decides then)."""
    obj = answer_json(text)
    key = one(obj.get("shape")).lower() if isinstance(obj, dict) else ""
    return (key, one(obj.get("shape_reason"))) if key in SHAPES else (None, "")


def items_of(text) -> tuple[list[dict] | None, str]:
    """The sub-questions of an answer, S1… in its order, at most MOST — each a title of at most TITLE_WORDS words,
    its question and its signals — and a note for stderr ('' when there is none). None: fewer than FEWEST read."""
    got = entries(text)
    if got is None:
        return None, "cevapta okunur JSON yok"
    items: list[dict] = []
    for e in got:
        if not isinstance(e, dict):
            continue
        title, question = ID_LEAD.sub("", one(e.get("title"))), one(e.get("question"))
        if not title or not question:
            continue
        signals = e.get("signals") if isinstance(e.get("signals"), list) else []
        items.append({"id": f"S{len(items) + 1}", "title": " ".join(title.split()[:TITLE_WORDS]),
                      "question": question, "signals": [one(x) for x in signals if isinstance(x, str) and one(x)]})
    if len(items) < FEWEST:
        return None, f"cevapta {len(items)} alt soru okundu ({FEWEST}–{MOST} istenir)"
    return items[:MOST], (f"cevapta {len(items)} alt soru var — ilk {MOST}'sı alındı" if len(items) > MOST else "")


def envelope(out: str, rc: int = 0, err: str = "") -> tuple[str | None, float, str]:
    """claude's `--output-format json` answer: (its result text — None when there is none —, total_cost_usd, why
    there is none)."""
    try:
        env = json.loads(out)
    except ValueError:
        return None, 0.0, f"claude kod {rc}, JSON değil: {one(err or out)[:160]}"
    if isinstance(env, list):                          # an event list: its result event
        env = next((e for e in reversed(env) if isinstance(e, dict) and e.get("type") == "result"), None)
    env = env if isinstance(env, dict) else {}
    c = env.get("total_cost_usd")
    cost = float(c) if isinstance(c, (int, float)) and not isinstance(c, bool) else 0.0
    text = env.get("result") if isinstance(env.get("result"), str) else None
    if rc != 0 or env.get("is_error") or text is None:
        return None, cost, f"claude kod {rc}: {one(text or err or out)[:160]}"
    return text, cost, ""


# =================================================================== the call
def away_dir(run: Path) -> Path:
    """A folder of its own outside the repository — fleet.sh's away_dir: ${XDG_RUNTIME_DIR:-/tmp}/dxb-hunters/."""
    parent = Path(os.environ.get("XDG_RUNTIME_DIR") or "/tmp") / "dxb-hunters"
    parent.mkdir(parents=True, exist_ok=True)
    return Path(tempfile.mkdtemp(prefix=f"{run.name}.split.", dir=parent))


def bring_back(away: Path, into: Path) -> None:
    """What the call left in its folder comes back into the run (fleet.sh's bring_back), and the folder goes."""
    try:
        if any(away.iterdir()):
            shutil.copytree(away, into, dirs_exist_ok=True)
    except OSError:
        pass
    shutil.rmtree(away, ignore_errors=True)


def ask(prompt: str, run: Path, model: str, effort: str, timeout: int) -> tuple[str | None, float, str]:
    """One answer: (its text — None when there is none —, what it cost in USD, why there is none). FAKE_SPLIT=<file>
    reads it from that file instead of calling claude: the model's text, or claude's JSON envelope."""
    fake = os.environ.get("FAKE_SPLIT")
    if fake:
        try:
            raw = Path(fake).read_text(encoding="utf-8", errors="replace")
        except OSError as e:
            return None, 0.0, f"FAKE_SPLIT okunamadı: {fake} ({type(e).__name__})"
        try:
            data = json.loads(raw)
        except ValueError:
            data = None
        if (isinstance(data, dict) and "result" in data) or (isinstance(data, list) and any(
                isinstance(e, dict) and e.get("type") == "result" for e in data)):
            return envelope(raw)
        return raw, 0.0, ""
    try:
        away = away_dir(run)
    except OSError as e:
        return None, 0.0, f"dışarıdaki klasör açılamadı: {e}"
    cmd = [os.environ.get("DXB_CLAUDE") or "claude", "-p", "--model", model, "--effort", effort, "--tools", "",
           "--strict-mcp-config", "--output-format", "json"]
    try:
        p = subprocess.run(cmd, input=prompt, capture_output=True, encoding="utf-8", errors="replace", cwd=away,
                           timeout=timeout)
    except subprocess.TimeoutExpired:
        return None, 0.0, f"{timeout} s içinde cevap yok"
    except OSError as e:
        return None, 0.0, f"claude başlamadı: {e}"
    finally:
        bring_back(away, run / "split")
    return envelope(p.stdout, p.returncode, p.stderr)


# =================================================================== the split
def reused(run: Path) -> dict | None:
    """<run>/subquestions.json when it holds sub-questions, each with an id, a title and a question — the json itself
    as `doc`, whose shape fields --reuse keeps (K3 stage 2); None when it is not there or cannot be read."""
    try:
        doc = json.loads((run / "subquestions.json").read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return None
    items = doc.get("items") if isinstance(doc, dict) else None
    if not isinstance(items, list) or not items or not all(
            isinstance(i, dict) and all(isinstance(i.get(k), str) and i[k].strip() for k in ("id", "title", "question"))
            for i in items):
        return None
    return {"source": doc["source"] if doc.get("source") in ("model", "fallback") else "model", "items": items,
            "doc": doc}


def summary(source: str, items: list[dict], cost: float, secs: float) -> str:
    return (f"alt sorular: {len(items)} (kaynak: {source} · ${cost:.2f} · {secs:.0f}s) — "
            + " · ".join(f"{one(i['id'])} {one(i['title'])}" for i in items))


def by_ceo(key: str) -> dict:
    """The shape fields of his one word on the run (fleet.sh --shape)."""
    return shaped(key, f"CEO'nun sözü: --shape {key}", "ceo")


def dump(doc: dict) -> str:
    return json.dumps(doc, ensure_ascii=False, indent=2) + "\n"


def split(run: Path, model: str, effort: str, timeout: int, reuse: bool, shape: str | None = None) -> int:
    qf = run / "question.txt"
    try:
        text = qf.read_text(encoding="utf-8", errors="replace")
    except OSError as e:
        print(f"split: REFUSED {qf} okunamadı ({type(e).__name__}) — bölünecek soru yok", file=sys.stderr)
        return 2
    t0 = time.monotonic()
    kept = reused(run) if reuse else None
    if kept is not None:
        again = with_block(text, kept["items"])
        if again != text:
            write(qf, again)
        doc = kept["doc"]
        if shape:              # his word again on --write-only: the json takes it, the rest of it as it was
            doc = {**{k: v for k, v in doc.items() if k != "items" and k not in SHAPE_KEYS}, **by_ceo(shape),
                   "items": doc["items"]}
            write(run / "subquestions.json", dump(doc))
        print(summary(kept["source"], kept["items"], 0.0, time.monotonic() - t0)
              + " (subquestions.json yeniden kullanıldı)")
        line = shape_line(doc)
        if line:
            print(line)
        return 0
    if reuse and (run / "subquestions.json").exists():
        print("split: subquestions.json okunamadı — soru yeniden bölünüyor", file=sys.stderr)
    base = without_block(text)
    prompt = PROMPT.format(question=base[:QUESTION_CHARS])
    items, cost, named = None, 0.0, (None, "")
    for attempt in (1, 2):
        answer, spent, why = ask(prompt, run, model, effort, timeout)
        cost += spent
        if answer is None:
            print(f"split: {why}", file=sys.stderr)
            break
        items, note = items_of(answer)
        if items is not None:
            named = shape_in(answer)
            if note:
                print(f"split: {note}", file=sys.stderr)
            break
        print(f"split: {note}" + (" — yeniden soruluyor (1/1)" if attempt == 1 else " (yeniden 1/1)"), file=sys.stderr)
    source = "model"
    if items is None:
        items, source = fallback(base), "fallback"
        print(FELL_BACK, file=sys.stderr)
    # the type: his word · the model's, beside the items it gave · the text rule's (A10)
    kind = by_ceo(shape) if shape else shaped(*named, "model") if named[0] else shaped(*shape_of(text), "fallback")
    doc = {"source": source, "cost_usd": round(cost, 4), **kind, "items": items}
    write(run / "subquestions.json", dump(doc))
    write(qf, with_block(text, items))
    print(summary(source, items, cost, time.monotonic() - t0))
    print(shape_line(doc))
    return 0


def selftest() -> int:
    """The reading on the four kept answers: GOOD → S1…S4 · FENCED → 3 · CUT → none, so the fallback: one
    sub-question, the DERT itself · SHAPED → S1…S4 and its research type, where GOOD names none."""
    good, fenced, cut = items_of(GOOD)[0], items_of(FENCED)[0], items_of(CUT)[0]
    whole = fallback(SAMPLE_QUESTION) if cut is None else []
    typed, kind = items_of(SHAPED)[0], shape_in(SHAPED)
    checks = [
        ("good", good is not None and [i["id"] for i in good] == ["S1", "S2", "S3", "S4"]
         and good[0]["title"] == SAMPLE[0][0], f"{len(good or [])} alt soru"),
        ("fenced", fenced is not None and len(fenced) == 3, f"{len(fenced or [])} alt soru"),
        ("cut", cut is None and len(whole) == 1
         and whole[0]["question"] == "Who prefers Astra 6 or Fable 5.1, for what work, and why?",
         "okunamadı → fallback: " + " · ".join(f"{i['id']} {i['title']}" for i in whole)),
        ("shaped", typed is not None and len(typed) == 4 and kind[0] == "karar" and kind[1].startswith("Soru bizim")
         and shape_in(GOOD) == (None, ""), f"{len(typed or [])} alt soru · rapor tipi {kind[0]} — {kind[1]}"),
    ]
    for name, ok, said in checks:
        print(f"{name}: {'OK' if ok else 'FAIL'} — {said}")
    n = sum(1 for _name, ok, _said in checks if ok)
    print(f"SELFTEST {'OK' if n == len(checks) else 'FAIL'} {n}/{len(checks)}")
    return 0 if n == len(checks) else 1


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="split.py", description="his question, split into the sub-questions it holds")
    ap.add_argument("run", nargs="?")
    ap.add_argument("--model", default=MODEL)
    ap.add_argument("--effort", default=EFFORT)
    ap.add_argument("--timeout", type=int, default=TIMEOUT)
    ap.add_argument("--reuse", action="store_true", help="<run>/subquestions.json when it is there (--write-only)")
    ap.add_argument("--shape", choices=tuple(SHAPES), help="his one word on the run, the research type (fleet.sh)")
    ap.add_argument("--shape-only", action="store_true", help="the text rule's line on question.txt; writes nothing")
    ap.add_argument("--selftest", action="store_true")
    a = ap.parse_args(argv)
    if a.selftest:
        return selftest()
    if not a.run or not Path(a.run).is_dir():
        print(f"split: REFUSED koşu klasörü yok: {a.run or '(verilmedi)'}", file=sys.stderr)
        return 2
    if a.shape_only:
        try:
            text = (Path(a.run) / "question.txt").read_text(encoding="utf-8", errors="replace")
        except OSError as e:
            print(f"split: REFUSED {Path(a.run) / 'question.txt'} okunamadı ({type(e).__name__})", file=sys.stderr)
            return 2
        print(shape_line(shaped(*shape_of(text), "fallback")))
        return 0
    if a.timeout < 1:
        print("split: REFUSED --timeout en az 1 saniye", file=sys.stderr)
        return 2
    return split(Path(a.run), a.model, a.effort, a.timeout, a.reuse, a.shape)


if __name__ == "__main__":
    raise SystemExit(main())
