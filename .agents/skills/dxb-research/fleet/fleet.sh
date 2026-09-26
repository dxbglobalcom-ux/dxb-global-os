#!/usr/bin/env bash
# THE FLEET — several hunters in the field at once, each with the whole arsenal and its own
# memory, instead of one agent reading three pages and stopping.
#
# Why it exists, measured 2026-09-17 on the CEO's own question: a single agent FOUND 55
# Reddit threads and 47 X posts and could only open 10 of them — the limit was never the
# tools, it was one brain's reading capacity. Six hunters read six times the ground in the
# same wall-clock, because each carries its own context.
#
# EACH HUNTER OWNS PLATFORMS, NOT A TOPIC (2026-09-26). On the run he rejected on 2026-09-24 the
# ground found 294 X addresses and the answer cited none of them (the lead's count, EVIDENCE-B56);
# the named cause: reading was split by topic, so X belonged to no one, and nobody asked a hunter
# to account for what it left unread. Now every platform has exactly one owner in a run
# (roles.tsv: name · platforms · brief), every address the ground found is a row of the run's
# ledger BEFORE a hunter starts (scripts/evidence.py), and each hunter is handed the unread rows
# of its platforms with one brief: read every address; every quote goes in through
# `evidence.py add`; a door you could not open is recorded by `evidence.py fetch`, never skipped
# in silence.
#
# THE HUNTERS ARE claude-opus-5-5, EFFORT: LOW — his order, 2026-09-26, in his words:
#   "opus 5.5 low olanlar olsun avcılar ve kesinlikle geçmişteki hatalar yapılmasın. neredeyse
#    tüm sosyal medyaya girebiliyoruz toplanan bilgiler çöpe atılmasın hemen. 100 bilgi gelior
#    konuyla iligli adam 2 sini alıp diğerlerini çöze atıor"
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
# EVERY opencli IN THE FLEET GOES THROUGH bin/opencli (2026-09-24): the grounds' and the hunters'.
# For the grounds this export is enough. For a hunter it is not: its Bash tool sources the login
# shell snapshot, and ~/.bashrc puts ~/.npm-global/bin (the real opencli) back in front of it.
# Claude Code sources CLAUDE_ENV_FILE AFTER that snapshot (read in the 2.1.281 binary, not yet
# watched in a live hunter), so each hunter is handed the shim through that file below.
export PATH="$SKILL/bin:$PATH"

OUT="${1:-}"; shift 2>/dev/null || true
N=4; MODEL=claude-opus-5-5; TMO=600; ROLES=""; DERT=""
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
  echo "kullanim: fleet.sh <cikti-klasoru> --q \"<kisa sorgu>\" [--q ...] [--dert DOSYA] [--hunters N] [--model AD] [--timeout SN] [--roles a,b]" >&2
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
# ABSOLUTE FROM HERE ON: a hunter works inside $OUT/work-<role>, and every path its prompt hands it
# — the ledger, its address list, the three commands — must still point at this run from there.
OUT="$(builtin cd "$OUT" && pwd)" || { echo "!! DUR: cikti klasoru acilamadi." >&2; exit 1; }
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

# SEVEN HUNTERS, EACH THE OWNER OF ITS PLATFORMS (roles.tsv). The default four read where people
# talk — X, video, the forums — plus the counter-case; the deep seven add the professionals, the
# code and the other languages. The seven START with the four, so every size from four up keeps
# `counter`, the hunter that owns every platform no other hunter of the run owns.
DEFAULT4="x video forums counter"
DEFAULT7="x video forums counter pro code foreign"
if [ -n "$ROLES" ]; then PICK="${ROLES//,/ }"
elif [ "$N" -ge 7 ]; then PICK="$DEFAULT7"
elif [ "$N" -le 4 ]; then PICK="$DEFAULT4"
else PICK="$(echo $DEFAULT7 | cut -d' ' -f1-$N)"; fi

