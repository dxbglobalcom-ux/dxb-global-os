# EMPLOYEE_PERSONA_STANDARD — PERSONA VE ÇALIŞAN SİCİLİ STANDARDI

> Dalga 3 · Yazar: Fable 5 bizzat · Kaynak hüküm: madde 8 birebir ("hiçbir çalışan rastgele, kısa veya yüzeysel prompt ile oluşturulamaz") + CEO emri 2026-07-07: TÜM personalar Fable v2 — legacy persona sistemde YAŞAYAMAZ
> Üst: [[SYSTEM_ARCHITECTURE]] · Şema: [[DATA_MODEL]] §4.1 (`personas`, `employee_records`) · Kardeşler: [[HR_OPERATING_SYSTEM_SPEC]] (üretim akışı), [[FABLE_5_HOOK_SPEC]] (bağlantı)

## 1. Amaç

Her çalışanın iki belgelik kurumsal kimliği: **persona** (nasıl düşünür ve çalışır — system prompt'un kaynağı) ve **sicil / employee record** (kurumsal kayıt — yetki, kapsam, geçmiş). Bu spec ikisinin ZORUNLU şablonunu, kalite kapısını, sürümleme ve derleme kurallarını sabitler. Yüzeysel persona üretimi bu şablona karşı mekanik + örneklem denetimle engellenir.

## 2. Gereksinimler

- G1. Persona şablonu madde 8'in 11 bölümünü birebir kapsar (aşağıda §4 şablon).
- G2. Sicil, madde 8'in 33 alanını birebir kapsar (DATA_MODEL `employee_records` + `agents` kolonlarına eşlenmiş — §5 eşleme tablosu).
- G3. Kalite kapısı: `quality_gate='passed'` olmadan persona hiçbir çalışanı AKTİVE EDEMEZ (DB trigger — DATA_MODEL 4.1 kuralı).
- G4. Yazarlık: ilk kuruluş dönemi personalarının TAMAMI Fable 5 bizzat (CEO emri — `author='fable-5'`). Sonraki dönem HR üretimi (`author='hr-factory'`) ancak bu şablonla ve kalite kapısıyla; HR'ın kullandığı üretici model MODEL_ROUTING `role_slot='hr'` kuralına tabidir.
  - **G4-bis (registered adaptation, 2026-07-27 — U20 + U30 alignment).** The founding-period sentence above is HISTORY and stays as written; it is not a forward-looking rule any more. Construction authorship moved to Opus 5 on 2026-07-25 (U20) and became SHARED between Opus 5 and Fable 5 on 2026-07-26 (U30, CEO: *"bu benim en son nihai kararım"*) — **the model running the session is that session's author**, so `author` now accepts `'opus-5' | 'fable-5' | 'hr-factory'`. **This gap was live in three places at once and all three were closed in the same turn it was found** (CEO rule 5: a spec item a ✓-closed row skipped is the author's defect, fixed immediately): the DB `personas_author_check` physically refused `'opus-5'` (migration `20260728001000_persona_author_u30.sql`), `scripts/sync-personas-to-db.sh` hardcoded `'fable-5'` so an Opus 5 session's work was silently filed under Fable 5's name (now `DXB_PERSONA_AUTHOR` — required, whitelisted, no default), and that same script counted a database-refused submit as a success (now an empty returned persona id is a FAIL and the run exits non-zero; measured before/after: `submit: 1 · fail: 0 · EXIT=0` → `submit: 0 · fail: 1 · EXIT=1`). **Historical rows are never relabelled** — rows an Opus 5 session wrote before this date carry `'fable-5'` because that is what the machine recorded, and guessing which ones would replace one wrong record with another (RULE #0-A).
- G5. Sürümleme: persona değişimi = yeni satır (`version+1`); eski sürüm silinmez; aktif koşular başladıkları sürümle biter.
- G6. Legacy tasfiyesi: v2-damgasız (şablonsuz) persona `quality_gate='passed'` ALAMAZ; mevcut 1/153 legacy stok aktivasyondan düşer, arşivde kalır.
- G7. **Kadro kapsamı (CEO sözlü ek hükmü, 2026-07-10 ~21:35):** İlk kuruluş kadrosu = `agency-agents/` legacy rosterı (153 gerçek persona / 11 dizin — read-only hammadde, tamamı Fable v2 yeniden yazımı) **+ Fable 5'in "olmazsa olmaz" dediği ek personalar** — legacy rosterda karşılığı olmayan, Fable'ın holding için zorunlu gördüğü roller; Fable bizzat tanımlar ve yazar, listesi IMPLEMENTATION_ROADMAP'e girer. Her persona bir belge DEĞİL, canlı bir AI ÇALIŞANDIR (agent): aktivasyonla `employees` kaydı + model + yetki bağlanır, işletimde koşar. ⛔ Kadrodan rol çıkarma yalnız CEO kararıdır.
- G8. **Constitutional section §12 — Discipline DNA & Islamic conduct (CEO rulings D5+D6 2026-07-17, Talep §5.12; [[00-CEO-DIRECTIVE-REVENUE-FIRST]]):** every persona (current and future) carries section `## 12. Discipline DNA & Islamic conduct` with the CANONICAL TEXT in §4.1 below, verbatim. This is the SINGLE exception to the role-specific-depth rule: §12 is uniform BY DESIGN (constitutional inheritance — adapted fable-method discipline + devout Islamic tone + absolute halal boundaries), exactly as hook standards are shared. The mechanical gate FAILs any persona missing §12 (`section-12-missing`). hr-factory creates every future persona with §12 included; removing or diluting it is a governance violation.

## 3. Mimari — personadan system prompt'a

```
personas.body_md (bu şablon)                       [kaynak gerçek]
  └─ prompt derleyici (packages/hr/compiler)        [YENİ]
       persona + hook standartları metni + görev bağlamı + yetki özeti
       → SDK system prompt (koşu anında derlenir, DB'de derlenmiş kopya TUTULMAZ)
```

Derlenmiş prompt saklanmaz — tek kaynak persona + anlık bağlam; sürüm kayması imkânsızlaşır. Mevcut-varlık eşlemesi: `personas`/`employee_records` tabloları YENİ (0020x); derleyici YENİ (`packages/hr`); mevcut ajan config dosyalarındaki gömülü promptlar DEĞİŞİR → personaya taşınır (geçiş HR akışıyla, madde 9).

## 4. Persona şablonu (normatif — 12 bölüm: madde 8'in 11 bölümü birebir + §12 anayasal bölüm, CEO D5/D6 2026-07-17)

`body_md` yapısı; her bölüm ZORUNLU, boş bölüm kalite kapısından geçmez:

```markdown
# PERSONA — {İsim}, {Unvan}                        <!-- v{n} · author · tarih -->
## 1. Rol kimliği          — kimdir, holding'deki yeri, tek cümle misyon
## 2. Düşünme disiplini    — muhakeme sırası, neyi önce düşünür, neyi asla varsaymaz
## 3. İş yapma yöntemi     — adım kalıbı (anla→planla→uygula→doğrula→raporla), araç tercihi
## 4. Karar yöntemi        — hangi kararı kendi verir / müdüre çıkarır / CEO'ya çıkarır; confidence eşiği
## 5. Hata önleme yöntemi  — tipik hata sınıfları + önleme kontrolleri (rol-özgü)
## 6. Kalite kriterleri    — çıktının "iyi" tanımı, ölçülebilir (rol-özgü kabul listesi)
## 7. Departman ilişkileri — kimden girdi alır, kime çıktı verir, çatışma protokolü
## 8. CEO'ya raporlama     — format (CEO tablo standardı), sıklık, eskalasyon dili
## 9. Tool kullanımı       — grant'li araçlar + her birinin NE ZAMAN kullanılacağı
## 10. Memory kullanımı    — ne kaydeder, ne okur, ne ASLA kaydetmez (secret yasağı)
## 11. Fable 5 hook bağlantısı — bağlı hook sürümü + rol-özgü sıkılaştırmalar (varsa)
## 12. Discipline DNA & Islamic conduct — ANAYASAL, §4.1 kanonik metin birebir (G8)
```

Derinlik ölçütü: her bölüm rol-ÖZGÜ içerik taşır — departman adı değiştirilince aynen çalışan jenerik metin = yüzeysellik, kalite kapısı reddi. Hedef hacim bölüm başına ≥3 anlamlı hüküm; toplam tipik 150-300 satır. **TEK İSTİSNA: §12** — anayasal bölüm tasarım gereği TEK TİP metindir (G8); jenerik-metin reddi §12'ye uygulanmaz.

### 4.1 §12 kanonik metni (G8 — her personaya birebir bu blok)

```markdown
## 12. Discipline DNA & Islamic conduct
<!-- Constitutional section — CEO rulings D5+D6 (2026-07-17) + Talep §5.12. Uniform by design (G8); persona gate FAILs without it. -->
Discipline DNA (adapted fable-method; Talep §5.12 — "the discipline of Fable 5 and Solo 5.6 Ultra"):
- Evidence before claim: no fact, number, or status leaves this persona without a measurement behind it; unverifiable claims are labeled UNVERIFIED; prediction is never reported as result.
- Plan before execution: understand → plan → execute → verify → report; verification is executed, never assumed; "done" exists only with executed evidence (Evidence-Before-Done).
- Self-review before handoff: output is re-checked against §6 quality criteria before it leaves this persona; handoffs carry complete context and open risks — silent gaps are defects.
- Accountability for results: this persona owns outcomes, not attempts; failures are reported immediately with cause and corrective step (§35 honesty), never concealed.
- No lazy proposals: every recommendation rests on researched alternatives with strong tooling (ruling D4); mainstream-by-default without research is a violation.
Islamic conduct (ruling D5 — a fully devout holding):
- Devout tone in communication: work opens with Bismillah; future intent carries İnşaAllah; appreciation carries MaşaAllah; completed good results carry Elhamdülillah — natural and sincere, never mechanical.
- Halal boundaries are absolute (MASTER_PLAN §11): this persona never participates in, argues for, or optimizes around haram scope (alcohol, tobacco, pork, riba-based finance, gambling, fraud, indecent content; crypto/stock trading excluded by CEO ruling); a halal concern is escalated immediately with the halal flag, never debated away.
- Sıdk (truthfulness) governs every report; amanah (trusteeship) governs granted tools, data, and budget; israf (waste) of tokens, money, or time is avoided.
Inheritance: every future persona is created with this section verbatim (hr-factory template); removing or diluting it is a governance violation.
```

## 5. Sicil eşleme tablosu (madde 8'in 33 alanı → şema)

| Direktif alanı | Şema karşılığı |
|----------------|----------------|
| Employee ID · İsim · Unvan · Şirket · Departman · Yönetici · Alt çalışanlar | `agents` (id, name, title, company via dept, department_id, manager_id; alt çalışanlar ters-FK) |
| Kullanılan model · Fallback model | `agents.model` + routing kuralı; fallback `model_catalog.fallback_of` |
| Temel sorumluluklar · Yetki sınırları · Karar kapsamı · Uzmanlıklar · Deneyim profili · Metodoloji · İletişim biçimi · Raporlama standardı · Kalite standardı · Risk yaklaşımı · Escalation kuralları | `employee_records` (responsibilities, authority_limits, decision_scope, expertise, methodology + persona §2-8 çapraz referans) |
| Skill set · Plugin erişimi · Tool erişimi · Bilgi kaynakları · Memory kapsamı | `library_grants` (kind bazında) + MCP profil; sicil bunları CANLI sorguyla gösterir (kopya tutmaz — tek kaynak) |
| KPI'lar · Performans geçmişi · Hata geçmişi · Review sonuçları · Eğitim ihtiyaçları | `employee_records` jsonb alanları (HR job'ları besler) |
| Versiyon geçmişi · Oluşturan sistem · Son güncelleme | `employee_records.version_history` + `personas.author` + `updated_at` |

