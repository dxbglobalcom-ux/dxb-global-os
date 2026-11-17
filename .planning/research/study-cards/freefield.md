# Study Card: Freefield (a Higgsfield-like studio on ComfyUI, open weights)

> FILLED 2026-11-17 — the link he gave in the talk (`https://github.com/neuregex/freefield`); read from the repository, nothing installed. His word the same day <!-- CEO-OK: freefield-prepared-on-the-board-tried-at-its-time-2026-11-17 -->: everything is prepared, it has its place on the board, and it is tried and measured when its time comes.

- **Tool:** Freefield — "open-source Higgsfield on ComfyUI": a studio web app with 120 image, video, VFX and audio apps, every model open weights
- **Slug:** freefield
- **Category:** Media / the studio's surface
- **Status:** STUDY — prepared for a trial, not installed
- **Board row:** B43 (DXB Media Studio); the screen it could stand in for is B32
- **Source:** https://github.com/neuregex/freefield — MIT, 1,515★, 293 forks, created 2026-10-20, release v1.0 of 2026-11-03, last push 2026-11-17 (commit `5088cd87`)
- **Pinned Version:** at install (the commit of the day; its own ComfyUI pin is `e3bee7f`, 0.42.0)

## What it is

- A Node web app (`web/` + `server/`, the Comfy SDK) in front of a ComfyUI: browser → server → token gateway `:8000` → `comfy-api-proxy` `:8189` → ComfyUI `:8188`. The backend is Modal or one's own GPU (`tools/local_backend.py`).
- **No per-app code.** Each app is a folder in `apps/` with an `app.json` manifest (inputs, bindings, models with their Hugging Face repo, size and license, VRAM by phase) and a ComfyUI workflow in API format. The menu, the forms, the model downloads, the VRAM map and the tests are derived from the manifests.
- `tools/import_workflow.py` drafts a new app from any ComfyUI workflow — the road by which the studio's own recipes (the UGC recipe, `/kisayol`) could become apps.
- 120 apps: 39 with a workflow of their own, 5 IC-LoRA apps, `morph`, 72 template apps (a fixed prompt over one of those pipelines), 2 smoke apps. Models: FLUX 3 Image Klein, Z-Image Turbo, Krea 2 Turbo, Qwen Image Edit 2509, LTX-2.5 22B distilled, MiniMax H3, Wan 2.1/2.2, SeedVR2, BiRefNet, MoGe-2, SCAIL-2, MiniMax Music 3, Stable Audio 3. No API or partner nodes.
- The author's lab: 48 runs on Modal (L40S, H100), 710 of 733 cases ok; every example in the app is one of those runs with its time and peak VRAM.

## What it would give the studio

- Apps that are the agency seat's own products: `product-shot`, `packshot`, `poster`, `billboard`, `ugc-shot`, `try-on`, `outfit-shot`, `dub`, `talking`, `speak`, `upscale`, `remove-bg`, `music`, `sfx` — and `reframe` (a new aspect ratio with the missing parts painted in), the 9:16 step the studio does not have.
- A ready surface on the studio's own engine (ComfyUI), where Open-Generative-AI (row w098) is a surface over a paid API and does not speak to ComfyUI. The two do different work: Freefield for our own card and open weights, Open-Generative-AI as the door to the closed paid models (Kling, Veo, Sora). OpenMontage (installed, `/home/dxb/tools/OpenMontage`) stays what it is — the production and assembly lane; it calls models, it is not a studio surface.

## What is not known until it is tried

1. **Our card is 16 GB (RTX 5060 Ti); its table is written for 24 GB.** By its own table the image apps fit (Klein 11.0 GB, Z-Image 12.2 GB, upscale 4.0 GB, remove-bg 0.4 GB, music 14.3 GB, sfx 10.4 GB). The LTX-2.5 video apps are "tight" at 21.5–22.8 GB on 24 GB; H3 apps "need Modal" (27.1 GB text encoder), `cinema-video` peaked at 44.3 GB. Whether ComfyUI's low-VRAM mode carries any of them on 16 GB is not measured.
2. **The local-GPU road has not been run with real models by its author:** "checked on 27 Oct on a CPU-only machine", with the model-free smoke app; every GPU run was on Modal.
3. Whether a result is better than the studio's own recipe for the same brief — by eye, his.

