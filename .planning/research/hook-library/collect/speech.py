"""Transcribes the first 25 seconds of every ad and writes one text card per ad: its measures, its caption, its speech."""
import json, os, sys, wave
import numpy as np
from faster_whisper import WhisperModel

D = sys.argv[1]  # a folder holding selection.json, wav/, txt/
sel = json.load(open(D + '/selection.json'))
try:
    model = WhisperModel('small.en', device='cuda', compute_type='float16')
    model.transcribe(np.zeros(16000, dtype=np.float32))[0].__iter__().__next__() if False else None
    dev = 'cuda'
except Exception:
    model = WhisperModel('small.en', device='cpu', compute_type='int8')
    dev = 'cpu'
print('device', dev, flush=True)


def run(a):
    global model, dev
    try:
        return [(round(s.start, 1), round(s.end, 1), s.text.strip()) for s in model.transcribe(a, beam_size=5)[0]]
    except Exception:
        if dev == 'cuda':
            model = WhisperModel('small.en', device='cpu', compute_type='int8')
            dev = 'cpu'
            return [(round(s.start, 1), round(s.end, 1), s.text.strip()) for s in model.transcribe(a, beam_size=5)[0]]
        raise


n = 0
for r in sel:
    a = r['ad_id']
    out = f'{D}/txt/{a}.txt'
    if os.path.exists(out):
        continue
    wav = f'{D}/wav/{a}.wav'
    seg = []
    if os.path.exists(wav):
        w = wave.open(wav)
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
        if len(x) > 4000:
            seg = run(x)
    with open(out, 'w') as f:
        f.write(r['card'] if 'card' in r else json.dumps({k: v for k, v in r.items()}, ensure_ascii=False))
        f.write('\n\nSPEECH (machine transcript, seconds):\n')
        for s, e, t in seg:
            f.write(f'[{s}-{e}] {t}\n')
        if not seg:
            f.write('(no speech heard)\n')
    n += 1
    if n % 50 == 0:
        print('speech', n, flush=True)
print('SPEECH DONE', n, flush=True)
