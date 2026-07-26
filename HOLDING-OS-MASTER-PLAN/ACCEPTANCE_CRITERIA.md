# ACCEPTANCE_CRITERIA — DXB GLOBAL AI-NATIVE HOLDING OS

> Dalga 5 · Yazar: Fable 5 bizzat · Kaynak hüküm: direktif §38 (27 kabul şartı birebir) + §37 (10 ilk-teslim ekranı) + §35 (yasaklar — negatif kabul) + her spec'in done-definition'ı · Üst: [[MASTER_PLAN]] §10 · Kardeşler: [[TEST_STRATEGY]] (L7 protokolü), [[IMPLEMENTATION_ROADMAP]] E13
> İki tier bağlayıcı: **M** = makine-denetlenebilir (komut/test kanıtı) · **C** = CEO göz testi (⚠ hiçbir modele devredilemez) · **M+C** = ikisi birden.

## 1. Amaç

"Bitti"nin tek tanımı. §38'in 27 şartı ölçüm yöntemiyle eşlenir; modül-başı kabul kapıları toplanır; kabul oturumu protokolü sabitlenir. Bu dosya geçmeden ürün teslim İLAN EDİLEMEZ.

## 2. Gereksinimler

- G1. §38'in her maddesi bir tier + bir kanıt yoluna sahip (boş satır yok).
- G2. §35 yasak listesi negatif-kabul olarak denetlenir (varlığı RET sebebi).
- G3. Kabul kaydı kalıcı: oturum sonucu (kabul/RET + bulgular) bu dosyanın ekine işlenir ve commit'lenir.

## 3. Mimari (kabul zinciri)

```
Roadmap adım kanıtları (sürekli) → E13.1 makine turu (L1-L6 tam) → E13.2 CEO oturumu (L7)
  → RET: bulgu listesi → düzeltme → yeniden L7 (döngü) → KABUL: kayıt + commit
```

## 4. §38 KABUL MATRİSİ (27 şart — bağlayıcı)

| # | §38 şartı | Tier | Kanıt yolu |
|---|-----------|------|-----------|
| 1 | Sıradan admin paneline benzemiyor | C | CEO göz testi; referans: §3 görsel kalite refleksi |
| 2 | Yalnızca birkaç karta dayanmıyor | M+C | rota sayısı ≥26 + Overview widget yoğunluğu; CEO göz |
| 3 | Holding seviyesinde gerçek bilgi mimarisi | M+C | 7 nav grubu + 19 alan ≤3 tık denetimi (PRODUCT_SPEC hükmü) |
| 4 | CEO her detayın içine girebiliyor | M | Playwright drill-down zinciri: overview sayısı → satır → koşu → karar/araç/dosya |
| 5 | Ana ekran yoğun ama anlaşılır | C | CEO göz testi |
| 6 | Live operations görünür | M | `ops:live` canlı akış E2E kanıtı (≤5 sn) |
| 7 | Agent aktiviteleri görünür | M | agent_runs UI listesi gerçek koşuyla |
| 8 | Model kullanımı görünür | M | Model Orchestration Panel + koşu-başı model etiketi |
| 9 | Maliyet görünür | M | Cost sayfası cost_ledger gerçek verisiyle |
| 10 | Token kullanımı görünür | M | tokens_in/out kırılımı UI'da |
| 11 | Riskler görünür | M | project_risks + alerts UI |
| 12 | Approval'lar görünür | M | Approval Center kuyruk + geçmiş |
| 13 | Organizasyon yapısı görünür | M | org graph (≥ read-only) v_org_tree'den |
| 14 | CEO bütün ayarları değiştirebiliyor | M | settings_registry kapsam testi: kayıtlı her key UI'dan set+undo edilebilir |
| 15 | Widget sistemi özelleştirilebilir | M | layout persist E2E (kaydet → yeni oturum aynı) |
| 16 | Tasarım premium ve özgün | C | CEO göz testi; A1 ölçütü: "referans görselden güzel" |
| 17 | Desktop + ultrawide güçlü | M+C | 34" ultrawide viewport E2E render + CEO göz (çoklu ekran/TV modu dahil) |
| 18 | Renk sistemi ucuz görünmüyor | C | CEO göz; §5 palet uygunluğu |
| 19 | Gold dengeli | C | CEO göz; DESIGN_SYSTEM gold-kullanım kuralları ön-kontrol |
| 20 | UI flat görünmüyor | C | CEO göz; §6 malzeme sistemi |
| 21 | Materyal derinliği var | C | CEO göz |
| 22 | Tasarım sistemi tüm sayfalarda tutarlı | M+C | token-dışı renk/spacing lint taraması (hardcoded değer 0) + CEO göz |
| 23 | Ekranlar mockup değil, gerçek ürün | M | her widget gerçek sorgu — dummy data taraması 0 (kod grep + L5) |
| 24 | Her özet drill-down destekliyor | M | §38/4 ile aynı zincir, tüm özet sayılara genişletilmiş denetim listesi |
| 25 | Tasarım işlevi gizlemiyor | C | CEO göz |
| 26 | Görsellik bilgi yoğunluğunu zayıflatmıyor | C | CEO göz |
| 27 | (§35 negatif seti) jenerik şablon/çamur glow/neon/sahte metrik/pasif izleme YOK | M+C | §35 madde-madde ön-kontrol listesi (aşağıda §5) + CEO göz |

