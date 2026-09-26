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
# THE FLEET, NOT THE HUNTER, DECIDES WHEN A PLATFORM IS FINISHED (B56 K1, 2026-09-26). Measured on
# that night's deep run: 142 of the 272 X addresses were never fetched; the x hunter printed 350
# characters of 128 bodies in one command cut at 20,000 (it saw 73), declared "okundu 130" and left
# at 64 s of 600 — all seven hunters left at 51-243 s — and the page used 4 posts. So every address
# is fetched and sorted (triage) before a hunter starts; a hunter reads only through `evidence.py
# batch`, which marks in the ledger what it printed, and gives every printed row a verdict; when it
# returns, the fleet counts from the ledger what is still unread, partial or unjudged on its platforms
# and sends it back until the clock; and an Opus writer turns the rows into answer.md.
#
#   fleet.sh [<run-dir>|<name>] --q "<short query>" [--q "..."]... [--dert FILE]
#            [--hunters N] [--model NAME] [--timeout S] [--roles a,b,c]
#            [--rounds N] [--fetch-limit N] [--fetch-workers N] [--allow-tmp] [--no-write]
#   fleet.sh --write-only <run-dir>          # the writer step alone, on a run that has its rows
#
# THE FIRST ARGUMENT IS THE RUN FOLDER — a path, or a bare name or nothing, which puts it under the
# repository (THE RUN LIVES ON DISK, below) — AND THE QUERIES ARE TYPED BY THE SESSION — a few words
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
EVI="$SKILL/scripts/evidence.py"
REPO_ROOT="$(builtin cd "$SKILL/../../.." && pwd)"

OUT=""
case "${1:-}" in --*|"") ;; *) OUT="$1"; shift ;; esac
N=4; MODEL=claude-opus-5-5; TMO=600; ROLES=""; DERT=""
ROUNDS=3; FETCH_LIMIT=400; FETCH_WORKERS=6; ALLOW_TMP=0; WRITE=1; WRITE_ONLY=""
QUERIES=()
while [ $# -gt 0 ]; do
  case "$1" in
    --q)       QUERIES+=("$2"); shift 2 ;;
    --dert)    DERT="$2"; shift 2 ;;
    --hunters) N="$2"; shift 2 ;;
    --model)   MODEL="$2"; shift 2 ;;
    --timeout) TMO="$2"; shift 2 ;;
    --roles)   ROLES="$2"; shift 2 ;;
    --rounds)        ROUNDS="${2:?--rounds bir sayi ister}"; shift 2 ;;
    --fetch-limit)   FETCH_LIMIT="${2:?--fetch-limit bir sayi ister}"; shift 2 ;;
    --fetch-workers) FETCH_WORKERS="${2:?--fetch-workers bir sayi ister}"; shift 2 ;;
    --allow-tmp)     ALLOW_TMP=1; shift ;;
    --no-write)      WRITE=0; shift ;;
    --write-only)    WRITE_ONLY="${2:?--write-only bir kosu klasoru ister}"; shift 2 ;;
    *) shift ;;
  esac
done
for v in "$ROUNDS" "$FETCH_LIMIT" "$FETCH_WORKERS"; do
  case "$v" in ''|*[!0-9]*) echo "!! DUR: --rounds, --fetch-limit ve --fetch-workers tam sayi ister (verilen: $v)." >&2; exit 3 ;; esac
done
if [ "$ROUNDS" -lt 1 ] || [ "$FETCH_WORKERS" -lt 1 ]; then
  echo "!! DUR: --rounds ve --fetch-workers en az 1 olur." >&2; exit 3
