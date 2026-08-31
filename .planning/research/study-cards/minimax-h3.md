# Study Card: MiniMax H3 (Hailuo 3.0)

> WRITTEN 2026-08-30 — opened by the CEO, who brought the model to the holding himself through an
> Instagram reel. Board row **B42** (the arsenal watch) carries why it took 28 days for this
> holding to hear of a model released 2026-08-02.

- **Tool:** MiniMax H3 — omni-modal video model: text / image / video / audio in, **video with native
  stereo audio out**, 4-15 s at 24 fps, up to 2K
- **Slug:** minimax-h3
- **Category:** Media/content (video generation)
- **Status:** INSTALL (running on DXB-Center 2026-08-30 — a 15-second advertisement with sound produced
  in 10.34 min on this card; the CEO has not yet seen it, so it is not adopted — LAW B)
- **Target Phase:** 10+ (the agency seat, B28)
- **Owner (dept/tier):** Creative / Social Media — generation lane
- **Trigger Type:** service (local ComfyUI at `/home/dxb/tools/ComfyUI`, driven by `/home/dxb/tools/h3/`)
  · API also available (paid)
- **Source:** `MiniMaxAI/MiniMax-H3` (open weights, 2026-08-02) · `unsloth/MiniMax-H3-GGUF` (quantized)
  · `Comfy-Org/MiniMax-H3` (repacks + turbo LoRAs)
- **Pinned Version:** H3 base, weights of 2026-08-02; **the lane runs `fl2va_pruned_fp8_scaled` denoiser
  + `qwen3vl_32b_nvfp4_awq` text encoder + `fl2v_turbo_4step_v1.0_768p` LoRA**; the `Q4_K` GGUF pair is
  the retired Vulkan path and is kept only as the crash exhibit
- **Official Docs URL:** https://huggingface.co/MiniMaxAI/MiniMax-H3

## Measured on DXB-Center (RTX 5060 Ti 16,311 MiB · Ryzen 9 7900X · 30 GiB RAM), 2026-08-30

**IT RUNS, AND THE SECOND SESSION OF THE SAME DAY FOUND THE PATH THAT MAKES IT USEFUL.** The first
path (`sd-cli`, Vulkan, decoder on the processor) proved the model works and **crashed the card**.
The second path (ComfyUI + CUDA) produces a **15-second advertisement with its own stereo sound in
under eleven minutes**, on this card, for $0.00, with no account and no outward call.

### The path that works — ComfyUI + PyTorch cu130, measured 2026-08-30 21:26-22:40

Runner `/home/dxb/tools/h3/` (`workflow.py` builds the API prompt, `run.py` measures the run,
`start-server.sh` carries the flags). Weights: denoiser `minimax_h3_fl2va_pruned_fp8_scaled`
**19.52 GB** · text encoder `qwen3vl_32b_minimax_h3_nvfp4_awq` **14.61 GB** · video VAE 4.85 GB ·
audio VAE 0.56 GB · LoRA `minimax_h3_fl2v_turbo_4step_v1.0_768p` 1.82 GB. Every run: 4 steps,
cfg 1.0, euler/simple, sigma shift 12.0/3.0, seed 42, 24 fps, one prompt.

| Canvas | MP | Duration | Wall clock | Peak VRAM | Peak RAM | Swap | Result |
|---|---|---|---|---|---|---|---|
| 864×480 | 0.41 | 5.17 s (124 f) | **90.0 s** | 15,532 MiB | 18.0 GiB | 0 | ✅ |
| 864×480 | 0.41 | 15.08 s (362 f) | **295.1 s = 4.92 min** | 15,136 MiB | 19.4 GiB | 0 | ✅ |
| 960×544 | 0.52 | 15.08 s (362 f) | **385.1 s = 6.42 min** | 15,008 MiB | 19.7 GiB | 1.5 GiB | ✅ |
| 1024×576 | 0.59 | 15.08 s (362 f) | **450.1 s = 7.50 min** | 14,208 MiB | 19.3 GiB | 1.5 GiB | ✅ |
| **1152×640** | **0.74** | **15.08 s (362 f)** | **620.1 s = 10.34 min** | 14,896 MiB | 19.5 GiB | 1.5 GiB | ✅ **ceiling** |
| 1280×720 | 0.92 | 15.08 s (362 f) | fails in 10 s | 15,824 MiB | 12.0 GiB | 1.4 GiB | ❌ OOM |
| 1344×768 | 1.03 | 15.08 s (362 f) | fails in 10 s | 15,824 MiB | 12.5 GiB | 0 | ❌ OOM |

