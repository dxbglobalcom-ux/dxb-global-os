# Done-list — the score card gate

The CEO's sentence (2026-10-01), after he was told what the machine would do — refuse an audit with no
card, refuse an effort beneath the card, so the routing rests on a machine and not on the lead's care —
and that it adds well under a second to an audit: **"tmm makineyi de kur"**.

Honest note: this list was written by the lead AFTER the build, in the same session, not before it
(dxb-team2 §4 asks for it before). The auditor should weigh the list as an exam written by someone who
had already seen the answers.

1. `bash scripts/governance/refuter.sh "x"` (no card) → exit 1, `REFUTER_FAIL: no score card`, no codex call.
2. A card scoring critical with `--effort high` → exit 1, `beneath the card: critical work is audited at xhigh`, no codex call.
3. A valid card without `--effort` → codex is launched with the class's effort (light medium · normal high · critical xhigh); there is no silent `high` default anywhere in refuter.sh.
4. The floor is measured from `git diff --name-only <range>`: a light card touching a database, money, security, approval or governance file runs at least at normal (`high`).
5. The card and the machine's reading of it are the first lines of the prompt Sol receives — for an argument prompt and for a `-` (stdin) prompt.
6. Every launch appends one line to `~/.local/state/dxb/audit-cards.log`.
7. `refuter.sh --proof` and `--install-profile` run without a card, and `--proof` still prints REFUTER_READONLY_OK, DB_REACHED and three DB_WRITE_REFUSED.
8. `pnpm vitest run tests/governance/audit-card.test.ts` → 13 passed, on the host and inside `scripts/construction/run.sh`.
9. dxb-team2 §3/§6 and dxb-verify say the same thing as the code; the Codex mirror matches (`sync-codex-mirror.sh --check` → SYNC_OK); `ledger-truth.mjs` OK.
10. Nothing else that calls refuter.sh breaks: every caller in the repository is listed and checked.
