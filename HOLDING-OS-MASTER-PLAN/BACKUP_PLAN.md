# BACKUP_PLAN — 12 TEMMUZ SENARYOSU + DEVİR PROTOKOLÜ

> Dalga 1 · Yazar: Fable 5 bizzat · Kaynak: direktif madde 16 (birebir) + CEO hizalaması m.1 (12 Temmuz = Fable son günü)
> Bu plan "kalitesiz MVP planı" DEĞİLDİR — ana hedefi koruyan kontrollü execution planıdır (madde 16 hükmü).
>
> **⚠ DURUM 2026-07-25 — DEVİR YÜRÜRLÜKTE (U20):** bu planın öngördüğü devir gerçekleşti. Yürütücü artık **Opus 5**'tir; **yedek model katmanı KALDIRILDI** (tek beyin; hata = `blocked` raporu, sessiz alt-model düşüşü yok). Aşağıdaki S0/S1/S2 senaryo metni ve tarihli pencereler **tarihsel kayıttır** — güncel model hükmü MASTER_PLAN §2 "Model zinciri (v9)" + MODEL_ROUTING_SPEC A-2026-07-25'tir.

## 0. Senaryo tanımı

**S0 (hedef):** Korpus erken biter → Fable execution penceresi geniş → 12'si gecesi çekirdek kokpit canlı.
**S1 (kısmi):** 12'si geldiğinde execution yarım → bu plan devreye girer: Opus 4.8, işaretli devralma noktasından sürer.
**S2 (kötü):** Korpus bitti, execution hiç başlamadı → Opus, IMPLEMENTATION_ROADMAP'i sıfırdan sırayla uygular.
Üç senaryoda da korpus tam olduğundan kalite tavanı plana gömülüdür ("Fable tasarımı + Opus işçiliği" — bütçe-fallback emsali).

## 1. Minimum kritik kapsam (12'sine yetişmezse bile OLMAZSA OLMAZ)

1. Çekirdek OS çalışır kalır (intent→kernel→task→approval→outbox zinciri) — zaten canlı, DOKUNULMAZ.
2. Para-ÇIKIŞI onay kapısı + outbox tek-çıkış — her senaryoda aktif.
3. Korpus 31/31 diskte + commit'li (bu, Fable'ın devredilemez mirasıdır).
4. WS-A migration'ları (veri omurgası) — kontrol düzleminin temeli.
5. DESIGN_SYSTEM tokens + Command Center shell + Executive Overview (gerçek veriyle).
6. EMPLOYEE_PERSONA_STANDARD + orkestratör personası + departman müdürü personaları + HR ilk oluşumu — **yalnız Fable yazabilir (CEO emri); yetişmezse eksik kalan personalar Opus'a DEVREDİLMEZ, CEO'ya "Fable-yazımı bekliyor" listesi bırakılır.** <!-- HISTORY -->

## 2. Tamamlanması zorunlu modüller / 3. Ertelenebilecek modüller

