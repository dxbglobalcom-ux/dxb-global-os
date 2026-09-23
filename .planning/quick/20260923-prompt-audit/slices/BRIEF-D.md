# Prompt audit — slice D (the 63 persona bodies slice C did not read line by line)

## Goal (one sentence)
Read every line of the persona bodies in your list, from the line `# PERSONA — ` to the end of the file,
and return the dated prompting patterns found there, judged against Claude Opus 5.5 — read-only.

## Read first (binding)
1. The shared brief: `/tmp/claude-1000/-home-dxb-DxB-Global-OS/6176c228-1529-4280-b4b4-74440cbfa8f3/scratchpad/audit/BRIEF.md`
   (procedure, target model, buckets, output shape, what you must not do). Everything in it applies,
   except its word limit: your reader is the chief engineer, who re-verifies every row at file:line
   himself, so give him every file-specific finding and nothing he already has.
2. The procedure it names (prompt-audit.md, Steps 3–5, the four groups, the KEEP LIST).

## Already established — do not re-report these as findings
These template-level patterns were found across all 213 bodies by slices B and C. For each, state in ONE
line per template whether every file in your list carries it unchanged, and name any file that deviates
(different wording, extra clause, missing) — a deviation is a finding, the template itself is not:
- T1 §2 lead-in "Fixed reasoning order for every engagement:" / "Muhakeme sırası sabittir"
- T2 §8 "Escalation language: one sentence …" / "Eskalasyon dili: tek cümle …" and the cadence "single line / tek satır"
- T3 §8 "Format sabittir / Fixed format: CEO tablo standardı …"
- T4 §8 language line: "Language: English (project artifact standard …)" / "Dil: rapor Türkçe …"
- T5 §9 `notify_broadcast` line and `WebSearch/WebFetch` / "web fetch and search" (no seat holds these tools:
  worker-shim.ts sets `tools: []`, no gateway profile grants them)
- T6 §11 heading "Fable 5 hook binding / bağlantısı", "pre-task/post-task … rejected", "On violation / İhlalde davranış" line
- T7 §12 (canon text, his words): "Plan before execution", "Self-review before handoff", "No lazy proposals",
  "the discipline of Fable 5 and Solo 5.6 Ultra", "Inheritance: every future persona …"
- T8 the version comment `<!-- v… · fable-5 · … -->` and the §12 constitutional comment
- T9 §3 "Adım kalıbı / … pattern:" step chains (flag-level unless a chain is pure judgment work)
- T10 "NEVER records / ASLA kaydetmez", "Never assumes / Asla varsaymaz" blocks (keep-list; not findings)

## What to look for in the body text itself (file-specific)
Everything in groups 1a–1f, 2, 3 of the procedure that is NOT one of the templates above. Typical outliers
seen in other slices: fixed step scripts for judgment work that contradict the same file's own limits;
lines that tell the seat not to report or narrate; rules that contradict the standing layer the runtime
wraps around every persona (`/home/dxb/DxB Global OS/packages/voice/src/prompt-core.ts` — read it once:
language law, honesty line, CEO language law); history narratives, incident IDs, wiki links, dated
"CEO rejected … on …" stories, "Fable in person" author tags; pinned model names; numeric output caps;
grader/gate wording aimed at authors; pressure capitals; tools named that the seat does not hold.
Clean is a valid outcome for a file. Do not manufacture findings.

## Output
1. Coverage line: how many files you read in full, by name count, and any you could not read (with why).
2. T1–T10: one line each (all present unchanged / deviations with file:line).
3. The Step 5 table (columns exactly as in BRIEF.md) for file-specific findings only, sorted High → Low,
   each row with the absolute path:line and the exact quote.
4. Keep-list decisions: the signal hits you deliberately did not flag, and which keep-list item protects them.
