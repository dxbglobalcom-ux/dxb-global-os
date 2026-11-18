# k1-d — tab "Kasım 1 incelemeleri", rows k1-09 and k1-10 (reader: Opus 5.5)

His note is the same on both rows: *"İzlenmiş mi? İzlenmediyse aynı şekilde üzerinden lütfen dikkatli bir analizle güzelce geçin."*
**The answer, measured:** both videos were read on 2026-11-01 from their full Turkish auto-caption transcripts by two readers (Opus and Fable, `readers/yeni-opus.md`, `readers/yeni-fable.md`), and I read both transcripts whole again today. They were **not watched as pictures**: no frame was ever taken (YouTube answered 429; no video file is on disk). For k1-09 that loses nothing (the screen shows only a Hetzner panel and Claude Code). For k1-10 it loses the name of the "3,000 $/month" reference channel (shown on screen 00:00–00:30 and 04:25–05:02, never spoken) and the Nichle screen numbers (01:27–01:58). So the 3,000 $ figure stays unverified. Under today's order, no video was fetched.

---

## k1-09 (oL2xB4DiXEo) — Doruk Yalçınsoy: six income roads that can run on a rented server or a local machine, and a funnel into his paid Skool community

- **Opened:** the full transcript `$R/.planning/quick/20261101-gelir-devir/tx/oL2xB4DiXEo.txt` (19:22, 39 lines, read whole). `$J/src/k1-09.txt` is empty. Frames: none exist (YouTube 429 on 2026-11-01; no frame sheet in `20261101-gelir-devir/frames2/` belongs to this id). Also read: the earlier readers' full sections (`watch-links/2026-11-01-gelir/readers/yeni-opus.md` §1, `yeni-fable.md` §1), `plan.jsonl` and `rows/merged.jsonl` lines, and `MERGE.md` (M#25: VPN "not a revenue line"). Today I fetched `gh api repos/NousResearch/hermes-agent` and its latest release. Not re-fetched: dorukyalcinsoy.com and the Skool page (the earlier readers measured those on 1 Nov: 117 members, 59 $/month or 390 $/year).
- **His note:** quoted above.
- **What is in it** (from the transcript, with minutes):
  - 00:00–02:00 — server (24/7, rented) versus local (your own machine: faster and closed). The deciding question is whether the job has to run 24/7.
  - 02:01 — AI use in Turkey went from 7.5 % last year to 14 % this year. The earlier readers found this proven by TÜİK's AI statistics for 2025 and 2026 (enterprises with 10+ staff).
  - 02:43–05:06 — **Road 1: install agents on a server for companies.** Hermes is his example ("updated very often, strong team"). He calls the layer above the model the "harness". His own product is "Konsol": a control layer where he says you see the company's departments (sales, marketing, operations, finance) and where agents sit. He charges a setup fee plus a monthly fee under a yearly support contract. His claim: 4,000–5,000 $ per company "even in Turkey" ("I know these invoices are possible"). No source.
  - 05:06–06:07 — selling software products is slow, needs investors, and he does not recommend it to a beginner.
  - 06:07–07:08 — **Road 2a: websites for small firms.** Firms are found on Google Maps. 10–20 thousand ₺ per site, 200–300 thousand ₺ for e-commerce. Claim: "50 % of Turkish SMEs have no site" (the earlier readers did not find this in TÜİK).
  - 06:50 — **Road 2b: a vertical voice-AI platform**, for example for real estate (click → it calls → the call is recorded), billed per minute or per subscription.
  - 07:30 — **Road 2c: a niche mobile app.** High revenue for some, with high ad budgets.
  - 08:10–12:13 — **Road 3: local open models.** The classes he names: LLM, STT, TTS, image ("Qwen models": text plus an image in, an edited image out), speech-to-speech, video. Claim: TTS cost fell from 1,500 $/month to 5 $/month. Free option: Google Colab GPU.
  - 12:13–13:38 — **how Road 3 earns:** consulting, or renting your own model as an API, or a model trained for one task. Data that must stay inside the country: finance, health, telecom. Claim: 30–50 % of firms want local models for some processes.
  - 13:38–14:14 — **Bonus: your own VPN** on a 5–10 € rented server (a German or US IP), with WireGuard.
  - 14:14–18:15 — set-up is now "talking to the agent": Claude Code connects to Hetzner by API key, SSH or MCP. He shows his own server (Ubuntu, 4 GB, "about 5 €"). 17:15: his own Hermes runs an "obliterated" (guardrail-removed) model for his own security and hacking tests.
  - 18:15–19:22 — the call to join his free community, then the paid mentoring community.
