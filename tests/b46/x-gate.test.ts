// B42 — THE X GATE. Every X read on this machine goes through the CEO's own account, and X counts
// per account: on 2026-10-18 three parallel research helpers made about 60 calls in ~15 minutes and
// drew `HTTP 429 (session quota)` twice. The gate (dxb-research/scripts/xgate.py, wired into
// bin/opencli and hidden.py) lets one reader through at a time, inside one budget, and stops on
// X's first warning. These tests drive the real shim against a stand-in opencli that answers the
// way X does, with the gate pointed at a throwaway folder — not one call reaches X.

import { execFileSync, spawn, spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const SKILL = resolve(__dirname, "../../.claude/skills/dxb-research");
const SHIM = join(SKILL, "bin", "opencli");
const XGATE = join(SKILL, "scripts", "xgate.py");

// X's own words, as opencli prints them (clis/twitter/shared.js describeTwitterApiError).
const SAY_429 =
  "HTTP 429: SearchTimeline fetch failed — rate-limited by Twitter (session quota); retry after cooldown (typically 15-30 min)";
const SAY_DEAD = "AUTH_REQUIRED: Not logged into x.com (no ct0 cookie)";
const SAY_FROZEN = "redirected to https://x.com/account/access — captcha required";
// opencli's CliError envelope on stderr, exactly as commanderAdapter.js renderError prints it (yaml.dump of
// errors.js toEnvelope, lineWidth 120) — rendered on this machine from the installed package, 2026-10-18.
const SAY_WALL = `ok: false
error:
  code: LOGIN_WALL
  message: Server returned HTML instead of JSON (status=200). Likely a login wall, rate limit, or WAF challenge.
  help: >-
    The server returned an HTML page instead of JSON — likely a login wall, rate limit, or WAF challenge. Try re-logging
    in via your browser, or wait a few minutes before retrying.
  exitCode: 77
`;
const SAY_AUTH = `ok: false
error:
  code: AUTH_REQUIRED
  message: Not logged into x.com (no ct0 cookie)
  help: Please open Chrome or Chromium and log in to https://x.com
  exitCode: 77
`;
// search.js parses the in-page fetch with r.json(): an HTML page fails there, as V8 words it.
const SAY_HTML = `ok: false
error:
  code: UNKNOWN
  message: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
  exitCode: 1
`;
const OPENCLI_PKG = join(process.env.HOME ?? "", ".npm-global/lib/node_modules/@jackwener/opencli");

let dir: string;
let bin: string;
let gate: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "xgate-"));
  bin = join(dir, "bin");
  gate = join(dir, "gate");
  execFileSync("mkdir", ["-p", bin]);
  // The stand-in: answers by FAKE_X, leaves a trace of every start, sleeps FAKE_SLEEP seconds.
  writeFileSync(
    join(bin, "opencli"),
    `#!/bin/sh
echo "start $(date +%s.%N)" >> "${dir}/trace"
[ -n "$FAKE_SLEEP" ] && sleep "$FAKE_SLEEP"
case "$FAKE_X" in
  429) echo "${SAY_429}" >&2; echo "end $(date +%s.%N)" >> "${dir}/trace"; exit 1 ;;
  dead) echo "${SAY_DEAD}" >&2; exit 77 ;;
  frozen) echo "${SAY_FROZEN}" >&2; exit 1 ;;
  file:*) cat "\${FAKE_X#file:}" >&2; exit 77 ;;
  *) echo "- text: our rate limit post was fine"; echo "end $(date +%s.%N)" >> "${dir}/trace"; exit 0 ;;
esac
`,
  );
  chmodSync(join(bin, "opencli"), 0o755);
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

function env(extra: Record<string, string> = {}): NodeJS.ProcessEnv {
  return {
    ...process.env,
    PATH: `${bin}:${process.env.PATH}`,
    DXB_XGATE_DIR: gate,
    PYTHONDONTWRITEBYTECODE: "1",
    ...extra,
  };
}

function opencli(args: string[], extra: Record<string, string> = {}): { out: string; err: string; code: number } {
  try {
    const out = execFileSync("python3", [SHIM, ...args], { encoding: "utf8", env: env(extra), stdio: "pipe" });
    return { out, err: "", code: 0 };
  } catch (e) {
    const x = e as { stdout?: string; stderr?: string; status?: number };
    return { out: String(x.stdout ?? ""), err: String(x.stderr ?? ""), code: x.status ?? 1 };
  }
}

