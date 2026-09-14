# EVIDENCE — the external hands, measured 2026-09-14 (B43 leg 6)

Written by the session author (Claude Fable 5.1) on the CEO's order of 2026-09-14: *"yapılacak birşey varsa tahtaya yaz sonra vakti geldiğinde yapılsın."* Every number below was read this day from the page named beside it; a page that could not be read is marked. Prices exclude VAT. Nothing here is a ruling — the leg is built when he calls it.

## His words that shaped the leg (2026-09-14, this session)
- *"sana holdingin motorlarından biri de higgsfield diorm orada da üretim yaapbilir aylık paket ile onu diorm sana"*
- *"biz API ile yapmayacğaız plan ile apı ile kastım oydu yanlış söyledim mcp ile bağlanıp yani"* → lane ③ is the membership over MCP, not pay-per-call
- *"ben bir iş için sadece 59 euro vermeycem"* → the membership is the studio's running cost, never charged to one job or one film
- *"bizde bir kaç yol olacak higgfield onlardan biri, veya minimax h3 API veya başkası. en iyileri en mantıklıları seçilip kullanıma hazır hale entegre edilmeli seçim vakti gelince işe göre duruma göre yapılır"*

## 1. Higgsfield — Plus membership over the official MCP
Source: https://higgsfield.ai/pricing (read in the browser, page text extracted) · https://higgsfield.ai/blog/Generate-AI-Videos-From-Claude-with-Higgsfield-MCP · https://creetr.com/blog/higgsfield-mcp
- MCP server `https://mcp.higgsfield.ai`; official support for Claude Code; no key rotation; shares the plan's credit pool.
- Plus: **€59/month monthly · €47/month billed annually · 1,200 credits/month fixed**; Starter €19 (270 credits); Ultra €99–129 (3,000). Credits reset monthly (two third-party sources; vendor FAQ not read — ⚠ UNVERIFIED).
- Vendor sentence: *"Unlimited models and Free Generations on plans are accessible only via higgsfield.ai and are not accessible on MCP/CLI, Canvas or Supercomputer."* → every MCP generation deducts credits.
- Credits per unit (vendor table, "~" as shown): Kling 3.0 720p ~7/5 s · 1080p ~8/5 s · 4K ~30/5 s; Kling Omni 3 Image Reference 720p ~5 · 1080p ~7; Kling Omni 3 FLF 720p ~5 · 1080p ~6; Seedance 2.0 720p ~22 · 1080p ~45 · 4K ~110 /5 s; Seedance Pro 1080p ~18/5 s; Wan 3.0 480p 5 · 720p 8.75 · 1080p 17.5 /5 s; Veo 3.1 720p/1080p ~29/4 s; Veo 3.1 Fast ~11/4 s; Sora 2 Pro 1080p ~50/4 s; Minimax Hailuo 2.3 768p ~6 · 1080p ~10 /6 s; images: FLUX.2 Pro 1, Nano Banana Pro 2, Soul 2.0 0.12.
- A 15 s ad (3 units of 5 s; Veo 4 units of 4 s; Hailuo 3 units of 6 s) and how many per 1,200 credits: Kling Omni 3 FLF 1080p 18 → 66 · Kling Omni 3 ref 1080p 21 → 57 · Kling 3.0 1080p 24 → 50 · Hailuo 2.3 1080p 30 → 40 · Wan 3.0 1080p 52.5 → 22 · Seedance Pro 1080p 54 → 22 · Veo 3.1 1080p 116 → 10 · Seedance 2.0 1080p 135 → 8. A 3-minute film: Kling 3.0 1080p 288 credits (4/month); Seedance 2.0 1080p 1,620 credits (more than the Plus pool; Plus = 2.2 min of Seedance 1080p a month).
- Higgsfield's "Minimax Hailuo 2.3" is the previous MiniMax generation (closed, ~10 s, silent, one image input), not H3.

