#!/usr/bin/env python3
"""THE HIDDEN RESEARCH CHROME — one owner of how a read gets a tab, uses it, and gives it back.

WHY IT EXISTS. 2026-09-24: every research run threw two Chrome windows and an empty `about:blank`
window onto the CEO's screen. opencli's Browser Bridge drives HIS Chrome (Profile 5) and creates
its own automation window for every call; `--window background` only stops it taking focus, and a
released tab is parked as `about:blank`. Every browser-driven read of this skill now runs in
`dxb-research-chrome.service` instead: Google Chrome on the invisible display Xvfb :99, on a COPY of
his Profile 5 (scripts/profile-sync.sh), with DevTools on 127.0.0.1:9333 and nowhere else.

Why his profile and not an empty one — measured 2026-09-24: an empty-profile Chrome on this house's
addresses (IPv6 and IPv4) got HTTP 429 and Google's /sorry/ reCAPTCHA, even on Xvfb, while his own
signed-in Chrome was not challenged, and solving a captcha automatically is forbidden. Why headful on
Xvfb and never --headless: the same day Perplexity answered 200 to the Xvfb Chrome and 403 headless.
Google itself is the exception since the cookies-only copy (16:44): its web session does not survive in
the copy without Chrome-level sign-in, which stays out on purpose, so Google pages are read signed out.

  hidden.py read <url> [--wait S] [--expand LABEL] [--after S] [--timeout S] [--chunk N] [--text]
      the page as the JSON envelope the bridge's extract command printed before (url, title,
      selector, total_chars, chunk_size, start, end, next_start_char, content). The shape is
      load-bearing: sweep.sh's page collector takes `"url"` as the base for relative links, and
      instagram's post addresses exist ONLY as markdown `](/p/.../)` links. The markdown comes
      from opencli's own converter, so the content reads exactly as it did.
  hidden.py google "<query>"
      Google's own results page (num=30, hl=en). On /sorry/ or the consent/sign-in wall it prints a
      named FAIL and reads Startpage, then Brave, through the same Chrome. A captcha is never solved.
  hidden.py signed-in [--json]
      asks each site the tool reads through (google, x, facebook, instagram, reddit, perplexity)
      whether the hidden Chrome is REALLY signed in — a cookie that exists is not a session.
  hidden.py status | reap | cookie-names | apps

Every read takes one of SLOTS lock files, opens its OWN window and closes it in a `finally`, so the
tab goes on success, error and timeout (SIGTERM) alike; a reader killed with SIGKILL is swept by the
next one (`reap`). When 127.0.0.1:9333 does not answer it fails at once with one line and starts
nothing. bin/opencli imports this module: one owner for the port, the slots and the tab lifecycle.
"""
from __future__ import annotations

import argparse
import base64
import contextlib
import fcntl
import hashlib
import json
import os
import re
import shutil
import signal
import socket
import struct
import subprocess
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

# DXB_HIDDEN_PORT points this module (and bin/opencli) at a SECOND hidden Chrome — only for a test
# that must not disturb the real one, e.g. the session guard run against an empty profile.
HOST, PORT = "127.0.0.1", int(os.environ.get("DXB_HIDDEN_PORT") or 9333)
BASE = f"http://{HOST}:{PORT}"
UNIT = "dxb-research-chrome"
ROOT = Path.home() / ".local" / "share" / "dxb-research-chrome"
# Slots and the tab registry live beside the profile, never inside Default/ (profile-sync.sh
# mirrors that folder with --delete).
RUN = ROOT / "run"
# HOW MANY WINDOWS AT ONCE. A fleet opens four 39-channel grounds in parallel and about twenty of
# each ground's channels are browser-backed, before the hunters and the reading chain add theirs:
# unbounded, that is ~80 windows and an OOM kill of the whole Chrome mid-sweep. Eight run, the rest
# queue for a free slot.
SLOTS = 8
# The displayName in ~/.opencli/apps.yaml. opencli prints it when 9333 is down ("Could not find
# <displayName> on this machine"), so it names the address; it is also the anchor window's title.
DISPLAY_NAME = "DxB hidden research Chrome (127.0.0.1:9333)"
# A process name nothing on this machine carries: opencli's launcher may never find, restart or
# launch anything for these sites — above all not the CEO's own Chrome.
NO_SUCH_PROCESS = "dxb-no-such-process"
APPS_YAML = Path.home() / ".opencli" / "apps.yaml"
APPS_HEADER = "# dxb-research: written by .claude/skills/dxb-research/scripts/hidden.py apps"
# bin/opencli carries this string, so a shim never mistakes another copy of itself for opencli.
SHIM_MARKER = b"DXB-HIDDEN-CHROME-SHIM"
DOWN_MSG = (f"gizli arastirma Chrome'u kapali: {HOST}:{PORT} cevap vermiyor. Hicbir sey kendiliginden "
            "baslatilmaz; baslatmak icin: systemctl --user start dxb-research-chrome")

