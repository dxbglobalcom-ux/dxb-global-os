"""Takes single videos out of the dataset's parquet files by byte ranges (page index), without the rate-limited rows API."""
import json, os, struct, subprocess, sys, time, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed
import cramjam
import requests
import threading

LOC = threading.local()

D = '/home/dxb/.local/share/dxb/hook-lab/ttcc'
for x in ('vid', 'sheet', 'txt', 'wav'):
    os.makedirs(f'{D}/{x}', exist_ok=True)
TIMES = [0.0, 0.4, 0.8, 1.2, 1.8, 2.4, 3.0, 4.0]


class NoRedir(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None


op = urllib.request.build_opener(NoRedir)


def resolve(u):
    for _ in range(40):
        try:
            op.open(urllib.request.Request(u, method='HEAD'), timeout=40)
            return u
        except urllib.error.HTTPError as e:
            if e.code in (301, 302, 303, 307, 308):
                loc = e.headers['Location']
                return loc if loc.startswith('http') else 'https://huggingface.co' + loc
            if e.code == 429:
                time.sleep(int(e.headers.get('retry-after', '30')) + 1)
                continue
            raise
    raise RuntimeError('no resolve')


def signed(u):
    for _ in range(4):
        v = resolve(u)
        if v == u or 'huggingface.co/datasets' not in v and not v.startswith('https://huggingface.co'):
            return v
        u = v
    return u


def rng(u, a, n):
    if not hasattr(LOC, 's'):
        LOC.s = requests.Session()
    err = None
    for k in range(6):
        try:
            r = LOC.s.get(u, headers={'Range': f'bytes={a}-{a + n - 1}'}, timeout=180)
            if r.status_code in (200, 206):
                return r.content
            err = RuntimeError(f'http {r.status_code}')
        except Exception as e:
            err = e
        time.sleep(2 * (k + 1))
    raise err


class T:  # compact thrift reader -> {field id: value}
    def __init__(self, b, p=0):
        self.b, self.p = b, p

    def vi(self):
        r = s = 0
        while True:
            c = self.b[self.p]
            self.p += 1
            r |= (c & 127) << s
            if c < 128:
                return r
            s += 7

    def zz(self):
        n = self.vi()
        return (n >> 1) ^ -(n & 1)

    def val(self, t):
        if t == 1:
            return True
        if t == 2:
            return False
        if t == 3:
            self.p += 1
            return self.b[self.p - 1]
        if t in (4, 5, 6):
            return self.zz()
        if t == 7:
            self.p += 8
            return struct.unpack('<d', self.b[self.p - 8:self.p])[0]
        if t == 8:
            n = self.vi()
            self.p += n
            return bytes(self.b[self.p - n:self.p])
        if t in (9, 10):
            h = self.b[self.p]
            self.p += 1
            n, et = h >> 4, h & 15
            if n == 15:
                n = self.vi()
            if et in (1, 2):
                out = []
                for _ in range(n):
                    out.append(self.b[self.p] == 1)
                    self.p += 1
                return out
            return [self.val(et) for _ in range(n)]
        if t == 11:
            n = self.vi()
            if n == 0:
                return {}
            kv = self.b[self.p]
            self.p += 1
            return {str(self.val(kv >> 4)): self.val(kv & 15) for _ in range(n)}
        if t == 12:
            return self.st()
        raise ValueError(t)

    def st(self):
        o, last = {}, 0
        while True:
            h = self.b[self.p]
            self.p += 1
            if h == 0:
                return o
            d, t = h >> 4, h & 15
            last = last + d if d else self.zz()
            o[last] = self.val(t)


def unpack(codec, data, size):
    if codec == 0:
        return bytes(data)
    if codec == 1:
        return bytes(cramjam.snappy.decompress_raw(data))
    if codec == 2:
        return bytes(cramjam.gzip.decompress(data))
    if codec == 6:
        return bytes(cramjam.zstd.decompress(data))
    raise ValueError(f'codec {codec}')


def plain(buf, p, n):
    out = []
    for _ in range(n):
        if p + 4 > len(buf):
            break
        k = struct.unpack('<I', buf[p:p + 4])[0]
        out.append(buf[p + 4:p + 4 + k])
        p += 4 + k
    return out


def hybrid(buf, p, width, n):
    out = []
    while len(out) < n and p < len(buf):
        t = T(buf, p)
        h = t.vi()
        p = t.p
        if h & 1:
            cnt = (h >> 1) * 8
            nb = (h >> 1) * width
            v = int.from_bytes(buf[p:p + nb], 'little')
            for i in range(cnt):
                out.append((v >> (i * width)) & ((1 << width) - 1))
            p += nb
        else:
            w = (width + 7) // 8
            out += [int.from_bytes(buf[p:p + w], 'little')] * (h >> 1)
            p += w
    return out[:n]


def page_values(raw, codec, want, dic):
    t = T(raw)
    h = t.st()
    body = raw[t.p:t.p + h[3]]
    if h[1] == 0:  # data page v1
        dh = h[5]
        buf = unpack(codec, body, h[2])
        k = struct.unpack('<I', buf[:4])[0]
        p, n, enc = 4 + k, dh[1], dh[2]
    elif h[1] == 3:  # v2
        dh = h[8]
        lv = dh.get(5, 0) + dh.get(6, 0)
        rest = body[lv:]
        buf = unpack(codec, rest, 0) if dh.get(7, True) else bytes(rest)
        p, n, enc = 0, dh[1], dh[4]
    else:
        raise ValueError(f'page type {h[1]}')
    if enc == 0:
        return plain(buf, p, want + 1)[want]
    if enc in (2, 8):
        w = buf[p]
        return dic()[hybrid(buf, p + 1, w, n)[want]]
    raise ValueError(f'enc {enc}')


def footer(u, size):
    tail = rng(u, size - 65536, 65536)
    n = struct.unpack('<I', tail[-8:-4])[0]
    b = tail[-8 - n:-8] if n + 8 <= len(tail) else rng(u, size - 8 - n, n)
    return T(b).st()


def video(u, md, row):
    base = 0
    for rg in md[4]:
        if row < base + rg[3]:
            break
        base += rg[3]
    i = row - base
    for cc in rg[1]:
        m = cc[3]
        if [x.decode() for x in m[3]] == ['video_local_path', 'bytes']:
            break
    codec = m[4]

    def dic():
        do = m.get(11)
        head = rng(u, do, m[9] - do)
        t = T(head)
        h = t.st()
        buf = unpack(codec, head[t.p:t.p + h[3]], h[2])
        return plain(buf, 0, h[7][1])

    if 4 not in cc:  # no page index: walk the page headers one by one
        pos, first = m[9], 0
        end = min(m.get(11) or m[9], m[9]) + m[7]
        while pos < end:
            t = T(rng(u, pos, 512))
            try:
                h = t.st()
            except IndexError:
                t = T(rng(u, pos, 65536))
                h = t.st()
            n = h[5][1] if h[1] == 0 else (h[8][1] if h[1] == 3 else 0)
            if n and first + n > i:
                return page_values(rng(u, pos, t.p + h[3]), codec, i - first, dic)
            first += n
            pos += t.p + h[3]
        raise ValueError('row not found by walking')
    oi = T(rng(u, cc[4], cc[5])).st()[1]
    pg = [x for x in oi if x[3] <= i][-1]
    return page_values(rng(u, pg[1], pg[2]), codec, i - pg[3], dic)


def after(a):
    mp4, sheet, wav = f'{D}/vid/{a}.mp4', f'{D}/sheet/{a}.jpg', f'{D}/wav/{a}.wav'
    if not os.path.exists(sheet):
        n = len(TIMES)
        args = ['ffmpeg', '-v', 'error', '-y']
        for t in TIMES:
            args += ['-ss', str(t), '-i', mp4]
        fc = ''.join(f'[{i}:v]scale=320:568:force_original_aspect_ratio=decrease,pad=320:568:(ow-iw)/2:(oh-ih)/2,setsar=1[v{i}];' for i in range(n))
        fc += ''.join(f'[v{i}]' for i in range(n)) + f'xstack=inputs={n}:layout=0_0|320_0|640_0|960_0|0_568|320_568|640_568|960_568[o]'
        p = subprocess.run(args + ['-filter_complex', fc, '-map', '[o]', '-frames:v', '1', '-q:v', '4', sheet], capture_output=True, text=True)
    if not os.path.exists(wav):
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', mp4, '-t', '25', '-ac', '1', '-ar', '16000', wav], capture_output=True)


def job(item):
    f, rows = item
    res = []
    todo = [r for r in rows if not os.path.exists(f"{D}/vid/{r['ad_id']}.mp4")]
    if todo:
        u = signed(f['url'])
        md = footer(u, f['size'])
        for r in todo:
            try:
                b = video(u, md, r['file_row_number'])
                if b[4:8] != b'ftyp':
                    res.append(f"{r['ad_id']} not mp4 {b[:12]!r}")
                    continue
                with open(f"{D}/vid/{r['ad_id']}.mp4", 'wb') as o:
                    o.write(b)
            except Exception as e:
                res.append(f"{r['ad_id']} {type(e).__name__} {str(e)[:120]}")
    for r in rows:
        if os.path.exists(f"{D}/vid/{r['ad_id']}.mp4"):
            after(r['ad_id'])
            res.append('ok')
    return res


if __name__ == '__main__':
    sel = json.load(open(D + '/selection.json'))
    if len(sys.argv) > 1:
        sel = sel[:int(sys.argv[1])]
    fs = {(f['split'], f['filename']): f for f in json.load(open(D + '/files.json'))}
    by = {}
    for r in sel:
        by.setdefault((r['split'], r['fname']), []).append(r)
    ok = 0
    with ThreadPoolExecutor(8) as ex:
        for fu in as_completed([ex.submit(job, (fs[k], v)) for k, v in by.items()]):
            try:
                for m in fu.result():
                    if m == 'ok':
                        ok += 1
                    else:
                        print(m, flush=True)
            except Exception as e:
                print('FILE', type(e).__name__, str(e)[:160], flush=True)
    print('PQ DONE ok', ok, flush=True)
