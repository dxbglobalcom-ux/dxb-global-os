import json, os, sys, wave
import numpy as np
from faster_whisper import WhisperModel
D = os.path.expanduser('~/.local/share/dxb/hook-lab/ciftfilm')
sel = json.load(open(D + '/selection.json'))
try:
    model, dev = WhisperModel('small.en', device='cuda', compute_type='float16'), 'cuda'
except Exception:
    model, dev = WhisperModel('small.en', device='cpu', compute_type='int8'), 'cpu'
print('device', dev, flush=True)
n = 0
for p in sel:
    for k in ('win', 'lose'):
        a = p[k]['id']
        out, wav = f'{D}/txt/{a}.json', f'{D}/wav/{a}.wav'
        if os.path.exists(out) or not os.path.exists(wav):
            continue
        w = wave.open(wav)
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
        seg = []
        try:
            for s in model.transcribe(x, beam_size=5, vad_filter=True)[0]:
                if s.no_speech_prob < 0.6:
                    seg.append([round(s.start, 1), round(s.end, 1), s.text.strip()])
        except Exception as e:
            seg = [['ERR', str(e)[:80]]]
        json.dump(seg, open(out, 'w'), ensure_ascii=False)
        n += 1
print('SPEECH', n, flush=True)
