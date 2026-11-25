"""Takes one video out of a zstd dictionary page by streaming the page only as far as that video, cheapest videos first.
Run from the hook-lab venv: pqz.py <threads> <minutes>  (no new video is started after <minutes>)"""
import importlib.util, json, os, struct, subprocess, sys, threading, time
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests

D = '/home/dxb/.local/share/dxb/hook-lab/ttcc'
spec = importlib.util.spec_from_file_location('pqfetch', D + '/pqfetch.py')
pq = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pq)
sel = json.load(open(D + '/selection.json'))
fs = {(f['split'], f['filename']): f for f in json.load(open(D + '/files.json'))}
LOCKS, HEAD, guard = {}, {}, threading.Lock()
END = time.time() + 60 * float(sys.argv[2] if len(sys.argv) > 2 else 20)


def head(key):
    with guard:
        lock = LOCKS.setdefault(key, threading.Lock())
    with lock:
        if key not in HEAD or time.time() - HEAD[key][2] > 1500:
            u = pq.signed(fs[key]['url'])
            HEAD[key] = (u, pq.footer(u, fs[key]['size']), time.time())
        return HEAD[key]


def plan(r):
    u, md, _ = head((r['split'], r['fname']))
    base = 0
    for rg in md[4]:
        if r['file_row_number'] < base + rg[3]:
            break
        base += rg[3]
    i = r['file_row_number'] - base
    for cc in rg[1]:
        m = cc[3]
        if [x.decode() for x in m[3]] == ['video_local_path', 'bytes']:
            break
    t = pq.T(pq.rng(u, m[9], 4096))
    h = t.st()
    if h[1] != 0 or h[5][2] not in (2, 8) or not m.get(11) or m[4] != 6:
        return r, None
    want = pq.page_values(pq.rng(u, m[9], t.p + h[3]), m[4], i, lambda: list(range(100000)))
    t = pq.T(pq.rng(u, m[11], 4096))
    h = t.st()
    return r, dict(start=m[11] + t.p, size=h[3], want=want, n=h[7][1], need=h[3] * (want + 1) / max(1, h[7][1]))


def stream(u, pl):
    p = subprocess.Popen(['zstd', '-dcq'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    got = [0]
    err = []

    def feed():
        try:
            with requests.get(u, headers={'Range': f"bytes={pl['start']}-{pl['start'] + pl['size'] - 1}"}, stream=True, timeout=90) as r:
                if r.status_code not in (200, 206):
                    raise RuntimeError(f'http {r.status_code}')
                for c in r.iter_content(1 << 20):
                    got[0] += len(c)
                    p.stdin.write(c)
        except (BrokenPipeError, ValueError):
            pass
        except Exception as e:
            err.append(e)
        try:
            p.stdin.close()
        except Exception:
            pass

    th = threading.Thread(target=feed, daemon=True)
    th.start()
    try:
        k = 0
        while True:
            b = p.stdout.read(4)
            if len(b) < 4:
                raise RuntimeError(f"ended at value {k} of {pl['want']} {err}")
            ln = struct.unpack('<I', b)[0]
            if k == pl['want']:
                return p.stdout.read(ln), got[0] >> 20
            left = ln
            while left:
                x = p.stdout.read(min(left, 1 << 20))
                if not x:
                    raise RuntimeError(f'short at value {k} {err}')
                left -= len(x)
            k += 1
    finally:
        p.kill()
        p.stdout.close()
        th.join(timeout=10)
        p.wait()


def job(r, pl):
    a = r['ad_id']
    mp4 = f'{D}/vid/{a}.mp4'
    if time.time() > END:
        return f'late {a}'
    t0 = time.time()
    u, _, _ = head((r['split'], r['fname']))
    b, mb = stream(u, pl)
    if b[4:8] != b'ftyp':
        return f'{a} not mp4 {b[:12]!r}'
    tmp = f'{mp4}.{os.getpid()}.part'
    with open(tmp, 'wb') as o:
        o.write(b)
    os.replace(tmp, mp4)
    pq.after(a)
    return f'ok {a} {time.time() - t0:.0f}s {mb} MB'


todo = [r for r in sel if not os.path.exists(f"{D}/vid/{r['ad_id']}.mp4")]
plans = []
with ThreadPoolExecutor(16) as ex:
    for fu in as_completed([ex.submit(plan, r) for r in todo]):
        try:
            r, pl = fu.result()
            if pl:
                plans.append((r, pl))
            else:
                print('other layout', r['ad_id'], flush=True)
        except Exception as e:
            print('PLAN ERR', str(e)[:120], flush=True)
plans.sort(key=lambda x: x[1]['need'])
print('todo', len(todo), 'planned', len(plans), 'need GB', round(sum(x[1]['need'] for x in plans) / 1e9, 1), 'cheapest 60 GB', round(sum(x[1]['need'] for x in plans[:60]) / 1e9, 1), flush=True)
ok = 0
with ThreadPoolExecutor(int(sys.argv[1]) if len(sys.argv) > 1 else 6) as ex:
    for fu in as_completed([ex.submit(job, r, pl) for r, pl in plans]):
        try:
            m = fu.result()
            ok += m.startswith('ok')
            if not m.startswith('late'):
                print(m, flush=True)
        except Exception as e:
            print('ERR', type(e).__name__, str(e)[:160], flush=True)
print('PQ DONE ok', ok, flush=True)
