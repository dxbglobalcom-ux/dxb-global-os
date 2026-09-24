#!/usr/bin/env python3
"""Caveman-on-Opus-5.5 measurement runner (audit card H2, 2026-09-24).

Three arms, identical except the brevity text appended to Claude Code's default system prompt:
  N  no brevity text
  C  arm-C.txt  the caveman block, verbatim from ~/.claude/CLAUDE.md
  P  arm-P.txt  the proposed block, the '+' lines of hunk H2 in PROPOSED.diff

Isolation (proved by the `canary` step, see SUMMARY.md):
  --safe-mode      drops every CLAUDE.md, auto-memory, hooks, plugins, MCP servers,
                   custom skills/agents and output styles
  --tools ""       drops the built-in tools
  CLAUDE_CODE_DISABLE_ADVISOR_TOOL=1
                   drops the server-side advisor tool that the user setting
                   `advisorModel` otherwise adds even in safe mode
  env scrub        the session-link variables inherited from the calling Claude Code
                   session (CLAUDE*, AI_AGENT, TRACEPARENT) are removed, so each call is
                   a plain top-level `claude -p`
  stdin=DEVNULL    avoids the CLI's 3-second wait for piped stdin
All calls run sequentially from one neutral, empty, non-git working directory.

usage:
  run_arms.py canary [--cwd DIR]   one isolation probe per arm: arm text + a unique marker
  run_arms.py run [--cwd DIR]      one warm-up per arm, then 4 questions x 2 runs x 3 arms
  run_arms.py summarize            prints the full summary (markdown) from the recorded files;
                                   `run_arms.py summarize > SUMMARY.md` writes the deliverable
"""
import argparse
import json
import os
import re
import statistics
import subprocess
import tempfile
import time
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
MODEL = "claude-opus-5-5"
EFFORT = "xhigh"
BUDGET_USD = "3"  # per-call tripwire
RUNS = 2
ARMS = ("N", "C", "P")
ARM_TEXT = {
    "N": "",
    "C": (HERE / "arm-C.txt").read_text(encoding="utf-8"),
    "P": (HERE / "arm-P.txt").read_text(encoding="utf-8"),
}
MARKERS = {"N": "QX7-CANARY-N", "C": "QX7-CANARY-C", "P": "QX7-CANARY-P"}


def child_env() -> dict:
    env = {k: v for k, v in os.environ.items()
           if not k.startswith("CLAUDE") and k not in ("AI_AGENT", "TRACEPARENT")}
    env["CLAUDE_CODE_DISABLE_ADVISOR_TOOL"] = "1"
    return env


def claude_cmd(prompt: str, arm_text: str) -> list:
    cmd = ["claude", "-p",
           "--model", MODEL, "--effort", EFFORT,
           "--safe-mode", "--tools", "", "--strict-mcp-config",
           "--no-session-persistence",
           "--output-format", "stream-json", "--verbose", "--include-hook-events",
           "--max-budget-usd", BUDGET_USD]
    if arm_text:
        cmd += ["--append-system-prompt", arm_text]
    cmd.append(prompt)  # last, after a non-variadic option
    return cmd


