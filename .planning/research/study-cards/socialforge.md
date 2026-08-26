# Study Card: SocialForge

- **Tool:** SocialForge — open-source agency-grade social media production engine (monthly content calendar: brief → per-platform copy → asset-first image/video → review gallery → approval ledger → delivery audit)
- **Slug:** socialforge
- **Category:** Media/content · social-media department production line
- **Status:** STUDY
- **Target Phase:** 10 (Department Activation Waves — Social wave) · serves board row B28 (the agency seat)
- **Owner (dept/tier):** Social media dept (the 13 written personas under `personas/social-media/`)
- **Trigger Type:** plugin (Claude Code plugin — skills + commands + agents, NOT a runtime of its own)
- **Source:** github.com/indranilbanerjee/socialforge · listed in Google's own Gemini CLI extension directory (`@indranilbanerjee/socialforge`)
- **Pinned Version:** v1.25.1 (read live 2026-08-26)
- **Licence:** MIT
- **Purpose:** The production line the agency seat does not have. Covers the exact chain B28 needs — a client brief becomes a month of posts across Instagram · TikTok · LinkedIn · X · Facebook · Threads · YouTube Shorts, each with its own copy, generated imagery, a human review gallery, an approval ledger and a delivery audit that re-derives every FINAL claim against the disk before anything is packaged.
- **Official Docs URL:** repo README + CHANGELOG
- **Measured size (2026-08-26):** 20 skills · 25 commands · 5 agents · 28 scripts · 10 HTTP connectors, **zero auto-connected** · **260/260 tests passing**

## Why it matters to THIS holding — the three parts worth taking

1. **Asset-first compositing.** The brand's own photograph stays pixel-faithful; the model generates the scene *around* it. This is the direct answer to the failure its own README names — "the last calendar got rejected because the product photo got AI-enhanced beyond recognition". A holding that will put its own products on screen cannot afford the other behaviour.
2. **C2PA `ai-disclosure` signing, default-on.** EU AI Act Article 50 marking, applied before review rather than after publication. The CEO operates from Germany; this is not a nice-to-have.
3. **A gate discipline that matches ours.** Its v1.22.0 release is a list of silent-success defects it hunted down and killed — a preview that returned `success` for an image that did not exist, a generator that exited 0 after every provider failed, a cost report that crashed on the unpriced entries a credential-less run produces. Its rule that "unpriced is not free, every total is a LOWER BOUND" is the same discipline as `dxb-verify`.

## Known Pitfalls
- **Its two generation providers cost money:** images via **Vertex AI Nano Banana Pro**, video via **WaveSpeed Kling v3.0 Pro**. That is the half this holding can replace — the CEO's Google AI Pro subscription already generates images at $0.00 through Antigravity (board B31, 2026-08-26). **Nothing is keyed or paid without his word.**
- Publishing is outward-facing: every post rides `APPROVAL_ENGINE_SPEC`'s gate. Its own approval ledger is an input to that gate, never a replacement for it.
- ⛔ **The betting exclusion binds any campaign it produces** — the CEO's absolute line on board row B28, at any size.
- It installs as a plugin carrying 20 skills, 25 commands and 5 agents into the session surface. The CEO's standing order of 2026-08-09 keeps the plugin surface to claude-mem + context7; **installing is his decision, not the author's.**

## Legitimacy Verdict
**OK to study and to hold on the bench.** MIT, tests green and public, named authorship, and it runs **on Claude Code** — so it is a department tool, not a second agent framework, and `.claude/CLAUDE.md:177` is not touched. Its providers are what make it a paid row.

## Lifecycle Checklist
- [x] STUDY (2026-08-26 — read live, on the CEO's order "Ferrari seviyesinde gerçekleştir")
- [ ] INSTALL — needs the CEO's plugin decision AND a provider swap to the free image hand
- [ ] ADOPT
- [ ] EMBED