**The ceiling for a 15-second shot on this card is 1152×640 (0.74 MP).** 1280×720 — true HD — does
not fit: `8.78 GiB allocated, 2.66 GiB requested, 23 MiB free`. Seven runs were made back to back
and the GPU guard's log stayed empty; the card never faulted once on the CUDA path.

**Against the two published measurements taken on THIS EXACT CARD** (note.com, ~80 GB system RAM):
864×480 · 5 s was **633 s** there and **90 s** here (**7.0× faster**); 0.8MP · 15 s · 4 steps was
**20 min 32 s** there and 0.74MP · 15 s is **10.34 min** here (**2.0× faster on 0.37× the RAM**).
The gap is the combination, not one flag: fp8_scaled weights native to Blackwell, an **nvfp4** text
encoder the card also runs natively (`Native ops: nvfp4, … float8_e4m3fn …` in the server's own log),
the 4-step turbo LoRA, Sage Attention, and ComfyUI's dynamic-VRAM staging (`19983MB Staged` against
a 16,311 MiB card).

**⚠ THE RAM FEAR DID NOT MATERIALISE.** The card was staged at ~20 GB against 30 GiB of system RAM
and peak usage never passed **19.5 GiB**, with **at most 1.5 GiB of swap touched**. `--fast-disk`
(disk-backed offload over unpinned RAM) plus `--cache-none` is what buys that, and this machine's
NVMe is what pays for it.

**Output is a real advertisement frame, verified by eye and by `ffprobe`:** h264 864×480 @ 24 fps
+ **aac 32 kHz stereo**, audio mean −16.8 dB / peak −0.4 dB (not silence), 15.083 s, 2.51 MB. Frames
sampled at 5 / 180 / 355 show a coherent moving shot — wet street at dusk, rain beads on the mirror,
neon sliding across the paintwork, real depth of field.

### The path that crashed the card — kept because the failure is the lesson

`sd-cli` (stable-diffusion.cpp, prebuilt Vulkan build `master-835-dc4000d`, `/home/dxb/tools/sdcpp`)
with the Q4_K GGUF weights produced a 640×384 · 39-frame · 4-step clip in **333 s** (5.6 s/step,
peak VRAM 12,360 MiB, 179.2 W average) — the clip the CEO refused. Pushed at 960×544 × 121 frames
with `--max-vram 6 --stream-layers`, it **killed the card's GSP firmware 16 seconds in**:
`Xid 62` (PMU halted) → `Xid 154` (GPU Reset Required) → a GSP-CrashCat report, then `Xid 109
CTX SWITCH TIMEOUT` every four seconds for forty minutes. The card also drives the display, so it
could not be reset from software; only a reboot recovered it. **Layer-streaming from disk on the
Vulkan path drowns the GSP watchdog. The CUDA path, asked for more than fits, refuses cleanly
(`torch.OutOfMemoryError`, models unloaded, card untouched) — which is the whole argument for it.**

## The recipe, settled by measurement on this machine — 2026-08-30

**The way this card was first driven was the wrong way and it is closed.** The researched
recommendation (ComfyUI + PyTorch cu130 + fp8/int8 weights + a turbo LoRA + Sage Attention) was run
here and is now the lane. **The other agent's recipe was right on the tool, the files and the working
resolution, and wrong on two things this session measured:** `--highvram` pins ~20 GB on a 16,311 MiB
card (the run stages `19983MB` and must be allowed to offload), and its *"4-5 second video in 2-3
minutes"* was a guess — the true figure is **90 seconds** for 5.17 s at 864×480, which is better than
its guess and better than the 633 s published for the same shot on the same card.

**The lane, exactly:**

```
/home/dxb/tools/h3/start-server.sh          # ComfyUI, the flags that matter
/home/dxb/tools/h3/run.py --seconds 15 --width 1152 --height 640
```

Server flags and why each is there: `--use-sage-attention` (−12 % measured by the published tester)
· `--fast-disk` (disk-backed offload instead of unpinned RAM — this machine has 30 GiB and a fast
NVMe) · `--cache-none` (keeps the 14.6 GB text encoder out of RAM beside the 19.5 GB denoiser) ·
`--reserve-vram 0.8` (the desktop keeps its ~400 MiB) · **never `--highvram`**. Model paths are
declared once in `/home/dxb/tools/ComfyUI/extra_model_paths.yaml`, pointing at
`/home/dxb/tools/ComfyUI-models/`, so a ComfyUI update never touches 41 GB of weights.

