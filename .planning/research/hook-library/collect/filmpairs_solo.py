"""Every film of the pairs alone, five frames in one strip, in an order by lot: films of one pair never in the same list."""
import json, os, random, subprocess
from concurrent.futures import ThreadPoolExecutor
D = os.path.expanduser('~/.local/share/dxb/hook-lab/ciftfilm')
B = D + '/solo'
os.makedirs(B, exist_ok=True)
K = json.load(open(D + '/key.json'))
W = {r['n']: r for r in json.load(open(D + '/words.json'))}
R = random.Random(4242)
G = [[], [], []]
for k, n in enumerate(sorted(K)):
    v = K[n]
    a, b = (v['win'], v['lose']) if v['ans'] == 'A' else (v['lose'], v['win'])
    f = [{'id': a, 'pair': n, 'side': 'A', 'trade': v['trade'], 'words': W[n]['A']}, {'id': b, 'pair': n, 'side': 'B', 'trade': v['trade'], 'words': W[n]['B']}]
    R.shuffle(f)
    i = k % 3
    G[i].append(f[0])
    G[(i + 1) % 3].append(f[1])
T = (0.0, 0.5, 1.0, 2.0, 3.5)
key, num = {}, 0
jobs = []
for g, L in enumerate(G, 1):
    R.shuffle(L)
    with open(f'{B}/s{g}.txt', 'w') as fo:
        for f in L:
            num += 1
            f['num'] = f'{num:03d}'
            key[f['num']] = f
            jobs.append(f)
            fo.write(f"{f['num']} | trade: {f['trade'].replace('_', ' ')} | says: {f['words'][:240] or '(no words)'}\n")
json.dump(key, open(D + '/key_solo.json', 'w'), indent=0)


def one(f):
    args = ['ffmpeg', '-v', 'error', '-y']
    for t in T:
        args += ['-ss', f'{t:.2f}', '-i', f"{D}/vid/{f['id']}.mp4"]
    fc = ''.join(f'[{i}:v]scale=270:480:force_original_aspect_ratio=decrease,pad=270:480:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1[v{i}];' for i in range(5))
    fc += ''.join(f'[v{i}]' for i in range(5)) + 'xstack=inputs=5:layout=0_0|270_0|540_0|810_0|1080_0[o]'
    subprocess.run(args + ['-filter_complex', fc, '-map', '[o]', '-frames:v', '1', '-q:v', '3', f"{B}/{f['num']}.jpg"], capture_output=True)
    return os.path.exists(f"{B}/{f['num']}.jpg")


with ThreadPoolExecutor(6) as ex:
    print('strips', sum(ex.map(one, jobs)), 'of', len(jobs), [len(g) for g in G])
open(B + '/BRIEF.md', 'w').write("""# What stands in the first seconds of a film, and would a stranger stop? (a blind measurement, 25 November 2026)

Each picture `NNN.jpg` in this folder is ONE short film of a small business or maker: five frames, left to right, at 0, 0.5, 1, 2 and 3.5 seconds. Your list `s<k>.txt` gives the trade and the words said in the first five seconds
(machine transcript, it may be wrong). Films come from many accounts, in an order by lot; some went round, some did not. You are not told which. Judge each film alone, from these seconds only.

For each film write one line: `NNN <codes> <score>`; the codes that are TRUE, separated by spaces, then a whole number 0-100: the chance that a stranger who scrolls by stops and stays.
T  the thing itself (product, work, place, animal, food, body part) fills most of the first frame; not a talking face
F  a face that talks to the camera within the first second
M  something is already moving or half done within the first second (frames 0, 0.5 and 1 show an action, not only a head or a hand waving)
X  something strange, huge, tiny, extreme, never seen, or two things that do not belong together, within the first second
Q  a question is left open by the picture or the words: what is this, will it hold, what is under it, what happens next, what does it cost
W0 / W1 / W2  words on the screen within the first second: none / up to six words / more than six (write exactly one of the three)
P  the words (said or shown) promise the viewer a use: how to, a tip, what to do, what to avoid
S  the words begin a story of somebody or of an event (a customer, a father, "POV", "the day I…")
C  two things set against each other: before and after, wrong and right, cheap and dear, then and now, you and they
E  a strong feeling is to be seen or is called up: fear, disgust, laughter, awe, tenderness, anger
R  danger, breaking, mess, a mistake, loss
N  a number or a price is said or shown
Y  the words name a kind of person or their trouble ("if you have…", "runners", "dog owners")
G  it begins with a greeting, a name, a logo or an introduction
K  the scene changes within the first two seconds (another place, another shot)

Work: Read the list, then Read the pictures, eight in one message in parallel, until your list is done. Look at nothing else on this machine (no other file, no web). Use the whole range of the score; spread the films.
Write `lab_s<k>.txt` in this folder, one line per film, every number of your list once. Final message: one line, how many.
""")
