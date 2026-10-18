# Sol — the X gate (B82 step 1), 2026-10-18

Auditor: GPT-6.1 Sol at xhigh (security, his account), one blind pass over `f5e9b346^..b54c8987`. Brief
`brief-sol.txt` and raw dump `sol.raw` stay on this disk, out of git. Its verdict: *"Henüz tam korumuyor"* — the
lock works, but not every reader passes it and some real X warnings were missed. Five A, two B, one C; the lead ran
each one's evidence and all of them held, so all were fixed (writer: `helper-writer`, medium; verified by the lead).

| # | Finding | Disposition |
|---|---|---|
| A1 | Codex's mirror (`.agents/skills/dxb-research`) still had the old shim and reader and no `xgate.py` | Fixed: `scripts/governance/sync-codex-mirror.sh` regenerated it; `--check` → `SYNC_OK mirror matches source` |
| A2 | The real `opencli` (first on PATH, before `~/.local/bin`) bypassed the shim; `~/.opencli/apps.yaml` sent twitter to 9333 | Fixed: apps.yaml sends X to port 9, where nothing listens (`hidden.py write_apps`); the shim passes its own window, which wins (opencli `execution.js:203-218`). Measured: `~/.npm-global/bin/opencli twitter search test` → exit 1, "X only through the X gate", no request |
| A3 | A 429 on a later page is swallowed by opencli (exit 0); one command counted as one read whatever it requested | Fixed: a second DevTools client watches every response of the command's own window (measured first: Chrome 153 accepts it); the worst of the responses, the final address and a failed command's words is recorded; a runaway guard stops a command past 200 X responses. Measured through the gate: a normal search 64 X responses (46 API), `--limit 50` 64, `tweets` 38 — the home page's own load dominates, so the budget's unit stays the command |
| A4 | opencli's LOGIN_WALL text contains "rate limit" and was read as a 429; an HTML page where JSON was expected read as ok; a 403 after `/account/access` missed | Fixed: wall patterns are read before the 429 ones; the window's final address is judged |
| A5 | `hidden.read`: a non-X address redirecting into X was not gated, and a 429 on an X document was not seen | Fixed: Network events on the reader's own client; a redirect into X is counted after the fact and its content discarded when X is closed |
| B6 | On the day the clocks go back, a second 429 at 23:30 reopened X at 23:00 the same day | Fixed: the next local calendar midnight |
| B7 | Board row B82 behind a commit naming it (records ruler R6) | Fixed: B82's note in the fix commit |
| C | 127.0.0.1:9333 accepts any local program, so anything on the machine can drive his session without the gate | Older than this work; told to him on 2026-10-18; a job only on his word |
| Sol's UNVERIFIED | Whether a hunter's jail can write the gate's state | Measured by the lead: a bwrap built like `fleet.sh:796-798` wrote `run/xgate/` and was refused outside it |

Found by the lead, older than this work (C): `sync-codex-mirror.sh --check` calls itself a battery gate, but
neither the battery nor the commit hook runs it, so a door's change leaves Codex's mirror stale with nothing red.

Live, after the fixes: one search through the gate, exit 0, 5 rows, `requests: 60`, verdict ok; X open.
Final battery on 8a661d30: `BATTERY_GREEN` — 1,417 + 404 passed (`evidence/battery-final.txt`); the first run, before the fixes, is `evidence/battery.txt` (its one red was B7).
