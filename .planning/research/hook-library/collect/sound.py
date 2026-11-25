"""What is HEARD in the first three seconds of the watched films: when the first word falls (Silero voice detector), from when there is sound at all, the sharpest
rise of loudness. It cannot tell music from the sound of the work. Reads <folder>/wav/<id>.wav (16 kHz mono), writes <folder>/sound.jsonl.

usage: <hook-lab>/venv/bin/python -I sound.py <folder> [<folder> …]      (HF_HUB_OFFLINE=1; needs faster_whisper for its voice detector)
"""
import glob
import json
import os
import sys
import wave

import numpy as np
from faster_whisper.vad import VadOptions, get_speech_timestamps

OPT = VadOptions(threshold=0.5, min_speech_duration_ms=150, min_silence_duration_ms=200, speech_pad_ms=0)
R = 16000


def db(x):
    return 20 * np.log10(max(1e-5, float(np.sqrt(np.mean(x * x))))) if len(x) else -100.0


for D in sys.argv[1:]:
    n = 0
    with open(f'{D}/sound.jsonl', 'w', encoding='utf-8') as out:
        for p in sorted(glob.glob(f'{D}/wav/*.wav')):
            with wave.open(p) as w:
                if w.getframerate() != R:
                    continue
                a = np.frombuffer(w.readframes(6 * R), dtype=np.int16).astype(np.float32) / 32768
            if len(a) < R:
                continue
            sp = [(t['start'] / R, t['end'] / R) for t in get_speech_timestamps(a, OPT)]
            first = next((s for s, e in sp if s < 4), None)
            share = sum(max(0, min(3, e) - min(3, s)) for s, e in sp) / 3
            win = [db(a[int(i * 0.1 * R):int((i + 1) * 0.1 * R)]) for i in range(30)]
            heard = next((round(i * 0.1, 1) for i, v in enumerate(win) if v > -45), None)
            rise = [(win[i] - max(win[i - 1], -60), round(i * 0.1, 1)) for i in range(1, 30)]
            jump, at = max(rise)
            out.write(json.dumps({'ad_id': os.path.basename(p)[:-4], 'speech_from': None if first is None else round(first, 1), 'speech_share': round(share, 2),
                                  'sound_from': heard, 'jump_db': round(jump, 1), 'jump_at': at, 'level': round(db(a[:3 * R]), 1)}) + '\n')
            n += 1
    L = [json.loads(x) for x in open(f'{D}/sound.jsonl')]
    c = lambda f: sum(1 for x in L if f(x))
    print(os.path.basename(D), n, '| first word by 0.3 s', c(lambda x: x['speech_from'] is not None and x['speech_from'] <= 0.3), '| 0.4-1.5 s', c(lambda x: x['speech_from'] is not None and 0.3 < x['speech_from'] <= 1.5),
          '| later, within 3 s', c(lambda x: x['speech_from'] is not None and 1.5 < x['speech_from'] < 3), '| no word in 3 s', c(lambda x: x['speech_from'] is None or x['speech_from'] >= 3),
          '| no sound at all in 3 s', c(lambda x: x['sound_from'] is None))
