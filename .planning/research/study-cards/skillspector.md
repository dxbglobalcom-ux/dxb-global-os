# Study Card: SkillSpector

> FILLED 2026-07-17 (R4.1 Library research pass — D8 masaüstü item 20; doubles as a D7 sweep find). HIGH PRIORITY: becomes a standing gate in our own STUDY→INSTALL lifecycle.

- **Tool:** SkillSpector (NVIDIA) — static security scanner for AI agent skills (Claude Code, Codex CLI, Gemini CLI…)
- **Slug:** skillspector
- **Category:** Security / Claude Code ecosystem
- **Status:** STUDY
- **Target Phase:** NEXT skill-install event (gate tool — installs before any further third-party skill enters `~/.claude/skills`)
- **Owner (dept/tier):** Security/QA gate (orchestrator-run)
- **Trigger Type:** tool (CLI scanner)
- **Source:** https://github.com/nvidia/skillspector — NVIDIA open source
- **Pinned Version:** latest release at INSTALL (record exact tag)
- **Purpose:** Answers "is this skill safe to install?" — static analysis (regex, Python AST, YARA) + optional LLM evaluation; never executes the scanned skill. Detects 68 vulnerability patterns across 17 categories: prompt injection, data exfiltration, privilege escalation, supply chain, excessive agency, output handling, system-prompt leakage, memory poisoning, tool misuse, rogue agent, anti-refusal, trigger abuse, dangerous code (AST), taint tracking, YARA signatures, MCP least-privilege, MCP tool poisoning. Upstream research: 26.1% of ecosystem skills carry vulnerabilities, 5.2% look intentionally malicious — exactly why our study-before-install law exists.
- **Official Docs URL:** https://github.com/nvidia/skillspector (README)

## Key API / Usage Notes

- Run against a skill DIRECTORY before it touches the live skills path; archive scan report next to the study card (evidence trail).
- **Registered lifecycle amendment (this pass):** for `kind=skill`/`plugin` intakes from third parties, INSTALL step = SkillSpector scan + clean report BEFORE activation. Recorded in the R4.1 intake report; tracker Notes column carries "SkillSpector gate" on affected rows.
- Optional LLM-evaluation mode: run through LiteLLM virtual key if used (cost-tagged), static-only is free.

## Known Pitfalls

1. Static analysis ≠ proof of safety: a clean scan lowers risk, doesn't eliminate it — D6 adaptation (rewriting third-party skills in our own text) remains the stronger control; scan + adapt, not scan-instead-of-adapt.
2. False positives on aggressive-but-legit automation patterns — triage findings, don't auto-reject.
3. Scanner itself is a third-party tool: review its own repo/release before install (it meets its own bar).

- **Install Command:** (at next skill-install event) per repo README (pip/uv class install) → `skillspector scan <skill-dir>` smoke test on an already-trusted skill.
- **Legitimacy Verdict:** OK — NVIDIA first-party OSS, free (D1 compliant), defensive-security purpose aligned with least-privilege constitution.

## Lifecycle Checklist
- [x] STUDY (2026-07-17 — R4.1 pass)
- [x] INSTALL (2026-07-18 R4.3 — runnable via `uvx --from git+https://github.com/nvidia/skillspector skillspector`; NOT on PyPI, GitHub-source only)
- [x] ADOPT (gate exercised on the R4.3 free tranche; reports archived .planning/research/skillspector/. LIMIT measured: component discovery is SKILL-oriented — npm MCP packages parse as 0 components (verdict weak there); scrapling Python source scanned fully: 28 findings, all 3 decisive ones triaged FALSE POSITIVE at source. Gate = scan + provenance + version-pin + schema-hash pins together.)
- [ ] EMBED
