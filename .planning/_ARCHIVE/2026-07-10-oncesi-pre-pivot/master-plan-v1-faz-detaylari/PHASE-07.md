# PHASE 07 — MCP Gateway & 24/7 VPS Runtime

**Req:** MCP-02/03, VPS-01/02, VID-01
**Bağımlılık:** Phase 6 (video çıktısı router'dan akar; profiller Phase 3 registry'yi okur). **Phase 10'u sert önceler.**
**Araştırma riski:** Gateway per-department scoping stack'in en az emtialaşmış parçası — faz, ZORUNLU study pass ile açılır (docker/mcp-gateway, ContextForge, Lasso kalıpları). Study pass çıktısı v1 yaklaşımını (profil dosyası) değiştirirse karar Fable'a döner.

## 1. Hedef + Kabul Kapısı

1. Departman MCP profili `tools/list`i FİLTRELER: worker Stripe/DocuSign'ı GÖREMEZ, CEO ajanı kod MCP'si göremez — doc'un departman-MCP haritalarındaki açık redler test edilir
2. Upstream tool description değişimi o aracı karantinaya alır (hash pinning canlı değişimde gösterilir)
3. Compose stack (Supabase, LiteLLM, dxb-mcp, Speaches, open-notebook) EU VPS'te 8GB içinde çalışır; reboot sonrası sağlıklı döner
4. Hermes (GLM 5.2) watchdog + kill switch'li SINIRLI cron işleri koşar; gece çıktısı sabah inceleme kuyruğuna düşer
5. CEO video linki bırakır → indir/transkript/özet/router'dan karantinalı dosyalama, async

## 2. LOCKED Mimari Kararlar

| Karar | Gerekçe |
|---|---|
| v1 gateway = registry'den ÜRETİLEN per-department `.mcp.json` profilleri (+ audit hook) — proxy süreci v2 | ARCHITECTURE Pattern 4; study pass aksini kanıtlarsa ⛔ Fable |
| Profiller elle YAZILMAZ: `packages/gateway` generator, departments/agents tablosu + policy dosyasından derler | Least-privilege registry'den sapamaz |
| Hash pin: `tool_pins` tablosu (server, tool, schema_hash); değişim → `quarantined=true` + audit + CEO alarm; karantinalı araç profillere GİRMEZ | MCP-03, anti rug-pull |
| Hermes: perpetual loop YASAK — cron-tetikli, adım/token bütçeli, tanımlı artifact'lı işler | Pitfall 9 |
| VPS ayrı credential seti: laptop'un eşi DEĞİL; yalnız 7/24 işlerin ihtiyacı | blast radius |
| Speaches compose profile'da on-demand (`--profile voice`) — RAM bütçesi bunu gerektirirse socket-activation | STACK RAM fallback sırası |
| Kill switch: `dxb kill-switch on` → budget_state.hard_stopped + tüm virtual key block + hermes systemd stop; telefon/dashboard'dan erişilebilir (Phase 8'de UI) | Pitfall 9 recovery |

## 3. Dosya-Seviyesi Spec

```
db/migrations/0010_tool_pins.sql
packages/gateway/src/generate-profiles.ts   # registry+policy → profiles/<dept>.mcp.json
packages/gateway/src/pin-check.ts           # kurulumda hash al; cron'da yeniden hash+karşılaştır
packages/gateway/policy/denials.json        # doc'un departman red tabloları (CEO: no-code-mcp; research: no-payment...)
vps/compose.yaml                            # tüm stack; profiller: core / voice / brain
vps/systemd/{dxb-stack.service,hermes.service,watchdog.service}
vps/hermes/{config,jobs/*.md}               # sınırlı iş tanımları (artifact + bütçe zorunlu alan)
packages/workers/src/vps-worker.ts          # queue claim shim (Phase 5 worker'ının VPS ikizi)
tools/video-learn/src/ingest.ts             # yt-dlp → Speaches STT → özet (sonnet) → memory.commit(origin='video')
tests/phase7/{profile-denial,pin-quarantine,reboot,watchdog}.test.ts
```

### 0010_tool_pins.sql (birebir)

```sql
CREATE TABLE tool_pins (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  server      text NOT NULL,
  tool        text NOT NULL,
  schema_hash text NOT NULL,               -- sha256(description + inputSchema JSON, key-sorted)
  quarantined boolean NOT NULL DEFAULT false,
  pinned_at   timestamptz NOT NULL DEFAULT now(),
  last_checked timestamptz,
  UNIQUE (server, tool)
);
ALTER TABLE tool_pins ENABLE ROW LEVEL SECURITY;
```

