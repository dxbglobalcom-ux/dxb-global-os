# Study Card: MiniMax H3 (Hailuo 3.0)

> WRITTEN 2026-08-30 — opened by the CEO, who brought the model to the holding himself through an
> Instagram reel. Board row **B42** (the arsenal watch) carries why it took 28 days for this
> holding to hear of a model released 2026-08-02.

- **Tool:** MiniMax H3 — omni-modal video model: text / image / video / audio in, **video with native
  stereo audio out**, 4-15 s at 24 fps, up to 2K
- **Slug:** minimax-h3
- **Category:** Media/content (video generation)
- **Status:** INSTALL — **the CEO has now seen four finished films made with it (2026-09-01) and
  REJECTED all four**: *"beğenmedim kesinlikle. gerçek insan gibi durmuorlar kesinlikle yapay zeka
  gibi duorlar."* It stays the holding's volume engine; it is NOT adopted for a shot a client's eye
  lands on. Cause measured, see §2026-09-01.
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

| **1152×640 + FIRST FRAME** | 0.74 | 15.08 s (362 f) | **646.2 s = 10.77 min** | 15,396 MiB | 25.3 GiB | 5.9 GiB | ✅ |

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

### ★ THE QUALITY LEVER, MEASURED 2026-08-31 — a first frame is worth more than any flag

**The CEO refused the text-only clips** (*"üretilen ürünleri çok beğenmedim"*) and he was right:
every run above drove the model in its WEAKEST mode — a sentence in, a whole world invented.
**FL2VA exists precisely to avoid that.** One hero still was generated first by the holding's free
image hand (**Antigravity CLI**, $0.00, board B28) at exactly the target canvas, handed to
`MiniMaxH3ImageToVideo.first_frame`, and the prompt was rewritten to describe **motion only**.
Same card, same canvas, same 362 frames, same 4 steps, same seed 42:

| | text-only | **first frame** |
|---|---|---|
| Wall clock | 620.1 s | **646.2 s** (+26 s, +4.2 %) |
| File size at identical codec/canvas/duration | 3.92 MB | **6.40 MB (+63 %)** |
| Peak RAM · swap | 19.5 GiB · 1.5 GiB | 25.3 GiB · 5.9 GiB ⚠ |
| Cost | $0.00 | $0.00 |

**+63 % of encoded data at the same resolution and duration is detail the encoder could not throw
away** — it is the numeric shadow of a visibly sharper picture, and frame 0 of the output is the
supplied still, byte for byte in composition. **The lesson generalises past H3: most of what makes
an advertisement frame right is PHOTOGRAPHY — angle, light, reflection, depth of field. Asking a
video model for the photograph AND the motion in one breath gets both half-done.**
⚠ The RAM and swap figures were taken while a 23 GB download ran on the same NVMe, so the clock and
the swap peak are CONTAMINATED — the picture result is not.

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
# ① make the hero still FIRST — this is the quality step, not an optional extra
cd "$REPO/var/media-factory" && agy --dangerously-skip-permissions --print='...1152x640 still...'
cp <that file> /home/dxb/tools/ComfyUI/input/hero_frame.png
# ② then ask the model only for motion
/home/dxb/tools/h3/start-server.sh          # ComfyUI, the flags that matter
/home/dxb/tools/h3/run.py --seconds 15 --width 1152 --height 640 \
    --first-frame hero_frame.png --prompt '<motion only, not the scene>'
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
5. **Licence — CLOSED BY THE CEO, 2026-08-31, AND NOT TO BE RE-OPENED.** <!-- CEO-OK: b28-minimax-licence-waived-2026-08-31 -->
   MiniMax sponsors DXB and **waived the on-interface "MiniMax H3" attribution** for DXB's commercial
   work, in return for a MiniMax sale DXB made — his order: *"…arayüzde miniamx yazmanıza gerek yok
   dediler bu CEO emri bu şekilde işlensin okadar ve bu konuda bir daha açılmasın."* The clause that
   stood here is **deleted, not kept beside the ruling** (LAW A). The territory question was settled
   the day before on the same authority. **No licence condition follows this model into DXB's client
   work, and no session raises the subject again on any row.** Board row B28 owns the record.
   For completeness of the technical record only: the text encoder (Qwen3-VL-32B) is Apache-2.0, and
   model derivatives by distillation are forbidden (§I.11 + §V) — outputs are not derivatives (§IV.4).

## Not yet measured

