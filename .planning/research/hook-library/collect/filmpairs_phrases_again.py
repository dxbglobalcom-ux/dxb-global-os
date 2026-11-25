"""Replication, fixed on 25 November at 20:25 before the new films were turned into numbers: the phrases that stood out on the 1,317 pairs (first 3.5 s, |z| of 3 or more, both halves the same way) laid beside pairs never used before.
(a) pairs of accounts that are not among the 350; (b) other pairs of those accounts (other films, mostly before July 2026)."""
import json, os
import numpy as np, torch
from transformers import AutoModel, AutoTokenizer
L = os.path.expanduser('~/.local/share/dxb/hook-lab')
N = 'google/siglip2-so400m-patch14-384'
UP = ['something being squeezed', 'the inside of something cut open', 'a before and after comparison', 'the finished result of a piece of work', 'a half finished piece of work', 'the inside of a machine',
      'a person cleaning something dirty', 'mould', 'a prank', 'a person restoring an old object']
DOWN = ['a selfie', 'a mirror reflection', 'a baby', 'a close-up of a face looking at the camera']
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
old_acc, old_films, old_pairs = set(), set(), set()
for s in ('ciftfilm', 'ciftfilm2', 'ciftfilm3'):
    for p in json.load(open(f'{L}/{s}/selection.json')):
        old_acc.add(p['handle'].lower())
        old_films |= {p['win']['id'], p['lose']['id']}
new = [(p['win']['id'], p['lose']['id'], p['handle'].lower(), p['sector']) for p in json.load(open(f'{L}/ciftfilm4/selection.json'))]
new = [p for p in new if p[0] in X and p[1] in X and p[0] not in old_films and p[1] not in old_films]
f = lambda x: x.mean(0)


def table(pairs):
    H = np.array([p[2] for p in pairs])
    u = sorted(set(H))
    D = np.stack([(f(X[a]) - f(X[b])) @ T.T for a, b, _, _ in pairs])
    S = np.concatenate([np.stack([f(X[a]) @ T.T for a, b, _, _ in pairs]), np.stack([f(X[b]) @ T.T for a, b, _, _ in pairs])]).std(0)
    D = D / S
    D = D - D.mean(1)[:, None]
    A = np.stack([D[H == h].mean(0) for h in u])
    return len(pairs), len(u), A.mean(0) / (A.std(0, ddof=1) / np.sqrt(len(A))), (A > 0).mean(0), A.mean(0), D


sets = {'a: accounts never used': [p for p in new if p[2] not in old_acc], 'b: other films of the 350': [p for p in new if p[2] in old_acc], 'all new pairs': new}
for name, pr in sets.items():
    n, k, z, up, me, D = table(pr)
    print(f'== {name}: {n} pairs, {k} accounts')
    for q, sign in [(x, 1) for x in UP] + [(x, -1) for x in DOWN]:
        j = P.index(q)
        print(f'   {"+" if sign > 0 else "-"} {q:45} z {z[j]:+.1f}  higher in {100 * up[j]:.0f} of 100 accounts, {100 * (D[:, j] > 0).mean():.0f} of 100 pairs  {"HOLDS" if sign * z[j] >= 1.65 else ("same way" if sign * z[j] > 0 else "TURNS")}')
n, k, z, up, me, D = table(new)
o = np.argsort(z)
print('== strongest among the new pairs, whatever was expected')
for j in list(o[::-1][:20]) + list(o[:20]):
    print(f'{z[j]:+5.1f}  accounts higher {100 * up[j]:.0f}  mean {me[j]:+.2f}  {P[j]}')
sec = {}
for p in new:
    sec.setdefault(p[3], []).append(p)
print('== by trade (new pairs): the sum of the ten up phrases minus the four down phrases, share of pairs where the film that went round has more of it')
for s, pr in sorted(sec.items(), key=lambda x: -len(x[1])):
    if len(pr) >= 60:
        _, k, z, up, me, D = table(pr)
        q = D[:, [P.index(x) for x in UP]].mean(1) - D[:, [P.index(x) for x in DOWN]].mean(1)
        print(f'   {s:16} {len(pr):4} pairs {k:3} accounts: {100 * (q > 0).mean():.0f} of 100')
