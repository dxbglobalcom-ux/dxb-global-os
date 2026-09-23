# Prompt audit — shared brief for the three read-only auditors

## Goal (one sentence)
Find the dated prompting patterns ("cruft") in your slice of this holding's prompt surface, judged
against Claude Opus 5.5 as the target model, and return findings in the exact shape below — read-only.

## The procedure you execute (read both before judging anything)
1. `/tmp/claude-1000/bundled-skills/2.1.281/4267615c9af9119f5fa61475ed103341/claude-api/shared/prompt-audit.md`
   — Anthropic's own audit procedure. Steps 3–5, the four pattern groups, and the KEEP LIST are binding.
   The keep list is as binding as the pattern tables: context, reasons, fragile exact scripts, tool
   contracts, prohibitions against failures that still reproduce, routing/trigger text, working redundancy.
2. `/home/dxb/.claude/projects/-home-dxb-DxB-Global-OS/6176c228-1529-4280-b4b4-74440cbfa8f3/tool-results/bimt01kds.txt`
   — lines 1–92: "Migrating to Claude Opus 5.5" (behavioral shifts, effort default `medium`, thinking always on,
   progress notes in thinking blocks, frontend-design named-pattern exception). Lines 97–186: the Claude Opus 5
   behavioral shifts that Opus 5.5 says to RE-TEST (verbosity, over-verification, self-check traps, scope,
   subagent over-delegation, self-correction narration).

## Target model and context (already established — do not re-derive)
- Target: `claude-opus-5-5`. The construction crew (the sessions that build this repo) runs it now:
  chief engineer xhigh, writer max, refuter/debugger subagents xhigh, design-eye `claude-fable-5-1` high.
- The runtime (the company's AI employees, run by `packages/orchestrator`) still runs Opus 5 through DB routing
  rows; whether runtime moves to Opus 5.5 is the CEO's open decision (board row B51). Audit runtime text against
  Opus 5.5 anyway, and say where a finding is ALSO live on Opus 5 today.
- Personas are Turkish. The runtime loads a persona from the line `# PERSONA — ` to end of file
  (`packages/voice/src/persona.ts`), wraps it with `standingPrompt()` (`packages/voice/src/prompt-core.ts`),
  and passes it as the system prompt of a Claude Agent SDK `query()`.
- The scan already ran every greppable signal of the procedure over every file:
  `…/scratchpad/audit/hits.tsv` (file, line, signal, text — 5,521 rows) and `…/scratchpad/audit/counts.tsv`
  (per-file counts per signal). Directory: `/tmp/claude-1000/-home-dxb-DxB-Global-OS/6176c228-1529-4280-b4b4-74440cbfa8f3/scratchpad/audit/`.
  Use them to navigate; a signal hit is a lead, not a finding. Judge by reading the text in place.
- The CEO is Turkish, not a developer. He is the owner of the holding.

## Three buckets — tag every finding with one
1. **session-written** — text an engineering session wrote: door procedures, agent bodies, hook boilerplate,
   memory index hooks. These may be edited later.
2. **his-words** — the CEO's own words or laws. NEVER proposed as a silent edit; a rewrite is proposed for HIM to
   decide line by line. A line is his-words when ANY of: it is a quoted Turkish sentence of his (italic or in
   quotes, often with a date); it carries or sits inside a `<!-- CEO-OK: … -->` marker; it is a named law or
   standing order (LAW A/B/C/D, STANDING ORDER 13/14, "NOTHING BECOMES A LAW…", RULE #0-A/#0-B); it restates a
   ruling registered in `/home/dxb/DxB Global OS/scripts/governance/ceo-approvals.json` or a file under
   `/home/dxb/DxB Global OS/docs/ceo-directives/` or `HOLDING-OS-MASTER-PLAN/00-CEO-DIRECTIVE-*.md`;
   it is an Islamic boundary (constitutional, CEO-only — personas §12 "Discipline DNA & Islamic conduct" and §13).
   Cite the evidence that makes it his (the marker, the ledger key, the directive file).
3. **runtime** — persona bodies and orchestrator/voice/kernel prompt or request code. Report + proposed diff only.

## Output — the Step 5 shape, exactly
Return ONE markdown table, sorted by confidence (High, Medium, Low), columns:
`# | Location (abs path:line or line-range) | Evidence (exact quote, ≤ 160 chars) | Pattern (group/row, e.g. 1a pressure) | Why obsolete for Opus 5.5 (1–2 sentences, tied to the documented behavior) | Confidence | Action (remove / rewrite / move / replace-with-API-feature / add / flag) | Replacement text (for rewrite/add; English for English text, Turkish for Turkish text) | Bucket`

Rules for the table:
- A finding you cannot tie to a named pattern AND an Opus 5.5 reason is not a finding. Low-confidence idiom
  dating = `flag`, no replacement.
- A documented-pattern match gets a concrete action and replacement — do not downgrade to `flag` because it
  "seems minor" (procedure Step 5, flag-vs-fix threshold).
- TEMPLATE-LEVEL patterns (the same sentence or construct repeated across many persona files): ONE row, with the
  count of files, 3 representative locations, and the exact `grep -rn` command (absolute paths, quoted) that lists
  every occurrence so the chief engineer can re-verify it. Then list file-specific outliers individually.
- Clean is a valid outcome. Do not manufacture findings. Never justify a deletion by length alone.
- Before the table, 5 lines max: counts per group, and the 2–3 highest-impact findings in prose.
- After the table, a section "Keep-list decisions" — up to 10 lines naming signal hits you deliberately did NOT
  flag and which keep-list item protects them (so the chief engineer sees the judgment, not only the output).

## What you must not do
- Do not edit, write, move or delete any file. Do not run generators, sync scripts, git commands that change
  state, or any model/API call. Read-only Bash (cat, sed -n, grep, awk, wc) is fine.
- Do not spawn subagents.
- Never `cd` inside a compound Bash command (a hook blocks it). Use absolute paths; paths contain spaces — quote them.
- Do not re-audit the procedure itself or argue with the target model choice.
- Word limit for your whole reply: 3,000 words. If findings exceed it, keep every High/Medium row and summarize
  Low rows by pattern with counts.
