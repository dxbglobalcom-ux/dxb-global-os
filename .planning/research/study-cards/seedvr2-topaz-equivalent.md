# Topaz-equivalent local, free video upscaler for Linux — research report

Date of research: 2026-09-03. Research backends (agent-reach): Exa web search, Jina reader, GitHub (`gh` CLI + GraphQL), Reddit (OpenCLI browser bridge), YouTube (yt-dlp auto-subtitles), Topaz Discourse JSON, Hugging Face API. Read-only; nothing installed; no GPU used.

Conventions: every number is followed by its source URL and the source's own date. **⚠** marks a number that is NOT a user measurement (estimate, vendor claim, or extrapolation). Station facts marked **[station]** were measured on this machine this session (read-only commands).

---

## 0. Answer in one paragraph

**The winner is SeedVR2 (ByteDance, Apache-2.0, 3B/7B), run through the SeedVR2 nodes that are now built into ComfyUI core** (merged into ComfyUI on 2026-07-10, PR #14424; the file `comfy_extras/nodes_seedvr.py` is already present in the station's ComfyUI 0.34.0 **[station]**). It is one model, one tool, one workflow template that ships with ComfyUI ("Upscale Video (SeedVR2 3B Int8)"), no custom nodes, arbitrary output resolution, temporal batching built in, commercially usable (Apache-2.0 on code AND weights). The strongest single piece of evidence that it "does the same thing" as Topaz: a log analysis posted 2026-08-06 by a Topaz user on a RTX 5070 Ti 16 GB concludes that Topaz's own **Starlight Precise 2.5 ("slp-2.5") is a fine-tuned SeedVR2-3B** — same NaDiT-3B architecture (mm_layers=10, num_blocks=32), same 4n+1 batch rule, same one-step Euler sampler, and Topaz's verifier even warns about a missing `ema_3b_bf16.safetensors` (SeedVR2's file naming) (https://github.com/numz/ComfyUI-SeedVR2_VideoUpscaler/discussions/617, 2026-08-06). That claim is a user's inference from logs, not confirmed by Topaz — but the architecture match is detailed and specific. Runner-up: FlashVSR v1.1 (faster, Apache-2.0, but 4×-only, weaker temporal consistency and face degradation reported). Topaz has **no Linux build in 2026** — the last Linux beta was 5.0.3.1.b for Ubuntu 22.04 (2024-04-30), a Topaz engineer contact said there are "no resources to continue" (2025-08-11), the 1.7.0 release (2026-08-11) ships Windows | Mac only, and Adobe announced the acquisition of Topaz Labs on 2026-06-25.

---

## PART 1 — What Topaz Video is in 2026 (what "the same thing" means)

### 1.1 Product, pricing, platform
- Product is now **"Topaz Video"** (formerly Video AI), bundled in **Topaz Studio**. Pricing page structured data: Topaz Video Personal **$59/mo** or **$299/yr** (or $39/mo on annual); Pro **$75/mo** (annual, billed monthly); Studio Pro **$799/yr**. 25 monthly cloud credits (Personal). Description literally says: *"Desktop AI video enhancement for Windows and macOS."* (https://www.topazlabs.com/pricing, fetched 2026-09-03).
- Models listed on the pricing page: **Starlight Precise, Proteus, Iris, Nyx, Rhea, Rhea XL, Artemis, Gaia, Theia, Apollo, Chronos, Aion, Themis, SDR-to-HDR, Stabilization**; cloud-only access to **Starlight Mini/Sharp/HQ/Fast** on the base tier (same page).
- **Adobe to acquire Topaz Labs** — announced 2026-06-25 (https://news.adobe.com/news/2026/06/adobe-to-acquire-topaz-labs; TechCrunch https://techcrunch.com/2026/06/25/adobe-acquires-image-and-video-enhancement-tool-maker-topaz-labs/, 2026-06-25). Topaz community thread "Adobe to Acquire Topaz Labs" (106 posts, 2026-06-25) and "SAY NO TO ADOBE MERGER!" (2026-07-04) (https://community.topazlabs.com/search.json?q=Adobe%20acquisition).

### 1.2 Linux status — verified
| Evidence | Date | Source |
|---|---|---|
| Last Linux build: **Topaz Video AI Linux Beta 5.0.3.1.b, Ubuntu 22.04** (OFX plugin, "DaVinci Resolve not supported on Linux", "Nyx 4x will not work") | 2024-04-30 | https://community.topazlabs.com/t/topaz-video-ai-linux-beta-v5-0-3-0-b/68739 |
| Staff (AND-E) still points Linux users to that 2024 beta | 2025-07-20 | https://community.topazlabs.com/t/using-on-linux/93515 |
| User hschoepel, after talking to Topaz engineers: *"There are official no ressources to continue on this project for the moment! So don't think that there will be any new release in the far future."* | 2025-08-11 | same thread |
| User shodan5000 in that thread: *"Open source SeedVR2 or FlashSVR for video"* | 2025-10-28 | same thread |
| "Request \| Linux Support Wanted" — paying subscriber on Linux, MSI installer crashes under Wine; **no staff reply** (1 post) | 2026-05-08 | https://community.topazlabs.com/t/request-linux-support-wanted/102669 |
| Topaz Video 1.7.0 release: downloads listed as **"Windows \| Mac"** only | 2026-08-11 | https://community.topazlabs.com/t/topaz-video-1-7-0/104328 |
| r/linux4noobs: ex-Topaz user *"It did a good job. No complaints, other than it doesn't exist on Linux."* | 2026-08-11 | https://www.reddit.com/r/linux4noobs/comments/1vl63ss/ |

**Verdict: there is no Linux build, beta, or roadmap statement for Topaz Video in 2026.** The 2024 beta thread is locked and predates every Starlight model.

### 1.3 The models and what each does
Source unless noted: https://developer.topazlabs.com/video-models (Topaz developer docs, fetched 2026-09-03) and https://docs.topazlabs.com/video-ai/reference-guide/filters (2024-10-29).

| Model | Family | Purpose (Topaz's words) |
|---|---|---|
| **Starlight Precise 2.5 / 2.6** | Diffusion (local + cloud) | "upscale footage up to 4K while improving realism and detail across both AI-generated and archival video… faces, fabrics, materials, textures… text, labels, logos". 2.6: "up to 15% faster… improved temporal consistency reduces flickering", new Sharpen slider (3 levels). **Capped at 4K locally and in the cloud.** Min 12 GB VRAM / 16 GB recommended, 32 GB RAM, **targeted at compute capability 8.9** (CC 8.6 "not technically supported") (https://docs.topazlabs.com/topaz-video/project-starlight-series/starlight-precise-25; 1.7.0 release note 2026-08-11) |
| Starlight Mini | Diffusion (local) | "essentials of Precise… more natural and consistent" but "strong smoothing" (user, 2026-06-14). ≥10 GB VRAM (16 GB recommended), CC ≥7.0, 32 GB RAM; from 1.7.0 no Pro account needed (https://docs.topazlabs.com/topaz-video/project-starlight-series/starlight-mini) |
| Starlight Sharp | Diffusion (local, **Windows/NVIDIA only**) | "sharpen low-res blurry videos… small faces"; ≥16 GB VRAM; input ≤1920×1080 recommended (https://docs.topazlabs.com/topaz-video/project-starlight-series/starlight-sharp) |
| Starlight HQ / Fast | Diffusion (cloud) | credit-priced (Precise ≈26 frames/credit at 1080p, ≈12 at 4K) (developer.topazlabs.com/video-models/starlight) |
| Proteus | GAN "default choice for video enhancement", manual sliders |
| Rhea / Rhea XL | GAN "High-fidelity 4× upscaling for fine detail" |
| Iris | GAN "Face recovery for degraded footage" |
| Nyx (Fast/XL) | GAN "High-quality denoising with natural texture preservation" |
| Artemis | GAN "Balanced denoise and sharpening" (low/med/high variants) |
| Gaia | GAN "Refinement for high-quality CGI and animation" |
| Theia | GAN "Manual clarity and detail control" (4 sliders) |
| Apollo / Chronos / Aion | Frame interpolation (slow-mo, 24→60 fps; Aion = extreme slow-mo) |
| Themis 2 | Motion deblur |
| Stabilization, SDR→HDR | Utilities |

- **Max output**: the app is limited to **16K** (15360×8640) for the GAN models (https://docs.topazlabs.com/video-ai/reference-guide/encoders-and-containers, 2024-10-29); **Starlight is capped at 4K** (docs above). So "720p → 6K" in Topaz means a GAN model (Proteus/Rhea) or Starlight-to-4K plus a second GAN pass — Topaz staff themselves recommend "1x or 2x with Starlight, then a second pass with a faster model like Gaia" (kyle.topazlabs, 2026-08-13, https://community.topazlabs.com/t/starlight-precise-2-5-2-6-super-slow-on-mac/104417).
- **CLI/automation**: yes — Topaz ships a patched FFmpeg with `tvai_up` / `tvai_fi` filters (`ffmpeg -filter_complex "tvai_up=model=prob-4:scale=0:w=…"`), documented in the FAQ (https://docs.topazlabs.com/video-ai/quick-start-guide/topaz-video-ai-faq) and shown in user pipelines (https://community.topazlabs.com/t/8k-output-with-ffv1-produces-error/99090, 2025-12-05).

### 1.4 What Topaz actually does to AI-generated footage — user evidence 2026
- r/TopazLabs, first-day user with **15-second 720p AI-generated e-commerce clips**: *"Tried many built in models yesterday but all I got was sharpening instead of restoring details with AI. Had kinda bigger expectations from Topaz Video, seems it's not the solution which can help me."* Reply (genek1953): *"if the source is textureless and 'plasticky-looking,' they're not going to invent something out of thin air."* (https://www.reddit.com/r/TopazLabs/comments/1sp7300/, 2026-04-18)
- Hostcomp YouTube review (2026-07-20): *"don't use Starlight on clean or high-quality AI clips"*; *"Even with my RTX 5080, a 20-second 720p clip took up to 30 minutes or longer"* (https://www.youtube.com/watch?v=5xnW3sgEzy4, 2026-07-20, auto-subtitles).
- Precise 2.6 on RTX 3090 24 GB: *"overly sharpened skin with dot or hexagon-shaped artifacts on people's faces"* at sharpness 3; speed *"swings wildly between 0.2–0.3 fps and occasionally 1.2 fps"* (https://www.reddit.com/r/TopazLabs/comments/1w4mlbe/, 2026-09-01).
- Precise 2.6 reactions: one user *"level 3 sharpness legit looks incredible… no sign of AI artifacting"*; another *"adds some weird misty layer that looks like you sprayed water on the screen… the subject rendered with less detail than SLM, or even SLP 2.5"*; a third: same *"animated see-through layer of random noise"* since 2.5 (https://www.reddit.com/r/TopazLabs/comments/1vodhj5/, 2026-08-14).
- Ghosting: *"there's a kind of ghosting effect… outlines of the pole overlapping onto them"* (Precise 2.5, https://www.reddit.com/r/TopazLabs/comments/1upxyje/, 2026-07-07); Topaz forum user cd1188: *"Topaz still has the same problem with ghosting"* (discussion 617, 2026-08-16).
- Refocused.ai thread (r/TopazLabs, 2026-08-24): *"i compared their sample clips with a precise 2.5 and the topaz is considerably better"*; *"Starlight precise has been so good!"* (https://www.reddit.com/r/TopazLabs/comments/1vwuyu6/). So Precise 2.5/2.6 is genuinely liked when the source is decent.

### 1.5 Topaz local speed on 16 GB RTX cards (user-measured)
| Card | Model | Measured | Source |
|---|---|---|---|
| RTX 5080 16 GB (OC) | Starlight Sharp / Precise | **0.6 fps (1.9 s/frame) / ~0.7 fps**; 5070 Ti is 8–10 % slower | https://community.topazlabs.com/t/rtx-5070-ti-rtx-5080-and-starlight/103535, 2026-06-13 |
| RTX 5070 12 GB | Precise 2.5, 740×460 → 3× (2262×1386), 3 min 07 s @25 fps | **7 h 06 min** (≈5.5 s/frame) | same thread, 2026-06-14 |
| RTX 5070 12 GB | Precise 2.5, 720×576 → 4× (2880×2304), 3 s @25 fps | **12 min 05 s** (≈9.7 s/frame) | same thread, 2026-06-14 |
| unnamed GPU | Starlight Mini, 6 s @25 fps | **28 min** | same thread, 2026-06-14 |
| RTX 5080 16 GB | Precise 2.6, 720p → 1440p, 9 s clip | GPU power collapses to 84 W, **0.0 fps, ETA >21 h** — neuroserver spills 14.6 GB into shared system memory; Topaz staff: "for 16gb gpu the model will try to use the most", max-gpu-mem setting ignored, "will fix in the next release" | https://community.topazlabs.com/t/starlight-precise-2-6-spills-into-shared-system-memory-and-drops-to-0-fps-on-rtx-5080-16gb/104650, 2026-08-24 |
| RTX 5070 Ti 16 GB | Precise 2.6 | **0.9 fps** stock; 1.25 fps with the community "SLP 2.6 Tuner Launcher" (24 GB profile); 1.6× with SeedVR2-derived settings | https://community.topazlabs.com/t/slp-2-6-tuner-launcher-major-speed-boost/104652, 2026-08-25 |
| RTX 5080 16 GB | Starlight, 20 s 720p clip | ≥30 min | YouTube Hostcomp, 2026-07-20 |
| RTX 3090 24 GB | Precise 2.5, 90-min video | 2 days 19 h | https://www.reddit.com/r/TopazLabs/comments/1upxyje/, 2026-07-07 |
| M4 Max 48 GB | Precise 2.5/2.6 | 0.1–0.2 fps | https://community.topazlabs.com/t/starlight-precise-2-5-2-6-super-slow-on-mac/104417, 2026-08-13 |

Note for this station: Topaz targets **compute capability 8.9** for Starlight Precise; the RTX 5060 Ti is CC 12.0 — even on Windows, Blackwell users report VRAM spill at 16 GB (row 5).

---

## PART 2 — Candidate local, free tools for Linux

### 2.1 Station facts [station, 2026-09-03]
- ComfyUI **0.34.0**, git commit `8a33128f` (2026-08-29), venv Python 3.12.14, **torch 2.13.0+cu130**, `torch.cuda.get_arch_list()` includes **sm_120**; ComfyUI listening on 127.0.0.1:8188; **`comfy_extras/nodes_seedvr.py` (28 KB) and `comfy/ldm/seedvr/` present**; shipped template `comfyui_workflow_templates_json/templates/utility_seedvr2_3b_int8_upscale_video.json` present; `models/diffusion_models` and `models/vae` empty; no custom nodes; `extra_model_paths.yaml` exists; `uv 0.12.5` at `/home/dxb/.local/bin/uv`.
- GPU: NVIDIA GeForce RTX 5060 Ti, 16311 MiB, driver 595.84; RAM 30 GiB; disk 1.4 TB free.

### 2.2 Comparison table

| Tool | What it is / chain? | Linux | sm_120 + cu130 evidence | Fits 16 GB (evidence) | Speed (user-measured, card named) | Temporal stability | Faces / AI video | Max output | Licence code / weights | Last release / commit | Install | Verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **SeedVR2 3B/7B — ComfyUI native** | One-step diffusion VSR; **single node graph shipped as a template**; no custom nodes | Yes (ComfyUI) | Native weights include **NVFP4 and MXFP8** (Blackwell-only formats) in Comfy-Org/SeedVR2 (HF, updated 2026-08-17); station torch lists sm_120 [station]; 5090 user runs native template (Comfy issue #15422, 2026-08-08); 5070 Ti 16 GB user runs SeedVR2 with sageattn3 on torch+cu130 (discussion #623, 2026-08-20) | **Yes**: RTX 4070 Ti **12 GB** native 3B INT8, 976×544→1952×1088, peak **6.4 GiB** (Comfy issue #15782, 2026-08-21); 5060 Ti 16 GB runs 7B-sharp Q4 images (Reddit 2025-12-21); 4070 Ti 16 GB 7B-sharp FP16 4K image peak 14.8 GB (seedvr2.net, ⚠ undated) | 4070 Ti 12 GB: **≈3.1 s/frame** at 2.1 MP output (64 fr → ~200 s; 144 fr → 440 s) (#15782); 5070 Ti 16 GB (numz node, 3B Q8, sageattn3): **1.81–1.94 fps** (#623, ⚠ resolution not stated); "6–7 minutes per 15 s clip" on 544×960 MiniMax H3 (Reddit 2026-08-04, ⚠ GPU not stated); RTX 3090: 1024→4096 image 21 s (Reddit 2026-05-31) | Built-in: 4n+1 temporal batches + native `SeedVR2TemporalChunk` (auto sizes to free VRAM) + Hann crossfade merge; flicker reported when batch too small / 3B on 5090 (Reddit 2026-03-16) — fixed by larger batch/7B | "SeedVR2 currently gives the best overall quality (cleaner detail, better textures)" on **MiniMax H3** (2026-08-04); "no model has surpassed SeedVR2 yet" (2026-04-02); caveat from ByteDance: "tend to overly generate details on… 720p AIGC videos, leading to oversharpened results occasionally" (HF card); "too sharp, makes it look artificial" (one voter, 2026-08-04) | **Arbitrary** (shortest-edge target; tiled VAE) — ≥4K demonstrated; 6K ⚠ untested in any source | **Apache-2.0 / Apache-2.0** (HF API: ByteDance-Seed/SeedVR2-3B, -7B, Comfy-Org/SeedVR2) — advertising use permitted | Comfy core merge **2026-07-10**; weights repo updated **2026-08-17**; ICLR 2026 | **Already installed** — download 2 files | **WINNER** |
| SeedVR2 via numz custom node (v2.5.23) | Same model, richer knobs (BlockSwap, GGUF, CLI) | Yes | SageAttention 3 (Blackwell) backend listed; PRs for NVFP4 (2026-01-12, 2026-08-20) **unmerged** | Yes (8–16 GB guidance) | see above | same | same | same | Apache-2.0 | main last commit **2025-12-24**; open PRs Aug–Sep 2026 unmerged | custom node + pip | Superseded by native; keep as fallback for GGUF |
| **FlashVSR v1.1** (OpenImagingLab, CVPR 2026) | One-step streaming diffusion VSR on Wan2.1, **4× only**; needs a ComfyUI node (several forks) | Yes | Official Block-Sparse-Attention "compatibility on RTX 40/50 unknown" (README); **lihaoyun6 fork added RTX 50 support via Sparse_Sage_Attention** (issue #21, 2025-10-22); FlashVSR_Stable: bf16 for RTX 3000/4000/5000 | RTX 4050 6 GB: 10 s 0.4 MP 4× in 5 min (ComfyUI-FlashVSR-Stock README, 2026-08-28); "as low as 8 GB VRAM… biggest upscale ~15 GB with DiT tiling" (CeFurkan, 2026-02-24); 16 GB profile = tiny mode + tiled VAE (FlashVSR_Stable README) | RTX 3090: **2.46 fps** 963×503→1926×1006, 240 fr, peak 22 GB (Reddit 2026-08-04); RTX 4060 Ti 16 GB: 540p→4K 141 fr **10–40 min** (2025-11-12); 4090: ~8 fps (2026-03-31) | Weaker: "Does it still have the glitching / flicker issues? … much worse than seedvr 2" (2026-02-24); naxci1: "operates in 4D, meaning there's no temporal consistency" (2026-08-20, opinion) | "significant facial degradation issues" (4060 Ti user, 2025-11-12); "FlashVSR is pretty harsh… goes too hard on sharpening, everything looks crunchy" (2026-03-31); MiniMax H3 user happy with 480p→x2 (2026-08-04) | 4× of input (1280×720→5120×2880 shown, 2026-02-24) | **Apache-2.0 / Apache-2.0** (HF JunhaoZhuang/FlashVSR-v1.1) | Weights Nov 2025; repo push 2026-09-01; forks Aug 2026 | custom node + sparse-attention wheel | **Runner-up** |
| LTX-2.3 spatial upscaler / IC-LoRA (Lightricks) | Generative "creative upsampler", 2×/4×, needs LTX-2.3 22B pipeline | Yes | ComfyUI native LTX | 16 GB with NVFP8 (⚠ FindAIVideo, 2026-03-13) | not measured | good motion (aurelm, 2026-02-22) | "LTX is by far the weakest upscaler" on MiniMax H3 (2026-08-04); "noticeably drops quality" (OP) | 4× | LTX-2 licence (community) | 2026 | multi-model | Rejected: quality + chain |
| NVIDIA RTX Video Super Resolution (VFX SDK / nvvfx) | Real-time driver-class enhancer, 1.5–4× | **Linux possible**: akdnexpat/rtx-vsr-linux spike runs `nvidia-vfx` pip on RTX 4090 with driver 595.84 (2026-08-23); ComfyUI nodes (FL-RTXVSR, Deno) are **Windows-only** | Blackwell: "Official VFX support Ampere+" — 5060 Ti ⚠ untested | Yes (0.2–0.6 GB) | 4090: 1080p→4K **3.1 ms/frame** (~330 fps) | n/a (per-frame) | "RTX barely improves anything, which is why it's so fast" (2026-04-02); "RTX Super looks better or on par with LTX" (2026-08-04) | 4× | NVIDIA Maxine EULA (free) | 2026-08 | pip + custom code | Fast previewer only, not Topaz-class |
| Video2X 6.4 | CLI/AppImage wrapper for Real-ESRGAN / RealCUGAN / Anime4K / RIFE (ncnn-Vulkan) | Yes (AppImage, deb) | Vulkan, GPU-agnostic | Yes | "really slow" (r/linux4noobs, 2026-08-11) | none (per-frame GAN) | GAN look | any | AGPL-3.0 tool; models BSD | release 6.4.0 **2025-01-24**; push 2026-03-07 | AppImage | Rejected (2019-class quality) |
| vs-mlrt / VideoJaNai / chaiNNer (TensorRT ESRGAN) | Compact ONNX/ESRGAN via VapourSynth+TensorRT | vs-mlrt yes; VideoJaNai **Windows GUI**; chaiNNer yes | TensorRT builds per-arch | Yes | fast | none | GAN look | any | GPL-3.0 | vs-mlrt v15.16 2026-03-26; chaiNNer 2026-09-03 | heavy | Rejected (no temporal model, "stack") |
| DOVE (CogVideoX-based one-step VSR) | Research | Yes | ⚠ | training 4×A100; inference ⚠ | n/a | — | — | — | Apache-2.0 | push 2026-05-20 | research | Rejected (no consumer-GPU evidence) |
| OSDEnhancer (space-time VSR, CogVideoX1.5-5B) | Research, arXiv 2026-01 | Yes | ⚠ | **"not less than 80 GB VRAM"** (README) | — | — | — | — | Apache-2.0 | ckpt 2026-06-25 | research | Rejected |
| PS-SR (HiDream, CVPR 2026) | Speculative diffusion VSR on Wan2.1-1.3B | Yes | ⚠ | ⚠ | — | — | — | — | Apache-2.0 | 2026-06-10 (28 stars) | research | Rejected (no user evidence) |
| SparkVSR | 2026 research VSR | — | — | "360p→720p, 192 frames: ~32.5 GB VRAM… requires at least 80 GB" (naxci1, 2026-03-23) | 10 s took >1 h on 16 GB | — | — | — | — | 2026-03 | — | Rejected |
| STAR / VEnhancer / Upscale-A-Video / RealBasicVSR | 2024-era diffusion/GAN VSR | Yes | none | UAV/VEnhancer 24 GB+ | slow (50-step) | — | — | — | STAR **no licence**, VEnhancer **no licence**, UAV S-Lab (NOASSERTION, ⚠ non-commercial), RealBasicVSR Apache-2.0 | 2023–2025, stale | research | Rejected (licence / age) |
| Real-ESRGAN "with temporal fixes" | Per-frame GAN + blending | Yes | fine | Yes | fast | needs external smoothing | GAN look | any | BSD-3 | 2024-08 | stack | Rejected |
| Wan 2.2 as upscaler (low-denoise v2v) | Generative refiner | Yes | — | 16 GB w/ quantized | slow | changes content | — | — | Apache-2.0 | — | stack | Rejected (not restoration) |
| BSAI-H3-upscale-4K (MiniMax H3 plugin) | Real-ESRGAN tiles wrapped for H3 | Yes | — | — | — | none | — | 4K | no licence | created 2026-08-27, 4 stars | — | Rejected |
| VRGDG SeedVR2 TensorRT Studio / 1-Click SeedVR2.5 GUI | Standalone SeedVR2 GUIs | **Windows only** (README "Windows 11"; release asset `…_setup.exe`) | — | — | 5090: 8 s clip → 2K in ~8 min (7B sharp FP16) | — | — | — | MIT / Apache-2.0 | 2026-08-31 / 2026-09-02 | — | Not for Linux |
| Refocused.ai, Topaz Astra, UniFab, Aiarty (paid) | — | — | — | — | — | — | — | — | paid | — | — | Listed for reference only; not proposed |

### 2.3 SeedVR2 — detail
- **Model**: ByteDance Seed, "SeedVR2: One-Step Video Restoration via Diffusion Adversarial Post-Training", ICLR 2026 (accepted 2026-01-27) (https://github.com/ByteDance-Seed/SeedVR). 3B distilled from 7B "achieving comparable performance with only half of the model size" (paper, arXiv 2506.05301). Adaptive window attention → arbitrary resolution.
- **Native ComfyUI**: PR #14424 "Add SeedVR2 support (CORE-6)", created 2026-06-12, **merged 2026-07-10** (https://github.com/Comfy-Org/ComfyUI/pull/14424). Nodes: `SeedVR2Preprocess`, `SeedVR2Conditioning`, `SeedVR2TemporalChunk` (auto/manual, 4n+1 pixel frames, `temporal_overlap`), `SeedVR2TemporalMerge` (Hann crossfade), `SeedVR2PostProcessing` (lab/wavelet/adain colour match); sampler is the stock KSampler with 1 step, denoise 1; VAE encode/decode use stock `VAEEncodeTiled`/`VAEDecodeTiled` (template defaults 512/128/64/8) [station, template file]. PR validation: 36.9–47.6 dB PSNR vs the previous native baseline across 3B fp8, 7B fp16, 7B sharp; multi-chunk video byte-identical across runs (PR body).
- **Official weights** (HF Comfy-Org/SeedVR2, licence apache-2.0, updated 2026-08-17, 301k downloads): `seedvr2_3b_int8_convrot.safetensors` **3.46 GB** (template default), `seedvr2_3b_fp8_e4m3fn` 3.39 GB, `seedvr2_3b_fp16` 6.78 GB, `seedvr2_3b_nvfp4` 2.00 GB, `seedvr2_3b_mxfp8` 3.56 GB, `seedvr2_7b_int8_convrot` 8.33 GB, `seedvr2_7b_sharp_int8_convrot` 8.33 GB, `seedvr2_7b_fp8_e4m3fn` 8.24 GB, `seedvr2_7b_sharp_fp16` 16.48 GB, `seedvr2_7b_nvfp4` 4.76 GB; VAE `seedvr2_ema_vae_fp16.safetensors` **0.50 GB** (https://huggingface.co/api/models/Comfy-Org/SeedVR2/tree/main/diffusion_models, 2026-09-03).
- **Known behaviour**: 3B vs 7B — "its the 3b… it's crap, if you can swing 7b do it" (5090 user answering a flicker complaint, https://www.reddit.com/r/comfyui/comments/1rvg9rh/, 2026-03-16); naxci1 (5070 Ti 16 GB, heavy user): "the best model is 3bQ8 for videos, and for single-frame images the 7b model is better" (discussion #617, 2026-08-16). MDMZ (74k views, 2026-03-27): "the batch size should ideally match the total number of frames… With a small batch size, you might notice some flickering"; 4K failed on his machine, worked on a 48 GB cloud GPU (https://www.youtube.com/watch?v=9kEux1X_I-U). Native issue: tiled VAE decode runtime superlinear in clip length; community patch exists (Comfy #15782, 2026-08-21) — hence chunk 15 s clips (the native template has trim/segment controls).
- **Commercial use**: Apache-2.0 on code and on all weight repos (HF API `license: apache-2.0` for ByteDance-Seed/SeedVR2-3B, SeedVR2-7B, Comfy-Org/SeedVR2). r/vfx (2025-07-12): "Apache 2.0 means you can use it commercially" (https://www.reddit.com/r/vfx/comments/1lxofw5/).

### 2.4 FlashVSR — detail
- CVPR 2026; "~17 FPS for 768×1408 on a single A100"; v1.1 weights Nov 2025 (5.68 GB DiT + 0.58 GB LQ_proj + 0.19 GB TCDecoder + 0.51 GB Wan2.1 VAE; HF licence apache-2.0, updated 2026-08-15). Official README: "primarily designed and optimized for 4× VSR"; third-party nodes that drop LCSA sparse attention "may lead to noticeable quality degradation" (https://github.com/OpenImagingLab/FlashVSR). RTX 50: official kernel "unknown"; lihaoyun6 fork replaced it with Sparse_Sage_Attention and "added support for running on RTX 50 series GPUs" (issue #21, 2025-10-22). Newer 2026 forks: ComfyUI-FlashVSR-Stock (2026-08-28, GPL-3.0, uses stock Comfy Wan model + INT8 ConvRot), TE-Speed-FlashVSR (2026-08-27, **Windows-only** portable build).
- Community verdict on AI video: mixed — "the only one that comes close to the commercial ones is FlashVSR. It runs at around 8fps on 4090" (2026-03-31) vs. harsh/crunchy and flicker reports above. CeFurkan (2026-02-24): "much better [than Topaz] in my tests" — note his "FlashVSR+" is his own paid-Patreon app branding (⚠ unverified independent of him).

### 2.5 Newcomers 2026 checked
OSDEnhancer (80 GB), PS-SR, SparkVSR (80 GB class), StableFlow (TIP 2026, 0 stars), NVIDIA PiD (image-only latent upscaler — "PiD is just for image models like flux and SD, RTX Super is for video", 2026-08-04). The SeedVR2 community itself (2026-03-21): "SeedVR 2.5, FlashVSR, Topaz, and others are all stalled… none of the new ones are as high-quality as SeedVR2.5" (https://github.com/numz/ComfyUI-SeedVR2_VideoUpscaler/discussions/557). SeedVR3 was promised by the author but not released as of 2026-08 (same discussions).

---

## PART 3 — Verdict

### 3.1 Recommended: SeedVR2 3B (INT8 ConvRot) through ComfyUI's native SeedVR2 nodes
Why it wins on this station:
1. It is the same class of model as Topaz's flagship — and, per the 2026-08-06 log analysis, very probably the **same base model** Topaz ships as Starlight Precise 2.5 (https://github.com/numz/ComfyUI-SeedVR2_VideoUpscaler/discussions/617). Topaz's own 2.6 notes echo SeedVR2's design ("4n+1", one-step, "Expect long render times for this diffusion model").
2. **Single tool, zero custom nodes**: already present in the installed ComfyUI 0.34.0 [station]; the shipped template is a subgraph "Upscale Video (SeedVR2 3B Int8)" with scale multiplier, trim, colour correction [station].
3. **16 GB fits with margin**: 6.4 GiB peak for 2× on a 12 GB card with tiled VAE (Comfy #15782, 2026-08-21); native `SeedVR2TemporalChunk auto` sizes chunks to free VRAM [station: `SEEDVR2_CHUNK_GIB_PER_MPX_FRAME = 0.55`, `SEEDVR2_CHUNK_RESERVED_GIB = 8.5` in `comfy/ldm/seedvr/constants.py`].
4. **Blackwell-ready**: NVFP4/MXFP8 weights exist for exactly this GPU class; torch 2.13+cu130 on the station lists sm_120; a 5070 Ti 16 GB and a 5090 run it (§2.2).
5. **Licence**: Apache-2.0 code + weights → advertising output allowed.
6. **Arbitrary output resolution** (1080p / 2K / 4K; 6K ⚠ untested) — Topaz Starlight is capped at 4K.

Expected time for a **15 s, 24 fps (360-frame) MiniMax H3 clip** on the RTX 5060 Ti 16 GB:
- **720p → 1080p (2×)**: anchor 3.1 s/frame on a 4070 Ti 12 GB with 512-px VAE tiles (#15782) and 0.52 s/frame on a 5070 Ti 16 GB with SageAttention 3 (#623, ⚠ resolution unstated). The 5060 Ti has ~60 % of a 4070 Ti's SMs but 16 GB (larger tiles, fewer passes). **⚠ Estimate: 1.0–4.0 s/frame → 6–24 min per clip; most likely 10–15 min** with the stock template, less with sageattn3 (optional, not required).
- **720p → 4K (≈4×, 8.3 MP output)**: DiT tokens and VAE pixels scale ~4× vs 1080p. **⚠ Estimate: 4–16 s/frame → 25–95 min per clip; most likely 40–60 min.** Comparable Topaz data point: RTX 5070 12 GB, 720×576 → 2880×2304 (4×) at 9.7 s/frame (2026-06-14) and a 5080 16 GB stalling at 720p→1440p (2026-08-24).
- **→ 6K**: ⚠ no measurement found for any tool; memory is bounded by tiled decode, time ≈ 2.25× the 4K figure (⚠ 1.5–3.5 h per clip). Treat 6K as a batch/overnight job or run 4K + a second pass.

### 3.2 Runner-up: FlashVSR v1.1 (lihaoyun6 or FlashVSR-Stock ComfyUI node) — and why it lost
Faster per frame (3090: 2.46 fps at 2×; 4090: ~8 fps) and Apache-2.0, and the one tool an actual MiniMax H3 user chose for 480p→2× (2026-08-04). It lost because: (a) locked to 4× (720p → 2880p or 5K, not 1080p/4K directly without pre-resize), (b) repeated 2026 reports of flicker and face degradation and "crunchy" over-sharpening, (c) official RTX 50 kernel support is "unknown" — the working path is a community fork, and (d) it needs a custom node plus a sparse-attention wheel, i.e. it is not "already in the box".

### 3.3 Honest gaps — what Topaz does that no free local tool does
- **One app, many jobs**: frame interpolation (Apollo/Chronos/Aion), stabilization, SDR→HDR, motion deblur (Themis), deinterlace (Dione), a preview UI with A/B, and a supported ffmpeg CLI — in one installer. Locally on Linux those are separate models (RIFE etc.); SeedVR2 does only restoration/upscale. Evidence: pricing/model list (topazlabs.com/pricing) vs. the SeedVR2 node set [station].
- **Vendor support + continuous tuning**: Precise 2.6 (2026-08-11) claims "+15 % speed, improved temporal consistency"; the open SeedVR2 has had no new model since mid-2025 ("SeedVR3" unreleased; numz node unmaintained since 2025-12-24; Comfy core maintains the node instead).
- **Ghosting/flicker parity is unclear**: users report ghosting in both (§1.4; cd1188 in #617). Neither side wins on evidence.

What the free local tools do **better** than Topaz (with evidence):
- **Linux** — Topaz: none since a 2024 beta (§1.2).
- **16 GB behaviour** — Topaz Precise 2.6 spills to shared memory and drops to 0 fps on a 5080 16 GB at 720p→1440p (2026-08-24); ComfyUI native SeedVR2 3B ran 2× in 6.4 GiB on a 12 GB card (2026-08-21) and auto-chunks to free VRAM.
- **Output resolution** — Starlight capped at 4K (Topaz docs); SeedVR2 arbitrary.
- **Cost** — $299–$799/yr vs $0; MDMZ (2026-03-27): "For a tool that's absolutely free, SeedVR stands really strong" (while preferring Topaz's UI).
- **Speed head-to-head on the same 16 GB Blackwell card** — naxci1, RTX 5070 Ti: Topaz SLP 2.6 0.9 fps stock (1.25–1.6× with a community tuner) vs SeedVR2 1.81–1.94 fps (⚠ resolutions not stated; same user, same card, 2026-08-20/25).
- **Model choice** — 7B / 7B-sharp / NVFP4 variants; Topaz exposes one 3B-class Starlight locally.

### 3.4 Exact install path — isolated, sharing model files, never touching `/home/dxb/tools/ComfyUI/.venv`
(Proposed; NOT executed this session. All paths absolute. Nothing below writes into the existing venv.)

```bash
# 0. Shared model store (neutral location; the main ComfyUI can be pointed at it later via its own extra_model_paths.yaml)
mkdir -p /home/dxb/models/seedvr2/diffusion_models /home/dxb/models/seedvr2/vae

# 1. Weights (official Comfy-Org repo, Apache-2.0) — 3.46 GB + 0.50 GB; add the 7B-sharp INT8 (8.33 GB) for the A/B
cd /home/dxb/models/seedvr2
curl -L -o diffusion_models/seedvr2_3b_int8_convrot.safetensors \
  https://huggingface.co/Comfy-Org/SeedVR2/resolve/main/diffusion_models/seedvr2_3b_int8_convrot.safetensors
curl -L -o diffusion_models/seedvr2_7b_sharp_int8_convrot.safetensors \
  https://huggingface.co/Comfy-Org/SeedVR2/resolve/main/diffusion_models/seedvr2_7b_sharp_int8_convrot.safetensors
curl -L -o vae/seedvr2_ema_vae_fp16.safetensors \
  https://huggingface.co/Comfy-Org/SeedVR2/resolve/main/vae/seedvr2_ema_vae_fp16.safetensors

# 2. Isolated second ComfyUI (own venv, own port 8189; the production one stays on 8188)
git clone --branch v0.34.0 --depth 1 https://github.com/Comfy-Org/ComfyUI.git /home/dxb/tools/ComfyUI-upscale
cd /home/dxb/tools/ComfyUI-upscale
uv venv --python 3.12 .venv
uv pip install --python .venv/bin/python torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu130
uv pip install --python .venv/bin/python -r requirements.txt

# 3. Point the isolated copy at the shared model store
cat > /home/dxb/tools/ComfyUI-upscale/extra_model_paths.yaml <<'EOF'
seedvr2_shared:
  base_path: /home/dxb/models/seedvr2/
  is_default: true
  diffusion_models: diffusion_models/
  vae: vae/
EOF

# 4. Run (separate port; open the shipped template "Upscale Video (SeedVR2 3B Int8)" from Templates → Utility)
.venv/bin/python main.py --listen 127.0.0.1 --port 8189
```
Optional accelerator, only after the baseline A/B: `sageattention` (v3 = Blackwell) — the 5070 Ti numbers above used it; it is not required by the native node.

Blast-radius note for the executor: the only shared thing is the model directory; the production ComfyUI, its venv, port 8188 and its `extra_model_paths.yaml` are untouched. If the main install should later see the same weights, add the same four-line block to `/home/dxb/tools/ComfyUI/extra_model_paths.yaml` (a separate change, made only on the CEO's word — nothing of the kind is approved today).

### 3.5 First 3-clip A/B test (what to run, what to record)
Clips: three real MiniMax H3 outputs from the download folder — (1) a face close-up with skin, (2) fast motion / camera move, (3) text or logo on a product. Each 5–15 s, 24 fps, 864×480 or 1152×640.

Runs per clip (stock template, `scale_multiplier` set so the shortest edge lands on the target; seed fixed; `denoise=1`; `color_correction_method=none` then `lab`):
1. 3B INT8 → 1080p (2×/2.25×)
2. 3B INT8 → 4K
3. 7B-sharp INT8 → 1080p (VRAM check on 16 GB; expect chunk auto to shrink `frames_per_chunk`)
4. If 4K holds: 7B-sharp INT8 → 4K

Record per run: wall time, s/frame (frames ÷ seconds), `nvidia-smi` peak VRAM, `SeedVR2TemporalChunk auto` log line (`free=…GiB … frames_per_chunk=…`), and three eye checks at 100 % zoom on a 4K monitor — (a) skin texture (waxy vs. sharpened-hexagon artifacts, cf. Topaz 2.6 complaint), (b) flicker on the moving object between chunk boundaries (set `temporal_overlap` 2–4 latent frames if seams show), (c) text legibility. Deliverable: a side-by-side MP4 (original | 3B | 7B) per clip. Any "sharper than the source but fake" verdict → test `seedvr2_3b_int8_convrot` with a 0.9 denoise and the wavelet colour match before touching a second model — "zero is a real answer" applies: if the H3 clip is already clean 1080p-class, SeedVR2 may only add sharpening (ByteDance's own AIGC-720p caveat).

### 3.6 Paid, for reference only (not proposed)
Topaz Astra (cloud), Refocused.ai (desktop, Windows), UniFab, Aiarty — listed because they appear in the 2026 threads; none is local-free-Linux.

---

## Sources (all fetched 2026-09-03; dates are the sources' own)
- Topaz pricing: https://www.topazlabs.com/pricing · developer model list: https://developer.topazlabs.com/video-models · Starlight Precise 2.5/2.6 docs: https://docs.topazlabs.com/topaz-video/project-starlight-series/starlight-precise-25 · Mini: https://docs.topazlabs.com/topaz-video/project-starlight-series/starlight-mini · Sharp: https://docs.topazlabs.com/topaz-video/project-starlight-series/starlight-sharp · 16K limit: https://docs.topazlabs.com/video-ai/reference-guide/encoders-and-containers · CLI FAQ: https://docs.topazlabs.com/video-ai/quick-start-guide/topaz-video-ai-faq
- Topaz forum: Linux beta 2024-04-30 /t/68739 · Using on Linux 2025-07-20 /t/93515 · Linux request 2026-05-08 /t/102669 · 5070 Ti/5080 Starlight 2026-06-13 /t/103535 · Precise 2.6 spill 5080 2026-08-24 /t/104650 · SLP tuner 2026-08-25 /t/104652 · 1.7.0 release 2026-08-11 /t/104328 · Mac slow 2026-08-13 /t/104417 · GPU recommendations 2026-08-19 /t/104574 · Adobe acquisition thread 2026-06-25 /t/103761
- Adobe/Topaz: https://news.adobe.com/news/2026/06/adobe-to-acquire-topaz-labs (2026-06-25); https://techcrunch.com/2026/06/25/adobe-acquires-image-and-video-enhancement-tool-maker-topaz-labs/
- SeedVR2: https://github.com/ByteDance-Seed/SeedVR (ICLR 2026, push 2026-01-27) · https://huggingface.co/ByteDance-Seed/SeedVR2-7B (Apache-2.0; AIGC-720p caveat) · https://huggingface.co/Comfy-Org/SeedVR2 (2026-08-17) · Comfy docs https://docs.comfy.org/tutorials/utility/seedvr2 · PR https://github.com/Comfy-Org/ComfyUI/pull/14424 (merged 2026-07-10) · issues #15422 (2026-08-08), #15782 (2026-08-21) · numz node https://github.com/numz/ComfyUI-SeedVR2_VideoUpscaler (v2.5.23, 2025-12-24) · discussions #617 (2026-08-06), #557 (2026-03-21), #623 (2026-08-20)
- FlashVSR: https://github.com/OpenImagingLab/FlashVSR (push 2026-09-01) · https://huggingface.co/JunhaoZhuang/FlashVSR-v1.1 (Apache-2.0) · issue #21 (2025-10-21/22) · https://github.com/naxci1/ComfyUI-FlashVSR_Stable · https://github.com/Pizzawookiee/ComfyUI-FlashVSR-Stock (2026-08-28) · https://github.com/tl2012tl/TE-Speed-FlashVSR (2026-08-27)
- Reddit: r/StableDiffusion MiniMax H3 comparison 2026-08-04 /comments/1vfmjla · Flash VR MiniMax H3 2026-08-04 /comments/1vffg2s · RTX VSR vs SeedVR2 2026-04-02 /comments/1saea3x · best video upscaler 2026-03-31 /comments/1s8gaz2 · PiD vs SeedVR2 2026-05-31 /comments/1tt8h2w · FlashVSR+ 2026-02-24 /comments/1rdj56c and /comments/1rd3e9y · FlashVSR 16 GB 2025-11-12 /comments/1ov8zlr · Z-Image 5060 Ti 2025-12-21 /comments/1ps03qc · r/comfyui Wan2.2+SeedVR2 flicker 2026-03-16 /comments/1rvg9rh · r/vfx 2025-07-12 /comments/1lxofw5 · r/TopazLabs AI video 2026-04-18 /comments/1sp7300 · Precise 2.6 update 2026-08-14 /comments/1vodhj5 · Precise 2.6 artifacts 2026-09-01 /comments/1w4mlbe · Hi8 5090 benchmarks 2026-07-07 /comments/1upxyje · Refocused 2026-08-24 /comments/1vwuyu6 · r/linux4noobs 2026-08-11 /comments/1vl63ss and 2026-07-29 /comments/1v9p49w
- YouTube (auto-subtitles): MDMZ "SeedVR 2.5 ComfyUI Tutorial" 2026-03-27 https://www.youtube.com/watch?v=9kEux1X_I-U · ErrorFixer "Upscale ANY Video to 4K… SeedVR2" 2026-08-13 https://www.youtube.com/watch?v=eroKfXPwy2k · Hostcomp "Topaz Video AI 2026: Starlight Precise 2.5 vs Astra 2" 2026-07-20 https://www.youtube.com/watch?v=5xnW3sgEzy4
- Others: https://github.com/akdnexpat/rtx-vsr-linux (2026-08-23) · https://github.com/filliptm/ComfyUI-FL-RTXVSR (Windows) · https://github.com/k4yt3x/video2x (6.4.0, 2025-01-24) · https://github.com/W-Shuoyan/OSDEnhancer (2026-06-25) · https://github.com/HiDream-ai/PS-SR (2026-06-10) · https://github.com/vrgamegirl19/VRGDG-SeedVR2-TensorRT-Studio (Windows, 2026-08-31) · https://github.com/naxci1/1Click_SeedVR2.5 (Windows .exe, v1.9.68b 2026-09-02) · https://aurelm.com/2026/02/22/using-ltx-2-as-an-upscaler-temporal-and-spatial-for-wan-2-2/ (2026-02-22)