## 2. MiniMax H3 — the official API (pay-as-you-go)
Source: https://minimax-ai.chat/models/minimax-h3/ (third-party summary of the platform price) · https://platform.minimax.io/docs/guides/pricing-video (vendor: *"MiniMax H3 is not supported yet"* in the prepaid packs; pay-as-you-go) · Artificial Analysis price column ($7.80/min = $0.13/s, corroborating)
- 768p **$0.08/s** · 2K **$0.13/s**; native stereo audio included; first five reference images free, $0.04 each after; reference video billed at the output rate; 768p→2K regeneration $0.05/s; T2V and Ref2V the same rate.
- 15 s ad: $1.20 (768p) / $1.95 (2K); 3 min: $14.40 / $23.40; 50 ads a month at 768p ≈ $60. Rejected takes are paid.

## 3. fal H3 Max — MiniMax H3 open weights, post-trained by fal
Source: https://fal.ai/minimax-h3-max · https://fal.ai/models/minimax/h3-max/text-to-video · launch release 2026-09-01 (prnewswire 302866462)
- *"post-trained by fal on top of the open-weight base MiniMax H3 model"*, on fal's own inference engine — *"roughly 35x the throughput of the official MiniMax H3 endpoint"*; MiniMax's H3 team endorses the partnership.
- Launch price (75 % off) **ends 2026-09-14**: 480p $0.0125/s · 768p $0.02/s · 1080p $0.04/s. **From 2026-09-15**: 480p $0.05/s · 768p **$0.08/s** · 1080p **$0.16/s**; H3 Max Turbo half of each.
- *"Five generations a day stay free for signed-in users regardless, at up to 15 seconds each."* — the exam of this route costs nothing.
- T2V and I2V the same rate; synchronized audio on every generation.
- 15 s ad from 2026-09-15: $1.20 (768p) / $2.40 (1080p).

## 4. Quality — blind human votes (Artificial Analysis, read 2026-09-14)
Source: https://artificialanalysis.ai/video/leaderboard/text-to-video (with audio) · https://artificialanalysis.ai/video/leaderboard/image-to-video
- Text-to-video with audio: Wan 3.0 1,242 (#1) · Gemini Omni Flash 1,237 · **MiniMax H3 Max (fal) 1,231 (#3)** · **MiniMax H3 1,226 (#4)** · Seedance 2.0 720p 1,220 · Kling 3.0 1080p Pro 1,108 (#10) · Kling 3.0 720p 1,101 · Sora 2 1,098 · Veo 3.1 1,089 (#17) · Veo 3.1 Fast 1,084.
- Image-to-video: **H3 Max (fal) 1,206 (#1)** · Seedance 2.0 720p 1,197 · **MiniMax H3 1,190 (#3)** · Wan 3.0 1,178 · Veo 3.1 1,089 (#11) · Kling 3.0 1080p Pro 1,077 (#15) · Veo 3.1 Fast 1,075.
- Reading: the station's own engine family sits above Kling and Veo; the station runs it squeezed (640×1152, 4 steps, 16 GB) and therefore below the board's H3 — the drift of EYW-002 (identity 0.27–0.50) is the squeezed run's, not the family's.

## 5. What the hands know today (measured)
`packages/dxb-mcp/src/groups/media.ts` 311 lines · `packages/outbox-executor/src/media-lanes.ts` 113 · `packages/dxb-mcp/src/dispatch-book.ts` 430 — mentions of RunPod 0, Higgsfield 0, API 0; the engine path is the station's ComfyUI/H3. The 14 studio personas carry the word MiniMax 0 times (tool-agnostic, his 2026-09-03 word).

## 6. What "READY" will mean when the leg is built (from the board, not yet a plan)
Each route = one hand in the `media` tool group with the route as data; its price per finished second in the cost table before the job; its key in the vault; one exam per route with the same brief as the station; money out per route = one priced proposal, his approval. Understanding report → plan → his approval → code.
