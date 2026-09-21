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
#   fleet.sh <outdir> --q "<short query>" [--q "..."]... [--dert FILE]
#            [--hunters N] [--model NAME] [--timeout S] [--roles a,b,c]
#
# THE FIRST ARGUMENT IS THE OUTPUT DIR, AND THE QUERIES ARE TYPED BY THE SESSION — a few words
# each, the way a person searches. Measured 2026-09-20: a several-sentence complaint was pushed
# into 37 search boxes unchanged and the boxes answered with nothing, so the paragraph never
# goes to a box: the wall is `shortq.py --gate`, and it stands above the ground and above the
# hunters. Nothing is ever pasted into a command string (2026-09-17: a query carrying a shell
# command executed) — the text travels as one argument.

set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL="$(cd "$HERE/.." && pwd)"

OUT="${1:-}"; shift 2>/dev/null || true
N=4; MODEL=sonnet; TMO=1500; ROLES=""; DERT=""
QUERIES=()
while [ $# -gt 0 ]; do
  case "$1" in
    --q)       QUERIES+=("$2"); shift 2 ;;
    --dert)    DERT="$2"; shift 2 ;;
    --hunters) N="$2"; shift 2 ;;
    --model)   MODEL="$2"; shift 2 ;;
    --timeout) TMO="$2"; shift 2 ;;
    --roles)   ROLES="$2"; shift 2 ;;
    *) shift ;;
  esac
