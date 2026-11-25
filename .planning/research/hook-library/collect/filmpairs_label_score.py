"""Sol's blind labels: what separates the film that went round. usage: python3 -I sol_score.py <ciftfilm|ciftfilm2> [...]; several sets are also pooled."""
import json, math, os, re, sys
L = os.path.expanduser('~/.local/share/dxb/hook-lab')
N = {m[1]: m[2] for m in re.finditer(r'^([A-Z])  (.{0,46})', open(f'{L}/ciftfilm/CODES.txt').read(), re.M)}
N.update(W0='no words on screen', W1='words, up to six', W2='words, more than six')


def load(s):
    D = f'{L}/{s}'
    S, K = json.load(open(D + '/key_solo.json')), json.load(open(D + '/key.json'))
    lab = {}
    for ln in open(D + '/sol/lab.txt'):
        m = re.match(r'(\d{3}) (.*) (\d{1,3})$', ln.strip())
        if m:
            lab[m[1]] = (set(m[2].split()), int(m[3]))
    by = {(v['pair'], v['side']): lab[n] for n, v in S.items() if n in lab}
    return [(by[(n, v['ans'])], by[(n, 'B' if v['ans'] == 'A' else 'A')]) for n, v in K.items() if (n, 'A') in by and (n, 'B') in by]


def z(P, c):
    o = sum(c in w[0] and c not in l[0] for w, l in P); u = sum(c in l[0] and c not in w[0] for w, l in P)
    return o, u, (o - u) / math.sqrt(max(1, o + u))


sets = {s: load(s) for s in sys.argv[1:]}
pool = [p for P in sets.values() for p in P]
for s, P in list(sets.items()) + ([('pooled', pool)] if len(sets) > 1 else []):
    hi, lo = sum(w[1] > l[1] for w, l in P), sum(w[1] < l[1] for w, l in P)
    print(f'{s}: pairs {len(P)}; score: winner higher {hi}, lower {lo} ({100 * hi / (hi + lo):.0f}%);', ' '.join(f'apart {g}+: {sum(w[1] > l[1] for w, l in P if abs(w[1] - l[1]) >= g)}/{sum(abs(w[1] - l[1]) >= g for w, l in P)}' for g in (10, 20, 30)))
for c in sorted(N, key=lambda c: -z(pool, c)[2]):
    a, b = sum(c in w[0] for w, l in pool), sum(c in l[0] for w, l in pool)
    print(f'{c:3} {N[c]:46} win {100 * a / len(pool):3.0f}% ord {100 * b / len(pool):3.0f}% |', ' | '.join(f'{z(P, c)[0]:2}:{z(P, c)[1]:2} z={z(P, c)[2]:+.1f}' for P in list(sets.values()) + ([pool] if len(sets) > 1 else [])))
