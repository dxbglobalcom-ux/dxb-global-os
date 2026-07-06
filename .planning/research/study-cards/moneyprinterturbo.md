# Study Card: MoneyPrinterTurbo (RETROACTIVE)

> Retroactive backfill (Pitfall 5): installed before the tracking program existed.

- **Tool:** MoneyPrinterTurbo (automated short-video generation: script→voice→captions→assembly)
- **Slug:** moneyprinterturbo
- **Category:** Media/content
- **Status:** STUDY
- **Target Phase:** 10 (Department Activation Waves — Social wave)
- **Owner (dept/tier):** Social media dept
- **Trigger Type:** skill
- **Source:** github.com/harry0703/MoneyPrinterTurbo (installed locally)
- **Pinned Version:** installed at runtime; pin at Phase 10 wave start
- **Purpose:** Short-video production capacity for the social-media department (and future social-media subsidiary). Runs as tooling behind the Creative/Social pipeline; output always passes humanizer + approval gate before any outbound post.
- **Official Docs URL:** repo README
- **Key API / Usage Notes:** config-driven video pipeline; needs LLM + TTS backends — wire to LiteLLM + Speaches at Phase 10, never raw provider keys (I4/vault discipline).
- **Known Pitfalls:** generated content is outbound content — DEPT-04 humanizer + GATE-01 draft-first apply without exception; provider API keys must come from the LiteLLM/virtual-key path, not plaintext config.
- **Install Command:** already installed — Phase 10 wave re-audits config for key hygiene
- **Legitimacy Verdict:** OK — established open-source repo; key-hygiene re-audit owed at activation

## Lifecycle Checklist
- [x] STUDY (backfilled 2026-07-06)
- [ ] INSTALL
- [ ] ADOPT
- [ ] EMBED
