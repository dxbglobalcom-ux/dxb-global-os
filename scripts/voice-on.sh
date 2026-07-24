#!/usr/bin/env bash
# One-command voice activation (complaint ledger 1a-1e, 2026-07-24).
# Starts the self-hosted Speaches STT/TTS container, waits for health, warms
# the STT model with a real TTS->STT roundtrip, prints one decisive line.
# Usage: scripts/voice-on.sh   (idempotent — safe to run when already up)
set -euo pipefail

CONTAINER="${DXB_SPEACHES_CONTAINER:-dxb_speaches_local}"
URL="${DXB_SPEACHES_URL:-http://127.0.0.1:8969}"
STT_MODEL="${DXB_STT_MODEL:-Systran/faster-whisper-small}"

if ! docker inspect "$CONTAINER" >/dev/null 2>&1; then
  echo "VOICE FAIL: container '$CONTAINER' does not exist" >&2
  exit 1
fi

docker start "$CONTAINER" >/dev/null

for _ in $(seq 1 45); do
  if curl -fsS -o /dev/null "$URL/health" 2>/dev/null; then
    healthy=1
    break
  fi
  sleep 2
done
if [ "${healthy:-0}" != "1" ]; then
  echo "VOICE FAIL: $URL/health not answering after 90s" >&2
  exit 1
fi

# Warm the STT model so the CEO's first dictation is not the cold-load victim:
# synthesize one Turkish word, transcribe it back.
tmp="$(mktemp --suffix=.wav)"
trap 'rm -f "$tmp"' EXIT
curl -fsS -X POST "$URL/v1/audio/speech" \
  -H "Content-Type: application/json" \
  -d '{"model":"speaches-ai/piper-tr_TR-fahrettin-medium","voice":"fahrettin","input":"Merhaba.","response_format":"wav"}' \
  -o "$tmp"
text="$(curl -fsS -X POST "$URL/v1/audio/transcriptions" \
  -F "file=@$tmp" -F "model=$STT_MODEL" -F "language=tr" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("text",""))')"
if [ -z "$text" ]; then
  echo "VOICE FAIL: STT warm-up returned empty transcript" >&2
  exit 1
fi

echo "VOICE ON: $CONTAINER healthy at $URL, STT '$STT_MODEL' warm (heard: $text)"
