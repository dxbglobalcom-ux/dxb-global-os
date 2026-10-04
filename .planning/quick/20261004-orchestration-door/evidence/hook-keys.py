import json, sys, os, time
d = json.load(sys.stdin)
open(os.environ["HOOK_LOG"], "a").write(json.dumps({"t": time.strftime("%H:%M:%S"), "event": d.get("hook_event_name"), "keys": sorted(d.keys()), "prompt_id": d.get("prompt_id"), "tool": d.get("tool_name"), "effort": d.get("effort")}) + "\n")
