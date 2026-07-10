---
task: beklentiler-master-plan-v2
date: 2026-07-10
type: quick
author: Fable 5 (inline — model routing v5/v6)
source: CEO BEKLENTİLER direktifi (repo kökü, 2026-07-10)
---

# Quick Task: BEKLENTİLER Directive Intake — Master Plan Korpusu Wave 1

## Amaç

CEO'nun BEKLENTİLER direktifini (2369 satır) resmi kayda almak ve plan-first stratejisinin
ilk dalgasını üretmek. Direktifin hükmü: 12 Temmuz sert deadline'a tam kapsam yetişmeyecekse
ÖNCE tüm projenin A'dan Z'ye ayrıntılı planı Fable 5 tarafından yazılır, SONRA execution başlar.

## Görevler

1. `BEKLENTİLER` orijinali gitignore (düz metin şifre içeriyor — git geçmişine giremez);
   sanitized kopya `HOLDING-OS-MASTER-PLAN/00-CEO-DIRECTIVE-BEKLENTILER.md`
2. `HOLDING-OS-MASTER-PLAN/00-INDEX.md` — 31 zorunlu spec dosyasının haritası + durum takibi
3. `HOLDING-OS-MASTER-PLAN/MASTER_PLAN.md` — omurga: proje tanımı, mevcut varlık envanteri
   (kanıtlı), gap analizi, workstream'ler, CEO faz sırası mutabakatı, deadline stratejisi
4. `HOLDING-OS-MASTER-PLAN/CEO_COMMAND_CENTER_SPEC.md` — dashboard redesign spec'i
   (direktif §§1-39 + madde 1-13 damıtılmış, uygulanabilir kontrat)
5. `HOLDING-OS-MASTER-PLAN/BACKUP_PLAN.md` — direktif §16: 12 Temmuz senaryosu
6. Memory: `beklentiler-directive-2026-07-10.md` (yeni) + `model-routing-hierarchy.md` v6
   (direktif §18: execution delegasyonu yeniden açıldı) + MEMORY.md index + governance ayna senkron
7. STATE.md pivot kaydı: Phase 09 (09-03..05) DURDU — sapma kaydı, master-plan-fidelity gereği görünür

## Done tanımı

- Tüm dosyalar diskte, şifre hiçbir commit'li dosyada yok (grep kanıtı)
- STATE.md pivotu + quick task satırı işlendi
- Tek atomik commit, Fable verdict'i ile

## Sapma kaydı (master-plan-fidelity)

Phase 09 execution ortasında duraklatıldı (wave 1 tamam, 09-03 briefing pipeline başlamadı).
Gerekçe: CEO BEKLENTİLER direktifi önceliği yeniden tanımladı. Bu sapma sessiz değildir —
STATE.md + bu plan + CEO raporunda görünürdür.
