---
name: r42-library-enrichment-lessons
description: "R4.2 ✓ (2026-07-18 gecesi) — library governed-data oldu (grant 168 kimlik-aynası, review 423, quality 438); raf kancası std.knowledge_shelf CANLI; dersler: hayalet next-server eski build servis eder (pid ölç), kalıcı-grant dünyası eski sıfır-grant testlerini kırar (park/geri-ver), yeni DB verisi UI'da ham string sızdırır (dict önce)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 68a93e2d-1cbf-4f4c-bfb6-1626ea78cfca
---

**R4.2 shipped 2026-07-17→18 night** (roadmap row = evidence ledger; gap report
`.planning/research/R4.2-LIBRARY-GAP-MATRIX.md`). R-series has NO open executable
rows left — next per CEO order: E12.2 → E12.3-5 → E13.x. F-11 fully closed.

**Live-state facts other sessions need:** library_grants 168 = 21 depts × 8
dxb-mcp groups, an IDENTITY MIRROR of the enforced profile surface (21/21
`_tools` byte-identical post-recompile — intentionally zero behavior change;
narrowing = G-7 follow-up, a CEO-visible policy decision from usage actuals).
Post-gate policy `std.knowledge_shelf` is LIVE: any task whose output_contract
matches `\b(research|araştırma)` must carry file-kind report evidence; the gate
itself registers it kind=research via control fn (A8 CEO context, adaptation A9).

**Why (lessons):**
- TWO ghost next-servers served a STALE build through 2 rebuilds — `pkill -f`
  matched my own shell (exit 144) and missed the real pid. Rule: after restart,
  measure `ss -ltnp | grep :3000` pid and re-render before judging UI fixes.
- Standing grants broke 2 e9 tests written for a zero-grant world + LIMIT-5 /
  Map-overwrite live-data fragilities in phase9/e11. Pattern: tests on LIVE
  production DB must be state-independent (before/after layer equality,
  fresh-witness seeds, accumulate-don't-overwrite, same-universe aggregates);
  park/restore standing grants via control fn inside try/finally.
- Filling previously-NULL DB fields makes dormant UI paths render — raw EN
  enum strings surfaced on the TR locale the moment review_status got values.
  Rule: data enrichment = a RULE #0 surface change; dict keys land WITH the data.
- A1 ellipsis hunt pattern that worked: drop info-free columns (Version 406/439
  empty; zero-count Access/Usage) to detail, `break-words` on slugs/labels,
  uncap width to the MEASURED max (43ch dept name), then assert
  `clipped 0` over td/dd/dt/a/span/th at TR/EN × 1280/1920.

Related: [[evidence-before-done]], [[design-verification-rule0]],
[[ceo-design-minimalism-ruling]], [[r32-voice-deferral-u15]].
