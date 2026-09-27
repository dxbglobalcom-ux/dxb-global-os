#!/usr/bin/env python3
"""THE AUDITOR — every claim of the answer read again, against the rows it cites, by an Opus that never saw the
writer (B56 K3 stage 3).

WHY. The writer's final pass stands on the claim ledger (claims.py): every claim line carries the rows it cites and
the counts the machine made of them, and nothing read the line against those rows — a line could say more than its
rows, carry a number they do not bear, or leave out a counter row a claim hunter linked to it. Measured on the K3
stage-1 run of 2026-09-27 (var/research/runs/20260927-0053-k3-astra-fable): 7 counter rows the claim hunters linked to
4 claims are named on none of those 4 lines of its final answer, and a blind judge reading 13 claims of each writer
effort against their rows called 2 and 3 of 13 overstated (EVIDENCE-B56-K3, "The writer's effort"). The CEO took the
K3 plan on 2026-09-26 23:05 ("Tamam o zaman önerini kabul ediyorum. Devam edin."), its stage 3 this: once the final
answer's ledger is extracted, a claude-opus-5-5 at low effort that never saw the writer is handed each claim with ONLY
the rows it cites printed under it — inline, never through a tool: the X experiment of 2026-09-26 had an Opus at low
read all 130 posts once they stood in its prompt — and says `ok`, `corrected` (writing the line itself) or `removed`.
The corrected line is the auditor's own, held inside the claim's own rows: the lead's call at intake, cheaper than a
third writer pass, deterministic, and every change stands on the page where he sees it.

    audit.py run <run> [--ledger <run>/claims.jsonl] [--model claude-opus-5-5] [--effort low] [--timeout 600]
                       [--batch 12] [--jobs 4]
    audit.py apply <run> [--ledger <run>/claims.jsonl]
    audit.py check <run> [--ledger <run>/claims.jsonl]
    audit.py --selftest

RUN reads <run>/answer.md and the ledger, and cuts its claims into batches of at most --batch, in id order. Batch n is
<run>/audit/batch-<n>.txt: fleet/audit-prompt.md with {{QUESTION}} (question.txt, its ALT SORULAR block included),
{{N}} and {{CLAIMS}} — per claim `### C007 [S2]` (` · hüküm` after the answer's first line, its verdict), the WHOLE
answer line it stands on, `dayanak:` its support rows and `karşı:` its counter rows (the ledger's `counter`, then the
claim hunters' `against` links), each row on one line as `evidence.py writer-rows` prints it — the fleet's own call
for the writer, so the auditor judges against exactly what the writer saw; a row the writer was not handed, or one
with no text, says `gövde yok`. A claim whose line in the answer is not the ledger's (claims.py's reading differs) is
never asked about: `unaudited`. Each batch is ONE `claude -p --model M --effort E --tools "" --strict-mcp-config
--output-format json`, the prompt on stdin, the binary $DXB_CLAUDE or `claude` on PATH, standing in a folder of its
own outside the repository (split.py's way: ${XDG_RUNTIME_DIR:-/tmp}/dxb-hunters/<run>.audit.XXXXXX — a `claude`
started inside the repository loads its CLAUDE.md and its hooks), --jobs of them at once; what it answered is kept as
batch-<n>.json (claude's envelope, total_cost_usd in it) and batch-<n>.err, what it left in its folder as
batch-<n>.left/. The answer is read as JSON — bare, in a ``` fence, or the first brace-matched {…} holding "verdicts"
— `{"verdicts":[{"id","verdict":"ok|corrected|removed","reason","line"}]}`; a claim it does not carry (or an answer
that cannot be read) is asked for ONCE more, alone with the others missing (batch-<n>.retry.*, the triage's F1
pattern); still missing, it is `unaudited`. WRITES <run>/audit.jsonl, one record per claim of the ledger:
{"id", "section", "verdict": ok|corrected|removed|unaudited, "reason", "line": the auditor's line (null when it gave
none), "was": the whole answer line as the auditor read it, "line_no": its number in answer.md, "batch", "by":
"denetci", "at"}. Its ONE line on stdout: `denetçi: N iddia okundu · d düzeltildi · r çıkarıldı · u denetlenmedi ·
$c · Ns` — N the claims given a verdict, c the batches' total_cost_usd, N s the wall seconds of the run; on stderr the
retries, and where the batch prompts are.
FAKE_AUDIT=<dir> (the fleet's tests): batch n's answer is read from <dir>/batch-<n>.json — the model's text, or
claude's JSON envelope — its retry from <dir>/batch-<n>.retry.json when there is one, else batch-<n>.json again; a
batch with no file there is agreed with, every claim `ok`, $0, no call: an empty folder is an auditor that agrees.

APPLY rewrites answer.md from audit.jsonl — when every line the auditor read still stands as it read it. A `corrected`
claim's line becomes the auditor's line when it may (settle, below), else the verdict is `ok` and its reason says
`denetçi satırı reddedildi: <why> — …`; a `removed` claim's line is deleted — a table row, that row — except the
answer's first line, its verdict (fleet/writer-prompt.md rule 1), which is never removed: `corrected` with the
auditor's line when it gave one that may stand, else `ok`. Every downgrade is printed. Then audit.jsonl is written
again with each record's `id` the claim's id AFTER the removals — claims.py numbers the claims by the order of their
lines, so a removed line renumbers every claim below it — and `line_no` its line in the rewritten answer; `id_before`
keeps the id the auditor read; a removed record's `id` is null (no claim carries it now) and its `line_no` the line it
stood on. Its last line: `apply: d satır düzeltildi · r satır silindi`.
CHECK, after the fleet extracts the ledger again: every record's final line — its `line` when corrected, `was`
otherwise — read by claims.py (its extract of that one line: text, support, counter) is the ledger claim of that `id`,
at that `line_no`; a removed record's line stands on no claim at the line it stood on; every claim of the ledger has
its record. `check: OK n` (n the records), or `!! DENETİM UYUMSUZ: C003 C012 … — k kayıt defterle uyuşmuyor` and
one line per record under it.
--selftest: the reading, on the three answers kept below (good · fenced · cut → unreadable); last line
`SELFTEST OK 3/3`.

Exit: 0 done — `run` also when claims stay unaudited, the run never blocks on the auditor · 1 check: the records and
the ledger disagree, or --selftest failed · 2 refused (no run folder, an answer, a ledger, the rows or the prompt that
cannot be read; apply on an audit already applied, or on an answer that is not the one the auditor read; a bad
argument).

render.py (the line under the verdict, the `düzeltildi` mark, the two lists under the ledger) and kapsama.py (its
DENETÇİ line) read audit.jsonl beside the answer through read_jsonl and tally, below.
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
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

sys.dont_write_bytecode = True     # the skill folder is read-only inside a hunter's jail
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))      # claims.py and platforms.py, imported where a line is read (_claims, split_paired)
TEMPLATE = HERE.parent / "fleet" / "audit-prompt.md"

MODEL = "claude-opus-5-5"
EFFORT = "low"
TIMEOUT = 600
BATCH = 12
JOBS = 4
VERDICTS = ("ok", "corrected", "removed")
UNAUDITED = "unaudited"
BY = "denetci"
CLAIM_ID = re.compile(r"C\d{3,}")
ROW_LINE = re.compile(r"^\[(L\d{4,})\] ")                  # a line of `evidence.py writer-rows`
NO_TEXT = ' · "" · '                                      # its passage when the row has no passage and no title
# A LINE'S LEAD — its indent and its list mark (or a heading's #): a corrected line keeps the one it replaces
LEAD = re.compile(r"^[ \t]*(?:#{1,6}[ \t]+|[-*+•][ \t]+|\d{1,3}[.)][ \t]+)?")
PIPE = re.compile(r"(?<!\\)\|")
# THE THREE THINGS render.py REFUSES A WHOLE PAGE FOR that one line can carry (render.py refusals, its patterns): a raw
# address, a `>` quote block, a bracket that holds an id and is not a citation: an auditor's line may bring none of them
RAW_ADDRESS = re.compile(r"https?://", re.IGNORECASE)
QUOTE_BLOCK = re.compile(r"^[ \t]*(?:(?:[-*+]|\d{1,9}[.)])[ \t]+)*>")
BRACKET = re.compile(r"\[[^\[\]\n]*\]")
ID_LIKE = re.compile(r"\bL\d{4}\b", re.IGNORECASE)
CITE = re.compile(r"\[L\d{4}(?:,\s*L\d{4})*\]")
IDS_SHOWN = 12                                            # the ids a `!!` line names before `…`


def one(v) -> str:
    """A value as one line: None is empty, every run of whitespace one space."""
    return " ".join(str(v).split()) if v is not None else ""


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def order(cid: str) -> int:
    return int(cid[1:]) if CLAIM_ID.fullmatch(cid) else 1 << 30


# =================================================================== the files
def read_jsonl(path: Path) -> list[dict] | None:
    """The objects of a JSONL file, a line that is not one skipped; None when the file cannot be read."""
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return None
    out = []
    for line in text.splitlines():
        try:
            obj = json.loads(line)
        except ValueError:
            continue
        if isinstance(obj, dict):
            out.append(obj)
    return out


def write(path: Path, text: str) -> None:
    tmp = path.with_name(f".{path.name}.{os.getpid()}.tmp")
    tmp.write_text(text, encoding="utf-8")
    os.replace(tmp, path)


def write_jsonl(path: Path, objs: list[dict]) -> None:
    write(path, "".join(json.dumps(o, ensure_ascii=False) + "\n" for o in objs))


def tally(records: list[dict]) -> dict[str, int]:
    """THE AUDIT'S NUMBERS, one owner: `run`'s line, the page's line under the verdict (render.py) and the coverage
    ruler's DENETÇİ line (kapsama.py). `read` — the claims the auditor gave a verdict (ok, corrected or removed) —
    and `unaudited`, the rest, make the ledger's claims together."""
    said = [r.get("verdict") for r in records]
    return {"read": sum(v in VERDICTS for v in said), "corrected": said.count("corrected"),
            "removed": said.count("removed"), "unaudited": sum(v not in VERDICTS for v in said)}