echo "sorgular: ${#QUERIES[@]}  ->  $(printf '%s | ' "${QUERIES[@]}")"
echo "avcilar : $PICK"
echo "beyin   : $MODEL · efor: low   zaman asimi ${TMO}s"
echo

# ---- THE GROUND IS OPENED BY THE MACHINE, NOT BY A SENTENCE -----------------------------
# Measured twice on 2026-09-17: told in prose to sweep first, 2 of 7 hunters did it, and on
# the repaired prompt 2 of 3. Instruction-following is not a mechanism. So the fleet opens
# the ground ITSELF — every channel of the map — once, before a single hunter is launched, and
# turns what it found into the ledger's rows. Google and DuckDuckGo are therefore searched on
# EVERY run, by construction, and a hunter spends its minutes reading instead of deciding
# whether to look.
# THE LANGUAGE IS DECIDED DELIBERATELY, BY THE SESSION THAT TYPES THE QUERIES. Measured
# 2026-09-17, and he caught it from one glance at the output: asked in Turkish, Google answered
# in Turkish — datacamp.com/tr and a Turkish YouTube short — while the argument itself is being
# had in English. A door asked in the wrong language is a door half opened. So a question that
# lives in two languages is typed as two queries, one per language.
# ONE GROUND PER QUERY. Each `--q` gets its own ground, and every query has already
# passed the wall above — one sentence, at most 120 characters — so no sweep is ever handed a
# paragraph again.
GROUND="$OUT/ground"
n_g=0
# FOUR GROUNDS AT A TIME, NEVER ALL OF THEM. Each ground fires every channel of the map in
# parallel, so every extra query multiplies processes: an auditor measured that twenty of them
# would put 740 children on a workstation with a freezing history, and one copy-pasted query
# would do it.
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

# ── THE GROUND BECOMES THE LEDGER, BEFORE A SINGLE HUNTER IS LAUNCHED ──────────────────────────
# What the ground found used to live in raw files that no hunter was made to account for: on the
# run he rejected, 294 X addresses were found and none reached the answer. Now every address
# becomes a row of $OUT/evidence.jsonl here — a body the channel already carried (an X post's full
# text, a Reddit selftext) becomes an evidence row at once — and the hunters are handed ROWS.
# NO LEDGER, NO FLEET: a hunter whose `fetch` and `add` have nowhere to write would spend its
# minutes on reading that cannot be kept, so the run stops here, named, before any hunter starts.
EVI="$SKILL/scripts/evidence.py"
if [ ! -f "$EVI" ]; then
  echo "!! KOSU BASARISIZ — defter yok: $EVI bulunamadi. Hicbir avci baslatilmadi."
  exit 1
fi
python3 "$EVI" from-ground "$OUT" > "$OUT/from-ground.txt" 2> "$OUT/from-ground.err"
fg_rc=$?
if [ "$fg_rc" -ne 0 ]; then
  echo "!! KOSU BASARISIZ — zemin deftere yazilamadi (evidence.py from-ground, kod $fg_rc): $OUT/from-ground.err. Hicbir avci baslatilmadi."
  exit 1
fi
echo "   defter hazir: $OUT/evidence.jsonl"
sed 's/^/      /' "$OUT/from-ground.txt"
echo

# ── EVERY PLATFORM HAS EXACTLY ONE OWNER IN THE RUN ─────────────────────────────────────────────
# roles.tsv, column 2: a hunter's platforms, in the words of the one classifier (scripts/platforms.py,
# read back through `evidence.py from-ground` and `list`). `rest` is every platform no other hunter
# of THIS run owns — the open web, and the platforms of the hunters --hunters/--roles left out.
# A platform nobody owns is NAMED here; its rows stay in the ledger and in the coverage table.
role_platforms() { awk -F'\t' -v r="$1" '$1 == r { print $2; exit }' "$HERE/roles.tsv"; }
open_rows() { awk -F'\t' 'NF && $4 != "blocked" && $4 != "dead"' "$1"; }   # a list minus its closed doors
OWNED=" "; REST_OWNER=""
for role in $PICK; do
  p="$(role_platforms "$role")"
  if [ "$p" = "rest" ]; then REST_OWNER="$role"; else OWNED="$OWNED$p "; fi
