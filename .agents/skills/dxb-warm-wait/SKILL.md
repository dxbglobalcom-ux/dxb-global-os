---
name: dxb-warm-wait
description: Use when he says "sıcak bekle" or that he is away ("uzaktayım", "masa başında değilim", "yatıyorum") — carries the work on.
---

# Away and warm — the session carries the work to its end by itself

He gave the management of this to the session (CEO, 2026-11-13: "bu süreci yönetecek olan sizsiniz. Size
devrediyorum" <!-- CEO-OK: away-session-manages-the-run-2026-11-13 -->). It opens when he says "sıcak bekle", and whenever he says he is away, in any
words — "uzaktayım", "masa başında değilim", "yatıyorum", "uykuya gidiyorum", "dışarı çıkıyorum": saying so is
enough, and it is not only for sleep (CEO, 2026-11-16).

**What it is for** — the two things he named.
- *The cache must not go cold while the work is carried.* A session's prompt cache lasts one hour after its
  last turn. A lead whose hands, tests or renders run longer than that comes back cold and writes its whole
  context again; one small turn before the hour is over keeps it warm.
- *The work must not stay on the floor when the window fills.* When the 5-hour window cannot carry the next
  piece, the session waits warm for the reset and goes on in the same session.
- *He comes back to a warm session.* The job's end is not the end of the wait: he may answer the questions the
  session left him, or go on with it, hours later. Away ends on his word that he is back — "geldim", "PC
  başındayım", "kapat" — or ten hours after the last turn that was not the clock's own ping (his number: "10
  saat sonra kapatsın"); the session never takes the marker off by its own judgement
  (CEO, 2026-11-17 <!-- CEO-OK: away-ends-only-on-his-word-2026-11-17 -->). Measured 2026-11-16: a session that
  had finished and asked him three questions closed away by this door's own last step, and his answer would
  have been paid for cold.

**The arithmetic** (list-price weights; how the Max quota weighs a cached read is not measured — the log
below is how it gets measured). A warm turn reads the context at 0.1 of the input price; a cold start writes
it at 2.0. So a ping costs a twentieth of the cold start it saves, whatever the context's size, and pings pay
until twenty of them would be needed — about eighteen hours. Every wait inside a 5-hour window pays (five
pings at most); a wait for the week's reset does not, and the command stays cold through it by itself. While
work is running (`--watch`) there is no count to make: each ping is weighed on its own. What ends a `--watch`
is his word (step 7) or ten quiet hours (step 8): the clock counts from the last turn that was somebody's —
his message, a hand's report, a command's end — and carries that moment from clock to clock on the re-arm
line, so a session he does not come back to stops costing by itself.

## The procedure

1. **Mark the session away and arm the clock**, from the repository root: `scripts/ops/dxb-warm-wait --away on`,
   then `scripts/ops/dxb-warm-wait --watch` in the background (`run_in_background`). Tell him in one line.
   The marker is the lock: while it is on, a Stop hook refuses the end of a turn that would leave the session
   with no clock armed — a session asleep with nothing to wake it is what this door exists to make impossible.
   One clock is enough for the whole job: it pings 55 minutes after the session's *last turn*, read from the
   transcript, so a hand's report or a background command's end moves the ping forward by itself, with no
   wake. A session has one clock: `--status` says `ARMED …` or `NOT_ARMED`, and a second arming is refused
   (`ALREADY_ARMED`, exit 3), because an old clock cannot be ended without waking the session. Only the
   lead marks and arms: a hand's shell carries the lead's session id (measured 2026-11-13), so a hand that
   armed a clock would arm the lead's.
2. **Work as usual.** While the window has room there is no restriction of any kind (his word, 2026-11-13:
   "kota dolmamışken böyle kısıtlamaya da gerek yok"). The quota line the hook gives on every turn is read
   before a writing hand is opened and when one returns — dxb-team3 §3 owns that rule.
3. **Every wait for a job is the job itself, run as the background command** — a battery, a render, an
   audit: its own exit wakes the lead. Never a loop that waits for a line in a file, never a polling waiter:
   on 2026-11-13 such a loop waited from 02:18 for a line the battery wrote into another file, nothing else
   was armed, and the night's work stood for seven hours.
4. **`WARM_PING … | re-arm: <command>`** — the cache was about to go cold. Run the re-arm command, exactly as printed (it carries when the quiet began), in the
   background and end the turn in one short line; nothing else. The turn was the warm-keeping. This holds
   after the job is finished too, for as long as away is on.
5. **The window cannot carry the next piece.** First ask whether the piece divides (dxb-team3 §3): the part
   that fits the room left is started now, and only what does not divide waits — on 2026-11-13 seven
   independent items were held as one piece and two and a half hours were waited for nothing. Dividing never
   costs quality (his word, 2026-11-13): a piece is cut only where its parts stand alone; a film or a tightly
   bound piece is not cut to fit the window, and no part goes to a lower model or level for it. Then, for
   what waits: finish, verify and commit the piece in hand; write the next
   piece's brief to disk; arm `scripts/ops/dxb-warm-wait --until-reset` in the background (the 5-hour
   window's reset, two minutes past it). It is the one clock that may be armed over a running `--watch`,
   which then ends with `SUPERSEDED by --until-reset`: end that turn in one short line. On `WAIT_OVER …` read
   the quota on that line, arm `--watch` again and open a fresh hand on the brief. `cold: …` on that line
   says the command stayed asleep through a ping on purpose, and why: from 98 % it makes no ping, because the
   turn itself could be cut — a `--watch` that meets 98 % sleeps to the reset by itself. When the week is
   full the clock does the same with the week: it wakes nobody, sleeps to the week's reset however far
   that is, and the session comes back cold on `WAIT_OVER`. The clock weighs the session model's own week the
   same way (Fable 5.2 has one, read by `scripts/ops/dxb-usage`): it never wakes a session into a full week
   of its own model <!-- CEO-OK: model-week-read-from-usage-address-2026-11-13 -->.
   **The hands.** A hand's cache lasts five minutes: keeping one warm for an hour would take fifteen pings,
   more than opening it cold. No hand is kept warm; a running hand finishes and its piece is verified and
   committed before the wait, and after it a fresh hand is opened (dxb-team3 §3, §7).
6. **Everything finished, recorded and told** → the clock stays armed and away stays on: every ping is
   re-armed (step 4). The machine is suspended only if he said so for this job.
7. **He says he is back, or that it be closed** — in his own words, in this session →
   `scripts/ops/dxb-warm-wait --away off "<his words>"`: a few of his own words in a row, as he wrote them. The
   command looks for them in the messages he himself sent to this session after away was set, and refuses
   when they are not there; it proves the words are his, and whether they say he is back is the session's
   reading. A message of his that does not say so leaves away on, and the clock goes on behind the talk. The
   one ping that comes after away is off is not re-armed.
8. **`IDLE_OVER … | close: <command>`** — ten hours have passed with no turn but the clock's own pings. Nothing
   is running: run the close command (`scripts/ops/dxb-warm-wait --away off --idle`, which the command takes
   only after the clock has said so), arm nothing, end the turn in one short line. Work is still running — a
   render, a hand — : arm `scripts/ops/dxb-warm-wait --watch` again; the ten hours are for a quiet session.

## What it cannot do

- It runs only while the session's terminal is open and the machine is awake. This machine does not suspend
  by itself on mains power (measured 2026-11-13: `sleep-inactive-ac-type 'nothing'`); a suspend he orders
  ends the warm-keeping, and the clock still wakes the session at the right hour after the machine wakes.
- In usage overage the cache drops to five minutes; no ping is worth making then.
- The Stop gate holds one thing: an away session has a running clock when a turn ends — a finished job included. It asks once and then
  lets the stop through, so it can never trap a session, and when it breaks it lets every stop through. It
  does not run when a turn dies on an API error or is interrupted — the clock armed in step 1 is what wakes
  the session then. It does not know whether the work is finished; that judgement is the session's, and it ends nothing.
- The clock reads the last turn as the status line does (`önbellek N dk`): the two are tested against the
  same transcripts, and a transcript it cannot read sends it back to the arming time.

## The measurement

Every arming, ping and end appends one line — the hour, the mode, the 5-hour and 7-day percentages — to
`$XDG_RUNTIME_DIR/claude-ctx/warm-wait.log`. What a ping costs is the difference between two neighbouring
lines; after the first nights he is told the figure. The gate's source is `scripts/ops/dxb-away-gate.py`,
installed byte-equal as `~/.claude/hooks/dxb-away-gate.py` under `hooks.Stop` in `~/.claude/settings.json`.
Tests: `python3 scripts/ops/test-warm-wait.py`, `python3 scripts/ops/test-away-gate.py`.
