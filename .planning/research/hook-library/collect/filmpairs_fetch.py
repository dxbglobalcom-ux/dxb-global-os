import json, os, subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed
D = os.path.expanduser('~/.local/share/dxb/hook-lab/ciftfilm')
for x in ('full', 'vid', 'sheet', 'txt', 'wav'):
    os.makedirs(f'{D}/{x}', exist_ok=True)
sel = json.load(open(D + '/selection.json'))
jobs = [(p['handle'], p[k]['id']) for p in sel for k in ('win', 'lose')]


def one(j):
    h, a = j
    clip, full, wav = f'{D}/vid/{a}.mp4', f'{D}/full/{a}.mp4', f'{D}/wav/{a}.wav'
    err = ''
    if not os.path.exists(clip):
        for k in range(2):
            p = subprocess.run(['/home/dxb/.local/bin/yt-dlp', '-q', '--no-warnings', '--no-playlist', '-S', 'res:720,ext:mp4:m4a', '--merge-output-format', 'mp4', '--max-filesize', '60M',
                                '-o', full, f'https://www.tiktok.com/@{h}/video/{a}'], capture_output=True, text=True, timeout=240)
            err = p.stderr.strip()[-120:]
            if os.path.exists(full):
                break
        else:
            return f'ERR {a} {err}'
        q = subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', full, '-t', '7', '-vf', 'scale=540:-2', '-r', '30', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '24', '-c:a', 'aac', '-b:a', '96k',
                            '-movflags', '+faststart', clip], capture_output=True, text=True)
        if not os.path.exists(clip) or os.path.getsize(clip) < 5000:
            return f'ERR {a} clip {q.stderr[-100:]}'
        os.remove(full)
    if not os.path.exists(wav):
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', clip, '-t', '6', '-ac', '1', '-ar', '16000', wav], capture_output=True)
    return 'ok ' + a


ok = 0
with ThreadPoolExecutor(4) as ex:
    for k, fu in enumerate(as_completed([ex.submit(one, j) for j in jobs]), 1):
        try:
            m = fu.result()
        except Exception as e:
            m = 'ERR ' + str(e)[:120]
        ok += m.startswith('ok')
        if not m.startswith('ok') or k % 60 == 0:
            print(k, m, flush=True)
print('FETCH ok', ok, 'of', len(jobs), flush=True)