**The choice of files is a measurement, not a preference.** `nvfp4` for the text encoder rather than
`int8`: 14.61 GB against 25.28 GB, and the card runs nvfp4 natively (Blackwell, sm_120) — on 30 GiB
of system RAM the smaller file is the difference between offloading and swapping.

**What to pick for a job:** 864×480 for a draft (4.9 min for 15 s) · **1152×640 for delivery**
(10.3 min for 15 s, 0.74 MP) · 960×544 or 1024×576 when the clock matters more than the pixels
(6.4 / 7.5 min). Above 0.74 MP at 15 s the card refuses. A longer or larger shot buys nothing that cutting three
shots together does not buy cheaper.

## Known ceilings

1. **Above 0.74 MP a 15-second shot does not fit.** 1280×720 (0.92 MP) and 1344×768 (1.03 MP) both
   fail with `torch.OutOfMemoryError` after ten seconds. They fail *cleanly*: models unloaded, card
   healthy, guard log empty. **1152×640 is the delivery ceiling for 15 s** — for true HD the shot must
   be shorter, or the frame upscaled after the fact.
2. **Local output tops out at 768p.** The 2K module `H3-Regenerate-2K` is, in MiniMax's own README,
   *"not yet open-sourced"* — 2K always calls the paid API.
3. **Frame count is snapped to the model's 17k+5 grid** at 24 fps: 124 frames = 5.17 s,
   **362 frames = 15.08 s**, and 362 is the top of the trained range (`comfy_extras/nodes_minimax_h3.py`
   tooltip: *"trained range is ~124-362, longer is untested"*). A 15-second advertisement is therefore
   **one generation, not a stitch** — which is the direct answer to the CEO's question.
4. **The GSP watchdog is the real hardware limit, not VRAM.** Layer-streaming from disk on the Vulkan
   path crashed the card's firmware. `/home/dxb/tools/gpu-guard/` now watches the kernel log and kills
   any GPU job at the first fatal Xid; it is a user systemd unit (`dxb-gpu-guard.service`, Linger=yes)
   because `sudo` on this machine needs a password and a terminal.
5. **Licence, and it binds the agency seat:** the MiniMax H3 Community License grants rights *"solely
   within the Applicable Territory"* (§II), whose Excluded Territories (§I.5) are the EU, the UK,
   the Republic of Korea and the USA. **The CEO settled this 2026-08-30** — the holding will also be
   operated from Iraq, which is not excluded, and permission was obtained from the rights holder.
   Two clauses bind us everywhere: **§IV.2 — "MiniMax H3" must be displayed prominently on the
   interface of any commercial product or service that uses it**, and §IV.1 — separate written
   authorisation above **$20M** yearly revenue. §IV.4: MiniMax claims **no rights over the outputs**.
   The text encoder (Qwen3-VL-32B) is Apache-2.0 and carries no territory clause. Governing law:
   Hong Kong. Model derivatives by distillation are forbidden (§I.11 + §V); outputs are not derivatives.

## Not yet measured

- **8-step turbo LoRA** (`minimax_h3_fl2v_turbo_8step`) — twice the steps, better motion, unknown cost.
- **`--fast fp8_matrix_mult` / `fp16_accumulation`** — ComfyUI marks them *"untested and potentially
  quality deteriorating… might crash your comfyui"*, and this session deliberately took the clean
  baseline first.
- **`ref2va`** (reference images → video), which is how a real client brand enters a shot.
- **Energy per clip.** The card averaged 147.9 W over the 5-second run and 170.0 W over the 15-second
  one; the cost per rendered minute belongs to B33 and is not computed here.

- **Install Command:** ComfyUI at `/home/dxb/tools/ComfyUI` (`.venv` is a `uv` venv — it has no `pip`,
  use `uv pip install --python .venv/bin/python`); PyTorch `2.13.0+cu130`; `sageattention==1.0.6`;
  weights `hf download Comfy-Org/MiniMax-H3 <file> --local-dir /home/dxb/tools/ComfyUI-models/comfyorg`.
- **Legitimacy Verdict:** OK to run — open weights, no account, no outward call, no credential. The
  territorial clause and the interface-attribution clause are the conditions that follow it into any
  client work.
