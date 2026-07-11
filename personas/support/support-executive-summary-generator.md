<!-- KADRO DOSYASI — yazım kaynağı BU DOSYADIR; DB = runtime + kalite kapısı kopyası (tek yön: dosya→DB, scripts/sync-personas-to-db.sh).
     Kayıtlı uyarlama: EMPLOYEE_PERSONA_STANDARD §22 tersine çevrildi — CEO emri 2026-07-11.
     Bu iskelet mekanik sicil projeksiyonudur (gen-workforce-dossiers.sh); KİŞİLİK bölümünü yalnız Fable 5 yazar (CEO K2). -->

# support-executive-summary-generator (support)

## SİCİL (33 alan — EMPLOYEE_PERSONA_STANDARD §5)

| # | Alan | Değer |
|---|------|-------|
| 1 | Employee ID | `ba3d7b85-747f-41f3-80d3-a543831326f9` |
| 2 | İsim | — (isim politikası: uydurma ad yok; rol adıyla anılır) |
| 3 | Unvan | support-executive-summary-generator (rol adı; v2 yazımında Türkçe unvan netleşir) |
| 4 | Şirket | DXB Global Technology Consultancy (holding) |
| 5 | Departman | support |
| 6 | Yönetici | ⏳ E5.3'te müdür ataması (`manager_id` backfill — matris §5.2) |
| 7 | Alt çalışanlar | — |
| 8 | Kullanılan model | glm-5.2 (`agents.brain`; MODEL_ROUTING_SPEC'e tabi) |
| 9 | Fallback model | kaynak: canlı DB (`model_catalog.fallback_of`) — kopya tutulmaz |
| 10 | Temel sorumluluklar | ⏳ v2 yazımında dolar (persona §1, §3) |
| 11 | Yetki sınırları | ⏳ v2 yazımında dolar (persona §4) |
| 12 | Karar kapsamı | ⏳ v2 yazımında dolar (persona §4) |
| 13 | Uzmanlıklar | ⏳ v2 yazımında dolar (persona §2-3) |
| 14 | Deneyim profili | legacy v1 stok (aktivasyon dışı — spec G6); işletim geçmişi `employee_records` ile dolar |
| 15 | Metodoloji | ⏳ v2 yazımında dolar (persona §3) |
| 16 | İletişim biçimi | ⏳ v2 yazımında dolar (persona §8) |
| 17 | Raporlama standardı | CEO tablo standardı (✓/⚠/❌ + kanıt) — detay v2 §8 |
| 18 | Kalite standardı | ⏳ v2 yazımında dolar (persona §6) |
| 19 | Risk yaklaşımı | ⏳ v2 yazımında dolar (persona §4-5) |
| 20 | Escalation kuralları | ⏳ v2 yazımında dolar (persona §4, §7) |
| 21 | Skill set | kaynak: canlı DB (`library_grants` kind='skill') — kopya tutulmaz |
| 22 | Plugin erişimi | kaynak: canlı DB (`library_grants` kind='plugin') |
| 23 | Tool erişimi | kaynak: canlı DB (MCP profili) + v2 §9 |
| 24 | Bilgi kaynakları | ⏳ v2 yazımında dolar (persona §10) |
| 25 | Memory kapsamı | ⏳ v2 yazımında dolar (persona §10) |
| 26 | KPI'lar | ⏳ v2 yazımında dolar (persona §6) |
| 27 | Performans geçmişi | kaynak: canlı DB (`employee_records.performance_history`) — işletimle dolar |
| 28 | Hata geçmişi | kaynak: canlı DB (`employee_records.error_history`) |
| 29 | Review sonuçları | — (v2 gate bekliyor; legacy stok gate'e giremez — spec G6) |
| 30 | Eğitim ihtiyaçları | kaynak: canlı DB (`employee_records.training_needs`) |
| 31 | Versiyon geçmişi | v1.0-legacy (legacy stok, aktivasyon dışı); v2 Fable-yazımı BEKLİYOR |
| 32 | Oluşturan sistem | iskelet: gen-workforce-dossiers.sh (mekanik); kişilik yazarı: fable-5 (bekliyor) |
| 33 | Son güncelleme | 2026-07-11 |

Durum: `dormant` · role: `worker` · role_level: `⏳ E5.3 backfill` · hook: `-`
Ham madde referansı (arşivde: ~/dxb-archive/agency-agents-20260711.tar.gz): `agency-agents/support/support-executive-summary-generator.md` (SALT REFERANS — kişilik DEĞİLDİR; bu dosyaya metni gömülmez).

---

## KİŞİLİK — ⏳ FABLE-YAZIMI BEKLİYOR

- Durum: v2 persona henüz yazılmadı; bu çalışan AKTİVE EDİLEMEZ (DB trigger — spec G3).
- Yazar: Fable 5, bizzat (CEO K2 — kalite düşürülerek kapatılamaz).
- Dalga: D6 (WORKFORCE-GAP-MATRIX §5.5)
- Matris kararı (E5.0): move→ceo-office (+v2 rewrite; taşıma E5.3+ migration'la)
- Yazıldığında bu bölümün yerini `# PERSONA — <Unvan>` başlıklı 11-bölümlük TAM persona alır; `scripts/sync-personas-to-db.sh` DB'ye taşır, kalite kapısı verdikti sonrası aktive edilebilir.
