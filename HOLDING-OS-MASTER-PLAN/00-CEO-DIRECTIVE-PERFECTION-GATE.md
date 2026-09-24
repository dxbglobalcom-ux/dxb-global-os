# CEO DIRECTIVE — PERFECTION GATE (2026-07-17)

> **Tier: SEVEREST** — same enforcement class as RULE #0 (Design Verification)
> and RULE #0-A (Measure, Never Guess). Binds every author (Opus 5,
> GPT 5.6, runtime agents) on every deliverable until project end.
> Source: CEO complaint document (Desktop `şikayet.odt`, 2026-07-17) —
> "HER YAPTIĞINIZ İŞE BAKIP BU MÜKEMMEL Mİ MANTIKLI MI DAHA İYİSİ OLUR MU
> DİYE SORACAKSINIZ. BUNU KANUNLAŞTIR."

## The Law

**No deliverable ships until its author has explicitly answered three
questions about it — and acted on the answers:**

1. **Is this PERFECT?** — Not "does it compile", not "does the test pass".
   Would a world-class specialist in this exact craft sign it with their
   name? If any part is embarrassing under that gaze, it is not done.
2. **Is this LOGICAL?** — Does the shape of the thing match the shape of
   the problem? A department page that dumps every employee, a voice line
   that speaks the wrong language, an input that hides where intent goes —
   each "worked" and each was illogical. Structure must serve the user's
   mental model, not the implementer's convenience.
3. **Could it be BETTER?** — Name the concrete better version. If it is
   reachable within the current scope, build it now. If it belongs to a
   future roadmap row, record it as a boundary (00-INDEX U-table or the
   roadmap row's open-items list) — silently shipping the lesser version
   is a violation.

## Enforcement

- The three answers are part of the evidence contract: a closure report
  (SUMMARY, roadmap ✓, STATE update) that cannot show the pass happened
  is incomplete — same standing as a missing Design Verification Pass.
- "It satisfies the spec row" is NOT a defense. The spec is the floor.
  This directive makes quality the ceiling-check on top of every floor.
- Applies to the holding's deliverables — a piece he will use, such as the
  dashboard's CRM section — held to the Ferrari standard of `.claude/CLAUDE.md`,
  a first-place candidate in a world competition; not to every small job (a
  fix, a record, a one-line change). His word of 2026-09-24.
  <!-- CEO-OK: h6-perfection-gate-for-deliverables-2026-09-24 --> The CEO
  seeing sloppy work in a deliverable that the author never questioned =
  governance violation (RET + recorded), regardless of whether the spec
  technically allowed it.
- Pairs with the existing laws: RULE #0 verifies the eye, RULE #0-A
  verifies the facts, PERFECTION GATE verifies the judgment.

## Recorded trigger cases (why this law exists)

| Case | What shipped | What the gate would have caught |
|---|---|---|
| Command palette | Intent lane hidden behind a 3-char typing rule; single-line input | "Where does the CEO write a full intent?" has no visible answer |
| /org/hr | Equipment dump of all employees as the "HR department" page | An HR module with zero categorization is not a digital HR |
| Voice line | UI locale forced into STT; TR speech transcribed as EN; EN text spoken by TR phoneme voice | One listen: the output language is unintelligible |
| Voice latency | opus-4.8 routed for 2-4 spoken sentences | "Is a frontier model logical for a voice ack?" — no |
