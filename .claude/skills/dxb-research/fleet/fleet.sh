#!/usr/bin/env bash
# THE FLEET — several hunters in the field at once, each with the whole arsenal and its own
# memory, instead of one agent reading three pages and stopping.
#
# Why it exists, measured 2026-09-17 on the CEO's own question: a single agent FOUND 55
# Reddit threads and 47 X posts and could only open 10 of them — the limit was never the
# tools, it was one brain's reading capacity. Six hunters read six times the ground in the
# same wall-clock, because each carries its own context.
#
# Why the hunters are Sonnet and the commander is Opus, measured the same day on one task
# against a ground truth counted by hand (136 comments):
#     Opus 5    131 comments (96 %)   46 people   $1.98   142 s
#     Sonnet 5  129 comments (95 %)   39 people   $0.88   305 s
#     Haiku 4.5  65 comments (48 %)   29 people   $0.18   147 s  — and reported
#                "no failed doors" while a third of the crowd was unread.
# Sonnet brings 95 % of Opus's harvest for 45 % of the money; Haiku is not cheap, it is
# wrong. Judgment — the commander, the counter-case, the final report — stays on Opus.
#
#   fleet.sh <question-file> <outdir> [--hunters N] [--model NAME] [--timeout S] [--roles a,b,c]
#
# The question is passed as a FILE and handed to each hunter as one argument. It never
# becomes part of a command string (2026-09-17: a query carrying a shell command executed).

set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL="$(cd "$HERE/.." && pwd)"

QF="${1:-}"; OUT="${2:-}"; shift 2 2>/dev/null || true
N=4; MODEL=sonnet; TMO=1500; ROLES=""
while [ $# -gt 0 ]; do
  case "$1" in
    --hunters) N="$2"; shift 2 ;;
    --model)   MODEL="$2"; shift 2 ;;
    --timeout) TMO="$2"; shift 2 ;;
    --roles)   ROLES="$2"; shift 2 ;;
    *) shift ;;
  esac
done
if [ -z "$QF" ] || [ -z "$OUT" ] || [ ! -f "$QF" ]; then
  echo "kullanim: fleet.sh <soru-dosyasi> <cikti-klasoru> [--hunters 4|7] [--model sonnet|opus]" >&2
  exit 2
fi
mkdir -p "$OUT"
QUESTION="$(cat "$QF")"

# The default four are the ones that answer a "what do people prefer" question; the deep
# seven add the measurement, the spoken word and the other languages.
DEFAULT4="crowd rival counter measure"
DEFAULT7="crowd rival code measure video counter foreign"
if [ -n "$ROLES" ]; then PICK="${ROLES//,/ }"
elif [ "$N" -ge 7 ]; then PICK="$DEFAULT7"
elif [ "$N" -le 4 ]; then PICK="$DEFAULT4"
else PICK="$(echo $DEFAULT7 | cut -d' ' -f1-$N)"; fi

echo "soru    : $(head -c 120 "$QF")"
echo "avcilar : $PICK"
echo "beyin   : $MODEL   (komutan Opus'ta kalir)   zaman asimi ${TMO}s"
echo

# ---- THE GROUND IS OPENED BY THE MACHINE, NOT BY A SENTENCE -----------------------------
# Measured twice on 2026-09-17: told in prose to sweep first, 2 of 7 hunters did it, and on
# the repaired prompt 2 of 3. Instruction-following is not a mechanism. So the fleet opens
# the 34-channel ground ITSELF, once, before a single hunter is launched, and hands every
# lane the raw files. Google and DuckDuckGo are therefore searched on EVERY run, by
# construction, and a hunter spends its minutes reading instead of deciding whether to look.
# THE QUESTION FILE MAY CARRY MORE THAN ONE LINE, and every line becomes its own ground.
# Line 1 is his question, verbatim, and it is what the hunters are told to answer. Lines 2+
# are the SAME question in the language the subject actually lives in — usually English —
# plus any token-shaped variant a forge needs. Measured 2026-09-17, and he caught it from
# one glance at the output: asked in Turkish, Google answered in Turkish — datacamp.com/tr
# and a Turkish YouTube short — while the argument itself is being had in English. A door
# that is asked in the wrong language is a door half opened.
GROUND="$OUT/ground"
n_g=0
while IFS= read -r gq || [ -n "$gq" ]; do
  [ -z "$(printf '%s' "$gq" | tr -d '[:space:]')" ] && continue
  n_g=$((n_g+1))
  if [ "$n_g" -eq 1 ]; then d="$GROUND"; else d="$GROUND-$n_g"; fi
  echo "genis zemin $n_g aciliyor (35 kanal): $(printf '%s' "$gq" | head -c 70)"
  bash "$SKILL/scripts/sweep.sh" "$gq" "$d" --tier max --pages 8 > "$OUT/ground-$n_g.log" 2>&1 &