- **8-step turbo LoRA** (`minimax_h3_fl2v_turbo_8step`, 1.82 GB) — **downloaded 2026-08-31 on the
  CEO's order, NOT yet run.** Twice the steps, better motion, unknown cost. Every figure in this card
  was taken at 4 steps, which is the floor and not the ceiling.
- **`--fast fp8_matrix_mult` / `fp16_accumulation`** — ComfyUI marks them *"untested and potentially
  quality deteriorating… might crash your comfyui"*, and this session deliberately took the clean
  baseline first.
- **`ref2va`** (`minimax_h3_ref2va_pruned_fp8_scaled`, 19.52 GB, + its own 4-step turbo LoRA) —
  **downloaded 2026-08-31 on the CEO's order, NOT yet run.** It binds **up to 9 images, 3 videos and
  3 audio references** into one shot, which is how a real client brand enters a shot; the first-frame
  result above is the one-image case of the same idea, and it already moved the needle.
- **Energy per clip.** The card averaged 147.9 W over the 5-second run and 170.0 W over the 15-second
  one; the cost per rendered minute belongs to B33 and is not computed here.

- **Install Command:** ComfyUI at `/home/dxb/tools/ComfyUI` (`.venv` is a `uv` venv — it has no `pip`,
  use `uv pip install --python .venv/bin/python`); PyTorch `2.13.0+cu130`; `sageattention==1.0.6`;
  weights `hf download Comfy-Org/MiniMax-H3 <file> --local-dir /home/dxb/tools/ComfyUI-models/comfyorg`.
- **Legitimacy Verdict:** OK to run — open weights, no account, no outward call, no credential. The
  territorial clause and the interface-attribution clause are the conditions that follow it into any
  client work.


---

## ★ 2026-09-01 — the full production test, five measurements that change how it is used

Four films were made end to end on this card and **the CEO rejected all four** (board **B43**).
What the day actually established:

**① REF2VA is live, and it is the engine for people.** Second checkpoint wired this day
(`workflow.py: build_ref`, `run.py --ref`). It takes up to **9 reference images, 3 videos, 3
standalone sounds** and pins identity across separate shots. **The scene is written by the director
in the prompt; the references carry identity only** — the earlier reading that "Ref2VA invents the
action" was wrong and was disproved by measurement (`lab/exp3.sh`: all four written beats appeared).

**② WHY ONE HUMAN READ AS REAL AND THE OTHERS DID NOT — and it is not the engine.** The woman in the
UGC film entered as a **real photograph** bound through REF2VA. The Badr warriors were **drawn from
sentences** and moved through FL2VA, which has no identity engine at all. **⇒ For any human the
client's eye lands on: a real photograph, through REF2VA. FL2VA is for products and camera-exact
moves. A drawn human is scrap.**

**③ THE LORA/STEP PAIRING IS A LAW, NOT A SETTING.** A 4-step-distilled turbo LoRA sampled at 8
steps is off its trained schedule and destroys fine structure — a sword vanished from a hand at
frame 21. Proven on one shot, one seed, only the pairing moving (`lab/exp1.sh`): 4-step LoRA @ 4
steps = 65 s ✅ · **8-step LoRA @ 8 steps = 95 s ✅ (blade whole)** · 8-step LoRA @ 4 steps = 65 s.
**Match the LoRA to its own step count. Never run a 4-step LoRA at 8 steps.**

**④ CUTTING COSTS CARD TIME — the shot list is a financial decision.** One 15.08 s shot = 620 s =
**41.1 s of card per finished second**. The same 17.83 s delivered as **eight** shots = 1,006 s =
**56.4 s per finished second, +37 %**. Every cut restarts the engine.

**⑤ THE LENGTH CEILING IS THE MODEL'S OWN.** The node states `trained range is ~124-362` frames —
**362 frames = 15.08 s is the longest single generation, and no prompt length changes it.** A
594-word full director's brief was run against a 125-word one to test exactly that (`lab/t2v-max.log`).
A 30-second film is 6-10 shots cut together; it is never one generation.

**Also wired this day:** the node's `ref_audios` slot (up to 3 standalone sounds, dotted-path key
`ref_audios.ref_audio_0`), used to hand the model a real spoken line. ⚠ Whether this checkpoint
moves the mouth to that sound is **UNVERIFIED** — the cut lays the voice in post either way.

**API-key trap, measured:** the node's dynamic inputs are addressed by their FULL DOTTED PATH —
`ref_images.ref_image_0`, not `ref_image_0`. The bare name reaches `execute()` as an unknown keyword
and the node raises `TypeError`.
