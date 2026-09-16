# HOLDING-OS-MASTER-PLAN — CORPUS MAP AND LIVE STATUS

> **Kaynak hüküm:** CEO BEKLENTİLER direktifi (2026-07-10, tam metin: [[00-CEO-DIRECTIVE-BEKLENTILER]]).
> **Bağlayıcı sözleşme:** `~/.claude/plans/sana-s-yl-orm-konu-al-m-nce-agile-pebble.md` (CEO hizalaması 7 madde + yasak listesi).
> **Yazar:** korpusun her satırı bizzat, inline yazılır; yazarlık devri yok (model routing **v9**). Güncel yazar: **Opus 5** (CEO 2026-07-25, U20). *Tarihsel: korpusun 31 spec'ini 2026-07-10'da Fable 5 bizzat yazdı.*
> **Süreç:** Plan-first. Korpus %100 → Fable execution (12 Temmuz son geceye kadar) → **Opus 5 devraldı (2026-07-25, U20 — yedek model katmanı yok)**.
> **Port standardı:** 3000 (direktifteki 3100 düzeltildi — kayıtlı uyarlama #U1).

## Session opening protocol (every new session)

1. Bağlayıcı sözleşmeyi oku (yol yukarıda) → 2. governance + routing v6 memory → 3. `.planning/STATE.md` + bu INDEX'in durum tablosu → 4. CEO direktifi → 5. Kaldığın dosyadan YAZMAYA DEVAM. Soru yok, izin yok, subagent yok, Sonnet yok.

## Depth standard (every spec file — §14, 27 headings)

Amaç · Gereksinimler · Mimari · Veri modeli · Component yapısı · Backend yapısı · Frontend yapısı · API'ler · Event yapısı · State yönetimi · Database tabloları · İlişkiler · Yetkilendirme · Logging · Audit · Security · Error handling · Retry · Fallback · Test planı · Acceptance criteria · Migration planı · Rollback planı · Uygulama sırası · Bağımlılıklar · Riskler · Edge case'ler · Done definition

Ek zorunluluklar (sözleşme Adım 1): mevcut-varlık eşlemesi (KALIR/YENİ/DEĞİŞİR) · adım-başı "çalıştır → şu çıktıyı gör" doğrulama komutu · Opus-devralma netliği · ⛔ kritik kararlarda "eldeki en güçlü model + CEO onayı" protokolü.

## STATUS TABLE

Durum değerleri: `—` başlanmadı · `YAZILIYOR` · `✓` tamam (derinlik şablonu tam + doğrulama komutlu + done-definition var).

### Intake (step 0 — done)

| # | File | Status | Note |
|---|-------|-------|-----|
| i1 | 00-CEO-DIRECTIVE-BEKLENTILER.md | ✓ | Sanitized (şifre 0 eşleşme); orijinal gitignore'da |
| i2 | 00-INDEX.md | ✓ | Bu dosya — dalga başı/sonu güncellenir |
| i3 | 00-CEO-DIRECTIVE-MUST-ROSTER.md | ✓ | 2026-07-12: external solo audit + CEO order — MUST discovery binding |
| i4 | WORKFORCE-MUST-EXPANSION-PLAN.md | ✓ | E5.7: 12-col revenue-engine matrix, +19 MUST roster → 198, commerce dept — **EXECUTED 2026-07-12, sync 199, engines 4/4 owned** |
| i5 | DEPUTY-FAILOVER-MAP.md | ✓ | E5.7e (audit F3): SPOF set + dept heads + D7-wave deputies; takeover protocol; E12.5 gate artifact |
| i6 | 00-CEO-DIRECTIVE-REVENUE-FIRST.md | ✓ | 2026-07-17: the CEO request (MUSTS) + his decisions D1-D9 + the external audit (F-01..15) adaptation — wave 6 + R-serisi kaynağı |

### Wave 1 — Foundation

| # | File | Directive source | Status |
|---|-------|------------------|-------|
| 1 | MASTER_PLAN.md | §14 + madde 17 (faz sırası) | ✓ |
| 2 | SYSTEM_ARCHITECTURE.md | §15 listesi + madde 1 | ✓ |
| 3 | DATA_MODEL.md | §14 (veri modeli/tablolar/ilişkiler) | ✓ |
| 4 | BACKUP_PLAN.md | §16 birebir + Opus devir | ✓ |

### Wave 2 — Control plane

| # | File | Directive source | Status |
|---|-------|------------------|-------|
| 5 | CEO_COMMAND_CENTER_SPEC.md | §§1-39 + madde 1-5 | ✓ |
| 6 | DESIGN_SYSTEM.md | §32 | ✓ |
| 7 | SETTINGS_AND_CONTROL_SPEC.md | §18 + madde 6.1-6.4 | ✓ |
| 8 | MODEL_ROUTING_SPEC.md | §19 + madde 6.1 | ✓ |
| 9 | OBSERVABILITY_SPEC.md | madde 10.1-10.6 | ✓ |
| 10 | APPROVAL_ENGINE_SPEC.md | §21 + madde 11 + B7b (para-çıkışı kapısı KALIR) | ✓ |
| 11 | COST_CONTROL_SPEC.md | §20 + madde 10.5 | ✓ |

### Wave 3 — Organisation and agents

| # | File | Directive source | Status |
|---|-------|------------------|-------|
| 12 | ORGANIZATION_ENGINE_SPEC.md | §15(org) + madde 5.3 | ✓ |
| 13 | AGENT_ORCHESTRATION_SPEC.md | madde 5.2 + 18 | ✓ |
| 14 | FABLE_5_HOOK_SPEC.md | madde 7 (Intelligence & Discipline Hook) | ✓ |
| 15 | EMPLOYEE_PERSONA_STANDARD.md | madde 8 (persona + sicil; CEO emri: tümü Fable yazar) | ✓ |
| 16 | HR_OPERATING_SYSTEM_SPEC.md | madde 9 | ✓ |
| 17 | PERMISSION_MODEL.md | §15 listesi | ✓ |
| 18 | HOLDING_OS_PRODUCT_SPEC.md | madde 1 (doğru tanım) | ✓ |

### Wave 4 — Platform contracts

| # | File | Directive source | Status |
|---|-------|------------------|-------|
| 19 | API_CONTRACTS.md | §15 | ✓ |
| 20 | EVENT_MODEL.md | §15 | ✓ |
| 21 | WORKFLOW_ENGINE_SPEC.md | madde 6.4 | ✓ |
| 22 | MEMORY_ARCHITECTURE.md | §15 | ✓ |
| 23 | HOLDING_LIBRARY_SPEC.md | madde 13 | ✓ |
| 24 | PROJECT_OPERATING_SYSTEM_SPEC.md | madde 12 + §23 | ✓ |
| 25 | SECURITY_MODEL.md | madde 4 (ertelenmiş-sertleştirme sicili; yeni bürokrasi YOK) | ✓ |
| 26 | AUDIT_AND_LOGGING_SPEC.md | madde 10.2-10.4 | ✓ |

Wave 4 closing note: spec'lerin "kayıtlı ek"leri (yeni kolon/tablo/fn envanterleri) DATA_MODEL §20 tablosuna, API_CONTRACTS 8b envanterine ve EVENT_MODEL §9b kataloğuna aynı dalga içinde işlendi — devirli satır açık kalmadı.

### Wave 5 — Delivery

| # | File | Directive source | Status |
|---|-------|------------------|-------|
| 27 | IMPLEMENTATION_ROADMAP.md | madde 14 (uygulama sırası + Opus devralma noktaları) | ✓ |
| 28 | TEST_STRATEGY.md | §15 | ✓ |
| 29 | ACCEPTANCE_CRITERIA.md | §38 + modül-başı | ✓ |
| 30 | RISK_REGISTER.md | §15 | ✓ |
| 31 | RECOVERY_AND_ROLLBACK_PLAN.md | §15 + §16 | ✓ |

### Wave 6 — Revenue-First expansion (CEO request 2026-07-16/17)

| # | File | Directive source | Status |
|---|-------|------------------|-------|
| 32 | REVENUE_ENGINE_SPEC.md | [[00-CEO-DIRECTIVE-REVENUE-FIRST]] (Talep §§2-4, 7; D1-D4) | ✓ 2026-07-17 |
| 33 | VOICE_INTERACTION_SPEC.md | Talep §5 + D3 (v1 çağrı hattı; boardroom "add-later") | ✓ 2026-07-17 |
| 34 | CAPABILITY_ARSENAL_DOCTRINE.md | CEO emri 2026-07-18 00:20 ("alet edevatın HEPSİ nakşedilsin") + 00:30 paid-bench hükmü; denetim F-07 kapanışı — roadmap R4.3 | ✓ 2026-07-18 |
| 35 | CEO_OPERATING_MANUAL.md | U13 (Fable gap-analizi → CEO forward 2026-07-17) — roadmap E13.3; TR ana + EN kanonik ayna (U13 dil istisnası); library sop `ceo-operating-manual` (0d530051); E13.2 göz-testi oturumuna eşlik eder | ✓ 2026-07-18 |

**KORPUS 31/31 ✓ (2026-07-10 ~23:00).** Sözleşme Adım 2 yürürlükte: execution ayrı onay İSTEMEZ — sıradaki iş IMPLEMENTATION_ROADMAP E1.1'den başlar (Fable bizzat, 12 Temmuz son geceye kadar; sonra Opus ilk ✓'siz adımdan). Canlı ilerleme işareti artık IMPLEMENTATION_ROADMAP adım tablosundadır.