done < "$QF"
wait
GROUND_DIRS=""
for d in "$GROUND" "$GROUND"-*; do [ -d "$d" ] && GROUND_DIRS="$GROUND_DIRS $d"; done
tg=0; tp=0
for d in $GROUND_DIRS; do
  tg=$(( tg + $(ls "$d"/*.raw 2>/dev/null | wc -l) ))
  tp=$(( tp + $(find "$d/pages" -name '*.md' 2>/dev/null | wc -l) ))
done
gsz=0; [ -f "$GROUND/google.raw" ] && gsz=$(wc -c < "$GROUND/google.raw")
gsz2=0; [ -f "$GROUND-2/google.raw" ] && gsz2=$(wc -c < "$GROUND-2/google.raw")
dsz=0; [ -f "$GROUND/duckduckgo.raw" ] && dsz=$(wc -c < "$GROUND/duckduckgo.raw")
echo "   zemin hazir: $n_g dil/sorgu · $tg kanal dosyasi · google ${gsz}+${gsz2} bayt · duckduckgo ${dsz} bayt · okunan sayfa ${tp}"
echo

ARSENAL="$(cat "$HERE/ARSENAL.md")"
launched=0
for role in $PICK; do
  line=$(grep -P "^${role}\t" "$HERE/roles.tsv" | head -1 | cut -f2-)
  [ -z "$line" ] && { echo "!! bilinmeyen rol: $role" >&2; continue; }
  {
    printf '%s\n\n' "$ARSENAL"
    printf 'YOUR LANE — %s\n\n' "$line"
    printf 'THE QUESTION THE FLEET IS ANSWERING:\n%s\n\n' "$QUESTION"
    printf 'THE GROUND IS ALREADY OPEN — the fleet swept 35 channels, in every language of the\n'
    printf 'question, before you were launched. One file per channel, raw, including google.raw\n'
    printf 'and duckduckgo.raw, plus the page bodies it already read:\n'
    for gd in $GROUND_DIRS; do printf '    %s/*.raw   %s/pages/*.md\n' "$gd" "$gd"; done
    printf 'READ WHAT IS YOURS THERE FIRST (`ls`, `head -c`, grep) before you search again;\n'
    printf 'searching for what is already on disk is the laziness this fleet exists to end.\n'
    printf 'Name in block A which of those channels carried something for your lane.\n\n' 
    printf 'Work only your lane. Other hunters are covering the rest; do not duplicate them.\n'
    printf 'Spend your time READING what you find, not searching for more of it.\n'
    printf 'Answer in Turkish. Hand back exactly the six blocks A-F.\n'
  } > "$OUT/prompt-$role.txt"

  (
    s=$(date +%s)
    timeout "$TMO" claude -p "$(cat "$OUT/prompt-$role.txt")" \
        --model "$MODEL" --effort high \
        --permission-mode bypassPermissions \
        --output-format stream-json --verbose \
        > "$OUT/$role.jsonl" 2> "$OUT/$role.err"
    printf 'rc=%s\nsecs=%s\n' "$?" "$(( $(date +%s) - s ))" > "$OUT/$role.meta"
  ) &
  launched=$((launched+1))
  echo "  avci sahada: $role"
done

echo
echo "$launched avci aynı anda çalışıyor — bekleniyor..."
wait
echo

SUMFILE="$OUT/SUMMARY.txt"
python3 "$HERE/merge.py" "$OUT" | tee "$SUMFILE"

# NOTHING IS KEPT BY ITSELF — his ruling, 2026-09-17: *"genel olarak saklanmasin, bir test
# yapilinca commitlemeden once veya uygun bir zamanda sorulsun testi kaydedelim mi diye."*
# The reports stay where they are; the session ASKS him, and saves only if he says yes.
echo
echo "CEVAP HAZIR — SAKLANMADI.  $OUT/HUNTER-*.md"
echo "ONA SOR (committen once): \"bu testi kaydedelim mi?\"  ->  evet derse:"
echo "  bash \"$HERE/keep.sh\" \"$QF\" \"$OUT\" \"$SUMFILE\""
