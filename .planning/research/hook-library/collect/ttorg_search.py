"""Searches TikTok for trades and brands and keeps every film found with its plays and likes (read only).
usage: python3 -I search.py <queries.tsv> <out.jsonl>"""
import json, os, re, subprocess, sys, time
Q, out = sys.argv[1], sys.argv[2]
S = '/home/dxb/DxB Global OS/.claude/skills/dxb-research'
env = dict(os.environ)
done = set()
if os.path.exists(out):
    done = {json.loads(x)['query'] for x in open(out) if x.strip()}
L = [x.rstrip('\n').split('\t') for x in open(Q) if '\t' in x]
with open(out, 'a') as f:
    for k, (sec, q) in enumerate(L, 1):
        if q in done:
            continue
        try:
            p = subprocess.run([f'{S}/bin/opencli', 'tiktok', 'search', q, '--limit', '30', '-f', 'json'], capture_output=True, text=True, timeout=120, env=env)
            s = p.stdout
            a = json.loads(s[s.index('['):s.rindex(']') + 1])
        except Exception as e:
            print(k, q, 'ERR', str(e)[:80], (p.stderr or p.stdout)[-120:].replace('\n', ' ') if 'p' in dir() else '', flush=True)
            time.sleep(4)
            continue
        for x in a:
            f.write(json.dumps({'sector': sec, 'query': q, **x}, ensure_ascii=True) + '\n')
        f.flush()
        print(k, q, len(a), max([int(x.get('plays') or 0) for x in a] or [0]), flush=True)
        time.sleep(1.5)
print('SEARCH DONE', flush=True)