const starts = () => (existsSync(join(dir, "trace")) ? readFileSync(join(dir, "trace"), "utf8").match(/^start/gm)?.length ?? 0 : 0);
const lines = (f: string) => (existsSync(join(gate, f)) ? readFileSync(join(gate, f), "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l)) : []);
const state = () => (existsSync(join(gate, "state.json")) ? JSON.parse(readFileSync(join(gate, "state.json"), "utf8")) : {});
const now = () => Date.now() / 1000;
const plant = (rows: object[]) => {
  execFileSync("mkdir", ["-p", gate]);
  writeFileSync(join(gate, "calls.jsonl"), rows.map((r) => JSON.stringify(r)).join("\n") + "\n");
};

describe("a read X answers normally", () => {
  it("passes through unchanged, is counted once, and a post that says 'rate limit' is not X saying it", () => {
    const r = opencli(["twitter", "search", "opus", "--limit", "5"]);
    expect(r.code, r.err).toBe(0);
    expect(r.out).toContain("our rate limit post was fine");
    expect(lines("calls.jsonl")).toHaveLength(1);
    expect(lines("calls.jsonl")[0].caller).toBe("research");
    expect(state()).toEqual({});
  });

  it("does not gate opencli's bare help, nor another site", () => {
    opencli(["twitter", "--help"]);
    opencli(["reddit", "search", "opus"]);
    expect(lines("calls.jsonl")).toHaveLength(0);
  });
});

describe("X's first 429 pauses every reader; the second in 24 h closes X for the day", () => {
  it("pauses 30 minutes and refuses the next call without starting it", () => {
    const first = opencli(["twitter", "search", "opus"], { FAKE_X: "429" });
    expect(first.code).toBe(1);
    const pause = state().pause_until - now();
    expect(pause).toBeGreaterThan(29 * 60);
    expect(pause).toBeLessThanOrEqual(30 * 60);
    const before = starts();
    const next = opencli(["twitter", "search", "opus"]);
    expect(next.code).toBe(76);
    expect(next.err).toContain("429");
    expect(starts()).toBe(before);
  });

  it("closes X until the next day on a second 429", () => {
    execFileSync("mkdir", ["-p", gate]);
    writeFileSync(join(gate, "events.jsonl"), JSON.stringify({ ts: now() - 3600, kind: "429" }) + "\n");
    opencli(["twitter", "search", "opus"], { FAKE_X: "429" });
    const st = state();
    expect(st.pause_until).toBeUndefined();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    expect(Math.round(st.closed_until)).toBe(Math.round(midnight.getTime() / 1000));
  });
});

describe("a warning page freezes X until a person clears it; a login wall marks the session dead", () => {
  it("freezes, never self-clears, and opens only on `clear frozen`", () => {
    opencli(["twitter", "thread", "https://x.com/a/status/1"], { FAKE_X: "frozen" });
    expect(state().frozen.detail).toContain("account/access");
    const refused = opencli(["twitter", "search", "opus"]);
    expect(refused.code).toBe(76);
    expect(refused.err).toContain("DONDURULDU");
    execFileSync("python3", [XGATE, "clear", "frozen"], { env: env() });
    expect(opencli(["twitter", "search", "opus"]).code).toBe(0);
  });

  it("marks the session dead on AUTH_REQUIRED and refuses until `clear session_dead`", () => {
    opencli(["twitter", "search", "opus"], { FAKE_X: "dead" });
    expect(state().session_dead).toBeTruthy();
    expect(opencli(["twitter", "search", "opus"]).code).toBe(76);
    execFileSync("python3", [XGATE, "clear", "session_dead"], { env: env() });
    expect(opencli(["twitter", "search", "opus"]).code).toBe(0);
  });
});

describe("one budget for every caller", () => {
  it("refuses the 21st call in 15 minutes", () => {
    plant(Array.from({ length: 20 }, (_, i) => ({ ts: now() - 800 + i * 10, caller: "research" })));
    const r = opencli(["twitter", "search", "opus"]);
    expect(r.code).toBe(76);
    expect(starts()).toBe(0);
  });

  it("refuses the 151st call of the day", () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const since = start.getTime() / 1000;
    const span = Math.max(1, now() - 16 * 60 - since);
    plant(Array.from({ length: 150 }, (_, i) => ({ ts: since + (span * i) / 150, caller: "research" })));
    expect(opencli(["twitter", "search", "opus"]).code).toBe(76);
  });

  it("holds the room to 50 a day while research may still read", () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const since = start.getTime() / 1000;
    const span = Math.max(1, now() - 16 * 60 - since);
    plant(Array.from({ length: 50 }, (_, i) => ({ ts: since + (span * i) / 50, caller: "room" })));
    expect(opencli(["twitter", "search", "opus"], { DXB_X_CALLER: "room" }).code).toBe(76);
    expect(opencli(["twitter", "search", "opus"]).code).toBe(0);
  });
});

