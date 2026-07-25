# RISK_REGISTER — DXB GLOBAL AI-NATIVE HOLDING OS

> Dalga 5 · Yazar: Fable 5 bizzat · Kaynak hüküm: §15 (zorunlu dosya) + [[MASTER_PLAN]] §9 (omurga riskleri — burada genişler) · Kardeşler: [[BACKUP_PLAN]] (deadline senaryoları), [[SECURITY_MODEL]] (kabul edilen güvenlik riskleri), [[RECOVERY_AND_ROLLBACK_PLAN]] (gerçekleşme prosedürleri)
> Canlı sicil: yeni risk = yeni satır (append); kapanan risk satırı KALIR (`KAPANDI` + tarih). Execution sonrası dogfood: bu tablo `project_risks` tablosuna taşınır (DXB Global OS projesi kaydı altında) — o güne dek tek kaynak bu dosya.

## 1. Amaç

Tüm bilinen risklerin tek sicili: olasılık × etki, karşılık (önleme + gerçekleşirse), izleme sinyali, sahip spec. "Sürpriz yok" ilkesi: gerçekleşen her risk ya bu tabloda vardı ya da gerçekleştiği gün tabloya girer (geç kayıt da kayıttır).

## 2. Gereksinimler

- G1. Her satır: olasılık (D/O/Y), etki (D/O/Y/KRİTİK), karşılık, izleme sinyali, sahip.
- G2. Güvenlik riskleri SECURITY_MODEL §16 ile çelişemez (oradaki "kabul edilen yüzey" burada satır olarak görünür).
- G3. Risk kapanışı kanıt ister (hangi mekanizma devrede, hangi test koruyor).

## 3. Mimari (risk sınıfları)

T = teslimat/takvim · K = kalite/model · Ş = şema/veri · A = altyapı/kaynak · G = güvenlik (kabul edilen) · O = operasyon/insan.

## 4. RİSK TABLOSU (bağlayıcı sicil)

| ID | Sınıf | Risk | Olasılık | Etki | Karşılık (önleme → gerçekleşirse) | İzleme sinyali | Sahip |
|----|-------|------|----------|------|-----------------------------------|----------------|-------|
| R01 | T | Korpus bitti, execution 12'sine yetişmedi | O | Y | Değer-öncelikli E-sırası (shell+overview önce) → BACKUP_PLAN S1: Opus ilk ✓'siz adımdan | Roadmap ✓ hızı vs kalan gün | BACKUP_PLAN |
| R02 | T | Session kesintisi / safeguard duraklaması (compact bloğu emsali S525) | Y | O | Dalga/blok=atomik commit + INDEX/roadmap canlı durum → açılış protokolüyle kayıpsız devam | commit aralığı >2 saat | INDEX §Session |
| R03 | K | Opus penceresinde kalite düşüşü (mikro-implementasyon, edge refleksi) | O | O | Spec'lerde adım-başı kanıt + ⛔ kapıları + §38 ön-kontrol → RET döngüsü madde-bağlı düzeltme | L7 RET bulgular; test assert sayacı | BACKUP_PLAN §10 |
| R04 | K | Persona yazımı yetişmez (Fable-only, devredilemez) | O | Y | E5 erken paralel başlar (E4 sonrası hemen) → yetişmeyen "Fable-yazımı bekliyor" listesi; departman v2'siz AKTİVE EDİLMEZ | E5 sayım raporu | BACKUP_PLAN §1.6 |
| R05 | Ş | Kontrol düzlemi genişlemesi çekirdeği bozar | D | KRİTİK | Breaking-change yasağı + ekleme-yönlü migration + view-alias → revert + rollback blokları | L2 suite; smoke zinciri | DATA_MODEL §11 |
| R06 | Ş | Migration prod'da yarım kalır | D | Y | idempotent migration + boş-DB provası (L2) → RECOVERY §migration prosedürü | supabase push çıktısı | RECOVERY |
| R07 | A | 8GB VPS RAM tavanı aşılır | O | O | Yeni-servis-yok kuralı (R5; motor/hook/router hepsi kütüphane) → STACK.md fallback (servis eleme sırası) | System Health RAM eşiği %85 | SYS_ARCH R5 |
| R08 | A | Broadcast fırtınası UI/Realtime boğar | O | D | Kanal debounce (1s/5s) + sanal liste → poll fallback 30 sn | system kanalı düşen-yayın sayacı | EVENT_MODEL |
| R09 | A | Log hacmi diski doldurur | O | O | 180g retention + özet damıtma + tampon → prune; disk %80 alarm | System Health disk | AUDIT §25 |
| R10 | A | pg-boss transaction-pooling yanlış config (bilinen tuzak) | D | Y | STACK.md sert kural: session-mode 5432; L2 bağlantı testi → config düzelt, kuyruk DB'de kayıpsız | pg-boss bağlantı hatası | STACK.md |
| R11 | K | Token bütçesi execution sırasında tükenir (Fable penceresi) | O | Y | Kompakt cadence + inline tek akış (subagent yasağı zaten) → bütçe-fallback: Opus 4.8 + Fable planı | usage uyarıları | model-routing v6 |
| R12 | G | Tek-faktör CEO girişi (S1 kabul edilen) | D | Y | SECURITY sicil tetiği; para-çıkışı ayrı kapı telafisi → oturum iptali + anahtar rotasyonu | anomali: beklenmeyen approval/karar | SECURITY §16 |
| R13 | G | Bilinen bekleyen credential rotasyonu (S6 — bir kez sızmış token) | Y | O | CEO checklist kalemi; Outleteuro öncesi zorunlu gözden geçirme → rotasyon + eski anahtar 401 kanıtı | checklist durumu | SECURITY S6 |
| R14 | O | CEO göz testi RET (tasarım öznel kapısı) | O | O | Referans çapaları (A1, §3, Golden Threshold emsali) + §35 ön-kontrol → madde-bağlı RET döngüsü | E13.2 sonuçları | ACCEPTANCE §17 |
| R15 | O | İki session çakışması (çift terminal yazımı) | D | O | Tek-yazar kuralı (roadmap edge) → git çakışması çözümü, tablo mutabakatı | eşzamanlı commit'ler | ROADMAP §27 |
| R16 | T | Outleteuro'yu öne alma baskısı | D | O | Madde 17 hükmü + INDEX kaydı: holding bitmeden BAŞLAMAZ → CEO'ya hüküm hatırlatılır, kayıt gösterilir | görev kuyruğunda outleteuro kalemi | MASTER_PLAN §2 |
| R17 | Ş | `agents`→employees evrimi eski kod yollarını kırar | O | O | View-alias köprüsü + shared tipler tek nokta → alias'a dön, tip düzelt | typecheck + L1 | DATA_MODEL §23 |
| R18 | K | i18n eksik çeviri (EN birincil/TR tam — A2) | O | D | i18n-audit script her commit (missing: 0 kapısı) → eksik anahtar listesi kapatılır | L6 audit çıktısı | TEST L6 |
| R19 | A | memory-store/ repo şişmesi | D | D | 500MB eşik uyarısı → eski artifact'ler Storage Box arşivine | System Health + du | MEMORY §26 |
| R20 | O | Kabul edilen ekranlarda sonradan regresyon | O | O | Kabul dondurmaz — L5 senaryoları kabul edilen ekranları da korur → RET döngüsü yeniden | L5 koşuları | ACCEPTANCE §27 |
| R21 | K | Opus test assert'lerini gevşetir (sessiz kalite erozyonu) | D | Y | Assert-sayısı-düşemez kapısı + test diff'i evidence kapsamında → diff revert + yeniden yazım | sayaç denetimi | TEST §27 |
| R22 | T | Opus 5 Hook policy içeriği yetişmez (E10, persona ailesine bağlı) | O | O | Geçici çözüm kayıtlı: spawn-sarmalayıcı + policy tablosu v1 (BACKUP §6) → tam gates sonra | E10 durum | FABLE_5_HOOK |