def refuse(cmd: str, why: str) -> int:
    print(f"{cmd}: REFUSED {why}", file=sys.stderr)
    return 2


# =================================================================== a line, as claims.py reads it
def _claims():
    """claims.py, imported when a line is read. In the fleet's benches a stand-in takes its place: extract_claims is
    the call both answer (fixtures/gate/claims-stub.py)."""
    import claims
    return claims


def reading(line: str | None) -> dict | None:
    """claims.py's own reading of ONE answer line — the claim its extract makes of it (text, support, counter), None
    when the line is no claim. Through extract_claims with no rows: the text and the two sides are the line's alone
    (claim_text, sides), and the claim ledger's stand-in answers the same call."""
    if not line:
        return None
    got = _claims().extract_claims(line, {})
    return got[0] if got else None


def split_paired(s: str) -> str:
    """`[A ↔ B]` as the two citations it is (platforms.py, the one owner render.py reads the answer through)."""
    try:
        import platforms
    except Exception:
        return s
    return platforms.split_paired(s)


def verdict_line(lines: list[str]) -> int | None:
    """The answer's first line — its verdict (fleet/writer-prompt.md rule 1): the first that is not blank."""
    return next((n for n, s in enumerate(lines, 1) if s.strip()), None)


def cells(row: str) -> list[str]:
    """A table row's cells, render.py's reading: its edge pipes off, split at every pipe nobody escaped."""
    row = row.strip()
    row = row[1:] if row.startswith("|") else row
    row = row[:-1] if row.endswith("|") and not row.endswith("\\|") else row
    return PIPE.split(row)