def call(prompt: str, arm_text: str, cwd: str, raw_path: Path) -> dict:
    started = datetime.now(timezone.utc).isoformat(timespec="seconds")
    t0 = time.monotonic()
    proc = subprocess.run(claude_cmd(prompt, arm_text), cwd=cwd, env=child_env(),
                          stdin=subprocess.DEVNULL, capture_output=True, text=True,
                          timeout=1800)
    wall = time.monotonic() - t0
    raw_path.parent.mkdir(parents=True, exist_ok=True)
    raw_path.write_text(proc.stdout, encoding="utf-8")
    rec = {"started_at": started, "wall_s": round(wall, 2), "exit_code": proc.returncode,
           "hook_events": 0, "init_tools": None, "init_mcp_servers": None,
           "init_model": None, "api_key_source": None}
    result = None
    for line in proc.stdout.splitlines():
        try:
            d = json.loads(line)
        except ValueError:
            continue
        t, st = d.get("type"), d.get("subtype") or ""
        if t == "system" and st == "init":
            rec["init_tools"] = len(d.get("tools") or [])
            rec["init_mcp_servers"] = len(d.get("mcp_servers") or [])
            rec["init_model"] = d.get("model")
            rec["api_key_source"] = d.get("apiKeySource")
        elif t == "system" and "hook" in st:
            rec["hook_events"] += 1
        elif t == "result":
            result = d
    if result is None:
        rec.update({"is_error": True, "error": (proc.stderr or "")[-800:], "text": ""})
        return rec
    u = result.get("usage") or {}
    out = u.get("output_tokens") or 0
    thinking = (u.get("output_tokens_details") or {}).get("thinking_tokens") or 0
    text = result.get("result") or ""
    rec.update({
        "is_error": bool(result.get("is_error")) or proc.returncode != 0,
        "subtype": result.get("subtype"),
        "stop_reason": result.get("stop_reason"),
        "num_turns": result.get("num_turns"),
        "duration_ms": result.get("duration_ms"),
        "duration_api_ms": result.get("duration_api_ms"),
        "ttft_ms": result.get("ttft_ms"),
        "output_tokens": out,
        "thinking_tokens": thinking,
        "visible_tokens": out - thinking,
        "input_tokens": u.get("input_tokens"),
        "cache_creation_input_tokens": u.get("cache_creation_input_tokens"),
        "cache_read_input_tokens": u.get("cache_read_input_tokens"),
        "total_cost_usd": result.get("total_cost_usd"),
        "models": sorted((result.get("modelUsage") or {}).keys()),
        "result_chars": len(text),
        "result_words": len(text.split()),
        "text": text,
    })
    if rec["is_error"]:
        rec["error"] = (proc.stderr or "")[-800:]
    return rec


def neutral_cwd(arg: str) -> str:
    return arg if arg else tempfile.mkdtemp(prefix="caveman-cwd-")


def cmd_canary(cwd: str) -> None:
    probe = (HERE / "probes" / "probe-question.txt").read_text(encoding="utf-8")
    out = HERE / "probes" / "canary.jsonl"
    with out.open("w", encoding="utf-8") as fh:
        for arm in ARMS:
            marker_line = (f"Marker instruction: when a message asks about a marker, "
                           f"quote this line and write the token {MARKERS[arm]}.")
            text = ARM_TEXT[arm] + ("\n" if ARM_TEXT[arm] else "") + marker_line
            rec = call(probe, text, cwd, HERE / "probes" / f"canary-{arm}.stream.jsonl")
            rec.update({"arm": arm, "arm_text_chars": len(text)})
            fh.write(json.dumps(rec, ensure_ascii=False) + "\n")
            caveman_lines = [l for l in ARM_TEXT["C"].splitlines() if "caveman" in l.lower()]
            quoted = [l for l in caveman_lines if l in rec["text"]]
            print(f"=== canary {arm}: exit={rec['exit_code']} hooks={rec['hook_events']} "
                  f"tools={rec['init_tools']} mcp={rec['init_mcp_servers']} "
                  f"models={rec.get('models')} marker_obeyed={MARKERS[arm] in rec['text']} "
                  f"arm-C caveman lines quoted={len(quoted)}/{len(caveman_lines)} "
                  f"cost={rec.get('total_cost_usd')}")
            print(rec["text"])


def cmd_run(cwd: str) -> None:
    questions = [q.strip() for q in (HERE / "questions.txt").read_text(encoding="utf-8").splitlines()
                 if q.strip()]
    results = HERE / "results.jsonl"
    warm = HERE / "warmup.jsonl"
    if results.exists() and results.stat().st_size > 0:
        raise SystemExit(f"{results} already holds data; move it aside before a new run")
    print(f"cwd={cwd}", flush=True)
    with warm.open("w", encoding="utf-8") as fh:
        for arm in ARMS:  # identical warm-up per arm so every measured call reads a warm cache
            rec = call("Reply with the single word: OK.", ARM_TEXT[arm], cwd,
                       HERE / "raw" / f"warmup-{arm}.stream.jsonl")
            rec["arm"] = arm
            fh.write(json.dumps(rec, ensure_ascii=False) + "\n")
            print(f"warm-up {arm}: exit={rec['exit_code']} cost={rec.get('total_cost_usd')}",
                  flush=True)
    blocks = [(qi, r) for qi in range(1, len(questions) + 1) for r in range(1, RUNS + 1)]
    order = 0
    with results.open("w", encoding="utf-8") as fh:
        for bi, (qi, r) in enumerate(blocks):
            arms = ARMS[bi % 3:] + ARMS[:bi % 3]  # rotate the arm order per block
            for arm in arms:
                order += 1
                name = f"{arm}-q{qi}-r{r}"
                for attempt in (1, 2):
                    rec = call(questions[qi - 1], ARM_TEXT[arm], cwd,
                               HERE / "raw" / f"{name}-a{attempt}.stream.jsonl")
                    rec.update({"arm": arm, "q": qi, "run": r, "order": order,
                                "attempt": attempt, "answer_file": f"answers/{name}.md"})
                    if not rec["is_error"]:
                        (HERE / "answers" / f"{name}.md").write_text(rec["text"] + "\n",
                                                                    encoding="utf-8")
                    fh.write(json.dumps(rec, ensure_ascii=False) + "\n")
                    fh.flush()
                    print(f"[{order:02d}] {name} attempt={attempt} err={rec['is_error']} "
                          f"out={rec.get('output_tokens')} think={rec.get('thinking_tokens')} "
                          f"cost={rec.get('total_cost_usd')} wall={rec['wall_s']}s", flush=True)
                    if not rec["is_error"]:
                        break


