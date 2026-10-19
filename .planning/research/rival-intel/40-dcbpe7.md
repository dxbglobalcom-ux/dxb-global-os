# Source 40 — "Agent 2" (invideo / "NVIDEO"), a creative-director agent

> **TRANSCRIPT-ONLY READING — the frames were not available.** 113 frames and the .mp4 were deleted
> 2026-09-21 (`d38c28ea`). On 2026-10-19 he decided to close 39 and 40 from their transcripts (ledger
> `rival-39-40-closed-from-transcripts-2026-10-19`). **0 of 113 frames opened by this reader.** Label T
> = transcript; label V* = one of the frames read by the session that prepared the task on 2026-08-31
> (quoted in `.planning/quick/20261014-tahta-sirasi/sources-rakip-39-40.md`, not re-seen). His decision
> of 2026-08-31: *"nvideo sanırım pahalıydı biz onsuz yapıp sistemini alabiliriz."* — the product is
> not bought; its architecture is taken.

## WHY IT MATTERS TO THIS HOLDING

B43 names a director seat and a shot router but its studio screen is not drawn (waits on B32), and
the company's `media_jobs` records no engine and no edit count (measured 2026-10-14, sources file T-8,
not re-measured here). This reel shows the shape both are missing.

## 1. Source identity

| Field | Value |
|---|---|
| URL | https://www.instagram.com/reels/DcBpE7niGyb/ |
| Product | Whisper hears "Agent 2 by NVIDEO" (T 01:45); W076 names invideo "Agent Two" from its product page (released 2026-07-30); one frame showed `ai.nvideo.io/…/agents-module/…` (V* t012). The exact name is UNVERIFIED — would need the frames or a re-fetch |
| Duration | 113.22 s · `transcripts/40.json`, `en`, 22 segments |
| sha256 (transcript) | `5c6a72fccdf2f7eecd1e1f9082eddf506db7022e6a8e99eb047083b06dc8fffa` |
| Price | paid SaaS (W076); exact price UNVERIFIED — would need its pricing page |

## 2. The transcript record — timestamped, 0 frames

| t | What is said (T) / seen (V*) |
|---|---|
| 00:00 | "This is where I talk to it, and this is where it gets work done" — chat and workspace on one screen; V* t012, t072: chat left, produced assets as cards right |
| 00:14 | "trained on … storyboarding, character creation, storytelling, color theory, camera composition, lighting" |
| 00:26 | told the commercial idea, it builds "a shot list" (Whisper: "shotless") |
| 00:32 | "Finds the references, finds the location, finds the characters … by find, it creates it"; V* t020: full character sheet (figure, expressions, poses) |
| 00:38 | it prompts "chatGBT image 2.0, nano banana pro, cdance 2.5" itself |
| 00:51 | "you are the director … you never lose control" — like / dislike loop |
| 01:08 | storyboard variants, then shot creation |
| 01:12 | self-correction: the man taking the watch off "already has a watch on, so he fixed it without me telling it" |
| 01:22 | drags a liked image: "the same close-up, but for our other characters" |
| 01:35 | "it's done" — close-ups of the other characters returned |
| 01:40 | "It takes care of the prompting itself" |
| V* t044 | under each asset: `+more · No edits · GPT Image 2` — model and edit count per asset |

### Aliveness

The agent answers while it works ("It's already working, it's thinking … and it's done", T 01:31-01:35),
and the assets land beside the conversation. How long each card takes to appear is UNVERIFIED — would
need the frames at 5-10 fps. What DXB takes: the studio tab puts his conversation with the director
seat and the work it produces on one surface, so the work is seen moving as it is made.

## 3. Capabilities

1. One screen: conversation left, asset cards right (V* t012, t072).
2. Provenance on every asset: model + edit count (V* t044).
3. Character sheet for consistency across shots (V* t020).
4. Multi-engine prompting by the agent itself (T 00:38).
5. Unasked continuity correction (T 01:12).
6. Reuse by gesture: drag an asset, "same close-up for the others" (T 01:22).

## 4. What DXB has today

- Director/scriptwriter/storyboard seats and the reference-set keeper: `board-rows/B43.md:16`.
- Shot router as data, long-form job/scene/shot records: "Not built, each on his word" (`B43.md:42`).
- Provenance: `media_jobs` has `kind`, `params`, `wall_seconds`, `peak_vram_mib`, `output_path`, and
  no engine and no edit-count field (sources file T-8, SELECT 2026-10-14).
- Continuity QA seat and the QC list as open legs (`B43.md:16,42`).

## 5. The build project

Into B43, each leg on his word, built in-house (his 2026-08-31 decision): (a) add engine + edit count to the
job/scene/shot records; (b) the studio screen for B32 (conversation + asset cards, drag-to-reuse);
(c) the router leg writes the per-engine prompts. Items 3 and 5 are already owned by B43's reference-set and QC legs.

## 6. Verdict

The source shows the product producing storyboards, character sheets and shots across three paid
engines; its users and revenue are not shown in the film. Taken: the architecture (1, 2, 6 into
B43/B32; 4 into the router leg). Not taken: the product or a subscription (money out, his "onsuz yapıp");
its paid engines as our lanes.
