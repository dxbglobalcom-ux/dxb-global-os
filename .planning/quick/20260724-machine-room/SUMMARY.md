# SUMMARY — Machine Room + CEO waivers + workforce-truth fix (2026-07-24 late night)

**Outcome:** CEO's in-chat rulings registered and shipped in one pass (commit 17894b3).

| Item | Result | Evidence |
|---|---|---|
| CEO waiver registered | Hook-violation DETAIL strings stay English ("büyük iş büyük token") — 19e/19f hook leg WAIVED in the ledger; machine-room detail panes (incl. audit expanded raw fields) exempt from the humanization standard. Rule 6 keeps applying to every CEO working surface. | Ledger 19e/19f row + CC-SPEC A4 |
| Machine Room | New LAST nav group `machineRoom` (EN "Machine Room" / TR "Makine Odası"): /gov/audit (violations tab rides along), /ops/runtime, /sys/logs. Decisions stays in Governance (CEO's own record). Doctrine: these are the robots'/audit's surfaces — evidence when dispute arises; CEO not expected to enter. | CC-SPEC registered adaptation A4; nav battery 4/4 (EN+TR × 1366/1920, group renders LAST, zero ellipsis, scrollOK); moved routes 8/8 reachable (200) |
| Workforce-truth fix (eye-test catch, spec-gap rule 5) | Overview "AI Workforce" tile told the CEO "Aktif: 0 / Uykuda: 205" — v_exec_overview counted the LEGACY `agents.status` column (all rows dormant since file-first migration). Agents leg now reads `employment_status`; archived rows excluded per C8. | Migration 20260724005000; DB re-measure `199|198|1`; page tile measured "199 total / Aktif: 198 / Uykuda: 1" |
| Checks | tsc 0, build green + restart, i18n purity PASS, c9 suites 12/12, haram grep 0 (session-wide). | Command outputs |

**Battery-methodology note:** first nav assertion failed falsely — `document.querySelector("nav")` picked the header nav, not the sidebar; corrected to scan all nav elements' group headings.

**Remaining 19f leg (the last one):** task-objective EN text on TR rail/lists — work artifacts are EN by the language directive; CEO-facing Turkish needs a translation-infra decision (waiver also possible given the token-frugal signal — CEO's call, question queued in the report).
