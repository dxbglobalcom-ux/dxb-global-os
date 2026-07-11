# GAP-AUDIT — CEO Eksik Kapatma Direktifi Denetim Raporu

> Kaynak emir: [[00-CEO-DIRECTIVE-GAP-AUDIT]] (2026-07-11). Tüm sayılar bu raporda **çalıştırılmış komut kanıtıyla** verilmiştir; tahmin yoktur. Denetim tarihi: 2026-07-11, commit tabanı 57835e2.
> Statü sözlüğü: **BLOCKER** = final kabul imkânsız · **CRITICAL** = ürün iddiası boş · **MAJOR** = kurumsal olgunluk eksik · **MINOR** = cila.

---

## 1. Dashboard gerçeği (§2 denetimi)

Kanıt komutları:
- `find src/app -name page.tsx | wc -l` → **52** rota dosyası
- `grep -rl ModuleWaiting src/app | wc -l` → **34** placeholder
- `grep -c "href:" src/config/command-nav.ts` → **41** sol-nav girişi (7 grup)
- `grep -rn "signOut\|logout" src/` → **0 satır** (logout kodu hiç yok)
- `find src/app -path "*crm*" -name page.tsx` → 5 CRM rotası, tümü eski `(cockpit)` grubunda

| Ölçüm | Değer | Not |
|---|---|---|
| Toplam rota (page.tsx) | 52 | login + design-preview + 10 legacy cockpit dahil |
| Sol-nav rotası | 41 | 7 grup, command-nav.ts |
| Gerçek domain sayfası (command shell) | **7** | overview, live, approvals, ops/tasks, org/employees, fin/costs, design-audit |
| ModuleWaiting placeholder | **34** | tümü hedef adım ID'li ama final kabulde 0 olmalı |
| Logout / session lifecycle | **YOK** | signOut çağrısı repo'da 0; oturum kapatılamıyor |
| CRM | legacy'de gizli | yeni shell bilgi mimarisinde yok |
| Mutation/control yüzeyi | **0** | shell tamamen read-only; control fn'ler E6'da |
| Global Search / ⌘K / intent surface | YOK | E2.1'de "search/⌘K→E4" notu düşmüş, E4'te açılmadı — sahipsiz kalmıştı; şimdi E6.4'e bağlandı |

## 2. Workforce gerçeği (§3 denetimi)

Kanıt: `docker exec supabase_db psql` sorguları + `find personas -name "*.md"`:

| Ölçüm | Değer | Kanıt |
|---|---|---|
| agents toplam | 153 | `SELECT count(*) FROM agents` → 153 |
| role_level | **153'ü NULL** | direktifteki "tamamı worker" varsayımından da geride — hiyerarşi alanı hiç doldurulmamış |
| employment_status | 153'ü dormant | aktivasyon 0 |
| personas tablosu | **0 satır** | derleyici yok (E5.1 bekliyor) |
| persona bağlı agent | 0 | `WHERE persona_id IS NOT NULL` → 0 |
| v2.0-fable persona dosyası | **5** (hepsi Product) | `grep -rl v2.0-fable personas/` → 5 |
| legacy persona dosyası | 148 | agency-agents kökenli |
| departman | 14 kayıt / 11'inde agent var | ceo, research, legal-de boş |
| director atanmış departman | **0/14** | `director_id IS NOT NULL` → hepsi false |
| escalation zinciri | YOK | manager_id 153'ünde NULL |

Departman dağılımı (agents): specialized 41 · marketing 30 · engineering 29 · sales 8 · design 8 · testing 8 · paid-media 7 · project-management 6 · support 6 · product 5 · finance 5.

## 3. §3.2 asgari kabiliyet tabanı vs mevcut roster (departman-seviyesi ön eşleme)

Tam persona-gövdesi okuma matrisi E5.0'ın çıktısıdır (aşağıda); bu tablo departman-seviyesi ilk eşlemedir:

| # | Zorunlu aile (§3.2) | Mevcut karşılık | Boşluk |
|---|---|---|---|
| 1 | CEO Office & Executive Ops | `ceo` dept boş (0 agent) | TAM BOŞLUK |
| 2 | Corporate Strategy & BizOps | yok; research dept boş | TAM BOŞLUK |
| 3 | People/HR/Talent | yok (0 HR agent) | TAM BOŞLUK — E5.4 zaten planlı |
| 4 | Legal/Compliance/Governance | legal-de dept boş; specialized içinde compliance-checker | KRİTİK boşluk |
| 5 | Risk & Internal Audit | yok | TAM BOŞLUK |
| 6 | Security & Trust | specialized içinde güvenlik uzmanları (icracı) | yönetim/assurance sahipsiz |
| 7 | Data/AI Platform & Eval | engineering'de ai-engineer var | eval/knowledge/FinOps sahipsiz |
| 8 | Platform/Infra & Reliability | engineering'de devops/sre var | backup/DR/capacity sahipliği bölünmeli |
| 9 | Customer Success | support 6 (ticket odaklı) | CS fonksiyonu yok |
| 10 | RevOps | sales 8 + marketing 30 arası sahipsiz | owner yok |
| 11 | Partnerships & Ecosystem | yok | TAM BOŞLUK |
| 12 | Corporate Comms | marketing içinde sosyal medya içerik | itibar yönetimi yok |
| 13 | Finance tamamlayıcı | finance 5 (bookkeeping/FP&A ağırlıklı) | treasury/payroll/procurement açık |
| 14 | Global Expansion & Regional | yok | TAM BOŞLUK |
| 15 | Quality & OpEx | testing 8 (test üretimi) | şirket-çapı kalite sahibi yok |

## 4. En kritik 10 açık (§5-C formatı)

