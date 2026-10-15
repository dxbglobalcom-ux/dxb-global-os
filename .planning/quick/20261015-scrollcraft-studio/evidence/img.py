"""DXB — the drawing lane moved ONTO THE HOLDING'S OWN CARD.

The CEO's order, 2026-09-01: *"chatgptyi bekleme başka yerde üret resimleri."* Until today
every storyboard photograph was drawn by an outside engine, so the production stopped dead
at 12:29 when that engine's daily quota ran out and the whole Badr rewrite had to be parked
until 15:05. A film factory that a stranger's meter can switch off is not a factory.

This script draws them here instead: FLUX.1-Krea-dev in fp8 on the RTX 5060 Ti, through the
same ComfyUI server that already runs MiniMax H3. Krea-dev is the variant Black Forest Labs
trained specifically against the plastic "AI look" — which is the CEO's own acceptance test,
in his words: *"AI olduğu belli olmayacak kalitede yapıor mu."*

Two consequences that are worth naming because they change what the factory can do:
  · no quota, no queue, no daily limit, and no picture leaves this machine;
  · the model carries no service policy, so the frames a hosted engine refuses — a wound,
    a blade in a body, blood — are drawn here. This matters for exactly one job: the CEO
    lifted that restraint himself for the Badr test, in writing.

  python3 img.py --out badr/v4/s03.png --w 1152 --h 640 --prompt "..."
"""
import argparse, json, os, shutil, time, urllib.request, uuid

SERVER = "http://127.0.0.1:8188"
OUTDIR = "/home/dxb/tools/ComfyUI/output"
UNET = "flux1-krea-dev_fp8_scaled.safetensors"
VAE = "ae.safetensors"


def post(path, payload=None):
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(SERVER + path, data=data,
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read())


def build(prompt, w, h, steps, guidance, seed, prefix):
    # FLUX is a guidance-distilled model: KSampler's cfg stays at 1.0 and the creative
    # strength is carried by FluxGuidance instead. Krea-dev's own card asks for ~4.5.
    return {
        "1": {"class_type": "UNETLoader",
              "inputs": {"unet_name": UNET, "weight_dtype": "default"}},
        "2": {"class_type": "DualCLIPLoader",
              "inputs": {"clip_name1": "clip_l.safetensors",
                         "clip_name2": "t5xxl_fp8_e4m3fn_scaled.safetensors",
                         "type": "flux"}},
        "3": {"class_type": "VAELoader", "inputs": {"vae_name": VAE}},
        "4": {"class_type": "CLIPTextEncode",
              "inputs": {"clip": ["2", 0], "text": prompt}},
        "5": {"class_type": "FluxGuidance",
              "inputs": {"conditioning": ["4", 0], "guidance": guidance}},
        "6": {"class_type": "CLIPTextEncode",
              "inputs": {"clip": ["2", 0], "text": ""}},
        "7": {"class_type": "EmptySD3LatentImage",
              "inputs": {"width": w, "height": h, "batch_size": 1}},
        "8": {"class_type": "KSampler",
              "inputs": {"model": ["1", 0], "positive": ["5", 0], "negative": ["6", 0],
                         "latent_image": ["7", 0], "seed": seed, "steps": steps,
                         "cfg": 1.0, "sampler_name": "euler", "scheduler": "simple",
                         "denoise": 1.0}},
        "9": {"class_type": "VAEDecode", "inputs": {"samples": ["8", 0], "vae": ["3", 0]}},
        "10": {"class_type": "SaveImage",
               "inputs": {"images": ["9", 0], "filename_prefix": prefix}},
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--prompt", required=True)
    ap.add_argument("--out", required=True, help="where the finished picture is written")
    ap.add_argument("--w", type=int, default=1152)
    ap.add_argument("--h", type=int, default=640)
    ap.add_argument("--steps", type=int, default=28)
    ap.add_argument("--guidance", type=float, default=4.5)
    ap.add_argument("--seed", type=int, default=0)
    a = ap.parse_args()
    seed = a.seed or int(time.time() * 1000) % 2**31
    prefix = "img_" + uuid.uuid4().hex[:8]

    t0 = time.time()
    cid = uuid.uuid4().hex
    post("/prompt", {"prompt": build(a.prompt, a.w, a.h, a.steps, a.guidance, seed, prefix),
                     "client_id": cid})
    # The server writes the file; poll for it rather than guessing a duration.
    got = None
    while time.time() - t0 < 900:
        hits = [f for f in os.listdir(OUTDIR) if f.startswith(prefix) and f.endswith(".png")]
        if hits:
            got = os.path.join(OUTDIR, sorted(hits)[-1])
            break
        time.sleep(1.0)
    if not got:
        print(f"BASARISIZ — 15 dakikada kare gelmedi ({a.out})")
        raise SystemExit(1)
    time.sleep(0.5)
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    shutil.move(got, a.out)
    print(f"{a.out}  {a.w}x{a.h}  {a.steps} adim  g={a.guidance}  tohum={seed}  "
          f"{time.time() - t0:.1f} s")


if __name__ == "__main__":
    main()
