# Quick ticket — HelpTip depth pass (C-ledger open leg "14c/HelpTip depth")

**Spec pointer:** `HOLDING-OS-MASTER-PLAN/00-NOTE-CEO-COMPLAINT-LEDGER-2026-07-19.md` — open-legs list ("HelpTip depth pass — CEO 2026-07-19: page help must explain the page's sections and what each is for, in plain non-programmer language, EN+TR — one-line generic texts are insufficient") + completeness-audit row "14c/HelpTip depth ❌ OPEN". Atomic doc: SIKAYET-DEFTERI-DETAYLI.html systemic rule 1 (question mark on every page, plain-language, EN+TR) and item 14c.

**Scope (no new design decisions):**
1. `HelpTip` primitive accepts structured content `{ what, sections[{t,b}] }` alongside the existing string form; popover renders summary + per-section explanations, scrollable, no ellipsis, no decoration.
2. `messages/en.json` + `messages/tr.json` `help` namespace: all 49 entries become structured — summary, per-section plain explanation, data provenance (and removal note where a removal mechanism exists). Section lists grounded in the measured page structure (this session's grep of every page's Panel titles + dict namespaces).
3. `LibraryKindBoard.helpText` prop type widened to match.

**Evidence contract (RULE #0 + Amendment A1):** pnpm build green; `next start` restarted on fresh build; Playwright battery over all 49 help-bearing routes × EN+TR × 2 widths with the HelpTip popover OPEN — asserts sections render, zero "…" nodes, `scrollWidth === clientWidth`; screenshots to CEO.
