# First cut, weighed — what stays and what leaves (nothing deleted yet)

Weighed by the lead on 2026-11-22 from `FIRST-CUT.md` (the reader's list). Scope: the job papers — `.planning/quick/` — and three piles of generated working output. Research, references, his directives, the board, the specs and all code are outside this cut. Computed by `weigh.py` (read-only), sizes from `lstat`.

**The rule.** A job folder that is work in hand, or that a living record names whole, or that code reads, stays whole. A folder of which living records name only some files keeps exactly those files. Every other job folder leaves. *Tracked* files that leave stay in git history; *untracked* files that leave are gone for good.

| | folders | on disk | leaves, kept in history | leaves for good |
|---|---:|---:|---:|---:|
| stays whole | 44 | 588.9 MB | 0.0 MB | 0.0 MB |
| keeps only the named files | 34 | 2,186.8 MB | 5.8 MB | 2,177.4 MB |
| leaves whole | 99 | 179.9 MB | 5.2 MB | 174.7 MB |
| **total** | 177 | 2,955.6 MB | 11.0 MB | 2,352.1 MB |

## The ten largest that leave for good

| folder | verdict | leaves for good | files | what stays |
|---|---|---:|---:|---|
| `20261022-iki-yol` | NAMED | 1,770.6 MB | 57723 | only: RUNBOOK.md |
| `20261103-web-ders` | NAMED | 309.4 MB | 7422 | only: tracks/4-reklam-olcum.md |
| `20261105-gorsel-karsilastirma` | GO | 88.8 MB | 95 | — |
| `20261104-web-bedava-aletler` | NAMED | 76.4 MB | 4549 | only: crawl-test/RUN.md |
| `20261101-gelir-devir` | GO | 53.5 MB | 133 | — |
| `20261009-masa-b51` | NAMED | 4.6 MB | 8 | only: PLAN.md, SOL-step2.md, SOL-step3.md, evidence (code reads it) |
| `20261012-b64-is-akisi` | NAMED | 4.2 MB | 9 | only: PLAN.md, deneme-2026-10-13, is-akisi.html |
| `.playwright-mcp` | GO | 4.0 MB | 172 | — |
| `20261112-sinir-taramasi` | NAMED | 3.9 MB | 34 | only: LISTE.md, SOL.md, sol-e/SOL.md |
| `20261110-mod-bolme` | GO | 3.2 MB | 62 | — |

## Stays whole

| folder | on disk | why |
|---|---:|---|
| `20261120-reklam-storyboardlari` | 246.4 MB | named whole by a living record or read by code |
| `20261120-reklam-filmleri` | 122.3 MB | named whole by a living record or read by code |
| `20261109-outletcity-b84` | 90.4 MB | named whole by a living record or read by code |
| `20261021-dort-yollu-olcum` | 45.5 MB | named whole by a living record or read by code |
| `20261108-playbook-calismasi` | 37.6 MB | named whole by a living record or read by code |
| `20261021-uc-seviye` | 7.0 MB | cited by the foundation's worker evidence |
| `20261028-deneme-sol` | 5.2 MB | cited by the second trial's ground paper (in hand) |
| `20261117-temel` | 4.7 MB | named whole by a living record or read by code |
| `20261004-persona-old-patterns` | 3.9 MB | named whole by a living record or read by code |
| `20261110-fable-5-2-calisma` | 3.7 MB | named whole by a living record or read by code |
| `20261112-motion-graphics` | 3.5 MB | named whole by a living record or read by code |
| `20261006-effort-machinery-removal` | 2.4 MB | named whole by a living record or read by code |
| `20261110-mod-deneme` | 2.3 MB | named whole by a living record or read by code |
| `20261019-degerli-is-danisma` | 1.8 MB | named whole by a living record or read by code |
| `20261004-locked-tool` | 1.6 MB | named whole by a living record or read by code |
| `20261015-arama-testi` | 1.4 MB | named whole by a living record or read by code |
| `20261108-kisayol` | 1.1 MB | code names it (tools/studio-prompts/kisayol) |
| `20260924-caveman-on-5-5` | 1.1 MB | named whole by a living record or read by code |
| `20261003-runtime-isolation` | 1.1 MB | named whole by a living record or read by code |
| `20261014-88-link` | 1.0 MB | named whole by a living record or read by code |
| `20261024-zeytin-tek-kol` | 0.8 MB | named whole by a living record or read by code |
| `20261017-temizlik` | 0.8 MB | named whole by a living record or read by code |
| `20260903-media-studio-founding` | 0.7 MB | named whole by a living record or read by code |
| `20260924-research-door-perplexity` | 0.6 MB | named whole by a living record or read by code |
| `20261004-design-max` | 0.5 MB | named whole by a living record or read by code |
| `20261119-studyo-platformu` | 0.3 MB | named whole by a living record or read by code |
| `20261103-web-studio-plan` | 0.3 MB | named whole by a living record or read by code |
| `20261004-orchestration-door` | 0.3 MB | named whole by a living record or read by code |
| `20261004-company-memory-drawer` | 0.2 MB | named whole by a living record or read by code |
| `20261013-jev-olcum` | 0.1 MB | named whole by a living record or read by code |
| `20261102-mavi-kusak-tek-opus` | 0.1 MB | named whole by a living record or read by code |
| `20261108-seo-aletleri` | 0.1 MB | named whole by a living record or read by code |
| `20261029-web-ofisi-devir` | 0.0 MB | cited by the foundation's worker evidence |
| `20261103-web-studio-kesif` | 0.0 MB | named whole by a living record or read by code |
| `20261023-calisan-sistemi` | 0.0 MB | cited by the foundation's worker evidence |
| `20261117-deneme-2` | 0.0 MB | named whole by a living record or read by code |
| `20260928-sol-db-reach` | 0.0 MB | named whole by a living record or read by code |
| `20260714-e101-hook-engine` | 0.0 MB | named whole by a living record or read by code |
| `20260713-e84b-alert-center` | 0.0 MB | named whole by a living record or read by code |
| `20260725-u15-voice-remediation` | 0.0 MB | named whole by a living record or read by code |
| `20260725-suite-afterall-hygiene` | 0.0 MB | named whole by a living record or read by code |
| `20260714-e102-spawn-binding` | 0.0 MB | named whole by a living record or read by code |
| `20261122-b72-yedek` | 0.0 MB | work in hand (B72) |
| `20260725-u15-voice-round2` | 0.0 MB | named whole by a living record or read by code |

## Keeps only the named files

| folder | stays | leaves, in history | leaves for good |
|---|---|---:|---:|
| `20261022-iki-yol` | RUNBOOK.md | 0.0 MB | 1,770.6 MB |
| `20261103-web-ders` | tracks/4-reklam-olcum.md | 3.2 MB | 309.4 MB |
| `20261104-web-bedava-aletler` | crawl-test/RUN.md | 0.1 MB | 76.4 MB |
| `20261009-masa-b51` | PLAN.md, SOL-step2.md, SOL-step3.md, evidence (code reads it) | 0.1 MB | 4.6 MB |
| `20261012-b64-is-akisi` | PLAN.md, deneme-2026-10-13, is-akisi.html | 0.3 MB | 4.2 MB |
| `20261112-sinir-taramasi` | LISTE.md, SOL.md, sol-e/SOL.md | 0.0 MB | 3.9 MB |
| `20261117-b43-sozlesme-sayfasi` | SOL.md, plan.signed.md | 0.4 MB | 2.9 MB |
| `20261018-gozlem-odasi` | HIS-WORDS.md, PLAN.md | 0.2 MB | 1.5 MB |
| `20261109-ilke` | reminder-test | 0.0 MB | 1.5 MB |
| `20261113-uzakta-duzen` | SOL.md | 0.0 MB | 0.8 MB |
| `20261014-iki-video` | MERGE.md | 0.1 MB | 0.7 MB |
| `20261117-dosya-boyutu-bekcisi` | SOL.md | 0.0 MB | 0.6 MB |
| `20261004-b51-code-and-lock` | CARD.md, PLAN-locked-tool.md | 0.2 MB | 0.4 MB |
| `20261004-his-list` | evidence/tools-probe.txt, item2-report.md, item5-report.md | 0.0 MB | 0.0 MB |
| `20261001-auditor-exam` | RESULT.md | 0.1 MB | 0.0 MB |
| `20261104-goz-olcumu` | gemini-api-test.py | 0.0 MB | 0.0 MB |
| `20260713-e91-workflow-runner` | ? | 0.0 MB | 0.0 MB |
| `20260713-e93-approval-center` | ? | 0.0 MB | 0.0 MB |
| `20260719-c-series-remediation` | ? | 0.0 MB | 0.0 MB |
| `20260823-construction-company-separation` | EVIDENCE.md, PLAN.md, company-write-baseline.json (code reads it) | 0.1 MB | 0.0 MB |
| `20260827-arsenal-watch` | ? | 0.0 MB | 0.0 MB |
| `20260919-the-opening` | ? | 0.0 MB | 0.0 MB |
| `20260923-prompt-audit` | PROPOSED.diff, REPORT.md | 0.1 MB | 0.0 MB |
| `20260924-night-content-engine` | PLAN.md | 0.0 MB | 0.0 MB |
| `20260924-signal-revenue-study` | EVIDENCE.md, STUDY.md | 0.1 MB | 0.0 MB |
| `20260925-dxb-team1` | HANDOVER-2026-09-26.md | 0.0 MB | 0.0 MB |
| `20260925-virtual-creator` | PLAN.md | 0.1 MB | 0.0 MB |
| `20260926-b59-context-gate` | EVIDENCE-B60-2026-09-26.md | 0.0 MB | 0.0 MB |
| `20261014-tahta-sirasi` | HIS-WORDS-2026-10-15.md, ORDER.md, review-R1.md, review-R2.md | 0.2 MB | 0.0 MB |
| `20261017-studio-platform-hub` | FINAL.md, R5-youtube-ai-rules-and-risks.md | 0.2 MB | 0.0 MB |
| `20261021-ekim-linkleri` | RECORD.md | 0.0 MB | 0.0 MB |
| `20261102-tarz-dolabi` | ? | 0.0 MB | 0.0 MB |
| `20261102-web-studio-personalar` | RAPOR.md | 0.2 MB | 0.0 MB |
| `20261117-sekme-tahtaya` | ? | 0.0 MB | 0.0 MB |

## Leaves whole

| folder | in history | for good | why |
|---|---:|---:|---|
| `20261105-gorsel-karsilastirma` | 0.0 MB | 88.8 MB | named only by closed rows or other papers |
| `20261101-gelir-devir` | 0.0 MB | 53.5 MB | named only by closed rows or other papers |
| `.playwright-mcp` | 0.0 MB | 4.0 MB | generated working output |
| `20261110-mod-bolme` | 0.0 MB | 3.2 MB | named only by closed rows or other papers |
| `20261004-memory-followups` | 0.2 MB | 2.5 MB | named only by closed rows or other papers |
| `20261110-sozun-sahibi` | 0.0 MB | 2.3 MB | named by nothing living |
| `20261021-b03bis` | 1.5 MB | 0.5 MB | named by nothing living |
| `20261110-efor-kendiliginden` | 0.2 MB | 1.5 MB | named only by closed rows or other papers |
| `20261117-uzakta-sozle-biter` | 0.0 MB | 1.6 MB | named only by closed rows or other papers |
| `20261101-gelir-sol` | 0.0 MB | 1.4 MB | named by nothing living |
| `20261111-orkestrator-alti-madde` | 0.6 MB | 0.5 MB | named only by closed rows or other papers |
| `20261118-obscura-zincir` | 0.0 MB | 1.1 MB | named only by closed rows or other papers |
| `.archify/workflow-b43-sozlesme-sayfasi-20261117-084500` | 0.0 MB | 1.0 MB | generated working output |
| `20261006-dxb-team2-lean` | 0.2 MB | 0.7 MB | named by nothing living |
| `20261013-b41-tasarim-becerileri` | 0.0 MB | 0.9 MB | named by nothing living |
| `.archify/workflow-studyo-platformu-20261119-1150` | 0.0 MB | 0.9 MB | generated working output |
| `20261112-kota-sayaci` | 0.0 MB | 0.8 MB | named only by closed rows or other papers |
| `20261008-four-equal-arrangements` | 0.0 MB | 0.8 MB | named by nothing living |
| `20261006-typecheck-tests` | 0.1 MB | 0.7 MB | named by nothing living |
| `20260725-ceo-morning-decisions` | 0.7 MB | 0.0 MB | named only by closed rows or other papers |
| `20261014-b64-adim1` | 0.0 MB | 0.7 MB | named only by closed rows or other papers |
| `20261004-auditor-text` | 0.1 MB | 0.6 MB | named only by closed rows or other papers |
| `20261028-b64-deneme-kurallari` | 0.0 MB | 0.6 MB | named only by closed rows or other papers |
| `20261117-efor-medium` | 0.0 MB | 0.6 MB | named only by closed rows or other papers |
| `20261006-door-overall-look` | 0.0 MB | 0.6 MB | named by nothing living |
| `20261118-yeni-eklenenler` | 0.0 MB | 0.6 MB | named only by closed rows or other papers |
| `20261027-b64-inceleme` | 0.0 MB | 0.6 MB | named only by closed rows or other papers |
| `20261006-fable-review-fixes` | 0.2 MB | 0.4 MB | named by nothing living |
| `20261015-scrollcraft-studio` | 0.1 MB | 0.3 MB | named by nothing living |
| `20261107-dxb-verify` | 0.4 MB | 0.0 MB | named only by closed rows or other papers |
| `20261110-yonetici-oturum` | 0.0 MB | 0.4 MB | named only by closed rows or other papers |
| `20261019-canli-dinlenme` | 0.0 MB | 0.4 MB | named by nothing living |
| `20261021-musteri-gozu` | 0.0 MB | 0.4 MB | named only by closed rows or other papers |
| `20261012-xhigh-plan` | 0.0 MB | 0.3 MB | named by nothing living |
| `20261006-sol-dump-sweep` | 0.1 MB | 0.1 MB | named by nothing living |
| `20261019-excel-tab` | 0.0 MB | 0.2 MB | named by nothing living |
| `20261117-kapi-iki-kural` | 0.0 MB | 0.2 MB | named only by closed rows or other papers |
| `20261019-ye18-pocock` | 0.0 MB | 0.2 MB | named only by closed rows or other papers |
| `20261006-medium-first` | 0.0 MB | 0.1 MB | named by nothing living |
| `20261006-handover-clean-break` | 0.0 MB | 0.1 MB | named by nothing living |
| `20261111-link-kapisi` | 0.0 MB | 0.1 MB | named only by closed rows or other papers |
| `20261107-ugc` | 0.1 MB | 0.0 MB | named only by closed rows or other papers |
| `20261019-calisma1-door` | 0.0 MB | 0.1 MB | named by nothing living |
| `20261004-live-turn-bar` | 0.1 MB | 0.0 MB | named only by closed rows or other papers |
| `20261014-yan-calisma-kapisi` | 0.0 MB | 0.1 MB | named by nothing living |
| `20261001-score-card-gate` | 0.0 MB | 0.0 MB | named by nothing living |
| `20261003-doors-slim` | 0.0 MB | 0.0 MB | named by nothing living |
| `20261109-sol-zarf` | 0.0 MB | 0.0 MB | named by nothing living |
| `260706-h26-set-up-second-brain-infrastructure-obsid` | 0.0 MB | 0.0 MB | named only by closed rows or other papers |
| `260712-mno-add-scrapling-github-com-d4vinci-scrapli` | 0.0 MB | 0.0 MB | named only by closed rows or other papers |
| `20261001-pin-auto-review` | 0.0 MB | 0.0 MB | named by nothing living |
| `20260714-e95-library` | 0.0 MB | 0.0 MB | named by nothing living |
| `20260713-org-chart-professional` | 0.0 MB | 0.0 MB | named only by closed rows or other papers |
| `20260728-ledger-truth-gate` | 0.0 MB | 0.0 MB | named only by closed rows or other papers |
| `20260713-e84-audit-surface` | 0.0 MB | 0.0 MB | named only by closed rows or other papers |
| `20260725-fable-to-opus5-rename` | 0.0 MB | 0.0 MB | named by nothing living |
| `20260713-e71-model-routing` | 0.0 MB | 0.0 MB | named by nothing living |
| `20260724-chat-dictation-voice-merge` | 0.0 MB | 0.0 MB | named by nothing living |
| `20260922-session-opening-budget` | 0.0 MB | 0.0 MB | named only by closed rows or other papers |
| `20260713-e83-ops-live` | 0.0 MB | 0.0 MB | named by nothing living |
| `20260821-gece-vardiyasi` | 0.0 MB | 0.0 MB | named by nothing living |
| `20260725-c9-filterbar-rollout` | 0.0 MB | 0.0 MB | named by nothing living |
| `20260724-9c9d9e-data-controls` | 0.0 MB | 0.0 MB | named by nothing living |
| `20261103-mavi-kusak-max` | 0.0 MB | 0.0 MB | named only by closed rows or other papers |
| `20260924-code-gate` | 0.0 MB | 0.0 MB | named only by closed rows or other papers |
| `20260724-10d10e-portfolio-responsibility` | 0.0 MB | 0.0 MB | named by nothing living |
| `20260710-login-redesign` | 0.0 MB | 0.0 MB | named only by closed rows or other papers |
| `20260714-e94-project-command-view` | 0.0 MB | 0.0 MB | named by nothing living |
| `20260719-c9-filter-bar-rollout` | 0.0 MB | 0.0 MB | named by nothing living |
| `20260727-w26-proactive-briefing` | 0.0 MB | 0.0 MB | named by nothing living |
| `20260714-e111-cost-breakdown` | 0.0 MB | 0.0 MB | named by nothing living |
| `20260717-r42-library-enrichment` | 0.0 MB | 0.0 MB | named by nothing living |
| `20260724-c5-trigger-workforce-truth` | 0.0 MB | 0.0 MB | named only by closed rows or other papers |
| `20260718-e125-workforce-gate` | 0.0 MB | 0.0 MB | named by nothing living |
| `20261012-b64-sayfa` | 0.0 MB | 0.0 MB | named by nothing living |
| `20260726-w25-autonomous-work` | 0.0 MB | 0.0 MB | named by nothing living |
| `20260726-w23-revenue-gates` | 0.0 MB | 0.0 MB | named by nothing living |
| `20260718-r43-capability-arsenal` | 0.0 MB | 0.0 MB | named by nothing living |
| `20260718-e122-widget-system` | 0.0 MB | 0.0 MB | named by nothing living |
| `20260724-machine-room` | 0.0 MB | 0.0 MB | named by nothing living |
| `20260718-e131-test-run` | 0.0 MB | 0.0 MB | named by nothing living |
| `20260714-e121-real-data-pages` | 0.0 MB | 0.0 MB | named by nothing living |
| `20260718-e124-crm-gate` | 0.0 MB | 0.0 MB | named only by closed rows or other papers |
| `20260726-brain-floor` | 0.0 MB | 0.0 MB | named by nothing living |
| `20260713-e92-workflow-settings-ui` | 0.0 MB | 0.0 MB | named by nothing living |
| `20261107-fleet-gate` | 0.0 MB | 0.0 MB | named by nothing living |
| `20260724-3a3b-dead-click-sweep` | 0.0 MB | 0.0 MB | named by nothing living |
| `20260710-ui-spec-amendment-a1` | 0.0 MB | 0.0 MB | named only by closed rows or other papers |
| `20260713-sicil-backfill` | 0.0 MB | 0.0 MB | named only by closed rows or other papers |
| `20260718-e133-ceo-manual` | 0.0 MB | 0.0 MB | named by nothing living |
| `20260724-19e-decisions-content-i18n` | 0.0 MB | 0.0 MB | named by nothing living |
| `20260718-e123-route-gate` | 0.0 MB | 0.0 MB | named by nothing living |
| `20260726-critical-gate` | 0.0 MB | 0.0 MB | named by nothing living |
| `20260710-approvals-readable-payload` | 0.0 MB | 0.0 MB | named only by closed rows or other papers |
| `20260710-beklentiler-master-plan-v2` | 0.0 MB | 0.0 MB | named only by closed rows or other papers |
| `20260717-r32-live-defect-remediation` | 0.0 MB | 0.0 MB | named by nothing living |
| `20261015-ekim-linkleri` | 0.0 MB | 0.0 MB | named only by closed rows or other papers |
| `20260723-helptip-depth` | 0.0 MB | 0.0 MB | named by nothing living |
| `20260719-e131-f09-close` | 0.0 MB | 0.0 MB | named by nothing living |
