"""A ranker really trained on the film pairs, against the bare reader (written before any result was seen, 25 November 2026, 17:35).
Design: every pair is the difference of its two films' numbers (winner minus ordinary). Kernel logistic regression without intercept, pair weight 1/sqrt(pairs of the account);
strength of the brake (lambda) chosen by 5 folds INSIDE the training accounts. Ten outer folds by ACCOUNT, three seeds, margins averaged: no pair is ever judged by a model that saw its account.
MAIN result, fixed beforehand: all five blocks (first frame, five frames' mean, movement, words, sound) with equal weight, linear; on the 341 exam pairs the reader judged (bar 245), alone and together
with the reader's saved answers (logistic on its sign, its sign when sure, the ranker's margin; ten folds, the ranker's margin itself out of fold). Everything else printed is a look around, not the result.
usage: rank.py [--curve] [--blocks]"""
import collections, glob, json, math, os, re, sys
import numpy as np, torch
L = os.path.expanduser('~/.local/share/dxb/hook-lab')
R = L + '/ranker'
SETS = ('ciftfilm', 'ciftfilm2', 'ciftfilm3')
dev = 'cuda'


def load(kind):
    o = {}
    for s in SETS:
        f = f'{R}/{s}_{kind}.npz'
        if os.path.exists(f):
            z = np.load(f)
            for i, x in zip(z['ids'], z['X']):
                o.setdefault(str(i), x)
    return o


F = {k: load(k) for k in ('siglip', 'vjepa', 'text', 'sound')}
B = {'first': {i: x[0] for i, x in F['siglip'].items()}, 'mean5': {i: x.mean(0) for i, x in F['siglip'].items()},
     'move': {i: np.r_[x[0], x[1]] for i, x in F['vjepa'].items()}, 'words': {i: np.r_[x[0], x[2][:1] * 3] for i, x in F['text'].items()},
     'sound': F['sound'], 'caption': {i: x[1] for i, x in F['text'].items()}}
MAIN = ['first', 'mean5', 'move', 'words', 'sound']
pairs, seen = [], set()
for s in ('ciftfilm3', 'ciftfilm', 'ciftfilm2'):
    for p in json.load(open(f'{L}/{s}/selection.json')):
        a, b = p['win']['id'], p['lose']['id']
        if (a, b) in seen or any(i not in B[k] for i in (a, b) for k in ('first', 'move')):
            continue
        seen.add((a, b))
        pairs.append((a, b, p['handle'].lower(), p['sector']))
ix = {(a, b): k for k, (a, b, _, _) in enumerate(pairs)}
H = np.array([p[2] for p in pairs])
cnt = collections.Counter(H)
W = np.array([1 / math.sqrt(cnt[h]) for h in H])
print('pairs', len(pairs), 'accounts', len(cnt))


def ans(d):
    K, o = json.load(open(d + '/key.json')), {}
    for f in sorted(glob.glob(d + '/blind/ans_g*.txt')):
        for ln in open(f):
            m = re.match(r'\s*(\d{3})\s+([AB])\s+([su])\b', ln)
            if m and m[1] in K:
                o[m[1]] = (m[2], m[3] == 's')
    return [((K[n]['win'], K[n]['lose']), 1 if o[n][0] == K[n]['ans'] else -1, o[n][1]) for n in o]


EX = ans(L + '/ciftfilm') + ans(L + '/ciftfilm2')
miss = [e for e in EX if e[0] not in ix]
EX = [e for e in EX if e[0] in ix]
E = np.array([ix[e[0]] for e in EX])
sg, su = np.array([e[1] for e in EX], float), np.array([e[2] for e in EX], bool)
print('exam pairs', len(EX), '(without numbers', len(miss), ') the bare reader right', int((sg > 0).sum()), '| sure', int(su.sum()), 'right', int((sg[su] > 0).sum()))


def kernel(names):
    K = torch.zeros(len(pairs), len(pairs), dtype=torch.float64, device=dev)
    for k in names:
        dim = len(next(iter(B[k].values())))
        ids = sorted(B[k])
        M = np.stack([B[k][i] for i in ids])
        mu, sd = M.mean(0), M.std(0) + 1e-6
        z = np.zeros(dim)
        D = np.stack([((B[k][a] - mu) / sd if a in B[k] else z) - ((B[k][b] - mu) / sd if b in B[k] else z) for a, b, _, _ in pairs])
        D = torch.tensor(D, dtype=torch.float64, device=dev)
        k_ = D @ D.T
        K += k_ / k_.diagonal().mean()
    return K / len(names)


def fit(K, w, lam, it=25):
    n = K.shape[0]
    f = torch.zeros(n, dtype=torch.float64, device=dev)
    for _ in range(it):
        s = torch.sigmoid(-f)
        h = (w * s * (1 - s)).clamp_min(1e-9)
        z = f + w * s / h
        a = torch.linalg.solve(K + lam * torch.diag(1 / h), z)
        g = K @ a
        if (g - f).abs().max() < 1e-6:
            f = g
            break
        f = g
    return a


