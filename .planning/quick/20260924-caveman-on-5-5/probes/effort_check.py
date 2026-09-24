#!/usr/bin/env python3
"""Effort check: the same prompt through the runner's exact command at --effort low and
--effort xhigh, with a debug log kept in a scratch directory. Prints only counts from the log
(never its lines), the thinking tokens, and whether the API rejected output_config.effort.

usage: effort_check.py CWD SCRATCH_DIR
"""
import json
import re
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import run_arms  # noqa: E402

PROMPT = "How many prime numbers lie between 1000 and 1200? Answer with only the number."


def main() -> None:
    cwd, scratch = sys.argv[1], Path(sys.argv[2])
    out = Path(__file__).resolve().parent / "effort-check.jsonl"
    with out.open("w", encoding="utf-8") as fh:
        for effort in ("low", "xhigh"):
            run_arms.EFFORT = effort
            log = scratch / f"effort-{effort}.log"
            cmd = run_arms.claude_cmd(PROMPT, "")
            cmd[-1:-1] = ["--debug-file", str(log)]  # just before the prompt
            proc = subprocess.run(cmd, cwd=cwd, env=run_arms.child_env(),
                                  stdin=subprocess.DEVNULL, capture_output=True, text=True,
                                  timeout=1800)
            result = {}
            for line in proc.stdout.splitlines():
                try:
                    d = json.loads(line)
                except ValueError:
                    continue
                if d.get("type") == "result":
                    result = d
            u = result.get("usage") or {}
            text = log.read_text(encoding="utf-8", errors="replace") if log.exists() else ""
            rec = {
                "effort_flag": effort,
                "exit_code": proc.returncode,
                "effort_rejected_lines": len(re.findall(r"\[effort\]", text)),
                "advisor_tool_lines": len(re.findall(r"\[AdvisorTool\]", text)),
                "api_requests": len(re.findall(r"\[API REQUEST\] /v1/messages", text)),
                "output_tokens": u.get("output_tokens"),
                "thinking_tokens": (u.get("output_tokens_details") or {}).get("thinking_tokens"),
                "answer": result.get("result"),
                "total_cost_usd": result.get("total_cost_usd"),
            }
            log.unlink(missing_ok=True)  # the debug log stays out of the repository
            fh.write(json.dumps(rec) + "\n")
            print(json.dumps(rec))


if __name__ == "__main__":
    main()