describe("one reader at a time, at least 3 seconds apart", () => {
  it("waits out the spacing after the last call", () => {
    plant([{ ts: now() - 1, caller: "research" }]);
    const t0 = Date.now();
    expect(opencli(["twitter", "search", "opus"]).code).toBe(0);
    expect(Date.now() - t0).toBeGreaterThanOrEqual(1800);
  });

  it("never lets two readers overlap", async () => {
    const run = () =>
      new Promise<number>((done) => {
        const p = spawn("python3", [SHIM, "twitter", "search", "opus"], { env: env({ FAKE_SLEEP: "1.5" }), stdio: "ignore" });
        p.on("exit", (c) => done(c ?? 1));
      });
    const codes = await Promise.all([run(), run()]);
    expect(codes).toEqual([0, 0]);
    const t = readFileSync(join(dir, "trace"), "utf8")
      .trim()
      .split("\n")
      .map((l) => l.split(" ") as [string, string]);
    expect(t.map(([k]) => k)).toEqual(["start", "end", "start", "end"]);
    expect(Number(t[2][1]) - Number(t[1][1])).toBeGreaterThanOrEqual(2.9);
  }, 20000);
});

describe("hidden.py reads an X page's final address, never its body", () => {
  const verdict = (href: string, password = false) =>
    execFileSync(
      "python3",
      ["-c", `import sys; sys.path.insert(0, ${JSON.stringify(join(SKILL, "scripts"))}); import hidden; print(hidden.x_verdict(${JSON.stringify(href)}, ${password ? "True" : "False"}))`],
      { encoding: "utf8", env: env() },
    ).trim();

  it("names the access page frozen, the login wall dead, a post ok, and a t.co that left X ok", () => {
    expect(verdict("https://x.com/account/access")).toBe("frozen");
    expect(verdict("https://x.com/i/flow/login?redirect_after_login=%2Fhome")).toBe("session_dead");
    expect(verdict("https://x.com/karpathy/status/1")).toBe("ok");
    expect(verdict("https://example.com/login")).toBe("ok");
    expect(verdict("https://x.com/home", true)).toBe("session_dead");
  });
});

describe("the classifier names a login wall before a 429 (finding 1)", () => {
  const classify = (text: string) => execFileSync("python3", [XGATE, "classify"], { input: text, encoding: "utf8", env: env() }).trim();

  it("reads opencli's LOGIN_WALL and AUTH_REQUIRED envelopes and an HTML page's JSON error as a dead session", () => {
    expect(classify(SAY_WALL)).toBe("session_dead"); // its help says "rate limit": it was a 429 before
    expect(classify(SAY_AUTH)).toBe("session_dead");
    expect(classify(SAY_HTML)).toBe("session_dead"); // it was "ok" before
    expect(classify(`Unexpected token '<', "<html" is not valid JSON`)).toBe("session_dead");
    expect(classify(SAY_429)).toBe("429");
    expect(classify(SAY_FROZEN + "\n" + SAY_WALL)).toBe("frozen");
    expect(classify(`Unexpected token 'u', "undefined" is not valid JSON`)).toBe("ok");
  });

  it("marks the session dead — not paused — when opencli says LOGIN_WALL", () => {
    writeFileSync(join(dir, "say-wall"), SAY_WALL);
    const r = opencli(["twitter", "search", "opus"], { FAKE_X: `file:${join(dir, "say-wall")}` });
    expect(r.code).toBe(77);
    expect(state().session_dead).toBeTruthy();
    expect(state().pause_until).toBeUndefined();
  });

  it("still never reads a successful answer's posts", () => {
    expect(opencli(["twitter", "search", "opus"]).code).toBe(0);
    expect(state()).toEqual({});
  });
});

