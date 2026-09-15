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
# B36 Block 2: the container is named by DXB_DB_CONTAINER. The DEFAULT is
# unchanged (the company's own stack), so every existing caller behaves exactly
# as before.
# THE CONSTRUCTION SITE DOES NOT USE THIS SCRIPT. It did for one afternoon, and
# that was the defect: it put all 199 of the CEO's authored dossiers into the
# construction database word for word. The construction seed generates its
# people instead (db/seed/generated-workforce.ts) and never reads a dossier.
# This tool stays what it always was — the COMPANY's file-first persona sync,
# where the dossier IS the source.
PSQL=(docker exec -i "${DXB_DB_CONTAINER:-supabase_db_DxB_Global_OS}" psql -U postgres -d postgres -At)
MODE="submit"
[ "${1:-}" = "--verify" ] && { MODE="verify"; shift; }

# AUTHOR — U30 (CEO ruling 2026-07-26): construction authorship is shared between Opus 5 and
# Fable 5, and the model running THIS session is the author. This was hardcoded to 'fable-5'
# until 2026-07-27, so every persona an Opus 5 session synced was filed under the wrong author —
# the ledger-behind-reality class. There is no default on purpose: a silent wrong author is worse
# than a stopped script.
AUTHOR="${DXB_PERSONA_AUTHOR:-}"
if [ "$MODE" = "submit" ] && [ -z "$AUTHOR" ]; then
  echo "HATA: DXB_PERSONA_AUTHOR boş. Bu oturumun yazarını yaz — persona kaydı yazarsız/yanlış yazarla açılmaz." >&2
  echo "  ör: DXB_PERSONA_AUTHOR=opus-5 $0 personas/ceo/agents-orchestrator.md" >&2
  exit 2
fi
case "${AUTHOR:-x}" in
  opus-5|fable-5|x) ;;
  *) echo "HATA: DXB_PERSONA_AUTHOR='$AUTHOR' — U30 yalnız 'opus-5' veya 'fable-5' tanır." >&2; exit 2 ;;
esac

files=("$@")
if [ ${#files[@]} -eq 0 ]; then
  mapfile -t files < <(find "$REPO_DIR/personas" -mindepth 2 -name '*.md' | sort)
fi

# THE RULER (CEO emri 2026-09-15) — bir denetimin cetveli çalıştırılabilir bir betiktir ve iş
# BAŞLAMADAN önce yazarın eline verilir. Kural ihlali olan bir dosya DB'ye girmez: submit modunda
# cetvel bir kez koşar, tablosu basılır ve FAIL alan dosya atlanır (fail closed). Cetvelin sözleşmesi
# tests/personas/persona-ruler.concepts.json — orada adı geçmeyen persona ÖLÇÜLMEZ ve eskisi gibi
# submit edilir; cetvel stüdyonun 16 koltuğu için yazıldı, yazım geçişi emredilmemiş bir departmanın
# önüne dikilmez. --verify modu değişmedi.
declare -A RULER_VERDICT=()
if [ "$MODE" = "submit" ]; then
  ruler_out="$(bash "$REPO_DIR/scripts/persona-ruler.sh" --verdicts "${files[@]}" 2>&1 || true)"
  printf '%s\n' "$ruler_out" | grep -v '^RULER-VERDICT' || true
  while IFS=$'\t' read -r _ rslug rverdict; do
    [ -n "${rslug:-}" ] && RULER_VERDICT["$rslug"]="$rverdict"
  done < <(printf '%s\n' "$ruler_out" | grep '^RULER-VERDICT' || true)
fi

extract_body() { # dosyadan persona gövdesi: ilk '# PERSONA — ' satırından sona
  awk '/^# PERSONA — /{f=1} f{print}' "$1"
}

extract_title() { # SİCİL alan 3 (EN, post-directive): '| 3 | Title | X |' → X
  # TR-dönemi dosyalarda (alan adı "Unvan", H1 karışık dilli) BOŞ döner —
  # DB'deki dil-ayrıştırılmış backfill (migration 20260713010000) ezilmez.
  # `|| true`: Title satırı yok → grep exit 1; set -euo pipefail altında bu
  # scripti öldürüyordu (R1.8 dalgasında ilk dosyada ölüm) — boş dönüş kasıtlı.
  grep -m1 -oP '^\| 3 \| Title \| \K[^|]+' "$1" | sed 's/ *$//' || true
}

submitted=0; verified=0; mismatched=0; skipped=0; failed=0
for f in "${files[@]}"; do
  slug="$(basename "$f" .md)"
  body="$(extract_body "$f")"
  if [ -z "$body" ]; then
    echo "SKIP  $slug — ⏳ Fable-yazımı bekliyor (persona gövdesi yok)"
    skipped=$((skipped+1)); continue
  fi
  if [ "$MODE" = "submit" ] && [ "${RULER_VERDICT[$slug]:-SKIP}" = "FAIL" ]; then
    echo "FAIL  $slug — persona cetveli reddetti (yukarıdaki tablo; kural ihlali olan dosya DB'ye girmez)"
    failed=$((failed+1)); continue
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
    # The psql exit code is NOT trusted alone here: with a heredoc the client can still return 0
    # while the server refused the INSERT. The returned persona id IS the proof of a write, so an
    # empty id is treated as a failure. Measured 2026-07-27: a CHECK-constraint refusal
    # (personas_author_check) printed its error and the run still reported "submit: 1 · fail: 0" —
    # a script that reports success for work the database refused is worse than no script.
    if ! pid="$("${PSQL[@]}" <<SQL
SELECT public.fn_persona_submit('$emp_id'::uuid, \$dxb_body\$$body
\$dxb_body\$, '$AUTHOR');
SQL
)" || [ -z "${pid//[[:space:]]/}" ]; then
      echo "FAIL  $slug — submit reddedildi (DB yazmadı; yukarıdaki hataya bak)"; failed=$((failed+1)); continue
    fi
    echo "SUBMIT $slug — persona id: $pid · author: $AUTHOR (pending; gate verdikti ayrı adım)"
    # Unvan da dosyadan akar (tek yön, E6.3 fix wave 3): dossier Title → agents.title (EN kanonik)
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
