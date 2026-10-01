# Done-list — the pin check reads a changed tool (written before the code; amended after Sol's plan read)

The CEO's words (2026-10-01), in order: "Yani kitlenmesin bir daha böyle şeyler ya." · on how he would
know: "Holding'deki o kişi bunu kitleyince bizim nasıl haberimiz olacak? Bak şu an haberimiz şansı
olmadı mı?" · on the proposal (auto-approve a clean change, lock and alert a suspect one): "Tamam
yapabilirsin."

Design facts (decided): deterministic, no model call, no network (pin-check's contract); a quarantined
pin stays quarantined until a human re-pins it (sticky, unchanged).

AMENDED after Sol's plan read (SOL-PLAN.txt, BLOCKS): a keyword gate cannot define "clean" (Sol's two
bypass sentences and the `follow_redirects` default flip carry no listed word). The verdict is now an
ALLOWLIST: clean only when the repository vouches for the exact new text — the server is our own
in-process source (dxb-mcp: its drift is our commit), or the new text hashes to the reviewed
manifest's entry (`db/seed/tool-pins.manifest.json`, an entry vouching only when its stated hash equals
its own body). Everything else is suspect. The keyword rules remain as signals that tell the reader
what to look at; they decide nothing. The no-baseline and growth-bound questions disappear with it.
Lead's decision, advisor (Fable 5.1) consulted.

1. A migration adds `tool_pins.pinned_text jsonb`; on the company it is the ONLY pending migration
   (measured: ledger 170 of 171 files, the one missing is 20261001010000), so `bootstrap-db.sh` applies
   exactly it; the company fingerprint of everything else is unchanged.
2. A pin whose live hash equals its stored hash and that keeps no verified text (none, or a stale one
   from a hand re-pin) gets the live text, written only while the row's hash still equals it.
3. `judgeDrift` is pure: dxb-mcp → clean (repository-source); live hash = vouched manifest hash → clean
   (tool-manifest); else suspect. `describeDrift` names schema path changes, added sentences and signals.
4. Tests: the 12 real texts of 2026-10-01 are vouched for; Sol's two bypass sentences, the default
   flip, a removed `required`, a zero-width character and a one-character change are suspect; an honest
   upgrade is suspect until the manifest carries it, then clean; a tampered manifest entry vouches for
   nothing; a missing manifest gives no entries.
5. `checkPins` on drift of a non-quarantined pin: one transaction locks the row, acts only if it is
   still the pin that was judged, writes the pin, an audit row with BOTH texts whole, and an alert
   linked to that audit row. Clean → informational; suspect → high; a high alert for the same change
   still open is re-raised (unacknowledged, unmuted, escalated), never silently skipped. Tests: the
   concurrent clean/suspect pair makes one transition; notice then lock gives two alerts.
6. The alert's three lines and its area read in Turkish on the TR surface (`alert-title.ts`), the card
   drills to `/gov/audit/<id>`, the source has a label in both locales; i18n purity PASS.
7. Rebuilt dist, migration on the company, `dxb-scheduler.service` restarted, the new code proven
   running (its log line), one forced pin check: 0 quarantined, no spurious audit or alert, the library
   profiles unchanged (git diff empty).
8. The profile publication race Sol found (existing, C) stays in SOL-PLAN.txt only; it is not fixed here and not written to the board (board law 1: a row opens only on his word).
9. ledger-truth OK; the full battery run once.
