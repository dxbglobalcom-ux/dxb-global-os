# Drive a real interactive claude in a pseudo-terminal: turn 1 invokes dxb-design-max and thinks; a second message is
# sent while turn 1 runs; after both answers a third prompt (no skill). Logs, with timestamps, every status-line
# "tur: <level>" the TUI draws and the moments each prompt is sent and each answer appears.
import os, pty, re, select, sys, time
cwd, log = sys.argv[1], sys.argv[2]
pid, fd = pty.fork()
if pid == 0:
    os.chdir(cwd)
    env = dict(os.environ, TERM="xterm-256color", COLUMNS="160", LINES="50")
    os.execvpe("/home/dxb/.local/bin/claude", ["claude", "--model", "claude-opus-5-5", "--effort", "high",
               "--allowedTools", "Skill"], env)
t0 = time.time(); out = open(log, "w"); buf = b""; last = None; trusted = False
sent = {}; seen = {}
ansi = re.compile(rb"\x1b\[[0-9;?]*[A-Za-z]|\x1b\][^\x07]*\x07|\x1b[()][A-Za-z0-9]")
def note(s): out.write(f"{time.strftime('%H:%M:%S')} {time.time()-t0:7.2f}s {s}\n"); out.flush()
def send(k, text):
    os.write(fd, text.encode()); time.sleep(0.5); os.write(fd, b"\r"); sent[k] = time.time(); note(f"SENT {k}: {text[:60]}")
while time.time() - t0 < 260:
    r, _, _ = select.select([fd], [], [], 0.2)
    if r:
        try: chunk = os.read(fd, 65536)
        except OSError: break
        buf += chunk
        plain = ansi.sub(b"", chunk).decode("utf8", "replace")
        for m in re.finditer(r"tur: (low|medium|high|xhigh|max)", plain):
            if m.group(1) != last: note(f"BAR tur: {m.group(1)}"); last = m.group(1)
        if "trustthisfolder" in plain.replace(" ", "").lower() and not trusted:
            time.sleep(0.5); os.write(fd, b"\x1b[B"); time.sleep(0.3); os.write(fd, b"\r"); trusted = True; note("trust dialog: Yes chosen")
        for k, word in (("p1", "391"), ("p2", "PACIFIC"), ("p3", "PARIS")):
            if k in sent and k not in seen and word in plain:
                seen[k] = time.time(); note(f"ANSWER {k} ({word}) drawn")
    now = time.time()
    if "p1" not in sent and now - t0 > 20:
        send("p1", "Invoke the dxb-design-max skill first. Then think it through carefully and answer only the number: what is 17*23?")
    if "p1" in sent and "p2" not in sent and now - sent["p1"] > 8:
        send("p2", "Also add, at the very end, the name of the largest ocean in uppercase.")
    if "p3" not in sent and "p1" in seen and "p2" in seen and now - max(seen["p1"], seen["p2"]) > 8:
        send("p3", "Reply with the capital of France in one uppercase word. Do not invoke any skill.")
    if "p3" in seen and now - seen["p3"] > 8: break
note("end"); os.write(fd, b"\x03"); time.sleep(0.3); os.write(fd, b"\x03"); time.sleep(1)
try: os.kill(pid, 9)
except Exception: pass
open(log + ".raw", "wb").write(buf)