def pct(v: float, base: float) -> str:
    return f"{(v - base) / base * 100:+.1f} %" if base else "n/a"


def cmd_summarize() -> None:
    recs = [json.loads(l) for l in (HERE / "results.jsonl").read_text(encoding="utf-8").splitlines()
            if l.strip()]
    ok = [r for r in recs if not r["is_error"]]
    failed = [r for r in recs if r["is_error"]]
    metrics = (("output_tokens", "out tok", "{:.0f}"), ("visible_tokens", "visible tok", "{:.0f}"),
               ("total_cost_usd", "cost $", "{:.4f}"), ("wall_s", "time s", "{:.1f}"))

    def mean(arm, key, q=None):
        vals = [r[key] for r in ok if r["arm"] == arm and (q is None or r["q"] == q)]
        return statistics.mean(vals) if vals else float("nan")

    lines = ["| scope | arm | n | " + " | ".join(m[1] for m in metrics) + " | "
             + " | ".join(f"Δ {m[1]} vs N" for m in metrics) + " |",
             "|---" * (3 + 2 * len(metrics)) + "|"]
    for q in [None] + sorted({r["q"] for r in ok}):
        scope = "overall" if q is None else f"Q{q}"
        for arm in ARMS:
            n = len([r for r in ok if r["arm"] == arm and (q is None or r["q"] == q)])
            vals = [fmt.format(mean(arm, k, q)) for k, _, fmt in metrics]
            deltas = ["—" if arm == "N" else pct(mean(arm, k, q), mean("N", k, q))
                      for k, _, _ in metrics]
            lines.append(f"| {scope} | {arm} | {n} | " + " | ".join(vals) + " | "
                         + " | ".join(deltas) + " |")
    per_call = ["| order | call | out tok | thinking | visible | chars | cost $ | time s | cache read | cache write |",
                "|---|---|---|---|---|---|---|---|---|---|"]
    for r in sorted(ok, key=lambda r: r["order"]):
        per_call.append(f"| {r['order']} | {r['arm']}-q{r['q']}-r{r['run']} | {r['output_tokens']} | "
                        f"{r['thinking_tokens']} | {r['visible_tokens']} | {r['result_chars']} | "
                        f"{r['total_cost_usd']:.4f} | {r['wall_s']:.1f} | "
                        f"{r['cache_read_input_tokens']} | {r['cache_creation_input_tokens']} |")
    def jsonl(name):
        p = HERE / name
        return [json.loads(l) for l in p.read_text(encoding="utf-8").splitlines() if l.strip()] \
            if p.exists() else []

    warm, canary, effort = jsonl("warmup.jsonl"), jsonl("probes/canary.jsonl"), \
        jsonl("probes/effort-check.jsonl")
    naive, safe = stream_facts(HERE / "probes" / "p0-naive.stream.jsonl"), \
        stream_facts(HERE / "probes" / "p1-safe.stream.jsonl")
    cave = [l for l in ARM_TEXT["C"].splitlines() if "caveman" in l.lower()]
    costs = {
        "24 measured calls": sum(r.get("total_cost_usd") or 0 for r in recs),
        "warm-up (3)": sum(r.get("total_cost_usd") or 0 for r in warm),
        "canary (3)": sum(r.get("total_cost_usd") or 0 for r in canary),
        "probes p0-naive + p1-safe": naive["cost"] + safe["cost"],
        "effort checks": sum(r.get("total_cost_usd") or 0 for r in effort) + EFFORT_DEBUG_PROBE_USD,
    }
    models = sorted({m for r in ok for m in r["models"]})
    hooks = sum(r["hook_events"] for r in recs)
    tools = sorted({(r["init_tools"], r["init_mcp_servers"]) for r in recs})
    n_ctx = statistics.mean(sum(r.get(k) or 0 for k in ("input_tokens", "cache_creation_input_tokens",
                                                       "cache_read_input_tokens"))
                            for r in ok if r["arm"] == "N")

    canary_lines = []
    for r in canary:
        t = r["text"]
        inp = sum(r.get(k) or 0 for k in ("input_tokens", "cache_creation_input_tokens",
                                          "cache_read_input_tokens"))
        canary_lines.append(
            f"   - {r['arm']}: hooks {r['hook_events']}, tools {r['init_tools']}, MCP "
            f"{r['init_mcp_servers']}, input {inp} tok; arm-C caveman lines quoted "
            f"{sum(l in t for l in cave)}/{len(cave)}; `CAVEMAN: NONE` {'CAVEMAN: NONE' in t}; "
            f"Brevity {presence(t, 'Brevity')}; Respond terse {presence(t, 'Respond terse')}; "
            f"marker {MARKERS[r['arm']]} obeyed {MARKERS[r['arm']] in t}")
    effort_line = "; ".join(f"--effort {r['effort_flag']}: {r['thinking_tokens']} thinking tok, "
                            f"{r['effort_rejected_lines']} `[effort]` rejections, "
                            f"{r['advisor_tool_lines']} `[AdvisorTool]` lines" for r in effort)

    think = ["| arm | thinking tok | visible tok | answer chars | Δ thinking | Δ visible | Δ chars |",
             "|---|---|---|---|---|---|---|"]
    for arm in ARMS:
        vals = [mean(arm, k) for k in ("thinking_tokens", "visible_tokens", "result_chars")]
        base = [mean("N", k) for k in ("thinking_tokens", "visible_tokens", "result_chars")]
        think.append(f"| {arm} | {vals[0]:.0f} | {vals[1]:.0f} | {vals[2]:.0f} | "
                     + " | ".join("—" if arm == "N" else pct(v, b) for v, b in zip(vals, base)) + " |")
    qs = sorted({r["q"] for r in ok})
    sign = []
    for arm in ("C", "P"):
        vis_neg = sum(mean(arm, "visible_tokens", q) < mean("N", "visible_tokens", q) for q in qs)
        out_neg = sum(mean(arm, "output_tokens", q) < mean("N", "output_tokens", q) for q in qs)
        sign.append(f"{arm}: visible tokens below N in {vis_neg}/{len(qs)} questions, "
                    f"billed output below N in {out_neg}/{len(qs)}")

    block = "\n".join([
        "# Caveman block on Opus 5.5 — measurement (audit card H2, 2026-09-24)", "",
        "Generated by `run_arms.py summarize` from results.jsonl, warmup.jsonl and probes/.", "",
        "## Design", "",
        f"- Arms: N = no brevity text; C = arm-C.txt (verbatim, ~/.claude/CLAUDE.md caveman block); "
        f"P = arm-P.txt ('+' lines of hunk H2, PROPOSED.diff). Only difference: the text passed "
        f"with `--append-system-prompt`.",
        f"- `{MODEL}`, `--effort {EFFORT}`, tools off, questions.txt (4), {RUNS} runs per arm per "
        f"question, sequential, arm order rotated per (question, run) block.",
        "- One identical warm-up call per arm first, so the shared prefix is cached for all arms; "
        "the per-question segment (~660 tok) is written once per arm per question (run 1) and "
        "read on run 2 — symmetric across arms.", "",
        "## Isolation proof (command → output)", "",
        f"1. Naive `claude -p --tools \"\"` (`probes/probe.py p0-naive …`): {naive['hooks']} hook "
        f"events, {naive['mcp']} MCP servers, input {naive['input']} tok; model quoted "
        f"{sum(l in naive['text'] for l in cave)}/{len(cave)} caveman lines → contaminated; "
        f"the detector works.",
        f"2. `--safe-mode` (`probes/probe.py p1-safe …`): {safe['hooks']} hook events, "
        f"{safe['mcp']} MCP, {safe['tools']} tools, input {safe['input']} tok, `CAVEMAN: NONE` "
        f"{'CAVEMAN: NONE' in safe['text']}, `INSTRUCTION FILES: NONE` "
        f"{'INSTRUCTION FILES: NONE' in safe['text']}. The debug log still showed "
        f"`[AdvisorTool] Server-side tool enabled` (user setting `advisorModel`) → runner adds "
        f"`CLAUDE_CODE_DISABLE_ADVISOR_TOOL=1`, drops inherited `CLAUDE*` variables "
        f"(`CLAUDE_EFFORT=max`, `CLAUDE_CODE_CHILD_SESSION=1`, …) and closes stdin.",
        "3. Canary with the runner's exact command (`run_arms.py canary`; arm text + one unique "
        "marker line; full text in probes/canary.out):", *canary_lines,
        f"4. Effort (`probes/effort_check.py`): {effort_line}.",
        "5. `--bare` rejected: it authenticates only with ANTHROPIC_API_KEY/apiKeyHelper; this "
        "machine uses OAuth (`apiKeySource: none`) and raw keys are not allowed.",
        "- Identical in all arms (not stripped by safe mode): the `language: Turkish` setting's "
        "`# Language` block, the additionalDirectories path in `# Environment`, a `# userEmail` "
        "reminder, `permissionMode: bypassPermissions`.",
        "- Channel caveat: production delivers the block inside ~/.claude/CLAUDE.md in a user-turn "
        f"reminder with a ~{naive['input'] / 1000:.1f}k-token context; here it is appended to the "
        f"system prompt with a ~{n_ctx / 1000:.1f}k-token context (arm N mean). Absolute numbers "
        "are not production numbers; the N/C/P deltas are the measurement.", "",
        "## Means per arm (n = successful calls; Δ = change against arm N)", "",
        "`out tok` = billed output tokens, thinking included; `visible tok` = out tok − thinking.", "",
        *lines, "",
        "## Thinking vs visible text (overall means)", "", *think, "",
        "- " + "; ".join(sign) + ".",
        "- The 2026-09-21 counting method (thinking included or not) is not recorded: "
        "UNVERIFIED — could not measure because no record of that run's method was found.", "",
        "## Calls and cost", "",
        f"- {len(recs)} recorded, {len(ok)} successful, {len(failed)} failed"
        + (": " + ", ".join(f"{r['arm']}-q{r['q']}-r{r['run']} attempt {r['attempt']}"
                            for r in failed) if failed else "") + ".",
        f"- Models billed: {models}; hook events across the 24 calls: {hooks}; "
        f"(tools, MCP servers) at init: {tools}.",
        "- Cost: " + "; ".join(f"{k} ${v:.4f}" for k, v in costs.items())
        + f"; all-in ${sum(costs.values()):.4f}.", "",
        "## Every call", "", *per_call,
    ])
    print(block)


