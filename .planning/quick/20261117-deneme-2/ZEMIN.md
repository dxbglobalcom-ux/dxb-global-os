<!-- The ground read for the second trial · an Opus 5.5 helper at medium, read-only, 2026-11-17. The lead's sample check is in the commit message. -->

I could not find any real product photograph on this machine (section 3), so trial jobs will need real product photos supplied. The other four headings are answered from the files, with paths.

## 1. How the first trial was run (`/home/dxb/deneme-1/`, read only, nothing run)

- **Launch.** Arms A and B (`run-kol.sh`, later `run-kol-r.sh`) were headless runs: `systemd-run --user --scope -p MemoryMax=8G -p MemorySwapMax=2G -- bwrap … -- claude -p --model claude-opus-5-5 --effort max --dangerously-skip-permissions --setting-sources project,local --strict-mcp-config --mcp-config '{playwright only}' --output-format stream-json --verbose "<prompt>"`. Output went to `logs/<kol>.jsonl`.
  - Arm A moved to an interactive session inside `screen` (`run-kol-i.sh`, MemoryMax=12G, `--disallowedTools AskUserQuestion,EnterPlanMode,ExitPlanMode`). The script first clears the `CLAUDE*` environment variables inherited from the parent session.
  - Arm C (`run-kol-c.sh`) used the same setup with `Agent,Task` also disallowed.
  - Every arm ran with effort `max` and the working directory `/home/dxb/mavi-kusak`, which is the arm's own folder bind-mounted there. The Claude home was the real `~/.claude`, with parts hidden.