def counter_ids(c: dict) -> list[str]:
    """A claim's counter rows: the ledger's `counter`, then the claim hunters' `against` links (claims.py brief)."""
    links = [x.get("id") for x in c.get("links") or [] if isinstance(x, dict) and x.get("kind") == "against"]
    return [i for i in dict.fromkeys([*(c.get("counter") or []), *links]) if isinstance(i, str) and i]


def settle(said, was: str, claim: dict) -> tuple[str | None, str]:
    """The auditor's line as it will stand in the answer, or None and why it may not (the lead's A3 and A4): ONE line; a
    table row stays a table row of as many cells, any other line keeps the lead of the line it replaces; none of what
    render.py refuses a page for; its ids the claim's own rows — support ∪ counter ∪ the claim hunters' against links —
    at least one, every one admitted; and not the line as it stood."""
    if not isinstance(said, str) or not said.strip():
        return None, "satır yok"
    s = re.sub(r"\s*[\r\n]+\s*", " ", said).strip()
    if was.lstrip().startswith("|"):
        if not s.startswith("|"):
            return None, "tablo satırı değil"
        want, got = len(cells(was)), len(cells(s))
        if want != got:
            return None, f"tablo satırı {want} hücre ister, satırda {got}"
        final = was[:len(was) - len(was.lstrip())] + s
    else:
        if s.startswith("|"):
            return None, "satır tablo satırına dönmüş"
        final = LEAD.match(was).group(0) + s[LEAD.match(s).end():]
    if RAW_ADDRESS.search(final):
        return None, "adres var"
    if QUOTE_BLOCK.match(final):
        return None, "alıntı bloğu"
    loose = [m.group(0) for m in BRACKET.finditer(split_paired(final))
             if ID_LIKE.search(m.group(0)) and not CITE.fullmatch(m.group(0))]
    if loose:
        return None, f"atıf biçimi yanlış: {loose[0][:40]}"
    read = reading(final) or {}
    ids = list(dict.fromkeys([*(read.get("support") or []), *(read.get("counter") or [])]))
    if not ids:
        return None, "kimlik yok"
    own = set(claim.get("support") or []) | set(counter_ids(claim))
    outside = [i for i in ids if i not in own]
    if outside:
        return None, f"{', '.join(outside)} iddianın satırlarında yok"
    refused = [i for i in ids if i in set(claim.get("inadmissible") or [])]
    if refused:
        return None, f"{', '.join(refused)} kabul edilmeyen satır"
    if final == was:
        return None, "satır aynı"
    return final, ""


