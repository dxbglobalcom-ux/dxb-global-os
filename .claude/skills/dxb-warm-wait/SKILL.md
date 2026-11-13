---
name: dxb-warm-wait
description: Use when the CEO says "sıcak bekle" and the session must wait past 55 minutes — one small turn keeps its prompt cache warm.
---

# Waiting warm — one small turn before the cache goes cold

Opened on his word only, for the session he says it in (CEO, 2026-11-13: built on his order; he wants it
some nights and not others). It is not a standing rule of any door.

**What it is for.** A session's prompt cache lasts one hour after its last turn. A session that waits longer
— the 5-hour window fills at 90 %, the reset is two hours away — comes back cold and writes its whole context
again. One small turn before the hour is over keeps it warm.

**The arithmetic** (list-price weights; how the Max quota weighs a cached read is not measured — the log
below is how it gets measured). A warm turn reads the context at 0.1 of the input price; a cold start writes
it at 2.0. So a ping costs a twentieth of the cold start it saves, whatever the context's size, and pings pay
until twenty of them would be needed — about eighteen hours. Every wait inside a 5-hour window pays (five
pings at most); a wait for the week's reset does not, and the command stays cold through it by itself.

## The procedure

1. **Stop at a clean break, with room left.** Enter the wait when the piece in hand is finished, verified and
   committed — and while the window still has room for the pings (measure a talk turn's cost in this session;
   a ping is smaller). From 98 % the command makes no ping: the turn itself could be cut.
2. **The hands first.** A hand's cache lasts five minutes: keeping one warm for an hour would take fifteen
   pings, more than opening it cold. No hand is kept warm. Before the wait, a running hand finishes and its
   piece is verified and committed; the next piece's brief is written to disk; after the wait a fresh hand
   is opened on it (dxb-team3 §3, §7).
3. **Arm the clock** — in the background (`run_in_background`), from the repository root:
   `scripts/ops/dxb-warm-wait --until-reset` (the 5-hour window's reset, two minutes past it), or
   `--until HH:MM`, or `--for MINUTES`. Tell him in one line what is waited for and until when.
4. **When it wakes the session**, its one line says which:
   - `WARM_PING … | re-arm: <command>` — the cache was about to go cold. Do nothing else: run the re-arm
     command in the background and end the turn in one short line. The turn was the warm-keeping.
   - `WAIT_OVER …` — go on with the work; read the quota on that line first. `cold: …` on it says the
     command stayed asleep through a ping on purpose, and why.
5. **A turn in between** — his message, a hand's report — restarts the hour by itself. The armed clock is
   left as it is; a ping that comes early costs one small turn.

## What it cannot do

- It runs only while the session's terminal is open and the machine is awake. This machine does not suspend
  by itself on mains power (measured 2026-11-13: `sleep-inactive-ac-type 'nothing'`); a suspend he orders
  ends the warm-keeping, and the clock still wakes the session at the right hour after the machine wakes.
- In usage overage the cache drops to five minutes; no ping is worth making then.

## The measurement

Every arming, ping and end appends one line — the hour, the 5-hour and 7-day percentages — to
`$XDG_RUNTIME_DIR/claude-ctx/warm-wait.log`. What a ping costs is the difference between two neighbouring
lines; after the first nights he is told the figure. Tests: `python3 scripts/ops/test-warm-wait.py`.
