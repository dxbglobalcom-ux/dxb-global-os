"""likes, comments, date, length of each listed Short: a view bought as an advertisement brings almost no likes, so the share of
likes tells a paid film from one people passed on by themselves.
usage: python3 -I likes.py <list.json> <out.jsonl> [workers]"""
import json, os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor, as_completed
src, out = sys.argv[1], sys.argv[2]
W = int(sys.argv[3]) if len(sys.argv) > 3 else 3
done = set()
if os.path.exists(out):
    done = {json.loads(x)['id'] for x in open(out) if x.strip()}
todo = [r['id'] for r in json.load(open(src)) if r['id'] not in done]


def one(i):
    p = subprocess.run(['/home/dxb/.local/bin/yt-dlp', '-q', '--no-warnings', '--skip-download', '--ignore-no-formats-error', '--print',
                        '%(.{id,view_count,like_count,comment_count,upload_date,duration,channel,channel_follower_count,title,description,tags,categories})j',
                        f'https://www.youtube.com/watch?v={i}'], capture_output=True, text=True, timeout=120)
    try:
        return json.loads(p.stdout.strip().split('\n')[-1])
    except Exception:
        return {'id': i, 'err': p.stderr.strip()[-200:]}


n = ok = 0
with open(out, 'a') as f, ThreadPoolExecutor(W) as ex:
    for fu in as_completed([ex.submit(one, i) for i in todo]):
        try:
            r = fu.result()
        except Exception as e:
            continue
        n += 1
        if 'err' not in r:
            ok += 1
            r['description'] = (r.get('description') or '')[:400]
            f.write(json.dumps(r, ensure_ascii=False) + '\n')
            f.flush()
        else:
            print('ERR', r['id'], r['err'][-120:], flush=True)
        if n % 50 == 0:
            print(n, ok, flush=True)
print('LIKES DONE', ok, 'of', len(todo), flush=True)
