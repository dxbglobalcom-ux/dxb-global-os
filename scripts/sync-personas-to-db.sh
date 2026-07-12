#!/usr/bin/env bash
# PERSONA SYNC — dosya → DB, TEK YÖN (kayıtlı uyarlama: EMPLOYEE_PERSONA_STANDARD §22 tersi, CEO emri 2026-07-11).
# Kaynak gerçek: personas/<dept>/<slug>.md dosyasındaki "# PERSONA — " ile başlayan gövde.
# DB = runtime + kalite kapısı kopyası; fn_persona_submit secret+injection taramasını içerir.
# "⏳ FABLE-YAZIMI BEKLİYOR" dosyaları ATLANIR (gövdesiz iskelet submit edilmez).
#
# Kullanım:
#   scripts/sync-personas-to-db.sh <dosya>...        # verilen dosyaları submit eder (yeni sürüm açar)
#   scripts/sync-personas-to-db.sh --verify [dosya]  # yazmaz; DB son sürüm ↔ dosya gövdesi hash karşılaştırır
#   (dosya verilmezse personas/*/*.md tümü taranır)
# Gate verdikti AYRI adımdır: fn_persona_gate (Fable 5-soru kontrolü sonrası).
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PSQL=(docker exec -i supabase_db_DxB_Global_OS psql -U postgres -d postgres -At)
MODE="submit"
[ "${1:-}" = "--verify" ] && { MODE="verify"; shift; }

files=("$@")
if [ ${#files[@]} -eq 0 ]; then
  mapfile -t files < <(find "$REPO_DIR/personas" -mindepth 2 -name '*.md' | sort)
fi

extract_body() { # dosyadan persona gövdesi: ilk '# PERSONA — ' satırından sona
  awk '/^# PERSONA — /{f=1} f{print}' "$1"
}

extract_title() { # dosya H1'inden insan-okur unvan: '# <Title> — `slug` (dept)' → <Title>
  grep -m1 '^# ' "$1" | sed 's/^# //; s/ — `.*//'
}

submitted=0; verified=0; mismatched=0; skipped=0; failed=0
for f in "${files[@]}"; do
  slug="$(basename "$f" .md)"
  body="$(extract_body "$f")"
  if [ -z "$body" ]; then
    echo "SKIP  $slug — ⏳ Fable-yazımı bekliyor (persona gövdesi yok)"
    skipped=$((skipped+1)); continue
  fi
  if printf '%s' "$body" | grep -q '\$dxb_body\$'; then
    echo "FAIL  $slug — gövde dollar-quote çakışması"; failed=$((failed+1)); continue
  fi
  emp_id="$("${PSQL[@]}" -c "SELECT id FROM agents WHERE slug='$slug';")"
  if [ -z "$emp_id" ]; then
    echo "FAIL  $slug — agents tablosunda yok"; failed=$((failed+1)); continue
  fi
  if [ "$MODE" = "verify" ]; then
    db_hash="$("${PSQL[@]}" -c "SELECT md5(body_md) FROM personas WHERE employee_id='$emp_id' ORDER BY version DESC LIMIT 1;")"
    file_hash="$(printf '%s\n' "$body" | md5sum | cut -d' ' -f1)"
    if [ "$db_hash" = "$file_hash" ]; then
      echo "MATCH $slug — DB↔dosya gövde eş (md5 $file_hash)"; verified=$((verified+1))
    else
      echo "DIFF  $slug — DB($db_hash) ≠ dosya($file_hash) — sync gerekli"; mismatched=$((mismatched+1))
    fi
  else
    pid="$("${PSQL[@]}" <<SQL
SELECT public.fn_persona_submit('$emp_id'::uuid, \$dxb_body\$$body
\$dxb_body\$, 'fable-5');
SQL
)"
    echo "SUBMIT $slug — persona id: $pid (pending; gate verdikti ayrı adım)"
    # Unvan da dosyadan akar (tek yön, E6.3 fix wave 3): H1 → agents.title
    title="$(extract_title "$f")"
    if [ -n "$title" ]; then
      "${PSQL[@]}" -c "UPDATE agents SET title='${title//\'/\'\'}' WHERE id='$emp_id';" >/dev/null
    fi
    submitted=$((submitted+1))
  fi
done

echo "---"
if [ "$MODE" = "verify" ]; then
  echo "match: $verified · diff: $mismatched · skip(⏳): $skipped · fail: $failed"
  [ $mismatched -eq 0 ] && [ $failed -eq 0 ] && echo "VERIFY: PASS" || { echo "VERIFY: FAIL"; exit 1; }
else
  echo "submit: $submitted · skip(⏳): $skipped · fail: $failed"
  [ $failed -eq 0 ] || exit 1
fi