# =================================================================== the auditor's prompt
def writer_rows(run: Path) -> dict[str, str] | None:
    """What the writer was handed, row by row — `evidence.py writer-rows <run>`, the call fleet.sh's write_answer
    makes — id -> its line, a line with no passage and no title saying `gövde yok`. None when it cannot be had: then
    the auditor is not asked at all."""
    try:
        p = subprocess.run([sys.executable, str(HERE / "evidence.py"), "writer-rows", str(run)], capture_output=True,
                           encoding="utf-8", errors="replace", timeout=300,
                           env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"})
    except (OSError, subprocess.TimeoutExpired):
        return None
    if p.returncode != 0:
        return None
    out: dict[str, str] = {}
    for line in p.stdout.splitlines():
        m = ROW_LINE.match(line)
        if m:
            out.setdefault(m.group(1), line.replace(NO_TEXT, " · gövde yok · ", 1))
    return out


def block(item: dict, rows: dict[str, str]) -> str:
    """One claim of {{CLAIMS}}: its heading, its whole line, its rows."""
    c = item["claim"]
    refused = set(c.get("inadmissible") or [])
    shown = lambda i: (rows[i] if i in rows and i not in refused  # noqa: E731
                       else f"[{i}] gövde yok (yazara verilmeyen satır)")
    sec = c.get("section")
    head = f"### {c['id']}" + (f" [{one(sec)}]" if isinstance(sec, str) and sec.strip() else "")
    out = [head + (" · hüküm" if item["first"] else ""), item["was"], "dayanak:"]
    out += [f"  {shown(i)}" for i in dict.fromkeys(c.get("support") or [])] or ["  (yok)"]
    against = counter_ids(c)
    out += (["karşı:"] + [f"  {shown(i)}" for i in against]) if against else ["karşı: (yok)"]
    return "\n".join(out)


def fill(tpl: str, question: str, items: list[dict], rows: dict[str, str]) -> str:
    vals = {"QUESTION": question, "N": str(len(items)), "CLAIMS": "\n\n".join(block(it, rows) for it in items)}
    return re.sub(r"\{\{([A-Z_]+)\}\}", lambda m: vals.get(m.group(1), m.group(0)), tpl).rstrip("\n") + "\n"


# =================================================================== the answer
def objects(s: str):
    """Every balanced {…} of `s`, in the order of its opening brace; a brace inside a JSON string is text — split.py's
    reading (triage.py's before it), copied and not imported: in the fleet's benches a stand-in can take a script's
    place, and an auditor that cannot start would leave every claim unaudited."""
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


def entries(text) -> list | None:
    """The verdict entries of an answer: bare JSON — {"verdicts": […]}, or the list itself —; the same in a ``` fence,
    stripped first; or the first brace-matched {…} holding "verdicts", with words around it. None: nothing parses."""
    if not isinstance(text, str):
        return None
    s = re.sub(r"```\s*$", "", re.sub(r"^```[A-Za-z]*", "", text.strip())).strip()
    for cand in (s, *objects(s)):
        try:
            obj = json.loads(cand)
        except ValueError:
            continue
        if isinstance(obj, list):
            return obj
        if isinstance(obj, dict) and isinstance(obj.get("verdicts"), list):
            return obj["verdicts"]
    return None


def verdicts_of(text, ids: list[str]) -> tuple[dict[str, dict], str]:
    """The auditor's verdicts on `ids` — id -> {"verdict", "reason", "line"} — and why some are missing ('' when none
    is). An entry for an id not asked, a verdict that is none of the three, a second entry for an id: not read."""
    got = entries(text)
    if got is None:
        return {}, "cevapta okunur JSON yok"
    want, out = set(ids), {}
    for e in got:
        if not isinstance(e, dict):
            continue
        cid, verdict = one(e.get("id")), one(e.get("verdict")).lower()
        if cid not in want or cid in out or verdict not in VERDICTS:
            continue
        line = e.get("line") if isinstance(e.get("line"), str) and e["line"].strip() else None
        out[cid] = {"verdict": verdict, "reason": one(e.get("reason")), "line": None if verdict == "ok" else line}
    left = len(want) - len(out)
    return out, (f"cevapta {left} iddia yok" if left else "")


def envelope(out: str, rc: int = 0, err: str = "") -> tuple[str | None, float, str]:
    """claude's `--output-format json` answer: (its result text — None when there is none —, total_cost_usd, why there
    is none) — split.py's reading."""
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
    return Path(tempfile.mkdtemp(prefix=f"{run.name}.audit.", dir=parent))


def bring_back(away: Path, into: Path) -> None:
    """What the call left in its folder comes back into the run (fleet.sh's bring_back), and the folder goes."""
    try:
        if any(away.iterdir()):
            shutil.copytree(away, into, dirs_exist_ok=True)
    except OSError:
        pass
    shutil.rmtree(away, ignore_errors=True)


def fake_file(fake: Path, n: int, retry: bool) -> Path | None:
    """FAKE_AUDIT's answer for batch n: batch-<n>.json; for its retry batch-<n>.retry.json when it is there, else the
    same batch-<n>.json again. None: no file — the batch is agreed with."""
    own = fake / f"batch-{n}{'.retry' if retry else ''}.json"
    if retry and not own.is_file():
        own = fake / f"batch-{n}.json"
    return own if own.is_file() else None


def ask(prompt: str, run: Path, stem: str, g: dict, fake: Path | None) -> tuple[str | None, float, str]:
    """One answer: (its text — None when there is none —, its cost in USD, why there is none), kept as
    <run>/audit/<stem>.json and .err. `fake`: read from that file instead — the model's text, or claude's envelope."""
    folder = run / "audit"
    if fake is not None:
        try:
            raw = fake.read_text(encoding="utf-8", errors="replace")
        except OSError as e:
            return None, 0.0, f"FAKE_AUDIT okunamadı: {fake} ({type(e).__name__})"
        write(folder / f"{stem}.json", raw)
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
    cmd = [os.environ.get("DXB_CLAUDE") or "claude", "-p", "--model", g["model"], "--effort", g["effort"],
           "--tools", "", "--strict-mcp-config", "--output-format", "json"]
    try:
        p = subprocess.run(cmd, input=prompt, capture_output=True, encoding="utf-8", errors="replace", cwd=away,
                           timeout=g["timeout"])
    except subprocess.TimeoutExpired:
        write(folder / f"{stem}.err", f"{g['timeout']} s içinde cevap yok\n")
        return None, 0.0, f"{g['timeout']} s içinde cevap yok"
    except OSError as e:
        write(folder / f"{stem}.err", f"claude başlamadı: {e}\n")
        return None, 0.0, f"claude başlamadı: {e}"
    finally:
        bring_back(away, folder / f"{stem}.left")
    write(folder / f"{stem}.json", p.stdout)
    write(folder / f"{stem}.err", p.stderr)
    return envelope(p.stdout, p.returncode, p.stderr)


def audit_batch(n: int, items: list[dict], g: dict) -> tuple[dict[str, dict], float, list[str]]:
    """Batch n: its prompt written, asked once, the claims its answer does not carry asked once more on their own.
    Returns id -> verdict (every claim of the batch, `unaudited` for what is still missing), the cost, the notes."""
    run, fake, stem = g["run"], g["fake"], f"batch-{n}"
    ids = [it["claim"]["id"] for it in items]
    prompt = fill(g["tpl"], g["question"], items, g["rows"])
    write(run / "audit" / f"{stem}.txt", prompt)
    if fake is not None and fake_file(fake, n, False) is None:
        agreed = f"FAKE_AUDIT: {stem}.json yok — denetçi hepsine katıldı"
        return {i: {"verdict": "ok", "reason": agreed, "line": None} for i in ids}, 0.0, []
    text, cost, why = ask(prompt, run, stem, g, fake_file(fake, n, False) if fake else None)
    got, note = verdicts_of(text, ids) if text is not None else ({}, why)
    notes: list[str] = []
    missing = [it for it in items if it["claim"]["id"] not in got]
    if missing:
        notes.append(f"denetçi: parti {n}: {len(missing)}/{len(items)} iddia okunamadı ({note}) — "
                     "yeniden soruluyor (1/1)")
        again = fill(g["tpl"], g["question"], missing, g["rows"])
        write(run / "audit" / f"{stem}.retry.txt", again)
        text2, cost2, why2 = ask(again, run, f"{stem}.retry", g, fake_file(fake, n, True) if fake else None)
        cost += cost2
        asked = [it["claim"]["id"] for it in missing]
        got2, note2 = verdicts_of(text2, asked) if text2 is not None else ({}, why2)
        got.update(got2)
        still = [i for i in asked if i not in got]
        if still:
            notes.append(f"denetçi: parti {n}: {len(still)} iddia denetlenmedi ({note2}): {' '.join(still)}")
            for i in still:
                got[i] = {"verdict": UNAUDITED, "reason": f"denetçinin cevabında yok, yeniden sorulunca da ({note2})",
                          "line": None}
    return got, cost, notes


# =================================================================== run · apply · check
def cmd_run(run: Path, ledger: Path, model: str, effort: str, timeout: int, size: int, jobs: int) -> int:
    t0 = time.monotonic()
    try:
        lines = (run / "answer.md").read_text(encoding="utf-8", errors="replace").splitlines()
    except OSError as e:
        return refuse("denetçi", f"{run / 'answer.md'} okunamadı ({type(e).__name__}) — denetlenecek cevap yok")
    claims = read_jsonl(ledger)
    if claims is None:
        return refuse("denetçi", f"iddia defteri okunamadı: {ledger}")
    try:
        tpl = TEMPLATE.read_text(encoding="utf-8")
    except OSError as e:
        return refuse("denetçi", f"denetçinin istemi okunamadı: {TEMPLATE} ({type(e).__name__})")
    rows = writer_rows(run)
    if rows is None:
        return refuse("denetçi", f"evidence.py writer-rows çalışmadı — denetçiye satır verilemez: {run}")
    try:
        question = (run / "question.txt").read_text(encoding="utf-8", errors="replace").strip() or "(question.txt boş)"
    except OSError:
        question = "(question.txt yok)"
    first = verdict_line(lines)
    claims = sorted((c for c in claims if CLAIM_ID.fullmatch(one(c.get("id")))), key=lambda c: order(c["id"]))
    records: dict[str, dict] = {}
    items: list[dict] = []
    for c in claims:
        n = c.get("line")
        ok_n = isinstance(n, int) and not isinstance(n, bool) and 1 <= n <= len(lines)
        was = lines[n - 1] if ok_n else None
        records[c["id"]] = {"id": c["id"], "section": c.get("section"), "verdict": UNAUDITED, "reason": "",
                            "line": None, "was": was, "line_no": n if ok_n else None, "batch": None, "by": BY,
                            "at": None}
        seen = reading(was)
        if seen is None or seen.get("text") != c.get("text"):          # the ledger is not this answer's
            records[c["id"]]["reason"] = f"defterin satırı cevapta değil (satır {n})"
            continue
        items.append({"claim": c, "was": was, "first": n == first})
    batches = [items[i:i + size] for i in range(0, len(items), size)]
    folder = run / "audit"
    folder.mkdir(exist_ok=True)
    for old in folder.glob("batch-*"):                   # an earlier audit's batches are not this one's
        if old.is_dir():
            shutil.rmtree(old, ignore_errors=True)
        else:
            old.unlink(missing_ok=True)
    fake = Path(os.environ["FAKE_AUDIT"]) if os.environ.get("FAKE_AUDIT") else None
    g = {"run": run, "fake": fake, "tpl": tpl, "question": question, "rows": rows, "model": model, "effort": effort,
         "timeout": timeout}
    with ThreadPoolExecutor(max_workers=max(1, min(jobs, len(batches)))) as pool:
        done = list(pool.map(lambda nb: audit_batch(nb[0], nb[1], g), enumerate(batches, 1)))
    cost, at = 0.0, now()
    for (n, batch), (got, spent, notes) in zip(enumerate(batches, 1), done):
        cost += spent
        for note in notes:
            print(note, file=sys.stderr)
        for it in batch:
            missing = {"verdict": UNAUDITED, "reason": "denetçinin cevabında yok", "line": None}
            records[it["claim"]["id"]].update(got.get(it["claim"]["id"]) or missing, batch=n)
    out = [dict(records[c["id"]], at=at) for c in claims]
    write_jsonl(run / "audit.jsonl", out)
    if batches:
        where = (f"istem {folder}/batch-1.txt" if len(batches) == 1
                 else f"istemler {folder}/batch-1.txt … batch-{len(batches)}.txt")
        print(f"denetçi: {where} ({len(batches)} parti · {len(items)} iddia · {model} · efor {effort})",
              file=sys.stderr)
    t = tally(out)
    print(f"denetçi: {t['read']} iddia okundu · {t['corrected']} düzeltildi · {t['removed']} çıkarıldı · "
          f"{t['unaudited']} denetlenmedi · ${cost:.2f} · {time.monotonic() - t0:.0f}s")
    return 0


def cmd_apply(run: Path, ledger: Path) -> int:
    records = read_jsonl(run / "audit.jsonl")
    if records is None:
        return refuse("apply", f"denetçinin kaydı okunamadı: {run / 'audit.jsonl'}")
    if any("id_before" in r for r in records):
        return refuse("apply", "audit.jsonl zaten uygulandı — cevap bir kez yeniden yazılır; önce audit.py run")
    try:
        text = (run / "answer.md").read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError) as e:
        return refuse("apply", f"{run / 'answer.md'} okunamadı ({type(e).__name__})")
    book = read_jsonl(ledger)
    if book is None:
        return refuse("apply", f"iddia defteri okunamadı: {ledger}")
    by_id = {one(c.get("id")): c for c in book}
    raw, lines = text.splitlines(True), text.splitlines()      # the same cut: each line, and each with its end
    for r in records:                                     # the answer is still the one the auditor read
        n = r.get("line_no")
        stands = isinstance(n, int) and 1 <= n <= len(lines) and lines[n - 1] == r.get("was")
        if r.get("verdict") in VERDICTS and not stands:
            return refuse("apply", f"answer.md denetçinin okuduğu cevap değil: {r.get('id')} satır {n}")
    first = verdict_line(lines)
    notes, fixed, drop = [], {}, set()
    for r in records:
        verdict, n = r.get("verdict"), r.get("line_no")
        if verdict not in ("corrected", "removed"):
            continue
        claim = by_id.get(one(r.get("id")), {})
        if verdict == "removed" and n != first:
            drop.add(n)
            r["line"] = None
            continue
        final, why = settle(r.get("line"), r["was"], claim)
        if verdict == "removed":                           # the verdict line: never removed
            if final is not None:
                r.update(verdict="corrected", line=final, reason=f"hüküm satırı silinmez, denetçinin satırıyla "
                                                                 f"düzeltildi — {r.get('reason') or ''}".rstrip(" —"))
                fixed[n] = final
                notes.append(f"apply: {r.get('id')} hüküm satırı silinmez — denetçinin satırıyla düzeltildi")
            else:
                r.update(verdict="ok", line=None,
                         reason=f"hüküm satırı silinmez ({why}) — {r.get('reason') or ''}".rstrip(" —"))
                notes.append(f"apply: {r.get('id')} hüküm satırı silinmez ({why}) — ok")
        elif final is None:
            r.update(verdict="ok", line=None,
                     reason=f"denetçi satırı reddedildi: {why} — {r.get('reason') or ''}".rstrip(" —"))
            notes.append(f"apply: {r.get('id')} denetçi satırı reddedildi: {why} — ok")
        else:
            r["line"] = final
            fixed[n] = final
    k = 0
    for r in records:                                     # the ids and lines claims.py will give after the removals
        r["id_before"] = r.get("id")
        n = r.get("line_no")
        if r.get("verdict") == "removed":
            r["id"] = None
            continue
        if r.get("verdict") != "corrected":
            r["line"] = None
        k += 1
        r["id"] = f"C{k:03d}"
        if isinstance(n, int):
            r["line_no"] = n - sum(1 for d in drop if d < n)
    if fixed or drop:
        out = []
        for n, s in enumerate(raw, 1):
            if n in drop:
                continue
            out.append(fixed[n] + s[len(lines[n - 1]):] if n in fixed else s)
        write(run / "answer.md", "".join(out))
    write_jsonl(run / "audit.jsonl", records)
    for note in notes:
        print(note)
    print(f"apply: {len(fixed)} satır düzeltildi · {len(drop)} satır silindi")
    return 0