describe("closing X for the day ends at the next LOCAL midnight, DST included (finding 4)", () => {
  it("a second 429 at 2026-10-25 23:30 in Berlin closes X until 2026-10-26 00:00, not 23:00 the same day", () => {
    const py = `import sys, time, datetime as dt
sys.path.insert(0, ${JSON.stringify(join(SKILL, "scripts"))})
import xgate
now = dt.datetime(2026, 10, 25, 23, 30).timestamp()
xgate.DIR.mkdir(parents=True, exist_ok=True)
xgate._append("events.jsonl", {"ts": now - 3600, "kind": "429"})
time.time = lambda: now
xgate.Call("research", "t").report("429")
print(dt.datetime.fromtimestamp(xgate._state()["closed_until"]).strftime("%Y-%m-%d %H:%M"))`;
    const out = execFileSync("python3", ["-c", py], { encoding: "utf8", env: env({ TZ: "Europe/Berlin" }), stdio: "pipe" });
    expect(out.trim()).toBe("2026-10-26 00:00");
  });
});

describe("apps.yaml sends X nowhere: only the shim's own window reaches it (finding 5)", () => {
  it("writes the X sites at port 9 with a name that says where to go, accepts exactly that, and the real opencli fails closed", () => {
    const home = join(dir, "home");
    execFileSync("mkdir", ["-p", home]);
    const py = `import sys, json
sys.path.insert(0, ${JSON.stringify(join(SKILL, "scripts"))})
from pathlib import Path
import hidden
root = Path(${JSON.stringify(OPENCLI_PKG)})
hidden.write_apps(root)
first = hidden.apps_valid(root)
reg = hidden.registered_sites()
lines = hidden.APPS_YAML.read_text().splitlines()
tw = [l for l in lines if l.startswith('  "twitter"')][0]
hidden.APPS_YAML.write_text("\\n".join(l.replace("port: 9,", "port: ${"9333"},") if l.startswith('  "twitter"') else l for l in lines) + "\\n")
print(json.dumps({"valid": first, "twitter": "twitter" in reg, "reddit": "reddit" in reg, "line": tw,
                  "at9333_valid": hidden.apps_valid(root), "at9333_registered": "twitter" in hidden.registered_sites()}))`;
    const e = { ...env(), HOME: home };
    const r = JSON.parse(execFileSync("python3", ["-c", py], { encoding: "utf8", env: e }));
    expect(r.line).toContain("port: 9,");
    expect(r.line).toContain("X only through the X gate — run opencli from the dxb-research door (bin/opencli)");
    expect(r).toMatchObject({ valid: true, twitter: true, reddit: true, at9333_valid: false, at9333_registered: false });
    // opencli's OWN resolution, as execution.js runs it for a call that bypassed the shim: port 9 is probed
    // and, on Linux, nothing is launched — the call fails with the displayName.
    execFileSync("python3", ["-c", py.replace(/hidden\.APPS_YAML\.write_text[^\n]*\n/, "")], { encoding: "utf8", env: e });
    const js = `const m = await import(${JSON.stringify(join(OPENCLI_PKG, "dist/src/launcher.js"))});
const a = await import(${JSON.stringify(join(OPENCLI_PKG, "dist/src/electron-apps.js"))});
const app = a.getElectronApp("twitter");
let msg = "resolved";
try { await m.resolveElectronEndpoint("twitter"); } catch (err) { msg = String(err && err.message); }
console.log(JSON.stringify({ port: app && app.port, msg }));`;
    const o = JSON.parse(execFileSync("node", ["--input-type=module", "-e", js], { encoding: "utf8", env: e }).trim().split("\n").pop()!);
    expect(o.port).toBe(9);
    expect(o.msg).toContain("X only through the X gate");
  }, 60000);
});

