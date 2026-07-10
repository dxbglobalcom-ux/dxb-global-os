# Study Card — Speaches (JARVIS STT/TTS server)

**Studied:** 2026-07-10 (before install — dual-role principle)
**Sources:** speaches.ai (/, /installation/, /usage/text-to-speech/, /usage/speech-to-text/), rhasspy/piper VOICES.md, STACK.md Speaches row
**Consumer:** Phase 09 (09-01 install, 09-03 TTS, 09-04 STT)

## What it is

OpenAI-API-compatible audio server: one container, `/v1/audio/transcriptions` (faster-whisper) + `/v1/audio/speech` (Kokoro / Piper). Dynamic model loading — a request naming a model triggers download into the HF hub cache volume. GPU and CPU images; we pin CPU (VPS parity — STACK lock).

## Install contract (docs-verbatim, adapted names)

```bash
docker run --detach --publish 8969:8000 --name dxb_speaches_local \
  --restart unless-stopped \
  --volume speaches-hf-cache:/home/ubuntu/.cache/huggingface/hub \
  ghcr.io/speaches-ai/speaches:latest-cpu
```

- Container port **8000** fixed; we map host **8969** (local) — VPS profile binds 127.0.0.1 only.
- Docs' example uses `--rm` — dropped deliberately: local runtime must survive reboots like the rest of the stack.
- Volume path is `/home/ubuntu/...` (image runs as ubuntu user) — copying VPS `hf_hub_cache` volume must keep this target path.
- Pin discipline: `latest-cpu` pulled once → record the **digest** (`docker inspect --format '{{index .RepoDigests 0}}'`) and pin that digest in vps/compose.yaml.

## Endpoint contracts

### STT `/v1/audio/transcriptions` (multipart)
- `file=@audio.wav`, `model=<id>`, optional `language=tr`, `response_format=json|text`.
- Model for us: **`Systran/faster-whisper-small`** (MULTILINGUAL — the `faster-distil-whisper-small.en` in docs examples is English-only; using it for TR would silently fail quality — pitfall #1).
- int8 on CPU ≈4× realtime (STACK). Upgrade path if TR accuracy poor: `Systran/faster-whisper-medium` with RAM re-measure (master-plan risk clause).

### TTS `/v1/audio/speech` (JSON)
- Body: `{model, voice, input, response_format(mp3|wav; opus/aac UNSUPPORTED), speed?}`.
- Kokoro id: `speaches-ai/Kokoro-82M-v1.0-ONNX`, example voice `af_heart`.
- **Kokoro has NO Turkish voice** (v1.0 languages: en-US/en-GB, ja, zh, es, fr, hi, it, pt-BR) → master-plan fallback fires at once: **Piper TR** (`tr_TR-dfki-medium`, `tr_TR-fahrettin-medium` exist in the piper voice registry). Exact speaches-side Piper model id is discovered LIVE from the running server's registry (`speaches-cli registry ls --task text-to-speech` / registry HTTP surface) — not guessed; smoke test locks the working id + voice into jarvis.config.json.

### Model management
- Preferred pre-pull: `uvx speaches-cli model download <id>` (or first-request dynamic load — first call latency = full model download; pitfall #2).
- Discovery: `speaches-cli registry ls --task <task>`, `model ls`.

## Pitfalls (recorded before install)

1. **English-only distil default in docs examples** — TR needs multilingual `faster-whisper-small`.
2. **First-call model download latency** — warm both models right after `up`, before any latency measurement or cron reliance.
3. **`--rm` in docs' run example** — kills persistence; use `--restart unless-stopped`.
4. **No documented healthcheck endpoint** — probe candidates live (`/health`, `/v1/models`); wire whatever answers 200 into compose healthcheck (verified, not assumed).
5. **opus/aac unsupported** in TTS response_format — stick to wav (playback) / mp3 (artifacts) only.
6. **Kokoro≠TR** — briefing voice = Piper TR from day one; Kokoro stays for future EN briefing variant (A2 bilingual future-proofing).
7. **OpenAI SDK clients need a non-empty dummy `OPENAI_API_KEY`** against local server — irrelevant for curl/fetch paths, relevant if openai npm client is ever used (we use plain fetch in jarvis — no SDK needed).
8. **RAM**: whisper-small int8 + one Piper voice expected well under 2GB combined, but VPS mem_limit is set from MEASURED `docker stats` RSS after both models warm, + margin — never from this card's expectation.

## Local vs VPS

| | Local (laptop, this phase) | VPS (gated deploy, 09-05) |
|---|---|---|
| Port | 8969 host → 8000 | 127.0.0.1-only bind behind profile `voice` |
| Volume | speaches-hf-cache | hf_hub_cache (declared Phase 7) |
| Image | latest-cpu → digest recorded | SAME digest pin |
| Purpose | build/tests/briefing dev | 24/7 briefing + remote STT |

## Measurements (filled at 09-01 Task 2 execution, 2026-07-10 12:15)

- Image digest: `ghcr.io/speaches-ai/speaches@sha256:21e3df06d842fb7802ab470dd77c25f0e8c0d22950e8d8c6ae886e851af53ef8`
- TTS model live-discovered: `speaches-ai/piper-tr_TR-fahrettin-medium`, voice `fahrettin` (pitfall #6 fired: Kokoro TR yok; wav çıktı 24000 Hz — registry 22050 der, gerçek dosyaya güven)
- TTS TR latency (Piper, 1 cümle): cold 2.38s / **warm 0.67s**
- STT TR latency (small int8, 3.24s wav): **16.6–20.2s** (3 koşu, back-to-back — model yüklüyken ham hız). X230 i7-3520M (2C/4T, 2012) kısıtı; STACK "4× realtime" modern CPU varsayımı. **VPS'te 09-05 deploy'da yeniden ölçülür; bu sayı VPS'e taşınmaz.**
- Container RSS after both warm: **1.529 GiB** → vps mem_limit 2560M (margin dahil; whisper-medium upgrade bu limite SIĞMAZ — bilinçli kısıt, TR doğruluk sorunu çıkarsa limit+ölçüm birlikte revize)
- Round trip kanıtı: TTS "Günaydın. Gece üç görev tamamlandı, altı onay bekliyor." → STT `{"text":"Günaydın, gece 3 görev tamamlandı, 6 onay bekliyor."}` — "onay" ✓ (evidence: /var/tmp/dxb/speaches-run.md)
- Pitfall #9 (canlı bulundu): model kurulu değilken `/v1/audio/speech` sessizce **JSON hata** döner, wav değil — client wav bekliyorsa Content-Type kontrolü şart (obs 3024 kök nedeni)

---

**⛔ FABLE VERDICT:** Study PASS — endpoints, model matrix, TR reality (Kokoro yok → Piper TR), pin+persistence pitfalls kayıtlı; kurulum komutu ve canlı-doğrulama adımları karta gömülü. Install may proceed. — Fable 5, 2026-07-10
