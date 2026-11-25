import json, os, numpy as np, torch, collections
from transformers import AutoModel, AutoTokenizer
L = os.path.expanduser('~/.local/share/dxb/hook-lab')
src = open(L + '/ranker/concepts_new.py').read()
exec(compile(src.split("sets = {")[0], 'c', 'exec'))
n, k, z, up, me, D = table(new)
q = D[:, [P.index(x) for x in UP]].mean(1) - D[:, [P.index(x) for x in DOWN]].mean(1)
H = np.array([p[2] for p in new])
acc = np.array([q[H == h].mean() for h in sorted(set(H))])
print('new pairs', n, 'winner has more of it in', int((q > 0).sum()), '=', round(100 * (q > 0).mean(), 1), 'accounts', len(acc), 'z', round(acc.mean() / (acc.std(ddof=1) / np.sqrt(len(acc))), 1))
a = [p for p in new if p[2] not in old_acc]
m = np.array([p[2] not in old_acc for p in new])
print('accounts never used', int(m.sum()), round(100 * (q[m] > 0).mean(), 1))
t = np.argsort(-abs(q))[:n // 10]
print('the tenth with the largest difference', len(t), round(100 * (q[t] > 0).mean(), 1))
work = ['home_services', 'food', 'automotive', 'home_furniture']; person = ['beauty', 'fashion', 'fitness']
for name, g in (('work trades', work), ('person trades', person)):
    w = np.array([p[3] in g for p in new])
    print(name, int(w.sum()), int((q[w] > 0).sum()), round(100 * (q[w] > 0).mean(), 1))
