# HR_OPERATING_SYSTEM_SPEC — AI ÇALIŞAN YAŞAM DÖNGÜSÜ

> Dalga 3 · Yazar: Fable 5 bizzat · Kaynak hüküm: madde 9 birebir ("HR yalnızca çalışan listesi göstermeyecek")
> Üst: [[SYSTEM_ARCHITECTURE]] · Kardeşler: [[ORGANIZATION_ENGINE_SPEC]] (org fn'leri), [[EMPLOYEE_PERSONA_STANDARD]] (üretim standardı), [[FABLE_5_HOOK_SPEC]] (otomatik donanım), [[MODEL_ROUTING_SPEC]] (model atama)

## 1. Amaç

HR = holding'in AI çalışan yaşam döngüsü motoru: oluşturma → donatma → deneme (probation) → aktif işletim (performans/eğitim/terfi) → askı/arşiv. Madde 9'un 22 modülü tek durum makinesi + fn ailesi + HR paneli olarak. Kritik hüküm: HR'ın yarattığı her çalışan OTOMATİK olarak tam donanımla doğar (hook, governance, security, cost, logging, quality, review) — donanımsız çalışan yaratmak İMKÂNSIZDIR (yol yoktur).

## 2. Gereksinimler — madde 9'un 22 modülü → mekanizma

| Modül (direktif) | Mekanizma |
|------------------|-----------|
| Çalışan oluşturma | `fn_hr_create_employee` — `draft` durumda doğar |
| Persona oluşturma · Sicil oluşturma | EMPLOYEE_PERSONA akışı (`fn_persona_submit` + sicil satırı otomatik) |
| Model atama · Departmana atama · Müdüre bağlama | create/move fn parametreleri (ORG fn'lerine delege — ikinci yazım yolu yok) |
| Yetki atama · Skill atama · Plugin atama · Tool erişimi | `library_grants` + MCP profil bağlama (`fn_hr_grant`) |
| Eğitim verme | eğitim paketi = persona revizyonu + library `training` item ataması; `training_needs` düşülür |
| Performans değerlendirme | günlük HR job'ı: run/violation/review verisinden KPI skoru → `performance_history` |
| Test görevleri | `fn_hr_assign_probation_task` — sandbox proje altında gerçek görev, sonucu değerlendirmeye girer |
| Probation süreci | durum makinesi `probation` aşaması (aşağıda §4) |
| Terfi | `fn_hr_promote` — role_level yükselir, persona revizyon görevi açılır, CEO onayı (director+ için) |
| Departman/Müdür/Model değişikliği | ORG/ROUTING fn'lerine delege + sicil `version_history` |
| Askıya alma · Devre dışı · Arşivleme · Yeniden aktive | durum makinesi geçişleri (ORG fn'leri) |

## 3. Mimari

```
HR panel (dashboard) ──→ /api/control/hr/* ──→ fn_hr_* (SECURITY DEFINER)
                                              ├─ delege: fn_org_*, fn_persona_*, grant fn
                                              └─ HR job'ları (pg-boss, mevcut kuyruk):
                                                  hr.performance_daily · hr.probation_check
                                                  hr.stale_persona_scan · hr.training_queue
```

Mevcut-varlık eşlemesi: `packages/hr` YENİ (kütüphane + job handler'ları — kernel worker İÇİNDE koşar, yeni resident servis YOK — R5); HR panel `(command)/org/hr` SIFIRDAN; tablolar 0020x org ailesi (yeni tablo gerekmiyor — durum `agents.employment_status`, geçmiş `employee_records`).

## 4. Veri modeli — yaşam döngüsü durum makinesi

```
draft ──(donanım tam + persona passed)──→ probation ──(değerlendirme PASS)──→ active
  │                                          │(FAIL → düzeltme turu veya)──→ archived
  │                                          └────────────────────────────→ suspended
active ⇄ suspended · active ──→ archived · archived ──(CEO kararı + gate yeniden)──→ probation
dormant: mevcut stok varsayılanı (DATA_MODEL) — HR akışına girmemiş kayıt; aktivasyona giden tek yol bu makine
```

Geçiş kuralları fn içinde: `draft→probation` yalnız donanım kontrol listesi TAM ise (§6); `probation→active` yalnız değerlendirme skoru eşiği (`settings 'hr.probation_pass_score'`) + persona `passed`; `→archived` aktif görev/koşu yokken (devir zorunlu). Her geçiş `audit_log` + `version_history` + Broadcast `org`.

## 5. Component yapısı

| Component | Konum | Etiket |
|-----------|-------|--------|
| `packages/hr` (fn sarmalayıcı + job handler + compiler/gate — PERSONA spec ile ortak paket) | yeni paket | YENİ |
| `fn_hr_create_employee`, `fn_hr_grant`, `fn_hr_assign_probation_task`, `fn_hr_evaluate`, `fn_hr_promote` | 0020x | YENİ |
| HR panel: kadro tablosu · yaşam döngüsü panosu · probation kuyruğu · eğitim kuyruğu · performans trendi | `(command)/org/hr` | SIFIRDAN |
| Çalışan oluşturma sihirbazı (tek akış: kimlik→org yeri→model→grant paketi→persona görevi) | HR panel içinde | SIFIRDAN |

## 6. Backend yapısı — otomatik donanım (madde 9 kritik hükmü)

`fn_hr_create_employee` TEK transaction'da şunları yaratır; herhangi biri eksikse transaction GERİ ALINIR (donanımsız çalışan yolu kapalı):

1. `agents` satırı (`draft`, role_level, department, manager) — ORG kurallarından geçer
2. `employee_records` iskeleti (sorumluluk/yetki alanları parametreden)
3. Hook bağlantısı: `hook_version` = güncel sürüm (FABLE_5_HOOK)
4. Grant paketi: rol şablonundan `library_grants` + MCP profil eşlemesi (PERMISSION_MODEL rol şablonları)
5. LiteLLM virtual key talebi (COST_CONTROL deseni; key alias `budgets` satırıyla)
6. Bütçe satırı: `budgets(scope='employee')` varsayılan limitlerle
7. Persona görevi: `fn_persona_submit` bekleyen iş olarak HR kuyruğuna (author dönem kuralı — G4)

Kontrol listesi sorgusu `v_hr_equipment_check(employee_id)` → 7 kalemin her biri boolean; `draft→probation` geçişi 7/7 ister.

## 7. Frontend yapısı

- Kadro tablosu: tüm çalışanlar durum/departman/model/performans/maliyet kolonlarıyla; her satır employee command page'e drill-down.
- Yaşam döngüsü panosu: durum makinesi kanban'ı (draft/probation/active/suspended/archived kolonları) — sürükleme YOK (geçişler kurallıdır; buton + gerekçe diyaloğu).
- Probation kuyruğu: bekleyen değerlendirmeler, test görevi sonuçları, skor önizleme.
- Boş durumlar DESIGN_SYSTEM standardı; sahte veri yasak.

## 8. API'ler / 9. Event yapısı / 10. State yönetimi

- `POST /api/control/hr/employees` (create) · `/hr/employees/{id}/probation-task` · `/evaluate` · `/promote` · `/grant` — kontrat standart `{ok, change_id, affected[]}`.
- Event: `org` kanalı (`employee.created`, `employee.probation_started`, `employee.activated`, `employee.promoted`, ORG olayları zaten var); HR job sonuçları önemliyse `alerts`.
- State: HR panel filtre/görünüm tercihi `settings_values(scope='ceo_dashboard')`.

## 11. Database tabloları / 12. İlişkiler

Yeni tablo YOK — org ailesi yeter (kanıt: 22 modülün tamamı §2 tablosunda mevcut şemaya eşlendi). `v_hr_equipment_check`, `v_hr_roster`, `v_hr_probation_queue` view'ları 0025x pakette.

## 13. Yetkilendirme

`fn_hr_*` çağrısı: `ceo` her şeyi; `system`(HR job'ları) yalnız değerlendirme/tarama fn'leri. Terfi ve director+ atamaları CEO onaylı (approval öğesi — `approval_rules` `hr.promote_director` gated). Çalışan oluşturma kuruluş döneminde CEO onaylı; işletimde `settings 'hr.autonomous_hiring'` (varsayılan false) ile serbestleşebilir — açılışı `risk='critical'` ayar.

## 14. Logging / 15. Audit

Tüm fn'ler audit'li (desen aynı). HR job'ları çalışmalarını `agent_runs` DEĞİL job log'una yazar (LLM koşusu değilse); LLM kullanan HR işleri (persona üretimi, derin review) NORMAL ajan koşusudur — HR çalışanı olarak kadrodadır, kendi personası vardır (HR de bu standarda tabi — öz-uygulama).

## 16. Security

Grant paketi rol şablonundan gelir — şablon dışı grant CEO onaylı (yetki genişlemesi = `risk='high'`). Arşivlenen çalışanın virtual key'i devre dışı + grant'leri düşer (fn içinde). Madde 4 sınırı: yeni kimlik bürokrasisi yok; bu spec'teki her kontrol mevcut desenlerin (grant, approval, audit) uygulamasıdır.

## 17. Error handling / 18. Retry / 19. Fallback

Create transaction'ı parçalı başarısızlıkta tam geri alınır (yedi adım tek atomik blok; LiteLLM key talebi DB-dışı olduğundan: önce DB commit `key_pending` işaretiyle, key job'ı retry'lı tamamlar — eventual, çalışan `draft`ta bekler, probation'a key'siz geçemez). Değerlendirme job'ı hata verirse kuyrukta kalır (pg-boss retry), probation süresi otomatik uzar (çalışan cezalandırılmaz).

## 20. Test planı

- Durum makinesi: tüm geçerli geçişler + tüm geçersiz geçiş redleri (matris testi).
- Donanım atomikliği: 7 adımın her birinin yapay hatasında transaction rollback kanıtı.
- Probation: skor eşiği sınır vakaları (tam eşik, altı, üstü).
- Delege bütünlüğü: HR üzerinden departman değişimi ORG fn'inin audit izini üretir (çift yol olmadığının kanıtı).

## 21. Acceptance criteria

- Donanımsız aktif çalışan İMKÂNSIZ: `SELECT count(*) FROM agents WHERE employment_status IN ('probation','active') AND id NOT IN (SELECT employee_id FROM v_hr_equipment_check WHERE all_ok)` → 0.
- HR panelinden uçtan uca işe alım: sihirbaz → draft → donanım → persona → gate → probation görevi → değerlendirme → active; her adımın DB izi (denetim scripti tek komutla listeler).
- 22 modülün her birinin UI karşılığı HR panelinde erişilebilir (modül-buton eşleme listesi; eksik = kabul reddi).

## 22. Migration planı / 23. Rollback planı

fn'ler + view'lar 0020x/0025x içinde; yeni tablo yok → rollback = fn/view DROP. HR panel rotaları fn'siz 501 (açık hata deseni). Job'lar `hr.*` prefix'iyle izole — geri alışta pg-boss'tan schedule silinir, kuyruk kirlenmez.

## 24. Uygulama sırası (adım-başı doğrulama)

```bash
# 1. fn ailesi
psql "$DB" -c "\df fn_hr_*" | grep -c fn_hr                      # → 5
# 2. atomiklik kanıtı (test)
pnpm --filter hr test -- --grep "create rollback"                 # → yeşil
# 3. uçtan uca işe alım (staging)
pnpm --filter hr run demo:hire                                    # → çıktıda 7/7 equipment + probation task id
psql "$DB" -c "SELECT employment_status FROM agents WHERE id='<yeni>';"  # → probation
# 4. HR job schedule
psql "$DB" -c "SELECT name FROM pgboss.schedule WHERE name LIKE 'hr.%';" # → 4 satır
```

## 25. Bağımlılıklar

0020x org + persona standardı (aktivasyon kilidi) + FABLE_5_HOOK (hook_version) + 0021x (settings eşikleri, model_catalog) + 0024x library (grant'ler — 0024x'ten önce grant adımı `pending_library` işaretiyle geçer, probation 0024x sonrası). MODEL_ROUTING `role_slot='hr'`.

## 26. Riskler / 27. Edge case'ler

- Risk: HR-factory persona kalitesi (Opus dönemi) — panzehir: şablon + mekanik kapı + CEO örneklem onayı (PERSONA §26 sıralaması); kalite düşüşü trendi HR panelinde metrik.
- Risk: performans skoru oyunlaşır (ajan skoru şişirecek davranış öğrenir) — skor formülü çok-kaynaklı (run başarı + hook ihlal + review + maliyet verimi), formül `settings`te CEO-görünür.
- Edge: müdür arşivlenirken ekibi (yetim-müdür kuralı ORG'da — HR devir sihirbazı zinciri yeniden bağlar); probation'da süresiz kalma (`hr.probation_max_days` aşımı alert + otomatik değerlendirme zorlaması); tüm departman askıya alınırsa (workflow'ları da duraklar — ORCHESTRATION dispatch departman durumunu okur); ilk kuruluş kadro yüklemesi — 153 legacy + Fable'ın olmazsa-olmaz ekleri (EMPLOYEE_PERSONA_STANDARD G7, CEO sözlü ek hükmü 2026-07-10) — (toplu import YOK — her çalışan aynı sihirbaz yolundan, script'lenmiş ama aynı fn'lerle; kayıt-dışı yol açılmaz).

## Done definition (bu spec)

27 başlık ✓ · 22 modül → mekanizma eşleme tablosu ✓ · durum makinesi + geçiş kuralları ✓ · otomatik donanım 7-adım atomik listesi (madde 9 kritik hükmü) ✓ · delege deseni (ORG/PERSONA/ROUTING'e — çift yazım yolu yok) ✓ · KALIR/YENİ eşleme ✓ · doğrulama komutları ✓ · Opus-devralma: fn listesi + durum makinesi + view adları kopyala-uygula düzeyinde ✓