## 5. §35 NEGATİF KABUL (varlığı = otomatik RET)

Jenerik admin panel/SaaS şablonu görünümü · düz siyah + floating kartlar + boş lüks · sahte metrik/süs data/dummy widget · sadece 2-3 approval+maliyet kartı ana ekran · kahverengi/çamur glow, parlak neon, cyberpunk/gaming, ucuz glassmorphism, her-yer-altın · pasif izleme (değiştirilemeyen görünüm) · kısa/yüzeysel persona · çekirdek OS'a dokunma · uydurma logo. Denetim: E13.1'de kod/veri taraması (dummy 0, token-dışı renk 0) + E13.2'de göz.

## 6. §37 İLK-TESLİM EKRAN LİSTESİ (10 ekran — L7 oturum gündemi)

Executive Overview · Live Operations · Organization Intelligence · AI Employee Card · CEO Control Mode · Settings · Model Orchestration · Cost Intelligence · Approval Center · Project Command View. Her biri: gerçek veri + drill-down + en az bir mutasyon (Control Mode kapsamında) gösterir.

## 7. MODÜL-BAŞI KABUL (spec done-definition toplaması)

| Modül | Kilit kabul (spec'ten) |
|-------|------------------------|
| DATA_MODEL | boş DB sıralı push + idempotent + kısıt reddi üçlüsü (§18-22) |
| API_CONTRACTS | 8b envanteri: her eylem çalışır veya APPROVAL_REQUIRED; idempotency kanıtı |
| EVENT_MODEL | 8 kanal canlı + debounce ölçümü + reconnect tutarlılığı |
| WORKFLOW_ENGINE | 6.4'ün 17 kalemi UI'dan ayarlanır + snapshot + park≠retry kanıtı |
| MEMORY_ARCHITECTURE | 4 store canlı + scope izolasyonu + redact canary |
| HOLDING_LIBRARY | intake raporu + grant→gateway reddi uçtan uca |
| PROJECT_OS | dogfood proje Command View 19 alan + health kırılımı |
| SECURITY_MODEL | O1-O9 posture yeşil + fail-closed testleri |
| AUDIT_AND_LOGGING | 8+6+9 soru-sütun denetimi + append-only reddi |
| ORG/HR/PERSONA/HOOK/ROUTING/SETTINGS/APPROVAL/COST/OBSERVABILITY (D2-D3) | ilgili spec done-definition'ları — E-blok kapanışında adım kanıtlarıyla |

## 8-12. API / Event / State / Tablolar / İlişkiler

Kabul katmanının kendi teknik varlığı yok; kayıt düzeni: sonuçlar bu dosyanın "Kabul kayıtları" ekine (aşağıda §27 sonrası) tablo satırı olarak eklenir — tarih, kapsam, sonuç, bulgu listesi ref.

## 13. Yetkilendirme

Kabul verme yetkisi: makine-tier = kanıt komutları (kimse "geçti" diyemez, komut der); ürün kabulü = YALNIZ CEO. Hiçbir yazar (Opus 5 dahil) final kabulü CEO adına veremez (governance kuralı).

## 14. Logging / 15. Audit

Kabul oturumu bulguları numaralı liste (`AC-RET-001...`) olarak bu dosyaya; düzeltme commit'leri bulgu ID'si taşır. Oturum kaydı git geçmişinde.

## 16. Security

Kabul turu güvenlik kalemleri SECURITY_MODEL §20 kanıtlarıyla sınırlı (yeni tarama açılmaz — madde 4).

## 17-19. Error / Retry / Fallback (RET döngüsü)

RET ≠ başarısızlık; döngü sözleşmesi: bulgu listesi → önceliklendirme (CEO) → düzeltme → yeniden İLGİLİ maddeler (tam tur değil, RET edilen maddeler + regresyon şüphesi) → kayıt. Emsal: Faz-8 login RET → Golden Threshold redesign → bekleyen göz testi (bu döngünün ilk gerçek koşusu).

## 20. Test planı / 21. Acceptance criteria (meta)

Bu dosyanın kendi kabulü: §38 matrisi 27/27 dolu + §35 negatif listesi tam + §37 10 ekran gündemi + modül tablosu D1-D5 kapsıyor.

## 22. Migration / 23. Rollback

Yok (kayıt dosyası). RET sonrası geri dönüş IMPLEMENTATION_ROADMAP + RECOVERY prosedürleriyle.

## 24. Uygulama sırası (doğrulamalı)

```bash
grep -c "^| [0-9]" HOLDING-OS-MASTER-PLAN/ACCEPTANCE_CRITERIA.md   # → ≥27 (§38 matrisi tam)
# E13.1 makine turu: TEST_STRATEGY §24 komut seti → tümü yeşil
# E13.2 CEO oturumu: §37 gündemi + giriş bilgileri ÖNCEDEN teslim (Faz-8 ihlali tekrarlanmaz)
```

## 25. Bağımlılıklar / 26. Riskler / 27. Edge case'ler

- Bağımlılık: E1-E12 tamam; TEST_STRATEGY L1-L6 yeşil; CEO takvimi (göz testi insan-kapısı).
- Risk: C-tier maddelerin öznelliği → referans çapaları sabit (A1 "referanstan güzel", §3 refleksi, Golden Threshold emsali); RET bulguları spesifik madde numarasına bağlanır ("beğenmedim" değil "§38/18 RET: şu ekranda şu renk").
- Edge: 12'si gecesi L7 yapılamadıysa → ürün ⚠ UNVERIFIED teslim durumunda kalır, Opus penceresinde CEO oturumu ilk iş; kısmi kabul (bazı ekranlar ✓ bazı RET) → ekran-başı kayıt, kabul edilenler dondurulmaz (regresyon denetimi sürer).

## Opus-devralma notu

Matris ve protokol kapalı; Opus kabul KOŞTURUR (makine-tier komutları + oturum organizasyonu) ama kabul VEREMEZ. RET döngüsünde madde-bağlı düzeltme yapar, matrisi değiştiremez (⛔).

## Done definition (bu spec)

27 başlık ✓ · §38 27 madde tier+kanıt eşli ✓ · §35 negatif kabul ✓ · §37 oturum gündemi ✓ · modül-başı kabul toplaması ✓ · RET döngü sözleşmesi (Faz-8 emsalli) ✓ · kabul-kayıt düzeni ✓

---

## Kabul kayıtları (canlı ek — oturum sonuçları buraya)

| Tarih | Kapsam | Sonuç | Bulgular |
|-------|--------|-------|----------|
| 2026-07-18 ~20:55 | §37 10 ekran + §38 görsel maddeler (E13.2) | **CEO APPROVED (conditional)** | Kayıt bu dosyaya işlenmemişti; `IMPLEMENTATION_ROADMAP.md:160` verbatim onayı taşıyordu. **Denetim ikizi 2026-07-26 bu çelişkiyi yakaladı** (bu dosya "henüz oturum yok" derken yol haritası onaylı diyordu) — kayıt burada birleştirildi. Koşullu onayın şartları roadmap satırında. |
| 2026-07-26 ~23:30 | §38 makine-denetlenebilir bacaklar (27 kriterin M/M+C tarafı) | **AUDIT TWIN PASS 1 — kabul DEĞİL, kabul öncesi düşman denetimi** | Çapraz model (Codex `gpt-5.6-sol`, `-s read-only`) + 2 salt-okur Claude taraması. 14 çürütme, 3'ü doğrulandı ve AYNI TURDA düzeltildi: (1) §35 ihlali — `/design-preview` üretimde erişilebilirdi ve uydurma metrik gösteriyordu ("Active agents 24", "€4.12"), artık üretimde 404 + E2E kapısı; (2) `project_risks.title`/`note` Türkçe bacaksızdı (3 satır, /gov/risks + proje Command View), migration 20260726017000/017500 + purity kapısı; (3) overview widget'ında sabit "total" kelimesi. Kalanlar: 8 UNMEASURABLE (DB sandbox dışı + C-tier ⚠ modele devredilemez), 3 doğrulanmış yanlış alarm. Yazma kontrolü: `audit_log`/`tasks`/`agent_runs`/`opportunities` denetim öncesi = sonrası (26753/216/377/5). |
| — | §38 C-tier (11 madde) | ⚠ **CEO GÖZÜ BEKLİYOR** | Hiçbir modele devredilemez (§13). Denetçinin bu satırlardaki tek meşru işi "kimse doğrulanmış diye işaretlemiş mi" kontrolüydü — işaretlenmemiş. |