# urllib would send 127.0.0.1 through an http_proxy from the environment; DevTools is never proxied.
_OPENER = urllib.request.build_opener(urllib.request.ProxyHandler({}))


class Down(RuntimeError):
    """127.0.0.1:9333 does not answer."""


class SlotTimeout(RuntimeError):
    """Every slot stayed busy for the whole wait."""


class CDPError(RuntimeError):
    pass


def _http(path: str, timeout: float = 5.0):
    with _OPENER.open(BASE + path, timeout=timeout) as r:
        body = r.read().decode("utf-8", errors="replace")
    return json.loads(body) if body.strip().startswith(("{", "[")) else body


def version(timeout: float = 2.0) -> dict | None:
    """Chrome's /json/version, or None when nothing answers on the port."""
    try:
        v = _http("/json/version", timeout)
        return v if isinstance(v, dict) and v.get("webSocketDebuggerUrl") else None
    except Exception:
        return None


# ---------------------------------------------------------------- DevTools over a WebSocket
class CDP:
    """A minimal DevTools WebSocket client, standard library only.

    No Origin header is sent, so Chrome's --remote-allow-origins check never applies — and it must
    never be widened: with `*` any web page open in the CEO's own browser could drive this signed-in
    Chrome through localhost."""

    def __init__(self, ws_url: str, timeout: float = 10.0):
        u = urllib.parse.urlsplit(ws_url)
        self.sock = socket.create_connection((u.hostname, u.port or 80), timeout=timeout)
        key = base64.b64encode(os.urandom(16)).decode()
        self.sock.sendall((f"GET {u.path} HTTP/1.1\r\nHost: {u.hostname}:{u.port}\r\n"
                           "Upgrade: websocket\r\nConnection: Upgrade\r\n"
                           f"Sec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        buf = b""
        while b"\r\n\r\n" not in buf:
            chunk = self.sock.recv(4096)
            if not chunk:
                raise CDPError("DevTools closed the connection during the handshake")
            buf += chunk
        head, rest = buf.split(b"\r\n\r\n", 1)
        status = head.split(b"\r\n", 1)[0].decode(errors="replace")
        if " 101 " not in status + " ":
            raise CDPError("DevTools refused the WebSocket: " + status)
        self._buf = bytearray(rest)
        self._parts: list[bytes] = []
        self._id = 0
        self.events: list[dict] = []

    def close(self) -> None:
        with contextlib.suppress(OSError):
            self._send_frame(b"", 0x8)
        with contextlib.suppress(OSError):
            self.sock.close()

    def _send_frame(self, data: bytes, opcode: int = 0x1) -> None:
        n = len(data)
        head = bytearray([0x80 | opcode])
        if n < 126:
            head.append(0x80 | n)
        elif n < 65536:
            head += bytes([0x80 | 126]) + struct.pack(">H", n)
        else:
            head += bytes([0x80 | 127]) + struct.pack(">Q", n)
        mask = os.urandom(4)
        # one integer XOR instead of a byte loop: the extract script alone is kilobytes
        body = ((int.from_bytes(data, "big") ^ int.from_bytes((mask * (n // 4 + 1))[:n], "big"))
                .to_bytes(n, "big") if n else b"")
        self.sock.sendall(bytes(head) + mask + body)

    def _frame_from_buf(self):
        """One complete frame out of the buffer, or None. Nothing is taken from a frame that has
        not fully arrived, so a timeout can never leave the stream half-read."""
        b = self._buf
        if len(b) < 2:
            return None
        n, off = b[1] & 0x7F, 2
        if n == 126:
            if len(b) < 4:
                return None
            n, off = struct.unpack(">H", bytes(b[2:4]))[0], 4
        elif n == 127:
            if len(b) < 10:
                return None
            n, off = struct.unpack(">Q", bytes(b[2:10]))[0], 10
        masked = b[1] & 0x80
        if masked:
            off += 4
        if len(b) < off + n:
            return None
        data = bytes(b[off:off + n])
        if masked:
            key = bytes(b[off - 4:off])
            data = bytes(x ^ key[i % 4] for i, x in enumerate(data))
        fin, op = b[0] & 0x80, b[0] & 0x0F
        del b[:off + n]
        return fin, op, data

    def _message(self) -> dict:
        while True:
            f = self._frame_from_buf()
            if f is None:
                chunk = self.sock.recv(262144)
                if not chunk:
                    raise CDPError("DevTools closed the connection")
                self._buf += chunk
                continue
            fin, op, data = f
            if op == 0x8:
                raise CDPError("DevTools closed the connection")
            if op == 0x9:
                self._send_frame(data, 0xA)
                continue
            if op == 0xA:
                continue
            self._parts.append(data)
            if fin:
                raw, self._parts = b"".join(self._parts), []
                return json.loads(raw.decode("utf-8", errors="replace"))

    def send(self, method: str, params: dict | None = None, timeout: float = 30.0) -> dict:
        self._id += 1
        mid = self._id
        self._send_frame(json.dumps({"id": mid, "method": method, "params": params or {}}).encode())
        deadline = time.monotonic() + timeout
        while True:
            self.sock.settimeout(max(0.05, deadline - time.monotonic()))
            try:
                m = self._message()
            except (socket.timeout, TimeoutError):
                raise CDPError(f"{method}: no answer in {timeout:.0f}s") from None
            if m.get("id") == mid:
                if "error" in m:
                    raise CDPError(f"{method}: {(m['error'] or {}).get('message')}")
                return m.get("result") or {}
            if "method" in m:
                self.events.append(m)

    def wait_event(self, method: str, timeout: float) -> dict | None:
        deadline = time.monotonic() + timeout
        while True:
            for i, e in enumerate(self.events):
                if e.get("method") == method:
                    return self.events.pop(i)
            left = deadline - time.monotonic()
            if left <= 0:
                return None
            self.sock.settimeout(left)
            try:
                m = self._message()
            except (socket.timeout, TimeoutError):
                return None
            if "method" in m:
                self.events.append(m)

    def evaluate(self, expression: str, timeout: float = 30.0):
        r = self.send("Runtime.evaluate", {"expression": expression, "returnByValue": True,
                                           "awaitPromise": True}, timeout)
        if r.get("exceptionDetails"):
            d = r["exceptionDetails"]
            raise CDPError("page script failed: "
                           + str((d.get("exception") or {}).get("description") or d.get("text"))[:200])
        return (r.get("result") or {}).get("value")


def browser() -> CDP:
    v = version()
    if not v:
        raise Down(DOWN_MSG)
    return CDP(v["webSocketDebuggerUrl"])


# ---------------------------------------------------------------- opencli, found — never guessed
def _is_shim(path: str) -> bool:
    try:
        with open(path, "rb") as f:
            return SHIM_MARKER in f.read(4096)
    except OSError:
        return False


def opencli_on_path() -> list[str]:
    out, seen = [], set()
    for d in os.environ.get("PATH", "").split(os.pathsep):
        p = os.path.join(d or ".", "opencli")
        if os.path.isfile(p) and os.access(p, os.X_OK):
            rp = os.path.realpath(p)
            if rp not in seen:
                seen.add(rp)
                out.append(p)
    return out


def next_opencli() -> str | None:
    """The first `opencli` on PATH that is not one of these shims (a test bench's stand-in counts)."""
    return next((p for p in opencli_on_path() if not _is_shim(p)), None)


def package_root(path: str) -> Path | None:
    """The @jackwener/opencli package an executable belongs to, or None (a stand-in, a wrapper)."""
    for parent in list(Path(os.path.realpath(path)).parents)[:4]:
        pj = parent / "package.json"
        if pj.is_file():
            try:
                ok = json.loads(pj.read_text(encoding="utf-8")).get("name") == "@jackwener/opencli"
            except Exception:
                ok = False
            return parent if ok else None
    return None


def genuine_opencli() -> tuple[str, Path] | None:
    for p in opencli_on_path():
        root = None if _is_shim(p) else package_root(p)
        if root:
            return p, root
    return None


def commands(root: Path) -> dict[str, dict[str, tuple[bool, str]]]:
    """site -> {command or alias: (browser-backed, access)}, from opencli's own manifest."""
    idx: dict[str, dict[str, tuple[bool, str]]] = {}
    for c in json.loads((root / "cli-manifest.json").read_text(encoding="utf-8")):
        entry = (bool(c.get("browser")), str(c.get("access") or "read"))
        names = idx.setdefault(str(c["site"]), {})
        for name in [c["name"], *(c.get("aliases") or [])]:
            names[str(name)] = entry
    return idx


# ---------------------------------------------------------------- ~/.opencli/apps.yaml
def registered_sites() -> set[str]:
    """Sites apps.yaml sends to 9333, read line by line from the file this module writes."""
    try:
        text = APPS_YAML.read_text(encoding="utf-8")
    except OSError:
        return set()
    out = set()
    for line in text.splitlines():
        s = line.strip()
        if not line.startswith("  ") or s.startswith("#") or ":" not in s or f"port: {PORT}" not in s:
            continue
        out.add(s.split(":", 1)[0].strip().strip('"'))
    return out


def _yaml_ports(root: Path) -> dict | None:
    """apps.yaml as opencli's own YAML parser reads it: {site: port}. None if it does not parse.
    opencli IGNORES a malformed apps.yaml in silence — and then every one of these sites would go
    back to the Browser Bridge, onto his screen. So the file is judged by the parser that matters."""
    node = shutil.which("node")
    if not node:
        return None
    js = ("const {createRequire}=require('module');const y=createRequire(process.argv[1])('js-yaml');"
          "const d=y.load(require('fs').readFileSync(process.argv[2],'utf8'))||{};const a=d.apps||{};"
          "console.log(JSON.stringify(Object.fromEntries(Object.entries(a).map(([k,v])=>[k,v&&v.port]))))")
    try:
        p = subprocess.run([node, "-e", js, str(root / "dist" / "src" / "main.js"), str(APPS_YAML)],
                           capture_output=True, text=True, timeout=20)
        return json.loads(p.stdout) if p.returncode == 0 else None
    except Exception:
        return None


def apps_valid(root: Path) -> bool:
    """True when opencli's own parser agrees with registered_sites(). The verdict is cached by the
    file's hash, so the node parse runs once per change of the file, not once per call."""
    try:
        digest = hashlib.sha256(APPS_YAML.read_bytes()).hexdigest()
    except OSError:
        return False
    stamp = RUN / "apps.ok"
    with contextlib.suppress(OSError):
        if stamp.read_text().strip() == digest:
            return True
    ports = _yaml_ports(root)
    if ports is None or {k for k, v in ports.items() if v == PORT} != registered_sites():
        return False
    RUN.mkdir(parents=True, exist_ok=True)
    stamp.write_text(digest + "\n")
    return True


def write_apps(root: Path) -> int:
    """Register every opencli site that has a browser-backed command on 9333. Returns the count."""
    sites = sorted(s for s, cmds in commands(root).items() if any(b for b, _ in cmds.values()))
    if APPS_YAML.exists() and APPS_HEADER not in APPS_YAML.read_text(encoding="utf-8", errors="replace"):
        shutil.copy2(APPS_YAML, APPS_YAML.with_name(f"apps.yaml.bak-{int(time.time())}"))
    lines = [
        APPS_HEADER + f" from {root / 'cli-manifest.json'}",
        "# Every opencli site with a browser-backed command is an \"Electron app\" on port 9333 here, so",
        "# opencli drives the HIDDEN research Chrome (dxb-research-chrome.service, Xvfb :99) over CDP",
        "# instead of the Browser Bridge in the CEO's own Chrome — machine-wide, agent-reach included.",
        f"# processName/executableNames ({NO_SUCH_PROCESS}) match nothing on this machine: with 9333 down,",
        "# opencli's launcher has nothing to restart or launch (and on Linux its app discovery returns",
        "# null before any process is looked at), so the call fails with the displayName below.",
        "# Regenerate after an opencli update: python3 <skill>/scripts/hidden.py apps",
        "apps:",
    ]
    for s in sites:
        lines.append(f'  "{s}": {{port: {PORT}, processName: {NO_SUCH_PROCESS}, '
                     f'executableNames: [{NO_SUCH_PROCESS}], displayName: "{DISPLAY_NAME}"}}')
    APPS_YAML.parent.mkdir(parents=True, exist_ok=True)
    tmp = APPS_YAML.with_name(".apps.yaml.tmp")
    tmp.write_text("\n".join(lines) + "\n", encoding="utf-8")
    os.replace(tmp, APPS_YAML)
    return len(sites)


# ---------------------------------------------------------------- slots, registry, reaping
@contextlib.contextmanager
def slot(wait_s: float):
    """Hold one of SLOTS lock files. The kernel drops the lock when the process dies, SIGKILL too."""
    RUN.mkdir(parents=True, exist_ok=True)
    deadline = time.monotonic() + wait_s
    while True:
        for i in range(SLOTS):
            fd = os.open(RUN / f"slot.{i}", os.O_RDWR | os.O_CREAT, 0o600)
            try:
                fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
            except BlockingIOError:
                os.close(fd)
                continue
            try:
                yield i
            finally:
                os.close(fd)
            return
        if time.monotonic() >= deadline:
            raise SlotTimeout(f"gizli Chrome'daki {SLOTS} pencerenin hepsi {wait_s:.0f} sn dolu kaldi")
        time.sleep(0.25)


def _proc_start(pid: int) -> str | None:
    try:
        return Path(f"/proc/{pid}/stat").read_text().rsplit(")", 1)[1].split()[19]
    except (OSError, IndexError):
        return None


def _register(tid: str) -> None:
    d = RUN / "tabs"
    d.mkdir(parents=True, exist_ok=True)
    (d / tid).write_text(json.dumps({"pid": os.getpid(), "start": _proc_start(os.getpid()),
                                     "ts": int(time.time())}))


def _unregister(tid: str) -> None:
    with contextlib.suppress(OSError):
        (RUN / "tabs" / tid).unlink()


def reap() -> int:
    """Close the windows whose reader died without closing them (SIGKILL, OOM). Returns the count."""
    d = RUN / "tabs"
    try:
        entries = list(d.iterdir())
    except OSError:
        return 0
    if not entries:
        return 0
    try:
        live = {t.get("id") for t in _http("/json/list", 3)}
    except Exception:
        return 0
    n = 0
    for f in entries:
        if f.name not in live:          # gone already (closed, or Chrome restarted)
            _unregister(f.name)
            continue
        try:
            info = json.loads(f.read_text())
            owner_alive = _proc_start(int(info["pid"])) == info.get("start")
        except Exception:
            owner_alive = False
        if not owner_alive:
            with contextlib.suppress(Exception):
                _http(f"/json/close/{f.name}", 3)
            if _gone(f.name):
                _unregister(f.name)
                n += 1
    return n


def _gone(tid: str, wait_s: float = 3.0) -> bool:
    """True once `tid` is confirmed absent from Chrome's own target list. False when it is still
    listed after `wait_s` — or when Chrome cannot be asked, so the registry entry stays for reap()."""
    deadline = time.monotonic() + wait_s
    while True:
        try:
            if tid not in {t.get("id") for t in _http("/json/list", 3)}:
                return True
        except Exception:
            return False
        if time.monotonic() >= deadline:
            return False
        time.sleep(0.1)


# TERM, HUP and INT are held while a window and its registry entry are made, and while it is closed.
# A signal mask holds the calling thread only; the readers that make windows (bin/opencli, hidden.py)
# are single-threaded, and a threaded caller must hold these in its other threads itself.
_HELD = {signal.SIGTERM, signal.SIGHUP, signal.SIGINT}


class Tab:
    """One read's own window in the hidden Chrome — registered while it lives, always closed.

    A new WINDOW, not a new tab: parallel reads in one window leave every tab but the front one
    `hidden`, and hidden pages lose their animation frames and lazy loading.

    THE WINDOW AND ITS REGISTRY ENTRY ARE MADE AS ONE STEP. The refuter found on 2026-09-24 that a
    TERM landing between Target.createTarget and the registry write left a window no reaper could
    see. TERM/HUP/INT are now held until both exist; one that arrived meanwhile closes the window
    before it is let through. And the entry is removed only when the window is confirmed gone from
    Chrome's own list, so a window that would not close stays visible to reap()."""

    def __init__(self, width: int = 1440, height: int = 1000):
        self.id = None
        stopped = False
        held = signal.pthread_sigmask(signal.SIG_BLOCK, _HELD)
        try:
            b = browser()
            try:
                tid = b.send("Target.createTarget", {"url": "about:blank", "newWindow": True,
                                                     "width": width, "height": height}, 15)["targetId"]
            finally:
                b.close()
            self.id, self.ws = tid, f"ws://{HOST}:{PORT}/devtools/page/{tid}"
            try:
                _register(tid)
            except OSError:
                self._close()
                raise
            if signal.sigpending() & _HELD:     # told to stop while the window was being made
                self._close()
                stopped = True
        finally:
            signal.pthread_sigmask(signal.SIG_SETMASK, held)   # a held signal is delivered here
        if stopped:
            raise CDPError("stopped while its window was being made; the window is closed")

    def __enter__(self) -> "Tab":
        return self

    def __exit__(self, *exc) -> None:
        self.close()

    def close(self) -> None:
        held = signal.pthread_sigmask(signal.SIG_BLOCK, _HELD)
        try:
            self._close()
        finally:
            signal.pthread_sigmask(signal.SIG_SETMASK, held)

    def _close(self) -> None:
        tid, self.id = self.id, None
        if not tid:
            return
        try:
            b = browser()
            try:
                infos = b.send("Target.getTargets", {}, 10).get("targetInfos") or []
                for t in infos:     # a window its page opened (window.open) goes with it
                    if t.get("openerId") == tid and t.get("type") == "page":
                        with contextlib.suppress(CDPError):
                            b.send("Target.closeTarget", {"targetId": t["targetId"]}, 10)
                b.send("Target.closeTarget", {"targetId": tid}, 10)
            finally:
                b.close()
        except Exception:
            with contextlib.suppress(Exception):
                _http(f"/json/close/{tid}", 3)
        if _gone(tid):
            _unregister(tid)


# ---------------------------------------------------------------- reading a page
# Waits until the DOM has been quiet for 700 ms, at most 6 s — a page that renders after `load`
# (every single-page site we read) is not read half-built.
SETTLE_JS = """new Promise(done => {
  let quiet; const obs = new MutationObserver(() => { clearTimeout(quiet); quiet = setTimeout(fin, 700); });
  function fin() { try { obs.disconnect(); } catch (e) {} done(true); }
  obs.observe(document.documentElement || document, {subtree: true, childList: true, characterData: true});
  quiet = setTimeout(fin, 700); setTimeout(fin, 6000);
})"""

# opencli's own extract pipeline, imported from the installed package: the page-side script
# (buildExtractHtmlJs) and the HTML -> markdown -> chunked envelope (runExtractFromHtml, turndown).
_NODE_JS = ("const m = await import(process.argv[1]);"
            "if (process.argv[2] === 'js') { process.stdout.write(m.buildExtractHtmlJs(null)); }"
            "else { let s = ''; for await (const c of process.stdin) s += c; const d = JSON.parse(s);"
            "process.stdout.write(JSON.stringify(m.runExtractFromHtml({html: d.html, url: d.url,"
            " title: d.title, selector: null, start: 0, chunkSize: d.chunk}), null, 2) + '\\n'); }")


def _node_extract(root: Path, mode: str, payload: str = "") -> str:
    node = shutil.which("node")
    if not node:
        raise CDPError("node not found — the page cannot be turned into markdown")
    p = subprocess.run([node, "--input-type=module", "-e", _NODE_JS,
                        str(root / "dist" / "src" / "browser" / "extract.js"), mode],
                       input=payload, capture_output=True, text=True, timeout=60)
    if p.returncode != 0:
        raise CDPError("opencli's extract module failed: " + (p.stderr or "")[-200:])
    return p.stdout


def _expand_js(label: str) -> str:
    # Facebook's "See more" fold: measured 2026-09-21 it cut three posts to their first line.
    return ("(() => { let n = 0; const want = %s; document.querySelectorAll('[role=button]')"
            ".forEach(b => { if (b.textContent.trim().toLowerCase() === want) { b.click(); n++; } });"
            " return n; })()") % json.dumps(label.strip().lower())


def read(url: str, wait: float = 1.5, expand: str | None = None, after: float = 2.0,
         timeout: float = 90.0, chunk: int = 20000, text: bool = False) -> dict | str:
    """Open `url` in its own window of the hidden Chrome and return the extract envelope — or,
    with text=True, the whole page's visible text (sidebars included, which the extract drops)."""
    end = time.monotonic() + timeout

    def left(cap: float) -> float:
        rest = end - time.monotonic()
        if rest <= 0:
            raise CDPError(f"read took longer than {timeout:.0f}s")
        return min(cap, rest)

    if not version():
        raise Down(DOWN_MSG)
    found = genuine_opencli()
    if not found:
        raise CDPError("opencli (the @jackwener/opencli package) is not on PATH")
    root = found[1]
    extract_js = "document.body ? document.body.innerText : ''" if text else _node_extract(root, "js")
    reap()
    with slot(left(timeout)):
        with Tab() as tab:
            page = CDP(tab.ws)
            try:
                page.send("Page.enable", {}, left(15))
                nav = page.send("Page.navigate", {"url": url}, left(30))
                if nav.get("errorText"):
                    raise CDPError(f"navigation failed: {nav['errorText']}")
                page.wait_event("Page.loadEventFired", left(30))
                page.evaluate(SETTLE_JS, left(10))
                if wait:
                    time.sleep(left(wait))
                if expand:
                    page.evaluate(_expand_js(expand), left(15))
                    time.sleep(left(after))
                res = page.evaluate(extract_js, left(30))
            finally:
                page.close()
    if text:
        return str(res or "")
    if not isinstance(res, dict) or not res.get("ok"):
        raise CDPError(f"the page gave no readable body ({str(res)[:120]})")
    out = _node_extract(root, "md", json.dumps({"html": res.get("html") or "", "url": res.get("url"),
                                                 "title": res.get("title") or "", "chunk": chunk}))
    return json.loads(out)


# ---------------------------------------------------------------- is the copy REALLY signed in?
# THE SESSION GUARD ASKS THE SITE, NOT THE COOKIE JAR. Measured 2026-09-24 16:13: the copy still
# carried Google's SID cookie while myaccount.google.com said "Signed out" and every search stopped
# at "Before you continue to Google" — and a guard that only looked for the cookie printed "tamam".
# Each check is one read-only page in its own window of the hidden Chrome. His own Chrome is never
# asked: it is never driven at all.
# `password`: a password field on the page is a login wall, whatever language the page is in.
_STATE_JS = ("JSON.stringify({url: location.href, title: document.title,"
             " password: !!document.querySelector('input[type=password]'),"
             " text: (document.body ? document.body.innerText : '').slice(0, 6000)})")


def _state(url: str, dwell: float = 3.0, timeout: float = 45.0) -> dict:
    """Where `url` ends up, its title and the start of its text — read in its own window."""
    end = time.monotonic() + timeout
    with slot(timeout):
        with Tab() as tab:
            page = CDP(tab.ws)
            try:
                page.send("Page.enable", {}, 15)
                nav = page.send("Page.navigate", {"url": url}, 30)
                if nav.get("errorText"):
                    raise CDPError(f"navigation failed: {nav['errorText']}")
                page.wait_event("Page.domContentEventFired", max(1.0, min(20.0, end - time.monotonic())))
                time.sleep(dwell)
                return json.loads(page.evaluate(_STATE_JS, 20) or "{}")
            finally:
                page.close()


def _json_doc(st: dict):
    """A JSON endpoint, as the browser shows it: the text between the first { and the last }."""
    t = st.get("text") or ""
    try:
        return json.loads(t[t.index("{"):t.rindex("}") + 1])
    except ValueError:
        return None


def _live_google(st: dict) -> tuple[bool, str]:
    host = urllib.parse.urlsplit(st.get("url") or "").hostname or "?"
    text = st.get("text") or ""
    if host != "myaccount.google.com" or "signed out" in text.lower():
        return False, f"oturum kapali ({host}" + ("; 'Signed out'" if "signed out" in text.lower() else "") + ")"
    m = re.search(r"[\w.+-]+@[\w-]+\.[\w.]+", text)
    return (True, m.group(0)) if m else (False, "myaccount acildi, hesap gorunmuyor")


def _live_path(prefix: str):
    def judge(st: dict) -> tuple[bool, str]:
        path = urllib.parse.urlsplit(st.get("url") or "").path or "?"
        ok = path.startswith(prefix) and "login" not in path and not st.get("password")
        return ok, path + (" (giris formu)" if st.get("password") else "")
    return judge


def _live_facebook(st: dict) -> tuple[bool, str]:
    # Signed in, /me lands on his profile. Signed out it lands on /login/ — or on "/" with the login
    # form: measured 2026-09-24 with a planted c_user in an empty profile, the first version of this
    # judge took that "/" for a profile page.
    path = urllib.parse.urlsplit(st.get("url") or "").path or "/"
    ok = (path not in ("", "/") and not path.startswith(("/login", "/checkpoint", "/recover", "/me"))
          and not st.get("password"))
    return ok, ("profil sayfasi" if ok else path + (" (giris formu)" if st.get("password") else ""))


def _live_reddit(st: dict) -> tuple[bool, str]:
    name = ((_json_doc(st) or {}).get("data") or {}).get("name")
    return (True, f"u/{name}") if name else (False, "api/me.json: hesap yok")


def _live_perplexity(st: dict) -> tuple[bool, str]:
    user = (_json_doc(st) or {}).get("user") or {}
    who = user.get("username") or user.get("email")
    return (True, str(who)) if who else (False, "api/auth/session: oturum yok")


LIVE = [
    ("google", "https://myaccount.google.com/?hl=en", _live_google),
    ("x", "https://x.com/home", _live_path("/home")),
    ("facebook", "https://www.facebook.com/me", _live_facebook),
    ("instagram", "https://www.instagram.com/accounts/edit/", _live_path("/accounts/edit")),
    ("reddit", "https://www.reddit.com/api/me.json", _live_reddit),
    ("perplexity", "https://www.perplexity.ai/api/auth/session", _live_perplexity),
]


def signed_in() -> list[tuple[str, bool, str]]:
    """(site, really signed in, the evidence) for every site in LIVE, asked of the hidden Chrome."""
    if not version():
        raise Down(DOWN_MSG)
    reap()
    out = []
    for site, url, judge in LIVE:
        try:
            ok, why = judge(_state(url))
        except Down:
            raise
        except Exception as e:
            ok, why = False, f"okunamadi: {str(e)[:80]}"
        out.append((site, ok, why))
    return out


# ---------------------------------------------------------------- Google, with named fallbacks
ENGINES = [
    ("google", "https://www.google.com/search?q={q}&num=30&hl=en"),
    ("startpage", "https://www.startpage.com/sp/search?query={q}"),
    ("brave", "https://search.brave.com/search?q={q}&source=web"),
]


def _results(name: str, env: dict) -> tuple[int, str]:
    """(how many outside links the page carries, why it is a wall — or "")."""
    url, text = str(env.get("url") or ""), str(env.get("content") or "")
    low = text.lower()
    # A SIGNED-OUT COPY MEETS GOOGLE'S CONSENT WALL, NOT ITS RESULTS. Measured 2026-09-24 16:13: the
    # copy's Google session had dropped, every search stopped at "Before you continue to Google",
    # and the FAIL line blamed "1 result link" instead of naming the cause.
    if name == "google" and ("consent.google." in url or "before you continue to google" in low):
        return 0, "Google imzasiz okunur (cerezle oturum tasinmaz) -> Startpage/Brave"
    if name == "google" and ("/sorry/" in url or "unusual traffic" in low):
        return 0, "Google /sorry/ (captcha; solving it is forbidden)"
    if "captcha" in low and len(text) < 4000:
        return 0, f"{name} asked for a captcha"
    host = urllib.parse.urlsplit(url).hostname or ""
    own = host.split(".")[-2] if host.count(".") >= 1 else host
    links = {u for u in re.findall(r"\]\((https?://[^)\s]+)\)", text)
             if own and own not in (urllib.parse.urlsplit(u).hostname or "")}
    return len(links), ("" if len(links) >= 5 else f"{name} returned {len(links)} result links")


def google(query: str, timeout: float = 120.0) -> int:
    q = urllib.parse.quote_plus(query)
    fails: list[str] = []
    for i, (name, tpl) in enumerate(ENGINES):
        try:
            # the WHOLE results page: signed in, Google's page runs to ~40 000 chars of markdown and
            # opencli's default chunk (20 000) would cut the second half of the results away
            env = read(tpl.format(q=q), timeout=max(20.0, timeout / len(ENGINES)), chunk=200000)
        except Down as e:
            print(f"FAIL google-deep: {e}", file=sys.stderr)
            return 69
        except Exception as e:
            fails.append(f"{name}: {str(e)[:120]}")
            continue
        n, why = _results(name, env)
        if why:
            fails.append(f"{name}: {why}")
            continue
        env["engine"] = name
        print(json.dumps(env, ensure_ascii=False, indent=2))
        if i == 0:
            return 0
        # Google itself failed: the row must say so by name, while the stand-in's results still
        # reach the page collector through this channel's raw file.
        print(f"FAIL google-deep: {' · '.join(fails)} -> yedek {name} okundu ({n} sonuc baglantisi)",
              file=sys.stderr)
        return 4
    print("FAIL google-deep: " + " · ".join(fails), file=sys.stderr)
    return 5


# ---------------------------------------------------------------- the CLI
def _die_cleanly(signum, _frame):
    raise SystemExit(128 + signum)   # unwinds the `with` blocks, so the window is closed


def main() -> int:
    ap = argparse.ArgumentParser(prog="hidden.py", description="the hidden research Chrome")
    sub = ap.add_subparsers(dest="cmd", required=True)
    r = sub.add_parser("read", help="a page as the extract envelope")
    r.add_argument("url")
    # THE DEFAULT DWELL IS MEASURED, NOT DECORATION. The bridge read a page in a second process a
    # second or two after `open`; without that gap, 2026-09-24, instagram's search page came back with
    # 0 chars, and with 3 s with 596 chars and 24 post addresses.
    r.add_argument("--wait", type=float, default=1.5, help="seconds to wait after the page settles")
    r.add_argument("--expand", help="click every [role=button] with exactly this text (e.g. 'See more')")
    r.add_argument("--after", type=float, default=2.0, help="seconds to wait after --expand")
    r.add_argument("--timeout", type=float, default=90.0)
    r.add_argument("--chunk", type=int, default=20000, help="characters of markdown (opencli's default)")
    r.add_argument("--text", action="store_true", help="the page's whole visible text instead of the envelope")
    g = sub.add_parser("google", help="Google's own results page, Startpage/Brave on /sorry/")
    g.add_argument("query")
    g.add_argument("--timeout", type=float, default=150.0)
    si = sub.add_parser("signed-in", help="is the hidden Chrome REALLY signed in to each site it reads")
    si.add_argument("--json", action="store_true", help="one JSON line per site")
    sub.add_parser("status")
    sub.add_parser("reap")
    sub.add_parser("cookie-names", help="name/domain/expiry of every cookie — never a value")
    sub.add_parser("apps", help="(re)write ~/.opencli/apps.yaml from opencli's manifest")
    a = ap.parse_args()
    for s in (signal.SIGTERM, signal.SIGHUP):
        signal.signal(s, _die_cleanly)

    try:
        if a.cmd == "read":
            got = read(a.url, a.wait, a.expand, a.after, a.timeout, a.chunk, a.text)
            print(got if a.text else json.dumps(got, ensure_ascii=False, indent=2))
            return 0
        if a.cmd == "google":
            return google(a.query, a.timeout)
        if a.cmd == "signed-in":
            rows = signed_in()
            for site, ok, why in rows:
                print(json.dumps({"site": site, "live": ok, "why": why}, ensure_ascii=False) if a.json
                      else f"{site:<11} {'evet' if ok else 'HAYIR':<6} {why}")
            return 0 if all(ok for _, ok, _ in rows) else 1
        if a.cmd == "status":
            v = version()
            if not v:
                print(DOWN_MSG)
                return 69
            pages = [t for t in _http("/json/list") if t.get("type") == "page"]
            tabs = len(list((RUN / "tabs").glob("*"))) if (RUN / "tabs").is_dir() else 0
            print(f"up · {v.get('Browser')} · {len(pages)} pencere/sekme · okuyucuya kayitli {tabs}")
            return 0
        if a.cmd == "reap":
            print(f"kapatilan sahipsiz pencere: {reap()}")
            return 0
        if a.cmd == "cookie-names":
            b = browser()
            try:
                cookies = b.send("Storage.getCookies", {}, 20).get("cookies") or []
            finally:
                b.close()
            for c in cookies:
                print(json.dumps({"domain": c.get("domain"), "name": c.get("name"),
                                  "expires": c.get("expires"), "session": c.get("session")}))
            return 0
        if a.cmd == "apps":
            found = genuine_opencli()
            if not found:
                print("opencli (@jackwener/opencli) PATH'te yok", file=sys.stderr)
                return 2
            n = write_apps(found[1])
            if not apps_valid(found[1]):
                print(f"!! {APPS_YAML} opencli'nin kendi YAML okuyucusundan gecmedi", file=sys.stderr)
                return 1
            print(f"{APPS_YAML}: {n} site -> 127.0.0.1:{PORT}")
            return 0
    except Down as e:
        print(str(e), file=sys.stderr)
        return 69
    except SlotTimeout as e:
        print(str(e), file=sys.stderr)
        return 75
    except (CDPError, OSError, ValueError) as e:
        print(f"gizli Chrome okumasi basarisiz: {e}", file=sys.stderr)
        return 1
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