- **What we have:**
  - **Hermes — identical, installed** at `~/.hermes/hermes-agent` (version 0.20.5, unused; wrappers in `~/.local/bin/hermes`, `hermes-acp`, `hermes-agent`). It is named in `STACK.md` line 29 as the holding's 24/7 hands and eyes (B64 decision 15). The board's B11 says it is installed at its newest release when that row is built. Upstream today: v0.23.2 (2026-11-16), 264,331★, MIT, pushed 2026-11-18.
    - Correction to the earlier Fable reader: it wrote that hermes-agent "breaks our no-second-agent-framework rule (STACK)". That is wrong. Hermes is in STACK by his decision.
  - **Hetzner:** the holding's server was deleted on his order on 2026-09-19 (B09, B10, B11).
  - **The income roads:** all six are already written in `REVENUE-OPPORTUNITIES.md` §D (see Board).
  - **VPN:** nothing in the board, the revenue list or the research door. `~/.local/bin/tailscale` exists, but it is a private network, not an exit IP in another country.
- **What it has that we do not:**
  1. A Turkish price anchor for agent set-up (4–5 k $ plus yearly care; a claim).
  2. Proof that a consultant in Turkey already sells "a console that shows the company's departments and where agents sit". That is the holding's own OS, which supports the later-list line "the holding's own operating system sold outward". Konsol itself is not public; I could not open it.
  3. A one-line client filter: sectors that must keep data in-country (health, telecom; finance is excluded for us — banking).
  4. The VPN-as-country-IP idea, which is a research hand, not income.
  - Nothing that is a new tool.
- **Board** (the six income roads, and where each is already written):