done
REST=""
for p in $( { cut -f2 "$HERE/roles.tsv" | tr ' ' '\n'; echo web; sed -n 's/^platform=\([^ ]*\).*/\1/p' "$OUT/from-ground.txt"; } \
            | grep -vx 'rest' | awk 'NF && !seen[$0]++' ); do
  case "$OWNED" in *" $p "*) ;; *) REST="$REST $p" ;; esac
done
REST="${REST# }"
if [ -n "$REST" ] && [ -z "$REST_OWNER" ]; then
  echo "!! SAHIPSIZ PLATFORM: $REST — bu kosuda okuyan avci yok; satirlari defterde durur, kapsama tablosunda gorunur."
fi

# THE REPOSITORY IS READ-ONLY TO A HUNTER — AND TOOLS ALONE CANNOT DO THAT.
# Measured live on 2026-09-17 while this was being repaired: with every writing tool refused
# and the MCP servers switched off, the hunter was down to SEVEN tools — and it created a file
# in this repository anyway, with `echo >`, because a hunter needs Bash and Bash writes. A
# permission list is not a wall. bubblewrap is: the repository is bound read-only and the run
# folder is bound writable, so a hunter can read everything it needs and change nothing here.
# Proven on this machine the same hour: `touch` inside the jail answers "Read-only file system".
# The run folder is where `evidence.py fetch` and `add` write the ledger, the bodies and the lock —
# measured inside this jail on 2026-09-26: an append to $OUT/evidence.jsonl, a file in $OUT/bodies
# and an flock on $OUT/evidence.lock succeed, and `touch` in the repository still answers
# "Read-only file system".
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
HUNTER_ENV="$OUT/hunter-env.sh"
printf 'export PATH=%q:"$PATH"\n' "$SKILL/bin" > "$HUNTER_ENV"
# THE LAST MINUTES ARE FOR THE LINES. The clock stops a hunter at $TMO seconds, and a hunter stopped
# before it answers leaves no report at all (its rows in the ledger survive). So it is given the
# wall-clock time to stop reading: 90 s before the end, or a quarter of a short run.
WRAP=90; [ "$TMO" -lt 360 ] && WRAP=$(( TMO / 4 ))
launched=0
for role in $PICK; do
  brief=$(grep -P "^${role}\t" "$HERE/roles.tsv" | head -1 | cut -f3-)
  [ -z "$brief" ] && { echo "!! bilinmeyen rol: $role" >&2; continue; }
  plats="$(role_platforms "$role")"
  [ "$plats" = "rest" ] && plats="$REST"
  # ITS ADDRESS LIST: EVERY address of its platforms (`evidence.py list`, id first, liveness kept in
  # the 4th column) except the closed doors (4th column blocked or dead), which are already recorded.
  # An address whose body the ground already carried stays on it: `--unread` hid those, and with them
  # the threads and replies behind the post were never opened (Lane A's report, 2026-09-26). Which
  # address has a body is `evidence.py`'s own rule, read back through `list --unread`. The whole
  # list is a file; the prompt carries three numbers per platform, the path and the first 30 lines.
  LIST="$OUT/list-$role.tsv"
  : > "$LIST"
  counts=""
  for p in $plats; do
    if python3 "$EVI" list "$OUT" --platform "$p" > "$LIST.all" 2>> "$OUT/list-$role.err" &&
       python3 "$EVI" list "$OUT" --platform "$p" --unread > "$LIST.unread" 2>> "$OUT/list-$role.err"; then
      open_rows "$LIST.all" >> "$LIST"
      closed=$(awk -F'\t' '$4 == "blocked" || $4 == "dead"' "$LIST.all" | grep -c .)
      nobody=$(open_rows "$LIST.unread" | grep -c .)
      withbody=$(( $(open_rows "$LIST.all" | grep -c .) - nobody ))
      counts+="    $p: $withbody with a body · $nobody without a body · $closed closed doors (skipped)"$'\n'
    else
      lrc=$?
      counts+="    $p: THE LIST COULD NOT BE READ (evidence.py list, code $lrc) — search this platform yourself"$'\n'
      echo "!! $role / $p: adres listesi alinamadi (evidence.py list, kod $lrc) — $OUT/list-$role.err"
    fi
  done
  rm -f "$LIST.all" "$LIST.unread"
  n_list=$(grep -c . "$LIST")
  now=$(date +%s)
  t_end=$(date -d "@$(( now + TMO ))" +%H:%M:%S)
  t_stop=$(date -d "@$(( now + TMO - WRAP ))" +%H:%M:%S)
  {
    printf '%s\n\n' "$ARSENAL"
    # The arsenal says `opencli` is the door first on the hunter's PATH. That PATH comes from
    # CLAUDE_ENV_FILE below — read in the Claude Code binary, not yet watched in a live hunter — so
    # the door's own address is given once more, as the fallback (2026-09-24).
    printf 'If `command -v opencli` does not print %s, call that path instead of opencli.\n\n' \
        "'$SKILL/bin/opencli'"
    printf 'YOUR PLATFORMS — %s\n\n' "$brief"
    printf 'THE QUESTION THE FLEET IS ANSWERING:\n%s\n\n' "$QUESTION"
    # THE SENTENCE MATCHES THE RUN. It used to say "in every language of the question" on every
    # run, including the single-language ones: measured 2026-09-17, the fleet computed the real
    # number one line above and then told seven hunters something else.
    printf 'THE GROUND IS ALREADY OPEN, AND ALREADY IN THE LEDGER. Before you were launched the fleet\n'
    printf 'swept every channel of the map in %s language/phrasing(s) of the question, and every address\n' "$n_g"
    printf 'it found is a row of %s/evidence.jsonl, the one ledger of this run. The raw\n' "$OUT"
    printf 'channel files stay on disk for reference:\n'
    for gd in $GROUND_DIRS; do printf '    %s/*.raw   %s/pages/*.md\n' "$gd" "$gd"; done
    printf '\nYOUR ADDRESS LIST — your platforms: %s\n' "${plats:-(none left in this run)}"
    printf '%s' "$counts"
    printf 'WITH A BODY (4th column alive): the text is already cached — read it, then `add` your quotes;\n'
    printf '`fetch` the thread when the replies matter. The row: python3 "%s" show "%s" <id>\n' "$EVI" "$OUT"
    printf 'The whole text: %s/bodies/<sha256 of the address>.txt\n' "$OUT"
    printf '    (the name: printf %%s "<address>" | sha256sum — the address exactly as your list writes it)\n'
    printf 'WITHOUT A BODY: `fetch` first. CLOSED DOORS: already recorded, so skipped — not on your list.\n'
    printf 'The whole list is %s — %s lines, TSV: id, url, title, liveness. The first 30:\n' "$LIST" "$n_list"
    head -30 "$LIST"
    printf '\nTHE THREE COMMANDS — the ledger is written by these, never by you:\n'
    printf '    python3 "%s" fetch "%s" --url "<address>" --print\n' "$EVI" "$OUT"
    printf '    python3 "%s" add "%s" --url "<address>" --quote "<a sentence copied from the body>" --author "<who>" --date "<when>"\n' "$EVI" "$OUT"
    printf '    python3 "%s" list "%s" --platform <platform> --unread\n\n' "$EVI" "$OUT"
    printf 'THE BRIEF. Read every address on your list. Every quote you keep goes in with `add`. An address\n'
    printf 'you could not read is recorded by `fetch` (it writes the closed door itself), never skipped in\n'
    printf 'silence. A decisive address on another platform is added the same way: it is never lost. When\n'
    printf 'your list is short or empty, open the search doors of your platforms (the arsenal above), and\n'
    printf 'every page you read that way goes through `fetch` and `add` too.\n'
    cat <<'BRIEF'
An address that already carries a body is not finished until you have either added a quote from it
or decided in one word that it says nothing (`evidence.py` needs no call for that — say it in your
PLATFORM line's okunmadı count).
BRIEF
    printf 'Stop only when the list is exhausted (then write the line "okunacak adres kalmadı") or when\n'
    printf 'the time is up.\n\n'
    printf 'THE TIME. You have %s s (%s min); the fleet stops you at %s. Stop reading at %s and write\n' \
        "$TMO" "$(( TMO / 60 ))" "$t_end" "$t_stop"
    printf 'your lines: a hunter the clock cuts off leaves no report, only its rows. `date +%%T` tells the time.\n\n'
    printf 'HAND BACK, in Turkish, exactly the lines of the last section of the arsenal and nothing else:\n'
    printf 'one HÜKÜM line; one PLATFORM line for each of your platforms (%s); the KULLANDIĞIM SATIRLAR line.\n' \
        "${plats:-none}"
  } > "$OUT/prompt-$role.txt"

  # K1 — WHAT A HUNTER IS ALLOWED TO DO. Measured 2026-09-17 from a hunter's own transcript:
  # seven of them ran AT THE ROOT OF THIS REPOSITORY, in bypassPermissions, holding 115 tools —
  # Write, Edit, NotebookEdit, Task, CronCreate, CronDelete, RemoteTrigger, ScheduleWakeup,
  # SendMessage and a tool that deletes the CEO's cloud documents — and nothing asked. Nothing
  # bad had happened; the risk was structural, and it stood against this project's own audit
  # law: a subagent audits, refutes and sweeps, it NEVER writes.
  #
  # A hunter keeps exactly what its job needs: Bash (it drives evidence.py, crowd.sh and opencli),
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
    export CLAUDE_ENV_FILE="$HUNTER_ENV"     # the shim first on every Bash call of the hunter
    export DXB_HUNTER="$role"                # whose row it is: the ledger's `hunter` field
    timeout "$TMO" "${JAIL[@]}" claude -p "$(cat "$OUT/prompt-$role.txt")" \
        --model "$MODEL" --effort low \
        --permission-mode bypassPermissions \
        --allowed-tools $HUNTER_ALLOW \
        --disallowed-tools $HUNTER_DENY \
        --strict-mcp-config \
        --add-dir "$SKILL" --add-dir "$OUT" \
        --output-format stream-json --verbose \
        > "$OUT/$role.jsonl" 2> "$OUT/$role.err"
    printf 'rc=%s\nsecs=%s\ntmo=%s\n' "$?" "$(( $(date +%s) - s ))" "$TMO" > "$OUT/$role.meta"
  ) &
  launched=$((launched+1))
  echo "  avci sahada: $role — ${plats:-platform kalmadi} · listesinde $n_list adres"
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
# One thread, one line: markdown's escapes are undone before the de-dup (crowd-urls.sh).
bash "$HERE/crowd-urls.sh" $GROUND_DIRS | head -24 > "$OUT/crowd-urls.txt"
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

# ── WHERE WAS LOOKED, BEFORE A WORD OF THE ANSWER IS WRITTEN ────────────────────────────────────
# One row per platform — found · read · in the answer · unread or closed door — counted from the
# ledger by scripts/kapsama.py, which prints and never blocks. The session sees it here, before it
# writes; the page carries the same table under the answer.
echo
echo "KAPSAMA — nereye bakildi (kapsama.py):"
if [ -f "$SKILL/scripts/kapsama.py" ]; then
  python3 "$SKILL/scripts/kapsama.py" "$OUT" || echo "!! kapsama.py calismadi (kod $?) — tablo yok, bu bir deliktir."
else
  echo "!! kapsama.py yok — tablo basilamadi, bu bir deliktir."
fi

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
echo "  keep.sh saklar: final.md · answer.md · evidence.jsonl · SUMMARY.txt · HUNTER-*.md · soru · bodies/ (5 MB altindaysa)"