def cmd_check(run: Path, ledger: Path) -> int:
    records = read_jsonl(run / "audit.jsonl")
    if records is None:
        return refuse("check", f"denetçinin kaydı okunamadı: {run / 'audit.jsonl'}")
    book = read_jsonl(ledger)
    if book is None:
        return refuse("check", f"iddia defteri okunamadı: {ledger}")
    by_id = {one(c.get("id")): c for c in book}
    bad: list[tuple[str, str]] = []
    seen: set[str] = set()
    for r in records:
        name, verdict, n = one(r.get("id") or r.get("id_before")) or "?", r.get("verdict"), r.get("line_no")
        if verdict == "removed":
            gone = reading(r.get("was"))
            if gone is not None and any(c.get("line") == n and c.get("text") == gone.get("text") for c in book):
                bad.append((name, f"çıkarılan satır defterde duruyor (satır {n})"))
            continue
        c = by_id.get(one(r.get("id")))
        if c is None:
            bad.append((name, "defterde böyle bir iddia yok"))
            continue
        seen.add(one(r.get("id")))
        read = reading(r.get("line") if verdict == "corrected" else r.get("was")) or {}
        if read.get("text") != c.get("text"):
            bad.append((name, f"metni defterdekiyle aynı değil (satır {n})"))
        elif (list(read.get("support") or []), list(read.get("counter") or [])) != (
                list(c.get("support") or []), list(c.get("counter") or [])):
            bad.append((name, f"kimlikleri defterdekiyle aynı değil (satır {n})"))
        elif n != c.get("line"):
            bad.append((name, f"satır {n}, defterde {c.get('line')}"))
    bad += [(one(c.get("id")), "denetçinin kaydı yok") for c in book if one(c.get("id")) not in seen]
    if bad:
        names = [name for name, _why in bad]
        print(f"!! DENETİM UYUMSUZ: {' '.join(names[:IDS_SHOWN])}{' …' if len(names) > IDS_SHOWN else ''} — "
              f"{len(bad)} kayıt defterle uyuşmuyor")
        for name, why in bad:
            print(f"   {name}: {why}")
        return 1
    print(f"check: OK {len(records)}")
    return 0


