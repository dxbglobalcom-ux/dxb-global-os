# PROJECT_OPERATING_SYSTEM_SPEC — DXB GLOBAL AI-NATIVE HOLDING OS

> Dalga 4 · Yazar: Fable 5 bizzat · Kaynak hüküm: direktif madde 12 (Project OS — 27 görünür alan) + §23 (Project Command View — 19 alan, "Gantt benzeri olabilir ama klasik PM aracı gibi görünmesin") · Üst: [[SYSTEM_ARCHITECTURE]] · Kardeşler: [[DATA_MODEL]] 4.4, [[WORKFLOW_ENGINE_SPEC]], [[CEO_COMMAND_CENTER_SPEC]] (sunum)

## 1. Amaç

"Projeler yalnızca isim, yüzde ve durumdan oluşamaz" (madde 12). Her proje: amaç, strateji bağı, sahip, kadro, plan, fazlar, milestone'lar, görevler, bağımlılıklar, riskler, kararlar, maliyet, dosyalar, repolar, testler, deploy, versiyon, audit — CEO en üstten tek görev detayına kadar iner. Bu spec proje varlığını birinci-sınıf DB kaydı yapar ve Command View'ın veri sözleşmesini kurar.

## 2. Gereksinimler

- G1. Madde 12'nin 27 kalemi karşılıksız kalamaz (eşleme §4 — her satır ya mevcut tablo ya kayıtlı ek).
- G2. Drill-down zinciri: proje → faz → milestone → görev → koşu → karar/araç/dosya (FK'larla, kopmaz).
- G3. Health score GERÇEK sinyalden hesaplanır (formül §10) — süs metrik yasak (§35).
- G4. §23 hükmü: premium, operasyon-odaklı görünüm; klasik PM aracı görünümü YASAK.

## 3. Mimari

Proje katmanı salt veri+görünümdür: yürütme motoru DEĞİLDİR (görevler kernel/workflow motorunda koşar; proje onlara bağlam verir). `tasks.project_id` köprüsü mevcut akışı bozmadan bağlar (nullable — projesiz görev yaşamaya devam eder; KALIR ilkesi).

## 4. Veri modeli (madde 12'nin 27 kalemi → karşılık)

| Kalem(ler) | Karşılık |
|------------|----------|
| Amaç, strateji ilişkisi, sahibi | `projects.purpose, strategy_link, owner_employee_id` (mevcut 4.4) |
| Departmanlar, müdürler, çalışanlar | üyelik türetilir: proje görevlerinin/koşularının atanmışları (`v_project_command` hesaplar) + sabit çekirdek kadro **kayıtlı ek** `project_members` |
| Aktif workflow'lar | `workflows` ilişkisi — **kayıtlı ek** `workflows.project_id uuid` nullable |
| Master plan, fazlar, milestone'lar | **kayıtlı ek** `project_milestones` (faz = milestone `phase` türü; plan gövdesi repo'da, `plan_ref` yolu) |
| Görevler, alt görevler | `tasks(project_id)` + mevcut alt-görev deseni (task parent zinciri task_events'te) |
| Bağımlılıklar | **kayıtlı ek** `task_dependencies` |
| Riskler | milestone/proje notu değil kayıt: **kayıtlı ek** `project_risks` |
| Kararlar | `decision_log` corr.project_id filtresi (0022x) |
| Maliyetler, token | `cost_ledger` + `agent_runs` proje toplaması |
| Dosyalar, repo'lar, dokümantasyon, deploy, versiyonlar | **kayıtlı ek** `projects.links jsonb` (`{repos:[], docs:[], deploys:[], versions:[]}`) + `file_changes` koşu köprüsü |
| Review'lar, approval'lar, testler | `decision_log(review)`, `approvals` corr, test sonuçları task_events kaydı |
| Audit geçmişi | `audit_log` entity=project filtresi |

```sql
-- 0023x ailesine ek (0023x-b; Dalga 4 kapanışında DATA_MODEL'e işlenir)
CREATE TABLE project_members (
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES agents(id),
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner','director','member')),
  PRIMARY KEY (project_id, employee_id)
);
CREATE TABLE project_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'milestone' CHECK (kind IN ('phase','milestone')),
  seq int NOT NULL, title text NOT NULL,
  due_at timestamptz, reached_at timestamptz,
  plan_ref text,                                -- repo'daki plan dosya yolu
  UNIQUE (project_id, seq)
);
CREATE TABLE task_dependencies (
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, depends_on),
  CHECK (task_id <> depends_on)                 -- döngü koruması trigger'da (derin döngü)
);
CREATE TABLE project_risks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL, severity text NOT NULL CHECK (severity IN ('low','medium','high','critical')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','mitigated','accepted','closed')),
  note text, updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE projects  ADD COLUMN links jsonb NOT NULL DEFAULT '{}';
ALTER TABLE workflows ADD COLUMN project_id uuid REFERENCES projects(id);
```

## 5. Component yapısı / 6. Backend yapısı

- Fn ailesi: `control_project_{create,update,set_status,add_milestone,set_dependency,add_member,log_risk}` ([[API_CONTRACTS]] 8b envanterine iki kayıtlı ek: add_member, log_risk).
- Health score hesap fn'i: `project_health(project_id)` SQL fn — `v_project_command` içinde çağrılır; formül §10.
- Blocker türetimi: bağımlılık grafiğinde tamamlanmamış `depends_on` zinciri + park etmiş approval'lar → `blockers` alanı (hesaplanır, saklanmaz).

## 7. Frontend yapısı (§23 Command View)

Rota: `/projects/[slug]` — §23'ün 19 alanı tek kompozisyonda: üst şerit (amaç, stratejik önem, health, phase), orta canvas zaman ekseni (faz/milestone yatay akış — Gantt-esintili ama görev-çubuğu ormanı DEĞİL; yalnız faz blokları + milestone işaretleri + bugün çizgisi), sol sütun kadro/departman, sağ ray riskler-kararlar-approvals-blockers, alt bant maliyet/token trendi + dosya-repo-deploy linkleri. Her sayı tıklanır → drill-down (G2 zinciri). Estetik kontratı [[DESIGN_SYSTEM]]; "klasik PM aracı görünümü yasak" kabul denetim maddesidir.

## 8. API'ler

Okuma: `v_project_command` (proje-başı tek round-trip: 19 alan + sayaçlar). Mutasyon: 8b `projects` alanı. Ajan-içi: ajanlar proje bağlamını okur (görev meta'sından), proje kaydını DEĞİŞTİREMEZ (control seam CEO+sistem).

## 9. Event yapısı

`projects` kanalı (EVENT_MODEL §9b): `project.created`, `project.status_changed`, `milestone.reached`, `dependency.blocked`. `milestone.reached` üretimi: görev tamamlama fn'i milestone'un tüm görevlerinin kapandığını görünce `reached_at` yazar + yayınlar.

## 10. State yönetimi (health score formülü — bağlayıcı)

```
health = 100
  - 25·(açık critical risk var mı)
  - 15·(açık high risk sayısı, en çok 2 sayılır)
  - 20·(geciken milestone oranı: due_at geçmiş & reached_at boş / toplam)
  - 20·(son 7 gün failed koşu oranı: failed/(failed+succeeded), proje corr'lu)
  - 10·(blocker sayısı >0)
  - 10·(bütçe yanığı: proje maliyeti / tahsis — tahsis `links.budget_eur` girildiyse; girilmediyse bu bileşen 0)
sonuç 0-100 aralığına kırpılır; bileşen kırılımı v_project_command'da ayrı kolonlar (CEO "neden 62?" sorusuna tek bakışta yanıt)
```

Formül değişikliği migration'dır (fn sürümü) + bu spec'e işlenir — sessiz kalibrasyon yok.

## 11. Database tabloları / 12. İlişkiler

§4 ekleri + mevcut 4.4. İlişkiler: projects 1─n {tasks, milestones, members, risks, workflows}; tasks n─n tasks (dependencies); decision_log/approvals/cost proje bağı corr üzerinden (kolon çoğaltma YOK — tek kaynak agent_runs zinciri).

## 13. Yetkilendirme

Proje mutasyonları CEO (control seam); sistem otomasyonu yalnız: milestone reached yazımı, health yeniden hesap, blocker türetimi. RLS read mevcut desen.

## 14. Logging / 15. Audit

Proje mutasyonları audit_log (entity=project, detail_ref ilgili satır). Milestone/risk değişimleri kendi satır güncellemeleri + audit; görev-düzeyi detay zaten task_events'te (çift yazım yok).

## 16. Security

Yeni yüzey yok; `links` jsonb'ye credential yazılamaz (Zod şeması url/metin alanları; gitleaks deseni CI'da içerik taramaz ama fn regex kapısı: `://.*:.*@` reddi). Madde 4 sınırı korunur.

## 17. Error handling / 18. Retry / 19. Fallback

Bağımlılık döngüsü → fn reddi (`VALIDATION_FAILED`, döngü yolu mesajda); milestone seq çakışması → `CONFLICT_STALE`; health hesap hatası → son bilinen skor + `stale` bayrağı (UI gri gösterir — sahte tazelik yok). Retry/fallback görev-yürütme katmanının işi (WORKFLOW/ORCHESTRATION), proje katmanı yeniden denemez.

## 20. Test planı / 21. Acceptance criteria

- Fn testleri: döngü reddi, milestone reached otomasyonu, health formül birim testi (bileşen-başı senaryo).
- Kabul: DXB Global OS'un kendisi ilk proje kaydıdır (dogfood — gerçek veriyle Command View); §23'ün 19 alanı ekranda ve HER sayı tıklanınca kaynağına iner; madde 12'nin 27 kaleminin her biri için görünür yüzey (eşleme tablosu denetim listesi olarak kullanılır).

## 22. Migration planı / 23. Rollback planı

`0023x-b_project_os` (4 tablo + 2 kolon). Rollback: ekler DROP; `projects` çekirdeği (4.4) yaşamaya devam eder; en kötü durumda proje katmanı tamamen sökülse bile görev akışı bozulmaz (`project_id` nullable — bilinçli izolasyon).

## 24. Uygulama sırası (doğrulamalı)

```bash
supabase db push && psql "$DB" -c "\dt project_*"                       # → members, milestones, risks (+ projects)
psql "$DB" -c "SELECT project_health(id) FROM projects LIMIT 1;"        # → 0-100 skor
curl -s "localhost:3000/api/... v_project_command?slug=eq.dxb-global-os" | jq '.[0].health_score'  # → sayı + kırılım kolonları
```

## 25. Bağımlılıklar / 26. Riskler / 27. Edge case'ler

- Bağımlılık: 0023x (projects/tasks köprüsü), 0022x (corr zinciri), EVENT_MODEL projects kanalı.
- Risk: üyelik türetimi (koşulardan) ile sabit kadro (project_members) çelişirse → görünüm ikisini ayrı etiketler ("kadro" / "fiilen çalıştı") — çelişki bilgidir, gizlenmez.
- Edge: projesiz görevler → "Unassigned" sanal grubu (Command View dışında, Operations'ta); proje arşivi → koşan workflow varsa fn reddi (önce durdur); tarihsiz milestone → zaman ekseninde "planlanmamış" rayında; Outleteuro (Faz 11) → AYRI alt-OS spawn'ı bu tablodan BAĞIMSIZ (kendi OS'unda kendi projeleri — buradaki kayıt yalnız holding-görünür üst özet).

## Registered adaptations — E9.4 execution (2026-07-14, Fable K1; CEO-visible)

Execution of §5-§10 against the live repo surfaced six binding-neutral interpretations; recorded here per the master-plan-fidelity rule (no silent deviation). Migration: `20260714010000_e94_project_command.sql`.

- **A1 — control seam shape.** §5's `control_project_{create,...}` fn family ships as ONE fn `control_project_action(p_payload, p_idempotency_key)` with `action ∈ {create, update, set_status, add_milestone, set_dependency, add_member, log_risk}` — the established E6/E9.1/E9.3 single-door idiom (idempotency twin, audit row, CEO wall in one place). API_CONTRACTS 8b op list satisfied verbatim.
- **A2 — route mount.** §7's `/projects/[slug]` lives at `/ops/projects` (index) + `/ops/projects/[slug]` (Command View) inside the command shell's Operations group — nav has pointed there since E2; no second mount.
- **A3 — milestone link.** §9's milestone.reached automation needs a task↔milestone edge the §4 model lacked → `tasks.milestone_id uuid NULL REFERENCES project_milestones(id)` (registered addition). A DB trigger on task status→done stamps `reached_at` when the last open task of the milestone closes and broadcasts on `projects`.
- **A4 — health exposure.** `project_health(project_id)` returns the §10 score; `project_health_breakdown(...)` exposes each penalty as a column and `v_project_command` LATERAL-joins it (`health_live` + `pen_*` + computed `blockers_count`). `projects.health_score` stays as the last-known cache for the §17 stale fallback.
- **A5 — token correlation.** Token usage sums `agent_runs.tokens_in/out` through `tasks.project_id` (§11 single-source corr chain; no column duplication).
- **A6 — risk row updates.** §14's "risk rows update in place" rides the same seam: `log_risk` with `{risk_id, status, note?}` updates instead of inserting (API route surfaces it as op `update_risk`).

Dogfood acceptance (§21): `dxb-global-os` carries 13 phase milestones (the roadmap E-blocks; reached dates = each block's last ✓) + 3 REAL recorded risks (workforce activation gap, E11 pending, deferred brown-token audit) — written through the control fn under the CEO session (audit ids 5786-5801). These rows are project data, not demo residue: they persist.

## Opus-devralma notu

Şema + formül + görünüm sözleşmesi kapalı; Opus Command View'ı `v_project_command` kolonlarından mekanik kurar. ⛔ kritik karar: health formül ağırlıkları + üyelik modelinin değişimi — en güçlü model + CEO onayı.

## Done definition (bu spec)

27 başlık ✓ · madde 12'nin 27 kalemi eşlendi (6 kayıtlı ek DDL'iyle) ✓ · §23 19-alan Command View sözleşmesi + PM-aracı-görünümü yasağı ✓ · health formülü bağlayıcı + kırılım görünür ✓ · drill-down zinciri uçtan uca ✓ · doğrulama komutları ✓ · Opus-devralma + ⛔ ✓
