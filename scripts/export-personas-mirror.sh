#!/usr/bin/env bash
# DB → repo salt-okunur KADRO AYNASI (kayıtlı uyarlama, CEO görünürlüğü)
# Her çalışan (agents satırı) bir sicil kartı dosyası alır; v2 personası olanlar
# ayrıca tam persona metni dosyası alır. Kaynak gerçek: DB. ELLE DÜZENLENMEZ.
# Kullanım: scripts/export-personas-mirror.sh
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MIRROR_DIR="$REPO_DIR/personas/db-mirror"
PSQL=(docker exec -i supabase_db_DxB_Global_OS psql -U postgres -d postgres -At -F $'\t')

rm -rf "$MIRROR_DIR"
mkdir -p "$MIRROR_DIR"

# ---- 1) sicil kartları: HER çalışan ----------------------------------------
"${PSQL[@]}" -c "
  SELECT a.slug, a.department, a.role, COALESCE(a.role_level,'—'),
         a.employment_status, a.brain, a.persona_version, COALESCE(a.hook_version,'—'),
         a.persona_path,
         COALESCE(p.version::text,''), COALESCE(p.quality_gate,''), COALESCE(p.author,'')
    FROM agents a
    LEFT JOIN personas p ON p.id = a.persona_id
   ORDER BY a.department, a.slug;
" | while IFS=$'\t' read -r slug dept role rlevel estatus brain pver hookv ppath v2ver v2gate v2author; do
  dir="$MIRROR_DIR/$dept"
  mkdir -p "$dir"
  file="$dir/${slug}.card.md"
  {
    printf '<!-- AUTO-GENERATED — kaynak: DB agents tablosu; scripts/export-personas-mirror.sh ezer -->\n'
    printf '# ÇALIŞAN — %s\n\n' "$slug"
    printf '| Alan | Değer |\n|---|---|\n'
    printf '| Departman | %s |\n' "$dept"
    printf '| Rol | %s |\n' "$role"
    printf '| Seviye (role_level) | %s |\n' "$rlevel"
    printf '| Durum | %s |\n' "$estatus"
    printf '| Model (brain) | %s |\n' "$brain"
    printf '| Persona sürümü | %s |\n' "$pver"
    printf '| Hook | %s |\n' "$hookv"
    if [ -n "$v2ver" ]; then
      printf '| **v2 persona** | ✓ v%s · %s · %s → [`%s.v%s.%s.md`](./%s.v%s.%s.md) |\n' \
        "$v2ver" "$v2gate" "$v2author" "$slug" "$v2ver" "$v2gate" "$slug" "$v2ver" "$v2gate"
    else
      printf '| **v2 persona** | ⏳ Fable v2 yazımı bekliyor (E5 dalga planı: WORKFORCE-GAP-MATRIX §5) |\n'
    fi
    printf '| Legacy kaynak | `%s` |\n' "$ppath"
  } > "$file"
done

# ---- 2) v2 persona tam metinleri --------------------------------------------
"${PSQL[@]}" -c "
  SELECT p.id, a.slug, a.department, p.version, p.author, p.quality_gate
    FROM personas p JOIN agents a ON a.id = p.employee_id
   ORDER BY a.department, a.slug, p.version;
" | while IFS=$'\t' read -r pid slug dept version author gate; do
  dir="$MIRROR_DIR/$dept"
  mkdir -p "$dir"
  file="$dir/${slug}.v${version}.${gate}.md"
  {
    printf '<!-- AUTO-GENERATED MIRROR — kaynak gerçek: DB personas tablosu (id: %s).\n' "$pid"
    printf '     ELLE DÜZENLEME YASAK: değişiklik fn_persona_submit ile yeni sürüm olarak yapılır.\n'
    printf '     author: %s · quality_gate: %s · version: %s -->\n\n' "$author" "$gate" "$version"
    "${PSQL[@]}" -c "SELECT body_md FROM personas WHERE id = '$pid';"
  } > "$file"
done

echo "---"
echo "sicil kartı: $(find "$MIRROR_DIR" -name '*.card.md' | wc -l)"
echo "v2 persona:  $(find "$MIRROR_DIR" -name '*.v*.md' | wc -l)"
echo "departman:   $(find "$MIRROR_DIR" -mindepth 1 -maxdepth 1 -type d | wc -l)"
