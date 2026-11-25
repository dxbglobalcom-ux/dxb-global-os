"""One pair per account, up to eight accounts a sector, drawn by lot (seed 25112026); sides by lot too."""
import collections
import json
import os
import random

OUT = os.path.expanduser('~/.local/share/dxb/hook-lab/ciftfilm')
R = random.Random(25112026)
P = json.load(open(f'{OUT}/pairs.json'))
by = collections.defaultdict(list)
for p in P:
    if p['gap'] >= 10:
        by[p['handle']].append(p)
sec = collections.defaultdict(list)
for h in sorted(by):
    p = R.choice(by[h])
    sec[p['sector']].append(p)
sel = []
for s in sorted(sec):
    R.shuffle(sec[s])
    sel += sec[s][:8]
R.shuffle(sel)
for n, p in enumerate(sel, 1):
    p['n'] = f'{n:03d}'
    p['left'] = R.choice(['win', 'lose'])
json.dump(sel, open(f'{OUT}/selection.json', 'w'), ensure_ascii=False, indent=0)
print(len(sel), 'pairs', collections.Counter(p['sector'] for p in sel).most_common())
