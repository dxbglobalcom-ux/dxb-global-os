#!/usr/bin/env python3
"""THE TRIAGE — every body a run fetched gets a verdict before a hunter reads it (B56 K1 §2.3).

WHY. A hunter handed 130 bodies and a clock reads what it likes and declares the rest: on 2026-09-26
the x hunter of the deep run saw 73 of 130 X bodies and wrote "okundu 130". From here the ledger
knows which addresses are worth a hunter's reading (`triage=relevant`) before any hunter starts, and
`evidence.py batch` hands out exactly those. Measured the same morning
(.planning/quick/20260924-research-door-perplexity/x-deneme-2026-09-26/triage-haiku.json): the 130 X
bodies in ONE prompt to Haiku 4.5, effort low, no tools — 130 of 130 judged, relevant 105 ·
irrelevant 23 · duplicate 2, in 96 s, for $0.14. PROMPT below is that prompt, generalised from
"X posts about Astra 6 and Fable 5.1" to any platform and any question.

  triage.py <run> [--platform P|all] [--model claude-haiku-4-5-20251001] [--batch 60] [--dry-run FILE]

WHAT IS SENT. The address rows that have a body and whose triage is `pending` — per platform, in
ledger order, at most --batch rows and PROMPT_CHARS characters to a prompt, each text whitespace-
folded and cut at TEXT_CHARS. The measured X prompt was 100,516 bytes for 130 posts (43,133 tokens);
on the same run a YouTube transcript or a web page runs to 92,000 characters, and sixty of those
whole would not fit a model's window. A row with NO body is never sent: it stays pending until a fetch
brings one, and the count is printed.
THE CALL. `claude -p --model M --effort low --tools "" --strict-mcp-config --output-format json`,
the prompt on stdin (a single argv string is capped at 128 KiB), run in /tmp (`env -C /tmp`) so no
project hook fires. The JSON in `result` is applied through evidence.py's own triage-bulk path
(evidence.apply_triage), limited to the batch's own ids, with triage_by = the model's short name
(claude-haiku-4-5-20251001 -> haiku-4-5). Each batch prints its counts and its cost
(`total_cost_usd`); the last lines are the triage-bulk line for the whole run, `· already-triaged k`
after it, and `cost: $x.xx`. The judge is a model, never a hunter role: evidence.py's rule that a
hunter may eliminate only what it has read does not apply to it, whatever the model's name.
--dry-run FILE applies a prepared JSON instead of calling the model — a plain {"triage": [...]}, or
the claude --output-format json envelope whose `result` holds it. Nothing is spent; the tests use it.
A prepared id this run did not send is counted by the ledger, never applied: already-triaged (judged
before — a second run), unknown-id (an id the ledger never held), or `not applied` (still pending, on
another platform or without a body).

Two triage.py processes on different platforms may run at once: every write takes the ledger's lock.
Exit: 0 every batch answered · 1 a batch failed — its rows stay pending, and a second run sends only
what is still pending · 2 refused (no run folder, an unknown platform, no question.txt, an
unreadable --dry-run file).
"""
from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import time
from collections import Counter
from pathlib import Path

sys.dont_write_bytecode = True     # the skill folder is read-only inside a hunter's jail
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import evidence  # noqa: E402  — the ledger, its lock and the one path from a triage JSON to the rows
import platforms  # noqa: E402  — the platform names

MODEL = "claude-haiku-4-5-20251001"
BATCH = 60
TEXT_CHARS = 6000          # a body's first 6,000 characters decide its topic; 129 of the 130 X bodies go whole
PROMPT_CHARS = 240_000     # ≈ 103k tokens at the X prompt's measured 2.33 bytes a token; an all-CJK
                           # batch would run larger (the fixture's chinese bodies are 10 % CJK)
QUESTION_CHARS = 4000
TIMEOUT = int(os.environ.get("DXB_TRIAGE_TIMEOUT") or 600)
KIND = {"x": "X (Twitter) posts", "reddit": "Reddit threads", "youtube": "YouTube videos (transcript and comments)",
        "hackernews": "Hacker News discussions", "chinese": "Chinese-language community posts", "web": "web pages"}

PROMPT = """You are a triage clerk. RESEARCH QUESTION:
{question}

Below are {n} {kind} a search found, each as `### <id> | @<author> | <date> | <address>` followed by its text (cut at {cap} characters). For EACH item decide: "relevant" (it is about what the research question asks — it compares or judges the things the question names, or tells a user's own experience with one of them in that sense), "irrelevant" (reason in at most 6 words), or "duplicate" (give the id it duplicates in "duplicate_of"). Do not skip any. Output ONLY valid JSON:
{{"triage":[{{"id":"L0001","status":"relevant|irrelevant|duplicate","reason":"...","duplicate_of":"..."}}],"counts":{{"relevant":0,"irrelevant":0,"duplicate":0}}}}
Every one of the {n} ids MUST appear exactly once.

THE ITEMS:
{items}"""


