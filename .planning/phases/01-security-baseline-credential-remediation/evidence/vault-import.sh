#!/usr/bin/env bash
# vault-import.sh — "passwords and API keys.odt" -> Bitwarden kasası.
# Değerler SADECE bu makinede ve RAM'de (/dev/shm) işlenir; hiçbir AI
# konuşmasına, log'a veya kalıcı diske yazılmaz. Önizleme maskelidir.
set -euo pipefail
export PATH="$HOME/.local/bin:$PATH"

ODT=""
for d in "$HOME/Desktop" "$HOME/Masaüstü"; do
  [ -f "$d/passwords and API keys.odt" ] && ODT="$d/passwords and API keys.odt" && break
done
[ -n "$ODT" ] || { echo "HATA: passwords and API keys.odt masaüstünde yok"; exit 1; }

WORK=$(mktemp -d /dev/shm/bwimp.XXXXXX)
trap 'rm -rf "$WORK"' EXIT

echo "[1/5] .odt metne çevriliyor (yerel, LibreOffice)..."
soffice --headless --convert-to txt:Text --outdir "$WORK" "$ODT" >/dev/null 2>&1
TXT="$WORK/passwords and API keys.txt"
[ -f "$TXT" ] || { echo "HATA: dönüştürme başarısız"; exit 1; }

echo "[2/5] Ayrıştırılıyor..."
CSV="$WORK/import.csv"
python3 - "$TXT" "$CSV" <<'PYEOF'
import csv, re, sys

txt_path, csv_path = sys.argv[1], sys.argv[2]
raw = open(txt_path, encoding="utf-8", errors="replace").read()

blocks = [b.strip() for b in re.split(r"\n\s*\n", raw) if b.strip()]
rows = []
USER_L = re.compile(r"^(user(name)?|e-?mail|login|kullanıcı|hesap)\s*[:=]\s*(.+)$", re.I)
PASS_L = re.compile(r"^(pass(word)?|pwd|şifre|parola)\s*[:=]\s*(.+)$", re.I)
KEY_L  = re.compile(r"^(api[_ -]?key|key|token|secret|anahtar)\s*[:=]\s*(.+)$", re.I)
URL_L  = re.compile(r"(https?://\S+)", re.I)
GEN_L  = re.compile(r"^([^:=\n]{1,40})\s*[:=]\s*(.+)$")

for b in blocks:
    lines = [l.strip() for l in b.splitlines() if l.strip()]
    if not lines:
        continue
    name = lines[0][:60].rstrip(":= ")
    user = pw = uri = ""
    notes = []
    for l in lines[1:]:
        m = USER_L.match(l)
        if m: user = user or m.group(3).strip(); continue
        m = PASS_L.match(l)
        if m: pw = pw or m.group(3).strip(); continue
        m = KEY_L.match(l)
        if m: pw = pw or m.group(2).strip(); continue
        m = URL_L.search(l)
        if m and not uri: uri = m.group(1).strip(); continue
        if "@" in l and " " not in l and not user: user = l; continue
        m = GEN_L.match(l)
        if m and not pw and len(m.group(2).strip()) >= 8:
            pw = m.group(2).strip(); notes.append("etiket: " + m.group(1).strip()); continue
        notes.append(l)
    if not (user or pw):
        # tek satırlık blok ya da ayrıştırılamayan — nota koy, kaybolmasın
        notes = lines[1:] if len(lines) > 1 else []
        if len(lines) == 1:
            continue
    rows.append({"name": name, "user": user, "pw": pw, "uri": uri,
                 "notes": " | ".join(notes)})

def mask(v):
    if not v: return "-"
    return v[:2] + "*" * max(1, len(v) - 4) + v[-2:] if len(v) > 4 else "****"

print()
print(f"{'KAYIT':30} {'KULLANICI':28} {'ŞİFRE/KEY':14} URI")
for r in rows:
    print(f"{r['name'][:29]:30} {(r['user'] or '-')[:27]:28} {mask(r['pw']):14} {r['uri'][:30] or '-'}")
print(f"\nToplam {len(rows)} kayıt ayrıştırıldı.")

with open(csv_path, "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["folder","favorite","type","name","notes","fields","reprompt",
                "login_uri","login_username","login_password","login_totp"])
    for r in rows:
        w.writerow(["DXB rotasyon 2026-07-06","", "login", r["name"], r["notes"],
                    "", "", r["uri"], r["user"], r["pw"], ""])
PYEOF

echo
read -rp "[3/5] Tablo doğru mu? Düzeltmek istersen 'e' (editör açılır), doğruysa ENTER: " ans
if [ "${ans:-}" = "e" ]; then "${EDITOR:-nano}" "$CSV"; fi

echo "[4/5] Bitwarden girişi (master şifren sorulacak — sadece Bitwarden'a gider)..."
STATUS=$(bw status 2>/dev/null | python3 -c "import sys,json;print(json.load(sys.stdin)['status'])" || echo unauthenticated)
case "$STATUS" in
  unauthenticated) SESSION=$(bw login dxbglobalcom@gmail.com --raw) ;;
  locked)          SESSION=$(bw unlock --raw) ;;
  unlocked)        SESSION=$(bw unlock --raw) ;;
esac
[ -n "${SESSION:-}" ] || { echo "HATA: giriş başarısız"; exit 1; }

echo "[5/5] Kasaya aktarılıyor..."
bw import bitwardencsv "$CSV" --session "$SESSION"
bw sync --session "$SESSION" >/dev/null
COUNT=$(bw list items --folderid null --session "$SESSION" 2>/dev/null | python3 -c "import sys,json;print(len(json.load(sys.stdin)))" || echo "?")
echo
echo "✓ Aktarım bitti. Kasadaki toplam kayıt: yaklaşık $COUNT (web kasada 'DXB rotasyon' klasörüne bak)."
echo
read -rp "Masaüstündeki 'passwords and API keys.odt' artık kasada — GÜVENLİ SİLİNSİN Mİ? (geri dönüşü yok) [y/N]: " del
if [ "${del:-}" = "y" ] || [ "${del:-}" = "Y" ]; then
  shred -u "$ODT" && echo "✓ odt güvenli silindi (shred)."
else
  echo "⚠ odt masaüstünde duruyor — düz metin şifre dosyası. En kısa zamanda sil."
fi
echo "Bitti. Bu terminali kapatabilirsin."
