# Study Card: MediaCrawler — the free counterpart of Kalodata

> **APPROVED BY THE CEO 2026-08-19, AND THE LICENCE EXCEPTION IS HIS OWN RULING, NOT THE AUTHOR'S.** <!-- CEO-OK: mediacrawler-owner-permission-2026-08-19 -->

- **Tool:** MediaCrawler (`NanmiCoder/MediaCrawler`) — reads notes and comments from **Xiaohongshu · Douyin · Kuaishou · Bilibili · Weibo · Baidu Tieba**.
- **Slug:** mediacrawler
- **Category:** Social / Research
- **Status:** STUDY
- **Target Phase:** 10
- **Owner (dept/tier):** Social Media (13 written employees) + Research
- **Trigger Type:** skill
- **Source:** https://github.com/NanmiCoder/MediaCrawler
- **Measured live 2026-08-19 (GitHub API):** **63,061 stars · 12,285 forks · Python · last push 2026-08-14**

## The licence, and how it was settled

The repository's LICENSE file was **opened and read in full this session**. Its first line is:

> `NON-COMMERCIAL LEARNING LICENSE 1.1`

The session reported that as a **hard stop** — a holding that intends to earn cannot run a tool whose licence forbids commercial use, and that was written into the report before he answered.

**He overruled it, on first-hand knowledge — evidence label C, the highest this project defines**, and the ruling is his to make:

> *"Mediacrawlerı da holdinge entegre edelim mutlaka, bunun sahibi bizim arkadaş DxB ye tamam siz kullanın dedi ve şunu eklerdi: non commercial derken, bunun öğrenmeye yönelik çalışmalarda da kullanılsın sadece commercial değil dedi. biz de tamam dedik. oyüzden kullanabiliriz. sıkıntı yok."*

**The record as it stands:** the owner's permission is **spoken**, given to DxB directly, and the CEO is the witness to it. **The durable form would be one written line from the owner** — an e-mail or a message filed beside `scripts/governance/ceo-approvals.json`. That is named here as **what would settle it permanently**, not as a condition he attached: he attached none. It becomes worth having the day this tool runs inside a customer-facing, money-earning path rather than an internal one.

## Purpose and the DXB seat

It is **the free counterpart of Kalodata (~$46/month, price behind a login wall, API on the Enterprise tier only)** — rival source 38's third program. Where Kalodata sells TikTok-Shop analytics as a seat, this reads the underlying platforms directly.

It lands on **REVENUE #4** (the trend-signal subscription), whose written mechanism — *last30days + Agent-Reach + hermes night sweep* — now has its China-market side as well.

## Known Pitfalls

1. **ToS exposure is the real risk here, not the licence** — the same class the Agent-Reach row carries. Reading is gated by each platform's own terms, and login-bound reads carry the account.
2. Everything it returns is outside material: quarantine tier, trust tags, never fact without a second source (`PITFALLS.md` #7).
3. Upstream is a single-maintainer Chinese-language project; pin a commit at INSTALL and read the diff before any bump.

## Lifecycle Checklist
- [x] STUDY — opened 2026-08-19; licence read in full and settled by the CEO
- [ ] INSTALL — pinned commit + static scan + live proof
- [ ] ADOPT
- [ ] EMBED