| Road | Written in the revenue list? | Board row · what stands there · relation | First trial · what stops at the CEO |
|---|---|---|---|
| Agent set-up plus a monthly care contract | **Yes:** §D **#25 H9**, first method, cited `oL2xB4DiXEo 02:43` | B64 (the "kurulum" job type), B83's table line H9. The H9 mechanism already exists: paid discovery → team design from the persona factory → install → 30-day hand-over → monthly care. Relation: `method`, already written. | The idea: Hermes is already the holding's own 24/7 hand (STACK), so the client-side install of H9 can be "Hermes + our personas on the client's server", not a new harness. The trial is H9's written first trial: the holding's own set-up written up as a package, 0 $. Stops at him: the contract, the client's server and keys (identity), any server we rent (money out). |
| On-premises local model, "your data stays with you", plus a task-trained model rented as an API | **Yes:** #25 H9 (cited `08:24` and `12–13`) | B34 (line 38: H9's on-premises model is built on what this row learns), B33 (the card). Relation: `method`, already written. | Written trial: a local Turkish call recording → summary → CRM note, 0 $, at B34's exam. Stops at him: the contract, and buying hardware for a client (money out). |
| Small-firm websites (10–20 k ₺; e-commerce 200–300 k ₺) | **Yes:** #21 H5 (cited `06:05`) | B84 (Web Studio). Relation: `method`, already written. The TL figure is only Turkey's price anchor; the line sells monthly care. | Nothing new. Stops at him: nothing new. |
| Vertical voice platform (real estate), per-minute billing | **Yes:** #23 H7 (cited `06:05`; REV #12) | B83 (H7) and B12. B12's 2.73 s voice delay blocks the sale. Relation: `method`, already written. | Nothing new. |
| Niche mobile app | **Partly:** the road is in **#26 "Sonra listesi"** ("Yapay zekâ ile uygulama / SaaS", from ytAW1_g2IfI and FqsAALrRhj4); this video's minute (07:30) is not cited there | No row ("the later list has no row until he names one", B83). Relation: `method`. | None. |
| Paid community (117 × 59 $/month ≈ 6.9 k $/month at most) | **Yes:** #19 H3 "Community" (cited `18:15`) | B83 (H3 workshop and store). It opens once there is an audience and a case. Relation: `method`, already written. | Nothing new. Stops at him: the store account (identity) and collection (B05). |
| (Bonus) Own VPN for a country IP | **No.** The 1 Nov referee ruled it "not a revenue line; not in the report" (MERGE M#25) | No row. Nearest is B30 (agents' hands and eyes) for reading platforms as a German or US visitor. Relation: `none` as income. | Renting a server is money out, and the holding's server was deleted on his order, so it does not come up now. |

  - Passing mention: "Qwen" image-edit models (text plus image in, edited image out). Only the family is named; no repo or version is given. They are not on disk; the only trace is the `wan2gp` study card ("fronts … Flux and Qwen Image"). The nearest row is B43. For the image step there, R20 names Codex's image tool first, Seedream 5 Pro as paid, and FLUX.2-klein as the local fallback. Relation: `second`, at most a lead. Reading: Araştır.
- **The old verdict and reason:** **partly.**
  - It holds: the place (H9, on-premises AI) and the evidence weighting (the only proven income is his community; the other figures are claims).
  - It does not hold, part 1: the "local demo now (0 $, 1 week)" timing. On 2026-11-01 he ruled that a line is built and tested with its row and opens at the key turn (B83), and the demo is now H9's bench test at B34.
  - It does not hold, part 2: the sentence "a guardrail-removed model is not used in holding work". It gives "unfiltered" as a reason to reject, which his 2026-11-17 rule forbids. It decides nothing here anyway: Doruk used that model for his own security tests, and it is not an income road.
- **Reader's first reading:** **Yöntem.** Every road is already written in §D with this video's minute; the only addition is to cite `07:30` on the #26 apps line. Hermes is identical and installed.

---

## k1-10 (HN_1kEGNu3Y) — Yüzsüz Ninja: a faceless drawn-explainer YouTube production line built with Claude Code driving Gemini's image API

- **Opened:** the full transcript `$R/.planning/quick/20261101-gelir-devir/tx/HN_1kEGNu3Y.txt` (7:59, 16 lines, read whole). `$J/src/k1-10.txt` is empty. Frames: none exist (YouTube 429 on 2026-11-01). The readers asked for 00:00–00:30, 04:25–05:02 and 01:27–01:58, and those frames were never taken, so **the reference channel's name and its 3,000 $ cannot be checked from disk**. Also read: `yeni-opus.md` §2 and `yeni-fable.md` §2 in full. Fetched today, as text: `nichle.com` and `nichle.com/pricing` (through the research door's `fetch.py`).
- **His note:** quoted above.
- **What is in it:**
  - 00:00 — the claim: a channel opened 4 months ago earns about 3,000 $/month from YouTube ads alone, with 8-minute drawn videos, 2 a week. The channel is not named. The narrator's own channel had 426 subscribers and 9 videos on 1 Nov. His Nichle link carries a referral tag (`?ref=yt-v10`). The master-prompt link in his description is an empty placeholder ("[Notion linki]").
  - 00:30–01:27 — the key is made in Google AI Studio and handed to Claude Code ("set up image generation with Gemini"). He warns that the key is a wallet.
  - 01:27–01:58 — the niche through "Nicheless" (that is **Nichle**): 231 history channels, 15 new in 90 days, the newest 2 months old with 7 videos and 400 k+ views. These are screen numbers, a claim.
  - 01:58–02:47 — **the script method:** take a hit video in another language (found by a high outlier score, kept in a swipe file), copy its transcript, and **do not translate it**. Have the style analysed instead: the opening, how curiosity is kept, sentence length, how the story moves. Then have a new script written from scratch on your own subject, with timestamps.
  - 02:47–03:27 — **the master prompt:** drawing style, images per timestamp, what the characters look like, the model, and the consistency rules. The script is pasted at the bottom.
  - 03:27–04:25 — Claude Code calls Gemini scene by scene and writes 100+ images into one folder. Each image costs a small fee, so he generates only part of it on camera.
  - 04:49–05:02 — **consistency comes from two things sent with every request:** the master prompt and one reference drawing.
  - 05:19 — "anyone can build the system; the difference is the niche, the idea and patience".
  - 05:48–07:04 — files are renamed to their start time (`00_00`, `06_20`) and laid on the timeline by hand in CapCut, DaVinci or Premiere, in 1–2 minutes.
  - 07:22 — YouTube cuts pay for content mass-produced on one pattern. Do not post 40 a day; add yourself.
