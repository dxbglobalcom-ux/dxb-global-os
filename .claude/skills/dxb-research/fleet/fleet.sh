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
# wrong. Judgment — the commander, the adversary's verdict, the final report — stays on Opus.
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
DEFAULT4="crowd rival adversary measure"
DEFAULT7="crowd rival code measure video adversary foreign"
if [ -n "$ROLES" ]; then PICK="${ROLES//,/ }"
elif [ "$N" -ge 7 ]; then PICK="$DEFAULT7"
elif [ "$N" -le 4 ]; then PICK="$DEFAULT4"
else PICK="$(echo $DEFAULT7 | cut -d' ' -f1-$N)"; fi

echo "soru    : $(head -c 120 "$QF")"
echo "avcilar : $PICK"
echo "beyin   : $MODEL   (komutan Opus'ta kalir)   zaman asimi ${TMO}s"
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

python3 "$HERE/merge.py" "$OUT"