def short_name(model: str) -> str:
    """claude-haiku-4-5-20251001 -> haiku-4-5: the contract's `triage_by`."""
    return re.sub(r"-\d{8}$", "", re.sub(r"^claude-", "", model))


def pending_bodies(run: Path, platform: str) -> tuple[dict[str, list], Counter]:
    """platform -> [(id, canon, row)] of the pending rows WITH a body, in ledger order; and, per
    platform, how many pending rows have none (never sent)."""
    groups: dict[str, list] = {}
    bodiless: Counter = Counter()
    for canon, rs in evidence.by_canon(evidence.read_rows(run)).items():
        addr = evidence.address_row(rs)
        if not canon or addr is None or evidence.triage_of(addr) != "pending":
            continue
        p = evidence.row_platform(addr, canon)
        if platform != "all" and p != platform:
            continue
        if evidence.has_body(run, canon):
            groups.setdefault(p, []).append((str(addr.get("id")), canon, addr))
        else:
            bodiless[p] += 1
    order = {p: i for i, p in enumerate(platforms.PLATFORMS)}
    return dict(sorted(groups.items(), key=lambda kv: (order.get(kv[0], len(order)), kv[0]))), bodiless


def batches(run: Path, groups: dict[str, list], size: int) -> list[tuple[str, list[tuple[str, str]]]]:
    """(platform, [(id, the item as the prompt shows it)]) — one platform to a batch."""
    out = []
    for p, items in groups.items():
        cur: list[tuple[str, str]] = []
        chars = 0
        for rid, canon, addr in items:
            text = re.sub(r"\s+", " ", evidence.read_body(run, canon) or "").strip()[:TEXT_CHARS]
            block = f"{evidence.header_of(addr, canon)}\n{text}\n"
            if cur and (len(cur) >= size or chars + len(block) > PROMPT_CHARS):
                out.append((p, cur))
                cur, chars = [], 0
            cur.append((rid, block))
            chars += len(block)
        if cur:
            out.append((p, cur))
    return out


def verdicts_in(text) -> list | None:
    """The `triage` list of a model's answer: bare JSON, or in a ``` fence (the measured Haiku answer
    was fenced), or with words around it."""
    if not isinstance(text, str):
        return None
    s = text.strip()
    fence = re.search(r"```(?:json)?\s*(.*?)\s*```", s, re.S)
    for cand in ([fence.group(1)] if fence else []) + [s, s[s.find("{"):s.rfind("}") + 1]]:
        try:
            obj = json.loads(cand)
        except ValueError:
            continue
        if isinstance(obj, dict) and isinstance(obj.get("triage"), list):
            return obj["triage"]
    return None


def prepared(path: str) -> list | None:
    """--dry-run: a plain {"triage": [...]}, or the claude envelope whose `result` carries it."""
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    if isinstance(data, dict) and isinstance(data.get("triage"), list):
        return data["triage"]
    return verdicts_in(data.get("result")) if isinstance(data, dict) else None