fi
if [ -z "$WRITE_ONLY" ] && [ ${#QUERIES[@]} -eq 0 ]; then
  echo "kullanim: fleet.sh [<kosu-klasoru>|<isim>] --q \"<kisa sorgu>\" [--q ...] [--dert DOSYA] [--hunters N] [--model AD] [--timeout SN] [--roles a,b] [--rounds N] [--fetch-limit N] [--fetch-workers N] [--allow-tmp] [--no-write]   ·   fleet.sh --write-only <kosu-klasoru>" >&2
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

# ── THE WRITER — AN OPUS TURNS THE ROWS INTO answer.md ──────────────────────────────────────────────
# Measured on the deep run of 2026-09-26: the hunters kept 128 quotes, the ledger held 554 bodies, and
# the answer the session wrote from them used 4 X posts of 130. So the fleet's last step is a writer of
# its own — claude-opus-5-5 at high effort, with NO tools — handed the question, every hunter's HÜKÜM
# line, the ledger's own status table and every row that bears on the question (triage `relevant`, and
# every quote a hunter kept with `add` that the triage did not shut out), under the recipe's rules
# (fleet/writer-prompt.md). What it returns is written to <run>/answer.md, and render.py makes the page.
# A full run calls it after the completion gate (`--no-write` skips it); `--write-only <run>` runs it
# alone on a run that already has its rows — which is why it is defined here, before the run.
# THE PROMPT GOES ON STDIN, never as one argument: Linux caps a single argument at 128 KiB (measured on
# this machine 2026-09-26: 131,000 bytes pass, 140,000 answer "Argument list too long"), and the deep
# run's 554 rows with a body make 222 KB of row lines. It stands in a folder of its own outside the
# repository (env -C), as the hunters do — THE HUNTER'S FOLDER, below — and it has no tools at all.
#
# A FOLDER OUTSIDE THE REPOSITORY for a `claude` to stand in: $1 names it. What it left there is brought
# back into the run (bring_back: $1 the outside folder, $2 its place in the run) and the folder goes.
away_dir() {
  mkdir -p "${XDG_RUNTIME_DIR:-/tmp}/dxb-hunters" &&
    mktemp -d "${XDG_RUNTIME_DIR:-/tmp}/dxb-hunters/$(basename "$OUT").$1.XXXXXX"
}
bring_back() {
  if [ -n "$(ls -A "$1" 2>/dev/null)" ]; then mkdir -p "$2" && cp -a "$1/." "$2/"; fi
  rm -rf "$1"
}
write_answer() {
  local tpl="$HERE/writer-prompt.md" filled="$OUT/writer-prompt.txt" size s wrc secs wd
  if [ ! -f "$tpl" ]; then echo "!! writer: $tpl yok — answer.md yazilmadi."; return 1; fi
  python3 "$EVI" status "$OUT" --format md > "$OUT/writer-status.md" 2>&1
  size="$(python3 - "$OUT" "$tpl" "$OUT/writer-status.md" "$filled" <<'PY'
import json, re, sys
from pathlib import Path
run, tpl, status, out = (Path(a) for a in sys.argv[1:5])

def text(p):
    try:
        return p.read_text(encoding="utf-8", errors="replace").strip()
    except OSError:
        return ""

one = lambda v: re.sub(r"\s+", " ", str(v or "")).strip()
DECOR = re.compile(r"^[\s#>*`\-•|]+")                        # merge.py's own two patterns
HUKUM = re.compile(r"^(?:H[UÜ]K[UÜ]M|SONU[CÇ])\s*[:.)\-–]?\s*(.*)$", re.I)
verdicts = []
for h in sorted(run.glob("HUNTER-*.md")):
    for line in text(h).splitlines():
        m = HUKUM.match(DECOR.sub("", line))
        if m and m.group(1).strip():
            verdicts.append(f"[{h.stem[len('HUNTER-'):]}] HÜKÜM: {one(m.group(1))}")
SHUT = {"irrelevant", "duplicate", "inaccessible"}
rows = []
for line in text(run / "evidence.jsonl").splitlines():
    try:
        r = json.loads(line)
    except ValueError:
        continue
    if isinstance(r, dict) and r.get("id") and (r.get("triage") == "relevant" or
                                                (r.get("tool") == "evidence.py add" and r.get("triage") not in SHUT)):
        rows.append(r)
lines = []
for r in sorted(rows, key=lambda r: (one(r.get("platform")), one(r.get("id")))):
    said = one(r.get("passage") or r.get("title"))
    said = said if len(said) <= 300 else said[:299].rstrip() + "…"
    lines.append(f'[{r["id"]}] {one(r.get("platform")) or "?"} · @{one(r.get("author")) or "?"} · '
                 f'{one(r.get("pub_date")) or "?"} · "{said}" · {one(r.get("url") or r.get("url_canonical"))}')
vals = {"QUESTION": text(run / "question.txt") or "(question.txt yok)",
        "HUKUM": "\n".join(verdicts) or "(hicbir avci HÜKÜM satiri getirmedi)",
        "STATUS": text(status) or "(evidence.py status okunamadi)",
        "ROWS": "\n".join(lines), "N_ROWS": str(len(lines))}
filled = re.sub(r"\{\{([A-Z_]+)\}\}", lambda m: vals.get(m.group(1), m.group(0)), text(tpl)) + "\n"
out.write_text(filled, encoding="utf-8")
print(f"{len(lines)} satir · {len(filled.encode()) // 1024} KB")
PY
)" || { echo "!! writer: istem doldurulamadi — answer.md yazilmadi."; return 1; }
  if [ "${size%% *}" = "0" ]; then
    echo "!! writer: yazara verilecek satir yok (ilgili 0 · alinti 0) — cagrilmadi, answer.md yazilmadi."
    return 1
  fi
  wd="$(away_dir writer)" || { echo "!! writer: disaridaki klasoru acilamadi — answer.md yazilmadi."; return 1; }
  echo "writer: $size -> claude-opus-5-5 · efor high"
  s=$(date +%s)
  env -C "$wd" timeout 600 claude -p --model claude-opus-5-5 --effort high --tools "" --strict-mcp-config \
      --output-format json < "$filled" > "$OUT/writer.json" 2> "$OUT/writer.err"
  wrc=$?
  secs=$(( $(date +%s) - s ))
  bring_back "$wd" "$OUT/writer"
  python3 - "$OUT/writer.json" "$OUT/answer.md" "$wrc" "$secs" <<'PY' || return 1
import json, re, sys
from pathlib import Path
jf, ans, rc, secs = Path(sys.argv[1]), Path(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
try:
    d = json.loads(jf.read_text(encoding="utf-8", errors="replace"))
except (OSError, ValueError):
    d = None
if isinstance(d, list):                                    # an event list: its result event
    d = next((e for e in reversed(d) if isinstance(e, dict) and e.get("type") == "result"), None)
d = d if isinstance(d, dict) else {}
c = d.get("total_cost_usd")
cost = f"${c:.2f}" if isinstance(c, (int, float)) and not isinstance(c, bool) else "$?"
text = (d.get("result") if isinstance(d.get("result"), str) else "").strip()
fence = re.fullmatch(r"```[A-Za-z]*\n(.*?)\n?```", text, re.S)
if fence:
    text = fence.group(1).strip()
if rc != 0 or d.get("is_error") or not text:
    print(f"!! writer: basarisiz (kod {rc}) — cost {cost} · {secs} s · answer.md yazilmadi: {jf.parent}/writer.err")
    sys.exit(1)
ans.write_text(text + "\n", encoding="utf-8")
ids = set(re.findall(r"\bL\d{4,}\b", text))
http = len(re.findall(r"https?://", text))
print(f"writer: cost {cost} · {secs} s -> {ans} · {len(text.splitlines())} satir · {len(ids)} kimlik · http {http}")
PY
  # no --out: render.py then writes the page, final.html, and final.md beside it (Lane C, 2026-09-26)
  if python3 "$SKILL/scripts/render.py" "$OUT/answer.md" --evidence "$OUT/evidence.jsonl" > "$OUT/render.log" 2>&1; then
    sed 's/^/   /' "$OUT/render.log"
  else
    echo "!! render.py calismadi (kod $?) — sayfa yok: $OUT/render.log (lider birlestirir)."
  fi
}

if [ -n "$WRITE_ONLY" ]; then
  OUT="$(builtin cd "$WRITE_ONLY" 2>/dev/null && pwd)" || { echo "!! DUR: kosu klasoru yok: $WRITE_ONLY" >&2; exit 3; }
  [ -f "$OUT/evidence.jsonl" ] || { echo "!! DUR: $OUT/evidence.jsonl yok — yazara verilecek satir yok." >&2; exit 3; }
  echo "kosu    : $OUT  (yalniz yazar)"
  write_answer
  exit $?
fi

# ── THE RUN LIVES ON DISK, UNDER THE REPOSITORY ─────────────────────────────────────────────────────
# The deep run of 2026-09-26 02:34 lived in a session's scratchpad under /tmp — a tmpfs on this machine
# (measured: `findmnt /tmp` → tmpfs), gone at the next reboot with every body it had fetched. So a
# bare name, or no first argument at all, becomes $REPO/var/research/runs/<YYYYMMDD-HHMM>-<slug>/ —
# var/ is git-ignored (.gitignore: /var/), so the run is on disk and never committed; nothing is saved
# unless he says "kaydet". A path under /tmp is refused with the reason unless --allow-tmp. A run
# inside the repository is never refused: that is where a run belongs, even when the repository itself
# is a copy on /tmp.
slug() { printf '%s' "$1" | LC_ALL=C tr '[:upper:]' '[:lower:]' | LC_ALL=C sed 's/[^a-z0-9]\{1,\}/-/g; s/^-//; s/-$//' | cut -c1-48; }
case "$OUT" in
  */*|.|..) ;;
  *) run_slug="$(slug "${OUT:-${QUERIES[0]}}")"
     OUT="$REPO_ROOT/var/research/runs/$(date +%Y%m%d-%H%M)-${run_slug:-run}"
     run_base="$OUT"; n_same=2
     while [ -e "$OUT" ]; do OUT="$run_base-$n_same"; n_same=$(( n_same + 1 )); done ;;
esac
run_abs="$(realpath -m -- "$OUT")"; repo_abs="$(realpath -m -- "$REPO_ROOT")"; repo_abs="${repo_abs%/}"
case "$run_abs/" in
  "$repo_abs"/*) ;;
  /tmp/*)
    if [ "$ALLOW_TMP" -ne 1 ]; then
      echo "!! DUR: kosu klasoru /tmp altinda ($run_abs). /tmp bu makinede tmpfs — yeniden baslatmada silinir;" >&2
      echo "   2026-09-26 02:34 kosusu boyle bir karalama klasorunde yasadi. Klasor vermeden ya da yalniz bir isimle" >&2
      echo "   calistir (kosu $REPO_ROOT/var/research/runs/ altina yazilir), ya da bilerek istiyorsan --allow-tmp ekle." >&2
      exit 3
    fi ;;
esac
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

echo "kosu    : $OUT"
echo "sorgular: ${#QUERIES[@]}  ->  $(printf '%s | ' "${QUERIES[@]}")"
echo "avcilar : $PICK"
echo "beyin   : $MODEL · efor: low   zaman asimi ${TMO}s · tamamlama kapisi: en fazla $ROUNDS tur"
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
open_rows() { awk -F'\t' 'NF && $4 != "blocked" && $4 != "dead"' "$1"; }   # a list minus its closed doors

# ── EVERY ADDRESS WITHOUT A BODY IS FETCHED BEFORE A HUNTER STARTS ──────────────────────────────────
# Measured on the deep run of 2026-09-26 02:34: 142 of the 272 X addresses the ground found were never
# fetched — 98 t.co links, 43 x.com/i/status — because fetching was the hunter's job, and the x hunter
# left at 64 s of 600. So the fleet fetches every address that has no body itself, --fetch-workers at a
# time and at most --fetch-limit of them; a door that stays shut is recorded by `fetch` with its reason.
# The ground's own closed doors (liveness blocked or dead) are already recorded and are not knocked on
# again. What came of it is counted from the ledger afterwards, not from what the fetches printed.
# WHICH ADDRESS HAS NO BODY is the ledger's own rule, read back through `list --no-body` (B56 K1); a
# ledger from before K1 answered it with `--unread`, so the flag is asked for, not assumed.
NOBODY_FLAG=--no-body
python3 "$EVI" list --help 2>/dev/null | grep -q -- '--no-body' || NOBODY_FLAG=--unread
FPLATS="$(sed -n 's/^platform=\([^ ]*\).*/\1/p' "$OUT/from-ground.txt")"
nobody_rows() { local p; for p in $FPLATS; do python3 "$EVI" list "$OUT" --platform "$p" $NOBODY_FLAG; done; }
nobody_rows > "$OUT/fetch-all.before" 2> "$OUT/fetch-all.err"
open_rows "$OUT/fetch-all.before" > "$OUT/fetch-all.todo"
n_todo=$(grep -c . "$OUT/fetch-all.todo")
n_try=$(( n_todo < FETCH_LIMIT ? n_todo : FETCH_LIMIT ))
f0=$(date +%s)
head -n "$n_try" "$OUT/fetch-all.todo" | cut -f2 \
  | xargs -r -d '\n' -n 1 -P "$FETCH_WORKERS" python3 "$EVI" fetch "$OUT" --url > "$OUT/fetch-all.log" 2>&1
nobody_rows > "$OUT/fetch-all.after" 2>> "$OUT/fetch-all.err"
read -r f_body f_shut <<< "$(head -n "$n_try" "$OUT/fetch-all.todo" | awk -F'\t' -v after="$OUT/fetch-all.after" '
  BEGIN { while ((getline l < after) > 0) { split(l, c, "\t"); left[c[1]] = c[4] } }
  !($1 in left) { b++ } ($1 in left) && (left[$1] == "blocked" || left[$1] == "dead") { s++ }
  END { print b + 0, s + 0 }')"
f_open=$(( n_try - f_body - f_shut ))
f_note="$(( $(date +%s) - f0 )) s"
[ "$f_open" -gt 0 ] && f_note="$f_note · sonucsuz $f_open: $OUT/fetch-all.log"
echo "   fetch-all: tried $n_try · bodies $f_body · closed $f_shut  ($f_note)"
[ "$n_todo" -gt "$n_try" ] && echo "   fetch-all: $(( n_todo - n_try )) adres --fetch-limit $FETCH_LIMIT ustunde kaldi — govdesiz, avcilarin listesinde."

# ── EVERY BODY IS SORTED BEFORE A HUNTER READS ONE ──────────────────────────────────────────────────
# Measured the same morning on the 130 X bodies of that run: one Haiku prompt sorted all 130 — 105
# relevant, 23 irrelevant, 2 duplicates — where the x hunter had kept 16. So scripts/triage.py sorts
# every pending body before the hunters start, and `batch` hands a hunter only the relevant ones. A
# triage that fails leaves its rows `pending`, and batch prints nothing pending: that is named here.
# ONE triage.py PER PLATFORM, FOUR AT A TIME (as the grounds): the batches of one triage.py run one
# after another, every write takes the ledger's lock, so the platforms are sorted side by side. A
# platform with nothing pending prints nothing here.
TRIAGE_PAR=4
if [ -f "$SKILL/scripts/triage.py" ]; then
  n_t=0
  for p in $FPLATS; do
    { python3 "$SKILL/scripts/triage.py" "$OUT" --platform "$p"; echo "triage-rc=$?"; } > "$OUT/triage-$p.log" 2>&1 &
    n_t=$(( n_t + 1 )); [ $(( n_t % TRIAGE_PAR )) -eq 0 ] && wait
  done
  wait
  t_bad=""
  for p in $FPLATS; do
    grep -qx 'triage-rc=0' "$OUT/triage-$p.log" || t_bad="$t_bad $p"
    grep -qx 'triage-rc=0' "$OUT/triage-$p.log" && grep -q '^nothing pending with a body' "$OUT/triage-$p.log" && continue
    grep -v '^triage-rc=' "$OUT/triage-$p.log" | sed "s/^/      [$p] /"
  done
  [ -z "$t_bad" ] || echo "!! TRIAGE BASARISIZ:$t_bad — ayiklanamayan satirlar 'pending' kaldi ve batch pending satir basmaz: $OUT/triage-<platform>.log"
else
  echo "!! triage.py yok — satirlar ayiklanmadi ve batch pending satir basmaz."
fi
python3 "$EVI" status "$OUT" > "$OUT/status-start.txt" 2>&1
s_rc=$?
echo "   defter durumu (evidence.py status):"
sed 's/^/      /' "$OUT/status-start.txt"
[ "$s_rc" -eq 0 ] || echo "!! evidence.py status kod $s_rc — $OUT/status-start.txt"
echo

# ── EVERY PLATFORM HAS EXACTLY ONE OWNER IN THE RUN ─────────────────────────────────────────────
# roles.tsv, column 2: a hunter's platforms, in the words of the one classifier (scripts/platforms.py,
# read back through `evidence.py from-ground` and `list`). `rest` is every platform no other hunter
# of THIS run owns — the open web, and the platforms of the hunters --hunters/--roles left out.
# A platform nobody owns is NAMED here; its rows stay in the ledger and in the coverage table.
role_platforms() { awk -F'\t' -v r="$1" '$1 == r { print $2; exit }' "$HERE/roles.tsv"; }
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
# THE HUNTER'S FOLDER IS OUTSIDE THE REPOSITORY. The run lives under var/ now, and a `claude` standing in
# a folder inside this repository loads the project's CLAUDE.md and its hooks — the session start's ~25k
# tokens, and the Bash gates (the `cd` gate, the cost gate, the code gate) that would stop a hunter's
# commands; measured by the lead on 2026-09-26: the repository's hooks fire only when the folder is
# inside it. So each hunter stands in a folder of its own under ${XDG_RUNTIME_DIR:-/tmp}/dxb-hunters/ and
# reaches the run through --add-dir "$OUT"; when its last round ends, what it left there is brought back
# into $OUT/work-<role> and the outside folder goes. Measured in this jail the same day: that folder is
# writable, a run folder under var/ is writable, and the repository answers "Read-only file system".
# The jail binds that folder writable by name, as it binds the run folder.
HUNT_TMP="$(away_dir hunters)" || {
  echo "!! KOSU BASARISIZ — avcilarin disaridaki klasoru acilamadi (${XDG_RUNTIME_DIR:-/tmp}/dxb-hunters). Hicbir avci baslatilmadi."
  exit 1
}
# AN ARRAY, NOT A STRING. This repository's own path carries a space — "DxB Global OS" — and an
# unquoted string would have handed bwrap three arguments where one was meant, so the jail would
# have failed to start and the hunters would have run loose with no warning at all. Caught before
# the first real fleet run, on 2026-09-17.
JAIL=()
if command -v bwrap >/dev/null 2>&1; then
  JAIL=(bwrap --dev-bind / / --ro-bind "$REPO_ROOT" "$REPO_ROOT" --bind "$OUT" "$OUT" --bind "$HUNT_TMP" "$HUNT_TMP" --bind /tmp /tmp)
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
mkdir -p "$OUT/rounds"

# A ROUND'S OWN ANSWER, from the last `result` event of its transcript: `cost` (total_cost_usd, "?"
# when there is none) or `text` (what it handed back; empty when the clock cut it off).
round_result() {
  python3 - "$1" "$2" 2>/dev/null <<'PY'
import json, sys
last = {}
try:
    with open(sys.argv[1], encoding="utf-8", errors="replace") as f:
        for line in f:
            try:
                d = json.loads(line)
            except ValueError:
                continue
            if isinstance(d, dict) and d.get("type") == "result":
                last = d
except OSError:
    pass
c = last.get("total_cost_usd")
if sys.argv[2] == "cost":
    print(f"{c:.2f}" if isinstance(c, (int, float)) and not isinstance(c, bool) else "?")
else:
    print(last.get("result") or "")
PY
}

# WHAT A ROLE STILL OWES, counted from the ledger and never from what the hunter said: relevant rows not
# yet printed to anyone (unread), rows printed only in part (partial — the next `batch` continues them)
# and printed rows with no verdict (unjudged), on the given platforms. A platform's owed is the ledger's
# own `owed` when status carries it, else unread + partial + unjudged. Prints
# "<unread> <partial> <unjudged> <owed> <where>" — or "? ? ? ? -" when the ledger's status cannot be read.
ledger_left() {
  python3 "$EVI" status "$OUT" --format json 2>/dev/null | python3 -c '
import json, sys
try:
    ps = json.load(sys.stdin)["platforms"]
    rows = []
    for p in sys.argv[1:]:
        c = ps.get(p) or {}
        u, pa, j = (int(c.get(k) or 0) for k in ("unread", "partial", "unjudged"))
        rows.append((p, u, pa, j, int(c["owed"]) if c.get("owed") is not None else u + pa + j))
except (ValueError, KeyError, TypeError, AttributeError):
    print("? ? ? ? -")
    raise SystemExit
owed = [r for r in rows if r[4]]
where = owed[0][0] if len(owed) == 1 else ", ".join(f"{p} ({u} · {pa} · {j})" for p, u, pa, j, _ in owed) or "-"
print(*(sum(r[i] for r in rows) for i in (1, 2, 3, 4)), where)
' "$@"
}

# THE HUNTER'S BRIEF, written for every round of its role: $1 the round, $2 the seconds left on the
# role's clock, $3 the resume line (empty on the first round). The role's own variables — role,
# brief, plats, counts, LIST, n_list, t_end — come from its place in the loop below. Every round's
# prompt is kept as rounds/prompt-<role>.r<n>.txt; prompt-<role>.txt is the one being run.
write_prompt() {
  local r="$1" left="$2" devam="$3" prev gd p
  {
    if [ -n "$devam" ]; then
      printf '%s\n\n' "$devam"
      prev="$(round_result "$OUT/rounds/$role.r$(( r - 1 )).jsonl" text)"
      [ -n "$prev" ] && printf 'YOUR ROUND %s HANDED BACK THESE LINES. Its reads, quotes and verdicts are in the ledger;\nkeep what still holds and change what the new reading changes:\n%s\n\n' "$(( r - 1 ))" "$prev"
    fi
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
    printf 'THE GROUND IS ALREADY OPEN, FETCHED, SORTED AND IN THE LEDGER. Before you were launched the\n'
    printf 'fleet swept every channel of the map in %s language/phrasing(s) of the question; every address\n' "$n_g"
    printf 'it found is a row of %s/evidence.jsonl, the one ledger of this run; the addresses\n' "$OUT"
    printf 'without a body were fetched, up to the limit the fleet was given, and every body was sorted by\n'
    printf 'a triage model (relevant, irrelevant, duplicate). The raw channel files stay on disk for reference:\n'
    for gd in $GROUND_DIRS; do printf '    %s/*.raw   %s/pages/*.md\n' "$gd" "$gd"; done
    printf '\nYOUR ADDRESS LIST — your platforms: %s\n' "${plats:-(none left in this run)}"
    printf '%s' "$counts"
    printf 'The whole list is %s — %s lines, TSV: id, url, title, liveness. The first 30:\n' "$LIST" "$n_list"
    head -30 "$LIST"
    printf '\nHOW YOU READ — with `batch`, and only with it. It prints the next relevant rows of a platform\n'
    printf 'not yet printed to anyone, each body WHOLE, and the ledger marks each one read by you:\n'
    for p in $plats; do
      printf '    python3 "%s" batch "%s" --hunter %s --platform %s --n 10\n' "$EVI" "$OUT" "$role" "$p"
    done
    printf 'Its last line says how many relevant rows are still unread there, or "BATCH: nothing left —\n'
    printf 'okunacak adres kalmadı". A body longer than one batch is marked partial; the rest of it:\n'
    printf '    python3 "%s" page "%s" --id <id> --from <bytes>\n' "$EVI" "$OUT"
    printf 'A body printed any other way — `cat`, `head` or `grep` over %s/bodies/<sha256 of the address>.txt\n' "$OUT"
    printf '— counts as NOT read: the machine counts only what batch printed.\n\n'
    printf 'EVERY ROW BATCH PRINTED GETS A VERDICT, before the next batch. A sentence worth keeping goes in\n'
    printf 'with `add` (that marks the row evidence by itself); a row that says nothing on the question gets\n'
    printf '    python3 "%s" verdict "%s" --hunter %s --id <id> --verdict none --reason "<at most 6 words>"\n' "$EVI" "$OUT" "$role"
    printf '    (many at once: python3 "%s" verdict-bulk "%s" --hunter %s --json <file>, the file holding\n' "$EVI" "$OUT" "$role"
    printf '     {"verdicts": [{"id": "<id>", "verdict": "none", "reason": "<at most 6 words>"}]})\n'
    printf 'A batch whose ids carry no verdict is not finished reading.\n\n'
    printf 'THE OTHER COMMANDS — the ledger is written by these, never by you:\n'
    printf '    python3 "%s" add "%s" --url "<address>" --quote "<a sentence copied from the body>" --author "<who>" --date "<when>"\n' "$EVI" "$OUT"
    printf '    python3 "%s" fetch "%s" --url "<address>" --print\n' "$EVI" "$OUT"
    printf '    python3 "%s" show "%s" <id>\n' "$EVI" "$OUT"
    printf '    python3 "%s" list "%s" --platform <platform> %s     (the addresses still without a body)\n\n' "$EVI" "$OUT" "$NOBODY_FLAG"
    printf 'THE BRIEF. Read every address on your list. Every quote you keep goes in with `add`. The relevant\n'
    printf 'ones come to you through batch; when batch has nothing left, search further with every weapon of\n'
    printf 'the arsenal above, and every page you read that way goes through `fetch` and `add` too. An address\n'
    printf 'you could not read is recorded by `fetch` (it writes the closed door itself), never skipped in\n'
    printf 'silence. A decisive address on another platform is added the same way: it is never lost.\n'
    printf 'Nothing you declare is counted. Read is what batch printed, judged is what `add` and `verdict`\n'
    printf 'wrote, and the fleet counts both from the ledger when you return: a hunter that comes back with\n'
    printf 'relevant rows unread, partial or unjudged is sent back to them. So your PLATFORM line carries no numbers;\n'
    printf 'it carries the verdict on that platform and the ids it stands on.\n'
    printf 'Stop only when batch says "okunacak adres kalmadı" on every platform of yours, or when the time\n'
    printf 'is up.\n\n'
    printf 'THE TIME. You have %s s (%s min); the fleet stops you at %s. Stop reading at %s and write\n' \
        "$left" "$(( left / 60 ))" "$(date -d "@$t_end" +%H:%M:%S)" "$(date -d "@$(( t_end - WRAP ))" +%H:%M:%S)"
    printf 'your lines: a hunter the clock cuts off leaves no report, only its rows. `date +%%T` tells the time.\n\n'
    printf 'HAND BACK, in Turkish, exactly the lines of the last section of the arsenal and nothing else:\n'
    printf 'one HÜKÜM line; one PLATFORM line for each of your platforms (%s); the KULLANDIĞIM SATIRLAR line.\n' \
        "${plats:-none}"
  } > "$OUT/prompt-$role.txt"
  cp "$OUT/prompt-$role.txt" "$OUT/rounds/prompt-$role.r$r.txt"
}

# ONE ROUND OF ONE HUNTER: $1 the role, $2 the round, $3 the seconds left on the role's clock. TMO,
# inside a round, is that remainder — the clock is the role's, not the round's, so a hunter sent back
# gets the minutes it has not used and no more. Each round's transcript and errors are kept apart
# (rounds/<role>.r<n>.jsonl, .err); the gate joins them into <role>.jsonl for merge.py.
hunt_round() {
  local role="$1" r="$2" TMO="$3"
  (
    builtin cd "$HUNT_TMP/work-$role" || exit 9
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
        > "$OUT/rounds/$role.r$r.jsonl" 2> "$OUT/rounds/$role.r$r.err"
  )
}

launched=0
for role in $PICK; do
  brief=$(grep -P "^${role}\t" "$HERE/roles.tsv" | head -1 | cut -f3-)
  [ -z "$brief" ] && { echo "!! bilinmeyen rol: $role" >&2; continue; }
  plats="$(role_platforms "$role")"
  [ "$plats" = "rest" ] && plats="$REST"
  # ITS ADDRESS LIST: EVERY address of its platforms (`evidence.py list`, id first, liveness kept in
  # the 4th column) except the closed doors (4th column blocked or dead), which are already recorded.
  # An address whose body the ground already carried stays on it: `--unread` (before K1: no body) hid those, and with them
  # the threads and replies behind the post were never opened (Lane A's report, 2026-09-26). Which
  # address has a body is `evidence.py`'s own rule, read back through `list $NOBODY_FLAG`. The whole
  # list is a file; the prompt carries three numbers per platform, the path and the first 30 lines.
  LIST="$OUT/list-$role.tsv"
  : > "$LIST"
  counts=""
  for p in $plats; do
    if python3 "$EVI" list "$OUT" --platform "$p" > "$LIST.all" 2>> "$OUT/list-$role.err" &&
       python3 "$EVI" list "$OUT" --platform "$p" $NOBODY_FLAG > "$LIST.nobody" 2>> "$OUT/list-$role.err"; then
      open_rows "$LIST.all" >> "$LIST"
      closed=$(awk -F'\t' '$4 == "blocked" || $4 == "dead"' "$LIST.all" | grep -c .)
      nobody=$(open_rows "$LIST.nobody" | grep -c .)
      withbody=$(( $(open_rows "$LIST.all" | grep -c .) - nobody ))
      counts+="    $p: $withbody with a body · $nobody without a body · $closed closed doors (skipped)"$'\n'
    else
      lrc=$?
      counts+="    $p: THE LIST COULD NOT BE READ (evidence.py list, code $lrc) — search this platform yourself"$'\n'
      echo "!! $role / $p: adres listesi alinamadi (evidence.py list, kod $lrc) — $OUT/list-$role.err"
    fi
  done
  rm -f "$LIST.all" "$LIST.nobody"
  n_list=$(grep -c . "$LIST")

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
  mkdir -p "$HUNT_TMP/work-$role"
  # ── THE COMPLETION GATE — THE FLEET, NOT THE HUNTER, DECIDES WHEN ITS PLATFORMS ARE FINISHED ──────
  # A hunter's return used to end its work: on 2026-09-26 all seven came back at 51-243 s of 600, the
  # x hunter with "okundu 130" after 73 bodies seen. Now, when a round returns, the ledger is asked
  # (`evidence.py status --format json`) what is still owed on the role's platforms: relevant rows
  # unread, rows printed only in part (partial), and rows read but given no verdict. Owed — or an exit
  # that was not 0 — and less than 0.8 of the role's clock spent: the role is launched again, the resume
  # line first in its prompt, up to --rounds rounds. Nothing owed: accepted. Every decision is one
  # `gate:` line. A status that cannot be read measures nothing, and nothing unmeasured is accepted: the
  # round is `unmeasured` and launched again while the gate can, else it ends `time-up (unmeasured)` —
  # named in the run's last line, and the run leaves with code 1. The role's HÜKÜM is the last one it
  # handed back: the rounds' transcripts are joined in order into <role>.jsonl, and merge.py takes the
  # last answer in it.
  (
    t0=$(date +%s); t_end=$(( t0 + TMO )); r=1; left=$TMO; devam=""; spent=0
    while :; do
      write_prompt "$r" "$left" "$devam"
      s=$(date +%s)
      hunt_round "$role" "$r" "$left"; rc=$?
      secs=$(( $(date +%s) - s ))
      cost="$(round_result "$OUT/rounds/$role.r$r.jsonl" cost)"
      spent="$(awk -v a="$spent" -v b="$cost" 'BEGIN { if (b ~ /^[0-9.]+$/) a += b; printf "%.2f", a }')"
      read -r m pa k owed where <<< "$(ledger_left $plats)"
      measured=1                                   # four whole numbers, or the round was not measured
      for n in "$m" "$pa" "$k" "$owed"; do case "$n" in ''|*[!0-9]*) measured=0 ;; esac; done
      el=$(( $(date +%s) - t0 )); why=""
      if [ "$measured" -eq 1 ] && [ "$owed" -eq 0 ] && [ "$rc" -eq 0 ]; then verdict=accepted
      elif [ "$r" -ge "$ROUNDS" ]; then verdict=time-up; why=" · tur $r/$ROUNDS"
      elif [ $(( el * 10 )) -ge $(( TMO * 8 )) ]; then verdict=time-up; why=" · saat $el/$TMO s"
      else verdict=relaunch; fi
      # A ROUND THE LEDGER COULD NOT COUNT IS NEVER ACCEPTED: `unmeasured` while the gate can relaunch it,
      # else `time-up (unmeasured)` — the word <role>.meta keeps for the run's last line.
      if [ "$measured" -eq 1 ]; then
        seen="unread $m"; label="$verdict"; note="unjudged $k · partial $pa · $secs s · \$$cost$why"
      else
        seen="status unreadable"; label=unmeasured; [ "$verdict" = relaunch ] || label="time-up (unmeasured)"
        note="$secs s · \$$cost$why · !! defter durumu okunamadi (evidence.py status)"
      fi
      [ "$rc" -ne 0 ] && note="kod $rc · $note"
      [ "$verdict" = relaunch ] || note="$note · rol $r tur · \$$spent"
      printf 'gate: %s round %s — %s → %s  (%s)\n' "$role" "$r" "$seen" "$label" "$note" | tee -a "$OUT/gate.log"
      [ "$verdict" = relaunch ] || break
      if [ "$measured" -eq 0 ]; then
        devam="DEVAM — the ledger could not count your round $r; continue with batch, then hand back your lines"
      elif [ "$owed" -gt 0 ]; then
        devam="DEVAM — $m unread · $pa partial · $k unjudged on $where; continue with batch"
      else
        devam="DEVAM — your round $r ended with exit code $rc; continue with batch, then hand back your lines"
      fi
      r=$(( r + 1 )); left=$(( t_end - $(date +%s) )); [ "$left" -lt 1 ] && left=1
    done
    for i in $(seq 1 "$r"); do cat "$OUT/rounds/$role.r$i.jsonl" 2>/dev/null; done > "$OUT/$role.jsonl"
    for i in $(seq 1 "$r"); do cat "$OUT/rounds/$role.r$i.err" 2>/dev/null; done > "$OUT/$role.err"
    bring_back "$HUNT_TMP/work-$role" "$OUT/work-$role"
    printf 'rc=%s\nsecs=%s\ntmo=%s\nrounds=%s\ngate=%s\n' "$rc" "$(( $(date +%s) - t0 ))" "$TMO" "$r" "$label" \
        > "$OUT/$role.meta"
  ) &
  launched=$((launched+1))
  echo "  avci sahada: $role — ${plats:-platform kalmadi} · listesinde $n_list adres"
done

echo
echo "$launched avci aynı anda çalışıyor — bekleniyor..."
wait
rmdir "$HUNT_TMP" 2>/dev/null
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
reports=$(find "$OUT" -maxdepth 1 -name 'HUNTER-*.md' 2>/dev/null | wc -l)

# ── THE WRITER, AFTER THE GATE (write_answer, above) ─────────────────────────────────────────────────
# Not on a run that failed — no hunter report, or a summary that could not be made: that run ends below.
echo
if [ "$WRITE" -ne 1 ]; then
  echo "writer: atlandi (--no-write) — answer.md oturumun."
elif [ "$reports" -eq 0 ] || [ "${merge_rc:-1}" -ne 0 ]; then
  echo "writer: cagrilmadi — kosu basarisiz (asagida)."
else
  write_answer
fi

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
failed=""; unmeasured=""
for role in $PICK; do
  rc=$(sed -n 's/^rc=//p' "$OUT/$role.meta" 2>/dev/null | head -1)
  [ "${rc:-1}" = "0" ] || failed="$failed $role(kod ${rc:-yok})"
  grep -qxF 'gate=time-up (unmeasured)' "$OUT/$role.meta" 2>/dev/null && unmeasured="$unmeasured $role(unmeasured)"
done
if [ "$reports" -eq 0 ] || [ "${merge_rc:-1}" -ne 0 ]; then
  echo
  echo "!! KOSU BASARISIZ — $reports avci raporu geldi. Basarisiz avcilar:${failed:- (yok)}${unmeasured:+ · olculmeyen:$unmeasured}"
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
echo "  keep.sh saklar: final.html · final.md · answer.md · evidence.jsonl · SUMMARY.txt · HUNTER-*.md · soru · bodies/ (5 MB altindaysa)"

# A ROLE THE GATE COULD NOT MEASURE WAS NEVER ACCEPTED (its meta says `gate=time-up (unmeasured)`): the
# run's last line names it, and the run leaves with code 1 even when every report came back.
if [ -n "$unmeasured" ]; then
  echo
  echo "!! OLCULMEYEN AVCI:$unmeasured — defter durumu okunamadi, kapi kabul etmedi; kosu kodu 1: $OUT/gate.log"
  exit 1
fi