LAMS = [0.01, 0.03, 0.1, 0.3, 1, 3, 10, 30]


def folds(hs, k, seed):
    u = np.array(sorted(set(hs)))
    np.random.RandomState(seed).shuffle(u)
    g = {h: i % k for i, h in enumerate(u)}
    return np.array([g[h] for h in hs])


def margins(K, seeds=(1, 2, 3), part=1.0):
    n = len(pairs)
    tot, used = torch.zeros(n, dtype=torch.float64, device=dev), []
    w = torch.tensor(W, dtype=torch.float64, device=dev)
    for sd in seeds:
        fo = folds(H, 10, sd)
        for k in range(10):
            tr = np.where(fo != k)[0]
            te = np.where(fo == k)[0]
            if part < 1:
                u = sorted(set(H[tr]))
                np.random.RandomState(100 + sd).shuffle(u)
                ok = set(u[:int(part * len(u))])
                tr = np.array([i for i in tr if H[i] in ok])
            inn = folds(H[tr], 5, sd + 50)
            best = (1e9, None)
            for lam in LAMS:
                ll = 0
                for j in range(5):
                    a_, b_ = tr[inn != j], tr[inn == j]
                    al = fit(K[a_][:, a_], w[a_], lam)
                    ll += float((w[b_] * torch.nn.functional.softplus(-(K[b_][:, a_] @ al))).sum())
                if ll < best[0]:
                    best = (ll, lam)
            used.append(best[1])
            al = fit(K[tr][:, tr], w[tr], best[1])
            tot[te] += K[te][:, tr] @ al
    return (tot / len(seeds)).cpu().numpy(), collections.Counter(used)


def ci(k, n):
    p, z = k / n, 1.96
    c = (p + z * z / (2 * n)) / (1 + z * z / n)
    h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / (1 + z * z / n)
    return f'{k}/{n} = {100 * p:.1f} [{100 * (c - h):.0f}-{100 * (c + h):.0f}]'


def lr(X, y=None, lam=0.5):
    X = torch.tensor(X, dtype=torch.float64)
    b = torch.zeros(X.shape[1], dtype=torch.float64)
    for _ in range(50):
        s = torch.sigmoid(-(X @ b))
        g = -(X.T @ s) + lam * b
        Hh = X.T @ (X * (s * (1 - s))[:, None]) + lam * torch.eye(X.shape[1], dtype=torch.float64)
        b = b - torch.linalg.solve(Hh, g)
    return b.numpy()


def together(m, seeds=range(5)):
    """the pair is written winner first, so every row's right answer is +; the reader's sign is + when it was right"""
    x = np.c_[sg, sg * su, m[E] / (np.std(m[E]) + 1e-9)]
    tot = np.zeros(len(E))
    for sd in seeds:
        p = np.random.RandomState(sd).permutation(len(E)) % 10
        for k in range(10):
            b = lr(x[p != k])
            tot[p == k] += x[p == k] @ b
    return tot / len(list(seeds)), lr(x)


def tell(name, m):
    e = m[E]
    t, b = together(m)
    r, c = (sg > 0), (t > 0)
    x, y = int((r & ~c).sum()), int((~r & c).sum())
    top = np.argsort(-abs(e))[:int(0.3 * len(e))]
    print(f'{name:28} all pairs out of fold {ci(int((m > 0).sum()), len(m))} | exam alone {ci(int((e > 0).sum()), len(e))} (surest 3 of 10: {ci(int((e[top] > 0).sum()), len(top))})'
          f' | where the reader is unsure {ci(int((e[~su] > 0).sum()), int((~su).sum()))} against its {int((sg[~su] > 0).sum())}'
          f' | together {ci(int(c.sum()), len(c))}: lost {x}, won {y}, z={(y - x) / math.sqrt(max(1, x + y)):+.1f} weights {np.round(b, 2)}', flush=True)
    return t


if __name__ == '__main__':
    K = kernel(MAIN)
    m, u = margins(K)
    print('lambda chosen', dict(u))
    t = tell('MAIN (five blocks)', m)
    json.dump({'pairs': [p[:3] for p in pairs], 'margin': m.tolist(), 'exam': [[*e[0], e[1], bool(e[2])] for e in EX], 'together': t.tolist()}, open(R + '/main.json', 'w'))
    if '--blocks' in sys.argv:
        for k in ('first', 'mean5', 'move', 'words', 'sound', 'caption'):
            tell('only ' + k, margins(kernel([k]), seeds=(1,))[0])
        tell('five blocks and caption', margins(kernel(MAIN + ['caption']), seeds=(1,))[0])
    if '--curve' in sys.argv:
        for part in (0.25, 0.5):
            tell(f'{int(100 * part)} of 100 accounts', margins(K, seeds=(1, 2), part=part)[0])
