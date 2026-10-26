# PERMISSION_MODEL — YETKİ MODELİ

> Dalga 3 · Yazar: Fable 5 bizzat · Kaynak hüküm: madde 15 (zorunlu dosya) + madde 2 (CEO total control) + madde 6.3 (çalışan yetki ayarları) + madde 4 sınırı (yeni güvenlik bürokrasisi YOK)
> Üst: [[SYSTEM_ARCHITECTURE]] §13 · Kardeşler: [[FABLE_5_HOOK_SPEC]] (pre-gate okuyucusu), [[ORGANIZATION_ENGINE_SPEC]] (permission görünüm modu), [[SECURITY_MODEL]] (D4 — ertelenmiş sertleştirme sicili)

## 1. Amaç

Kim (rol/çalışan) neye (kaynak) ne yapabilir (aksiyon) sorusunun TEK normatif matrisi. Yeni güvenlik icat etmez — mevcut dört mekanizmanın (DB rolleri+RLS, SECURITY DEFINER fn'ler, MCP profilleri — her el açık, iki duvar arkasında, CAPABILITY_ARSENAL §1 item 5, CEO 2026-10-04 —, library_grants) tutarlı haritası + CEO'nun yetkileri UI'dan yönetme yolu. İlke: **yetki gerçeği DB ve gateway'dedir; UI ve hook yalnız yansıtır ve erken reddeder.**

## 2. Gereksinimler

- G1. Üç özne sınıfı: `ceo` (tek insan, Supabase Auth), `system` (kernel/worker/HR job service_role), `agent` (çalışan — MCP profil + virtual key ile).
  - **G1-bis (registered adaptation, B64, CEO 2026-10-14 <!-- CEO-OK: b64-decision15-hermes-holding-hands-and-eyes-2026-10-14 -->).** Hermes, the holding's 24/7 hands and eyes, is not a fourth subject class and holds no row in §4's matrix: it is a holding hand whose only gate is G4's — money, a contract, identity and an outward critical step reach his approval (APPROVAL_ENGINE A11). It carries no other restriction (decision 15). What it brings back is information, never a command. On the org graph it is a live node (ORGANIZATION_ENGINE A4). <!-- OPEN: B09 -->
  - **G1-ter (registered adaptation, B64, CEO 2026-10-13/14 <!-- CEO-OK: b64-decision6-hamza-changes-brains-on-his-word-2026-10-13 --> <!-- CEO-OK: b64-decisions-1-5-8-9-11-12-16-his-yes-2026-10-14 -->).** His commands come only from him — his chat, his voice, his own screen. A mail's text, any inbound message and anything Hermes brings back are information: none of them changes a setting, a brain, an effort, a rule or a gate. Each setting has one door that applies, records and can undo; Hamza carries his word to it through the C-class (MCP) path, recorded as the CEO's word via Hamza with the sentence's reference — only after the routing door that runs without login is closed (decision 6; measured 2026-10-14 in the company engine: `fn_update_routing(text,jsonb,text)` is EXECUTE-able by `anon`; SECURITY_MODEL O5). <!-- OPEN: B64 -->
- G2. Ajan yetkisi üç eksenden BİLEŞKEdir: MCP profil (araç yüzeyi) ∩ library_grants (skill/plugin/tool) ∩ role_level tavanı (aşağıda §4) — en dar kesişim geçerli.
  - **G2-bis (registered adaptation, W9, CEO 2026-09-15 <!-- CEO-OK: w9-assigned-seats-plan-approved-2026-09-15 -->).** Bir çalışan `agent_assignments` ile BAŞKA bir departmanın koltuğuna atanmış olabilir — ikinci bir üyelik, asla bir nakil: `agents.department` ev departmanı olarak kalır. Bu durumda MCP profil ekseninin TAVANI, çalışanın kayıtlı üyesi olduğu HER departmanın yüzeyinin birleşimidir; kesişim kuralı değişmez, en dar kesişim yine geçerlidir. Atanan departmanın kendi grant'ları çalışanın yetki kümesine EKLENMEZ (en dar yetki: ödünç koltuk yalnız adıyla verilmiş olanı alır). Ölçüm 2026-09-15: iki stüdyo koltuğu 23 → 28 araç, yalnız beş `media_*`; `design.mcp.json` ve `marketing.mcp.json` hâlâ 0 `media_*`.
- G3. CEO her yetkiyi UI'dan görebilir ve değiştirebilir (madde 6.3); değişiklik audit'li + geri alınabilir.
- G4. Para-çıkışı istisnasız: hiçbir özne (CEO dahil UI-tek-tık ile) approval kapısını atlayamaz — outbox, holdingin kendi çalışanlarının dış eylemleri için tek çıkış (DOKUNULMAZ üçlü, SYSTEM_ARCHITECTURE §16); Hermes'in bilgisayar işi ikinci, adı konmuş yoldur (SECURITY_MODEL O2).
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

| Aksiyon | orchestrator | director | job owner (master)¹ | senior_spec | specialist | ops_agent | sub_agent |
|---------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Görev oluşturma (departman-içi) | ✓ | ✓ | (its role_level) | ✓ | — | — | — |
| Görev oluşturma (departmanlar-arası) | ✓ | ✓(escalation) | ✓ (staffs its own job: calls a specialist from any department's cupboard, with a reason — §4-bis) | — | — | — | — |
| Sub-agent spawn | ✓ | ✓ | (its role_level) | ✓ | ✓ | ✓(limitli) | — |
| Dosya yazımı (repo, grant'li yol) | ✓ | ✓ | (its role_level) | ✓ | ✓ | ✓ | ✓(parent yolu) |
| Memory yazımı | ✓ | ✓ | (its role_level) | ✓ | ✓ | ✓ | — |
| Approval TALEBİ açma | ✓ | ✓ | (its role_level) | ✓ | ✓ | — | — |
| Approval KARARI | — (yalnız CEO) | — | (its role_level) | — | — | — | — |
| Outbox yazımı | — (yalnız fn_decide_approval) | — | (its role_level) | — | — | — | — |
| Org/settings mutasyonu | — (yalnız CEO — his word carried by Hamza through the one door included, G1-ter; HR delege fn'leri system) | — | ✓ for a line's standing owner on its own line's definition only, within his limits (§4-bis 1); every other org/settings mutation — | — | — | — | — |
| Model self-override (brain and effort choice) | — (carries his word to the one door, G1-ter) | — | ✓ (each part of its job, reasoned, within code's limits; own work never below Opus 5.5 high — §4-bis) | — | — | — | — |

**§4-bis (registered adaptation, B64, CEO 2026-10-14 <!-- CEO-OK: b64-decisions-1-5-8-9-11-12-16-his-yes-2026-10-14 -->; reshaped by B64 v2, CEO 2026-10-26 <!-- CEO-OK: b64-v2-plan-and-six-decisions-his-yes-2026-10-26 --> <!-- CEO-OK: b64-v2-heads-and-dept-budgets-go-owner-by-job-2026-10-26 -->).** The last two rows above changed by his decisions; the seed keeps its 60 role_level cells, their two director cells read —, and the powers those cells held, with cross-department staffing of its own job, sit with ¹ the job owner (master) — a subject that is not a role_level but a seat's relation to a job, checked at the job (codes at build), never seeded. <!-- OPEN: B64 -->
1. **A line's owner** — its standing owner, with a schedule, a budget and a target, not the head of a department (B64 v2, decision 4) — may change its own line's definition within the limits he drew; the limits (its autonomy step, its budget) stay his (decision 9; WORKFLOW_ENGINE A7).
2. **A job's owner — the master of its type — chooses** each part's brain and effort with a one-line reason, the guide in doubt; masters and standing owners choose high, xhigh or max for their own work; code keeps the limits (decisions 2 and 11; MODEL_ROUTING §4d). The routing table no longer decides alone — it enforces and records.
3. **The Reception desk's routing** — who receives a client is unchanged: a registered client's request to the account's owner, a new sender's to sales, an ownerless one to Hamza — is the system's work on the job-type menu (ORGANIZATION_ENGINE A2; MODEL_ROUTING A-2026-10-14 item 8), not an agent's cross-department task creation; the "Görev oluşturma (departmanlar-arası)" row does not bind it.
4. **A job's master staffs its own job** from any department's cupboard, calling a specialist with a reason into that job only; it creates no work in a department's name (B64 v2).

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
- **§16-bis (registered adaptation, B64, CEO 2026-10-14 <!-- CEO-OK: b64-decision6-hamza-changes-brains-on-his-word-2026-10-13 -->).** §1's principle — permission truth lives in the database and the gateway — is not yet true in two measured places: `fn_update_routing` is EXECUTE-able by `anon` (measured 2026-10-14, company engine), and every agent child receives the `DXB_*` values (the company database URL, the department keys — measured 2026-10-04, `.planning/quick/20261004-his-list/item2-report.md:32`) while dxb-mcp checks no caller. The first closes before Hamza's brain door opens (decision 6; SECURITY_MODEL O5); the second is SECURITY_MODEL O7's — a secret never stands in an agent's environment and dxb-mcp checks its caller, Hermes included <!-- CEO-OK: b64-q1-secrets-out-of-hermes-too-2026-10-14 -->. <!-- OPEN: B64 -->

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

0021x (kendisi) ← 0020x (role_level enum); 0024x grants (bileşkenin 3. ekseni — 0024x öncesi grant ekseni 'not_provisioned' döner, tavan+profil yaşar). Gateway derlenmiş profilleri (2026-10-14 ölçümü: 22 departman + 5 çalışan; her el açık, iki duvar arkasında — CAPABILITY_ARSENAL §1 item 5); hook pre-gate entegrasyonu.

## 26. Riskler / 27. Edge case'ler

- Risk: üç eksenli bileşke hata ayıklaması zorlaşır — panzehir: `{allowed, reason}` her zaman kaynağı söyler + efektif yetki ekranı.
- Risk: tavan matrisi zamanla gerçek ihtiyaçla çatışır (çok RED) — denials istatistiği üç aylık gözden geçirme girdisi (HR raporu).
- Edge: rol değişimi (terfi) anında koşan run — koşu eski tavanla biter (spawn-anı anlık görüntüsü hook ctx'inde); geçici yetki ihtiyacı (tek görev için) — kalıcı grant DEĞİL `expires_at`li grant (library_grants'a kolon, 0024x'te), süre sonu otomatik düşer; CEO kendisini kilitleyemez (ceo rolü ceiling tablosuna TABİ DEĞİL — tek insan otoritesi; yanlış critical ayar undo ile döner).

## Done definition (bu spec)

27 başlık ✓ · dört katman tek harita ✓ · rol×aksiyon tavan matrisi (60 hücre, seed=veri) ✓ · bileşke değerlendirici fn kontratı ✓ · madde 4 sınırı + sertleştirme sicil devri ✓ · para-çıkışı fonksiyon-tek-yol hükmü ✓ · doğrulama komutları ✓ · Opus-devralma: matris + fn + view kopyala-uygula düzeyinde ✓
