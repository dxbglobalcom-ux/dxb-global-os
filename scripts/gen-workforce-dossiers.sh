#!/usr/bin/env bash
# KADRO DOSYALARI backfill — tek seferlik sicil-iskeleti üretici.
# Her DB çalışanı (agents) için personas/<dept>/<slug>.md dosyası basar:
#   üstte 33-alan SİCİL (DB'den bilinenler dolu, kalanlar dürüst işaretli),
#   altta KİŞİLİK bölümü = "⏳ FABLE-YAZIMI BEKLİYOR" (persona yazıldıkça Fable doldurur).
# KURALLAR:
#   - Var olan dosyanın ÜZERİNE ASLA YAZMAZ (Fable-yazımı dosya korunur).
#   - agency-agents metni GÖMÜLMEZ — yalnız "ham madde referansı (SALT REFERANS)" satırı.
#   - Kişilik yazarlığı yapmaz; yalnız mekanik sicil projeksiyonu (CEO K2 ihlali değildir).
# Kullanım: scripts/gen-workforce-dossiers.sh
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PERSONAS_DIR="$REPO_DIR/personas"
PSQL=(docker exec -i supabase_db_DxB_Global_OS psql -U postgres -d postgres -At -F $'\t')
TODAY="$(date +%Y-%m-%d)"

# --- WORKFORCE-GAP-MATRIX §2 kararları (E5.0, CEO onay kalemleri §6) -----------
declare -A MOVE=(
  [engineering-ai-engineer]="data-ai" [engineering-data-engineer]="data-ai"
  [engineering-database-optimizer]="platform" [engineering-sre]="platform"
  [engineering-incident-response-commander]="platform"
  [engineering-security-engineer]="security" [engineering-threat-detection-engineer]="security"
  [accounts-payable-agent]="finance" [supply-chain-strategist]="finance"
  [sales-account-strategist]="customer-success" [sales-pipeline-analyst]="revops"
  [support-analytics-reporter]="data-ai" [support-infrastructure-maintainer]="platform"
  [support-legal-compliance-checker]="legal" [support-executive-summary-generator]="ceo-office"
  [support-support-responder]="customer-success"
  [specialized-chief-of-staff]="ceo-office" [specialized-mcp-builder]="data-ai"
  [specialized-workflow-architect]="data-ai" [specialized-document-generator]="ceo-office"
  [specialized-model-qa]="data-ai" [zk-steward]="data-ai"
  [specialized-developer-advocate]="marketing" [identity-graph-operator]="data-ai"
  [agentic-identity-trust]="security" [automation-governance-architect]="risk-audit"
  [blockchain-security-auditor]="security" [compliance-auditor]="security"
  [corporate-training-designer]="people-hr" [recruitment-specialist]="people-hr"
  [hr-onboarding]="people-hr" [lsp-index-engineer]="engineering"
  [legal-document-review]="legal" [specialized-cultural-intelligence-strategist]="design"
  [sales-data-extraction-agent]="revops"
)
declare -A MERGE=(
  [project-manager-senior]="project-shepherd"
  [support-finance-tracker]="finance/fpa-analyst"
  [customer-service]="customer-success/support-responder"
  [sales-outreach]="sales/outbound-strategist"
  [data-consolidation-agent]="revops/Revenue Reporting Agent"
  [report-distribution-agent]="revops/Revenue Reporting Agent"
)
RETIRE="specialized-civil-engineer government-digital-presales-consultant healthcare-customer-service healthcare-marketing-compliance hospitality-guest-services retail-customer-returns real-estate-buyer-seller loan-officer-assistant study-abroad-advisor legal-billing-time-tracking legal-client-intake language-translator specialized-french-consulting-market specialized-korean-business-navigator specialized-salesforce-architect"
PROMOTE="engineering-software-architect product-manager paid-media-ppc-strategist project-management-studio-producer"

wave_of() { # mevcut departman → yazım dalgası (matris §5.5)
  case "$1" in
    ceo|finance) echo "D1" ;;
    specialized) echo "D1-D3 (move hedefine göre — matris §2)" ;;
    engineering|testing) echo "D4" ;;
    marketing|paid-media) echo "D5" ;;
    sales|support|project-management|design|product) echo "D6" ;;
    social-media) echo "E5.6 (CEO direktifi 2026-07-11 — müdür dalgası sonrası)" ;;
    *) echo "matris §5.5" ;;
  esac
}

