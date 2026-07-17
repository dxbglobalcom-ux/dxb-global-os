# HOLDING-OS-MASTER-PLAN — KORPUS HARİTASI VE CANLI DURUM

> **Kaynak hüküm:** CEO BEKLENTİLER direktifi (2026-07-10, tam metin: [[00-CEO-DIRECTIVE-BEKLENTILER]]).
> **Bağlayıcı sözleşme:** `~/.claude/plans/sana-s-yl-orm-konu-al-m-nce-agile-pebble.md` (CEO hizalaması 7 madde + yasak listesi).
> **Yazar:** Fable 5, bizzat, inline — korpusun her satırı. Yazarlık devri yok (model routing v6).
> **Süreç:** Plan-first. Korpus %100 → Fable execution (12 Temmuz son geceye kadar) → Opus 4.8 devralır.
> **Port standardı:** 3000 (direktifteki 3100 düzeltildi — kayıtlı uyarlama #U1).

## Session açılış protokolü (her yeni session)

1. Bağlayıcı sözleşmeyi oku (yol yukarıda) → 2. governance + routing v6 memory → 3. `.planning/STATE.md` + bu INDEX'in durum tablosu → 4. CEO direktifi → 5. Kaldığın dosyadan YAZMAYA DEVAM. Soru yok, izin yok, subagent yok, Sonnet yok.

## Derinlik standardı (her spec dosyası — §14, 27 başlık)

Amaç · Gereksinimler · Mimari · Veri modeli · Component yapısı · Backend yapısı · Frontend yapısı · API'ler · Event yapısı · State yönetimi · Database tabloları · İlişkiler · Yetkilendirme · Logging · Audit · Security · Error handling · Retry · Fallback · Test planı · Acceptance criteria · Migration planı · Rollback planı · Uygulama sırası · Bağımlılıklar · Riskler · Edge case'ler · Done definition

Ek zorunluluklar (sözleşme Adım 1): mevcut-varlık eşlemesi (KALIR/YENİ/DEĞİŞİR) · adım-başı "çalıştır → şu çıktıyı gör" doğrulama komutu · Opus-devralma netliği · ⛔ kritik kararlarda "eldeki en güçlü model + CEO onayı" protokolü.

## DURUM TABLOSU

Durum değerleri: `—` başlanmadı · `YAZILIYOR` · `✓` tamam (derinlik şablonu tam + doğrulama komutlu + done-definition var).

### İntake (Adım 0 — tamam)

| # | Dosya | Durum | Not |
|---|-------|-------|-----|
| i1 | 00-CEO-DIRECTIVE-BEKLENTILER.md | ✓ | Sanitized (şifre 0 eşleşme); orijinal gitignore'da |
| i2 | 00-INDEX.md | ✓ | Bu dosya — dalga başı/sonu güncellenir |
| i3 | 00-CEO-DIRECTIVE-MUST-ROSTER.md | ✓ | 2026-07-12: external solo audit + CEO order — MUST discovery binding |
| i4 | WORKFORCE-MUST-EXPANSION-PLAN.md | ✓ | E5.7: 12-col revenue-engine matrix, +19 MUST roster → 198, commerce dept — **EXECUTED 2026-07-12, sync 199, engines 4/4 owned** |
| i5 | DEPUTY-FAILOVER-MAP.md | ✓ | E5.7e (audit F3): SPOF set + dept heads + D7-wave deputies; takeover protocol; E12.5 gate artifact |
| i6 | 00-CEO-DIRECTIVE-REVENUE-FIRST.md | ✓ | 2026-07-17: Talep (MUSTS) + CEO kararları D1-D9 + dış denetim (Codex F-01..15) adaptasyonu — Dalga 6 + R-serisi kaynağı |

### Dalga 1 — Temel

| # | Dosya | Direktif kaynağı | Durum |
|---|-------|------------------|-------|
| 1 | MASTER_PLAN.md | §14 + madde 17 (faz sırası) | ✓ |
| 2 | SYSTEM_ARCHITECTURE.md | §15 listesi + madde 1 | ✓ |
| 3 | DATA_MODEL.md | §14 (veri modeli/tablolar/ilişkiler) | ✓ |
| 4 | BACKUP_PLAN.md | §16 birebir + Opus devir | ✓ |

### Dalga 2 — Kontrol düzlemi

| # | Dosya | Direktif kaynağı | Durum |
|---|-------|------------------|-------|
| 5 | CEO_COMMAND_CENTER_SPEC.md | §§1-39 + madde 1-5 | ✓ |
| 6 | DESIGN_SYSTEM.md | §32 | ✓ |
| 7 | SETTINGS_AND_CONTROL_SPEC.md | §18 + madde 6.1-6.4 | ✓ |
| 8 | MODEL_ROUTING_SPEC.md | §19 + madde 6.1 | ✓ |
| 9 | OBSERVABILITY_SPEC.md | madde 10.1-10.6 | ✓ |
| 10 | APPROVAL_ENGINE_SPEC.md | §21 + madde 11 + B7b (para-çıkışı kapısı KALIR) | ✓ |
| 11 | COST_CONTROL_SPEC.md | §20 + madde 10.5 | ✓ |

### Dalga 3 — Organizasyon + ajanlar

| # | Dosya | Direktif kaynağı | Durum |
|---|-------|------------------|-------|
| 12 | ORGANIZATION_ENGINE_SPEC.md | §15(org) + madde 5.3 | ✓ |
| 13 | AGENT_ORCHESTRATION_SPEC.md | madde 5.2 + 18 | ✓ |
| 14 | FABLE_5_HOOK_SPEC.md | madde 7 (Intelligence & Discipline Hook) | ✓ |
| 15 | EMPLOYEE_PERSONA_STANDARD.md | madde 8 (persona + sicil; CEO emri: tümü Fable yazar) | ✓ |
| 16 | HR_OPERATING_SYSTEM_SPEC.md | madde 9 | ✓ |
| 17 | PERMISSION_MODEL.md | §15 listesi | ✓ |
| 18 | HOLDING_OS_PRODUCT_SPEC.md | madde 1 (doğru tanım) | ✓ |

### Dalga 4 — Platform kontratları

| # | Dosya | Direktif kaynağı | Durum |
|---|-------|------------------|-------|
| 19 | API_CONTRACTS.md | §15 | ✓ |
| 20 | EVENT_MODEL.md | §15 | ✓ |
| 21 | WORKFLOW_ENGINE_SPEC.md | madde 6.4 | ✓ |
| 22 | MEMORY_ARCHITECTURE.md | §15 | ✓ |
| 23 | HOLDING_LIBRARY_SPEC.md | madde 13 | ✓ |
| 24 | PROJECT_OPERATING_SYSTEM_SPEC.md | madde 12 + §23 | ✓ |
| 25 | SECURITY_MODEL.md | madde 4 (ertelenmiş-sertleştirme sicili; yeni bürokrasi YOK) | ✓ |
| 26 | AUDIT_AND_LOGGING_SPEC.md | madde 10.2-10.4 | ✓ |

Dalga 4 kapanış notu: spec'lerin "kayıtlı ek"leri (yeni kolon/tablo/fn envanterleri) DATA_MODEL §20 tablosuna, API_CONTRACTS 8b envanterine ve EVENT_MODEL §9b kataloğuna aynı dalga içinde işlendi — devirli satır açık kalmadı.

### Dalga 5 — Teslimat

| # | Dosya | Direktif kaynağı | Durum |
|---|-------|------------------|-------|
| 27 | IMPLEMENTATION_ROADMAP.md | madde 14 (uygulama sırası + Opus devralma noktaları) | ✓ |
| 28 | TEST_STRATEGY.md | §15 | ✓ |
| 29 | ACCEPTANCE_CRITERIA.md | §38 + modül-başı | ✓ |
| 30 | RISK_REGISTER.md | §15 | ✓ |
| 31 | RECOVERY_AND_ROLLBACK_PLAN.md | §15 + §16 | ✓ |

### Dalga 6 — Revenue-First genişlemesi (CEO Talep 2026-07-16/17)

| # | Dosya | Direktif kaynağı | Durum |
|---|-------|------------------|-------|
| 32 | REVENUE_ENGINE_SPEC.md | [[00-CEO-DIRECTIVE-REVENUE-FIRST]] (Talep §§2-4, 7; D1-D4) | ✓ 2026-07-17 |
| 33 | VOICE_INTERACTION_SPEC.md | Talep §5 + D3 (v1 çağrı hattı; boardroom "add-later") | ✓ 2026-07-17 |

**KORPUS 31/31 ✓ (2026-07-10 ~23:00).** Sözleşme Adım 2 yürürlükte: execution ayrı onay İSTEMEZ — sıradaki iş IMPLEMENTATION_ROADMAP E1.1'den başlar (Fable bizzat, 12 Temmuz son geceye kadar; sonra Opus ilk ✓'siz adımdan). Canlı ilerleme işareti artık IMPLEMENTATION_ROADMAP adım tablosundadır.