- **The wall** (`run-kol.sh`).
  - tmpfs over: the repo, `~/.claude/projects` (the arm's own `proj-kol-X` bound back in), `~/.claude/agents`, `~/.claude/skills` (only `scrollcraft` bound back read-only), `~/.claude-mem`, `/tmp/claude-1000`, and `/home/dxb/deneme-1` itself.
  - `~/.claude/CLAUDE.md` was replaced with `/dev/null`.
  - Arm C added tmpfs over `~/.codex` and over `~/.claude/{file-history,backups,session-env,shell-snapshots,debug,paste-cache,sessions,jobs,logs,uploads,downloads,todos,plans}`, plus its own `history.jsonl`. Its `probe` mode checks the wall before the run.
- **How the master and specialists were given.** The master was the arm folder's `CLAUDE.md` (`kol-a/CLAUDE.md`, 8,178 B, "Mavi Kuşak Çini Atölyesi — the site master"). The four specialists were project agent files in `kol-a/.claude/agents/` (`gorsel-yapimci`, `metin-yazari`, `on-yuz-gelistirici`, `sanat-yonetmeni`, about 2 KB each), all written for that one job. The shared desk was `MASA.md`, the delivery file `TESLIM.md`.
- **Time and tokens.** Start, end, nudge and limit lines are in `logs/TIMES.log` (143 lines).
  - Arm A, interactive: 22:28 to delivery at 03:46, fix round done at 06:59.
  - Arm C: 13:38 to 14:56, fix round done at 15:57.
  - Arm B: 16:12 to 20:55, including a 5-hour usage-limit wait.
  - Tokens and cost exist only for arm A's last session: `logs/kol-a-son-oturum-ozeti.json`, lastCost 330.35 $, 2.73 M output tokens, 853 M cache-read tokens. I found no equivalent file for B or C.
- **Watchers.** `bekci-a.sh` and `bekci-c.sh` poll every 60 s.
  - They reopen a crashed session (`--continue`) and accept the trust dialog.
  - On a usage limit they parse the reset time and paste "carry on" through `screen readbuf/paste`.
  - After 15 min quiet with an idle studio and `TESLIM.md` written, the phase counts as done. Without delivery they send one nudge, at most 6.
  - After delivery they run one Sol (Codex) audit (`.planning/quick/20261028-deneme-sol/run-sol-*.sh`) and hand the arm `KALITE-RAPORU.md` for a fix round.
  - `bitir.sh` commits the trial folder to git and suspends the machine.
  - `izle-c.py` is a read-only pty viewer of `screen -x kolc`. It strips mouse-report codes so his mouse cannot type into C.
- **What went wrong and was patched:**
  1. Arm B hit the 5-hour limit at 17:04 and was resumed 19 times, every 10 min, to no effect. `devam2.sh` replaced this with waiting until the reset time the limit message names.
  2. In `-p` mode, the master's turn ending cut its specialists off mid-work ("Request interrupted"). `redo-prompt-a.md`, `redo2-prompt-a.md` and `yeniden-a*.sh` followed, then `taze-a.sh` started over from a clean folder. The final fix was an interactive `screen` session (TIMES 22:20).
  3. The specialists stopped at the limit and the master finished their work alone (`redo-prompt-a.md`). The prompt was changed to "SendMessage the same agents, do not take over".
  4. Leaks: an old studio library was fed in (22:17), and C was given A's archive (11:21). The fix was B's images only, and moving the trial's ComfyUI outputs to `yedek/studyo-ciktisi-28-29-ekim` because ComfyUI lists them over HTTP.
  5. Job-specific personas, the memory file's lesson.
- The trial's verdict: UNVERIFIED. I did not find it in B64 or B84.

## 2. What the studio can make today

- **ComfyUI.** Installed at `/home/dxb/tools/ComfyUI` and running: `dxb-comfyui.service` active, pid 2753 on 127.0.0.1:8188. The card is an RTX 5060 Ti, 16,311 MiB, 892 MiB in use when read. `/history` is empty (0 entries). No saved workflows (`user/default/workflows` is empty); the graphs are built in code (`/home/dxb/tools/h3/workflow.py`, `img.py`).
- **Models** (`/home/dxb/tools/ComfyUI-models` via `extra_model_paths.yaml`):
  - Video: MiniMax H3 `fl2va` and `ref2va` (fp8, plus a Q4 gguf), turbo LoRAs at 4 and 8 steps, the H3 video and audio VAEs.
  - Images: FLUX.1-Krea-dev fp8, FLUX.2-klein-4B, Qwen-Image-Edit-2511 with a Lightning LoRA.
  - Upscalers: 4x-UltraSharp, RealESRGAN.
  - No RIFE weight was found, and no custom nodes beyond the examples.
- **B43 contract page:**
  - The UGC recipe is R25, 11 steps: R20 is its image step, H3 T2VA/Ref2VA at 640×1152 24 fps, the R23 voice comparison, LatentSync only as a fallback, FFmpeg grade/grain, RIFE ×5, loudnorm −14, WER/identity check.
  - Draft first: R35 (LAW D), plus R36 (enlarging is asked per job). Step 11 says he sees the finished native draft.
  - Sound: R22 (the most human voice wins) and R23 (the engine's voice against a clone, on every client video).
  - Video default: R19 (H3 only). Local stills: R21 (FLUX-Krea).
  - B43 line 165 lists what is missing for the UGC trial: Voice Studio, RIFE, cloned `--ref-audio`, the colour recipe in the post script, the FLUX.2-klein wiring.
  - Contradiction: line 165 says Voice Studio is not on disk, but `/home/dxb/tools/VoiceStudio` now exists. Whether it runs: UNVERIFIED.
- **Tools a session would use:**
  - `scrollcraft/scripts/studio.mjs`: `still` (FLUX-Krea, no reference path), `shot` (H3 FL2VA, writes no audio, up to 15 s), `probe`.
  - `/home/dxb/tools/h3/run.py` drives H3 Ref2VA/T2VA with `--ref-audio` and prints wall clock and peak VRAM.
  - `/kisayol` (`~/.claude/skills/kisayol`): 202 recipes, all `candidate`, `samples: []`. It needs a product photo, and UGC needs a cast photo plus a real scene reference.
  - The `dxb-mcp` media tools (`packages/dxb-mcp/src/groups/media.ts`: submit/status/wait/probe/cancel) write to the company database's job book. A sealed arm cannot reach them.
  - For R20, stills come from the Codex image tool.
  - For each job: (a) UGC with sound needs `run.py` Ref2VA plus voice plus FFmpeg post; (b) stills need Codex or `studio.mjs still`; (c) a cinematic ad needs `studio.mjs shot` or `run.py` at 1152×640, then assembly.
- **Measured costs on this card:**

  | Run | Size, frames, steps | Wall clock | Peak VRAM | Source |
  |---|---|---|---|---|
  | H3 Ref2VA | 640×1152, 39 frames, 4 steps | 115 s | 15,176 MiB | `h3/ugc/shoot-ugc.log` |
  | H3 Ref2VA | 640×1152, 56 frames, 4 steps | 110 s | 15,449 MiB | `h3/ugc/fix-ugc.log` |
  | H3 | 1152×640, 56 frames, 8 steps | 265 s | 15,621 MiB | `h3/oe/shoot-oe.log` |
  | FLUX | 1152×640, 28 steps | 25.5 s | — | `h3/lab/flux-test1.log` |

  B43 R32 adds that a finished second costs 2–5 min of the machine.
  - Not measured anywhere: a 15 s take, the cost of RIFE and the enlarger, and voice.

## 3. Real reference material on disk

- No real product photograph with camera EXIF was found in the ComfyUI input folder, `h3/ref`, `h3/ugc/refset`, `~/Pictures`, the `~/Desktop` studio folders or the November quick folders.
- The candidates on disk are not real photos:
  - `h3/ugc/refset/` (bag front and detail, sneakers, apartment, boutique window): 1024² PNGs made a minute apart on 1 Sep, so generated.
  - ComfyUI `input/u_bag.png`, `u_shoes.png`, `tek_ny_shoe0/1.png`, `tek_ny_plate.png`: generated.
  - `h3/oe/stills/` (OutletEuro handbag): made with the Codex image tool, per `oe/stills.log`.
  - `~/Desktop/desktop 2/telefon projesi/REWE/` (12 "tanıtım" JPEGs, phone accessory): no camera EXIF, so real-or-not is UNVERIFIED.
  - `20261109-outletcity-b84/evidence/design` (127 JPEGs): screenshots of a retailer's site.
- I skipped face references (`~/Pictures/foto-referans-20261105`) and personal documents (`desktop 2/shenzen`).

## 4. The studio's personas (`/home/dxb/DxB Global OS/personas/…`)

The bound/independent labels are my reading of each file's responsibilities.

| Seat | Bytes | Does | Bound / independent |
|---|---|---|---|
| creative-director | 38,925 | the idea, the standard, the line; 13 seats report to it | BOUND (the head) |
| advertising-director | 25,988 | selling idea, campaign cut-downs | BOUND |
| film-director | 30,275 | performance, blocking, shot list, keepers | BOUND |
| screenwriter | 25,968 | script, lines, hooks | INDEPENDENT (from the brief) |
| storyboard-previz | 29,272 | panels, animatic | BOUND |
| cinematographer | 25,307 | lens/light LOOK across shots | BOUND |
| character-identity | 29,541 | cast sheets, identity binding | BOUND |
| product-brand-consistency | 27,183 | product sheet from real photos, marks in post | BOUND |
| continuity | 23,257 | master reference set, continuity sheet | BOUND |
| ai-video-engineer | 28,724 | engines, recipes, card measurement | INDEPENDENT |
| vfx-post | 29,089 | grade, grain, finish at native size | INDEPENDENT (hand-over) |
| sound-music | 28,680 | voice source per shot, R22/R23 | INDEPENDENT-ish (needs the script) |
| delivery-qc | 24,292 | last door, catalogue code | INDEPENDENT |
| failure-analysis | 28,565 | root cause, error registry | INDEPENDENT |
| design-image-prompt-engineer | 34,148 | the still lane: hero frames, panels | BOUND |
| short-video-editing-coach | 31,642 | the cut, pacing, export | INDEPENDENT (hand-over) |

- By its own text, the general master is `media-creative-director`. It directs every piece and is headed by the Holding Orchestrator.
- There is no separate job-type "media master" persona. `find personas -iname '*master*'` returns only `engineering-git-workflow-master`. B64 item 5 says "Still to build… the master personas".
- Conflict: A27 says no department head stands in a job's path, but the creative-director file is written as one.

## 5. What would leak between arms

- `/home/dxb/tools/ComfyUI/output/` (76 entries plus `scrollcraft/`, and `KUTUPHANE.tsv` with 142 lines) is listed over HTTP at `127.0.0.1:8188/internal/files/output` (measured) and can be fetched through `/view`.
- `/home/dxb/tools/ComfyUI/input/` (705 files): `studio.mjs` copies frames into it.
- ComfyUI `/history` (in memory, 0 now) shows the previous arm's prompts until the server restarts.
- `~/.codex/` (`generated_images` holds 88 images, plus `sessions`, `history.jsonl`, `memories`): the R20 image tool writes here.
- `~/.claude/{history.jsonl,file-history,backups,session-env,todos,plans,sessions,jobs,shell-snapshots,paste-cache}` and `~/.claude/projects`.
- `~/.claude-mem` (cross-session memory).
- `/home/dxb/tools/h3/{out,ugc,oe,jobs}` and `/home/dxb/tools/h3/studio` (catalogue), served by `dxb-vitrin` on 127.0.0.1:8899.
- `/tmp` outside `/tmp/claude-1000`.
- `/home/dxb/deneme-1` and the trial folder itself.
- Leaks through user plugins and hooks under `--setting-sources project,local`: UNVERIFIED.

NOT COVERED: the first trial's verdict text; token counts for arms B and C; whether VoiceStudio, Voicebox or LatentSync run, and their cost; a 15 s H3 take's measured time; any real product photo; the job book's database records (not queried).
