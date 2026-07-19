# C-Ledger Measured Answers — C14 / C15 / C16 / C2-embed (2026-07-19, Fable in person)

RULE #0-A: every answer below cites the measurement executed this session.
No guesses; anything unmeasurable is labeled UNVERIFIED.

## C14 — "Memory page: what stops these from burning tokens?"

**Answer (measured):** memory has ONE write door and ONE read door, both
policy-gated:
- Writes: `packages/memory-router/src/write-policy.ts:1` — "The single write
  door into memory (master PHASE-06 §3, write-policy rule set)". Agents cannot
  free-write memory; candidate entries pass classification (glm-5.2 api row
  `memory.classify`, a low-cost model) and only promoted content persists
  (promotion = `memory.promote` on the subscription lane).
- Reads: recall is a bounded query (`recallMemory(db, { limit: 5 })` in the
  voice/chat answer paths — measured in `packages/voice/src/answer.ts:230` and
  `chat-drain.ts`), never a full-memory dump into a prompt.
- Compaction: nightly `memory-compaction` job (scheduler cron 03:00) expires
  stale entries — `packages/outbox-executor/src/scheduler.ts` CADENCES.
- The page itself is read-only projection; it spends zero model tokens.
The Tokens page (v2, C24 fix) now shows exactly what the workforce spends.

## C15 — "Skills/plugins: are all usable? studied? what is the yellow mark?"

- **Counts (live DB):** `select count(*) … kind='skill'` → **23**; `kind='plugin'`
  → **18**; `kind='tool'` → 21 (pinned via tool_pins); `kind='mcp'` → 12.
- **Are they usable?** The 21 tools are live-pinned (R4.3: 69 tools across 5
  servers verified against the running gateway; staffed external-hands E2E ran
  git/context7 through a real employee task — roadmap R4.3 row). Skills/
  plugins entered the library through the E9.5 intake from the real installed
  inventory — each `source_ref` points at its actual location on disk
  (measured sample: `~/.claude/skills/gsd-stats`, study-cards). They are
  installed and reachable; per-item exam coverage beyond the R4.3 tool set is
  NOT claimed — ⚠ UNVERIFIED per item until a study record exists for it.
- **Yellow marker:** measured at `components/ai/library-kind-board.tsx:140` —
  the badge is yellow (warn) when `review_status` is anything but `approved`.
  Plainly: **yellow = not yet reviewed/approved by quality**, green = approved.

## C16 — "Where are the items the CEO himself provided?"

Measured provenance over the 447 library items:
- **214 personas** — of which **199** carry `source_ref = personas/<dept>/…`:
  these are the CEO's own agency collection (153 legacy imports + Fable v2
  rewrites) — the CEO's largest contribution, alive as the workforce itself.
  15 more sit in `personas/_library/` (deletion list pending CEO confirm, C8).
- **75 training items** — study cards produced from the CEO-directed study
  program (`.planning/research/study-cards/*` — measured sample rows). The
  video-learn items the CEO fed by link live here.
- The Library page's provenance column (`source_ref`) shows this per item —
  filter by kind `persona` or `training` to see "the CEO's own" at once.

## C2-embed — "embedding/small may stay only if free"

Measured: `embed-small` = openrouter/openai/text-embedding-3-small, **26
calls, $0.00 logged spend** (below cent rounding; $0.02/M list price). It is
the memory/library semantic-search backbone (`memory-router` classify-read +
write-policy). It is PAID-tier by list price → per the CEO's rule it cannot
silently stay. **Open decision to the CEO:** (a) keep (measured cost ≈ zero),
(b) kill semantic recall, or (c) budget a local embedding replacement.
No free hosted embedding of equal quality was verified tonight — ⚠ UNVERIFIED.