- **What we have:**
  - Gemini key: works, in `.env.daemon`, must be replaced (B26). It is the free key; the earlier reader found no free tier for the image models. Google AI Pro was cancelled 2026-10-18 (B28 line 6).
  - Local image engine: FLUX in `~/tools/ComfyUI-models/flux`. The studio's image rule is R20 (Codex image first, Seedream paid, FLUX.2-klein local fallback) and R15 says no single supplier. Continuity reference set: R7.
  - Montage: `~/tools/OpenMontage` is installed. The earlier inventory says Remotion is in the openmontage-opencut study card.
  - Outlier engine: SIGNAL (B43, planned, not built: "outliers against the account's own 90-day median"). B28 names yt-viral and ig-viral (MIT) as the free road; they are not installed.
  - Nichle: not found anywhere.
  - Channel line: H4 #20 in the revenue list, and B83's channel line (ORDER Y8).
- **What it has that we do not:**
  1. **Nichle**, a ready paid niche and outlier database. Read today: "11.9K channels measured, 402.2K videos scored"; outlier, niche and channel analysis for long-form, Shorts and keywords; similar channels, swipe file, Chrome extension; **12 $/month**, yearly "save 31 %"; 7-day trial for a first subscription, card taken at sign-up; 14-day withdrawal right. It has a Turkish page and testimonials from Turkish creators.
  2. A cheap, proven pattern for **still-illustration** channels: one master prompt plus one reference drawing with every call. Our R7 continuity rule is written for film takes, not for 100-image explainer books.
  3. The file-naming contract `MM_SS`, which turns an image set into a timeline with no hand step. Ours plans automatic montage from timestamps; the naming is the contract between the image station and the montage.
