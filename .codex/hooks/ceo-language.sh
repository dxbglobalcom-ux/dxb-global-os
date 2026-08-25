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
# WHAT IT CARRIES, and why each half is here rather than in the door. The WORD
# rule (use the real word, explain it in brackets) and the SHAPE rule (how a
# thing is explained at all) both govern every sentence he reads, so both fire
# on every prompt. The self-test closes the block. What stays in the
# `dxb-ceo-report` door is the long form — what a REPORT must contain, the
# worked example, and the scope over the dashboard and Hamza's own surfaces.
# This is the boundary; that is the procedure.
#
# THE SHAPE HALF WAS ADDED 2026-08-25, ON HIS OWN ORDER. The author put four of
# his own mistakes in front of him as a bare technical list and got "hiçbir halt
# ANLAMADIMMMMMMM BANA ANLAYACAĞIM DİLDE KONUŞ." The same facts, told as answer
# → a picture from his world (a postman) → the measured numbers → what it means
# for him, landed at once, and he ordered it made permanent: "bu kuralı öyle bir
# yere yaz ki her session bana anlayacağım dilde raporu sunsun."
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
THE SHAPE, when you explain a THING — a mistake, a measurement, a finding:
 1. THE ANSWER FIRST, one sentence, in his words.
 2. A PICTURE FROM HIS WORLD before any mechanism — what is this LIKE?
 3. THE MEASURED NUMBERS beside the picture, never instead of it.
 4. WHAT IT MEANS FOR HIM — or plainly "senin için bugün bir şey değişmedi".
A bare list of technical events, with no answer, no picture and no consequence,
is the defect he named on 2026-08-25: "hiçbir halt ANLAMADIMMMMMMM".
SELF-TEST: would my mother understand what this work IS?
=== END STANDING ORDER 14 ===
EOF