## Kayıtlı uyarlamalar (sessiz sapma yasak — master-plan-fidelity)

| # | Uyarlama | Gerekçe | CEO görünürlüğü |
|---|----------|---------|-----------------|
| U1 | Port 3100 → 3000 | Sistem 3000'de canlı; direktifteki 3100 yazım kaynaklı | Bu tablo + sözleşme Adım 0 |
| U2 | Dalga sırası: 31 dosya 5 dalgada, dalga=atomik commit | 12 Temmuz kesinti riski — kesinti kayıpsız devam için | Sözleşme Adım 1 (CEO onaylı plan) |
| U3 | Kadro kapsamı G7: `agency-agents/` legacy 153 + Fable'ın olmazsa-olmaz ekleri; persona = canlı çalışan | CEO sözlü ek hükmü 2026-07-10 ~21:35 (spec'lere dışarıdan işlendi, Fable devraldı) | EMPLOYEE_PERSONA_STANDARD G7 + HR §27 + bu tablo |
| U4 | JARVIS voice (eski Faz 9, 09-03..05) "sistem sonrası" dilimine ertelendi — CEO Faz 1-11 listesinde yer almıyor. **Refined 2026-07-17:** spec artık VAR ([[VOICE_INTERACTION_SPEC]] #33); v1 ücretsiz çağrı hattı = roadmap R3.1; Moderated boardroom D3 gereği "add-later" (spec §3.4, execution satırı YOK) | BEKLENTİLER pivotu; sonra CEO Talep §5 + D1/D3 kararları | MASTER_PLAN §6 + VOICE_INTERACTION_SPEC + bu tablo |
| U5 | Tip ölçeği utility ADLARI: kontrat "display"→`text-display-lg`, "body"→`text-body-md`; radius utility'leri semantik (`rounded-input/panel/modal`) | Legacy cockpit `@theme` anahtarlarıyla (--text-display, --text-body, --radius-sm/md/lg) çakışma — legacy izolasyonu (DESIGN_SYSTEM §22); px DEĞERLERİ kontrat birebir | tokens.css başlık yorumu + bu tablo |
| U6 | Görsel yön güncellemesi: IRON MAN / JARVIS HUD hissi (holo-glow serbest, champagne kimlik + obsidian zemin KALIR; §35 neon-çizgi yasağı gevşedi) + login↔shell tema birleşmesi (E2.4-b) | CEO sözlü RET + yeni referans 2026-07-11 ~00:40 ("Iron Man'deki gibi istiyorum, bunu beğenmedim") | phase8-design-brief memory A3 + bu tablo + DESIGN_SYSTEM uygulaması sıradaki design pası |
| U8 | CC-SPEC §7 rota tablosuna +1 sayfa: Intelligence grubuna `/ai/mcp` (MCP Servers) eklendi; TR/EN dil anahtarı command bar'a kondu (A2 gereği); approvals boş-durumu Command diline geçti ("Back to cockpit" kalıntısı öldü) | CEO göz-testi emirleri 2026-07-11 ~02:55 ("MCP'ler nerede?", "TR/EN dil butonu nerede?", "rengi eskiden kalma") | Bu tablo + commit + canlı UI |
| U9 | Revenue-First dalgası (D1-D9): free-first büyüme, ilk hedef €50, voice v1 = orkestratör çağrı hattı (boardroom ertelendi), İslami ton persona direktifi, fable-method DNA onayı, Claude ekosistem + masaüstü-25 library taraması | CEO Talep 2026-07-16 + karar turu 2026-07-17 | [[00-CEO-DIRECTIVE-REVENUE-FIRST]] + bu tablo + R-serisi roadmap |
| U10 | `revenue_ledger.engine` donmuş CHECK enum → `revenue_engines` tablosuna FK (motor=veri; yeni motor migration istemez) | Talep §7.2 "engines are a floor, not a ceiling"; keşif mimarisi şartı | REVENUE_ENGINE_SPEC §0/§11 + migration 0028a |
| U11 | Persona şablonu 11 → 12 bölüm: `## 12. Discipline DNA & Islamic conduct` anayasal bölümü (tek tip kanonik metin — rol-özgü-derinlik kuralının kayıtlı TEK istisnası) her personaya eklendi; mekanik kapı bölüm-yoksa-FAIL | CEO D5 (İslami ton) + D6 (fable-method DNA) + Talep §5.12 "constitutional, not optional" — madde 8'in 11-bölüm şekline CEO'nun YENİ hükmü ekleme yaptı | EMPLOYEE_PERSONA_STANDARD G8 + §4.1 + roadmap R1.8 |
| U12 | AGENT_ORCHESTRATION §5 "SDK runner (`packages/orchestrator/runner`) YENİ" satırı İPTAL (denetim F-05 kararı): runner ayrı paket olarak DOĞMADI — spec'in runner sorumlulukları üç mevcut parçada yaşıyor: worker-shim (oturum+kayıt), worker-loop (residency, R2.1), hook-binding (kapılar). Workflow executor R2.3'te AYNI anayasaya bağlandı (paylaşılan parçalar tek implementasyon: gateway `buildSdkToolOptions` + hook `extractEvidencePackage`/flag + observability `resolveEvidenceToolCalls`; kernel agent step preTask/postTask + REVISE döngüsü + kanıt çapası). Kontrol sinyalleri (`agent_runs.control_signal` pause/cancel) hâlâ açık — spec §4 hükmü duruyor, ayrı satır | Denetim F-05 "spec'teki runner ile gerçek kod eşleşmiyor — karar kaydı yok"; iki spawn yolunun kapı/kayıt/araç anayasası R2.2-R2.3'te birleşti | AGENT_ORCHESTRATION_SPEC A9 tablosu + roadmap R2.3 + tests/r23 (tek-implementasyon referans-eşitlik testi) |
| U7 | Dashboard Kurtarma D-bloku E4'ün ÖNÜNE alındı; R-kapısı süreci eklendi (22 referanslık pano → CEO seçimi) ve CEO **reçete C — DXB Hibrit**'i seçti (B-malzemesi: şampanya+obsidyen lüks zemin; A-derinliği: JARVIS holo-glow yalnız canlı veri/seçimde; mobil R12/R14 + voice R21 hedef yüzeyler). Bağlantı kontratı: ikon/veri/drill eşlemesi `command-nav.ts`+`module-live.ts` tek kaynak | CEO canlı emri 2026-07-11 ~01:00 ("önce internetten örnek sunun" + "her şey bağlantılı olacak" + 01:56 "c-hibrit seçeneği aynen uygula") | `references/design-direction/` (pano + seçim) + bu tablo + STATE.md + commit'ler 25ae9f6, 3ac7444 |

## Doğrulama komutları (dalga kapanışında koşulur)

```bash
ls HOLDING-OS-MASTER-PLAN/ | wc -l          # hedef: 33 (31 spec + INDEX + direktif)
grep -rn "DxB-Kokpit" HOLDING-OS-MASTER-PLAN/ .planning/ | wc -l   # hedef: 0
git log --oneline -5                          # dalga-başı atomik commit görünür
```
