# ANALİZ — Nate Herk'in dört sistemi: holdingde elimizde olanlar (2026-11-02)

Akışlar, satış yolu ve gelir: `rapor3.html` (CEO'nun okuduğu PDF: `~/Desktop/Gelir Kaynakları/3 - Dört yapay zekâ sistemi (Nate Herk) 2026-11-02.pdf`). Bu dosya yalnız her sistem için holdingde bugün ne olduğunu ve ne eksik olduğunu, ölçüldüğü yerle tutar (ölçüm 2026-11-02, şirket motoru yalnız SELECT). Bölüm numaraları rapordakiyle aynıdır; gelir listesindeki `N-O 2.x` buraya ve rapora birlikte bakar.

## 2.1 Sesli not → belge

| Parça | Durum (2026-11-02) | Yer |
|---|---|---|
| Kulak (konuşma → yazı) | **Var.** Speaches 0.8.3 (CPU) çalışıyor; `faster-whisper-large-v3-turbo-ct2` ve `faster-whisper-small` yüklü | `docker ps` → `dxb_speaches_local`; `/v1/models` (127.0.0.1:8969); istemci `packages/voice/src/speaches.ts` |
| Ses → yazı → sınıflama hattı | **Var**, video için | `tools/video-learn/src/ingest.ts` |
| Deneme sesi üretmek | **Var:** `piper-tr_TR-fahrettin-medium`; Voicebox diskte | `/v1/models`; `~/voicebox/voicebox-main` |
| Çıkarım modeli (sesten forma) | **Var, sınavsız:** `qwen3.8-27b-uncensored`; B34 sınavı koşmadı; Gemma Ollama'da görünmüyor | `ollama list` |
| Markalı PDF | **Araç var, kod yok:** `google-chrome`, `libreoffice`; depoda PDF kütüphanesi yok | `/usr/bin`; `package.json` dosyaları |
| WhatsApp kapısı | **Yok.** Yalnız şartname: Hermes'in mesaj kapısı; Hermes sunucusu onun emriyle silindi | `HOLDING-OS-MASTER-PLAN/API_CONTRACTS.md` A5, `DATA_MODEL.md` A2; tahta B09, B11 |
| SharePoint / Drive'a yazma | **Yok** | depo grep |
| Sözleşme, fatura | **Yok**; B05 donuk | `packages/outbox-executor/src/actions/index.ts:3` |

## 2.2 Başvuru ve takip hunisi

| Parça | Durum (2026-11-02) | Yer |
|---|---|---|
| CRM | **Tablolar var, boş:** `crm_clients`, `crm_contacts`, `crm_deals`, `crm_requests` 0 satır; panelde varlık formları; ajanın CRM aracı taslak ("STUB until Phase 8") | şirket SELECT; `apps/dashboard/src/components/crm/`; `packages/dxb-mcp/src/groups/crm.ts:5` |
| E-posta | **Yalnız sahne:** yerel posta tuzağına gönderim | `packages/outbox-executor/src/actions/email-send-staging.ts`; `dxb_mailpit` kapsayıcısı |
| Hatırlatma zamanlayıcısı | **Var** | `packages/outbox-executor/src/scheduler.ts` |
| Ödeme bağlantısı, e-imza, Gmail gönderimi | **Yok** (B05) | `packages/outbox-executor/src/actions/index.ts:3` |
| SMS, randevu / Zoom | **Yok** | depo grep |
| WhatsApp | **Yok** (§2.1) | |
| Sahibin sesiyle gönderi | **Kurulmadı;** H6 hayalet yazarlığın denemesi tanımlı | §D #22 |

## 2.3 Creator OS

| Parça | Durum (2026-11-02) | Yer |
|---|---|---|
| Stüdyo | **Var:** ComfyUI servisi çalışıyor; `media_jobs` 32 satır (31 `done`, 1 `failed`); OpenMontage | `systemctl --user` → `dxb-comfyui`; şirket SELECT; `~/tools/OpenMontage` |
| Klon ses | Voicebox diskte; Voice Studio `~` ve `~/tools` altında bulunamadı (1 Kasım emri ikisinin de kurulmasını söylüyor; kurulum ölçülmedi) | `~/voicebox/voicebox-main`; `HOLDING-OS-MASTER-PLAN/VOICE_INTERACTION_SPEC.md` §3.2 eki |
| Ses kimliği kaydı | `voice_identities` 1 satır (`speaches:piper`, `tr`); rıza sütunu yok | şirket SELECT; B12 notu |
| Kişinin kendi görüntüsüyle konuşan video | **Ölçülmüş hat yok;** Flux sunucular emekli | `.planning/board-rows/B43.md` |
| Site | `scrollcraft` becerisi; web ofisi planı | `tools/scrollcraft/`; `~/Desktop/DxB Global Web-Studio/` |
| Rehber, e-posta dizisi | H3 atölyesi kurulmadı | §D #19 |

## 2.4 Şirket beyni

| Parça | Durum (2026-11-02) | Yer |
|---|---|---|
| Hafıza yönlendirici | **Var:** pgvector, Obsidian, claude-mem, graphify, notebook bağdaştırıcıları; karantinalı yazma kuralı | `packages/memory-router/src/` (`adapters/pgvector.ts`, `write-policy.ts`) |
| Şirketin hafızası | **Neredeyse boş:** `memory_embeddings` 3, `memory_index` 5 satır | şirket SELECT |
| Gömme modelleri | **Var (Ollama):** `embeddinggemma` (onaylı CPU düzeni), `bge-m3`, `qwen3-embedding:0.6b` | `ollama list`; onay `memory-embeddings-local-cpu-2026-10-15` |
| Dayanak denetçisi | Makinede `bespoke-minicheck` (4,7 GB), hiçbir kod kullanmıyor; araştırma kaydı LettuceDetect v2'yi seçmiş | `ollama list`; `.planning/research/RESEARCH-ENGINE-2026.md:433` |
| Not defteri | `open-notebook` 1.10.0 kapsayıcısı çalışıyor | `docker ps` |
| V2 hafızası | **Onaylı (2026-08-01), kurulmadı:** işçi istemi hafızayı çağırmıyor (`worker-shim.ts`), kapsam sütunu (`memory_index.scope`) hiçbir kodda okunmuyor, hatırlama `DXB_LITELLM_KEY_OS` ister ve anahtar yok | tahta Bölüm 2d, "V2 memory — one brain" satırı (`00-BOARD-OPEN-WORK.md` satır 264) |
| Günlük brifing | **Var (CEO için):** `ceo_briefings` 8 satır, sonuncusu 2026-09-27; `v_morning_briefing` görünümü | şirket SELECT |
| Toplantı dökümü | Kulak var (§2.1) | |
| Drive / Gmail / HubSpot / Asana bağlayıcısı | **Kodda yok;** Claude'un kendi bağlayıcıları var | depo grep; web |
| Rol bazlı asistanlar | Persona fabrikası: `personas` 812 satır, 214 persona dosyası | `packages/hr/src/`; `personas/` |
