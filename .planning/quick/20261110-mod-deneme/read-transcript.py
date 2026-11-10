#!/usr/bin/env python3
"""Reads a session transcript and prints one row per API request (deduplicated by
requestId / message id): the turn it belongs to, the effort and model the row
carries, the four token counts, and any Skill tool call.

  read-transcript.py <session-id> [--json]
"""
import json
import sys
from pathlib import Path

PROJECT = Path.home() / ".claude/projects/-home-dxb-DxB-Global-OS"


def requests(session_id):
    rows = []
    turn = 0
    seen = {}
    for line in open(PROJECT / f"{session_id}.jsonl"):
        try:
            r = json.loads(line)
        except ValueError:
            continue
        if r.get("isSidechain"):
            continue
        m = r.get("message") or {}
        if r.get("type") == "user":
            c = m.get("content")
            is_tool_result = isinstance(c, list) and any(
                isinstance(b, dict) and b.get("type") == "tool_result" for b in c
            )
            if not is_tool_result and not r.get("isMeta"):
                text = c if isinstance(c, str) else " ".join(
                    b.get("text", "") for b in c if isinstance(b, dict) and b.get("type") == "text"
                )
                if text.strip() and not text.lstrip().startswith("<"):
                    turn += 1
            continue
        if r.get("type") != "assistant":
            continue
        key = r.get("requestId") or m.get("id")
        u = m.get("usage") or {}
        blocks = m.get("content") if isinstance(m.get("content"), list) else []
        tools = [b.get("name") for b in blocks if isinstance(b, dict) and b.get("type") == "tool_use"]
        skills = [
            (b.get("input") or {}).get("skill")
            for b in blocks
            if isinstance(b, dict) and b.get("type") == "tool_use" and b.get("name") == "Skill"
        ]
        if key in seen:
            row = seen[key]
            row["tools"] += tools
            row["skills"] += skills
            continue
        cc = u.get("cache_creation") or {}
        row = {
            "turn": turn,
            "time": r.get("timestamp"),
            "requestId": key,
            "effort": r.get("effort"),
            "perTurnEffort": r.get("perTurnEffort"),
            "requestedModel": r.get("requestedModel"),
            "model": m.get("model"),
            "input": u.get("input_tokens", 0),
            "cache_write": u.get("cache_creation_input_tokens", 0),
            "cache_write_1h": cc.get("ephemeral_1h_input_tokens", 0),
            "cache_write_5m": cc.get("ephemeral_5m_input_tokens", 0),
            "cache_read": u.get("cache_read_input_tokens", 0),
            "output": u.get("output_tokens", 0),
            "tools": tools,
            "skills": skills,
        }
        seen[key] = row
        rows.append(row)
    return rows


if __name__ == "__main__":
    rows = requests(sys.argv[1])
    if "--json" in sys.argv:
        json.dump(rows, sys.stdout, indent=1)
        sys.exit(0)
    print("turn req effort  model                 input  c.write   c.read  output  tools / skills")
    n = 0
    for r in rows:
        n += 1
        print(
            f"{r['turn']:>4} {n:>3} {str(r['effort']):<7} {str(r['model']):<20} {r['input']:>6} {r['cache_write']:>8} "
            f"{r['cache_read']:>8} {r['output']:>7}  {','.join(r['tools']) or '-'}"
            f"{' SKILL:' + ','.join(map(str, r['skills'])) if r['skills'] else ''}"
        )
