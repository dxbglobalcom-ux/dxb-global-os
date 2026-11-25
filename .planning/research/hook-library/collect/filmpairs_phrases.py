"""What the first picture shows: 1,317 pairs, the film that went round against the same account's ordinary one. Each phrase is laid beside every first picture by SigLIP 2; the difference is taken inside the pair,
averaged inside the account, then over the accounts (z). Two halves of the accounts drawn by lot, both told. Nothing is trained."""
import json, os, sys
import numpy as np, torch
from transformers import AutoModel, AutoTokenizer
L = os.path.expanduser('~/.local/share/dxb/hook-lab')
N = 'google/siglip2-so400m-patch14-384'
P = [x.strip() for x in open(L + '/ranker/phrases.txt') if x.strip()]
tok = AutoTokenizer.from_pretrained(N, local_files_only=True)
m = AutoModel.from_pretrained(N, dtype=torch.float16, local_files_only=True).to('cuda').eval()
T = []
with torch.no_grad():
    for k in range(0, len(P), 32):
        b = tok(['This is a photo of ' + p + '.' for p in P[k:k + 32]], padding='max_length', max_length=64, truncation=True, return_tensors='pt').to('cuda')
        o = m.get_text_features(**{k_: v for k_, v in b.items() if k_ in ('input_ids', 'attention_mask')})
        o = o if torch.is_tensor(o) else o.pooler_output
        T.append(o.float().cpu().numpy())
T = np.concatenate(T)
T /= np.linalg.norm(T, axis=1, keepdims=True)
X = {}
for s in ('ciftfilm', 'ciftfilm2', 'ciftfilm3', 'ciftfilm4'):
    f = f'{L}/ranker/{s}_siglip.npz'
    if os.path.exists(f):
        z = np.load(f)
        for i, x in zip(z['ids'], z['X']):
            X.setdefault(str(i), x / np.linalg.norm(x, axis=1, keepdims=True))
pairs, seen = [], set()
for s in sys.argv[1].split(','):
    for p in json.load(open(f'{L}/{s}/selection.json')):
        a, b = p['win']['id'], p['lose']['id']
        if a in X and b in X and (a, b) not in seen:
            seen.add((a, b))
            pairs.append((a, b, p['handle'].lower(), p['sector']))
H = np.array([p[2] for p in pairs])
u = np.array(sorted(set(H)))
np.random.RandomState(7).shuffle(u)
half = {h: i % 2 for i, h in enumerate(u)}
print(len(pairs), 'pairs', len(u), 'accounts', len(P), 'phrases')
for name, f in (('first picture', lambda x: x[0]), ('first 3.5 s', lambda x: x.mean(0))):
    D = np.stack([(f(X[a]) - f(X[b])) @ T.T for a, b, _, _ in pairs])
    S = np.concatenate([np.stack([f(X[a]) @ T.T for a, b, _, _ in pairs]), np.stack([f(X[b]) @ T.T for a, b, _, _ in pairs])]).std(0)
    D = D / S
    c = D.mean(1)                      # what all phrases share (how much the picture looks like anything that has a name)
    D = D - c[:, None]
    A = np.stack([D[H == h].mean(0) for h in u])
    g = np.array([half[h] for h in u])
    C = np.array([c[H == h].mean() for h in u])
    z1d = lambda v: v.mean() / (v.std(ddof=1) / np.sqrt(len(v)))
    print('== common part (like anything with a name): z %+.1f halves %+.1f %+.1f, higher in %.0f of 100 accounts' % (z1d(C), z1d(C[g == 0]), z1d(C[g == 1]), 100 * (C > 0).mean()))
    z = lambda M: M.mean(0) / (M.std(0, ddof=1) / np.sqrt(len(M)))
    za, z0, z1 = z(A), z(A[g == 0]), z(A[g == 1])
    up = (A > 0).mean(0)
    o = np.argsort(za)
    print('==', name)
    for k in list(o[::-1][:22]) + list(o[:22]):
        print(f'{za[k]:+5.1f}  halves {z0[k]:+4.1f} {z1[k]:+4.1f}  accounts higher {100 * up[k]:.0f} of 100  mean {A[:, k].mean():+.2f} sd  {P[k]}')
