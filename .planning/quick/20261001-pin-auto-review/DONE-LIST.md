# Done-list — the pin check reads a changed tool (written before the code)

The CEO's words (2026-10-01), in order: "Yani kitlenmesin bir daha böyle şeyler ya." · on how he would
know: "Holding'deki o kişi bunu kitleyince bizim nasıl haberimiz olacak? Bak şu an haberimiz şansı
olmadı mı?" · on the proposal (auto-approve a clean change, lock and alert a suspect one): "Tamam
yapabilirsin."

Design facts (decided, not findings): deterministic, no model call, no network (pin-check's contract);
a classifier that cannot decide quarantines; a quarantined pin stays quarantined until a human
re-pins it (sticky, unchanged); dxb-mcp drift goes through the same classifier.

1. A migration adds `tool_pins.pinned_text jsonb` (canonical {description, inputSchema}); it runs on
   the construction engine (`pnpm construction:schema`) and on the company (`bash scripts/bootstrap-db.sh`)
   with the company's other data untouched.
2. A pin whose live hash equals its stored hash and whose `pinned_text` is null gets the live text
   written (self-backfill); measured on the company after one forced run: every reachable pin carries text.
3. `classifyDrift(old, new)` is pure and exported; it returns `suspect` with the rule names for: a
   zero-width / bidi / control character; reader-aimed instruction text (ignore/disregard previous,
   you must, always, never reveal, do not tell, system prompt, instructions); a URL or host absent from
   the old text; a sensitive word absent from the old text (env, ssh, credential, secret, token, key,
   password, cookie); a new parameter whose name or text says url/endpoint/webhook/callback/upload/post;
   description growth beyond a bound; no old text to compare against with any of the above in the new text.
   Otherwise `clean`.
4. The 12 real texts of 2026-10-01 (scrapling 9, dxb-mcp 3) classify `clean` against themselves, and the
   hand-written adversarial fixtures (hidden instruction in a parameter description, zero-width injection,
   new callback URL, new exfil parameter, unknown host) classify `suspect`.
5. `checkPins` on drift of a non-quarantined pin: clean → one transaction updates hash + text +
   quarantined=false, writes audit `tool_repinned_auto` (old/new hash, rules empty, a short diff) and an
   informational alert; suspect → one transaction sets quarantined=true, audit `tool_quarantined` (old/new
   hash, rules) and a high alert naming the tool, the rule and what to do. A quarantined pin is never
   touched by this path. Dedup keeps one active alert per tool.
6. `tests/phase7/pin-quarantine.test.ts` covers both paths and the sticky rule, on the construction engine;
   `tests/r43/arsenal.test.ts` stays 5/5; `pnpm vitest run tests/phase7 tests/r43` green.
7. gateway and outbox-executor rebuilt (`dist/`), `dxb-scheduler.service` restarted, and one forced pin
   check on the company leaves 0 quarantined pins, writes no spurious audit or alert, and the library job's
   profiles are unchanged afterwards (git diff empty).
8. ledger-truth OK; the full battery run once.
