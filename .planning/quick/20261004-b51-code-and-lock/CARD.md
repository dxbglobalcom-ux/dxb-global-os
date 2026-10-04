job: B51 move 5 code bundle 2 — the runtime prompt rows of the prompt audit (C2-2, C2-5, C2-6/7, C2-8, C2-10, C2-11, R14) fixed in code, and the four stale "ADD gelene kadar" persona lines the persona job left, built and live
range: 519e803b..HEAD
blast: 2
risk: 2
reasoning: 1
ambiguity: 0

# The card — 5 / 8, normal, Sol at `high`

- **His words, 2026-10-04 (conversation, verbatim):** asked *"Kod tarafına 'yap' ya da 'bekle'"* with the
  recommendation "yap" for bundle 2, he answered `gerekeni yap ve bu durumdan diğer oturumları da haberdar et
  bilsinler kim nerede çalışıor commitlerle ilgili`.
- blast 2 — four packages: orchestrator (chat, decompose, worker), voice (answer, persona loader), kernel
  (classify), plus three persona files.
- risk 2 — every live employee's and Hamza's prompt.
- reasoning 1 — string edits, one effort guard, one comment strip; the persona lines need the successor seats.
- ambiguity 0 — the audit names each row and its replacement (`20260923-prompt-audit/slices/c-personas-108-213-code.md` PART 2).
- fable: start — a normal job; the start call was made before this card (gaps closed below).
- arrangement: lead — about ten short edits in seven files; the lead's context already holds every line.

## Rows and decisions
- **R2 (`template.ts` heading) — dropped:** already done in 3ebbce2b (`title: "Hook bağlantısı"`).
- **C2-2:** the guard admits `xhigh` (SDK 0.3.259 `effort?: 'low'|'medium'|'high'|'xhigh'|'max'`; routing rows
  allow it since `20260903190000_b43_media_hands.sql`). The unknown-value fallback stays `low` — changing
  it is a separate decision nobody took. One shared helper in `@dxb/voice` (prompt-core), used by chat and
  voice, so the two guards cannot drift again. No existing enum owns the list (grep: only `as` casts).
- **C2-5:** decompose prompt says `<= ${MAX_HOP_DEPTH}` (5, his order 2026-08-27).
- **C2-6/7:** chat lines per the audit's replacement; the reason is measured — `chat-board.tsx:352` renders
  plain text (`whitespace-pre-wrap`, no markdown renderer).
- **C2-8:** voice line per the audit; the number goes, the TTS reason and the no-markdown need stay.
- **C2-10:** "Output JSON ONLY — no prose." deleted in classify and decompose only — both run
  subscription-only (`classify.ts:123`, `decompose.ts:219` throw otherwise), both send `json_schema`.
  `qa.ts`, `executor.ts`, `worker-shim.ts` keep theirs (bundle 3 / LiteLLM paths).
- **C2-11:** `TASK_LANE_LINE` loses "verify with a real tool call" (the tool-holding block already says it)
  and "judged empty"; the file-ref line loses "rejected by the gate".
- **R14:** `loadPersonaBody` strips `<!-- … -->` (multi-line) before the body reaches any lane, and folds the
  run of blank lines a removed comment line leaves (`\n{3,}` → one empty line) — whitespace only; Sol ran the
  built loader over 214 files: 427 comments, 2,557 sections, no text lost beyond whitespace.
- **Persona lines:** `ciso.md:54,73`, `platform-head.md:54`, `chief-ai-officer.md:85` — the successor seats
  exist and are `active` (company DB, measured 18:5x); `iam-secrets-officer.md:23` and `backup-dr-officer.md:23`
  are history and stay. Fraud has no seat, so "fraud ilk turda" stays on the CISO. Refiled:
  submit (opus-5) → gate → `--bind` → `--verify`.

## Done-list (each a command and its expected output)
1. `pnpm vitest run tests/b51/bundle2-prompts.test.ts` before the fix → RED (9 of the 14 because the new helpers
   did not exist yet — the old strings themselves are proven by `evidence/baseline-old-strings.txt` at 519e803b);
   after → all GREEN (17 with Sol's B1 cases).
2. Same file pins: `routeEffort("xhigh") === "xhigh"`, `routeEffort("bogus") === "low"`; chat lines contain
   no "No markdown headers", "under 8 sentences", "PLAN MODE is ON"; voice line has no "2-4"; decompose
   prompt says "<= 5"; classify/decompose prompts have no "Output JSON ONLY"; seat prompt has no
   "verify with a real tool call" / "judged empty" without tools; a `<!-- v1 · fable-5 -->` comment never
   reaches `loadPersonaBody`'s output.
3. `grep -c "ADD gelene" personas/security/ciso.md personas/platform/platform-head.md personas/data-ai/chief-ai-officer.md` → 0 0 0.
4. `scripts/sync-personas-to-db.sh --verify` → `match: 213 · diff: 0`; `--bind --dry-run` → nothing to bind.
5. The pinning tests stay green: tests/r31/persona-delivery, tests/b43/dispatch-book, tests/b43/road-consistency,
   tests/b21/agent-context, tests/c9/chat-legs, tests/u15r2/voice-round2, tests/r31/voice-line.
6. `pnpm -r build` (or the packages' own build) exit 0; the battery once — GREEN.
7. Live: no voice call / task in flight → `systemctl --user restart dxb-scheduler` → active; the built
   `dist/` of orchestrator, voice and kernel carries the new strings and none of the old.
8. ⚠ One live classify call on the construction engine proving the schema path still parses without the
   prose line — or labelled UNVERIFIED.

9. The CEO's second half — the other sessions told who works where: `evidence/peer-notice.txt` (delivery
   measured in each receiver's transcript).

## Measured
- **Phases (local time):** his yes 18:40:49 · peers told 18:42 · card + RED 18:46 · fixes GREEN 18:48 ·
  personas refiled 18:49 · build + restart 18:49-18:51 · commit d364e81a 18:52 · Sol 18:53-18:58 · fixes,
  rebuild, restart 18:59-19:01 · commit 71811fb0 19:01 · battery 19:02-19:07 (BATTERY_GREEN: 1196 passed,
  59 skipped · host 266 passed) · `verify:ledger` OK 19:07.
- **Tokens (lead, `usage.mjs --from 2026-10-04T16:41:00Z`, to 17:02Z):** 132 calls · new 290,167 · cache read
  26,017,374 · output 79,194 · Fable advisor 2 calls (376,749 in, 20,289 out) · list price USD 13.24.
- **Sol:** one pass, `high`, 111,232 tokens; 3 B + 2 evidence gaps, no A — all fixed in 71811fb0 (SOL.md).
- **Arrangement `lead`:** the edits were short and in the lead's context; no fork or helper was opened.
