#!/usr/bin/env bash
# personas DB tablosu → repo salt-okunur ayna (KAYITLI UYARLAMA, CEO görünürlüğü)
# Kaynak gerçek: DB (PERSONA spec §22). Bu dosyalar ELLE DÜZENLENMEZ — her koşuda ezilir.
# Kullanım: scripts/export-personas-mirror.sh
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MIRROR_DIR="$REPO_DIR/personas/db-mirror"
PSQL=(docker exec -i supabase_db_DxB_Global_OS psql -U postgres -d postgres -At -F $'\t')

rm -rf "$MIRROR_DIR"
mkdir -p "$MIRROR_DIR"

# satır listesi: id, slug, department, version, author, quality_gate
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
    printf '     ELLE DÜZENLEME YASAK: değişiklik fn_persona_submit ile yeni sürüm olarak yapılır;\n'
    printf '     bu dosya scripts/export-personas-mirror.sh her koşuşunda ezilir.\n'
    printf '     author: %s · quality_gate: %s · version: %s -->\n\n' "$author" "$gate" "$version"
    "${PSQL[@]}" -c "SELECT body_md FROM personas WHERE id = '$pid';"
  } > "$file"
  echo "yazıldı: ${file#$REPO_DIR/}"
done

echo "---"
echo "toplam ayna dosyası: $(find "$MIRROR_DIR" -name '*.md' | wc -l)"
