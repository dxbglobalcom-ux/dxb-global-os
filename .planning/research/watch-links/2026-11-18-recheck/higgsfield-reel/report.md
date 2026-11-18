I could not write `$J/report.md`. The harness refused the write because a subagent should return findings as text, and I did not work around it. The full account is below. The transcript, frame sheets and source dumps are in `/tmp/claude-1000/-home-dxb-DxB-Global-OS/7d8f2f4c-6fca-4474-b904-473ec48eefce/scratchpad/reel2/`.

## What the reel is
A 97-second Turkish talking-head reel. A creator says Higgsfield's growth comes from repackaging other companies' models and adding commission. He says you should build your own Higgsfield with a reverse-engineering tool and paste in provider keys, for "0 commission". There is no real demo: the "app" at 01:04 is an illustrative mock-up, and no marketplace, price, prompt or command is named. His "$1M to $1B in 18 months" and "40M users" claims (00:03, 00:08) have no source on screen.

## The system as he shows it, with seconds
1. 00:43-00:53: Go to GitHub, find "Reverse Engineer Anything" (REA). Repo page on screen: 447k stars, rea.tools.
2. 00:54-01:03: Tell Claude Code "install this repo". It inspects Higgsfield's UI and requests to extract the screens, buttons and model calls.
3. 01:03-01:07: Claude Code builds your own interface from that analysis.
4. 01:07-01:36: Put the marketplaces' API keys into the app's settings (key box 01:24). Models are then bought directly, without Higgsfield's commission (diagram 01:09-01:19).

## Tools named or on screen
| Tool | Repo / URL | Stars | Last push | Licence / price | What it does |
|---|---|---|---|---|---|
| REA | `morluto/rea`, npm `rea-agents` 6.9.0 | 467,802 | 2026-11-18 | MIT | MCP and CLI that lets an agent inspect binaries, Electron/JS apps and websites. Already installed here (`rea` 6.7.0, 2026-10-21). |
| Higgsfield CLI | `higgsfield-ai/cli` | 720 | 2026-10-22 | MIT code; paid credits | Official terminal client with 40+ models, `generate create/cost`, workflows, `soul-id`, `marketing-studio`, `website`. |
| Higgsfield skills | `higgsfield-ai/skills` v0.14.0 | 2,017 | 2026-11-05 | MIT | 9 agent skills: generate, soul-id, product-photoshoot (10 modes), brandkit, marketplace-cards, websites, faceless-video, youtube-thumbnail. |
| Higgsfield API | open.higgsfield.ai; SDKs `higgsfield-js` (78) and `higgsfield-client` (143) | n/a | 2026-11-12 (js) | Pay-as-you-go | Seedance 2.5 from $0.118/s, Genjutsu from $0.154/s, Kling 4.0 from $0.126/s. Its model pages also have "Compare providers". |
| Higgsfield MCP | mcp.higgsfield.ai | n/a | n/a | Always charges credits | OAuth connector for Claude and ChatGPT. |
| Higgsfield plans | on screen 00:20 | n/a | n/a | $15 / $39 / $99 a month (yearly) | Starter / Plus / Ultra. |
| `higgsfield-ai/app-templates` | GitHub | 14 | 2026-11-12 | n/a | Official `studio`, `preset` and `app-detail` starter layouts. |
| Freefield | `neuregex/freefield` | 1,584 | 2026-11-18 | MIT | Studio of 120 apps on ComfyUI, open weights only. |
| Open-Generative-AI | `Anil-matcha/Open-Generative-AI` | 35,273 | 2026-11-18 | MIT | Electron studio UI over a paid MuAPI key. |
| Open Higgsfield | `wide-trace/open-higgsfield` | 6,326 | 2026-09-17 | no licence field | Studio UI over paid models. |

The reel is right that most Higgsfield models are third-party. But Soul, Genjutsu, Cinema Studio and Marketing Studio are theirs, and their prompt templates are private on their backend.

