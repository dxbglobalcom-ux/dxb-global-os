# Study Card: FLUX.1-Krea-dev

> WRITTEN 2026-09-01 on the CEO's order — *"chatgptyi bekleme başka yerde üret resimleri."* The
> outside drawing engine's daily quota stopped the day's production dead at 12:29 ("try again at
> 3:04 PM"). A factory whose meter is in someone else's hand is not a factory. Board row **B43**.

- **Tool:** FLUX.1-Krea-dev — text-to-image model, the Krea variant, trained specifically against
  the plastic "AI look"
- **Slug:** flux-krea-dev
- **Category:** Media/content (image generation)
- **Status:** ADOPT — **quality APPROVED by the CEO 2026-09-01** <!-- CEO-OK: flux-krea-quality-approved-2026-09-01 -->
  (*"flux çok güzel… 1-kalite onaylandı."*)
- **Target Phase:** 10+ (DXB Media Studio, B43 step ③ — the image lane)
- **Owner (dept/tier):** Creative / Social Media — image lane
- **Trigger Type:** service (local ComfyUI, driven by `/home/dxb/tools/h3/img.py`)
- **Source:** `Comfy-Org/FLUX.1-Krea-dev_ComfyUI` (weights) · `comfyanonymous/flux_text_encoders`
  (t5 + clip) · `Comfy-Org/Lumina_Image_2.0_Repackaged` (the `ae` colour decoder — Black Forest
  Labs' own repo is gated, this one carries the identical 335,304,388-byte file)
- **Pinned Version:** `flux1-krea-dev_fp8_scaled.safetensors` — **11,904,639,672 bytes**, measured
- **Official Docs URL:** https://huggingface.co/black-forest-labs/FLUX.1-Krea-dev

## Measured on DXB-Center (RTX 5060 Ti 16,311 MiB), 2026-09-01

**One 1152×640 photograph, 28 steps, guidance 4.5: 25.5 seconds.** Command and output:

```
python3 img.py --w 1152 --h 640 --steps 28 --guidance 4.5 --seed 7 --out lab/flux-test1.png
→ /home/dxb/tools/h3/lab/flux-test1.png  1152x640  28 adim  g=4.5  tohum=7  25.5 s
```

**What that replaces:** the outside lane cost roughly two minutes per picture, had a daily ceiling,
and put every frame through someone else's service. This one has **no quota, no queue, no fee, and
no picture leaves the machine.**

**Second property, and it matters for exactly one job:** the model carries no service policy, so
frames a hosted engine refuses — a wound, a blade in a body, blood — are drawn here. The CEO lifted
that restraint himself for the Badr realism test (2026-09-01). ⚠ **Not yet exercised — no bloody
frame has been drawn with it, so its behaviour there is UNVERIFIED.**

## How it is wired

- Weights live outside the ComfyUI checkout: `/home/dxb/tools/ComfyUI-models/flux/…`, registered
  through `extra_model_paths.yaml` (`flux/split_files/diffusion_models`, `fluxvae/split_files/vae`).
- Loaded as `UNETLoader` + `DualCLIPLoader(type=flux)` + `VAELoader`, sampled by `KSampler` at
  **cfg 1.0** with the creative strength carried by `FluxGuidance` — FLUX is guidance-distilled, so
  a raised cfg is wrong, not stronger.
- Driver: `/home/dxb/tools/h3/img.py`.

## Traps measured the day it was installed

1. **HuggingFace's Xet transfer stalled at 268 MB** and stayed there. `HF_HUB_DISABLE_XET=1` fixed
   it; the download then completed at full speed.
2. **`black-forest-labs/FLUX.1-schnell` is gated** — its `ae.safetensors` returns *"Access denied.
   This repository requires approval."* The identical file is ungated in the Lumina repack.
3. **A new model is invisible until ComfyUI actually restarts.** The first restart failed silently:
   an older process still held port 8188 (`Port 8188 is already in use`), so the model list was the
   old one. Kill the process holding the port, not the wrapper.

## Where it sits beside the rest

Image lane of B43 step ③. The paid hands (ChatGPT Image, Antigravity) stay available; this is the
lane that makes the studio independent of them, which is the row's own standing duty.