## 5-12. Component/Backend/Frontend/API/Event/State/Tablolar/İlişkiler

Sicilin teknik varlığı yok; dogfood taşıması (execution sonrası): her satır `project_risks(project=dxb-global-os)` kaydına, ID korunarak. Taşıma sonrası bu dosya "taşındı" başlığıyla dondurulur, git'te kalır.

## 13. Yetkilendirme

Satır ekleme: Fable/Opus (execution sırasında görülen her yeni risk); satır kapatma: kanıtla, verdict eldeki en güçlü modelde; risk KABULÜ (yaşamayı seçmek): yalnız CEO.

## 14. Logging / 15. Audit

Sicil değişiklikleri git geçmişi; gerçekleşen risk olayları ayrıca `alerts`/audit zincirinde (canlı sistemde).

## 16. Security

G-sınıfı satırlar SECURITY_MODEL ile çift-kayıtlıdır (oradaki sicil "neden kabul edildi", buradaki satır "nasıl izleniyor"). Yeni güvenlik işi üretmezler (madde 4).

## 17-19. Error/Retry/Fallback

Gerçekleşen risk = önce tablodaki "gerçekleşirse" kolonu, sonra [[RECOVERY_AND_ROLLBACK_PLAN]] prosedürü. Panik-yaması yasak: prosedür dışı müdahale ancak veri kaybını durdurmak içindir ve ardından kayıt ister.

## 20. Test planı / 21. Acceptance criteria

Bu sicilin kabulü: 22 satır dolu (olasılık/etki/karşılık/izleme/sahip eksiksiz) + MASTER_PLAN §9'un 5 omurga riski kapsanmış (R01, R02, R03/R05, R07 eşlemesi) + SECURITY kabul-yüzeyi satırları mevcut (R12, R13).

## 22. Migration / 23. Rollback

Yok (kayıt dosyası); dogfood taşıması §5-12'de tanımlı.

## 24. Uygulama sırası (doğrulamalı)

```bash
grep -c "^| R[0-9]" HOLDING-OS-MASTER-PLAN/RISK_REGISTER.md    # → 22
grep -c "KAPANDI" HOLDING-OS-MASTER-PLAN/RISK_REGISTER.md      # → kapanış sayısı (zamanla artar)
```

## 25. Bağımlılıklar / 26. Riskler / 27. Edge case'ler

- Bağımlılık: yok (bağımsız sicil); izleme sinyalleri System Health/L-katmanları canlandıkça otomatikleşir.
- Meta-risk: sicilin bakımsız kalması → roadmap blok kapanışlarında "yeni risk var mı" kontrol maddesi (E-blok kapanış rutini).
- Edge: aynı olayın iki risk satırına düşmesi → satırlar birleştirilmez, çapraz-referanslanır; CEO'nun kabul ettiği riskin gerçekleşmesi → suçlama değil kayıt+prosedür (sicil kültürü).

## Opus-devralma notu

Tablo formatı sabit; Opus satır ekler, "gerçekleşirse" kolonunu uygular, kapanışı kanıtla önerir — kapanış verdict'i eldeki en güçlü modelde, risk kabulü CEO'da.

## Done definition (bu spec)

27 başlık ✓ · 22-satır sicil (6 sınıf; olasılık/etki/karşılık/izleme/sahip tam) ✓ · MASTER_PLAN §9 + SECURITY kabul-yüzeyi kapsandı ✓ · canlı-sicil + dogfood taşıma sözleşmesi ✓ · doğrulama komutu ✓