// A STAND-IN DEVTOOLS. The window path needs a Chrome: this one answers on a free port the way Chrome 153 does
// for what the shim and hidden.py ask (json/version, json/list, Target.*, Page.*, Network.enable, Runtime.evaluate),
// and plays Network.responseReceived from the test's script — only to a client that enabled Network.
const FAKE_DEVTOOLS = String.raw`import base64, hashlib, json, os, socket, struct, sys, threading
cfg = json.load(open(sys.argv[1]))
targets, lock, count = {}, threading.Lock(), [0]
srv = socket.socket(); srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
srv.bind(("127.0.0.1", 0)); srv.listen(64)
port = srv.getsockname()[1]
open(sys.argv[2] + ".tmp", "w").write(str(port)); os.replace(sys.argv[2] + ".tmp", sys.argv[2])

def take(conn, buf, n):
    while len(buf) < n:
        c = conn.recv(65536)
        if not c:
            raise EOFError
        buf += c
    out = bytes(buf[:n]); del buf[:n]; return out

def frames(conn, buf):
    while True:
        b0, b1 = take(conn, buf, 2)
        n = b1 & 0x7F
        if n == 126: n = struct.unpack(">H", take(conn, buf, 2))[0]
        elif n == 127: n = struct.unpack(">Q", take(conn, buf, 8))[0]
        key = take(conn, buf, 4) if b1 & 0x80 else b"\0\0\0\0"
        data = bytes(x ^ key[i % 4] for i, x in enumerate(take(conn, buf, n)))
        yield b0 & 0x0F, data

def send(conn, obj):
    d = json.dumps(obj).encode(); n = len(d)
    head = bytes([0x81]) + (bytes([n]) if n < 126 else bytes([126]) + struct.pack(">H", n) if n < 65536 else bytes([127]) + struct.pack(">Q", n))
    conn.sendall(head + d)

def emit(conn):
    for i, (url, status) in enumerate(cfg.get("responses", [])):
        send(conn, {"method": "Network.responseReceived", "params": {"requestId": str(i), "type": "Fetch", "response": {"url": url, "status": status}}})

def evaluate(e):
    href = cfg.get("href", "about:blank")
    if e == "location.href": return href
    if "location.href" in e: return json.dumps({"url": href, "password": False})
    if "innerText" in e: return cfg.get("text", "the page body")
    return True

def ws(conn, buf, path):
    page, enabled = path.startswith("/devtools/page/"), False
    for op, data in frames(conn, buf):
        if op == 8: return
        if op != 1: continue
        m = json.loads(data); meth, p = m.get("method"), m.get("params") or {}
        res = {}
        if meth == "Target.createTarget":
            with lock:
                count[0] += 1; tid = "T%d" % count[0]; targets[tid] = 1
            res = {"targetId": tid}
        elif meth == "Target.getTargets":
            res = {"targetInfos": [{"targetId": t, "type": "page"} for t in list(targets)]}
        elif meth == "Target.closeTarget":
            targets.pop(p.get("targetId"), None); res = {"success": True}
        elif meth == "Runtime.evaluate":
            res = {"result": {"type": "string", "value": evaluate(p.get("expression", ""))}}
        elif meth == "Page.navigate":
            res = {"frameId": "F1"}
        send(conn, {"id": m["id"], "result": res})
        if meth == "Network.enable":
            enabled = True
            if cfg.get("emit") == "enable": emit(conn)
        if meth == "Page.navigate":
            if enabled: emit(conn)
            send(conn, {"method": "Page.loadEventFired", "params": {}})

def serve(conn):
    try:
        buf = bytearray()
        while b"\r\n\r\n" not in buf:
            c = conn.recv(65536)
            if not c: return
            buf += c
        i = buf.index(b"\r\n\r\n"); head = buf[:i].decode(); del buf[:i + 4]
        path = head.split(" ")[1]
        if "upgrade: websocket" in head.lower():
            if path.startswith("/devtools/page/") and cfg.get("refuse_page"):
                conn.sendall(b"HTTP/1.1 403 Forbidden\r\nContent-Length: 0\r\n\r\n"); return
            key = [l.split(":", 1)[1].strip() for l in head.split("\r\n") if l.lower().startswith("sec-websocket-key")][0]
            acc = base64.b64encode(hashlib.sha1((key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").encode()).digest()).decode()
            conn.sendall(("HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: %s\r\n\r\n" % acc).encode())
            ws(conn, buf, path); return
        if path == "/json/version":
            body = {"Browser": "Stand-in/153", "webSocketDebuggerUrl": "ws://127.0.0.1:%d/devtools/browser/B" % port}
        elif path == "/json/list":
            body = [{"id": t, "type": "page"} for t in list(targets)]
        elif path.startswith("/json/close/"):
            targets.pop(path.rsplit("/", 1)[1], None); body = "Target is closing"
        else:
            body = {}
        d = json.dumps(body).encode()
        conn.sendall(b"HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: %d\r\nConnection: close\r\n\r\n" % len(d) + d)
    except (EOFError, OSError):
        pass
    finally:
        conn.close()

while True:
    c, _ = srv.accept()
    threading.Thread(target=serve, args=(c,), daemon=True).start()
`;

