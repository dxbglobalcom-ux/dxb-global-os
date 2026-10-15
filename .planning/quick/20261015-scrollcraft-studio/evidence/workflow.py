"""DXB — MiniMax H3 on the holding's own card, the researched path.

ComfyUI + PyTorch cu130 + fp8_scaled denoiser + nvfp4 text encoder + the 4-step
turbo LoRA. Written 2026-08-30 after the Vulkan/sd-cli path crashed the card's GSP
(Xid 62 -> 154) and the CEO refused the 1.6 s clip it produced.

Emits an API-format prompt for ComfyUI's /prompt endpoint.
"""

DENOISER = "minimax_h3_fl2va_pruned_fp8_scaled.safetensors"
TEXT_ENCODER = "qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors"
VIDEO_VAE = "minimax_h3_video_vae_fp16.safetensors"
AUDIO_VAE = "minimax_h3_audio_vae_fp32.safetensors"
TURBO_LORA = "minimax_h3_fl2v_turbo_4step_v1.0_768p_comfyui_bf16.safetensors"


def align_frames(seconds, fps=24):
    """H3 snaps frame counts to the 17k+5 grid; 124 = ~5.2 s, 362 = ~15.1 s."""
    n = max(5, round(seconds * fps))
    while n % 17 != 5:
        n += 1
    return n


def build(prompt, width, height, length, steps=4, seed=42, prefix="h3",
          first_frame=None, last_frame=None, lora=TURBO_LORA, cfg=1.0,
          negative_prompt=None):
    """first_frame / last_frame: filenames inside ComfyUI/input.

    FL2VA means FIRST-and-LAST-to-video. Given only a first frame the model has no
    destination: it holds the supplied face for about a second and a half and then
    drifts — measured 2026-08-31 on the Badr fight shot, where the same warrior went
    from pores, wet eyes and a stamped helmet at 7.7 s to a featureless doll with no
    helmet ornament at 10.8 s, inside one 3.75 s shot. Giving the closing photograph
    too forces the model to ARRIVE somewhere real, and it costs no extra card time.
    ComfyUI's node has taken it all along (comfy_extras/nodes_minimax_h3.py:129);
    this builder simply never passed it."""
    wf = {
        "1": {"class_type": "UNETLoader",
              "inputs": {"unet_name": DENOISER, "weight_dtype": "default"}},
        "2": {"class_type": "CLIPLoader",
              "inputs": {"clip_name": TEXT_ENCODER, "type": "minimax", "device": "default"}},
        "3": {"class_type": "VAELoader", "inputs": {"vae_name": VIDEO_VAE}},
        "4": {"class_type": "VAELoader", "inputs": {"vae_name": AUDIO_VAE}},
        "6": {"class_type": "MiniMaxH3SigmaShift",
              "inputs": {"model": ["5", 0] if lora else ["1", 0], "shift_video": 12.0, "shift_audio": 3.0}},
        "7": {"class_type": "MiniMaxH3ImageToVideo",
              "inputs": {"clip": ["2", 0], "vae": ["3", 0], "prompt": prompt,
                         "width": width, "height": height, "length": length}},
        "8": {"class_type": "ConditioningZeroOut", "inputs": {"conditioning": ["7", 0]}},
        "9": {"class_type": "KSampler",
              "inputs": {"model": ["6", 0], "positive": ["7", 0], "negative": ["8", 0],
                         "latent_image": ["7", 1], "seed": seed, "steps": steps,
                         "cfg": cfg, "sampler_name": "euler", "scheduler": "simple",
                         "denoise": 1.0}},
        "10": {"class_type": "VAEDecode", "inputs": {"samples": ["9", 0], "vae": ["3", 0]}},
        "11": {"class_type": "VAEDecodeAudio", "inputs": {"samples": ["9", 0], "vae": ["4", 0]}},
        "12": {"class_type": "CreateVideo",
               "inputs": {"images": ["10", 0], "fps": 24.0, "audio": ["11", 0]}},
        "13": {"class_type": "SaveVideo",
               "inputs": {"video": ["12", 0], "filename_prefix": prefix, "format": "mp4"}},
    }
    if lora:
        wf["5"] = {"class_type": "LoraLoaderModelOnly",
                   "inputs": {"model": ["1", 0], "lora_name": lora, "strength_model": 1.0}}
    if cfg > 1.0:
        # A turbo LoRA is trained for cfg 1.0 and its negative branch is a zeroed copy of
        # the positive one. Off the shortcut the sampler needs a real negative branch or
        # guidance has nothing to push away from.
        wf["16"] = {"class_type": "MiniMaxH3ImageToVideo",
                    "inputs": {"clip": ["2", 0], "vae": ["3", 0],
                               "prompt": negative_prompt or "",
                               "width": width, "height": height, "length": length}}
        wf["9"]["inputs"]["negative"] = ["16", 0]
    if first_frame:
        wf["14"] = {"class_type": "LoadImage", "inputs": {"image": first_frame}}
        wf["7"]["inputs"]["first_frame"] = ["14", 0]
    if last_frame:
        wf["15"] = {"class_type": "LoadImage", "inputs": {"image": last_frame}}
        wf["7"]["inputs"]["last_frame"] = ["15", 0]
    return wf


