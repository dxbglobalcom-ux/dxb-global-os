import json, os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
D = sys.argv[1]
ids = [x[:-4] for x in os.listdir(D + '/vid') if x.endswith('.mp4')]
miss = [a for a in ids if not os.path.exists(f'{D}/sheet/{a}.jpg') or os.path.getsize(f'{D}/sheet/{a}.jpg') < 2000]


def one(a):
    mp4, sheet = f'{D}/vid/{a}.mp4', f'{D}/sheet/{a}.jpg'
    d = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp4], capture_output=True, text=True).stdout.strip()
    try:
        dur = float(d)
    except ValueError:
        return a, 'no duration ' + d
    T = [min(t, max(0.0, dur - 0.15)) for t in (0.0, 0.4, 0.8, 1.2, 1.8, 2.4, 3.0, 4.0)]
    n = 8
    args = ['ffmpeg', '-v', 'error', '-y']
    for t in T:
        args += ['-ss', f'{t:.2f}', '-i', mp4]
    fc = ''.join(f'[{i}:v]scale=320:568:force_original_aspect_ratio=decrease,pad=320:568:(ow-iw)/2:(oh-ih)/2,setsar=1[v{i}];' for i in range(n))
    fc += ''.join(f'[v{i}]' for i in range(n)) + f'xstack=inputs={n}:layout=0_0|320_0|640_0|960_0|0_568|320_568|640_568|960_568[o]'
    p = subprocess.run(args + ['-filter_complex', fc, '-map', '[o]', '-frames:v', '1', '-q:v', '4', sheet], capture_output=True, text=True)
    return a, dur, p.stderr[:120], os.path.exists(sheet)


with ThreadPoolExecutor(4) as ex:
    for r in ex.map(one, miss):
        print(r)
print('missing sheets', len(miss))
