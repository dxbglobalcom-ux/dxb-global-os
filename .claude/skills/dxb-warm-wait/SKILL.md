---
name: dxb-warm-wait
description: Use when he says "sıcak bekle", "sıcak tut", that he is away ("uzaktayım"), sleeps ("yatıyorum", "uyuyorum"), or "işleri bitirin, bilgisayarı uyutun" — one small turn every 55 minutes, the clock closed when the work is done.
---

# Warm while he is away

The prompt cache lives one hour. 55 minutes after the session's last turn, one small turn keeps it warm. That is
all this is (CEO, 2026-11-24). Nothing is added to this door or its program except on his word: no history, no
findings, no measurements; git keeps those.

1. He leaves → `scripts/ops/dxb-warm-wait --away on`, then `scripts/ops/dxb-warm-wait --watch` in the background
   (`run_in_background`). One line to him. The session carries its work on by itself
   <!-- CEO-OK: away-session-manages-the-run-2026-11-13 -->; a wait for a job is the job itself run in the
   background, never a loop that watches a file.
2. `WARM_PING` → run the re-arm command on that line in the background, end the turn with a dot. A hand or a job
   is still running → re-arm with plain `--watch`: only a session that stands idle counts to five. `close` → run it.
3. **All the work is finished** — his hands' too —, recorded and told:
   - he sleeps ("uyuyorum", "yatıyorum", "iyi geceler", "yarın görüşürüz") → `--away off` at once;
   - he also said to suspend the machine → `--away off` first, always, whether he named the clock or not; then
     `systemd-run --user --on-active=60 systemctl suspend`, and end the turn;
   - he is only out ("uzaktayım", "dışarıdayım", "sıcak tut") → the clock stays, five pings at most.
4. `WINDOW_RESET` (only on a plan with a 5-hour window) → re-arm, go on with the work. At 95 % of that window no
   new work is opened; the pings go on to the reset, so the work continues warm.
5. He says he is back ("geldim", "kapat"), or the job is handed over to a successor that armed its own clock
   <!-- CEO-OK: away-closed-by-the-session-that-handed-over-2026-11-23 --> → `--away off`.
