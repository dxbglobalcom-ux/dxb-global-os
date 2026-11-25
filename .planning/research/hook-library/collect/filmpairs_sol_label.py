"""GPT-6.2 Sol labels every film alone (strips, ten a call). usage: python3 -I sol_label.py <ciftfilm|ciftfilm2> <effort> [workers] [max calls]"""
import json, os, re, subprocess, sys, threading
from concurrent.futures import ThreadPoolExecutor
L = os.path.expanduser('~/.local/share/dxb/hook-lab')
D, eff = f'{L}/{sys.argv[1]}', sys.argv[2]
wk = int(sys.argv[3]) if len(sys.argv) > 3 else 2
lim = int(sys.argv[4]) if len(sys.argv) > 4 else 999
os.makedirs(D + '/sol/empty', exist_ok=True)
S = json.load(open(D + '/key_solo.json'))
CODES = open(f'{L}/ciftfilm/CODES.txt').read()
out = f'{D}/sol/lab.txt'
done = set(re.findall(r'^(\d{3})', open(out).read(), re.M)) if os.path.exists(out) else set()
todo = [n for n in sorted(S) if n not in done]
lock = threading.Lock()


def call(g):
    lines = '\n'.join(f"picture {i + 1} = film {n} | trade: {S[n]['trade'].replace('_', ' ')} | says: {S[n]['words'][:240] or '(no words)'}" for i, n in enumerate(g))
    prompt = ("A blind measurement. Run no command and open no file: everything is in the attached pictures and in this text. Each picture is ONE short film of a small business or maker: five frames, left to right, at 0, 0.5, 1, 2 "
              "and 3.5 seconds; the words said in the first five seconds are given (machine transcript, it may be wrong). The films come from many accounts in an order by lot; some went round, some did not. You are not told which. "
              "Judge each film alone, from these seconds only. For each film write one line: the film's number, then the codes that are TRUE separated by spaces, then a whole number 0-100: the chance that a stranger who scrolls by "
              "stops and stays (use the whole range).\n" + CODES + "\n" + lines + "\nAnswer with one line per film and nothing else, like: `017 T M W1 X U 62`.")
    last = f'{D}/sol/last_{g[0]}.txt'
    args = ['codex', '-p', 'refuter', '-c', f'model_reasoning_effort="{eff}"', '-m', 'gpt-6.2-sol', '-C', D + '/sol/empty', 'exec', '--skip-git-repo-check', '-o', last]
    for n in g:
        args += ['-i', f"{D}/solo/{n}.jpg"]
    try:
        p = subprocess.run(args + ['--', prompt], capture_output=True, text=True, timeout=900, stdin=subprocess.DEVNULL)
    except subprocess.TimeoutExpired:
        return g[0], 0, 'timeout'
    t = open(last).read() if os.path.exists(last) else ''
    got = [m for m in re.findall(r'^\s*`?(\d{3})\s+([A-Z0-9 ,]+?)\s+(\d{1,3})`?\s*$', t, re.M) if m[0] in g]
    with lock, open(out, 'a') as f:
        for m in got:
            f.write(f'{m[0]} {m[1].replace(",", " ")} {m[2]}\n')
    return g[0], len(got), '' if got else p.stderr[-200:]


B = [todo[i:i + 10] for i in range(0, len(todo), 10)][:lim]
bad = 0
with ThreadPoolExecutor(wk) as ex:
    for r in ex.map(call, B):
        print(r, flush=True)
print('LABEL DONE', flush=True)
