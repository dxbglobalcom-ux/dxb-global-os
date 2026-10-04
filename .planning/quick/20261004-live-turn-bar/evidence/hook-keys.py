# Probe logger: every hook payload's event, prompt_id, tool, agent fields and keys, with a timestamp.
import json, sys, os, time
d = json.load(sys.stdin)
open(os.environ["HOOK_LOG"], "a").write(json.dumps({"t": time.strftime("%H:%M:%S"), "event": d.get("hook_event_name"),
  "prompt_id": d.get("prompt_id"), "tool": d.get("tool_name"), "skill": (d.get("tool_input") or {}).get("skill") if isinstance(d.get("tool_input"), dict) else None,
  "agent_id": d.get("agent_id"), "agent_type": d.get("agent_type"), "prompt": (d.get("prompt") or "")[:40], "keys": sorted(d.keys())}) + "\n")
