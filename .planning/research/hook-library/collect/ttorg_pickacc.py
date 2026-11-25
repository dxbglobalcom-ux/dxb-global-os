"""accounts worth listing: one found film with many views that were not bought."""
import collections, json, re
D = '/home/dxb/.local/share/dxb/hook-lab/tt_org'
R = [json.loads(l) for l in open(D + '/search.jsonl')]
have = set()
for f in ('list.jsonl', 'list2.jsonl'):
    try:
        have |= {json.loads(x)['handle'].lower() for x in open(f'{D}/{f}')}
    except FileNotFoundError:
        pass
BAD = re.compile(r'\b(kiss|girlfriend|sexy|bikini|beer|wine|whisk|vodka|cocktail|casino|poker|betting|crypto|forex|loan|trump|biden|lingerie|tattoo|pork|bacon|gun|rifle)\w*', re.I)
A = collections.defaultdict(list)
for r in R:
    A[r['author']].append(r)
out = []
for a, L in A.items():
    if a.lower() in have:
        continue
    g = [x for x in L if int(x.get('plays') or 0) >= 200000 and (int(x.get('likes') or 0) / max(1, int(x['plays']))) >= 0.015 and not BAD.search(x.get('desc') or '')]
    if g:
        b = max(g, key=lambda x: int(x['plays']))
        out.append((int(b['plays']), b['sector'], a, b['query']))
out.sort(reverse=True)
with open(D + '/seeds2.tsv', 'w') as f:
    for p, s, a, q in out[:520]:
        f.write(f'{s}\t{a}\t{q}\t{p}\n')
print('accounts', len(out), 'taken', min(520, len(out)), collections.Counter(x[1] for x in out[:520]))