## Registered decisions (no silent deviation — master-plan fidelity)

> One line per decision: what was decided, who ordered it, and where the binding text lives.
> The story of how it was built belongs to the commit that built it, never to this table.

| # | Decision | Source | Binding text |
|---|-------|--------|-----------------|
| U1 | Port 3100 → 3000 | Directive typo; system runs on 3000 | This table |
| U2 | 31 corpus files in 5 waves, one wave = one commit | 12 July cut-off risk — resumable | Sözleşme Adım 1 |
| U3 | Roster scope G7: 153 legacy personas + the author's essential additions; a persona is a live employee, not a document | CEO 2026-07-10 | [[EMPLOYEE_PERSONA_STANDARD]] G7 + HR §27 |
| U4 | JARVIS voice moved out of Phase 9; v1 call line = R3.1; Moderated Boardroom stays add-later | BEKLENTİLER pivot + CEO D1/D3 | [[VOICE_INTERACTION_SPEC]] §3.4 |
| U5 | Type-scale utility names renamed to clear the legacy theme keys; px values unchanged | Legacy `@theme` collision | [[DESIGN_SYSTEM]] §22 |
| U6 | Visual direction: Iron Man / JARVIS HUD; champagne + obsidian kept; login and shell themes merged | CEO 2026-07-11 | [[DESIGN_SYSTEM]] |
| U7 | Dashboard recovery moved ahead of E4; CEO chose design recipe C (DXB Hybrid) off a 22-reference board | CEO 2026-07-11 | `references/design-direction/` + `command-nav.ts` |
| U8 | Route table gains `/ai/mcp`; TR/EN switch moved to the command bar | CEO eye test 2026-07-11 | [[CEO_COMMAND_CENTER_SPEC]] §7 |
| U9 | Revenue-First wave D1-D9: free-first growth, first target €50, voice v1, Islamic tone, library sweep | CEO 2026-07-16/17 | [[00-CEO-DIRECTIVE-REVENUE-FIRST]] |
| U10 | Revenue engines become data, not a frozen list | "Engines are a floor, not a ceiling" | [[REVENUE_ENGINE_SPEC]] §0/§11 |
| U11 | Persona template 11 → 12 sections; §12 Discipline DNA & Islamic conduct is constitutional, identical in every persona | CEO D5 + D6 | [[EMPLOYEE_PERSONA_STANDARD]] G8 |
| U12 | The separate runner package was never born; its duties live in three existing parts — the spec line is cancelled | Audit F-05 | [[AGENT_ORCHESTRATION_SPEC]] A9 |
| U13 | CEO Operating Manual enters as E13.3; Turkish main text + English mirror (registered language exception) | CEO 2026-07-17 | [[00-CEO-DIRECTIVE-LANGUAGE]] |
| U14 | No Education department and no Operations department — existing roles and the library shelf cover it; reconsidered at first profit | CEO 2026-07-17 | This table |
| U15 | Voice line reopened as unfinished; machine work done 2026-07-25; only the CEO's own ear test remains | CEO 2026-07-17 | [[00-NOTE-R32-VOICE-REMEDIATION-PLAN]] <!-- OPEN: B03 --> |
| U16 | Small design symmetry defects deferred | CEO 2026-07-17 | Board B02 <!-- OPEN: B02 --> |
| U17 | Workforce activation machinery: machine intake for dormant employees, task due dates, derived probation scores, per-employee model keys | CEO answers D10/D11, 2026-07-18 | [[00-CEO-DIRECTIVE-REVENUE-FIRST]] §3-bis |
| U18 | Activation repairs: department model keys, the toolless-run waiver, probation score = gate result, model ladder repaired at L3 | Found mid-activation 2026-07-18 | `packages/hook/src/post-task.ts` |
| U19 | **Outleteuro pilot cancelled entirely** — the holding must first run excellently at low cost; a future CEO intent reopens it | CEO 2026-07-19, given twice | [[00-NOTE-CEO-COMPLAINT-LEDGER-2026-07-19]] |
| U20 | Construction authorship Fable 5 → Opus 5; no fallback model layer — an error surfaces as a blocked report, never a silent downgrade; history and internal identifiers untouched | CEO 2026-07-25 | [[MODEL_ROUTING_SPEC]] A-2026-07-25 |
| U21 | **Quality tier law:** judgment, taste and anything a human sees run on Opus 5; Sonnet leaves every critical seat; eight models dismissed | CEO 2026-07-26 | [[MODEL_ROUTING_SPEC]] §4d |
| U22 | An employee's brain may RAISE a task's tier and may never lower it | CEO chose option B, 2026-07-26 | [[MODEL_ROUTING_SPEC]] §4f |
| U23 | The critical gate is built: two rival models try to refute Opus 5's work, one revision round, and a dead panel never halts the company | CEO 2026-07-26 | [[MODEL_ROUTING_SPEC]] §4e |
| U24 | Hamza's two conversations (money/plans · the daily report) are one brain with two behaviours; the report leg is handed live figures, never recalled ones | CEO 2026-07-25 | [[VOICE_INTERACTION_SPEC]] §24ter |
| U25 | The monthly spending brake actually stops non-critical work at 100%; release is manual | Roadmap W1.6 | [[COST_CONTROL_SPEC]] §4bis |
| U26 | Chat gains real conversations; each thread carries its own memory | Roadmap W1.5 | [[VOICE_INTERACTION_SPEC]] §24quater |
| U27 | The chat board could not accept a message — repaired; one door writes thread and message together. **Standing rule: shipping runtime code is not shipping until the resident services are restarted in the same turn** | CEO report 2026-07-26 | [[VOICE_INTERACTION_SPEC]] §24quater-bis |
| U28 | The discovery engine went live — the holding's outside hands reached the world and registered its first five opportunities | Roadmap W2.2 | [[REVENUE_ENGINE_SPEC]] §7ter |
| U29 | A task carries a short headline in both languages, separate from its long instruction | CEO screenshot 2026-07-26 | [[CEO_COMMAND_CENTER_SPEC]] §9ter |
| U30 | Construction authorship: **Fable 5 re-authorized alongside Opus 5** — one session, one author; still no fallback chain | CEO 2026-07-26 ("en son nihai kararım") | `.planning/governance/model-routing-hierarchy.md` v11 |
| U31 | Call line and chat collided in one column — repaired as shape. **Rule: a fixed-height surface's design check must include every panel in its open state** | CEO screenshot 2026-07-26 | [[VOICE_INTERACTION_SPEC]] §24quater-ter |
| U32 | The two written money gates fire: the capital ceiling refuses rather than auto-rejects, and an objective must cite a real opportunity | Roadmap W2.3 | [[REVENUE_ENGINE_SPEC]] §7quater |
| U33 | An approved allocation produces real work — a project and a staffed kickoff task; pausing a project actually stops dispatch | Roadmap W2.4 | [[REVENUE_ENGINE_SPEC]] §7quinquies |
| U34 | The holding opens its own work: a finished plan's steps become staffed tasks inside an already-approved project; decisions stay with the CEO | Roadmap W2.5 | [[AGENT_ORCHESTRATION_SPEC]] A10-A13 |
| U35 | A capital-blocked opportunity says so on the CEO's own board, in plain language | CEO 2026-07-26 | [[REVENUE_ENGINE_SPEC]] §7quater |
| U36 | **The audit twin:** the builder no longer approves his own work — read-only adversarial audits at three triggers; a finding is evidence, never a verdict; authorship stays with the session author | CEO 2026-07-26 | [[00-CEO-DIRECTIVE-AUDIT-TWIN]] |
| U37 | Hamza opens the conversation — the 07:00 briefing, from one measured source, with no model call | Roadmap W2.6 | [[VOICE_INTERACTION_SPEC]] §24quinquies |
| U38 | **The open work board** — one page answers "what is left"; four laws; oldest work first | CEO 2026-07-27 | [[00-BOARD-OPEN-WORK]] <!-- CEO-OK: board-2026-07-27 --> |
| U39 | Hamza gets his name and his character (§13, not inherited by other personas); his persona had been reaching him truncated and now arrives whole | CEO 2026-07-27 | `personas/ceo/agents-orchestrator.md` §13 |
| U40 | Sixteen rival sources read frame by frame. **Corrected verdict: all sixteen run and earn, DXB does neither — the programme's purpose is to switch it on.** Six waves, no new spec | CEO order C42 | [[00-BOARD-OPEN-WORK]] Section 3 |
| U41 | **The record may no longer disagree with the system** — every durable statement is either current state, re-measured, or a dated event; open work names its board row | CEO 2026-07-28 | [[00-BOARD-OPEN-WORK]] laws |
| U42 | **The context architecture:** one page of always-on text instead of 27, eight doors opened on demand, the state file cut to a photograph. **LAW A** — a live order deletes what contradicts it. **LAW B** — finished is not approved | CEO 2026-07-30 | `.claude/CLAUDE.md` + `.claude/skills/dxb-*` |
| U43 | Alarm opened: a ✓ record that announces work still to come must name its board row. The ban list in the CEO-language text struck out — real words are used and explained in brackets. **Accepted by the CEO 2026-08-01 ("1. yi onaylıyorum. dünde onaylamıştım. kaydedilsin demiştim")** | CEO 2026-07-31 / 08-01 | `scripts/governance/ledger-truth.mjs` + `.claude/hooks/ceo-language.sh` <!-- CEO-OK: governance-repairs-accepted-2026-08-01 --> |
| U44 | **The media studio has a contract in the corpus.** Board row B43 founded a whole department on 2026-09-03 and ran it for twelve days while every spec that owns its subjects was silent — measured 2026-09-15: DATA_MODEL, EVENT_MODEL, COST_CONTROL, APPROVAL_ENGINE, OBSERVABILITY, WORKFLOW_ENGINE and this index carried **zero** word-bounded mentions of the studio. W13 registers the studio where each rule demands: the job book `media_jobs` and the missing job → scene → shot chain (DATA_MODEL), the absent live event (EVENT_MODEL), the unmeasured card time and cost per delivered second (COST_CONTROL), the CEO's unrecorded verdict on a film (APPROVAL_ENGINE), the times table (OBSERVABILITY), the production line that is a dispatch book and not a workflow (WORKFLOW_ENGINE), and the clock plus the QA receipt (AGENT_ORCHESTRATION A22). **Registration only — nothing was built:** each block names its gap and who closes it (W14, on the CEO's word) <!-- CEO-OK: w13-studio-contract-registered-2026-09-15 --> <!-- CEO-OK: w14-eleven-ferrari-legs-registered-on-his-basla-2026-09-16 -->. | CEO 2026-09-15 ("başla"), on the studio audit of 2026-09-14 (findings F057 F058 F059 F060 F061 F062 F065) | the six specs' "Registered adaptations — B43 the media studio" blocks + AGENT_ORCHESTRATION A22 + `.planning/REQUIREMENTS.md` V2-B43 rows + `.planning/quick/20260903-media-studio-founding/PLAN.md`; proved by `CHECK-W13-2026-09-15.sh w13` |

## Verification commands (run at wave close)

```bash
ls HOLDING-OS-MASTER-PLAN/ | wc -l          # hedef: 33 (31 spec + INDEX + direktif)
grep -rn "DxB-Kokpit" HOLDING-OS-MASTER-PLAN/ .planning/ | wc -l   # hedef: 0
git log --oneline -5                          # dalga-başı atomik commit görünür

# AUDIT-LEDGER INVARIANT (registered 2026-07-17 ~22:40 — lesson: 8 findings lived only in
# session memory for a day; memory is a lead, NEVER a ledger [RULE #0-A]. Every external-audit
# finding ID must hit a GOVERNED anchor: roadmap row, U-row, or directive disposition table.)
for f in F-01 F-02 F-03 F-04 F-05 F-06 F-07 F-08 F-09 F-10 F-11 F-12 F-13 F-14 F-15; do
  grep -ql "$f" HOLDING-OS-MASTER-PLAN/IMPLEMENTATION_ROADMAP.md HOLDING-OS-MASTER-PLAN/00-CEO-DIRECTIVE-REVENUE-FIRST.md \
    || echo "ORPHANED AUDIT FINDING: $f"; done   # hedef: sıfır satır çıktı
```
