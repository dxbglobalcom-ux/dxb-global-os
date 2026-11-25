"""The same question with four times the pairs (written 25 November 20:30, before the new films were turned into numbers). Pictures and movement only (words, sound and caption told nothing on the 1,317 pairs).
Blocks: first frame, mean of five frames, movement; each standardised, 512 main directions, equal weight; pairwise logistic, pair weight 1/sqrt(pairs of the account), brake chosen by 5 folds inside the training accounts;
ten outer folds by account, two seeds. MAIN: on the 341 exam pairs alone and together with the reader (bar 245)."""
import collections, glob, json, math, os, re, sys
import numpy as np, torch
sys.argv = ['x']
L = os.path.expanduser('~/.local/share/dxb/hook-lab')
R = L + '/ranker'
src = open(R + '/rank.py').read()
SETS = ('ciftfilm', 'ciftfilm2', 'ciftfilm3', 'ciftfilm4')
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


S, V = load('siglip'), load('vjepa')
B = {'first': {i: x[0] for i, x in S.items()}, 'mean5': {i: x.mean(0) for i, x in S.items()}, 'move': {i: np.r_[x[0], x[1]] for i, x in V.items()}}
pairs, seen, origin = [], set(), []
for s in ('ciftfilm3', 'ciftfilm', 'ciftfilm2', 'ciftfilm4'):
    for p in json.load(open(f'{L}/{s}/selection.json')):
        a, b = p['win']['id'], p['lose']['id']
        if (a, b) in seen or any(i not in B[k] for i in (a, b) for k in B):
            continue
        seen.add((a, b))
        pairs.append((a, b, p['handle'].lower(), p['sector']))
        origin.append(s)
origin = np.array(origin)
ix = {(a, b): k for k, (a, b, _, _) in enumerate(pairs)}
H = np.array([p[2] for p in pairs])
cnt = collections.Counter(H)
W = torch.tensor([1 / math.sqrt(cnt[h]) for h in H], dtype=torch.float32, device=dev)
print('pairs', len(pairs), collections.Counter(origin), 'accounts', len(cnt), flush=True)


def block(k, d=512):
    ids = sorted(B[k])
    M = torch.tensor(np.stack([B[k][i] for i in ids]), dtype=torch.float32, device=dev)
    M = (M - M.mean(0)) / (M.std(0) + 1e-6)
    q = min(d, M.shape[1])
    U, sv, Vt = torch.linalg.svd(M.double(), full_matrices=False)
    Z = (M.double() @ Vt[:q].T).float()
    pos = {i: n for n, i in enumerate(ids)}
    A = torch.tensor([pos[p[0]] for p in pairs], device=dev)
    C = torch.tensor([pos[p[1]] for p in pairs], device=dev)
    D = Z[A] - Z[C]
    D = D / D.pow(2).sum(1).mean().sqrt()
    print(k, 'kept variance', round(float((sv[:q] ** 2).sum() / (sv ** 2).sum()), 3), flush=True)
    return D


def fit(X, w, lam, it=12):
    d = X.shape[1]
    b = torch.zeros(d, device=dev)
    I = torch.eye(d, device=dev)
    for _ in range(it):
        s = torch.sigmoid(-(X @ b))
        g = -(X.T @ (w * s)) + lam * b
        Hh = (X * (w * s * (1 - s))[:, None]).T @ X + lam * I
        st = torch.linalg.solve(Hh, g)
        b = b - st
        if st.abs().max() < 1e-4:
            break
    return b


def folds(hs, k, seed):
    u = np.array(sorted(set(hs)))
    np.random.RandomState(seed).shuffle(u)
    g = {h: i % k for i, h in enumerate(u)}
    return np.array([g[h] for h in hs])


LAMS = [0.03, 0.1, 0.3, 1, 3, 10]