### RAM bütçe tablosu (8GB — kabul testi bununla ölçülür)

| Servis | Beklenen | Ölçüm komutu |
|---|---|---|
| Supabase stack (trimmed: Storage/Imgproxy kapalı) | ~2.0–2.5GB | `docker stats --no-stream` |
| LiteLLM | ~300–500MB | " |
| dxb-mcp + workers + outbox | ~300MB | " |
| open-notebook | ~500MB–1GB | " |
| Hermes | ~300–500MB | " |
| Speaches (on-demand) | 1–1.5GB yük altında | " |
| Caddy + sistem | ~500MB | `free -m` |
| **Toplam hedef** | **≤7GB tepe** (1GB pay) | reboot testi sırasında kayıt |

Aşarsa fallback sırası (STACK.md): 1) Speaches socket-activation, 2) open-notebook on-demand, 3) DB tier'ı Supabase Cloud'a (⛔ Fable + CEO — bütçe etkisi).

### Hermes sınırlı iş şablonu (her iş dosyası zorunlu alanlar)

```yaml
job: social-morning-scan
schedule: "0 6 * * *"
budget: { max_steps: 30, max_tokens: 150000, max_cost_eur: 0.50 }
artifact: "reports/social-scan-{date}.md"   # tanımlı çıktı — yoksa iş FAIL
on_output: queue_review                      # sabah kuyruğuna; asla doğrudan dışa
```

Watchdog (systemd timer, 5dk): bütçe aşan/artifact'sız 2 saati geçen hermes işini kill + audit + sabah raporuna anomali satırı.

## 4. Adım Listesi (adım = commit)

| # | Adım | Doğrulama |
|---|---|---|
| 1 | **Gateway study pass** (docker/mcp-gateway, ContextForge, Lasso) → study card + v1 yaklaşım teyidi | card `.planning/research/study-cards/`; yaklaşım değişirse ⛔ dur |
| 2 | 0010 + pin-check.ts | mevcut MCP'lerin hash'leri tabloda; sahte description değişimi → quarantined=true + araç profilden düştü |
| 3 | denials.json + generate-profiles.ts | üretilen `profiles/research.mcp.json`ında stripe YOK; `profiles/ceo.mcp.json`ında github/code MCP YOK (grep kanıtı) |
| 4 | Profil-red testi | research profil'li session'da Stripe tool çağrısı "tool not found" (Pitfall 6 "looks done" maddesi) |
| 5 | Hetzner VPS provision + hardening (SSH key-only, ufw, fail2ban) + Caddy | `ssh` girişi; `curl https://<domain>/health` 200 |
| 6 | compose.yaml core profili deploy (Supabase, LiteLLM, dxb-mcp, workers, outbox) | migration'lar VPS DB'de; `docker stats` RAM tablo içinde |
| 7 | Reboot testi | `reboot` → 5dk içinde tüm health check yeşil (systemd enable kanıtı) |
| 8 | Hermes + watchdog + kill switch | bütçe-aşan sahte iş kill edildi; `dxb kill-switch on` → key'ler blocked + hermes stopped |
| 9 | Gece işi → sabah kuyruğu | 06:00 cron çıktısı review kuyruğunda; hiçbir dışa etki yok |
| 10 | video-learn ingest | YouTube link → transkript → özet → memory_index'te origin='video', quarantined |
| 11 | CI gitleaks-action SHA-pin (Phase 1 devri) | workflow'da `@<sha>`; `gh run` yeşil |
| 12 | Faz kapanışı | 5 kriter kanıt satırlarıyla VERIFICATION'da |

## 5. Risk + Fallback

- **RAM aşımı:** yukarıdaki fallback sırası; ölçüm adım 6-7'de zorunlu kayıt.
- **Study pass v1'i çürütürse:** profil-dosyası yaklaşımı yerine proxy gerekirse kapsam Fable'da yeniden planlanır — kör devam YASAK.
- **Hermes upstream değişkenliği:** sürüm kilitle (locked decision); update = study card yenileme.
- **VPS tek nokta:** günlük `pg_dump` + vault off-site; restore prosedürü test edilir (adım 7'ye ek kanıt).

## 6. Bütçe-Fallback İşaretleri

- ⛔ FABLE-ONLY: gateway yaklaşım değişikliği; RAM fallback 3. adımı (Cloud'a taşıma); denials.json genişletmesi; faz kapanışı.
- Opus uygulayabilir: adım 2–11 (denials tabloları doc'tan birebir; compose/systemd kalıpları verili).
