# Successor session — SIGNAL with the CEO, continued (plan only, nothing is built)

You are the chief engineer (Opus 5.5 · xhigh). Code, if it ever comes, is written by the `builder`
subagent; you commit. The previous session (`dxb-global-os-f3`, transcript `65cdf137`) talked SIGNAL
through with the CEO (Muhittin Bey) on 2026-09-24 and handed over at **37 % used context** on his
word: *"senin session bitior devir notu hazırla"*. The handover rule is 40 % used, at a clean break.

## Read first
1. `.planning/quick/20260924-signal-revenue-study/CONVERSATION.md` — the whole talk, verbatim, up to his "yahu neden dubai" message. After it he said only: *"aynen çalışsın bakalım sende takip et"* (about the Fable study) and *"senin session bitior devir notu hazırla bence % kaç olunca hazırlıorsun"*.
2. `.planning/quick/20260924-night-content-engine/PLAN.md` — the SIGNAL plan, as corrected in this session (`a2446b16`, `b5bc3ce0`).
3. `.planning/quick/20260924-signal-revenue-study/BRIEF.md` — what the Fable 5.1 revenue study was told.

## What he decided this session (each already written into PLAN.md and board row B43)
- OUTLETEURO is not a desk of SIGNAL (*"Outleteuro DxB Holding kurulduktan sonra … gerek var şimdlik?"*).
- Every video the studio makes for a client is read back and analysed once the client publishes it (*"her müşteriye ürettiğimiz videonun analizini makinamız izlemeli"*); **no video is produced only to test**.
- The four uses he liked (*"neişe yarar kısmı da çok güzel"*): each client's sector (the earner) · a DxB Holding Media-Studio account · rival agencies · selling the machine one day.
- **$8,000/month per brand stays** (*"yok 8 bin dolar kalsın güzel para"*; $4–6k would already be enough). B28 unchanged.
- The agency is **premium**: never sell cheapness or speed (*"bu bir reklam ajansı kendini pahalı göstermesi gerekmez mi?"*).

## Where it stands
- **The plan is NOT approved.** No entry in `scripts/governance/ceo-approvals.json`. Nothing is built.
- **Open with him — asked, not answered:**
  1. **First desk (PLAN §4 decision 1).** The plan text says "stüdyonun kendi alanı". The last recommendation to him (not written into the plan) changed it: the first desk is **the sector of the first brand we want to win**, producing a **paid sector review, credited to the first month** — paid, because of his own "look expensive" rule.
  2. **Reorder the phases** so Phases 0–5 (measurement, data, reading + transcription, scoring, the 5 lessons, the script) come first and the paid review can be sold before the screen (Phase 7, which waits on B32 anyway).
  3. **Decision 2** (free hands first; Apify / Scribe brought to him with their price if they fall short) and **decision 3** (the engine only reads and proposes) — put to him for a "tamam", no explicit answer yet.
  4. **Does the holding hold a trade licence covering media/advertising?** (UAE Advertiser Permit, measured: from 2026-02-01 it applies to marketing agencies and companies publishing promotional content; it concerns publishing, not SIGNAL's reading — B28's business.)
- **Dropped, not to be raised again:** saving the `dxb-research` fleet run. He ordered that tool not be used for this job (*"kesinlikle dxb-research skillini kullanma çok kötü ve uzun"*); the run was left unsaved in the old scratchpad. Silence is the record.
- **The revenue study runs in a Fable 5.1 session: `dxb-global-os-b8`**, VS Code tab "SIGNAL gelir çalışması, dünya çapında", opened ~19:01 with `BRIEF.md` (`6cd25ec3`). Worldwide — every continent and language, the highest-revenue countries on each; research and ideas only. He said *"sende takip et"*: **follow it, do not do its work.** Measure its progress from its folder (`WORKLOG.md`, `STUDY.md`, `EVIDENCE.md`, its commits) and `ListAgents`; a `SendMessage` "success" is a queue, not a delivery. When `STUDY.md` lands, check it against BRIEF.md's standard (every number sourced, the world not one city, plain Turkish, premium positioning, no dxb-research) and tell him in plain Turkish what holds and what does not.

## Session orders (this job only — not laws, written nowhere else)
- No `dxb-research` door for the revenue research. The world, not Dubai.
- **The advisor (Fable 5.1) is consulted only when you are stuck or torn at a hard decision — never at the opening, never as a routine step.** His words: *"fable 5.1 advising olarak çalışıor ilk açılışta hemen ona soruluor neden böyle ya bunu istemiorduk. benim amacım o sessionda advisor olarak kalsın gerektiğinde danışılsın mesela sen zor anlarında arada kalıorsan baş mühendis sorsun danışsın diyeydi."* He made it permanent for every session the same evening (*"evet kalıcı yaz"*); it now stands in `~/.claude/CLAUDE.md`, section Kadro.

## How to speak to him — measured in this session
- He could not follow compressed statistics and jargon: *"inan yazdıklarından çoğu şeyi anlamıormm … bu ne yaa ne diorsun"*. Say what a number MEANS with a concrete example; explain every term once.
- "An account watched 1 million times" was wrong — videos are watched, accounts have followers. Say "an account whose videos are usually watched 1 million times".
- He reads the plan's money in examples: a restaurant client, what we send it each Monday, what it pays.
- Turkish, "siz", "Muhittin Bey", answer first, short. Never ask him to do a step yourself.

## Commits of the previous session
`a2446b16` OUTLETEURO removed · `b5bc3ce0` client videos read back, four uses written · `6cd25ec3` revenue study handed to Fable 5.1. Other sessions have uncommitted work in the tree — commit only your own paths.

## Your first message
The position (CLAUDE.md §0): the SIGNAL plan waits for his eye; next is the Fable study (say what its folder shows, measured) and the four open questions; name what is blocked on him. Then say in one or two plain sentences that you have read the handover and are following the Fable study. Do not ask him what to do.

## Then — the follow-up he asked for ("sende takip et")
Put a watch on `.planning/quick/20260924-signal-revenue-study/` (the `Monitor` tool with an until-loop on `STUDY.md` existing, with a long fallback) so you wake when the study lands, without polling him or the Fable session. When it lands, read `STUDY.md` and `EVIDENCE.md` against `BRIEF.md` (every number sourced and re-openable, the world and not one city, plain Turkish, premium positioning, no dxb-research) — re-open a sample of its sources yourself — and tell him in plain Turkish what holds, what does not, and what it changes in the SIGNAL plan's open questions.