def margins(X, seeds=(1, 2), part=1.0):
    n = len(pairs)
    tot, used = torch.zeros(n, device=dev), []
    for sd in seeds:
        fo = folds(H, 10, sd)
        for k in range(10):
            tr, te = np.where(fo != k)[0], np.where(fo == k)[0]
            if part < 1:
                u = sorted(set(H[tr]))
                np.random.RandomState(100 + sd).shuffle(u)
                ok = set(u[:int(part * len(u))])
                tr = np.array([i for i in tr if H[i] in ok])
            inn = folds(H[tr], 5, sd + 50)
            best = (1e18, None)
            for lam in LAMS:
                ll = 0
                for j in range(5):
                    a_, b_ = tr[inn != j], tr[inn == j]
                    be = fit(X[a_], W[a_], lam)
                    ll += float((W[b_] * torch.nn.functional.softplus(-(X[b_] @ be))).sum())
                if ll < best[0]:
                    best = (ll, lam)
            used.append(best[1])
            tot[te] += X[te] @ fit(X[tr], W[tr], best[1])
    return (tot / len(seeds)).cpu().numpy(), collections.Counter(used)


def ans(d):
    K, o = json.load(open(d + '/key.json')), {}
    for f in sorted(glob.glob(d + '/blind/ans_g*.txt')):
        for ln in open(f):
            m = re.match(r'\s*(\d{3})\s+([AB])\s+([su])\b', ln)
            if m and m[1] in K:
                o[m[1]] = (m[2], m[3] == 's')
    return [((K[n]['win'], K[n]['lose']), 1 if o[n][0] == K[n]['ans'] else -1, o[n][1]) for n in o]


EX = [e for e in ans(L + '/ciftfilm') + ans(L + '/ciftfilm2') if e[0] in ix]
E = np.array([ix[e[0]] for e in EX])
sg, su = np.array([e[1] for e in EX], float), np.array([e[2] for e in EX], bool)


def ci(k, n):
    p, z = k / n, 1.96
    c = (p + z * z / (2 * n)) / (1 + z * z / n)
    h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / (1 + z * z / n)
    return f'{k:.0f}/{n} = {100 * p:.1f} [{100 * (c - h):.0f}-{100 * (c + h):.0f}]'


right = lambda m: float((m > 0).sum() + 0.5 * (m == 0).sum())      # a tie counts half


def lr(X, lam=0.5):
    b = np.zeros(X.shape[1])
    for _ in range(50):
        s = 1 / (1 + np.exp(X @ b))
        b = b - np.linalg.solve(X.T @ (X * (s * (1 - s))[:, None]) + lam * np.eye(X.shape[1]), -(X.T @ s) + lam * b)
    return b


def together(m):
    x = np.c_[sg, sg * su, m[E] / (np.std(m[E]) + 1e-9)]
    tot = np.zeros(len(E))
    for sd in range(5):
        p = np.random.RandomState(sd).permutation(len(E)) % 10
        for k in range(10):
            tot[p == k] += x[p == k] @ lr(x[p != k])
    return tot / 5, lr(x)


def tell(name, m):
    e = m[E]
    t, b = together(m)
    r, c = (sg > 0), (t > 0)
    x, y = int((r & ~c).sum()), int((~r & c).sum())
    top = np.argsort(-abs(e))[:int(0.3 * len(e))]
    o3 = origin != 'ciftfilm4'
    print(f'{name:22} set 3 out of fold {ci(right(m[o3]), int(o3.sum()))} | new pairs {ci(right(m[~o3]), int((~o3).sum()))} | exam alone {ci(right(e), len(e))} (surest 3 of 10 {ci(right(e[top]), len(top))}) | together {ci(int(c.sum()), len(c))}: lost {x}, won {y}, z={(y - x) / math.sqrt(max(1, x + y)):+.1f} weights {np.round(b, 2)}', flush=True)


D = {k: block(k) for k in B}
X = torch.cat([D[k] for k in B], 1)
m, u = margins(X)
print('brake chosen', dict(u))
tell('MAIN, all pairs', m)
json.dump({'pairs': [p[:3] for p in pairs], 'origin': origin.tolist(), 'margin': m.tolist()}, open(R + '/big.json', 'w'))
for part in (0.25, 0.5):
    tell(f'{int(100 * part)} of 100 accounts', margins(X, seeds=(1,), part=part)[0])
for k in B:
    tell('only ' + k, margins(D[k], seeds=(1,))[0])