- **Board** (one line per item worth taking):
  - **The income road, faceless drawn channel on ad revenue.** Written: **yes**, §D **#20 H4** "Yüzsüz çizim kanalı üretim hattı", cited `HN_1kEGNu3Y`, with İ1 (long-form ads with category blocks yes; Shorts ads no) and İ7 (drawn humans and animals allowed, nothing indecent). Row: **B83** (revenue side, the channel line: "three pilots to his eye first, then the weekly line; the account opens at the key turn (B76)"), production B43. Relation: `method`, already written. First trial (written): one 8-minute pilot made end to end without opening a channel, 0 $. Stops at him: the channel and AdSense account (identity) at the key turn; K6, "the channel talk later", is his standing word.
  - **Nichle.** Row: B43 (SIGNAL), serving H4 #20 station 1 and B28's weekly loop. What stands there now: SIGNAL's own outlier scoring (planned) and B28's free yt-viral / ig-viral (named, not installed). Relation: **`second`**, the paid twin beside our own outlier engine. Use: the niche desk of the channel factory, and B28's research leg for a client sector. First trial: the history niche, 7-day trial; SIGNAL's or yt-viral's outlier list beside Nichle's for the same niche and week. What decides: whether ours finds the same ×3+ outliers and new-channel counts. Stops at him: the card for the trial and the 12 $/month (money out), and the account (identity).
  - **Gemini image API driven by Claude Code, for 100+ illustration frames.** Row: B43 (the image step, R15 and R20). What stands there now: Codex image first, Seedream 5 Pro paid, FLUX.2-klein local fallback (for the UGC recipe), and FLUX on the card. Relation: **`second`**, a volume engine for flat drawn styles beside local FLUX. First trial: 20 timestamped scenes from one master prompt plus one reference drawing, on local FLUX and on Gemini (earlier reader's price: about 0.034 $/image on Nano Banana 2.1; `gemini-2.5-flash-image` shuts 15 Mar 2027), with character drift measured across the 20. What decides: drift and cost per accepted frame. Stops at him: turning on paid billing for the key (money out); B26's key replacement is his.
  - **Master prompt plus reference drawing with every call.** Row: B43 (R7, the reference set) and §D #20 station 3 "the channel's visual book" (written). Relation: `method`, already written in #20; R7 can carry one sentence saying it applies to still-image books too. Stops at him: nothing.
  - **Style analysis of a foreign-language hit, then an original timestamped script.** §D #20 station 2 "tarz analizi ve özgün senaryo", written. Row: B43, with the content-principles skill for script seats. Relation: `method`, already written. Stops at him: nothing.
  - **`MM_SS` file naming → automatic timeline.** §D #20 "zaman damgasından otomatik montaj", written. Row: B43 (OpenMontage installed). Relation: `method`; only the naming convention is new. First trial: inside the pilot video, the image folder named `MM_SS` → OpenMontage or ffmpeg timeline, with no hand step. Stops at him: nothing.
  - **The niche engine sold as a data subscription.** Written: §D #20, last-but-one bullet, cited `HN_1kEGNu3Y 01:27` ("ileride"; REV #4). Row: B83. Relation: `method`, already written.
- **The old verdict and reason:** **partly.**
  - It holds: the place (H4, B43, B83), the evidence grading (3,000 $ is another channel's figure, likely a Nichle estimate; the narrator is a Nichle affiliate; the prompt link is empty), and the YPP inauthentic-content risk.
  - It does not hold: "a pilot this week / the channel talk now" was overtaken by his own word ("kanal konuşması şimdi değil, sonra", B83) and the channel line's order (three pilots at rank, account at the key turn).
  - The claim that "Postiz, Pocket TTS, Chatterbox" stand ready comes from the old row, not from this video: Chatterbox weights are in the HF cache, and Postiz and Pocket TTS are only proposals.
- **Reader's first reading:** **İkinci.** Nichle goes beside our own outlier engine, and Gemini image beside local FLUX, both tried when B43 or B83 is built. The rest is Yöntem, already written in §D #20.

---

## Commands run (read-only)
- `grep` of `$J/items.tsv` and `$J/inv/k1.tsv`; `cat $J/old/k1-09.json $J/old/k1-10.json`; `ls $J/src` (both src files 0 bytes).
- `find ~/.cache/link-watch $R/.planning -iname '*oL2xB4DiXEo*' -o -iname '*HN_1kEGNu3Y*'` → only `20261101-gelir-devir/tx/<id>.txt`; Read of both transcripts whole.
- Read `readers/yeni-fable.md` and `readers/yeni-opus.md` whole; grep of `MERGE.md`, `plan.jsonl`, `rows/merged.jsonl`.
- Read `REVENUE-OPPORTUNITIES.md` lines 120–290 (§D #17–#26, rulings, the not-passed list); grep for VPN/WireGuard (no hit).
- Read `board-rows/B83.md` 1–90; grep and slices of B43, B28, B34, B09, B11, B64, B26, B30; `STACK.md` line 29.
- `ls ~/.local/bin/hermes*`, `cat ~/.local/bin/hermes`, `grep version ~/.hermes/hermes-agent/pyproject.toml` (0.20.5); `gh api repos/NousResearch/hermes-agent` and `/releases/latest`.
- `ls ~/tools ~/tools/ComfyUI-models ~/.local/share/dxb/tools`; HF cache grep for qwen/flux.
- `python3 .claude/skills/dxb-research/scripts/fetch.py https://nichle.com` and `/pricing` → scratchpad `fetch/`.
- Nothing watched, downloaded or transcribed; no repository file changed.