describe("the window path watches X's own answers, not only opencli's words (findings 2 and 3)", () => {
  let devtools: ReturnType<typeof spawn> | undefined;
  let pkg: string;
  let home: string;

  // A package that is opencli by its package.json (hidden.package_root), whose one browser-backed command is
  // `twitter search`, and whose bin answers like the stand-in above but dies on TERM (the runaway guard).
  function setup(cfg: object): Promise<void> {
    pkg = join(dir, "pkg");
    home = join(dir, "home");
    execFileSync("mkdir", ["-p", join(pkg, "bin"), join(pkg, "dist/src"), join(pkg, "node_modules"), home]);
    writeFileSync(join(pkg, "package.json"), JSON.stringify({ name: "@jackwener/opencli" }));
    writeFileSync(join(pkg, "cli-manifest.json"), JSON.stringify([{ site: "twitter", name: "search", browser: true, access: "read" }]));
    writeFileSync(join(pkg, "dist/src/main.js"), "");
    execFileSync("ln", ["-s", join(OPENCLI_PKG, "node_modules/js-yaml"), join(pkg, "node_modules/js-yaml")]);
    writeFileSync(
      join(pkg, "bin", "opencli"),
      `#!/bin/sh
echo "start $(date +%s.%N)" >> "${dir}/trace"
sleep "\${FAKE_SLEEP:-0.5}" >/dev/null 2>&1 &
p=$!
trap 'kill $p 2>/dev/null; exit 143' TERM
wait $p
echo "- text: a post"; echo "end $(date +%s.%N)" >> "${dir}/trace"; exit 0
`,
    );
    chmodSync(join(pkg, "bin", "opencli"), 0o755);
    writeFileSync(join(dir, "devtools.py"), FAKE_DEVTOOLS);
    writeFileSync(join(dir, "devtools.json"), JSON.stringify(cfg));
    devtools = spawn("python3", [join(dir, "devtools.py"), join(dir, "devtools.json"), join(dir, "devtools.port")], { stdio: "ignore" });
    return new Promise((done, fail) => {
      const t0 = Date.now();
      const tick = () => {
        if (existsSync(join(dir, "devtools.port"))) {
          execFileSync("python3", ["-c", `import sys; sys.path.insert(0, ${JSON.stringify(join(SKILL, "scripts"))}); from pathlib import Path; import hidden; hidden.write_apps(Path(${JSON.stringify(pkg)}))`], { env: wenv() });
          done();
        } else if (Date.now() - t0 > 10000) fail(new Error("stand-in DevTools did not start"));
        else setTimeout(tick, 50);
      };
      tick();
    });
  }
  afterEach(() => devtools?.kill());

  function wenv(extra: Record<string, string> = {}): NodeJS.ProcessEnv {
    return {
      ...env(extra),
      PATH: `${join(pkg, "bin")}:${process.env.PATH}`,
      HOME: home,
      DXB_HIDDEN_PORT: existsSync(join(dir, "devtools.port")) ? readFileSync(join(dir, "devtools.port"), "utf8") : "1",
      DXB_BUSCTL: "false",
    };
  }
  function run(file: string, args: string[], extra: Record<string, string> = {}) {
    const r = spawnSync("python3", [file, ...args], { encoding: "utf8", env: wenv(extra), timeout: 60000 });
    return { out: r.stdout, err: r.stderr, code: r.status ?? -1 };
  }

  it("records a 429 on a later page even when opencli exits 0, with the requests it made", async () => {
    await setup({ emit: "enable", href: "https://x.com/home", responses: [["https://x.com/home", 200], ["https://abs.twimg.com/a.js", 200], ["https://x.com/i/api/graphql/q/SearchTimeline", 200], ["https://x.com/i/api/graphql/q/SearchTimeline", 429]] });
    const r = run(SHIM, ["twitter", "search", "opus"]);
    expect(r.code, r.err).toBe(0);
    expect(r.out).toContain("a post");
    expect(state().pause_until - now()).toBeGreaterThan(29 * 60);
    expect(lines("calls.jsonl")[0].requests).toBe(3);
  }, 60000);

  it("freezes X when the window ends on the access page", async () => {
    await setup({ emit: "enable", href: "https://x.com/account/access", responses: [] });
    run(SHIM, ["twitter", "search", "opus"]);
    expect(state().frozen.detail).toContain("account/access");
  }, 60000);

  it("stops a command that runs away past RUNAWAY_MAX X requests, with exit 75 and one line", async () => {
    const max = Number(execFileSync("python3", ["-c", `import sys; sys.path.insert(0, ${JSON.stringify(join(SKILL, "scripts"))}); import xgate; print(xgate.RUNAWAY_MAX)`], { encoding: "utf8", env: env() }).trim());
    expect(max).toBeGreaterThan(0);
    await setup({ emit: "enable", responses: Array.from({ length: max + 2 }, (_, i) => [`https://x.com/i/api/graphql/q/SearchTimeline?p=${i}`, 200]) });
    const t0 = Date.now();
    const r = run(SHIM, ["twitter", "search", "opus"], { FAKE_SLEEP: "20" });
    expect(r.code, r.err).toBe(75);
    expect(Date.now() - t0).toBeLessThan(15000);
    expect(r.err).toMatch(new RegExp(`opencli \\(dxb\\): .*X'e ${max}'dan fazla istek`));
    expect(readFileSync(join(dir, "trace"), "utf8")).not.toMatch(/^end/m);
    expect(lines("calls.jsonl")[0].requests).toBe(max + 2);
  }, 60000);

  it("refuses the call when it cannot watch the window — opencli never starts", async () => {
    await setup({ emit: "enable", refuse_page: true, responses: [] });
    const r = run(SHIM, ["twitter", "search", "opus"]);
    expect(r.code).toBe(76);
    expect(r.err.trim().split("\n")).toHaveLength(1);
    expect(starts()).toBe(0);
  }, 60000);

  it("a call refused inside the gate costs nothing: its row leaves the ledger", async () => {
    await setup({ emit: "enable", refuse_page: true, responses: [] });
    plant([{ ts: now() - 3600, caller: "research", what: "earlier" }]);
    const r = run(SHIM, ["twitter", "search", "opus"]);
    expect(r.code).toBe(76);
    expect(lines("calls.jsonl").map((c) => c.what)).toEqual(["earlier"]);
  }, 60000);

  it("hidden.py read sees a 429 on an X document, which the address alone never showed", async () => {
    await setup({ emit: "navigate", href: "https://x.com/a/status/1", responses: [["https://x.com/a/status/1", 429]] });
    const r = run(join(SKILL, "scripts", "hidden.py"), ["read", "https://x.com/a/status/1", "--text", "--wait", "0"]);
    expect(r.code).not.toBe(0);
    expect(r.out).toBe("");
    expect(state().pause_until - now()).toBeGreaterThan(29 * 60);
    expect(lines("calls.jsonl")[0].requests).toBe(1);
  }, 60000);

  it("hidden.py read counts a page that redirected into X after the fact", async () => {
    await setup({ emit: "navigate", href: "https://x.com/a/status/1", responses: [["https://example.test/r", 301], ["https://x.com/a/status/1", 200]] });
    const r = run(join(SKILL, "scripts", "hidden.py"), ["read", "https://example.test/r", "--text", "--wait", "0"]);
    expect(r.code, r.err).toBe(0);
    expect(r.out).toContain("the page body");
    expect(lines("calls.jsonl")).toHaveLength(1);
    expect(lines("calls.jsonl")[0].requests).toBe(1);
  }, 60000);

  it("hidden.py read discards a redirect into X while X is paused, and says why", async () => {
    await setup({ emit: "navigate", href: "https://x.com/a/status/1", responses: [["https://x.com/a/status/1", 200]] });
    execFileSync("mkdir", ["-p", gate]);
    writeFileSync(join(gate, "state.json"), JSON.stringify({ pause_until: now() + 600 }));
    const r = run(join(SKILL, "scripts", "hidden.py"), ["read", "https://example.test/r", "--text", "--wait", "0"]);
    expect(r.code).toBe(76);
    expect(r.out).toBe("");
    expect(r.err).toContain("429");
    expect(lines("calls.jsonl")).toHaveLength(0);
  }, 60000);
});
