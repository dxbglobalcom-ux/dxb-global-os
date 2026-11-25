"""What the first 3.5 seconds of each film are to four free models, saved as numbers (no answer is read here).
usage: embed.py <set dir> <siglip|vjepa|text|sound|sharp>   -> ranker/<set>_<kind>.npz (ids, X)
siglip: frames at 0, 0.5, 1, 2, 3.5 s (5 x 1152) | vjepa: 64 frames of 0-3.5 s (1024) | text: words heard in the first 6 s + ... (1024) | sound: the sound of the first 5 s, AST (2 x 768)
sharp: code only (fine detail of the first frames, size of the clip): does the download's own quality give the winner away?"""
import json, os, sys, glob, wave
import numpy as np, av, torch
D, kind = sys.argv[1].rstrip('/'), sys.argv[2]
LAB = os.path.expanduser('~/.local/share/dxb/hook-lab')
OUT = f'{LAB}/ranker/{os.path.basename(D)}_{kind}.npz'
sel = json.load(open(D + '/selection.json'))
ids = []
for p in sel:
    for k in ('win', 'lose'):
        if p[k]['id'] not in ids:
            ids.append(p[k]['id'])
dev = 'cuda'
T5 = (0.0, 0.5, 1.0, 2.0, 3.5)


def frames(i, until=3.6, size=None, ts=None):
    """the frames nearest to the times ts (all frames when ts is None), decoded once, only the wanted ones turned into pictures"""
    f = f'{D}/vid/{i}.mp4'
    if not os.path.exists(f):
        return None
    try:
        c = av.open(f)
        if not c.streams.video:
            return None
        c.streams.video[0].thread_type = 'AUTO'
        raw, t0 = [], None
        for x in c.decode(video=0):
            t = float(x.pts * x.time_base)
            t0 = t if t0 is None else t0
            if t - t0 > until:
                break
            raw.append((t - t0, x))
        if not raw:
            return None
        tt = np.array([t for t, _ in raw])
        idx = range(len(raw)) if ts is None else [int(np.argmin(abs(tt - t))) for t in ts]
        arr = {}
        for k in idx:
            if k not in arr:
                x = raw[k][1]
                arr[k] = x.reformat(*(size or (x.width, x.height)), format='rgb24').to_ndarray()
        out = [arr[k] for k in idx]
        c.close()
        return out, len(raw)
    except Exception:
        return None


def stream(size, ts):
    from concurrent.futures import ThreadPoolExecutor
    with ThreadPoolExecutor(4) as ex:
        q = []
        for i in ids:
            q.append((i, ex.submit(frames, i, 3.6, size, ts)))
            if len(q) >= 12:
                j, fu = q.pop(0)
                yield j, fu.result()
        for j, fu in q:
            yield j, fu.result()


keep, X = [], []
if kind == 'siglip':
    from transformers import AutoModel
    m = AutoModel.from_pretrained('google/siglip2-so400m-patch14-384', dtype=torch.float16, local_files_only=True).to(dev).eval()
    for n, (i, fr) in enumerate(stream((384, 384), T5)):
        if not fr:
            continue
        x = torch.from_numpy(np.stack(fr[0])).to(dev).permute(0, 3, 1, 2).half() / 127.5 - 1
        with torch.no_grad():
            o = m.get_image_features(pixel_values=x)
            o = o if torch.is_tensor(o) else o.pooler_output
        X.append(o.float().cpu().numpy())
        keep.append(i)
        if n % 300 == 0:
            print(n, flush=True)
