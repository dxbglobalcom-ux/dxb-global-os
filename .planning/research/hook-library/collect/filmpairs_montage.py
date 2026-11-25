"""One picture per pair: A's five frames on top, B's below (0, 0.5, 1, 2, 3.5 s); the words said in the first 5 s go into words.json; key.json holds the answer."""
import json, os, subprocess
from concurrent.futures import ThreadPoolExecutor
D = os.path.expanduser('~/.local/share/dxb/hook-lab/ciftfilm')
os.makedirs(f'{D}/pair', exist_ok=True)
sel = json.load(open(D + '/selection.json'))
T = (0.0, 0.5, 1.0, 2.0, 3.5)


def words(a):
    try:
        s = json.load(open(f'{D}/txt/{a}.json'))
    except Exception:
        return ''
    return ' '.join(str(x[2]) for x in s if len(x) == 3 and isinstance(x[0], (int, float)) and x[0] < 5.0)


def one(p):
    a = p[p['left']]['id']
    b = p['lose' if p['left'] == 'win' else 'win']['id']
    if not all(os.path.exists(f'{D}/vid/{i}.mp4') for i in (a, b)):
        return None
    args = ['ffmpeg', '-v', 'error', '-y']
    for i in (a, b):
        for t in T:
            args += ['-ss', f'{t:.2f}', '-i', f'{D}/vid/{i}.mp4']
    fc = ''.join(f'[{i}:v]scale=270:480:force_original_aspect_ratio=decrease,pad=270:480:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1[v{i}];' for i in range(10))
    lay = '|'.join(f'{270 * (i % 5)}_{0 if i < 5 else 500}' for i in range(10))
    fc += ''.join(f'[v{i}]' for i in range(10)) + f'xstack=inputs=10:layout={lay}:fill=white[o]'
    out = f"{D}/pair/{p['n']}.jpg"
    q = subprocess.run(args + ['-filter_complex', fc, '-map', '[o]', '-frames:v', '1', '-q:v', '3', out], capture_output=True, text=True)
    if not os.path.exists(out):
        return 'ERR ' + p['n'] + q.stderr[-200:]
    return {'n': p['n'], 'trade': p['sector'], 'A': words(a), 'B': words(b), 'ans': 'A' if p['left'] == 'win' else 'B', 'win': p['win']['id'], 'lose': p['lose']['id'], 'handle': p['handle']}


with ThreadPoolExecutor(4) as ex:
    R = list(ex.map(one, sel))
bad = [r for r in R if isinstance(r, str)]
R = [r for r in R if isinstance(r, dict)]
json.dump([{k: r[k] for k in ('n', 'trade', 'A', 'B')} for r in R], open(f'{D}/words.json', 'w'), ensure_ascii=False, indent=0)
json.dump({r['n']: {k: r[k] for k in ('ans', 'win', 'lose', 'handle', 'trade')} for r in R}, open(f'{D}/key.json', 'w'), indent=0)
print('PAIRS', len(R), 'bad', bad[:3], 'missing', len(sel) - len(R) - len(bad))
