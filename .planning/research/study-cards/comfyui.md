# Study Card: ComfyUI

> WRITTEN 2026-09-01. The card is owed retroactively: ComfyUI has been the bench under every media
> engine this holding runs since 2026-08-30, and it had no card. Board rows **B33** (the bench) and
> **B43** (the studio).

- **Tool:** ComfyUI — the local workbench every media model on this station runs inside. It is not
  a model; it is the thing that loads models, wires them together and executes the graph.
- **Slug:** comfyui
- **Category:** Media/content (execution bench)
- **Status:** ADOPT (live since 2026-08-30; two video checkpoints and one image model run on it)
- **Target Phase:** 10+ (B43)
- **Owner (dept/tier):** Creative / Social Media — generation bench
- **Trigger Type:** service (local HTTP at `127.0.0.1:8188`)
- **Source:** `/home/dxb/tools/ComfyUI` · started by `/home/dxb/tools/h3/start-server.sh`
- **Official Docs URL:** https://docs.comfy.org

## What runs on it today, measured 2026-09-01

- **MiniMax H3 FL2VA** and **REF2VA** — video with native sound (`study-cards/minimax-h3.md`)
- **FLUX.1-Krea-dev** — images (`study-cards/flux-krea-dev.md`)
- Driven from `/home/dxb/tools/h3/`: `run.py` (video), `img.py` (image), `workflow.py` (graphs)

## Two things about this machine that are not in any manual

**① The weights do NOT live in the checkout.** 34 GB of models sit in `/home/dxb/tools/ComfyUI-models/`
and are attached through `extra_model_paths.yaml`, so updating ComfyUI never touches them. A model
copied into the checkout instead is a mistake that survives until the next update deletes it.

**② The start flags are chosen against THIS card's real constraint, not against a recipe.**
`--fast-disk --cache-none --use-sage-attention --reserve-vram 0.8`, no `--highvram`. The machine has
16,311 MiB of card against ~20 GB of resident model and 30 GiB of system memory; `--highvram` pins
the model and kills the run.

## The trap that cost time on 2026-09-01, written so it costs nobody else any

**A new model is invisible until the process that holds port 8188 actually dies.** A restart was
issued, the log said `Port 8188 is already in use on address 127.0.0.1`, and the server that kept
answering was the OLD one from the previous day — so `extra_model_paths.yaml` looked broken when it
was correct. Find the owner of the port and kill THAT:

```
ss -lptnH 'sport = :8188'   →  users:(("python",pid=2390210,...))
```

**Rule: after adding a model, confirm it by asking the server, not by trusting the restart:**

```
curl -s http://127.0.0.1:8188/object_info/UNETLoader   # the new file must be in the list
```