done
if [ ${#QUERIES[@]} -eq 0 ] || [ -z "$OUT" ]; then
  echo "kullanim: fleet.sh <cikti-klasoru> --q \"<kisa sorgu>\" [--q ...] [--dert DOSYA] [--hunters N] [--model sonnet|opus] [--roles a,b]" >&2
  echo "!! DUR: sorgu yok, filo yok. --q ile birkaç kelimelik sorgu ver." >&2
  exit 3
fi

# ── A PARAGRAPH NEVER REACHES A SEARCH BOX ───────────────────────────────────────────────
# Measured 2026-09-20: a several-sentence complaint was handed to this door and fanned out
# unchanged — quora answered NOT_FOUND, hackernews 400 — because no human types a paragraph
# into a search box. So every query is judged by the one owner of that rule BEFORE any ground
# is opened and BEFORE any hunter is launched: one sentence, at most 120 characters, with at
# least one real word in it. The sweep repeats the same judgement one floor below.
for q in "${QUERIES[@]}"; do
  if ! gate_msg="$(python3 "$SKILL/scripts/shortq.py" --gate "$q" 2>&1)"; then
    echo "!! DUR: ${gate_msg}. Arama kutusuna paragraf yazilmaz." >&2
    exit 3
  fi
done

mkdir -p "$OUT"
# WHAT THE HUNTERS ARE TOLD: his own words when the session passed them (context, never
# searched), then the queries the ground was opened with.
QFILE="$OUT/question.txt"
: > "$QFILE"
if [ -n "$DERT" ] && [ -f "$DERT" ]; then
  {
    echo "DERT (CEO'nun kendi cumlesi — ARANMAZ, cevabin bunu karsilamasi gerekir):"
    cat "$DERT"
    echo
  } >> "$QFILE"
fi
{
  echo "SORGULAR (zemin bunlarla acildi):"
  for q in "${QUERIES[@]}"; do echo "  - $q"; done
} >> "$QFILE"
QUESTION="$(cat "$QFILE")"

# The default four are the ones that answer a "what do people prefer" question; the deep
# seven add the measurement, the spoken word and the other languages.
DEFAULT4="crowd rival counter measure"
DEFAULT7="crowd rival code measure video counter foreign"
if [ -n "$ROLES" ]; then PICK="${ROLES//,/ }"
elif [ "$N" -ge 7 ]; then PICK="$DEFAULT7"
elif [ "$N" -le 4 ]; then PICK="$DEFAULT4"
else PICK="$(echo $DEFAULT7 | cut -d' ' -f1-$N)"; fi

echo "sorgular: ${#QUERIES[@]}  ->  $(printf '%s | ' "${QUERIES[@]}")"
echo "avcilar : $PICK"
echo "beyin   : $MODEL   (komutan Opus'ta kalir)   zaman asimi ${TMO}s"
echo

# ---- THE GROUND IS OPENED BY THE MACHINE, NOT BY A SENTENCE -----------------------------
# Measured twice on 2026-09-17: told in prose to sweep first, 2 of 7 hunters did it, and on
# the repaired prompt 2 of 3. Instruction-following is not a mechanism. So the fleet opens
# the 39-channel ground ITSELF, once, before a single hunter is launched, and hands every
# lane the raw files. Google and DuckDuckGo are therefore searched on EVERY run, by
# construction, and a hunter spends its minutes reading instead of deciding whether to look.
# THE LANGUAGE IS DECIDED DELIBERATELY, BY THE SESSION THAT TYPES THE QUERIES. Measured
# 2026-09-17, and he caught it from one glance at the output: asked in Turkish, Google answered
# in Turkish — datacamp.com/tr and a Turkish YouTube short — while the argument itself is being
# had in English. A door asked in the wrong language is a door half opened. So a question that
# lives in two languages is typed as two queries, one per language.
# ONE GROUND PER QUERY. Each `--q` gets its own 39-channel ground, and every query has already
# passed the wall above — one sentence, at most 120 characters — so no sweep is ever handed a
# paragraph again.
GROUND="$OUT/ground"
n_g=0
# FOUR GROUNDS AT A TIME, NEVER ALL OF THEM. Each ground is 39 channels fired in parallel, so
# every extra query multiplies processes: an auditor measured that twenty of them would put 740
# children on a workstation with a freezing history, and one copy-pasted query would do it.
GROUND_PAR=4
for q in "${QUERIES[@]}"; do
  n_g=$((n_g+1))
  if [ "$n_g" -eq 1 ]; then d="$GROUND"; else d="$GROUND-$n_g"; fi
  echo "genis zemin $n_g aciliyor: $(printf '%s' "$q" | head -c 60)"
  # THE SESSION'S OWN QUERY GOES INTO THE BOX AS TYPED, when it is short enough to BE a box
  # query (`--gate-box`: at most six words). A longer one-sentence query still opens a ground —
  # the sentence engines take it whole and the sweep derives the box form itself.
  if python3 "$SKILL/scripts/shortq.py" --gate-box "$q" >/dev/null 2>&1; then
    bash "$SKILL/scripts/sweep.sh" "$q" "$d" --tier max --pages 8 --kisa "$q" > "$OUT/ground-$n_g.log" 2>&1 &
  else
    bash "$SKILL/scripts/sweep.sh" "$q" "$d" --tier max --pages 8 > "$OUT/ground-$n_g.log" 2>&1 &
  fi
  [ $((n_g % GROUND_PAR)) -eq 0 ] && wait
done
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

# THE REPOSITORY IS READ-ONLY TO A HUNTER — AND TOOLS ALONE CANNOT DO THAT.
# Measured live on 2026-09-17 while this was being repaired: with every writing tool refused
# and the MCP servers switched off, the hunter was down to SEVEN tools — and it created a file
# in this repository anyway, with `echo >`, because a hunter needs Bash and Bash writes. A
# permission list is not a wall. bubblewrap is: the repository is bound read-only and the run
# folder is bound writable, so a hunter can read everything it needs and change nothing here.
# Proven on this machine the same hour: `touch` inside the jail answers "Read-only file system".
REPO_ROOT="$(builtin cd "$SKILL/../../.." && pwd)"
# AN ARRAY, NOT A STRING. This repository's own path carries a space — "DxB Global OS" — and an
# unquoted string would have handed bwrap three arguments where one was meant, so the jail would
# have failed to start and the hunters would have run loose with no warning at all. Caught before
# the first real fleet run, on 2026-09-17.
JAIL=()
if command -v bwrap >/dev/null 2>&1; then
  JAIL=(bwrap --dev-bind / / --ro-bind "$REPO_ROOT" "$REPO_ROOT" --bind "$OUT" "$OUT" --bind /tmp /tmp)
else
  echo "!! UYARI: bwrap yok — avcilar depoyu YAZILABILIR gorecek. Bu bir deliktir ve rapora yazilir." >&2
fi

ARSENAL="$(cat "$HERE/ARSENAL.md")"
launched=0
for role in $PICK; do
  line=$(grep -P "^${role}\t" "$HERE/roles.tsv" | head -1 | cut -f2-)
  [ -z "$line" ] && { echo "!! bilinmeyen rol: $role" >&2; continue; }
  {
    printf '%s\n\n' "$ARSENAL"
    printf 'YOUR LANE — %s\n\n' "$line"
    printf 'THE QUESTION THE FLEET IS ANSWERING:\n%s\n\n' "$QUESTION"
    # THE SENTENCE MATCHES THE RUN. It used to say "in every language of the question" on every
    # run, including the single-language ones: measured 2026-09-17, the fleet computed the real
    # number one line above and then told seven hunters something else.
    printf 'THE GROUND IS ALREADY OPEN — the fleet swept 39 channels, in %s language/phrasing(s) of\n' "$n_g"
    printf 'the question, before you were launched. One file per channel, raw, including google.raw\n'
    printf 'and duckduckgo.raw, plus the page bodies it already read:\n'
    for gd in $GROUND_DIRS; do printf '    %s/*.raw   %s/pages/*.md\n' "$gd" "$gd"; done
    printf 'READ WHAT IS YOURS THERE FIRST (`ls`, `head -c`, grep) before you search again;\n'
    printf 'searching for what is already on disk is the laziness this fleet exists to end.\n'
    printf 'Name in block A which of those channels carried something for your lane.\n\n'
    printf 'Work only your lane. Other hunters are covering the rest; do not duplicate them.\n'
    printf 'Spend your time READING what you find, not searching for more of it.\n'
    printf 'Answer in Turkish. Hand back the HUKUM line first, then exactly the six blocks A-F.\n'
    printf 'EVERY voice and EVERY source carries its full address (https://...). A report with no\n'
    printf 'address is named as uncheckable in the summary the CEO reads — measured 2026-09-17,\n'
    printf 'seven lanes touched 1549 sources and cited none of them.\n'
  } > "$OUT/prompt-$role.txt"

  # K1 — WHAT A HUNTER IS ALLOWED TO DO. Measured 2026-09-17 from a hunter's own transcript:
  # seven of them ran AT THE ROOT OF THIS REPOSITORY, in bypassPermissions, holding 115 tools —
  # Write, Edit, NotebookEdit, Task, CronCreate, CronDelete, RemoteTrigger, ScheduleWakeup,
  # SendMessage and a tool that deletes the CEO's cloud documents — and nothing asked. Nothing
  # bad had happened; the risk was structural, and it stood against this project's own audit
  # law: a subagent audits, refutes and sweeps, it NEVER writes.
  #
  # A hunter keeps exactly what its job needs: Bash (it drives crowd.sh, fetch.py and opencli),
  # reading and searching, and the model's own search. Every writing, scheduling and messaging
  # tool is refused by name, and it works in its OWN folder instead of in the repository.
  # Measured live on 2026-09-17 while this was being written: `--allowed-tools` alone left a
  # hunter holding 99 tools — the writing tools were gone, but `Workflow`, `TaskCreate`,
  # `PushNotification`, a browser that runs arbitrary code, and `mcp__claude_ai_Claude_Docs__
  # delete` — the one that deletes the CEO's own cloud documents — were all still there. An
  # allow list that is not exclusive is a suggestion. So the MCP servers are switched off for a
  # hunter (it reaches the outside world through Bash, not through them) and the rest are
  # refused by name. Re-measured after: 20 tools, none of them able to change anything here.
  HUNTER_ALLOW="Bash Read Glob Grep WebSearch WebFetch"
  HUNTER_DENY="Write Edit MultiEdit NotebookEdit Task TaskOutput TaskStop TaskCreate TaskGet TaskList TaskUpdate CronCreate CronDelete CronList RemoteTrigger ScheduleWakeup SendMessage Artifact ArtifactComments ArtifactData Workflow Skill DesignSync PushNotification Monitor EnterWorktree ExitWorktree ListAgents ReportFindings"
  mkdir -p "$OUT/work-$role"
  (
    s=$(date +%s)
    builtin cd "$OUT/work-$role" || exit 9
    timeout "$TMO" "${JAIL[@]}" claude -p "$(cat "$OUT/prompt-$role.txt")" \
        --model "$MODEL" --effort high \
        --permission-mode bypassPermissions \
        --allowed-tools $HUNTER_ALLOW \
        --disallowed-tools $HUNTER_DENY \
        --strict-mcp-config \
        --add-dir "$SKILL" --add-dir "$OUT" \
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

# THE DENOMINATOR IS COUNTED BEFORE IT IS PRINTED. The summary used to take "how many separate
# people" out of a hunter's own sentence: on the one kept run it showed the CEO 783 while that
# hunter's report said, twice, "783 person-rows, NOT de-duplicated … ~10 spoke to the question".
# So the fleet harvests the thread addresses its own ground found and counts the people in them
# with crowd.sh — a script, free, instant, and it never invents.
CROWDF="$OUT/crowd-count.txt"
: > "$CROWDF"
for gd in $GROUND_DIRS; do
  grep -ohE 'https?://(www\.)?(reddit\.com/r/[^ "]+/comments/[^ "]+|news\.ycombinator\.com/item\?id=[0-9]+)' \
    "$gd"/*.raw 2>/dev/null | sed 's/[),.]*$//'
done | sort -u | head -24 > "$OUT/crowd-urls.txt"
if [ -s "$OUT/crowd-urls.txt" ]; then
  echo "kalabalik sayiliyor: $(wc -l < "$OUT/crowd-urls.txt") baslik"
  # HIS RULING, 2026-09-20 — every quote carries the DATE OF ITS THREAD. The ground that
  # found the address is the one that knows it: `created_utc` sits beside `url` in the
  # search rows already on the disk, so it is harvested, never fetched twice.
  python3 "$SKILL/scripts/threaddates.py" $GROUND_DIRS > "$OUT/crowd-dates.tsv" 2>/dev/null || : > "$OUT/crowd-dates.tsv"
  bash "$SKILL/scripts/crowd.sh" "$OUT/crowd-urls.txt" "$OUT/crowd" --workers 6 --dates "$OUT/crowd-dates.tsv" > "$OUT/crowd.log" 2>&1
  grep -m1 '^CROWD-COUNT' "$OUT/crowd.log" > "$CROWDF" 2>/dev/null || true
fi

SUMFILE="$OUT/SUMMARY.txt"
python3 "$HERE/merge.py" "$OUT" --crowd "$CROWDF" | tee "$SUMFILE"
merge_rc=${PIPESTATUS[0]}

# A RUN WHERE NOTHING WAS READ IS NOT A FINISHED RUN. Measured 2026-09-17 by an independent
# auditor: both hunters exited 9, zero reports were produced, and this script printed
# "hicbir avci rapor getirmedi" and "CEVAP HAZIR" in the same breath and left with exit 0.
# The exit code is the only thing a caller can trust, so it now tells the truth, and the
# hunters that died are named rather than counted.
failed=""
for role in $PICK; do
  rc=$(sed -n 's/^rc=//p' "$OUT/$role.meta" 2>/dev/null | head -1)
  [ "${rc:-1}" = "0" ] || failed="$failed $role(kod ${rc:-yok})"
done
reports=$(find "$OUT" -maxdepth 1 -name 'HUNTER-*.md' 2>/dev/null | wc -l)
if [ "$reports" -eq 0 ] || [ "${merge_rc:-1}" -ne 0 ]; then
  echo
  echo "!! KOSU BASARISIZ — $reports avci raporu geldi. Basarisiz avcilar:${failed:- (yok)}"
  echo "   sebepleri: $OUT/*.err"
  exit 1
fi
[ -n "$failed" ] && echo "!! EKSIK AVCI:$failed — bu bir deliktir ve rapora yazilir."

# NOTHING IS KEPT BY ITSELF — his ruling, 2026-09-17: *"genel olarak saklanmasin, bir test
# yapilinca commitlemeden once veya uygun bir zamanda sorulsun testi kaydedelim mi diye."*
# The reports stay where they are; the session ASKS him, and saves only if he says yes.
echo
echo "CEVAP HAZIR — SAKLANMADI.  $OUT/HUNTER-*.md"
echo "ONA SOR (committen once): \"bu testi kaydedelim mi?\"  ->  evet derse:"
echo "  bash \"$HERE/keep.sh\" \"$QFILE\" \"$OUT\" \"$SUMFILE\""
