job: Two of his orders of 2026-10-04 written where the construction reads them — the review's item 4 (the old second-round paragraph leaves ~/.claude/agents/refuter.md; dxb-team2's fallback auditor named read-only by word, not by tool) and his Fable rule of 20:58 (light job none, normal job at the start, critical job at the start and the end).
range: 97b7181b..HEAD
blast: 1
risk: 2
reasoning: 0
ambiguity: 1

# The card — 4 / 8, normal, Sol at `high`

- **His words (this conversation, verbatim):** *"4- tmm silinsin. ama 3 önemli"*, then *"4. maddeyi önce bitir."*
  <!-- CEO-OK: fallback-auditor-named-and-refuter-second-round-gone-2026-10-04 --> — his answer to the
  session's plain retelling of the review's item 4: *"Kayıt bu yedeğe dürüstçe 'sözle salt-okur' desin.
  Denetçi tanımındaki eski 'ikinci tur' paragrafı da silinsin, çünkü artık Sol tek geçiş yapıyor."*
  Then, 20:58: *"abi küçük işte no fable orta işte başta fable önemli işlerde de başta ve sonra fable olay bu.
  ben bunu istiyorum. denetimde tek turdu bulunan hatalar tamir edilecekti. ve kontrol. çalışıor mu herşey
  çalışmıor mu düzgün yapılmış mı diye test sanırım."* <!-- CEO-OK: fable-normal-start-only-critical-start-end-2026-10-04 -->
- blast 1 — one subsystem, the construction's governance text: two doors (dxb-team2, dxb-verify's one
  sentence) and their Codex mirror, one agent definition and the advisor line of ~/.claude/CLAUDE.md
  (both outside git).
- risk 2 — governance and agents (§3): the text that tells the lead how an audit runs and when Fable is asked.
- reasoning 0 — deterministic text.
- ambiguity 1 — his "küçük · orta · önemli" read as the card's light · normal · critical.
- fable: start — normal. The start call was made at ~20:55 on item 4, before his words of 20:58; under those
  words a normal job has no end call, and the start call is not repeated: his Fable words are exact and
  leave nothing to design.
- arrangement: lead — text edits; a fork or a helper would cost more than the edits.
- effort: the session runs at `max` on his /effort of this conversation; nothing lowers it after his yes
  (the review's item 3 — his next subject).

## What went (LAW A)
- refuter.md's round-2 paragraph (refuter-redesign-2026-09-24's "round 2 re-checks only round 1's A list").
- The normal job's Fable end call: dxb-team2 description, §1 (disagreement, the end line), §2 Advisor,
  §3 Fable paragraph (his 19:22 quote replaced by his 20:58 words), §4 PLAN · DISPUTE · JUDGE; dxb-verify's
  "a finding is evidence"; ~/.claude/CLAUDE.md's advisor line. The 19:22 entry carries the note that replaces it.

## Found on the way
- The Codex mirror was stale before this job: `.codex/hooks/spec-bootstrap.sh` lacked acee5559's
  locked-tools lines (20:03, the locked-tool job). Its lead (c04c8a07) answered that it does not regenerate
  the mirror; the generator writes the whole mirror from HEAD here.

## Done-list (command → expected)
1. `grep -c 'İkinci tur' ~/.claude/agents/refuter.md` → `0`; `diff evidence/refuter.md.before
   evidence/refuter.md.after` → only the deleted blank line and the three-line paragraph (evidence/refuter.md.diff).
2. `sed -n '/^\*\*Fallback auditor/,/2026-10-04 -->\./p' .claude/skills/dxb-team2/SKILL.md` → the stand-in
   named read-only by word, not by tool, with the reason; the record's sentence carries it.
3. `grep -n -E 'normal · critical: Fable|FABLE at the end, normal|normal or critical job Fable|a normal \(3-5\) or critical' .claude/skills/dxb-team2/SKILL.md .claude/skills/dxb-verify/SKILL.md`
   → no line; `grep -n 'a normal job (3-5) `start`' .claude/skills/dxb-team2/SKILL.md` → one line (§3).
4. `grep -c 'normal işte yalnız başta, önemli (kritik) işte başta ve sonda' ~/.claude/CLAUDE.md` → `1`.
5. `git diff 97b7181b..<build> --stat` → the two doors, their mirrors, `.codex/hooks/spec-bootstrap.sh`, the
   ledger, this folder — nothing else (STATE.md comes in the records commit).
6. `bash scripts/governance/sync-codex-mirror.sh --check` → exit 0.
7. `node scripts/governance/ledger-truth.mjs` → OK, exit 0.
8. `pnpm construction:battery` → BATTERY_GREEN.
