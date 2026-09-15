# PERMISSION_MODEL — YETKİ MODELİ

> Dalga 3 · Yazar: Fable 5 bizzat · Kaynak hüküm: madde 15 (zorunlu dosya) + madde 2 (CEO total control) + madde 6.3 (çalışan yetki ayarları) + madde 4 sınırı (yeni güvenlik bürokrasisi YOK)
> Üst: [[SYSTEM_ARCHITECTURE]] §13 · Kardeşler: [[FABLE_5_HOOK_SPEC]] (pre-gate okuyucusu), [[ORGANIZATION_ENGINE_SPEC]] (permission görünüm modu), [[SECURITY_MODEL]] (D4 — ertelenmiş sertleştirme sicili)

## 1. Amaç

Kim (rol/çalışan) neye (kaynak) ne yapabilir (aksiyon) sorusunun TEK normatif matrisi. Yeni güvenlik icat etmez — mevcut dört mekanizmanın (DB rolleri+RLS, SECURITY DEFINER fn'ler, MCP least-privilege profiller, library_grants) tutarlı haritası + CEO'nun yetkileri UI'dan yönetme yolu. İlke: **yetki gerçeği DB ve gateway'dedir; UI ve hook yalnız yansıtır ve erken reddeder.**

## 2. Gereksinimler

- G1. Üç özne sınıfı: `ceo` (tek insan, Supabase Auth), `system` (kernel/worker/HR job service_role), `agent` (çalışan — MCP profil + virtual key ile).
- G2. Ajan yetkisi üç eksenden BİLEŞKEdir: MCP profil (araç yüzeyi) ∩ library_grants (skill/plugin/tool) ∩ role_level tavanı (aşağıda §4) — en dar kesişim geçerli.
  - **G2-bis (registered adaptation, W9, CEO 2026-09-15 <!-- CEO-OK: w9-assigned-seats-plan-approved-2026-09-15 -->).** Bir çalışan `agent_assignments` ile BAŞKA bir departmanın koltuğuna atanmış olabilir — ikinci bir üyelik, asla bir nakil: `agents.department` ev departmanı olarak kalır. Bu durumda MCP profil ekseninin TAVANI, çalışanın kayıtlı üyesi olduğu HER departmanın yüzeyinin birleşimidir; kesişim kuralı değişmez, en dar kesişim yine geçerlidir. Atanan departmanın kendi grant'ları çalışanın yetki kümesine EKLENMEZ (en dar yetki: ödünç koltuk yalnız adıyla verilmiş olanı alır). Ölçüm 2026-09-15: iki stüdyo koltuğu 23 → 28 araç, yalnız beş `media_*`; `design.mcp.json` ve `marketing.mcp.json` hâlâ 0 `media_*`.
- G3. CEO her yetkiyi UI'dan görebilir ve değiştirebilir (madde 6.3); değişiklik audit'li + geri alınabilir.
- G4. Para-çıkışı istisnasız: hiçbir özne (CEO dahil UI-tek-tık ile) approval kapısını atlayamaz — outbox tek çıkış (DOKUNULMAZ üçlü, SYSTEM_ARCHITECTURE §16).
- G5. Madde 4: bu model yeni kimlik/mekanizma EKLEMEZ; sertleştirme adayları SECURITY_MODEL siciline.

## 3. Mimari — dört katman tek matris

```
Katman 1  DB rolleri + RLS         kim hangi TABLOYU okur/yazar (yazım: yalnız fn)
Katman 2  SECURITY DEFINER fn'ler  hangi MUTASYON kime açık (fn içi rol kontrolü)
Katman 3  MCP profiller (gateway)  hangi ARAÇ yüzeyi hangi ajana (14 mevcut profil KALIR)
Katman 4  library_grants           hangi skill/plugin/tool/bilgi hangi çalışana (CEO ayarlar)
```

Mevcut-varlık eşlemesi: Katman 1-3 KALIR (0014 RLS deseni yeni tablolara kopyalanır); Katman 4 YENİ (0024x); rol tavanı matrisi YENİ (aşağıda — kod değil VERİ: `permission_ceilings` seed'i).

## 4. Veri modeli — rol tavanı matrisi (normatif çekirdek)

`role_level` başına yapılabilecek aksiyonların TAVANI (grant bile tavanı aşamaz):

| Aksiyon | orchestrator | director | senior_spec | specialist | ops_agent | sub_agent |
|---------|:---:|:---:|:---:|:---:|:---:|:---:|
| Görev oluşturma (departman-içi) | ✓ | ✓ | ✓ | — | — | — |
| Görev oluşturma (departmanlar-arası) | ✓ | ✓(escalation) | — | — | — | — |
| Sub-agent spawn | ✓ | ✓ | ✓ | ✓ | ✓(limitli) | — |
| Dosya yazımı (repo, grant'li yol) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓(parent yolu) |
| Memory yazımı | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Approval TALEBİ açma | ✓ | ✓ | ✓ | ✓ | — | — |
| Approval KARARI | — (yalnız CEO) | — | — | — | — | — |
| Outbox yazımı | — (yalnız fn_decide_approval) | — | — | — | — | — |
| Org/settings mutasyonu | — (yalnız CEO; HR delege fn'leri system) | — | — | — | — | — |
| Model self-override | — (routing tablosu karar verir) | — | — | — | — | — |

```sql
-- 0021x içinde (kontrol ailesi)
CREATE TABLE permission_ceilings (
  role_level text NOT NULL,
  action text NOT NULL,             -- yukarıdaki satır anahtarları
  allowed boolean NOT NULL,
  condition text,                   -- 'escalation' | 'limitli' | 'parent yolu' makine-okur kodu
  PRIMARY KEY (role_level, action)
);
```

Tavan matrisi VERİDİR: CEO görür ama satır değişimi `risk='critical'` ayardır (yetki mimarisi değişimi — ⛔ eldeki en güçlü model + CEO onayı protokolü UI'da bu ekrana bağlanır).

## 5. Component yapısı

| Component | Konum | Etiket |
|-----------|-------|--------|
| `permission_ceilings` + seed | 0021x | YENİ |
| `fn_permission_check(employee_id, action, resource)` — bileşke değerlendirici | 0021x | YENİ |
| Yetki matrisi UI (rol×aksiyon ısı haritası + çalışan-başı efektif yetki) | `(command)/gov/permissions` | SIFIRDAN |
| Org graph permission modu (ORG §12 `v_org_overlay_permission`) | ORG spec'te | — |
| Employee Settings yetki bölümü (madde 6.3 alanları) | SETTINGS spec rotası | — |

## 6. Backend yapısı

`fn_permission_check` değerlendirme sırası (kısa devre): employment_status aktif mi → rol tavanı → grant var mı (Katman 4, kaynak türüne göre) → koşul kodu (escalation/limit) → sonuç `{allowed, reason}`. Çağıranlar: hook pre-gate (spawn öncesi), gateway (araç çağrısı öncesi kendi profil kontrolüne EK değil — gateway profili zaten dar; fn yalnız grant-türü kaynaklarda devreye girer), control-plane fn'leri (delege kontrol). Sonuç 60sn cache (settings deseniyle; grant değişimi Broadcast'la düşürür).

## 7. Frontend yapısı

- Isı haritası: satır=rol, kolon=aksiyon; hücre tıklanır → koşul + istisna listesi.
- Çalışan-başı efektif yetki: üç eksenin kesişimi TEK listede ("bu çalışan şu an ne yapabilir") — kaynağıyla (tavan mı, grant mı, profil mi kısıtlıyor). Drill-down: kısıt kaynağına gider (grant ise library, profil ise gateway config görünümü).
- Değişiklik akışları SETTINGS/HR ekranlarına bağlanır — yetki UI'ı KENDİ mutasyon yolu açmaz (görünüm + yönlendirme).

## 8. API'ler / 9. Event yapısı / 10. State yönetimi

- Read: `v_effective_permissions(employee_id)` view'ı; RSC.
- Mutasyon YOK (bu spec'te) — grant mutasyonu HR/`fn_hr_grant`, ceiling mutasyonu `fn_set_setting` benzeri tek fn (`fn_set_ceiling`, critical-risk).
- Event: grant/ceiling değişimi `settings` kanalında (`permission.changed`) — cache düşürme + UI tazeleme.

## 11. Database tabloları / 12. İlişkiler

`permission_ceilings` (üstte) + mevcut `library_grants` (0024x) + RLS politika seti. İlişki: `v_effective_permissions` = ceilings ⋈ grants ⋈ gateway profil eşlemesi (profil eşlemesi config'ten DB'ye YANSITILIR: `mcp_profiles` okuma-tablosu, deploy'da senkron — çift kaynak değil, config kaynak gerçek, tablo projeksiyon).

## 13. Yetkilendirme (öz-referans)

Bu spec'in kendi nesneleri: ceilings okuma herkese (ajan kendi tavanını bilir — hook enjekte eder); yazma yalnız CEO critical-ayar yoluyla. `v_effective_permissions`: CEO tümü, müdür ekibi, çalışan kendisi.

## 14. Logging / 15. Audit

Her RED `fn_permission_check` tarafından loglanır (`hook_violations` DEĞİL — ayrı hafif sayaç `permission_denials`: employee, action, reason, count/gün toplamalı). Süreğen red deseni (aynı çalışan aynı aksiyon ≥10/gün) HR alert'i — ya yetki eksik (grant ver) ya görev tanımı yanlış (persona düzelt): ikisi de insan-görünür karar.

## 16. Security

- Derin savunma sırası değişmez: gateway profili (dar araç yüzeyi) her zaman aktif; fn/hook kontrolleri EK katmandır — hiçbiri diğerinin yerine geçmez.
- Ertelenen sertleştirmeler (SECURITY_MODEL siciline): satır-imzalı audit, kolon şifreleme, ceiling değişiminde 2-kişi kuralı (tek CEO — uygulanamaz, sicile "N/A tek-insan" notuyla), MFA (CEO kararıyla kapalı).
- Para-çıkışı: bu matriste 'Outbox yazımı' satırının tek ✓'sü `fn_decide_approval` fonksiyonudur — rol DEĞİL fonksiyon; DB grant kanıtı APPROVAL_ENGINE'de.

## 17. Error handling / 18. Retry / 19. Fallback

`fn_permission_check` erişilemezse (DB down): gateway profili tek başına yaşar (araç yüzeyi zaten dar) ama YENİ spawn fail-closed (hook zinciri). Cache bayatlığı en fazla 60sn — grant DARALTMASI acilse Broadcast + cache düşürme anında; genişletme gecikmesi zararsız.

## 20. Test planı

- Matris testi: 6 rol × 10 aksiyon = 60 hücrenin tamamı assert (seed doğruluğu).
- Bileşke testi: tavan ✓ + grant yok → RED; tavan — + grant var → RED (tavan kazanır); üçü ✓ → PASS.
- RLS testi: `agent` bağlantısı başka departman satırı okuyamaz (0014 desen kopyası kanıtı).
- Outbox tek-yol: doğrudan INSERT → permission denied (APPROVAL_ENGINE testiyle ortak).

## 21. Acceptance criteria

- `SELECT count(*) FROM permission_ceilings` → 60 (tam matris seed'li).
- Efektif yetki ekranı herhangi bir çalışan için üç ekseni kaynak etiketiyle listeler (⚠ görsel kabul CEO göz testi).
- Süreğen-red alert'i: test çalışanına 10 red üretilir → HR alert satırı düşer (SQL kanıt).

## 22. Migration planı / 23. Rollback planı

0021x: tablo + seed + 2 fn (`fn_permission_check`, `fn_set_ceiling`) + `permission_denials`. Rollback: DROP'lar; fn_permission_check yokluğunda hook pre-gate yetki adımını `unavailable` sayar → fail-closed (sessiz genişleme İMKÂNSIZ).

## 24. Uygulama sırası (adım-başı doğrulama)

```bash
psql "$DB" -c "SELECT count(*) FROM permission_ceilings;"                     # → 60
psql "$DB" -c "SELECT fn_permission_check('<uzman>','approval_decision',NULL);" # → {allowed:false, reason:'ceo_only'}
pnpm --filter shared test -- --grep "permission composite"                     # → yeşil
psql "$DB" -c "SET ROLE agent_profile_x; SELECT count(*) FROM agents;"         # → yalnız kendi departmanı (RLS kanıtı)
```

## 25. Bağımlılıklar

0021x (kendisi) ← 0020x (role_level enum); 0024x grants (bileşkenin 3. ekseni — 0024x öncesi grant ekseni 'not_provisioned' döner, tavan+profil yaşar). Gateway 14 profil (mevcut); hook pre-gate entegrasyonu.

## 26. Riskler / 27. Edge case'ler

- Risk: üç eksenli bileşke hata ayıklaması zorlaşır — panzehir: `{allowed, reason}` her zaman kaynağı söyler + efektif yetki ekranı.
- Risk: tavan matrisi zamanla gerçek ihtiyaçla çatışır (çok RED) — denials istatistiği üç aylık gözden geçirme girdisi (HR raporu).
- Edge: rol değişimi (terfi) anında koşan run — koşu eski tavanla biter (spawn-anı anlık görüntüsü hook ctx'inde); geçici yetki ihtiyacı (tek görev için) — kalıcı grant DEĞİL `expires_at`li grant (library_grants'a kolon, 0024x'te), süre sonu otomatik düşer; CEO kendisini kilitleyemez (ceo rolü ceiling tablosuna TABİ DEĞİL — tek insan otoritesi; yanlış critical ayar undo ile döner).

## Done definition (bu spec)

27 başlık ✓ · dört katman tek harita ✓ · rol×aksiyon tavan matrisi (60 hücre, seed=veri) ✓ · bileşke değerlendirici fn kontratı ✓ · madde 4 sınırı + sertleştirme sicil devri ✓ · para-çıkışı fonksiyon-tek-yol hükmü ✓ · doğrulama komutları ✓ · Opus-devralma: matris + fn + view kopyala-uygula düzeyinde ✓