def ask(prompt: str, model: str) -> tuple[list | None, float, str | None]:
    """One model call -> (the verdicts, what it cost in USD, why it failed)."""
    cmd = ["claude", "-p", "--model", model, "--effort", "low", "--tools", "", "--strict-mcp-config",
           "--output-format", "json"]
    try:
        p = subprocess.run(cmd, input=prompt, capture_output=True, encoding="utf-8", errors="replace",
                           cwd="/tmp", timeout=TIMEOUT)
    except subprocess.TimeoutExpired:
        return None, 0.0, f"no answer in {TIMEOUT} s"
    except OSError as e:
        return None, 0.0, f"claude did not start: {e}"
    try:
        env = json.loads(p.stdout)
    except ValueError:
        return None, 0.0, f"claude exit {p.returncode}, not JSON: {(p.stderr or p.stdout).strip()[:200]}"
    if not isinstance(env, dict):
        return None, 0.0, f"claude exit {p.returncode}: {str(env)[:200]}"
    cost = float(env.get("total_cost_usd") or 0)
    if p.returncode != 0 or env.get("is_error"):
        return None, cost, f"claude exit {p.returncode}: {str(env.get('result'))[:200]}"
    found = verdicts_in(env.get("result"))
    if found is None:
        return None, cost, f"no triage JSON in the answer: {str(env.get('result'))[:200]}"
    return found, cost, None


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="triage.py", description="every fetched body judged before a hunter reads")
    ap.add_argument("run")
    ap.add_argument("--platform", default="all")
    ap.add_argument("--model", default=MODEL)
    ap.add_argument("--batch", type=int, default=BATCH)
    ap.add_argument("--dry-run", dest="dry_run")
    args = ap.parse_args(argv)

    run = Path(args.run)
    if not run.is_dir():
        print(f"REFUSED no such run folder: {run}")
        return 2
    if args.platform != "all" and args.platform not in platforms.PLATFORMS:
        print(f"REFUSED unknown platform: {args.platform} (one of: {' '.join(platforms.PLATFORMS)})")
        return 2
    if args.batch < 1:
        print(f"REFUSED --batch {args.batch}: a batch holds at least one row")
        return 2
    ready, question = None, ""
    if args.dry_run:
        try:
            ready = prepared(args.dry_run)
        except (OSError, ValueError) as e:
            print(f"REFUSED --dry-run file not readable as JSON: {args.dry_run} ({type(e).__name__})")
            return 2
        if ready is None:
            print(f'REFUSED no "triage" list in {args.dry_run} (nor in its `result`)')
            return 2
    else:
        q = run / "question.txt"
        question = q.read_text(encoding="utf-8", errors="replace").strip()[:QUESTION_CHARS] if q.is_file() else ""
        if not question:
            print(f"REFUSED no question in {q}: the triage has nothing to judge relevance by")
            return 2

    by = short_name(args.model)
    groups, bodiless = pending_bodies(run, args.platform)
    plan = batches(run, groups, args.batch)
    total = Counter({k: 0 for k in ("relevant", "irrelevant", "duplicate", "unknown-id")})
    cost, failed, left = 0.0, 0, 0
    sent: set[str] = set()
    for i, (p, items) in enumerate(plan, 1):
        ids = [rid for rid, _ in items]
        sent.update(ids)
        t0 = time.monotonic()
        if ready is not None:
            found, spent, err = [e for e in ready if isinstance(e, dict) and str(e.get("id") or "").strip() in ids], 0.0, None
        else:
            prompt = PROMPT.format(question=question, n=len(ids), cap=TEXT_CHARS,
                                   kind=KIND.get(p, f"{platforms.LABEL.get(p, p)} posts"),
                                   items="\n".join(block for _, block in items))
            found, spent, err = ask(prompt, args.model)
        cost += spent
        head = f"batch {i}/{len(plan)} · {p} · {len(ids)} rows"
        if err:
            failed += 1
            left += len(ids)
            print(f"{head}: FAILED — {err} · ${spent:.2f} · {time.monotonic() - t0:.0f} s")
            continue
        counts, refused, done = evidence.apply_triage(run, found, by, only=set(ids), hunter=False)
        total.update(counts)
        no_answer = [rid for rid in ids if rid not in done]
        left += len(no_answer)
        print(f"{head}: relevant {counts['relevant']} · irrelevant {counts['irrelevant']} · duplicate "
              f"{counts['duplicate']} · unknown-id {counts['unknown-id']} · left pending {len(no_answer)} · "
              f"${spent:.2f} · {time.monotonic() - t0:.0f} s")
        for _rid, why in refused[:5]:
            print(f"  refused: {why}")
    unsent = 0
    if ready is not None:       # a prepared verdict for a row that was not sent: counted by what the
        index = evidence.address_index(evidence.read_rows(run))   # ledger holds, never applied (the
        for e in ready:                                           # verifier's B5: a second run said unknown-id 130)
            rid = str(e.get("id") or "").strip() if isinstance(e, dict) else ""
            if rid in sent:
                continue
            addr = index.get(rid)
            if addr is None:
                total["unknown-id"] += 1                          # an id this ledger never held
            elif evidence.triage_of(addr) != "pending":
                total["already-triaged"] += 1
            else:
                unsent += 1                                       # pending, on another platform or bodiless
    if not plan:
        print(f"nothing pending with a body on {args.platform}")
    print(f"{evidence.triaged_line(total)} · already-triaged {total['already-triaged']}")
    if unsent:
        print(f"not applied: {unsent} prepared verdicts name pending rows this run did not send "
              "(another platform, or no body yet)")
    if left:
        print(f"left pending: {left} rows with a body — run triage.py again; it sends only what is still pending")
    if bodiless:
        print(f"not sent: {sum(bodiless.values())} pending rows have no body ("
              + " · ".join(f"{p} {k}" for p, k in bodiless.most_common()) + ") — a fetch brings one first")
    print(f"cost: ${cost:.2f}" + ("  (dry run — no model called)" if ready is not None else ""))
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