## The install recipe (at B43's rank — nothing below has been run)

Needs Node 22.6+ (this machine: v22.23.3) and Python 3.10+ with the PyTorch build for the card (a `uv` venv on 3.12; 3.11–3.14 are installed). It installs its own ComfyUI at its pinned commit in its own folder — the studio's ComfyUI (`/home/dxb/tools/ComfyUI`, 0.34.0) is not touched.

```sh
git clone https://github.com/neuregex/freefield /home/dxb/tools/freefield        # pin the commit of the day
python tools/doctor.py                                                             # what is missing
python tools/local_backend.py setup /home/dxb/tools/freefield-comfy                # ComfyUI + pinned custom nodes + comfy-api-proxy
python tools/local_backend.py download /home/dxb/tools/freefield-comfy image-flux3 --dry-run   # sizes first
python tools/local_backend.py download /home/dxb/tools/freefield-comfy image-flux3
python tools/setup_token.py --env-only
python tools/local_backend.py serve /home/dxb/tools/freefield-comfy -- --lowvram   # ComfyUI :8188, proxy :8189, gateway :8000
npm install && npm run serve                                                       # http://127.0.0.1:3000 (COMFY_BASE_URL=http://127.0.0.1:8000 in .env)
```

Packs (`packs/index.json`): `image-flux3` (58 apps) · `upscale` (6) · `image` (z-image) · `image-qwen-edit` (5) · `image-krea2` (2) · `audio` (2) · `video-ltx25` (32) · `video-h3` (4) · `video-wan-effects` (4) · `video-wan-camera` · `video-wan` · `video-scail`. The whole catalog is 104 files, about 355 GB; the disk has 1.3 TB free. Packs are downloaded as the trial needs them, each after its `--dry-run`. `--models` can point at a model folder already on the disk (`/home/dxb/tools/ComfyUI-models`, 150 GB) where the files are the same.

## The trial, in order — each step measured, then read by eye

The card is shared with the studio: the trial runs when the studio's queue is empty.

1. **Five image apps on our card** (`image-flux3` + `upscale` packs): `product-shot`, `packshot`, `ugc-shot`, `upscale`, `remove-bg`. For each: does it finish, seconds, peak VRAM; the result beside the same brief made with the studio's own recipe.
2. **`reframe`** to 9:16 on one studio clip (`video-ltx25` pack) — the step we lack.
3. **One video app on 16 GB:** `video` (LTX-2.5 image-to-video with sound), low-VRAM mode: does it finish, how long, how it looks beside the studio's own engine on the same first frame.
4. **One of our own workflows as an app:** `tools/import_workflow.py` on the UGC recipe's image step — does the draft app run.
5. **What the card cannot carry** is listed with the app's name and its measured need; the cloud road for those is Modal (the README's base prices: L40S 1.95 $/hour, H100 3.95 $/hour).

**What decides.** Freefield becomes the studio's surface if its apps run on our card in a time a job can bear and its results stand beside the studio's own for the same brief — the draft first, his eye on it (LAW D). If only the image apps pass, it is kept for those and the video stays on the studio's own road.

## What stops at him

- The Hugging Face licences of the gated models are accepted on the Hub by an account — a click of his, brought to the button.
- Modal (a cloud account and GPU hours) is money out.
- Nothing else: the install is local, in its own folders.

## Known notes

- Model weights keep their own licences, listed per app; a few community LoRAs are research-only or state none (`camera-copy`, `reshoot`) — the app page shows it.
- The author left out the effect LoRAs that undress, fire a gun or show a religious figure, and says the apps are meant for SFW work.
- The hosted demo link (`infra/web_app.py`, a passcode, 30 runs a day) is a way to show a client a studio without installing anything — a sales surface to weigh after the trial.
