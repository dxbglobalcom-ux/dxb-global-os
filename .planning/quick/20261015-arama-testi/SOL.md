# Sol (GPT-6.1, high) — one blind pass on 960ae054, 2026-10-15

Verdict: the door does what he asked (claim 1 STANDS); fleet, sweep and rulers unbroken (claim 5 STANDS).

| # | Finding | Grade | What was done |
|---|---|---|---|
| 2 | maps.py counted an empty-name record as a place (exit 0, name ""), and printed rating 100 / reviews −5 as data | B | Fixed (helper-writer, lead verified): blank names dropped, no valid place → exit 4 with stdout empty; rating only 0..5, reviews only int ≥ 0, booleans rejected for both (the lead's addition); three new fixtures and tests, red first (3 failed) then 8/8 |
| 3 | The Codex mirror `.agents/skills/dxb-research/` still carried the old door and no maps.py | B | `scripts/governance/sync-codex-mirror.sh` → `SYNC_OK`; only this door and its new script changed |
| 4 | The door's 23/21/21 scores had no judge breakdown in the commit | B | `evidence/judge.md`: the blind judge's per-question table, scale and checks |
| 6 | Live Maps and "both sides on every search" not proven to Sol | UNVERIFIED → answered | Sol's sandbox has no network (its live call exited 5, correctly). The lead's live runs: `maps.py "diş kliniği Kadıköy"` and `maps.py "kuaför Beşiktaş" --limit 3`, both exit 0 with real places (2026-10-15). The door sentence governs future searches; the combined arm's run is the evidence that it works (`evidence/arm-both.md`). |

No second Sol round (dxb-team2 §4).
