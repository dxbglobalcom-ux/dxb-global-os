# HOLDING_OS_PRODUCT_SPEC — ÜRÜNÜN DOĞRU TANIMI

> Dalga 3 · Yazar: Fable 5 bizzat · Kaynak hüküm: madde 1 birebir (doğru tanım + ne-değildir) + madde 2 (izlemez, yönetir) + §39 son talimat
> Üst: [[MASTER_PLAN]] · Bu spec ürün SINIRLARININ sözlüğüdür — teknik derinlik kardeş spec'lerde; çelişkide iş-tanımı burada, teknik hüküm ilgili spec'te kazanır.

## 1. Amaç

DXB GLOBAL AI-NATIVE HOLDING OPERATING SYSTEM'in ürün tanımını tek yerde sabitlemek: ne olduğu, ne OLMADIĞI, CEO'nun 19 kontrol alanı, ürün-seviye kabul çizgisi. Her yeni özellik/ekran/spec bu tanıma karşı denetlenir — tanım dışı iş "scope creep" değil İHLALDİR (master-plan-fidelity).

## 2. Ne DEĞİLDİR (madde 1 birebir — ret listesi)

Admin panel · proje takip dashboard'u · approval ekranı · task manager · startup SaaS paneli · birkaç maliyet kartı + proje durumundan oluşan yüzeysel ekran · normal işletim sistemi. Bu kalıplardan birine benzeyen her teslim kabul REDDİDİR (§35 yasak listesiyle birlikte işler — DESIGN_SYSTEM/CEO_COMMAND_CENTER'daki jenerik-admin-panel yasağının ürün-seviye kökü).

## 3. Ne'dir — tek cümle + üç yüz

**Bütün holdingin yönetilmesi, izlenmesi, yapılandırılması, denetlenmesi, değiştirilmesi ve geliştirilmesi için merkezi executive command platformu.** Üç yüzü: (1) OTONOM İŞLETİM — şirket 7/24 kendi çalışır (anti-baby-sitting çekirdek değeri); (2) TAM GÖRÜNÜRLÜK — CEO her detaya sonsuz drill-down ile iner (madde 3B); (3) TAM KONTROL — CEO istediği anda her şeyi değiştirir (madde 2), mikro-yönetim ZORUNDA KALMADAN.

## 4. CEO'nun 19 kontrol alanı (madde 1 listesi → sistem karşılığı)

| # | Alan (direktif) | Sistem karşılığı (normatif spec) |
|---|-----------------|----------------------------------|
| 1 | Bütün şirketler | `companies` — ORGANIZATION_ENGINE |
| 2 | Bütün departmanlar | `departments` — ORGANIZATION_ENGINE |
| 3 | Bütün müdürler | `agents(role_level='director')` — ORG + HR |
| 4 | Bütün uzman çalışanlar | `agents` — ORG + HR + PERSONA |
| 5 | Bütün alt ajanlar | `agent_runs.parent_run_id` zinciri — ORCHESTRATION |
| 6 | Bütün projeler | `projects` — PROJECT_OPERATING_SYSTEM (D4) |
| 7 | Bütün görevler | `tasks` (mevcut) + Live Operations |
| 8 | Bütün model kullanımı | MODEL_ROUTING + decision_log |
| 9 | Bütün maliyetler | COST_CONTROL (11 boyut) |
| 10 | Bütün kararlar | `decision_log` — OBSERVABILITY |
| 11 | Bütün approval süreçleri | APPROVAL_ENGINE |
| 12 | Bütün workflow'lar | WORKFLOW_ENGINE (D4) |
| 13 | Bütün skill'ler | `library_items(kind='skill')` — HOLDING_LIBRARY (D4) |
| 14 | Bütün plugin'ler | `library_items(kind='plugin')` — HOLDING_LIBRARY |
| 15 | Bütün bilgi kaynakları | `library_items(kind='memory_source')` + MEMORY_ARCHITECTURE (D4) |
| 16 | Bütün memory yapıları | MEMORY_ARCHITECTURE (D4) |
| 17 | Bütün hata ve riskler | `alerts` + RISK_REGISTER (D5) |
| 18 | Bütün denetim kayıtları | `audit_log` + AUDIT_AND_LOGGING (D4) |
| 19 | Bütün arka plan aktiviteleri | `ops:live` + Live Operations |

