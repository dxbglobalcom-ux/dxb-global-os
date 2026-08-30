# Study Card: MiniMax H3 (Hailuo 3.0)

> WRITTEN 2026-08-30 — opened by the CEO, who brought the model to the holding himself through an
> Instagram reel. Board row **B42** (the arsenal watch) carries why it took 28 days for this
> holding to hear of a model released 2026-08-02.

- **Tool:** MiniMax H3 — omni-modal video model: text / image / video / audio in, **video with native
  stereo audio out**, 4-15 s at 24 fps, up to 2K
- **Slug:** minimax-h3
- **Category:** Media/content (video generation)
- **Status:** INSTALL (run locally on DXB-Center 2026-08-30 — first video produced; not yet adopted)
- **Target Phase:** 10+ (the agency seat, B28)
- **Owner (dept/tier):** Creative / Social Media — generation lane
- **Trigger Type:** service (local `sd-cli`) · API also available (paid)
- **Source:** `MiniMaxAI/MiniMax-H3` (open weights, 2026-08-02) · `unsloth/MiniMax-H3-GGUF` (quantized)
  · `Comfy-Org/MiniMax-H3` (repacks + turbo LoRAs)
- **Pinned Version:** H3 base, weights of 2026-08-02; quantization `Q4_K` denoiser + `Q4_K_M` text encoder
- **Official Docs URL:** https://huggingface.co/MiniMaxAI/MiniMax-H3

## Measured on DXB-Center (RTX 5060 Ti 16,311 MiB · Ryzen 9 7900X · 30 GiB RAM), 2026-08-30

**It runs. A video with sound was produced on our own card, with no account and no outward call.**

| What | Measured |
|---|---|
| Runner | `sd-cli` (stable-diffusion.cpp, prebuilt Vulkan build `master-835-dc4000d`), `/home/dxb/tools/sdcpp` |
| Weights on disk | denoiser `minimax_h3_fl2va_pruned-Q4_K.gguf` **11.42 GB** · text encoder `qwen3vl_32b_minimax_h3-Q4_K_M.gguf` **18.22 GB** · video VAE **5.21 GB** · audio VAE **0.61 GB** (35.5 GB total) |
| Memory split reported by the runner | VRAM 16,534 MB requested (diffusion 10,976 + VAE 5,558) · RAM 18,865 MB (text encoder) |
| First run | **FAILED at the last step** — `ggml_vulkan: Device memory allocation of size 1066467328 failed` · `vae decode compute failed`: the VAE could not fit beside the resident denoiser on a 16 GB card |
| Fix | `--backend te=cpu,vae=cpu --params-backend te=disk --mmap --diffusion-fa --vae-tiling` — text encoder and video decoder on the processor, denoiser alone on the card |
| Second run | **exit 0 · 333 s wall clock** for 640×384 · 39 frames · 4 steps → `out/smoke2.webm`, 833,795 bytes, **vp8 video + pcm_s16le 32 kHz stereo audio** |
| Sampling speed | **5.6 s per step** on the card (denoiser), 100 % utilisation |
| Bottleneck | the **VAE decode on the processor**, ~23.5 s per tile — it dominates the 333 s |
| Power | avg **179.2 W**, peak **180.3 W** (card cap 180 W) · peak VRAM **12,360 MiB** of 16,311 |
| Prompt-to-condition | 11.46 s (text encoder, on the processor, streamed from disk) |

## Known Pitfalls

1. **The VAE will not share the card with the denoiser at 16 GB.** Without `vae=cpu` the run dies at the
   very last step, after paying for the whole sampling. Tiling alone does not save it.
2. **Local output tops out at 768p.** The 2K module `H3-Regenerate-2K` is, in MiniMax's own README,
   *"not yet open-sourced"* — 2K always calls the paid API.
3. **Frame count is snapped by the model** — 25 requested became 39; H3 forces 24 fps.
4. **The written output container was 16 fps** while the model generates 24 — playback runs slow
   unless the container is rewritten. Cosmetic, fix at assembly time (`ffmpeg -r 24`).
5. **Licence, and it binds the agency seat:** the MiniMax H3 Community License grants rights *"solely
   within the Applicable Territory"* (§II), whose Excluded Territories (§I.5) are the EU, the UK,
   the Republic of Korea and the USA; the Acceptable Use Policy makes use outside the territory a
   prohibited use and §VIII.2 makes breach a termination-and-delete event. Two clauses bind us
   everywhere: **§IV.2 — "MiniMax H3" must be displayed prominently on the interface of any commercial
   product or service that uses it**, and §IV.1 — separate written authorisation above **$20M** yearly
   revenue. §IV.4: MiniMax claims **no rights over the outputs**. The text encoder (Qwen3-VL-32B) is
   Apache-2.0 and carries no territory clause. Governing law: Hong Kong.
