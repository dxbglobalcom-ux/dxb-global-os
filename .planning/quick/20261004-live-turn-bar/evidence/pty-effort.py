# Is the status-line payload's effort.level live after /effort? Launch at high, type `/effort max`, send one prompt.
import os, pty, re, select, sys, time
cwd, log = sys.argv[1], sys.argv[2]
pid, fd = pty.fork()
if pid == 0:
    os.chdir(cwd)
    env = dict(os.environ, TERM="xterm-256color", COLUMNS="160", LINES="50")
    os.execvpe("/home/dxb/.local/bin/claude", ["claude", "--model", "claude-opus-5-5", "--effort", "high",
               "--allowedTools", "Skill"], env)
t0 = time.time(); out = open(log, "w"); buf = b""; sent = {}; seen = {}
ansi = re.compile(rb"\x1b\[[0-9;?]*[A-Za-z]|\x1b\][^\x07]*\x07|\x1b[()][A-Za-z0-9]")
def note(s): out.write(f"{time.strftime('%H:%M:%S')} {time.time()-t0:7.2f}s {s}\n"); out.flush()
def send(k, text):
    os.write(fd, text.encode()); time.sleep(0.6); os.write(fd, b"\r"); sent[k] = time.time(); note(f"SENT {k}: {text}")
while time.time() - t0 < 120:
    r, _, _ = select.select([fd], [], [], 0.2)
    if r:
        try: chunk = os.read(fd, 65536)
        except OSError: break
        buf += chunk
        plain = ansi.sub(b"", chunk).decode("utf8", "replace").lower()
        if "set effort level" in plain and "e1" not in seen: seen["e1"] = time.time(); note("EFFORT SET drawn")
        if "p1" in sent and "p1" not in seen and ("roma" in plain or "rome" in plain): seen["p1"] = time.time(); note("ANSWER p1 drawn")
    now = time.time()
    if "e1" not in sent and now - t0 > 15: send("e1", "/effort max")
    if "e1" in sent and "p1" not in sent and now - sent["e1"] > 4: send("p1", "What is the capital of Italy? One word. Do not invoke any skill.")
    if "p1" in seen and now - seen["p1"] > 6: break
note("end"); os.write(fd, b"\x03"); time.sleep(0.3); os.write(fd, b"\x03"); time.sleep(1)
try: os.kill(pid, 9)
except Exception: pass
open(log + ".raw", "wb").write(buf)