Kural: her alan için "gör + incele + DEĞİŞTİR + kontrol et" dört fiili sağlanır; yalnız-görüntüleme alan bırakmak madde 2 ihlalidir. Değiştirme yolları control-plane fn aileleridir (ilgili spec'lerde); istisna tek: para-çıkışı her zaman onay kapılı (B7b).

## 5. Ürün ilkeleri (bağlayıcı, tüm spec'lerin üstünde)

- P0. **Revenue-First founding purpose (CEO directive 2026-07-16/17, [[00-CEO-DIRECTIVE-REVENUE-FIRST]]):** the Holding exists to conduct real economic activity and generate sustainable, **halal net profit** — discover opportunities, run them through digital employees, sell, measure, scale winners, stop losers, 24/7. The dashboard is the control surface, not the purpose. The objective is fixed; the Islamic boundaries are fixed and may never be debated, reinterpreted, or optimized around by any agent; the solution and portfolio are the Holding's responsibility. Normative machinery: [[REVENUE_ENGINE_SPEC]] (spec #32). P0 outranks P1–P7; every feature is additionally audited against "does this serve halal net profit generation?".
- P1. **Anti-baby-sitting:** CEO niyeti bir kez söyler; sistem uçtan uca yürütür; onay yalnız dışa-dönük eşiklerde (para/sözleşme/kimlik).
- P2. **Özet varsa detayı vardır:** hedefsiz özet render EDİLMEZ (Infinite Drill-Down — CEO_COMMAND_CENTER normatif haritası).
- P3. **Şema-önce:** DB'de karşılığı olmayan hiçbir veri ekranda yoktur; sahte metrik/dummy widget yasak (§35).
- P4. **Tek yazım seamı:** her mutasyon SECURITY DEFINER fn'den; audit'siz değişiklik imkânsız.
- P5. **Kayıt-dışı iş yok:** her koşu, karar, araç çağrısı, dosya değişimi kayıtlı (OBSERVABILITY G1).
- P6. **Kalite maliyete kurban edilmez:** token disiplini kaliteyi düşürerek DEĞİL israfı keserek (kernel gate, cache, compression) sağlanır.
- P7. **Tek insan, tam otorite:** CEO override her yerde; sistem CEO'yu engellemez, kayıt altına alır (hook §27 ilkesi).

## 6-10. Component/Backend/Frontend/API/Event bağlamı

Bu spec ürün sözlüğüdür; teknik karşılıklar: shell/rotalar CEO_COMMAND_CENTER, veri DATA_MODEL, akışlar ORCHESTRATION/WORKFLOW, olaylar EVENT_MODEL (D4). Burada tek normatif teknik hüküm: 19 alanın HER BİRİ ana navigasyonun 7 grubundan birinden ≤3 tıkla erişilir (bilgi mimarisi kabulü — CEO_COMMAND_CENTER rota tablosuna denetim maddesi olarak eklenir).

## 11. Database tabloları / 12. İlişkiler

§4 tablosundaki eşlemeler — yeni tablo YOK (bu spec tanım katmanı). Tanım-şema tutarlılık denetimi: 19 alanın her birinin şema karşılığı DATA_MODEL'de mevcut veya D4 spec'ine devirli (tablo yukarıda; devirliler: 6, 12-16, 18).

## 13. Yetkilendirme / 14. Logging / 15. Audit / 16. Security

PERMISSION_MODEL + OBSERVABILITY + AUDIT (D4) + SECURITY_MODEL (D4) normatif. Ürün-seviye hüküm: bu dört alan ürünün ÖZELLİĞİDİR, sonradan-eklenen katman değil — herhangi bir modül bu dördünden birine bağlanmadan teslim edilemez (kabul denetim maddesi).

## 17. Error handling / 18. Retry / 19. Fallback

Ürün-seviye hüküm: hata CEO'dan saklanmaz — her hata sınıflı (transient/policy/fatal), görünür (alerts), izlenebilir (run drill-down), ve mümkünse kendi kendini onarır (retry/fallback zincirleri ilgili spec'lerde). "Sessizce başarısız olan iş" P5 ihlalidir.

