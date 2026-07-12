# 00-CEO-DIRECTIVE-LANGUAGE — Project Artifact Language: ENGLISH

> **Source ruling:** CEO, 2026-07-12 ~02:00-02:20 (three consecutive chat rulings, processed mid-E5.5-D4 by Fable in person).
> **Status: BINDING — applies everywhere, until the project ends.** Runtime memory: `english-directive-2026-07-12` (+ governance mirror).

## 1. The rule

1. **Every project artifact is written in ENGLISH** from 2026-07-12 onward: personas, dossiers, specs, migrations, seeds, code comments, commit messages, planning docs, CEO reports, runbooks, evidence records — everything that lands in the repo or the DB.
2. **The single exception is the CEO chat channel:** conversational replies to the CEO in working sessions stay **Turkish** ("benimle yazışmanın dışında her şey İngilizce"). This exception covers the conversation only — any artifact produced during that conversation is still English.
3. The rule binds ALL authors: Fable sessions, Opus takeover sessions, GPT 5.6 solo module work (K1), future hr-factory output, and every runtime agent producing repo/DB artifacts.

## 2. Scope clarifications

- **Existing Turkish content (86 gated personas + corpus + planning docs as of the directive) stays as-is.** A translation pass is an OPTIONAL follow-up for the CEO to schedule — never blocking, quality never dropped mid-wave (K2).
- **UI bilinguality is UNCHANGED:** the dashboard remains EN-primary / TR-full-secondary (UI_SPEC amendment A2). That rule governs the product's UI layer; this rule governs authoring language.
- **Technical chain is language-agnostic (verified 2026-07-12):** the persona gate matches sections by `## {n}.` number; `HEADER_RE` / `HOOK_VERSION_RE` accept English; `fn_persona_submit` injection scan covers EN+TR patterns.
- **Follow-up item (K1-class, small):** `packages/hr/src/template.ts` `PERSONA_SECTIONS[].title` strings are still Turkish — the compiler re-renders canonical section titles from them. Switching them to English = one code change + snapshot test updates. Listed, not urgent.

## 3. Enforcement

- Session bootstrap reads surface this directive via memory index + this file; violating it is a recorded deviation (master-plan fidelity class).
- Wave/step closure records from D4b onward are written in English; roadmap table entries follow.
