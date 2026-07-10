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
| 27 | IMPLEMENTATION_ROADMAP.md | madde 14 (uygulama sırası + Opus devralma noktaları) | — |
| 28 | TEST_STRATEGY.md | §15 | — |
| 29 | ACCEPTANCE_CRITERIA.md | §38 + modül-başı | — |
| 30 | RISK_REGISTER.md | §15 | — |
| 31 | RECOVERY_AND_ROLLBACK_PLAN.md | §15 + §16 | — |

## Kayıtlı uyarlamalar (sessiz sapma yasak — master-plan-fidelity)

| # | Uyarlama | Gerekçe | CEO görünürlüğü |
|---|----------|---------|-----------------|
| U1 | Port 3100 → 3000 | Sistem 3000'de canlı; direktifteki 3100 yazım kaynaklı | Bu tablo + sözleşme Adım 0 |
| U2 | Dalga sırası: 31 dosya 5 dalgada, dalga=atomik commit | 12 Temmuz kesinti riski — kesinti kayıpsız devam için | Sözleşme Adım 1 (CEO onaylı plan) |
| U3 | Kadro kapsamı G7: `agency-agents/` legacy 153 + Fable'ın olmazsa-olmaz ekleri; persona = canlı çalışan | CEO sözlü ek hükmü 2026-07-10 ~21:35 (spec'lere dışarıdan işlendi, Fable devraldı) | EMPLOYEE_PERSONA_STANDARD G7 + HR §27 + bu tablo |

## Doğrulama komutları (dalga kapanışında koşulur)

```bash
ls HOLDING-OS-MASTER-PLAN/ | wc -l          # hedef: 33 (31 spec + INDEX + direktif)
grep -rn "DxB-Kokpit" HOLDING-OS-MASTER-PLAN/ .planning/ | wc -l   # hedef: 0
git log --oneline -5                          # dalga-başı atomik commit görünür
```
