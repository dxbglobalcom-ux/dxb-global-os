"""Minimal MCP stdio client for `obscura mcp` (newline-delimited JSON-RPC)."""
import json, subprocess, threading, queue, time, os

class MCP:
    def __init__(self, stealth=False, extra=None, stderr_path=None):
        cmd = ["obscura"] + (["--stealth"] if stealth else []) + ["mcp"] + (extra or [])
        self.err = open(stderr_path or os.devnull, "ab")
        self.p = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                                  stderr=self.err, bufsize=0)
        self.q = queue.Queue()
        self.id = 0
        threading.Thread(target=self._reader, daemon=True).start()
        self.call_raw("initialize", {"protocolVersion": "2025-03-26", "capabilities": {},
                                     "clientInfo": {"name": "measure", "version": "0"}})
        self._send({"jsonrpc": "2.0", "method": "notifications/initialized"})

    def _reader(self):
        for line in self.p.stdout:
            line = line.strip()
            if not line:
                continue
            try:
                self.q.put(json.loads(line))
            except Exception:
                pass

    def _send(self, obj):
        self.p.stdin.write((json.dumps(obj) + "\n").encode())
        self.p.stdin.flush()

    def call_raw(self, method, params, timeout=90):
        self.id += 1
        mid = self.id
        self._send({"jsonrpc": "2.0", "id": mid, "method": method, "params": params})
        end = time.time() + timeout
        while time.time() < end:
            try:
                msg = self.q.get(timeout=max(0.1, end - time.time()))
            except queue.Empty:
                break
            if msg.get("id") == mid:
                return msg
        raise TimeoutError(f"{method} timed out after {timeout}s")

    def tool(self, name, args=None, timeout=90):
        r = self.call_raw("tools/call", {"name": name, "arguments": args or {}}, timeout)
        if "error" in r:
            return {"error": r["error"]}
        res = r.get("result", {})
        text = "\n".join(c.get("text", "") for c in res.get("content", []) if c.get("type") == "text")
        return {"text": text, "isError": res.get("isError", False)}

    def close(self):
        try:
            self.p.stdin.close()
            self.p.wait(timeout=5)
        except Exception:
            self.p.kill()
            self.p.wait()
        self.err.close()

if __name__ == "__main__":
    m = MCP()
    tl = m.call_raw("tools/list", {})
    for t in tl["result"]["tools"]:
        print(t["name"], json.dumps(t.get("inputSchema", {}).get("properties", {}))[:300])
    m.close()
