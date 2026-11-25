"""Lists the newest films of TikTok accounts with views, likes, comments, shares (free, no login).
usage: python3 -I list.py <seeds.tsv sector<TAB>handle> <out.jsonl> [films per account] [workers]"""
import json, os, random, subprocess, sys, time
from concurrent.futures import ThreadPoolExecutor, as_completed
seeds, out = sys.argv[1], sys.argv[2]
N = int(sys.argv[3]) if len(sys.argv) > 3 else 150
W = int(sys.argv[4]) if len(sys.argv) > 4 else 3
done = set()
if os.path.exists(out):
    done = {json.loads(x)['handle'].lower() for x in open(out) if x.strip()}
todo, seen = [], set()
for line in open(seeds):
    if '\t' not in line:
        continue
    s, h = line.rstrip('\n').split('\t')[:2]
    h = h.strip().lstrip('@')
    if not h or h.lower() in done or h.lower() in seen:
        continue
    seen.add(h.lower())
    todo.append((s, h))


def one(s, h):
    time.sleep(random.random() * 2)
    p = subprocess.run(['/home/dxb/.local/bin/yt-dlp', '-q', '--no-warnings', '--flat-playlist', '--playlist-end', str(N), '--print',
                        '%(.{id,title,view_count,like_count,comment_count,repost_count,duration,timestamp,uploader,channel})j',
                        f'https://www.tiktok.com/@{h}'], capture_output=True, text=True, timeout=240)
    L = []
    for x in p.stdout.split('\n'):
        if x.startswith('{'):
            try:
                L.append(json.loads(x))
            except Exception:
                pass
    return {'sector': s, 'handle': h, 'films': L, 'err': '' if L else p.stderr.strip()[-160:]}


ok = 0
with open(out, 'a') as f, ThreadPoolExecutor(W) as ex:
    fs = [ex.submit(one, s, h) for s, h in todo]
    for k, fu in enumerate(as_completed(fs), 1):
        try:
            r = fu.result()
        except Exception as e:
            print('ERR', str(e)[:100], flush=True)
            continue
        ok += bool(r['films'])
        f.write(json.dumps(r, ensure_ascii=False) + '\n')
        f.flush()
        print(k, r['handle'], len(r['films']), r['err'][-90:], flush=True)
print('LIST DONE', ok, 'of', len(todo), flush=True)
