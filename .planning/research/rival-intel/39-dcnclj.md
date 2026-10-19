# Source 39 — Bad Decisions Studio, "Seedance vs MiniMax H3 running locally"

> **TRANSCRIPT-ONLY READING — the frames were not available.** His order of 2026-08-31 was frame by
> frame with sound. The 110 frames and the .mp4 were deleted in his sweep of 2026-09-21 (commit
> `d38c28ea`; frames were gitignored, no copy exists). On 2026-10-19 he decided to close 39 and 40
> from their transcripts (ledger `rival-39-40-closed-from-transcripts-2026-10-19`). **0 of 110 frames
> opened.** Every line below is label T (Whisper transcript) unless marked otherwise; nothing here is
> label V.

## WHY IT MATTERS TO THIS HOLDING

B43 (DXB Media Studio) runs lane ① on free local engines; the paid leader for ad film is Seedance.
The question this reel answers for us: can a local open model make an ad sequence a client would
take, and at what wall time. Our own figure is not re-measured here (W076 quotes "15 s 1152×640
~10 min, $0.00" from `gelir-baglam.md`).

## 1. Source identity

| Field | Value |
|---|---|
| URL | https://www.instagram.com/reels/DcNcLjPOLRs/ |
| Account | Bad Decisions Studio (W076, `watch-links/2026-10-08-whatsapp/rows/2-batch3.jsonl:15`) |
| Duration | 109.53 s (transcript `duration`) |
| Material read | `transcripts/39.json`, Whisper `transcribe`, `en`, 46 segments |
| sha256 (transcript) | `4390b1af98652db1216533cd41357e1a018979ac4fa1fbba722f4fc20a0d556c` |
| Video / frames | deleted 2026-09-21 (`d38c28ea`); resolution, codec, fps UNVERIFIED — would need a re-fetch via `scripts/rival-intel/fetch.sh` |

## 2. The transcript record — timestamped, 0 frames

| t | What is said (T) |
|---|---|
| 00:00 | "Seed dance videos, great quality, but you have to pay for it." |
| 00:04 | "Minimax H3, running locally on your computer, a free video model" |
| 00:14 | "this video is done by Higgs Field … a car commercial" — the paid original is played first |
| 00:34 | "Higgs Field open sourced this project … shared the references and the prompts" |
| 00:43 | "We took that reference, we took the prompts, and we give it to Minimax H3" |
| 00:47 | "running locally on our Dell T2 tower … we're not sending this to the internet" |
| 00:54 | the local result is played; the same dialogue lines repeat over it |
| 01:08 | "this took 19 minutes … so 20 minutes, technically, to render" |
| 01:17 | "We didn't pay a single cent for this video" |
| 01:27 | "This took four minutes, it's a five second shot" (the car shot) |
| 01:35 | "the first time … quality video generation, running locally for free" |
| 01:43 | call to follow the account |

### Aliveness

What the film shows of motion cannot be read from a transcript: UNVERIFIED — timing what moves
would need the frames. What DXB takes: the creator's own wall-clock figures (19-20 min for the
sequence, 4 min for a 5 s shot) are the rhythm a render queue must report live to him.

## 3. Capabilities

- Same reference set + same prompts → paid Seedance vs local H3, side by side (T 00:34-00:54).
- Local H3 on the creator's workstation: sequence ~19-20 min, 5 s shot 4 min, $0 (T 01:08-01:27).
  These figures are the creator's; on our RTX 5060 Ti 16 GB they are UNVERIFIED — would need our own
  run on the same pack.
- The Higgsfield pack (references + prompts) is public, per the creator (T 00:34) — a fixed benchmark.

## 4. What DXB has today

- MiniMax H3 is a studio engine here (W076 `zaten_var`; `study-cards/minimax-h3.md`).
- No A/B of our local lane against Seedance on a shared input exists
  (`.planning/quick/20261014-tahta-sirasi/sources-rakip-39-40.md` T-13).

## 5. The build project

One bench test, not a build: run the public Higgsfield car-ad pack through our local H3 lane and record
wall time, VRAM and his quality verdict next to the paid original. It belongs to the studio retest
(STATE NEXT, B43 lane ①). Only on his word.

## 6. Verdict

The reel produces an ad sequence at $0 in about 20 minutes on the creator's hardware (T); the studio's
users and revenue are not shown in the film. What the holding
takes: the public pack as a fixed A/B for our free lane. What it does not take: the creator's
hardware or his times as our figures; no money out.