## 20. Test planı / 21. Acceptance criteria (ürün-seviye kabul çizgisi)

Modül testleri ilgili spec'lerde; ürün-seviye kabul (ACCEPTANCE_CRITERIA D5'in çatı maddeleri buradan türer):

- A1. Ret-listesi denetimi: teslim edilen sistem §2'deki 7 kalıptan hiçbirine indirgenemez (CEO göz testi + 19-alan kapsam kanıtı).
- A2. 19/19 alan: her alanda dört fiil (gör/incele/değiştir/kontrol) çalışır — alan-başı kanıt komutu ACCEPTANCE_CRITERIA'da.
- A3. Anti-baby-sitting smoke: CEO tek intent girer → sistem plan/görev/koşu/çıktı zincirini onay kapıları dışında insansız tamamlar (uçtan uca senaryo testi).
- A4. Drill-down bütünlüğü: rastgele seçilen 10 özet değerin 10'u da kaynağına iner (P2 kanıtı).
- A5. ≤3-tık erişim: 19 alanın rota derinliği denetimi (bilgi mimarisi scripti).

## 22. Migration planı / 23. Rollback planı

Uygulanabilir değil (tanım katmanı — kod/şema taşımaz). Tanım DEĞİŞİKLİĞİ ise en yüksek süreç eşiğindedir: ⛔ madde 1 tanımına dokunan her öneri = eldeki en güçlü model + CEO onayı + bu dosyada kayıtlı revizyon (sessiz tanım kayması yasak).

## 24. Uygulama sırası

Bu spec uygulanmaz, UYGULATIR: her dalga/faz kapanışında A1-A5 çizgisine karşı durum notu (IMPLEMENTATION_ROADMAP D5 her fazın çıkışına "ürün tanımı denetimi" maddesi koyar). Doğrulama komutu deseni:
```bash
grep -c "ORGANIZATION_ENGINE\|COST_CONTROL\|APPROVAL_ENGINE" HOLDING-OS-MASTER-PLAN/HOLDING_OS_PRODUCT_SPEC.md  # → ≥3 (eşleme tablosu canlı)
# 19-alan kapsam denetimi ACCEPTANCE_CRITERIA (D5) scriptine devredilir
```

## 25. Bağımlılıklar

Tüm korpus bu tanıma bağımlıdır (ters yön yok). D4/D5 spec'leri §4 devirli satırları doldurur — dolmayan devir = korpus tamamlanmamış (INDEX takibi).

## 26. Riskler / 27. Edge case'ler

- Risk: teslim baskısıyla ürünün §2 kalıplarına gerilemesi (deadline daralınca "basit panel yeter" refleksi) — panzehir: BACKUP_PLAN minimum kritik kapsamı bile A2'nin çekirdek alt kümesini korur (kapsam daraltma = alan sayısı düşürme DEĞİL, alan-içi derinlik kademesi).
- Risk: 19 alan eşit derinlikte sanılır — öncelik sırası madde 17 fazlarıdır (MASTER_PLAN); eşleme tablosu kapsamı, roadmap sırayı yönetir.
- Edge: yeni iş alanı doğar (20. alan) — tanım revizyon protokolünden geçer (⛔ §22-23); Outleteuro gibi alt-OS spawn'ları bu tanımın DIŞINDA ayrı ürün tanımı taşır (outleteuro-definition kaydı — holding OS şablonu miras alınır ama tanım bağımsız).

## Done definition (bu spec)

27 başlık ✓ · ne-değildir ret listesi (madde 1 birebir) ✓ · 19 alan → spec eşleme tablosu (dört-fiil kuralıyla) ✓ · 7 bağlayıcı ürün ilkesi ✓ · ürün-seviye kabul çizgisi A1-A5 ✓ · tanım-değişikliği ⛔ protokolü ✓ · Opus-devralma: bu dosya denetim sözlüğüdür — Opus her faz çıkışında A1-A5'e bakar, tanımı değiştiremez ✓
