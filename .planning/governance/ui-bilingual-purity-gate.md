---
name: ui-bilingual-purity-gate
description: "CEO-visible UI must be 100% single-language per locale — run scripts/i18n-purity-check.sh + Playwright both-locale grep before ANY org/dashboard \"done\" claim"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 8d6b0a5d-7aee-4050-bdf2-9c63a7459068
---

CEO eye-test RET 2026-07-13 (wave 3d): TR locale showed a mixed English/Turkish tree — departments had no TR name in the schema, title_tr covered 67/199. CEO verdict: "ekranın bir kısmı Türkçe bir kısmı İngilizce = profesyonellik ihlali; neden her şeyi en ince detaya kadar doğrulamıyorsunuz."

**Why:** partial i18n coverage passes dictionary-parity checks but still renders mixed screens, because DATA (DB titles/names) is a second i18n surface next to the message dictionaries. Both must be gated.

**How to apply:**
1. Before any "done" on CEO-visible UI: run `scripts/i18n-purity-check.sh` (agents title EN+TR coverage, departments display_name EN+TR, dictionary parity) — must PASS.
2. Playwright-render BOTH locales and grep the page snapshot for cross-language remnants (EN words on TR screen and vice versa; platform proper nouns like TikTok/SEO/CRM are exempt).
3. New DB columns that surface in UI text MUST ship with a `_tr` twin (or explicit CEO-approved exemption) — bilingual by construction (design brief A2: EN primary, TR full secondary).
4. Locale toggle triggers RSC re-render but first snapshot can race — reload before asserting.

Related: [[evidence-before-done]], [[english-directive-2026-07-12]] (artifacts EN; UI is bilingual — different rules), [[ceo-report-format]].
