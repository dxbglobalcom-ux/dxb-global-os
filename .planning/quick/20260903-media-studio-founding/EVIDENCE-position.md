# Evidence — Media Studio position, measured 2026-09-03 (this session; nothing changed)

| Claim in the report | Command | Decisive output |
|---|---|---|
| Nothing pending in the repo | `git status --short` | (empty) · last commit `449f5193 2026-09-01 19:23` |
| Card idle, RAM half free | `nvidia-smi --query-gpu=…` · `free -g` | `1025 MiB / 16311 MiB, 2 %` · `RAM used/total GiB: 10/30` |
| 12 resident services up, showcase answering | `systemctl --user list-units 'dxb-*'` · `curl -o /dev/null -w "%{http_code}" http://127.0.0.1:8899/` | comfyui, vitrin, gpu-guard, freeze-guard, jarvis, scheduler … `active running` · `http 200` |
| EXPO still off | `uptime -s` → `2026-09-02 10:13:33` (no reboot since the 20:19 before-run) · `tools/h3/lab/expo/before-1.log` | `duvar saati: 295.1 s` = identical to the 2026-08-30 board figure at 4800 MT/s |
| RAM is 2 sticks, not 4 | `free -g` → 30 GiB total · `Medya OS/05-olcum/EXPO.md` (dmidecode 09-01: 2 × 16 GB) | the `DEVIR-STUDIO-ARACLARI.md` line "4 × 16 GB = 64 GB" is wrong |
| CUDA toolkit not installed, driver intact | `dpkg -l \| grep -c '^ii  cuda-toolkit'` · `ls /usr/local/cuda*` · `nvidia-smi --query-gpu=driver_version` | `0` · `No such file` · `595.84` |
| Both H3 checkpoints + three turbo LoRAs on disk | `find ComfyUI-models … -printf '%s %p'` | `minimax_h3_fl2va_pruned_fp8_scaled` 20,958,205,608 · `minimax_h3_ref2va_pruned_fp8_scaled` 20,958,205,608 · LoRAs `fl2v_turbo_4step` / `fl2v_turbo_8step` / `ref2v_turbo_4step` 1,956,193,000 each |
| FLUX Krea installed and approved | `du -sh ComfyUI-models/flux` → 12G · `study-cards/flux-krea-dev.md:11` | `Status: ADOPT — quality APPROVED by the CEO 2026-09-01` |
| No extra ComfyUI nodes (no SeedVR2, RIFE, lip-sync, face-refine) | `ls ComfyUI/custom_nodes/` | `__pycache__ example_node.py.example websocket_image_save.py` |
| Runner already has the unused levers | `grep add_argument tools/h3/run.py` | `--steps --first-frame --last-frame --lora --no-lora --ref --ref-audio` |
| Yesterday's lab exists outside the repo | `ls "/home/dxb/Medya OS"` · `git log --oneline -5` | 10 folders, 2.0 GB, own git; `f7596cb PLAN v2 §0 …` (2026-09-03 01:10) |
| Lab loose ends | `git status --short` in Medya OS · `ls -la tools/h3/studio/media` | ` M 01-hat/kapi.py` · `?? 01-hat/deliver.sh` · (a lab film link — silindi — CEO emri 2026-09-05) |
| Showcase catalogue check | (row retired: the films it counted — silindi — CEO emri 2026-09-05) | — |
| Identity gate has real models installed | `venv-kapi/bin/python -c "import easyocr, insightface, onnxruntime, torch"` | `easyocr 1.7.2 · insightface 1.0.1 · onnxruntime 1.29.0 · torch 2.14.0+cpu` |
| Lab redo shots failed the speech gate; the film rejected by the CEO | (lab record cancelled; the film — silindi — CEO emri 2026-09-05) | — |
| Board does not know the lab exists | `grep -c -i 'medya os' 00-BOARD-OPEN-WORK.md` | `0` (row B43 read in full: no mention) |
| The "no third-party brand" sentence is NOT in B43/B28/B33 | python scan of lines 146/139/134 for `third-party|brand|marka` | B43: 2 hits, both unrelated ("win a brand", "unbranded cream box") · B28: 4 hits, all revenue text · B33: 0 |
| Where that ban actually lives | `grep -rn 'third-party' tools/h3` | `oe/SCRIPT.md:30` · `oe/stills.sh:10` · `oe/fix-stills.sh:9` (prompt BAN strings) |
| Library: three engines registered | `grep -n 'name:' scripts/library/register-media-engines.mjs` | `minimax-h3` · `flux-krea-dev` · `comfyui`, owner_dept `social-media` |
| Tracker rows for media | `grep -n -i '^| *(minimax|flux|comfy|wan|ltx|hunyuan|open-sora|openmontage|seedance|heygen)' INTEGRATION-TRACKER.md` | OpenMontage STUDY · Seedance STUDY · HeyGen STUDY · WanGP STUDY · Open-Sora STUDY · HunyuanVideo STUDY · **MiniMax H3 INSTALL · FLUX ADOPT · ComfyUI ADOPT** · LTX STUDY |
| OpenMontage: cloned, measured, licence open | `ls ~/tools/OpenMontage` · `git log -1` → `1bab711 2026-08-18` · `study-cards/openmontage-opencut.md:9,15,66` | `Status: STUDY` · `License: AGPL-3.0 §13` · `Legitimacy Verdict: … Conditional on licence: AGPL-3.0 must be answered by the CEO` |
| Personas: 199 files, 21 depts, no media department | `find personas -name '*.md' -not -name README.md \| wc -l` · migration `20260713023000_org_bilingual_complete_v15.sql:27-49` (22 slugs) | `199` · no `media/medya/agency/creative` slug |
| No persona names any engine | `grep -rli -E 'comfyui\|minimax\|flux\.1\|krea\|runway\|kling\|veo' personas` | 4 files, every hit is the Turkish word *kreatif* — 0 engine references |
| "studio-producer" persona is a PMO head | `sed -n 4p personas/project-management/project-management-studio-producer.md` | `# PMO Direktörü (PMO Head) — project-management-studio-producer` |
| Topaz research done, not running | `Medya OS/03-arastirma/topaz-vs-yerel-video-iyilestirme.md` §0, §1.2, §4, §5 (37,925 bytes, dated 2026-09-02) | "Linux Operating Systems are not supported" · verdict: no subscription; SeedVR2 3B int8 → RIFE 4.26 → FlowDenoise + grain; optional Astra 2 $19 A/B |
| Disease catalogue done | `Medya OS/03-arastirma/ai-video-defects-and-prescriptions.md` (53,991 bytes) | 24 diseases (D01–D24), 43 sources, 16 tools with licence + last push; §5.2 "no post-May-2026 evidence found" |

Subagent used (read-only, personas sweep): its 16-role table was re-measured for count, engine words and the two "studio" slugs before anything from it was reported.
