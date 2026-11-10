# Audit of 0948a279 — every session works as a manager (2026-11-10)

One blind, read-only pass each, same brief (`sol-brief.txt`): Sol (GPT-6.1, `medium` — a text-only change),
raw in `sol.raw`; Fable 5.2 (`high`), in `fable-audit.md`. No A from either.

| # | From | Grade | Finding | What was done |
|---|---|---|---|---|
| 1 | Sol, Fable | B | `gatherer.md` added two limits that are not his word: fixed-string search only; every search re-run before hand-over | Fixed: fixed text where it suffices; counts compared with the outputs in hand, a search re-run only when they differ |
| 2 | Fable | B | Four different breadths for what the lead may read itself (core, §3 paragraph, the Lead row, his word); verification reading not named as the lead's | Fixed: one breadth, his measure — work that would fill its context or eat the quota; what it reads to verify and a single known file are its own. Core sentence now "its hands do the heavy work" |
| 3 | Fable | B | §3 paragraph sent an easy piece "to an easy-writer" (directive) while the sentence below, the ledger and his word say "may" | Fixed: "may go" |
| 4 | Fable | B | "What comes back is the conclusion" contradicts a gatherer, which never judges | Fixed: a gatherer's filled template, a helper's findings, a writer's piece — the lead verifies each |
| 5 | Fable | B | `easy-writer.md` sent risk-class pieces to `helper-writer` (medium) though §2 writes them at high | Fixed: such a piece is Fable 5.2's, by §3 |
| 6 | Fable | B | Neighbours not brought along: §2's "needs no lift" line, the side study's hands, §8's Fable prompts going to an Opus seat | Fixed in all three |
| 7 | Fable | B | `gatherer.md`'s write ban covered only the repo and ~/.claude | Fixed: writes and changes no file |
| 8 | Fable | B | The core's "its hands read and measure" left the reading hands outside the explicit "never write" | Settled by #2's rewording: "hands" now covers the writing seats too, as in the door (§1 "the hands write") |
| 9 | Fable | B | A session in plain talk has only the core sentence; the routing lives in the door | Not changed: the core sentence is what every opening carries (the core is at its 13,000-byte budget) and it points at the door through the bullet it sits in; reported |
| 10 | Fable | B | The gatherer's `medium` level is the lead's choice, not his word | Kept and told to him as the lead's unmeasured choice |
| 11 | Fable | B | Whether the "Lead" arrangement stays fully equal after his word | Not changed: with #3 the door no longer contradicts itself; the paragraph tells the lead where heavy work goes |
| C | Fable | C | The routing record still says `helper-writer` is Opus 5.5 (the other job's file); `SOURCE.md` names dxb-team2; the Reader seat overlaps the new seats | Left; the first goes to the Fable 5.2 transition job |

Sol could not run `sync-codex-mirror.sh --check` (it writes a temp dir); the lead ran it after the fixes: exit 0.
Unverified by either: a real launch of the two agent types (they load in a new session).
