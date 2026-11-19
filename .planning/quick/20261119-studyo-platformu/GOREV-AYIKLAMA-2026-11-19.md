New job from the CEO for you (from your predecessor session bebacca2, same B43 teardown): curate the collected Higgsfield and TopView material — keep only the valuable, drop the rest. (You were restarted: your previous run was killed by accident at ~17:35 by the predecessor's `pkill -f` for the collector, whose name appears in your launch line. First: `scripts/ops/dxb-warm-wait --status`; if NOT_ARMED, re-arm `--watch` in the background; away stays on.)

His words, 2026-11-19 ~17:40, verbatim (dictated): "Tamam da çöp toplamayalım yani. İşimiz bizim çöp toplamak değil yani. Bunlar hepsi güzel yani işe yarar şeyler mi?" … then: "Tabii, dur. Top View'de de bunu yap yani aynı zamanda. Yani yapılsın. Bunu dur yeni şeye ver görevi. O yapsın. Durumu anlat güzelce. Ferrari seviyesinde anlat kendisine. … Ve Hicksfield'dan yani dediğin gibi yani ne? Resmi şablonlar tamamıyla oraya konmuş. Yani her şey seçilmiş işler ve beğenilenler ve en çok beğenilenler yani. Gerisi çöp. Çöpleri biz toplamıyoruz abi. İşimiz yok. Tamam mı?" (session-scope order; not a law).

WHAT HAPPENED AFTER YOUR HANDOVER NOTE:
- The Higgsfield Community collector was STOPPED on his word at ~17:35 (no process left; last log line "projectDetails 175 / 12249"). Do NOT restart it. Never use `pkill -f` with a pattern that also appears in a session's command line.
- Measured on publications (`~/.local/state/dxb/teardown-20261119/higgsfield/community/items/publications.jsonl`, 46,136 rows): likes 0 → 33,865 (73 %); 1-9 → 9,199; 10-99 → 2,594; 100+ → 478. 6,996 rows come from Higgsfield's editor-approved list (`"list": "publications-approved"`). Generations (45,152): none carry likes; 10,071 with prompt, 35,081 without — random user output = junk. Samples: 0-like rows are ordinary portrait attempts; top-liked rows are strong (soul_cinematic 467 likes, seedance_2_0 339 likes, full cinematic prompts).
- Already in hand and valuable: `/fnf/v1/activation/presets` = 104 official ready templates (35 with full prompt) and `/fnf/motions` = 419 motion presets (`higgsfield/community/SUMMARY.md`, raw/catalogs/).

YOUR JOB (dxb-team3; curation — choose the hand by weight: a script for the mechanical filter, Opus medium at most; nothing needs Fable):
1. HIGGSFIELD → `~/.local/state/dxb/teardown-20261119/higgsfield/curated/`:
   a) all official templates (104 activation presets) and all 419 motions, plus the signed-out official sets in `higgsfield/features.jsonl` (Marketing Studio styles, Soul styles, avatars, camera settings, the 95 skill templates);
   b) every editor-approved publication (6,996);
   c) every publication with ≥10 likes (≈3,072), ranked by likes; flag 100+;
   d) projects: only the most-liked (measure the like distribution in items/projects.jsonl; state the bar);
   e) contests: winners/top entries only if the data marks them.
   Per kept item: full prompt, model, settings/presets, input roles, likes/views, media URL, source list. One INDEX.md: counts per group; top models/presets/apps of the KEPT set.
2. TOPVIEW → `topview/curated/`: the 172 verbatim templates, 85 Drama styles, 33 script styles, the 180 Canvas skills list, and from the 1,644 sample projects only the valuable. FIRST measure what signal the sample-case data carries (official vs community author, likes/uses/remix counts, featured flags — `raw/site/trpc/samplecases/all_cases.json`, `details_all.json`); keep official + the top by that signal; state the bar.
3. Fable gets only the curated set: update `~/.local/state/dxb/teardown-20261119/SATURDAY-BRIEF.md` so Fable reads `curated/` first, raw only on need. Do NOT delete raw files yourself — before any deletion show him the list and sizes and get his word. Offer it once in your report.
4. Keep the teardown Chrome (CDP 9471) open and signed in; needed Saturday.
5. Report to him in Turkish under dxb-team3 §6 (Sizi bekleyen · Değişen · Bulunan): kept per platform with counts and the bar, what was left out, the deletion offer. Update STATE's 2026-11-19 line in one sentence; commit.

Everything else is in your handover note (`.planning/quick/20261119-studyo-platformu/DEVIR-2026-11-19.md`): the plan and its yes, LiteLLM v1.110.1, the sign-ins, Saturday (B85 foundation + worker-system evaluation at xhigh; Fable 5.2 high teardown), the open subjects (the 18 Nov agent persona test he wants to talk about; his pending answer on researching Meta's TRIBE model as a pre-release ad scorer for B28).
