"""Plain measures of the first seconds, by code: how much moves, cuts, loudness, when the words begin, how many, length of the film. Winner beside loser.
usage: <venv python> -I code_feat.py <ciftfilm|ciftfilm2>"""
import json, math, os, subprocess, sys, wave
from concurrent.futures import ThreadPoolExecutor
import numpy as np
D = os.path.expanduser('~/.local/share/dxb/hook-lab/' + sys.argv[1])
K = json.load(open(D + '/key.json'))
sel = {p['n']: p for p in json.load(open(D + '/selection.json'))}
W, H = 72, 128


def feat(i):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{D}/vid/{i}.mp4', '-t', '3.6', '-vf', f'fps=10,scale={W}:{H},format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
    a = np.frombuffer(r, dtype=np.uint8)
    n = len(a) // (W * H)
    a = a[:n * W * H].reshape(n, H, W).astype(np.float32)
    d = np.abs(np.diff(a, axis=0)).mean(axis=(1, 2)) if n > 1 else np.zeros(1)
    f = {'move_05': float(d[:5].mean()), 'move_1': float(d[:10].mean()), 'move_3': float(d[:30].mean()), 'cuts_2': int((d[:20] > 28).sum()), 'cuts_35': int((d[:35] > 28).sum()),
         'contrast0': float(a[0].std()) if n else 0.0, 'light0': float(a[0].mean()) if n else 0.0}
    try:
        w = wave.open(f'{D}/wav/{i}.wav')
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
        f['loud_05'] = float(20 * math.log10(max(1e-5, np.sqrt((x[:8000] ** 2).mean()))))
        f['loud_3'] = float(20 * math.log10(max(1e-5, np.sqrt((x[:48000] ** 2).mean()))))
    except Exception:
        f['loud_05'] = f['loud_3'] = -100.0
    try:
        s = [z for z in json.load(open(f'{D}/txt/{i}.json')) if isinstance(z[0], (int, float))]
    except Exception:
        s = []
    f['speech_at'] = s[0][0] if s else 9.0
    f['words_5'] = sum(len(str(z[2]).split()) for z in s if z[0] < 5)
    return f


ids = [i for v in K.values() for i in (v['win'], v['lose'])]
with ThreadPoolExecutor(8) as ex:
    F = dict(zip(ids, ex.map(feat, ids)))
for n, v in K.items():
    for k in ('win', 'lose'):
        F[v[k]]['duration'] = sel[n][k]['duration']
        F[v[k]]['hour'] = (sel[n][k]['timestamp'] // 3600) % 24
json.dump(F, open(D + '/code_feat.json', 'w'))
print('pairs', len(K))
for m in F[ids[0]]:
    a = np.array([F[v['win']][m] for v in K.values()], dtype=float)
    b = np.array([F[v['lose']][m] for v in K.values()], dtype=float)
    more, less = int((a > b).sum()), int((a < b).sum())
    z = (more - less) / math.sqrt(max(1, more + less))
    print(f'{m:10} winner median {np.median(a):7.2f} loser {np.median(b):7.2f} | winner higher in {more}, lower in {less} pairs  z={z:+.1f}')