| Zorunlu (S1'de bile) | Ertelenebilir (sistem çalışır kalır) |
|----------------------|--------------------------------------|
| Veri omurgası (0020x-0024x) | Widget sürükle-bırak inceliği (layout persist yeter) |
| Shell + Executive Overview + Live Operations | Org graph drag-drop (önce read-only graph) |
| Settings yazım seamı (en az: model routing + bütçe + approval politikası) | TV modu / çoklu ekran senkronu |
| Approval Center (mevcut + genişleme) | Holding Library tam envanter UI (tablo view yeter) |
| Cost Intelligence temel kırılımlar | Forecast/anomali modelleri (basit eşik alarmı yeter) |
| Observability: agent_runs + decision_log yazımı | tool_calls/file_changes UI inceliği (DB'ye yazım zorunlu, UI sonra) |
| — | JARVIS 09-03..05 (zaten ertelendi, kayıtlı sapma) |

## 4. Sistem çalışır durumda nasıl tutulur

- Dalga = atomik commit; hiçbir dalga yarım commit'lenmez → master her an çalışır durumda.
- Migration'lar ekleme-yönlü (breaking change yasak — DATA_MODEL kuralı) → eski UI yeni şemayla çalışmaya devam eder.
- Yeni sayfalar route-bazlı eklenir; mevcut kokpit rotaları yeni shell hazır olana dek silinmez (geçiş anahtarı: tek commit'te rota değişimi, rollback tek revert).
- VPS servisleri `restart: unless-stopped`; kuyruk Postgres'te — proses ölümü iş kaybettirmez.

## 5. Veri kaybı nasıl engellenir

- Tek durum deposu Postgres: `pg_dump` günlük → Hetzner Storage Box `dxb-backup-1` (subaccount canlı; SSH-key-only).
- Korpus + planlama durumu git'te; her dalga push'lu.
- Append-only log tabloları (UPDATE/DELETE grant'siz) kaza-silmeye kapalı.
- Doğrulama: `ssh <storagebox> ls backups/ | tail -1` → bugünün dump'ı görünür.

## 6. Geçici çözümler (bilinçli, kayıtlı)

| Geçici | Kalıcısı | Kayıt |
|--------|----------|-------|
| Health score = eşik-bazlı basit formül | Ağırlıklı çok-katmanlı skor | RISK_REGISTER |
| Forecast = son-7-gün lineer uzatma | Gerçek tahmin modeli | COST_CONTROL_SPEC |
| Org graph read-only | Drag-drop mutasyonlu | ORGANIZATION_ENGINE_SPEC |
| Opus 5 Hook = spawn-sarmalayıcı + policy tablosu | Tam pre/post validation + quality gates | FABLE_5_HOOK_SPEC |

## 7. Sonra genişletilebilir mimari kararlar

Kontrol düzlemi in-process (ayrı servis değil — SYSTEM_ARCHITECTURE §3 ⛔) · observability DB-first (ayrı collector yok) · widget layout settings_values'ta (ayrı layout servisi yok) · `agents` tablo adı alias'la yaşar (rename yok). Hepsi ölçüm kanıtı + CEO onayıyla açılabilir.

## 8. Paralelleştirilebilir görevler

Fable penceresinde paralellik YOK (inline tek akış — subagent yasağı). Opus penceresinde: migration aileleri ↔ UI sayfa grupları ↔ seed/persona-dışı içerik birbirinden bağımsız koşabilir (aynı dosyaya iki el değmemek şartıyla; roadmap'te işaretli).

## 9. Görev-model dağılımı (v6 — direktif m.16'nın güncellenmiş cevabı)

| Görev sınıfı | Model | Not |
|--------------|-------|-----|
| Korpus, mimari kararlar, persona yazımı, verdict/kabul | **Yalnız Opus 5** | Devredilemez; yetişmeyen persona bekler (bkz. §1.6) |
| Roadmap adımlarının uygulanması (kod/migration/UI) | **Opus 5** | Spec'ten sapamaz; mimariyi CEO onayı olmadan değiştiremez |
| ~~Sonnet görevleri~~ | **YOK — Sonnet defedildi** | Direktifteki "Opus veya Sonnet" CEO tarafından daraltıldı (hizalama m.5) |
| ~~Haiku düşük-risk görevleri~~ | **YOK — Haiku yasak** | v5/v6 kuralı sürer |

## 10. Kalite nasıl korunur (Fable'sız pencerede)

1. Her roadmap adımında gömülü "çalıştır → şu çıktıyı gör" kontrolü — Opus her adımı kanıtla kapatır.
2. Evidence-before-done aynen bağlayıcı: kanıtsız "done" yasak; GUI işleri ⚠ UNVERIFIED + CEO göz testi.
3. §35 yasak listesi + §38 kabul kriterleri her UI teslimin ön-kontrol listesi.
4. ⛔ işaretli kritik-karar adımı: Opus DURUR → eldeki en güçlü model + CEO onayı olmadan geçemez.
5. Checker PASS ≠ bitti kuralı Opus için de geçerli: kendi çıktısını §38'e karşı okumadan işaretleyemez.

## 11. Rollback nasıl yapılır

- Kod/UI: dalga commit'leri atomik → `git revert <dalga-sha>` tek adım.
- Şema: her migration'ın dosya-içi `-- ROLLBACK:` bloğu; sıra tersten (0024x→0020x). Veri taşıyan adımda view-alias köprüsü sayesinde iki sürüm birlikte yaşar.
- Ayarlar: `settings_change_log.undo_of` — her değişiklik tek satırla geri alınır.
- Tam felaket: son `pg_dump` + git HEAD → RECOVERY_AND_ROLLBACK_PLAN (D5) prosedürü.

## 12. Proje nasıl yeniden başlatılır (kesinti/devir — HER session)

1. `~/.claude/plans/sana-s-yl-orm-konu-al-m-nce-agile-pebble.md` (bağlayıcı sözleşme) oku.
2. governance + model-routing v6 memory + MEMORY.md oku.
3. `.planning/STATE.md` + `HOLDING-OS-MASTER-PLAN/00-INDEX.md` durum tablosu — hangi dalga/dosya/adımda kalındı.
4. Korpus bitmemişse: kaldığı dosyadan YAZ. Bitmişse: IMPLEMENTATION_ROADMAP'te ilk ✓'siz adımdan UYGULA.
5. Soru sorma, izin isteme, subagent açma, Sonnet çağırma. Rapor ✓/⚠ tablo.

## 13. Opus devir protokolü (Fable erişimi bittiği an)

- **Devir anı tanımı:** Fable session'ı açılamıyor VEYA 12 Temmuz 23:59 geçti.
- **Devir paketi (hepsi diskte olacak):** korpus 31/31 + IMPLEMENTATION_ROADMAP (✓ işaretli ilerleme + devralma noktaları) + STATE.md + bu plan.
- **Opus ilk mesaj şablonu:** "Read the binding contract, STATE.md, and IMPLEMENTATION_ROADMAP. Continue from the first unchecked step. You are the executor, not the architect: no architecture changes, no spec deviations; ⛔ steps require the strongest available model + CEO approval. Evidence before done."
- **Yetki sınırı:** Opus mimariyi/spec'i DEĞİŞTİREMEZ; zorunlu uyarlama → INDEX "Kayıtlı uyarlamalar" tablosuna satır + CEO'ya görünür rapor.
- **Verdict kapıları:** eldeki en güçlü modelde kalır; CEO göz testi hiçbir modele devredilemez.

## Done definition (bu plan)

Madde 16'nın 14 kalemi birebir karşılandı (§1-12) ✓ · Opus devir protokolü tanımlı (§13) ✓ · v6 model daraltması işlendi (§9) ✓ · doğrulama komutları var (§5) ✓ · MVP-düşürme yok, kontrollü execution ✓
