---
name: r43-capability-arsenal
description: "R4.3 ✓ (2026-07-18 gecesi) — dış eller CANLI: pin korpusu 21→69 araç/5 sunucu (git READ, context7, playwright, scrapling+camoufox); doktrin korpusta (paid=öneri kulübesi, hayalet 9/9 isimli); ölçülü sınır: holding çapında tek aktif çalışan finance — dış-el staffed E2E Phase-10'a borç; ders: test fixture'ları canlı audit'e 3087 sahte tool_missing yazmıştı (scope guard şart)"
metadata:
  node_type: memory
  type: project
  originSessionId: 68a93e2d-1cbf-4f4c-bfb6-1626ea78cfca
---

**R4.3 shipped 2026-07-18 night** (roadmap row = evidence ledger; doctrine =
`HOLDING-OS-MASTER-PLAN/CAPABILITY_ARSENAL_DOCTRINE.md`, 00-INDEX row 34).
CEO orders engraved verbatim: arsenal expansion (00:20) + paid tools =
PROPOSAL BENCH, never installed/spent; free tranche "en mükemmel şekilde" (00:30).

**Live-state facts other sessions need:**
- Tool corpus: 69 pinned tools / 5 servers. External catalog entries in
  `packages/gateway/policy/grants.json`: git (uvx ==2026.7.10, `--repository ./`),
  context7@3.2.4 + playwright@0.0.78 (workspace deps, `node_modules/...` paths),
  scrapling (`~/scrapling-env/bin/scrapling mcp` — host-absolute, VPS placement
  must re-provision venv + update entry).
- Denials tightened: playwright browser_run_code_unsafe + browser_file_upload
  everywhere; git write tools K1-denied for engineering (construction rule).
- Library grants: git/context7/playwright→engineering, playwright→quality,
  scrapling→strategy (A4: every new policy grant NEEDS its library grant or
  the compiler filters it — all 21 depts are in the layer since R4.2).
- Ghost dispositions: github+stitch = credential tranche (CEO hands secret,
  vault-only); stripe/revolut/wise/docusign = Phase-11 LOCKED (R6.1).
- **Workforce reality:** the ONLY active+profiled employee holding-wide is in
  finance. Any staffed task elsewhere pre-gate-rejects (std.permission_bounds)
  → ladder → blocked. Task 4a62f8a9 = kept honest signal. Phase-10 activation
  wave owes the first staffed external-hand E2E.

**Why (lessons):**
- Live-DB test suites WROTE PRODUCTION AUDIT ROWS: phase7 pin tests ran
  checkPins with fixture inventories → missing-sweep stamped all 21 real
  dxb-mcp pins per run (147 runs × 21 = 3087 tool_missing rows since 07-14).
  Fix pattern: `checkPins(db, inv, serversInScope)` — tests scope to their
  fixture server; the scheduler scopes to reachable servers (a spawn hiccup
  of npx/uvx must not audit tools as missing).
- Committed source can carry NUL bytes that Read renders as spaces — Edit
  old_string then never matches. Diagnose with `od -c`; `grep -P '\x00'`
  (bash `$'\0'` collapses to empty pattern = matches everything).
- SkillSpector is skill-oriented: npm MCP packages parse as 0 components
  (verdict weak there); Python source scans fully but needs TRIAGE — all 3
  decisive scrapling findings were false positives (`--use-mock-keychain`
  flagged as credential theft; ad-BLOCK domain list flagged as cryptojacking).
- Suite-interleave race class: a parallel suite's ACTIVE fixture agent breaks
  another suite's live SQL acceptance — exclude fixture slug prefixes, and
  sweep prior crashed runs' orphans (r23t-* random slugs = always orphans).

Related: [[r42-library-enrichment-lessons]], [[evidence-before-done]],
[[hetzner-access-and-vault-drop]], [[model-routing-hierarchy]].
