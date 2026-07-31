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
=== STANDING ORDER 14 — THE CEO IS THE OWNER, NOT A DEVELOPER ===
His complaint, his words: "ben bu dilden anlamıorm yahu."
NO BANNED WORDS. He struck the ban list out himself, 2026-08-01:
"kelimeler kullanılsın ama parantez içinde açıklansın basitçe o kadar."
THE RULE: use the real word — the file's name, the tool's name, the technical
term — and put a short plain explanation in brackets right after it, once.
  Kelam'ın kayıtları 00-INDEX.md dosyasında (alınmış kararların listesi).
Never leave him to guess what a word means, and never hide the word from him.
SELF-TEST: would my mother understand what this work IS?
=== END STANDING ORDER 14 ===
EOF
