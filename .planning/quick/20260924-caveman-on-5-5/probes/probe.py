#!/usr/bin/env python3
"""Isolation probe: run `claude -p` once with the given extra flags from a neutral cwd,
save the raw stream-json, and print what the CLI loaded (init message), whether any hook
ran, the token usage and the model's answer.

usage: probe.py NAME CWD PROMPT_FILE [extra claude flags ...]
"""
import json
import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent


def main() -> int:
    name, cwd, prompt_file = sys.argv[1], sys.argv[2], sys.argv[3]
    extra = sys.argv[4:]
    prompt = Path(prompt_file).read_text(encoding="utf-8")
    cmd = [
        "claude", "-p",
        "--model", "claude-opus-5-5",
        "--tools", "",
        "--no-session-persistence",
        "--output-format", "stream-json", "--verbose",
        "--include-hook-events",
        *extra,
        prompt,
    ]
    t0 = time.monotonic()
    proc = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, timeout=900)
    wall = time.monotonic() - t0
    raw = HERE / f"{name}.stream.jsonl"
    raw.write_text(proc.stdout, encoding="utf-8")
    (HERE / f"{name}.stderr").write_text(proc.stderr, encoding="utf-8")
    print(f"exit={proc.returncode} wall_s={wall:.1f} flags={' '.join(extra)}")
    hook_events = 0
    for line in proc.stdout.splitlines():
        try:
            d = json.loads(line)
        except ValueError:
            continue
        t, st = d.get("type"), d.get("subtype")
        if t == "system" and st == "init":
            for k in ("cwd", "model", "permissionMode", "apiKeySource", "output_style",
                      "mcp_servers", "tools", "plugins", "skills", "slash_commands", "agents"):
                print("INIT", k, ":", json.dumps(d.get(k), ensure_ascii=False)[:500])
        elif t == "system" and st and "hook" in st:
            hook_events += 1
            print("HOOK", st, json.dumps(d.get("hook_name") or d.get("hook_event"), ensure_ascii=False))
        elif t == "result":
            u = d.get("usage") or {}
            print("RESULT input_tokens=%s cache_creation=%s cache_read=%s output_tokens=%s" % (
                u.get("input_tokens"), u.get("cache_creation_input_tokens"),
                u.get("cache_read_input_tokens"), u.get("output_tokens")))
            print("RESULT models:", sorted((d.get("modelUsage") or {}).keys()),
                  "cost:", d.get("total_cost_usd"), "is_error:", d.get("is_error"))
            print("RESULT text:\n" + str(d.get("result")))
    print("hook_events:", hook_events)
    if proc.returncode != 0:
        print("STDERR:", proc.stderr[-1500:])
    return proc.returncode


if __name__ == "__main__":
    sys.exit(main())