## Step by step: have / planned / missing
- **Reverse-engineering tool.** Have. `rea` is installed (`.planning/quick/20261021-ekim-linkleri/RECORD.md:19-23`).
- **One agent entry point.** Partly. `media_submit` has kinds still, shoot, upscale, assemble and probe, all on our own ComfyUI (`packages/dxb-mcp/src/groups/media.ts:159`). ComfyUI answered 200 on port 8188. No remote kind exists; B43 leg (6) says the external hands are not started (`B43.md:132`).
- **Model catalogue and provider keys through a proxy.** Planned: `FINAL.md:105-106, 127-141` and `FINAL.md:92-93, 150-163`. Not built, no account opened.
- **Router, price in code, one approval card per job, remote lane.** Planned: `FINAL.md:114-125`, `FINAL.md:159`, `FINAL.md:96, 124`, and the visible dial at `B43.md:147`.
- **Cost line per job.** Planned: `cost_ledger source 'media'` (`FINAL.md:112, 171`), two-roads table (`B43.md:143`). Higgsfield's `generate cost` as a pre-run estimator is noted at `B43.md:244`.
- **Review and QC.** Planned: `FINAL.md:125, 159`, plus his eye on the finished native draft (R3, R35).
- **Presets / recipes.** Partly. `/kisayol` has 202 prompt recipes and the UGC recipe is written (`B43.md:58-71`). Missing: recipes that also carry model parameters, and one per Higgsfield mode (photoshoot, ads, listing set). Only the listing set is planned (`B43.md:256`).
- **Images and video.** Have, locally: FLUX.1-Krea-dev and the Codex image tool for stills (R20, R21), MiniMax H3 for video (R19).
- **Assembly, voice, enlarging.** Partly. OpenMontage is on disk with 39 of 121 tools available; Voice Studio is source only (`B43.md:165`).
- **Reusable character (Soul ID).** Partly. The reference-set rule and the cast exist (R7, R10); there is no trainable identity store.
- **Motion transfer / person swap (Genjutsu).** Missing locally. Higgsfield is the priced paid fallback (`B43.md:79, 215-222`).
- **Creative surface (prompt bar, gallery, remix).** Planned and undecided: the studio tab waits on the B32 drawing (`FINAL.md:159`). Open-Generative-AI, Freefield and InvokeAI are candidates (`B43.md:175, 176, 242`). None is on disk.
- **Asset library** (references, brand kits, past outputs, searchable). Missing. Only a stock-source plan exists for the Web Studio (`B84.md:98-114`).
- **Web Studio use of a generation API.** Planned only as stock plus "the Media Studio makes what nothing fits". Nothing consumes an API yet.

## The gap
1. The platform-hub plan covers the routed hands, catalogue, router, one-card approval, remote lane, cost ledger and QC. None of it is built.
2. It does not cover a prompt-bar/gallery/remix surface, recipe-to-model-parameter presets, or a store of per-client references, characters and brand kits.
3. It also lacks an agent-facing form for the Web Studio: `media_quote` is planned only inside the media group.
4. The reel's own step 2 (reverse-engineering Higgsfield) is not needed and gets only the front end. Higgsfield's CLI, 9 skills, API and `studio` template are public and MIT. They show the exact structure a studio agent needs and can be read free and compared with `/kisayol` and the router.
5. The Higgsfield API is already one of the six planned platform accounts, so nothing new has to be bought to start comparing.

## Forbidden subject
None in the reel. Higgsfield's UGC and virtual try-on modes would meet our cast law (R9) and halal screen (R41) if copied.

## What I could not read
- Higgsfield's terms body did not render, so whether they forbid reverse-engineering the web app is unknown. The 2026-10-17 survey found no explicit ban on automation.
- higgsfield.ai/pricing is JS-rendered; the prices above are from the reel's frame.
- The reel's caption and comments were not fetched; the marketplaces are never named, so none could be looked up.
- The skills' `references/` files and MODELS.md were not read; only the READMEs and `higgsfield-generate/SKILL.md` lines 1-120.
- No frame was unreadable, and the transcript covers 00:00-01:36.

## Commands run
- **Setup and watching:** `nvidia-smi` (1148 of 16311 MiB used), `watch.sh` (transcript and the 97.2 s video), `watchall.sh` (9 sheets, all read), ffmpeg inset crops at 21, 30, 49, 51, 58, 64, 75 and 85 s.
- **GitHub and npm:** `gh api` on `morluto/rea`, `higgsfield-ai/cli`, `higgsfield-ai/skills`, `higgsfield-ai/*`, `neuregex/freefield`, `Anil-matcha/Open-Generative-AI`, `wide-trace/open-higgsfield`; `npm view rea-agents`.
- **Web:** `fetch.py` on higgsfield.ai (pricing, mcp, api, terms, help-center), docs.higgsfield.ai and open.higgsfield.ai.
- **Our files:** read `B43.md` (all), `FINAL.md` (all), `kisayol/SKILL.md`, `B84.md` and `B28.md` headings, R2 and R8 (grep), `freefield.md`; `ls ~/tools`; `curl` on ComfyUI.

Nothing was installed, killed, liked, signed in or changed outside `$J`. No old job script was run.