| ID | Severity | Gerçek kanıt | Risk | Faz | Owner | Acceptance proof |
|---|---|---|---|---|---|---|
| GAP-01 | BLOCKER | `grep signOut src/` → 0 | oturum kapatılamaz; paylaşılan makinede kalıcı CEO oturumu | E6.0 (yeni) | F/O | logout → `/login`; geri tuşu korumalı sayfa açmaz; çoklu sekme senkron |
| GAP-02 | BLOCKER | personas=0, persona_id bağlı agent=0 | "153 çalışan" iddiası boş; aktivasyon kapısı hiçbir şeyi geçiremez | E5.1-E5.5 | **F** | persona satırı + quality_gate=passed + agents.persona_id dolu |
| GAP-03 | BLOCKER | director_id 0/14, manager_id 153'ü NULL | hiyerarşi/escalation yok; orphan=153 | E5.0+E5.3 | **F** | her aktif departmanda head; worker'da manager_id; orphan=0 |
| GAP-04 | CRITICAL | ModuleWaiting=34/41 nav | dashboard %83 kabuk | E6-E12 blok-içi kapanış + E12.3 kapısı | F/O | `grep -rl ModuleWaiting src/app | wc -l` → 0 |
| GAP-05 | CRITICAL | CRM 5 rota legacy'de; company context yok | multi-company holding iddiası shell'de temsilsiz | E12.4 (yeni) | F/O | CRM + company switch yeni shell'de + izolasyon testi |
| GAP-06 | CRITICAL | shell'de mutation yüzeyi 0 | "gör+incele+değiştir+kontrol" şartının 2 bacağı yok | E6 | F/O | control fn + audit + Broadcast zinciri testli |
| GAP-07 | CRITICAL | Global Search/⌘K/intent yok; E2.1'de nota düşmüş, hiçbir adım sahiplenmemiş | CEO intent gönderemez — anti-baby-sitting çekirdeği kırık | E6.4 (yeni) | F/O | intent → classification → task → audit ekrandan izlenir |
| GAP-08 | MAJOR | backup restore drill hiç koşulmadı | RPO/RTO kanıtsız; felakette dönüş bilinmiyor | E13.0 (yeni) | F/O | restore drill raporu + dönüş süresi |
| GAP-09 | MAJOR | ceo/research/legal-de dept 0 agent; §3.2'nin 6 ailesi TAM BOŞ | holding yönetim kabiliyeti yok | E5.0 matris → E5.5 dalgaları | **F** | gap matrisi kararları + yeni persona sözleşmeleri (§3.3) |
| GAP-10 | MAJOR | alert/notification center yok (alerts=ModuleWaiting) | alarm sahipliği/acknowledge/escalation tanımsız | E8.4b→E12 | F/O | gerçek alarm kaynağı + severity + ack akışı |

## 5. Kararlar — CEO hükmü (2026-07-11 ~12:45, BAĞLAYICI)

| # | Konu | CEO KARARI |
|---|---|---|
| K1 | Modül/placeholder kapanışlarının yürütücüsü | **Yalnız Fable ve GPT 5.6 solo.** Başka model modül kapatamaz. Devralma protokolü bu karara göre güncellendi (roadmap §4 kural 4) |
| K2 | Yeni + legacy persona yazarlığı | **TÜMÜ Fable bizzat, en mükemmel kalitede.** Personalar + skiller + MCP profilleri + HR müdürü ve uzman yapısı HAYATİ — mükemmel holding ancak mükemmel çalışanlarla yürür. HR-fabrikası altyapı olarak kurulur (E5.4) ama İLK oluşum yazarlığı devredilemez; yetişmeyen "Fable-yazımı bekliyor" listesine düşer, asla düşük kaliteyle kapatılmaz |
| K3 | CRM'in shell'e taşınması | **Projeye göre** — master plan idiomu geçerli: E12.4'te tek-anahtar geçiş, eski cockpit aynı commit'te ölür, veri kaybı yok |

## 6. Roadmap entegrasyon kaydı (§4 gereği — yalnız burada bırakmak yasak)

İşlenen değişiklikler (IMPLEMENTATION_ROADMAP):
- **E5.0 (yeni, F):** kadro gap matrisi — 153 legacy + 5 v2 + registry tek envanter; `capability|department|required role|...|decision` şeması; §3.2 15-aile karşılaştırması; keep/merge/rewrite/add kararları. Persona yazım dalgaları bu matris ONAYLANMADAN başlayamaz.
- **E5.3/E5.5 genişletme:** müdür seti = mevcut 11 + gap-matrisi zorunlu yeni head'ler; role_level+manager_id backfill; §3.3 persona sözleşmesi zorunlu alan seti.
- **E6.0 (yeni):** Auth Closure — logout + session lifecycle (§2.2 tam listesi).
- **E6.4 (yeni):** Global Search + ⌘K + CEO intent surface (E2.1'de nota düşüp sahipsiz kalan çekirdek).
- **E8.4b:** notification/alert center gerçek kaynakla.
- **E12.3 (yeni kapı):** Route Completeness — ModuleWaiting=0 + rota-başı DoD matrisi (§2.1'in 8 şartı).
- **E12.4 (yeni kapı):** Holding/CRM Integration — CRM + company context yeni shell'de.
- **E12.5 (yeni kapı):** Workforce Completeness — hierarchy + gap-onaylı personalar + activation proof.
- **E13.0 (yeni):** Operational Readiness — restore drill, session E2E, accessibility, failure-path testleri.
- **Blok-içi kapanış notu:** her E bloğu kendi domain placeholder'ını kendi adımında kapatır (§2.1 DoD matrisi kabul şartı).