# ── REF2VA ──────────────────────────────────────────────────────────────────
# The second checkpoint, and the one B43 calls the capability this business
# sells: "Ref2VA, not text-to-video". It takes up to 9 photographs, 3 videos and
# 3 audio references into ONE generation and binds the shot to them — the same
# face, the same jacket, the same handbag, shot after shot. It sat on disk from
# 2026-08-31 19:44 and was never loaded once; the cut the CEO refused was made
# without it. References are addressed in the prompt as <Picture 1>, <Picture 2>…
REF_DENOISER = "minimax_h3_ref2va_pruned_fp8_scaled.safetensors"
REF_TURBO_LORA = "minimax_h3_ref2v_turbo_4step_v0.1_comfyui_bf16.safetensors"


def build_ref(prompt, width, height, length, refs, steps=4, seed=42, prefix="h3ref",
              lora=REF_TURBO_LORA, cfg=1.0, negative_prompt=None, ref_image_size="match",
              ref_audios=None):
    """refs: filenames inside ComfyUI/input, in the order the prompt calls them.

    ref_image_size "max" carries each reference at a 2048px short edge instead of
    scaling it to the generation's own pixel area — the node's own tooltip calls it
    "best identity fidelity", and warns the reference tokens ride through every
    sampling step, so it costs card time on every step, not once.
    """
    if not 1 <= len(refs) <= 9:
        raise ValueError("ref2va takes 1 to 9 reference images")
    wf = {
        "1": {"class_type": "UNETLoader",
              "inputs": {"unet_name": REF_DENOISER, "weight_dtype": "default"}},
        "2": {"class_type": "CLIPLoader",
              "inputs": {"clip_name": TEXT_ENCODER, "type": "minimax", "device": "default"}},
        "3": {"class_type": "VAELoader", "inputs": {"vae_name": VIDEO_VAE}},
        "4": {"class_type": "VAELoader", "inputs": {"vae_name": AUDIO_VAE}},
        "6": {"class_type": "MiniMaxH3SigmaShift",
              "inputs": {"model": ["5", 0] if lora else ["1", 0],
                         "shift_video": 12.0, "shift_audio": 3.0}},
        "7": {"class_type": "MiniMaxH3ReferenceToVideo",
              "inputs": {"clip": ["2", 0], "vae": ["3", 0], "audio_vae": ["4", 0],
                         "prompt": prompt, "width": width, "height": height,
                         "length": length, "ref_image_size": ref_image_size}},
        "8": {"class_type": "ConditioningZeroOut", "inputs": {"conditioning": ["7", 0]}},
        "9": {"class_type": "KSampler",
              "inputs": {"model": ["6", 0], "positive": ["7", 0], "negative": ["8", 0],
                         "latent_image": ["7", 1], "seed": seed, "steps": steps,
                         "cfg": cfg, "sampler_name": "euler", "scheduler": "simple",
                         "denoise": 1.0}},
        "10": {"class_type": "VAEDecode", "inputs": {"samples": ["9", 0], "vae": ["3", 0]}},
        "11": {"class_type": "VAEDecodeAudio", "inputs": {"samples": ["9", 0], "vae": ["4", 0]}},
        "12": {"class_type": "CreateVideo",
               "inputs": {"images": ["10", 0], "fps": 24.0, "audio": ["11", 0]}},
        "13": {"class_type": "SaveVideo",
               "inputs": {"video": ["12", 0], "filename_prefix": prefix, "format": "mp4"}},
    }
    if lora:
        wf["5"] = {"class_type": "LoraLoaderModelOnly",
                   "inputs": {"model": ["1", 0], "lora_name": lora, "strength_model": 1.0}}
    if cfg > 1.0:
        wf["16"] = {"class_type": "MiniMaxH3ReferenceToVideo",
                    "inputs": {"clip": ["2", 0], "vae": ["3", 0], "audio_vae": ["4", 0],
                               "prompt": negative_prompt or "",
                               "width": width, "height": height, "length": length,
                               "ref_image_size": ref_image_size}}
        wf["9"]["inputs"]["negative"] = ["16", 0]
    # The node's Autogrow template names its slots ref_image_0 … ref_image_8
    # (_io.py:1125, range(max)) — but the executor addresses a dynamic input by its
    # FULL DOTTED PATH, parent first: finalize_prefix joins the list with "."
    # (_io.py:1080), so the API key is "ref_images.ref_image_0". Sending the bare
    # name reaches execute() as an unknown kwarg and the node raises TypeError —
    # measured 2026-09-01, the first ref2va attempt died exactly there.
    # In the PROMPT the same picture is addressed 1-based: <Picture 1>.
    for i, fn in enumerate(refs):
        nid = str(20 + i)
        wf[nid] = {"class_type": "LoadImage", "inputs": {"image": fn}}
        wf["7"]["inputs"][f"ref_images.ref_image_{i}"] = [nid, 0]
        if cfg > 1.0:
            wf["16"]["inputs"][f"ref_images.ref_image_{i}"] = [nid, 0]
    # Ref2VA also takes up to THREE standalone reference sounds, on the same dotted-path
    # rule as the pictures ("ref_audios.ref_audio_0"). It is the node's own slot for
    # handing the model a voice, and whether it moves the mouth to that voice on this
    # checkpoint is a MEASUREMENT, not a promise — the film is cut to work either way.
    for i, fn in enumerate(ref_audios or []):
        nid = str(40 + i)
        wf[nid] = {"class_type": "LoadAudio", "inputs": {"audio": fn}}
        wf["7"]["inputs"][f"ref_audios.ref_audio_{i}"] = [nid, 0]
        if cfg > 1.0:
            wf["16"]["inputs"][f"ref_audios.ref_audio_{i}"] = [nid, 0]
    return wf
