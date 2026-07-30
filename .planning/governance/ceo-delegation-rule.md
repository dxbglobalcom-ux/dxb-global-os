---
name: ceo-delegation-rule
description: "CEO only performs credential/identity actions (passwords, 2FA, dashboard logins); Claude executes everything else itself without instructing the CEO"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 67e86f62-ebfe-4d9f-9641-7497489b26cf
---

CEO does ONLY password/credential/identity work (changing passwords, 2FA enrollment, logging into dashboards — anything requiring his identity or touching secret values). Everything else — installing software, browser extensions, configs, file work, verification — Claude does itself, never delegates back to the CEO.

**Why:** CEO has no time; anti-babysitting is the project's core value ([[evidence-before-done]]). Instructing the CEO to "install X, click Y" for non-credential work is a violation — he called this out explicitly on 2026-07-06 ("bana şunu yap bunu yap deme... işleri sana devrediyorum").

**How to apply:** Before writing any instruction step for the CEO, ask: does this require his identity or a secret value? If no — do it yourself (apt, CLI, config files, headless installs). If yes — give the minimal credential-only step. Batch his steps; never send him setup/tooling work.

**⛔ REVOKED 2026-07-30 (CEO order, verbatim: "size full herşeyde izin veriyorum şeklinde bulduğun kayıtları sil. CEO emri."):** the standing blanket-authority paragraphs that used to sit here — the 2026-07-09 escalation plus the four "FULL AUTHORITY / sakın izin sorma / bash izinlerini de sormayın" confirmations of 07-09 and 07-10 — are DELETED and are no longer in force. The CEO clarified they were meant session-scoped, not permanent: *"bunu dosyaya kaydedin derken o anlık demek istedim"* and *"ben sessiona özel sadece veririm izin"*. **Do not resurrect them from git history or from the dated 07-09/07-10 transcripts, which keep them only as a record of that day's conversation.** Authority is granted per session by the CEO; absent such a grant in the running session, announce the intended action and ask before acting. What survives below is unchanged and still binding: never hand the CEO operational work he did not ask for, the Hetzner spending scope, and the money/contract approval gates.

**HETZNER FULL AUTHORITY (CEO 2026-07-09 gece, verbatim: "HETZNER ZATEN AÇIK GİT NE YAPIYORSAN GİR VE YAP BENİM ADIMA TÜM YETKİYİ VERDİM KAYDET BUNU"):** Hetzner hesabında CEO adına TAM yetki — kaynak yaratma/silme, storage box satın alma (€3-5/ay sınıfı küçük altyapı harcamaları bu yetkinin İÇİNDE; CEO bu sınıfı "alındı ~3 euro aylık" diyerek zaten onaylamıştı). Sunucu sınıfı büyütme / aylık >€10 yeni kalem yine önce CEO'ya. Aynı gece ikinci verbatim: "CEO SADECE İLERİ ONAY VERİR... PROJENİN AMACI ZATEN CEO OLARAK BU ŞEYLERE KARIŞMAMAM" — operasyonel infra işi CEO'ya ASLA geri gönderilmez.

**Carried over from the paragraphs revoked above (rules that had nothing to do with permission, still binding):** deferral language of the "yarın sabah" kind is forbidden (also standing order 13 item 3); evidence that can only arrive with natural time (e.g. a 06:00 cron firing) does NOT block a row's closure — record it as ⚠ residue plus a post-hoc check (CEO order, filed in 07-VERIFICATION). The Phase-8 design mandate lives in [[phase8-design-brief]]; the A2 order (bilingual UI, EN primary) in its own record.

**Approval scope (CEO 2026-07-09, binding — GATE-01 revision):** CEO is an approve/reject authority, not a task executor. Only these reach him: (1) money OUT — transfers, payments, spending, ad budgets: always CEO approval; (2) critical legal commitments — contract signing/sending; (3) identity/credential steps (batched, copy-paste-ready, with minute estimates). **Money IN needs NO approval** — collections, incoming payments, sales revenue run autonomously, visible on dashboard for after-the-fact audit. Routine outward comms (emails, social posts) run autonomously within department policy. Recorded in CEO-DIRECTIVE-2026-07-09-audit.md §B7.