# First effort probe (`--debug-file`, 2026-09-24): its result file was deleted together with
# its debug log, so its cost is carried here as printed by the CLI at the time.
EFFORT_DEBUG_PROBE_USD = 0.0141058


def stream_facts(path: Path) -> dict:
    facts = {"hooks": 0, "mcp": None, "tools": None, "input": 0, "text": "", "cost": 0.0}
    if not path.exists():
        return facts
    for line in path.read_text(encoding="utf-8").splitlines():
        try:
            d = json.loads(line)
        except ValueError:
            continue
        t, st = d.get("type"), d.get("subtype") or ""
        if t == "system" and st == "init":
            facts["mcp"] = len(d.get("mcp_servers") or [])
            facts["tools"] = len(d.get("tools") or [])
        elif t == "system" and "hook" in st:
            facts["hooks"] += 1
        elif t == "result":
            u = d.get("usage") or {}
            facts["input"] = sum(u.get(k) or 0 for k in ("input_tokens", "cache_creation_input_tokens",
                                                         "cache_read_input_tokens"))
            facts["text"] = d.get("result") or ""
            facts["cost"] = d.get("total_cost_usd") or 0.0
    return facts


def presence(text: str, needle: str) -> str:
    m = re.search(r'"' + re.escape(needle) + r'"\W+(yes|no)', text, re.I)
    return m.group(1).lower() if m else "?"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("step", choices=("canary", "run", "summarize"))
    ap.add_argument("--cwd", default="", help="neutral empty non-git working directory")
    a = ap.parse_args()
    if a.step == "canary":
        cmd_canary(neutral_cwd(a.cwd))
    elif a.step == "run":
        cmd_run(neutral_cwd(a.cwd))
    else:
        cmd_summarize()


if __name__ == "__main__":
    main()