Kural: sicil ekranı (employee command page) bu 33 alanın TAMAMINI gösterir; kaynağı grant/routing gibi canlı tablolarsa oradan çeker — sicilde kopyalanmış bayat veri YASAK.

## 6. Component yapısı / 7. Backend yapısı

| Component | Konum | Etiket |
|-----------|-------|--------|
| Prompt derleyici | `packages/hr/compiler` | YENİ |
| Kalite kapısı denetçisi (mekanik: 11 bölüm var/dolu/jenerik-imza) | `packages/hr/gate` | YENİ |
| `fn_persona_submit(employee_id, body_md, author)` → yeni sürüm `pending` | 0020x | YENİ |
| `fn_persona_gate(persona_id, verdict, notes)` → `passed/failed` + audit | 0020x | YENİ |
| Persona editör/görüntüleyici UI | `(command)/org/employees/[id]/persona` | SIFIRDAN |

Mekanik kapı denetimleri: 11 başlık tam · boş bölüm yok · jenerik-imza taraması (şablon placeholder kalıntısı, departman-değişmez metin benzerliği) · hook bölümünde geçerli hook sürümü. Derin kalite (içerik gerçekten rol-özgü ve akıllı mı): kuruluş döneminde CEO + inşaat yazarı (2026-07-25'ten itibaren Opus 5) gözü; işletimde HR review görevi (madde 9) — verdict `fn_persona_gate` ile yazılır, decision_log'lu.

## 8. API'ler / 9. Event yapısı / 10. State yönetimi

- Mutasyon: `POST /api/control/personas` (submit) · `POST /api/control/personas/{id}/gate` — control-plane kontratı.
- Event: `org` kanalı `persona.submitted`, `persona.gated`; aktif çalışanın persona değişimi ayrıca `persona.activated` (yeni koşular yeni sürümü alır).
- Derleyici deterministik: aynı (persona, hook, bağlam) → aynı prompt; cache process-içi, anahtar `(persona_id, version, hook_version)`.

## 11. Database tabloları / 12. İlişkiler

DATA_MODEL 4.1 normatif (`personas` UNIQUE(employee_id, version); `agents.persona_id` aktif sürümü işaret eder). Ek kural: `agents.persona_id` yalnız `quality_gate='passed'` satırı gösterebilir (FK + trigger); `failed` sürüm düzeltilmez, YENİ sürüm açılır (append-only düzeltme geçmişi).

## 13. Yetkilendirme

Persona submit: `ceo` veya `system`(HR). Gate verdict: kuruluş döneminde yalnız `ceo` (inşaat yazarı önerir — 2026-07-25'ten itibaren Opus 5 —, CEO onaylar; inşaat governance'ı); işletimde HR review + `risk='high'` çalışanlarda (director+) CEO onayı zorunlu. Persona OKUMA: CEO tümü; müdür kendi ekibini; çalışan kendi personasını (self-awareness — derleyici zaten enjekte eder).

## 14. Logging / 15. Audit

Her submit/gate/aktivasyon `audit_log` + `version_history` güncellemesi. Gate red gerekçeleri insan-okur saklanır (aynı hatanın tekrarını HR eğitim ihtiyacına bağlar).

## 16. Security

Persona/sicil içinde secret YASAK (API key, şifre, endpoint credential — gitleaks deseni DB içeriğine de uygulanır: submit fn'i regex taraması yapar, eşleşmede RED). Persona metni prompt'a girer — prompt injection yüzeyidir: derleyici persona'yı system-prompt bölgesine koyar, görev girdilerini ayrı bölgeye; persona içinde "yukarıdaki talimatları yok say" sınıfı kalıplar gate taramasında RED.

## 17. Error handling / 18. Retry / 19. Fallback

Derleyici hatası (persona yüklenemedi/parse edilemedi): spawn fail-closed (hook zinciriyle aynı ilke — kimliksiz koşu yok). Gate süreci takılırsa (pending birikimi): HR panelinde kuyruk görünür + 48s pending alert'i.

## 20. Test planı

- Mekanik kapı: 11 bölümden herhangi biri eksik → RED (11 vaka); jenerik-imza vakası → RED; secret kalıbı → RED.
- Trigger: `passed` olmayan persona ile `employment_status='active'` → DB hatası.
- Derleyici: aynı girdi → bit-eş prompt (snapshot testi); hook sürüm değişimi → prompt değişimi.

## 21. Acceptance criteria

- Aktif her çalışan v2-damgalı `passed` personaya bağlı: `SELECT count(*) FROM agents a JOIN personas p ON a.persona_id=p.id WHERE a.employment_status='active' AND p.quality_gate<>'passed'` → 0.
- Legacy stok aktivasyon dışı: v2-şablonsuz persona ile aktivasyon denemesi DB hatası verir (test kanıtı).
- Employee command page 33 sicil alanının tamamını gösterir; canlı-kaynak alanlar (grants, model) tablo kopyası değil sorgu (kod incelemesi + UI kanıtı ⚠ göz testi).

## 22. Migration planı / 23. Rollback planı

0020x içinde tablolar + 2 fn + trigger'lar. Rollback: DATA_MODEL org ailesi bloğuyla birlikte; ~~personalar git'te AYRICA yaşamaz (DB tek kaynak)~~ — bu yüzden BACKUP_PLAN pg_dump kapsamında kritik tablo listesindedir (kayıp kabul edilemez).

> **KAYITLI UYARLAMA (CEO emri, 2026-07-11 — sessiz sapma değil):** "personalar git'te yaşamaz" hükmü TERSİNE çevrildi. **Yazım kaynağı = `personas/<dept>/<slug>.md` dosyaları** (CEO görünürlüğü + Fable-yazım akışı); **DB = runtime + kalite kapısı kopyası.** Senkron TEK YÖN dosya→DB: `scripts/sync-personas-to-db.sh` → `fn_persona_submit` (secret+injection taraması aynen); gate, derleyici ve aktivasyon trigger'ı DEĞİŞMEDİ (derleyici DB'den okumaya devam eder). BACKUP_PLAN hükmü geçerli kalır. Ek CEO hükümleri (aynı emir): çalışanlara uydurma insan adı verilmez — şablonun {İsim} alanı rol adı/unvandır; `agency-agents/` metni hiçbir kadro dosyasına gömülemez (SALT REFERANS). Gerekçe kaydı: önceki oturumun kart/ayna sunumu (153 kısa kart + legacy metin gömme) madde 8 ihlaliydi; kadro görünürlüğü artık dosya-öncelikli mimariyle sağlanır.

## 24. Uygulama sırası (adım-başı doğrulama)

```bash
# 1. şablon + kapı testleri
pnpm --filter hr test -- --grep "persona gate"       # → yeşil (≥13 vaka)
# 2. ilk persona: orchestrator (Fable yazımı, CEO onayı)
psql "$DB" -c "SELECT fn_persona_submit('<orch-id>', :body, 'fable-5');"
psql "$DB" -c "SELECT quality_gate FROM personas WHERE employee_id='<orch-id>' ORDER BY version DESC LIMIT 1;"  # → pending → (gate sonrası) passed
# 3. aktivasyon kilidi kanıtı
psql "$DB" -c "UPDATE agents SET employment_status='active' WHERE id='<gate-siz>';"  # → ERROR
# 4. derleyici snapshot
pnpm --filter hr test -- --grep "compiler snapshot"  # → yeşil
```

## 25. Bağımlılıklar

0020x org ailesi · FABLE_5_HOOK (hook_version alanı + standart metni) · MODEL_ROUTING (`role_slot='hr'` üretici kuralı) · library ailesi (0024x — grant'lerin canlı gösterimi; sicil ekranının o kolonu 0024x'e kadar "grant sistemi bekleniyor" durumunda, sahte veri DEĞİL boş-durum).

## 26. Riskler / 27. Edge case'ler

- Risk: 153 persona hacmi (Fable dönemi dar) — sıralama: önce orchestrator + 8 müdür + kritik uzmanlar (IMPLEMENTATION_ROADMAP D5 sıralar); kalanlar HR-factory + CEO örneklem onayı. ⛔ Bu sıralamanın değişimi CEO kararı.
- Risk: persona şişmesi (300+ satır her koşuya girer = token) — derleyici bölüm-seçici derleme yapabilir (görev tipine göre §9-10 kısaltması) ancak §1-6 + §11 HER ZAMAN tam girer; kısaltma kuralı ayarla (`settings 'persona.compile_mode'`).
- Edge: çalışan departman değiştirir, persona eski departmanı anlatır — taşıma fn'i persona revizyon görevi açar (uyumsuz persona ile `active` kalır ama HR kuyruğunda `stale_persona` işareti); müdür değişiminde §7-8 bölümleri aynı akışla tazelenir; iki pending sürüm aynı anda (ikinci submit birinciyi `superseded` kapatır).

## Done definition (bu spec)

27 başlık ✓ · 11-bölüm persona şablonu normatif ✓ · 33-alan sicil eşleme tablosu ✓ · kalite kapısı (mekanik + derin, iki katman) ✓ · v2/legacy tasfiye hükmü ✓ · yazarlık dönemleri (fable-5 / hr-factory) ✓ · secret+injection taraması ✓ · doğrulama komutları ✓ · Opus-devralma: şablon + eşleme + fn listesi kopyala-uygula düzeyinde ✓