# =================================================================== --selftest
# THE THREE ANSWERS --selftest reads: a bare one with the three verdicts, the same in a ``` fence, and one cut in the
# middle of its list — the K2 run's failed triage batch was a fenced JSON that had lost a brace (K2c F1).
SAMPLE = [{"id": "C001", "verdict": "ok", "reason": "Satırlar hükmü taşıyor."},
          {"id": "C002", "verdict": "corrected", "reason": "Satırlar üç değil iki gönderi gösteriyor.",
           "line": "- Astra'yı seçen 2 satır var [L0001, L0002] ↔ [L0003]."},
          {"id": "C003", "verdict": "removed", "reason": "Gösterilen satırların hiçbiri bunu söylemiyor."}]
GOOD = json.dumps({"verdicts": SAMPLE}, ensure_ascii=False)
FENCED = "```json\n" + json.dumps({"verdicts": SAMPLE}, ensure_ascii=False, indent=1) + "\n```"
CUT = GOOD[:GOOD.index('{"id": "C003"')]


def selftest() -> int:
    ids = [e["id"] for e in SAMPLE]
    good, fenced, cut = (verdicts_of(t, ids) for t in (GOOD, FENCED, CUT))
    shape = lambda got: " · ".join(f"{i} {v['verdict']}" for i, v in got.items())  # noqa: E731
    checks = [
        ("good", [v["verdict"] for v in good[0].values()] == ["ok", "corrected", "removed"]
         and good[0]["C002"]["line"] == SAMPLE[1]["line"] and not good[1], shape(good[0])),
        ("fenced", len(fenced[0]) == 3 and not fenced[1], shape(fenced[0])),
        ("cut", not cut[0] and cut[1] == "cevapta okunur JSON yok",
         f"okunamadı ({cut[1]}) → yeniden sorulur, yine yoksa denetlenmedi"),
    ]
    for name, ok, said in checks:
        print(f"{name}: {'OK' if ok else 'FAIL'} — {said}")
    n = sum(1 for _name, ok, _said in checks if ok)
    print(f"SELFTEST {'OK' if n == len(checks) else 'FAIL'} {n}/{len(checks)}")
    return 0 if n == len(checks) else 1


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="audit.py", description="the auditor: every claim read again against its rows")
    ap.add_argument("--selftest", action="store_true")
    sub = ap.add_subparsers(dest="cmd")
    rn = sub.add_parser("run")
    rn.add_argument("run")
    rn.add_argument("--ledger", help="default <run>/claims.jsonl")
    rn.add_argument("--model", default=MODEL)
    rn.add_argument("--effort", default=EFFORT)
    rn.add_argument("--timeout", type=int, default=TIMEOUT, help="seconds per call")
    rn.add_argument("--batch", type=int, default=BATCH, help="claims per call")
    rn.add_argument("--jobs", type=int, default=JOBS, help="calls at once")
    for name in ("apply", "check"):
        p = sub.add_parser(name)
        p.add_argument("run")
        p.add_argument("--ledger", help="default <run>/claims.jsonl")
    a = ap.parse_args(argv)
    if a.selftest:
        return selftest()
    if not a.cmd:
        ap.print_usage(sys.stderr)
        return 2
    run = Path(a.run)
    if not run.is_dir():
        return refuse(a.cmd, f"koşu klasörü yok: {run}")
    ledger = Path(a.ledger) if a.ledger else run / "claims.jsonl"
    if a.cmd == "run":
        if a.timeout < 1 or a.batch < 1 or a.jobs < 1:
            return refuse("denetçi", "--timeout, --batch ve --jobs en az 1")
        return cmd_run(run, ledger, a.model, a.effort, a.timeout, a.batch, a.jobs)
    return cmd_apply(run, ledger) if a.cmd == "apply" else cmd_check(run, ledger)


if __name__ == "__main__":
    raise SystemExit(main())
