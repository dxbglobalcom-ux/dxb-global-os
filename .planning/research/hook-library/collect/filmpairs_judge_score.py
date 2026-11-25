import collections, glob, json, math, os, re
D = os.path.expanduser('~/.local/share/dxb/hook-lab/ciftfilm2')
K = json.load(open(D + '/key.json'))


def ans(d):
    o = {}
    for f in sorted(glob.glob(f'{D}/{d}/ans_g*.txt')):
        for ln in open(f):
            m = re.match(r'\s*(\d{3})\s+([AB])\s+([su])\b(.*)', ln)
            if m and m[1] in K:
                o[m[1]] = (m[2], m[3] == 's', m[4].strip())
    return o


def ci(k, n):
    if not n:
        return '-'
    p, z = k / n, 1.96
    c = (p + z * z / (2 * n)) / (1 + z * z / n)
    h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / (1 + z * z / n)
    return f'{k}/{n} = {100 * p:.0f}% [{100 * (c - h):.0f}-{100 * (c + h):.0f}]'


J = {d: ans(d) for d in ('blind', 'taught')}
for d, o in J.items():
    if o:
        ok = [n for n in o if o[n][0] == K[n]['ans']]
        s = [n for n in o if o[n][1]]
        print(f'{d:7} all {ci(len(ok), len(o))} | sure {ci(sum(o[n][0] == K[n]["ans"] for n in s), len(s))} | unsure {ci(len(ok) - sum(o[n][0] == K[n]["ans"] for n in s), len(o) - len(s))}')
        c = collections.defaultdict(lambda: [0, 0])
        for n in o:
            c[K[n]['trade']][1] += 1
            c[K[n]['trade']][0] += o[n][0] == K[n]['ans']
        print('   ', ' '.join(f'{t}:{a}/{b}' for t, (a, b) in sorted(c.items(), key=lambda x: -x[1][0] / x[1][1])))
a, b = J['blind'], J['taught']
if a and b:
    both = [n for n in a if n in b]
    x = sum(a[n][0] == K[n]['ans'] and b[n][0] != K[n]['ans'] for n in both)
    y = sum(b[n][0] == K[n]['ans'] and a[n][0] != K[n]['ans'] for n in both)
    print('only bare right', x, '| only taught right', y, f'| z={(y - x) / math.sqrt(max(1, x + y)):+.1f}')
    ag = [n for n in both if a[n][0] == b[n][0]]
    print('both the same on', len(ag), 'right', ci(sum(a[n][0] == K[n]['ans'] for n in ag), len(ag)))