6. Model derivatives by distillation are forbidden (§I.11 + §V) — outputs are not derivatives.

## Faster paths not yet measured

- `Comfy-Org/MiniMax-H3` **4-step and 8-step turbo LoRAs** (1.96 GB each) — fewer steps per frame.
- `Kijai/MiniMax-H3-TAE` — a tiny decoder that would take the VAE off the processor.
- NVFP4 repacks (`Abiray/Minimax-H3-nvfp4-INT4-INT8-Convrot`) — Blackwell-native 4-bit, needs the CUDA
  path (torch/ComfyUI), not the Vulkan build used here.

- **Install Command:** weights `hf download unsloth/MiniMax-H3-GGUF <file> --local-dir …`; runner is the
  prebuilt `sd-cli` release, unzipped to `/home/dxb/tools/sdcpp` (no compiler, no CUDA toolkit needed).
- **Legitimacy Verdict:** OK to run — open weights, no account, no outward call, no credential. The
  territorial clause and the interface-attribution clause are the conditions that follow it into any
  client work.

## The right way to run it here — researched 2026-08-30, NOT yet run on this machine

**The way this card was first driven (`sd-cli` on the Vulkan build, decoder on the processor, no
turbo LoRA) is not the way to run H3.** It proved the model works and nothing more. Two people have
published measurements taken on **exactly our card (RTX 5060 Ti 16 GB)**, both through ComfyUI:

| Setting | Measured | Source |
|---|---|---|
| 864×480 (0.4MP) · 5 s · ComfyUI stock T2V template | **633 s** | note.com/ai_0049, 2026-08-05 |
| 960×544 (0.5MP) · 5 s | **809 s** | same |
| 960×544 · 5 s **+ Sage Attention** | **712 s** (−12 %) | same |
| 960×544 · 10 s + Sage | **1,564 s** | same |
| VRAM in flight | **~11.7 GB** | same |
| 0.6MP · 10 s, standard H3 | **~43 min** | note.com/ai_creative_log, 2026-08-11 |
| same, **+ LightX2V 4-step LoRA** | **~19 min** | same |
| same, **after PyTorch cu128 → cu130** | **9 min 55 s** | same |
| **0.8MP · 12 s · 4 steps (their balanced setting)** | **14 min 8 s** | same |
| 0.8MP · 15 s · 4 steps | **20 min 32 s** | same |
| 1.0MP · 15 s · 4 steps (card essentially full) | **46 min 13 s** | same |

**So the recipe to test is: ComfyUI (H3 is native, `comfy/ldm/minimax/model.py`) + PyTorch cu130 +
fp8_scaled or int8 weights + the LightX2V / Turbo 4-step LoRA + Sage Attention**, at 864×480 to
960×544. ComfyUI reports `19995MB Staged` for the model and offloads the remainder to system RAM.

⚠ **The unmeasured risk for us: both testers ran ~80 GB of system RAM; this machine has 30 GiB.**
Nobody has published H3 on 16 GB VRAM with 32 GB RAM. A related measured note
(`github.com/Tomiigo/minimax-h3-16gb`, RAM capped at 32 GB) reports the weights are **re-read from
disk on every sampling step** — 270 GiB read in one run — so a fast NVMe substitutes for RAM, at a
price in time. That repository also used the **nvfp4** text encoder (15.7 GB) rather than int8
(27 GB) precisely because the smaller file offloads less on 32 GB, and reported nvfp4 *faster* even
where its compute path was unavailable.

**The other agent's recipe, evaluated against the above:** correct on the tool (ComfyUI), the files
(`fp8_scaled` 20.96 GB / `int8` 20.97 GB), the text encoder (Qwen3-VL-32B) and the working
resolution (864×480). **Wrong on `python main.py --highvram`** — that pins the whole model on the
card and the model stages ~20 GB against 16,311 MiB — and **its "4-5 second video in 2-3 minutes" is
not a measurement**: the same card measured **633 s** for a 5-second clip at that size.

**His open question, 2026-08-30:** *"15 saniyelik reklam videosunu minimax h3 bu pc'de nasıl
çalıştırabilir"* — the published answer is 1.0MP · 15 s · 4 steps in **46 min** on this card with
80 GB of RAM behind it, and 0.8MP · 15 s in **20 min**. Whether 30 GiB reaches either figure is the
thing to measure.