elif kind == 'vjepa':
    from transformers import AutoModel
    m = AutoModel.from_pretrained('facebook/vjepa2-vitl-fpc64-256', dtype=torch.float16, local_files_only=True).to(dev).eval()
    mean = torch.tensor([0.485, 0.456, 0.406], device=dev).view(1, 1, 3, 1, 1)
    std = torch.tensor([0.229, 0.224, 0.225], device=dev).view(1, 1, 3, 1, 1)
    for n, (i, fr) in enumerate(stream((256, 256), np.linspace(0, 3.5, 64))):
        if not fr:
            continue
        x = torch.from_numpy(np.stack(fr[0])).to(dev).permute(0, 3, 1, 2)[None].float() / 255
        x = ((x - mean) / std).half()
        with torch.no_grad():
            o = m(pixel_values_videos=x, skip_predictor=True).last_hidden_state[0].float()   # tokens x 1024, in time order (32 x 256)
        o = o.reshape(32, -1, o.shape[-1])
        X.append(torch.stack([o.mean((0, 1)), o[:10].mean((0, 1))]).cpu().numpy())   # the whole 3.5 s, and the first 1.1 s
        keep.append(i)
        if n % 300 == 0:
            print(n, flush=True)
elif kind == 'text':
    from transformers import AutoModel, AutoTokenizer
    N = 'Qwen/Qwen3-Embedding-0.6B'
    tok = AutoTokenizer.from_pretrained(N, padding_side='left', local_files_only=True)
    m = AutoModel.from_pretrained(N, dtype=torch.float16, local_files_only=True).to(dev).eval()
    title = {}
    for p in sel:
        for k in ('win', 'lose'):
            title[p[k]['id']] = p[k].get('title') or ''
    for i in ids:
        f = f'{D}/txt/{i}.json'
        seg = json.load(open(f)) if os.path.exists(f) else []
        said = ' '.join(s[2] for s in seg if len(s) == 3 and isinstance(s[0], (int, float)) and s[0] < 3.5).strip()
        row = []
        for s in (said or '(no words)', title[i] or '(no caption)'):
            b = tok([s], return_tensors='pt', truncation=True, max_length=128).to(dev)
            with torch.no_grad():
                row.append(m(**b).last_hidden_state[0, -1].float().cpu().numpy())
        X.append(np.stack(row + [np.full_like(row[0], 1.0 if said else 0.0)]))
        keep.append(i)
elif kind == 'sound':
    from transformers import ASTModel, ASTFeatureExtractor
    N = 'MIT/ast-finetuned-audioset-10-10-0.4593'
    m = ASTModel.from_pretrained(N, local_files_only=True).to(dev).eval()
    fe = ASTFeatureExtractor.from_pretrained(N, local_files_only=True)
    for i in ids:
        f = f'{D}/wav/{i}.wav'
        if not os.path.exists(f):
            continue
        w = wave.open(f)
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32)[:16000 * 5] / 32768
        if len(x) < 8000:
            continue
        b = fe(x, sampling_rate=16000, return_tensors='pt')
        with torch.no_grad():
            o = m(b['input_values'].to(dev))
        n = max(2, int(round(12 * 100 * len(x) / 16000 / 1024 * 101 / 12)))   # patches that hold sound: 12 x 101 in time order
        h = o.last_hidden_state[0, 2:].reshape(12, -1, o.last_hidden_state.shape[-1])[:, :n].mean((0, 1))
        X.append(torch.cat([o.pooler_output[0], h]).float().cpu().numpy())
        keep.append(i)
elif kind == 'sharp':
    for i, fr in stream(None, T5):
        if not fr:
            continue
        r = []
        for a in fr[0]:
            g = a.astype(np.float32).mean(2)
            lap = 4 * g[1:-1, 1:-1] - g[:-2, 1:-1] - g[2:, 1:-1] - g[1:-1, :-2] - g[1:-1, 2:]
            r.append([np.log(lap.var() + 1), g.std(), g.mean()])
        r = np.array(r)
        X.append(np.r_[r.mean(0), r[0], np.log(os.path.getsize(f'{D}/vid/{i}.mp4')), fr[0][0].shape[0] / fr[0][0].shape[1], fr[1]])
        keep.append(i)
np.savez_compressed(OUT, ids=np.array(keep), X=np.array(X, dtype=np.float32))
print('SAVED', OUT, np.array(X).shape, 'of', len(ids), flush=True)
