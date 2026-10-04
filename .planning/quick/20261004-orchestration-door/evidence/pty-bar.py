# Drive a real interactive claude in a pseudo-terminal and log, with timestamps, every status-line
# "tur: <level>" the TUI draws, plus the moments the prompt is sent and the answer appears.
import os, pty, re, select, sys, time
cwd, log = sys.argv[1], sys.argv[2]
pid, fd = pty.fork()
if pid == 0:
    os.chdir(cwd)
    env = dict(os.environ, TERM="xterm-256color", COLUMNS="160", LINES="50")
    os.execvpe("/home/dxb/.local/bin/claude", ["claude", "--model", "claude-opus-5-5", "--effort", "high",
               "--allowedTools", "Skill"], env)
t0 = time.time(); out = open(log, "w"); buf = b""; last = None; sent = False; done_at = None; trusted = False
ansi = re.compile(rb"\x1b\[[0-9;?]*[A-Za-z]|\x1b\][^\x07]*\x07|\x1b[()][A-Za-z0-9]")
def note(s): out.write(f"{time.time()-t0:7.2f}s {s}\n"); out.flush()
while time.time() - t0 < 150:
    r, _, _ = select.select([fd], [], [], 0.2)
    if r:
        try: chunk = os.read(fd, 65536)
        except OSError: break
        buf += chunk
        plain = ansi.sub(b"", chunk).decode("utf8", "replace")
        for m in re.finditer(r"tur: (low|medium|high|xhigh|max)", plain):
            if m.group(1) != last: note(f"BAR tur: {m.group(1)}"); last = m.group(1)
        if "trustthisfolder" in plain.replace(" ","").lower() and not trusted:
            time.sleep(0.5); os.write(fd, b"\x1b[B"); time.sleep(0.3); os.write(fd, b"\r"); trusted = True; note("trust dialog: Yes chosen")
        if "391" in plain and sent and done_at is None:
            done_at = time.time(); note("ANSWER 391 drawn")
    if not sent and time.time() - t0 > 20:
        os.write(fd, "Invoke the dxb-design-max skill first. Then think it through and answer only the number: what is 17*23?".encode())
        time.sleep(0.5); os.write(fd, b"\r"); sent = True; note("PROMPT sent")
    if done_at and time.time() - done_at > 6: break
note("end"); os.write(fd, b"\x03"); time.sleep(0.3); os.write(fd, b"\x03"); time.sleep(1)
try: os.kill(pid, 9)
except Exception: pass
open(log + ".raw", "wb").write(buf)
