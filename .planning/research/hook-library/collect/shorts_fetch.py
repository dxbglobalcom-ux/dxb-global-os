import json, os, subprocess, sys, time
from concurrent.futures import ThreadPoolExecutor, as_completed
D = '/home/dxb/.local/share/dxb/hook-lab/yt'
for x in ('vid', 'sheet', 'txt', 'wav'):
    os.makedirs(f'{D}/{x}', exist_ok=True)
sel = json.load(open(D + '/selection.json'))


def one(r):
    a, mp4 = r['ad_id'], f"{D}/vid/{r['ad_id']}.mp4"
    if not os.path.exists(mp4):
        p = subprocess.run(['/home/dxb/.local/bin/yt-dlp', '-q', '--no-warnings', '--no-playlist', '-S', 'res:720,ext:mp4:m4a', '--merge-output-format', 'mp4', '--max-filesize', '60M',
                            '-o', mp4, f"https://www.youtube.com/watch?v={r['id']}"], capture_output=True, text=True, timeout=240)
        if not os.path.exists(mp4):
            return f"ERR {a} {p.stderr.strip()[-160:]}"
    wav = f'{D}/wav/{a}.wav'
    if not os.path.exists(wav):
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', mp4, '-t', '25', '-ac', '1', '-ar', '16000', wav], capture_output=True)
    return 'ok ' + a


ok = 0
with ThreadPoolExecutor(4) as ex:
    for k, fu in enumerate(as_completed([ex.submit(one, r) for r in sel]), 1):
        try:
            m = fu.result()
        except Exception as e:
            m = 'ERR ' + str(e)[:120]
        ok += m.startswith('ok')
        if not m.startswith('ok') or k % 40 == 0:
            print(k, m, flush=True)
print('YT FETCH ok', ok, 'of', len(sel), flush=True)
