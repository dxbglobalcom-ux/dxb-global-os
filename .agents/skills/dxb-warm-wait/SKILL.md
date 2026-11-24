---
name: dxb-warm-wait
description: Use when he says "sıcak bekle", "sıcak tut", or that he is away ("uzaktayım", "masa başında değilim", "yatıyorum") — one small turn every 55 minutes, so the session is warm when he comes back.
---

# Warm while he is away

The prompt cache lives one hour. 55 minutes after the session's last turn, one small turn keeps it warm. That is
all this is (CEO, 2026-11-24). Nothing is added to this door or its program except on his word: no history, no
findings, no measurements; git keeps those.

1. He says he is away → `scripts/ops/dxb-warm-wait --away on`, then `scripts/ops/dxb-warm-wait --watch` in the
   background (`run_in_background`). One line to him.
2. `WARM_PING` → run the re-arm command on that line in the background, end the turn with a dot. Also after the
   job is finished.
3. `WINDOW_RESET` (only on a plan with a 5-hour window) → re-arm, go on with the work. At 95 % of that window no
   new work is opened; the pings go on to the reset, so the work continues warm.
4. He says he is back ("geldim", "kapat"), in this session → `scripts/ops/dxb-warm-wait --away off`
   <!-- CEO-OK: away-ends-only-on-his-word-2026-11-17 -->. Ten quiet hours (`IDLE_OVER`) and a handover to a
   successor that armed its own clock <!-- CEO-OK: away-closed-by-the-session-that-handed-over-2026-11-23 -->
   close it too; nothing else does.

While away the session carries its work on by itself <!-- CEO-OK: away-session-manages-the-run-2026-11-13 -->.
A wait for a job is the job itself run in the background, never a loop that watches a file.
