#!/usr/bin/env bash
# UserPromptSubmit hook — STANDING ORDER 14: SPEAK TO THE CEO IN HIS LANGUAGE.
#
# WHY THIS IS A HOOK AND NOT A SKILL (2026-07-31, and it is the author's defect).
# On 2026-07-30 this rule was moved OUT of the always-on context and into the
# `dxb-ceo-report` skill. That was the wrong placement and the CEO caught it the
# same night: a skill only binds when the author remembers to open it, and this
# rule governs EVERY sentence he reads, not a particular job. Within one hour of
# the move, a report reached him carrying "kapı", "boru" and "satır" — construction
# words for a gate, a shell pipe and a table row — and his answer was: "bu nedir
# şimdi ya? ben bu dilden anlamıorm yahu. kaç defa dedim sana bunu."
#
# The failure mode is the SAME one standing order 13 exists for: mid-session
# drift. An author who is disciplined at the start gets shallow an hour later.
# A once-per-session injection cannot reach that hour, and a skill cannot reach
# an author who does not think to open it. So this fires on EVERY prompt.
#
# It is deliberately SHORT. The long form — the report shape, the self-test, the
# scope over dashboard and Hamza's own surfaces — stays in the `dxb-ceo-report`
# door. This is the boundary; that is the procedure.
set -euo pipefail

cat <<'EOF'
=== ⛔ STANDING ORDER 14 — THE CEO IS THE OWNER, NOT A DEVELOPER ===
Every sentence he reads is plain business language, or it is a violation.
BANNED, including inside tables and "just this once":
 · file names, command names, test names, status codes, identifiers
 · construction words in ANY language — gate/kapı, pipe/boru, row/satır,
   leg/bacak, battery/batarya, corpus/korpus, migration, schema, endpoint,
   commit, suite, marker, parser, seam, token-as-a-code-word
 · counts that change no decision he makes
 · an English word inside a Turkish sentence where a Turkish word exists
SELF-TEST BEFORE SENDING: would my mother understand this sentence?
A long plain explanation is fine. A short technical one is not.
Full procedure + report shape: open the `dxb-ceo-report` door.
=== END STANDING ORDER 14 ===
EOF