decision_of() { # slug → matris kararı satırı
  local s="$1" d="${2:-}"
  [ "$d" = "social-media" ] && { echo "ADD (CEO direktifi 2026-07-11 — 00-CEO-DIRECTIVE-SOCIAL-MEDIA-DEPT; legacy karşılığı yok, sıfırdan Fable yazımı)"; return; }
  for r in $RETIRE; do [ "$r" = "$s" ] && { echo "retire→library ÖNERİSİ (CEO onayı bekler — silme değil arşiv; onaya kadar kadroda pasif)"; return; }; done
  for p in $PROMOTE; do [ "$p" = "$s" ] && { echo "promote+rewrite → departman müdürü (E5.3 müdür dalgası)"; return; }; done
  [ -n "${MERGE[$s]:-}" ] && { echo "merge→${MERGE[$s]} (dosya ölür, rol yaşar — v2 hedef rolde yazılır)"; return; }
  [ -n "${MOVE[$s]:-}" ] && { echo "move→${MOVE[$s]} (+v2 rewrite; taşıma E5.3+ migration'la)"; return; }
  echo "keep (yerinde v2 rewrite)"
}

created=0; skipped=0
while IFS=$'\t' read -r id slug dept role rlevel estatus brain hookv ppath pver; do
  dir="$PERSONAS_DIR/$dept"; file="$dir/$slug.md"
  if [ -e "$file" ]; then skipped=$((skipped+1)); continue; fi
  mkdir -p "$dir"
  wave="$(wave_of "$dept")"; decision="$(decision_of "$slug" "$dept")"
  [ "$rlevel" = "-" ] && rlevel="⏳ E5.3 backfill"
  if [[ "$ppath" == agency-agents/* ]]; then
    hamline="Ham madde referansı (arşivde: ~/dxb-archive/agency-agents-20260711.tar.gz): \`$ppath\` (SALT REFERANS — kişilik DEĞİLDİR; bu dosyaya metni gömülmez)."
    vline="${pver} (legacy stok, aktivasyon dışı); v2 Fable-yazımı BEKLİYOR"
  else
    hamline="Kaynak direktif: \`$ppath\` (rol sözleşmesinin kaynağı; kişilik metni değildir)."
    vline="${pver} (ADD — legacy karşılığı yok); v2 Fable-yazımı BEKLİYOR"
  fi
  cat > "$file" <<EOF
<!-- KADRO DOSYASI — yazım kaynağı BU DOSYADIR; DB = runtime + kalite kapısı kopyası (tek yön: dosya→DB, scripts/sync-personas-to-db.sh).
     Kayıtlı uyarlama: EMPLOYEE_PERSONA_STANDARD §22 tersine çevrildi — CEO emri 2026-07-11.
     Bu iskelet mekanik sicil projeksiyonudur (gen-workforce-dossiers.sh); KİŞİLİK bölümünü yalnız Fable 5 yazar (CEO K2). -->

# ${slug} (${dept})

## SİCİL (33 alan — EMPLOYEE_PERSONA_STANDARD §5)

| # | Alan | Değer |
|---|------|-------|
| 1 | Employee ID | \`${id}\` |
| 2 | İsim | — (isim politikası: uydurma ad yok; rol adıyla anılır) |
| 3 | Unvan | ${slug} (rol adı; v2 yazımında Türkçe unvan netleşir) |
| 4 | Şirket | DXB Global Technology Consultancy (holding) |
| 5 | Departman | ${dept} |
| 6 | Yönetici | ⏳ E5.3'te müdür ataması (\`manager_id\` backfill — matris §5.2) |
| 7 | Alt çalışanlar | — |
| 8 | Kullanılan model | ${brain} (\`agents.brain\`; MODEL_ROUTING_SPEC'e tabi) |
| 9 | Fallback model | kaynak: canlı DB (\`model_catalog.fallback_of\`) — kopya tutulmaz |
| 10 | Temel sorumluluklar | ⏳ v2 yazımında dolar (persona §1, §3) |
| 11 | Yetki sınırları | ⏳ v2 yazımında dolar (persona §4) |
| 12 | Karar kapsamı | ⏳ v2 yazımında dolar (persona §4) |
| 13 | Uzmanlıklar | ⏳ v2 yazımında dolar (persona §2-3) |
| 14 | Deneyim profili | legacy v1 stok (aktivasyon dışı — spec G6); işletim geçmişi \`employee_records\` ile dolar |
| 15 | Metodoloji | ⏳ v2 yazımında dolar (persona §3) |
| 16 | İletişim biçimi | ⏳ v2 yazımında dolar (persona §8) |
| 17 | Raporlama standardı | CEO tablo standardı (✓/⚠/❌ + kanıt) — detay v2 §8 |
| 18 | Kalite standardı | ⏳ v2 yazımında dolar (persona §6) |
| 19 | Risk yaklaşımı | ⏳ v2 yazımında dolar (persona §4-5) |
| 20 | Escalation kuralları | ⏳ v2 yazımında dolar (persona §4, §7) |
| 21 | Skill set | kaynak: canlı DB (\`library_grants\` kind='skill') — kopya tutulmaz |
| 22 | Plugin erişimi | kaynak: canlı DB (\`library_grants\` kind='plugin') |
| 23 | Tool erişimi | kaynak: canlı DB (MCP profili) + v2 §9 |
| 24 | Bilgi kaynakları | ⏳ v2 yazımında dolar (persona §10) |
| 25 | Memory kapsamı | ⏳ v2 yazımında dolar (persona §10) |
| 26 | KPI'lar | ⏳ v2 yazımında dolar (persona §6) |
| 27 | Performans geçmişi | kaynak: canlı DB (\`employee_records.performance_history\`) — işletimle dolar |
| 28 | Hata geçmişi | kaynak: canlı DB (\`employee_records.error_history\`) |
| 29 | Review sonuçları | — (v2 gate bekliyor; legacy stok gate'e giremez — spec G6) |
| 30 | Eğitim ihtiyaçları | kaynak: canlı DB (\`employee_records.training_needs\`) |
| 31 | Versiyon geçmişi | ${vline} |
| 32 | Oluşturan sistem | iskelet: gen-workforce-dossiers.sh (mekanik); kişilik yazarı: fable-5 (bekliyor) |
| 33 | Son güncelleme | ${TODAY} |

Durum: \`${estatus}\` · role: \`${role}\` · role_level: \`${rlevel}\` · hook: \`${hookv}\`
${hamline}

---

## KİŞİLİK — ⏳ FABLE-YAZIMI BEKLİYOR

- Durum: v2 persona henüz yazılmadı; bu çalışan AKTİVE EDİLEMEZ (DB trigger — spec G3).
- Yazar: Fable 5, bizzat (CEO K2 — kalite düşürülerek kapatılamaz).
- Dalga: ${wave} (WORKFORCE-GAP-MATRIX §5.5)
- Matris kararı (E5.0): ${decision}
- Yazıldığında bu bölümün yerini \`# PERSONA — <Unvan>\` başlıklı 11-bölümlük TAM persona alır; \`scripts/sync-personas-to-db.sh\` DB'ye taşır, kalite kapısı verdikti sonrası aktive edilebilir.
EOF
  created=$((created+1))
done < <("${PSQL[@]}" -c "SELECT a.id, a.slug, a.department, a.role, COALESCE(NULLIF(a.role_level,''),'-'), COALESCE(NULLIF(a.employment_status,''),'-'), COALESCE(NULLIF(a.brain,''),'-'), COALESCE(NULLIF(a.hook_version,''),'-'), COALESCE(NULLIF(a.persona_path,''),'-'), COALESCE(NULLIF(a.persona_version,''),'-') FROM agents a ORDER BY a.department, a.slug;")
# NOT: boş alanlar '-' doldurulur — IFS=$'\t' read ardışık boş tab alanlarını ÇÖKERTIR (alan kayması bug'ı, 2026-07-11 düzeltildi)

echo "---"
echo "yeni iskelet : $created"
echo "atlanan (dosyası zaten var): $skipped"
echo "toplam kadro dosyası: $(find "$PERSONAS_DIR" -mindepth 2 -name '*.md' | wc -l)"
