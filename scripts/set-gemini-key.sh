#!/usr/bin/env bash
# TAKE THE GEMINI API KEY OFF THE CLIPBOARD AND PUT IT IN .env.daemon.
#
#   bash scripts/set-gemini-key.sh
#
# It exists because the one-liner it replaces could not survive being pasted:
# the path carries spaces, the command substitution carries quotes, and the
# CEO's shell broke on them ("unexpected EOF while looking for matching '").
# Asking the owner of the company to get bash quoting right is the babysitting
# this product exists to end.
#
# HE NEVER PASTES THE KEY ANYWHERE. He clicks the copy button on
# aistudio.google.com/apikey; this reads the clipboard. The key is never printed,
# never echoed, never passed as an argument (arguments are visible in `ps`), and
# .env* is git-ignored, so it cannot reach the repository.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT/.env.daemon"

read_clipboard() {
  if command -v xclip >/dev/null 2>&1; then xclip -selection clipboard -o 2>/dev/null
  elif command -v xsel >/dev/null 2>&1; then xsel --clipboard --output 2>/dev/null
  elif command -v wl-paste >/dev/null 2>&1; then wl-paste 2>/dev/null
  else echo "FAIL no clipboard tool (xclip / xsel / wl-paste)" >&2; return 1
  fi
}

key="$(read_clipboard | tr -d '\r\n[:space:]')"

if [ -z "$key" ]; then
  echo "PANO BOŞ — önce aistudio.google.com/apikey sayfasında kopyalama butonuna basın." >&2
  exit 1
fi

# Shape check, not a secret check. It catches the common miss — copying the row's
# masked label ("...AGRg") or the address bar instead of the key — before a wrong
# value is written and then trusted.
#
# TWO FORMATS, both live. The old AI Studio key is `AIza` + 35 characters. Keys
# minted now come out as `AQ.` + ~50. Measured 2026-08-02: the CEO's freshly
# created key was `AQ.` and this check rejected it, so the first version of this
# guard would have sent him back to the page for a key he was already holding.
# A guard that fails a valid input is worse than no guard — it teaches the owner
# to ignore it.
if ! printf '%s' "$key" | grep -qE '^(AIza[0-9A-Za-z_-]{30,}|AQ\.[0-9A-Za-z_-]{30,})$'; then
  echo "PANODAKİ ŞEY BİR API ANAHTARINA BENZEMİYOR (${#key} karakter)." >&2
  echo "Beklenen: AIza... veya AQ.... ile başlayan tek satır." >&2
  echo "Sayfadaki satırın sağındaki İLK ikona (iki kâğıt şekli) bastığınızdan emin olun." >&2
  exit 1
fi

touch "$ENV_FILE"
chmod 600 "$ENV_FILE"

# Replace an existing line rather than appending a second one: two definitions of
# the same variable is how a rotated key silently keeps using the old value.
if grep -q '^GEMINI_API_KEY=' "$ENV_FILE"; then
  tmp="$(mktemp)"
  grep -v '^GEMINI_API_KEY=' "$ENV_FILE" > "$tmp"
  printf 'GEMINI_API_KEY=%s\n' "$key" >> "$tmp"
  mv "$tmp" "$ENV_FILE"
  chmod 600 "$ENV_FILE"
  echo "GEMINI_API_KEY güncellendi (${#key} karakter) → .env.daemon"
else
  printf 'GEMINI_API_KEY=%s\n' "$key" >> "$ENV_FILE"
  echo "GEMINI_API_KEY yazıldı (${#key} karakter) → .env.daemon"
fi

echo "Anahtarın kendisi hiçbir yerde gösterilmedi. Dosya git'in dışında."
