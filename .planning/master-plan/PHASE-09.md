# PHASE 09 — JARVIS Voice Layer

**Req:** VOICE-01/02
**Bağımlılık:** Phase 8 (briefing cockpit verisini okur; sesli teyitler onay inbox'ına düşer)
**İlke:** Ses = aynı kernel'in İNCE ikinci istemcisi. Sıfır ekstra yetki, sıfır bağımsız state (mimari boundary kuralı).

## 1. Hedef + Kabul Kapısı

1. Sabah brifingi: gece işleri + onay kuyruğu + maliyet sözlü özeti (Speaches TTS, Türkçe)
2. Sözlü komut STT → kernel intent yolu → command bar'la BİREBİR aynı sonuç (testle kanıtlı: aynı intent metni, aynı görev zinciri)
3. Ses-tetikli gated eylem yine onay inbox'ından ekran teyidi ister — ses tek başına dışa eylem YÜRÜTEMEZ (negatif test)

## 2. LOCKED Kararlar

| Karar | Gerekçe |
|---|---|
| Speaches VPS'te tek container: `/v1/audio/transcriptions` (faster-whisper small int8) + `/v1/audio/speech` (Kokoro-82M; Piper fallback) | STACK kilidi; CPU-only |
| jarvis app'i kernel'e dashboard'un kullandığı AYNI seam'den bağlanır; kendi DB erişimi YOK | ince istemci |
| Laptop istemcisi: voicebox push-to-talk / openWakeWord — yalnız yakalama+çalma; karar VPS/kernel'de | JARVIS input capture local |
| Onay kelimeleri ("onayla", "approve") STT'den gelirse SADECE inbox item referansı üretir; karar yine dashboard çift-teyit | UX pitfall: yanlış duyma |
| Brifing içeriği tek SQL görünümden (`v_morning_briefing`): gece task_events özeti + pending approvals + 24h maliyet | tek kaynak; ajan "brifing yazmaz" |

## 3. Dosya-Seviyesi Spec

```
db/migrations/0012_briefing_view.sql   # v_morning_briefing (SQL view)
apps/jarvis/src/{briefing.ts,listen.ts,speak.ts,client.ts}
vps/compose.yaml                        # voice profiline speaches eklenir (Phase 7 dosyası günceller)
tests/phase9/{parity,gate-negative}.test.ts
```

`briefing.ts`: view'i okur → Türkçe metin şablonu (sonnet-5 toparlama, routing_rules'tan) → Speaches TTS → ses dosyası + cron 07:00 telefona/hoparlöre. `listen.ts`: ses → STT → metin → kernel `dxb intent` yolu.

## 4. Adım Listesi

| # | Adım | Doğrulama |
|---|---|---|
| 1 | Speaches study→install; voice profile deploy | `curl /v1/audio/speech` TR cümle → wav döner; RAM tablo içinde |
| 2 | 0012 view | `SELECT * FROM v_morning_briefing` 3 blok döner |
| 3 | briefing.ts + cron | 07:00 cron ses dosyası üretti; içerik view'le eşleşir (⚠ ses kalitesi CEO kulağı) |
| 4 | listen.ts STT→kernel parite | aynı intent yazılı vs sesli → task_events zincirleri eşdeğer (parity test) |
| 5 | Gated negatif test | sesli "ödemeyi onayla" → approvals hâlâ pending; yalnız inbox highlight |
| 6 | Faz kapanışı | 3 kriter kanıtlı |

## 5. Risk + Fallback

- **TR STT doğruluğu (whisper small):** parity testi TR cümlelerle; yetersizse model `medium` int8'e yükselir (RAM ölçümüyle) — kalite maliyete kurban edilmez.
- **Kokoro TR sesi zayıfsa:** Piper TR sesi fallback; ikisi de zayıfsa brifing metin+kısa TTS özet moduna düşer (⛔ Fable kararı).

## 6. Bütçe-Fallback İşaretleri

- ⛔ FABLE-ONLY: STT/TTS model değişimi kararı; faz kapanışı.
- Opus uygulayabilir: adım 1–5 tamamı.
