# Study Card: Rytr — AI writing assistant with a usage-priced API

> FILLED 2026-08-19 (rival-intel source 38 — the CEO's link `instagram.com/reel/Da4dEQvlOCG`, read for its programs on his order).

- **Tool:** Rytr — short-form AI copywriting: tone matching, plagiarism checks, 35+ languages. Its own landing page claims **8,000,000+** users at **4.9/5**.
- **Slug:** rytr
- **Category:** Marketing / content generation
- **Status:** **STUDY** (recommendation: take the product shape, not the key)
- **Target Phase:** 10 (Marketing/Sales outbound wave — alongside [[humanizer]])
- **Owner (dept/tier):** Marketing — outbound copy, behind the approval gate
- **Trigger Type:** ref
- **Source:** https://rytr.me · API docs `github.com/rytr-me/documentation` — both fetched 2026-08-19
- **Licence:** Closed proprietary SaaS.
- **Price, measured at the vendor 2026-08-19:** **Free $0/mo** (10K characters/month · 1 language · no tone matching) · **Unlimited $7.50/mo** (unlimited generations · 1 tone match · 50 plagiarism checks) · **Premium $24.16/mo** (multiple tone matching · 100 checks · 35+ languages). Annual = 2 months free.
- **Free tier:** **A real free plan**, not a trial — 10K characters/month, no card.
- **API — the one difference on this list:** **published and documented.** Base URL `https://app.rytr.me/v1/`, **Bearer token** auth (Account → API). **Usage-priced:** `0-10k chars free` · `$0.75/10k` (10k-1M) · `$0.70/10k` (1M-10M) · `$0.65/10k` (10M-100M) · `$0.60/10k` (>100M). Their own billing note: *"Your card will be billed for usage worth of every $25."* Rate limit reported at 60 req/min standard.

## Verdict — why the key is not taken

It is the **only one of source 38's five programs an agent could drive today**, and it is still not recommended — the reason is duplication, not price. This holding already routes **every** generation through the **LiteLLM proxy** (EMBED, pinned `main-stable`, per-department virtual keys, hard-stop budget enforcement, imported by the dxb-mcp cost group). A Rytr key would open a **second, unmetered text-generation path** with its own card on file, outside the budget stop — the exact failure mode `STACK.md` names by hand: *"Scattering raw provider API keys into agent configs — untraceable spend, unrotatable leaks."*

**What IS taken (P38-4):** the **product shape** — *tone* as a first-class control the operator sets, rather than a sentence buried in a prompt. That folds into [[humanizer]] (STUDY, Phase 10, 33 patterns, mandatory before the outbound approval gate). The control is ours; the generation stays behind LiteLLM.

## Lifecycle Checklist
- [x] STUDY (2026-08-19 — rival-intel 38)
- [ ] INSTALL — not recommended; the idea is merged into [[humanizer]]
