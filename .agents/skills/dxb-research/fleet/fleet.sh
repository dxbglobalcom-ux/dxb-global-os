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
# EVERY CLAIM OF THE ANSWER STANDS ON A ROW OF THE CLAIM LEDGER (B56 K2, 2026-09-26). Measured on the
# kept K1 run (EVIDENCE-B56-K2 §1): the answer cited 150 ids from 108 addresses, 12 of them rows a hunter
# had judged "kanıt değil" (L1071, cited on line 71), and no claim said how many independent sources stood
# behind it or whether anyone had looked for the other side. So the writer is handed only the rows the
# ledger admits and writes a DRAFT; scripts/claims.py turns its claims into a ledger; a counter-evidence
# hunter (`karsi`) and a gap hunter (`bosluk`) are sent over that ledger, each with a completion gate of
# its own; and the writer's second pass folds what they found into answer.md (THE TAIL, below).
#
#   fleet.sh [<run-dir>|<name>] --q "<short query>" [--q "..."]... [--dert FILE]
#            [--hunters N] [--model NAME] [--timeout S] [--roles a,b,c]
#            [--rounds N] [--fetch-limit N] [--fetch-workers N] [--allow-tmp] [--no-write]
#            [--claim-rounds N] [--claim-timeout S] [--no-claim-hunt] [--crowd-cap N]
#   fleet.sh --write-only <run-dir> [--claim-rounds N] [--claim-timeout S] [--no-claim-hunt]
#                                            # the tail alone — draft, claim rounds, answer, page — on a run that has its rows
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
CLA="$SKILL/scripts/claims.py"
REPO_ROOT="$(builtin cd "$SKILL/../../.." && pwd)"

OUT=""
case "${1:-}" in --*|"") ;; *) OUT="$1"; shift ;; esac
N=4; MODEL=claude-opus-5-5; TMO=600; ROLES=""; DERT=""
ROUNDS=3; FETCH_LIMIT=2000; FETCH_WORKERS=6; ALLOW_TMP=0; WRITE=1; WRITE_ONLY=""
CLAIM_ROUNDS=2; CLAIM_TMO=600; CLAIM_HUNT=1; CROWD_CAP=40
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
    --claim-rounds)  CLAIM_ROUNDS="${2:?--claim-rounds bir sayi ister}"; shift 2 ;;
    --claim-timeout) CLAIM_TMO="${2:?--claim-timeout bir sayi ister}"; shift 2 ;;
    --no-claim-hunt) CLAIM_HUNT=0; shift ;;
    --crowd-cap)     CROWD_CAP="${2:?--crowd-cap bir sayi ister}"; shift 2 ;;
    *) shift ;;
  esac
done
for v in "$ROUNDS" "$FETCH_LIMIT" "$FETCH_WORKERS" "$CLAIM_ROUNDS" "$CLAIM_TMO" "$CROWD_CAP"; do
  case "$v" in ''|*[!0-9]*) echo "!! DUR: --rounds, --fetch-limit, --fetch-workers, --claim-rounds, --claim-timeout ve --crowd-cap tam sayi ister (verilen: $v)." >&2; exit 3 ;; esac
done
if [ "$ROUNDS" -lt 1 ] || [ "$FETCH_WORKERS" -lt 1 ] || [ "$CLAIM_ROUNDS" -lt 1 ] || [ "$CLAIM_TMO" -lt 1 ] || [ "$CROWD_CAP" -lt 1 ]; then
  echo "!! DUR: --rounds, --fetch-workers, --claim-rounds, --claim-timeout ve --crowd-cap en az 1 olur." >&2; exit 3
fi
if [ -z "$WRITE_ONLY" ] && [ ${#QUERIES[@]} -eq 0 ]; then
  echo "kullanim: fleet.sh [<kosu-klasoru>|<isim>] --q \"<kisa sorgu>\" [--q ...] [--dert DOSYA] [--hunters N] [--model AD] [--timeout SN] [--roles a,b] [--rounds N] [--fetch-limit N] [--fetch-workers N] [--allow-tmp] [--no-write] [--claim-rounds N] [--claim-timeout SN] [--no-claim-hunt] [--crowd-cap N]   ·   fleet.sh --write-only <kosu-klasoru> [--claim-rounds N] [--claim-timeout SN] [--no-claim-hunt]" >&2
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
# line, the ledger's own status table and the rows the ledger ADMITS, under the recipe's rules
# (fleet/writer-prompt.md). WHICH ROWS (B56 K2): `evidence.py writer-rows` prints them — a hunter's quote,
# or an address a hunter judged evidence, never a row judged "kanıt değil" (12 of the K1 answer's 150
# cited ids were such rows, EVIDENCE-B56-K2 §1) — and says on stderr how many it refused and why.
# IT WRITES TWICE, in THE TAIL below: `write_answer draft` writes <run>/answer.draft.md with {{CLAIMS}}
# saying there is no claim ledger yet, and `write_answer final` writes <run>/answer.md with the draft's
# ledger (`claims.py brief`) as {{CLAIMS}}; the page is made after the second. A full run calls the tail
# after the completion gate (`--no-write` skips it); `--write-only <run>` runs it on a run that already
# has its rows.
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
# $1 the pass: `draft` (answer.draft.md, its files *.draft.*, its folder writer-draft/) or `final`
# (answer.md, the K1 names). Every log line of a pass says which one it is: `writer (taslak):` / `writer (son):`.
write_answer() {
  local pass="$1" tag sfx ans tpl="$HERE/writer-prompt.md" filled size s wrc secs wd rrc brc
  case "$pass" in
    draft) tag="writer (taslak)"; sfx=".draft"; ans="$OUT/answer.draft.md" ;;
    *)     tag="writer (son)"; sfx=""; ans="$OUT/answer.md" ;;
  esac
  filled="$OUT/writer-prompt$sfx.txt"
  if [ ! -f "$tpl" ]; then echo "!! $tag: $tpl yok — ${ans##*/} yazilmadi."; return 1; fi
  python3 "$EVI" status "$OUT" --format md > "$OUT/writer-status.md" 2>&1
  python3 "$EVI" writer-rows "$OUT" > "$OUT/writer-rows$sfx.txt" 2> "$OUT/writer-rows$sfx.err"
  rrc=$?
  if [ "$rrc" -ne 0 ]; then
    echo "!! $tag: evidence.py writer-rows calismadi (kod $rrc) — ${ans##*/} yazilmadi: $OUT/writer-rows$sfx.err"
    return 1
  fi
  sed -n 's/^writer-rows: /   writer-rows: /p' "$OUT/writer-rows$sfx.err"
  # {{CLAIMS}}: nothing on the first pass; on the second the draft's ledger, as claims.py brief prints it
  # (it reads claims.draft.jsonl). A ledger that cannot be read is named in the prompt and in the log.
  if [ "$pass" = draft ]; then
    printf '%s\n' "(ilk geçiş — iddia defteri henüz yok)" > "$OUT/writer-claims$sfx.txt"
  else
    python3 "$CLA" brief "$OUT" > "$OUT/writer-claims.txt" 2> "$OUT/writer-claims.err"
    brc=$?
    if [ "$brc" -ne 0 ] || [ ! -s "$OUT/writer-claims.txt" ]; then
      echo "!! $tag: claims.py brief kod $brc — iddia defteri yazara gitmedi: $OUT/writer-claims.err"
      printf '(iddia defteri okunamadi — claims.py brief kod %s)\n' "$brc" > "$OUT/writer-claims.txt"
    fi
  fi
  size="$(python3 - "$OUT" "$tpl" "$OUT/writer-status.md" "$filled" "$OUT/writer-rows$sfx.txt" "$OUT/writer-claims$sfx.txt" <<'PY'
import re, sys
from pathlib import Path
run, tpl, status, out, rows, claims = (Path(a) for a in sys.argv[1:7])

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
lines = [ln for ln in text(rows).splitlines() if ln.strip()]      # evidence.py writer-rows, one row a line
vals = {"QUESTION": text(run / "question.txt") or "(question.txt yok)",
        "HUKUM": "\n".join(verdicts) or "(hicbir avci HÜKÜM satiri getirmedi)",
        "STATUS": text(status) or "(evidence.py status okunamadi)",
        "ROWS": "\n".join(lines), "N_ROWS": str(len(lines)),
        "CLAIMS": text(claims) or "(iddia defteri yok)"}
filled = re.sub(r"\{\{([A-Z_]+)\}\}", lambda m: vals.get(m.group(1), m.group(0)), text(tpl)) + "\n"
out.write_text(filled, encoding="utf-8")
print(f"{len(lines)} satir · {len(filled.encode()) // 1024} KB")
PY
)" || { echo "!! $tag: istem doldurulamadi — ${ans##*/} yazilmadi."; return 1; }
  if [ "${size%% *}" = "0" ]; then
    echo "!! $tag: yazara verilecek satir yok (kabul edilen 0) — cagrilmadi, ${ans##*/} yazilmadi."
    return 1
  fi
  wd="$(away_dir "writer$sfx")" || { echo "!! $tag: disaridaki klasoru acilamadi — ${ans##*/} yazilmadi."; return 1; }
  echo "$tag: $size -> claude-opus-5-5 · efor high"
  s=$(date +%s)
  env -C "$wd" timeout 600 claude -p --model claude-opus-5-5 --effort high --tools "" --strict-mcp-config \
      --output-format json < "$filled" > "$OUT/writer$sfx.json" 2> "$OUT/writer$sfx.err"
  wrc=$?
  secs=$(( $(date +%s) - s ))
  bring_back "$wd" "$OUT/writer${sfx:+-draft}"
  python3 - "$OUT/writer$sfx.json" "$ans" "$wrc" "$secs" "$tag" <<'PY'
import json, re, sys
from pathlib import Path
jf, ans, rc, secs, tag = Path(sys.argv[1]), Path(sys.argv[2]), int(sys.argv[3]), sys.argv[4], sys.argv[5]
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
    print(f"!! {tag}: basarisiz (kod {rc}) — cost {cost} · {secs} s · {ans.name} yazilmadi: {jf.with_suffix('.err')}")
    sys.exit(1)
ans.write_text(text + "\n", encoding="utf-8")
ids = set(re.findall(r"\bL\d{4,}\b", text))
http = len(re.findall(r"https?://", text))
print(f"{tag}: cost {cost} · {secs} s -> {ans} · {len(text.splitlines())} satir · {len(ids)} kimlik · http {http}")
PY
}

# --write-only: the run folder is the one given, THE FIELD below is skipped, and the tail runs once the
# jail its claim hunters need is standing (THE TAIL, below the hunter's launch).
if [ -n "$WRITE_ONLY" ]; then
  OUT="$(builtin cd "$WRITE_ONLY" 2>/dev/null && pwd)" || { echo "!! DUR: kosu klasoru yok: $WRITE_ONLY" >&2; exit 3; }
  [ -f "$OUT/evidence.jsonl" ] || { echo "!! DUR: $OUT/evidence.jsonl yok — yazara verilecek satir yok." >&2; exit 3; }
  echo "kosu    : $OUT  (yalniz kuyruk)"
else   # ── THE FIELD — the run folder, the ground, the ledger, fetch-all, triage and the owners; a full run only

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
# THE CLAIM ROLES ARE THE TAIL'S (roles.tsv: karsi, bosluk — platform `all`). They work the draft's claim
# ledger after the writer's first pass, so --roles never launches one as a hunter: it is named and dropped.
TAIL_ROLES="karsi bosluk"
p2=""
for role in $PICK; do
  case " $TAIL_ROLES " in
    *" $role "*) echo "!! $role bir avci degil — kuyrugun rolu (iddia turlari); --roles'tan cikarildi." >&2 ;;
    *) p2="$p2 $role" ;;
  esac
done
PICK="${p2# }"

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
# The limit is 2000 since B56 K2: the K1 run needed 1279 fetches (EVIDENCE-B56-K2 §1) where the limit
# was 400, so every address past the 400th stayed without a body.
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
# `all` is the claim roles' column (THE TAIL): they work claims, not a platform, and own none here.
# A platform nobody owns is NAMED here; its rows stay in the ledger and in the coverage table.
role_platforms() { awk -F'\t' -v r="$1" '$1 == r { print $2; exit }' "$HERE/roles.tsv"; }
OWNED=" "; REST_OWNER=""
for role in $PICK; do
  p="$(role_platforms "$role")"
  if [ "$p" = "rest" ]; then REST_OWNER="$role"; else OWNED="$OWNED$p "; fi
done
REST=""
for p in $( { cut -f2 "$HERE/roles.tsv" | tr ' ' '\n'; echo web; sed -n 's/^platform=\([^ ]*\).*/\1/p' "$OUT/from-ground.txt"; } \
            | grep -vxE 'rest|all' | awk 'NF && !seen[$0]++' ); do
  case "$OWNED" in *" $p "*) ;; *) REST="$REST $p" ;; esac
done
REST="${REST# }"
if [ -n "$REST" ] && [ -z "$REST_OWNER" ]; then
  echo "!! SAHIPSIZ PLATFORM: $REST — bu kosuda okuyan avci yok; satirlari defterde durur, kapsama tablosunda gorunur."
fi
fi   # ── end of THE FIELD

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
# The jail binds that folder writable by name, as it binds the run folder. The claim hunters of THE TAIL
# stand in the same folder (work-karsi, work-bosluk) inside the same jail, so it goes only after the tail.
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
# The claim hunters of THE TAIL are launched by the same hunt_round with these same two lists.

# ── THE TAIL — THE ANSWER IS WRITTEN TWICE, AND EVERY CLAIM OF THE DRAFT IS CHECKED IN BETWEEN ───────────
# After the hunters' gate (or alone, with --write-only):
#   (1) write_answer draft  -> answer.draft.md, from the rows the ledger admits; no page yet
#   (2) claims.py extract   -> claims.draft.jsonl, the draft's claim ledger              log `claims: …`
#   (3) THE CLAIM ROUNDS    -> `karsi` hunts the counter-evidence of the claims that carry a verdict,
#       then `bosluk` a second independent source for every single-source claim, each sent back by a
#       gate of its own (`claim-gate:` lines, gate.log); --no-claim-hunt skips this step
#   (4) write_answer final  -> answer.md, the writer handed the draft's ledger as {{CLAIMS}}
#   (5) claims.py extract --keep-links claims.draft.jsonl -> claims.jsonl, what the rounds found carried
#       onto the final answer's claims                                          log `claims: … carried j`
#       (no draft ledger — its extract failed — and the final one is written without links, said in a line)
#   (6) render.py           -> final.html · final.md (the coverage table stays where it was: KAPSAMA)
# THE ROUNDS WORK ON THE DRAFT'S LEDGER. `claims.py list`, `link` and `status` are called with the run
# alone and work on claims.draft.jsonl while the draft pass's ledger is there; `brief` and --keep-links
# read the same file, so what the two hunters linked reaches the second pass and the final ledger.

# One number of a claims.py trailer line: $1 the line, $2 the word before it ("CLAIMS:" for the first).
trailer_num() { printf '%s\n' "$1" | sed -n "s/.*$2 \([0-9][0-9]*\).*/\1/p" | head -1 | grep . || echo "?"; }

# (2) and (5) — THE CLAIM LEDGER OF ONE ANSWER: $1 draft|final. The log line is taken from claims.py's own
# trailer (`CLAIMS: n · verdict v · thin t · counter-less c · inadmissible-cited i · carried j`), never
# retyped; an extract that fails, or prints no trailer, is named and counts for nothing.
claims_extract() {
  local log tr rc args
  if [ "$1" = draft ]; then
    log="$OUT/claims.draft.log"
    args=(extract "$OUT" --answer "$OUT/answer.draft.md" --out "$OUT/claims.draft.jsonl")
  else
    log="$OUT/claims.log"
    args=(extract "$OUT" --answer "$OUT/answer.md" --out "$OUT/claims.jsonl")
    # the links ride over only from a draft ledger that is there: claims.py refuses a --keep-links file
    # it cannot read (code 2), and a failed draft extract would then cost the final answer its ledger
    if [ -f "$OUT/claims.draft.jsonl" ] && [ -r "$OUT/claims.draft.jsonl" ]; then
      args+=(--keep-links "$OUT/claims.draft.jsonl")
    else
      echo "claims: taslak defteri yok — bağlar taşınmadı"
    fi
  fi
  python3 "$CLA" "${args[@]}" > "$log" 2>&1
  rc=$?
  tr="$(grep -m1 '^CLAIMS:' "$log")"
  if [ "$rc" -ne 0 ] || [ -z "$tr" ]; then
    echo "!! claims: claims.py extract kod $rc — ${args[5]##*/} yazilmadi: $log"
    return 1
  fi
  printf 'claims: %s · thin %s · counter-less %s' \
      "$(trailer_num "$tr" CLAIMS:)" "$(trailer_num "$tr" thin)" "$(trailer_num "$tr" counter-less)"
  [ "$1" = draft ] || printf ' · inadmissible-cited %s · carried %s' \
      "$(trailer_num "$tr" inadmissible-cited)" "$(trailer_num "$tr" carried)"
  printf '\n'
}

# WHAT A CLAIM ROLE STILL OWES — counted from the claim ledger, never from what the hunter said: $1 the
# kind (counter|gap). From `claims.py status --format json`: owed_<kind> (claims sent to the hunter and
# neither found nor closed with none), new_for_links, and the kind's own found and none. Prints
# "<owed> <new_for_links> <found> <none>", or "? ? ? ?" when the status cannot be read — an exit code
# other than 0, or a JSON without those keys.
claim_left() {
  local sj
  sj="$(python3 "$CLA" status "$OUT" --format json 2>/dev/null)" || { echo "? ? ? ?"; return 0; }
  python3 -c '
import json, sys
kind = sys.argv[1]
try:
    d = json.loads(sys.argv[2])
    owed, new_for = int(d["owed_" + kind]), int(d["new_for_links"])
except (ValueError, KeyError, TypeError):
    print("? ? ? ?")
    raise SystemExit
k = d.get(kind) if isinstance(d.get(kind), dict) else {}
print(owed, new_for, k.get("found", "?"), k.get("none", "?"))
' "$1" "$sj"
}

# THE CLAIM HUNTER'S BRIEF, for every round: fleet/claim-prompt.md filled with the question, the arsenal,
# its list and its commands. $1 the round, $2 the seconds left on its clock, $3 the resume line (empty on
# the first round); role, kind, brief, t_end and CWRAP come from claim_rounds. A resumed round's list holds
# only the claims the draft's ledger does not yet call found or none: what the hunter closed is done.
# Every round's prompt is kept as rounds/prompt-<role>.r<n>.txt, as a hunter's is.
write_claim_prompt() {
  local r="$1" left="$2" devam="$3" shown="$OUT/rounds/list-$role.r$1.txt" prev found_arg word
  if [ -z "$devam" ]; then
    cp "$OUT/rounds/list-$role.txt" "$shown"
  else
    python3 - "$OUT/rounds/list-$role.txt" "$OUT/claims.draft.jsonl" "$kind" > "$shown" 2>/dev/null <<'PY' || cp "$OUT/rounds/list-$role.txt" "$shown"
import json, re, sys
lst, ledger, kind = sys.argv[1:4]
done = set()
for line in open(ledger, encoding="utf-8"):
    if line.strip():
        c = json.loads(line)
        if c.get(kind + "_status") in ("found", "none"):
            done.add(c.get("id"))
keep = False
for line in open(lst, encoding="utf-8").read().splitlines():
    m = re.match(r"### (C\d+)\b", line)
    if m:
        keep = m.group(1) not in done
    elif line.startswith("LIST:"):
        keep = False
    if keep:
        print(line)
PY
  fi
  if [ "$kind" = counter ]; then found_arg="--against <L0101>[,<L0102>…]"; word="karşı"
  else found_arg="--for <L0101>"; word="ikinci kaynak"; fi
  {
    if [ -n "$devam" ]; then
      printf '%s\n\n' "$devam"
      prev="$(round_result "$OUT/rounds/$role.r$(( r - 1 )).jsonl" text)"
      [ -n "$prev" ] && printf 'YOUR ROUND %s HANDED BACK THESE LINES. Its links are in the claim ledger:\n%s\n\n' "$(( r - 1 ))" "$prev"
    fi
    CP_ROLE="$role" CP_KIND="$kind" CP_BRIEF="$brief" CP_EVI="$EVI" CP_CLA="$CLA" CP_RUN="$OUT" \
    CP_OPENCLI="'$SKILL/bin/opencli'" CP_SECONDS="$left" CP_MINUTES="$(( left / 60 ))" \
    CP_STOP_AT="$(date -d "@$t_end" +%H:%M:%S)" CP_WRAP_AT="$(date -d "@$(( t_end - CWRAP ))" +%H:%M:%S)" \
    CP_LINK_FOUND="python3 \"$CLA\" link \"$OUT\" --claim <C007> $found_arg --by $role" \
    CP_LINK_NONE="python3 \"$CLA\" link \"$OUT\" --claim <C007> --none --kind $kind --reason \"<at most 12 words>\" --by $role" \
    CP_FOUND_WORD="$word" \
      python3 - "$HERE/claim-prompt.md" "$HERE/ARSENAL.md" "$OUT/question.txt" "$shown" <<'PY'
import os, re, sys
from pathlib import Path
tpl, arsenal, question, lst = (Path(a) for a in sys.argv[1:5])
text = lambda p: p.read_text(encoding="utf-8", errors="replace").strip() if p.is_file() else ""  # noqa: E731
listed = text(lst)
vals = {k[3:]: v for k, v in os.environ.items() if k.startswith("CP_")}
vals.update(ARSENAL=text(arsenal), QUESTION=text(question) or "(question.txt yok)",
            LIST=listed or "(listede iddia kalmadi)", N_CLAIMS=str(len(re.findall(r"^### C\d+", listed, re.M))))
print(re.sub(r"\{\{([A-Z_]+)\}\}", lambda m: vals.get(m.group(1), m.group(0)), text(tpl)))
PY
  } > "$OUT/prompt-$role.txt"
  cp "$OUT/prompt-$role.txt" "$OUT/rounds/prompt-$role.r$r.txt"
}

# (3) ONE CLAIM ROLE, ROUND BY ROUND: $1 the role (roles.tsv), $2 the kind it works (counter|gap). Its list
# is `claims.py list --todo <kind> --candidates 5`, which records the sending; a list with nothing on it
# launches nobody. The role is launched by hunt_round — the jail, the allow and deny lists, the model,
# `--effort low` and the folder outside the repository of a hunter — on a clock of its own (--claim-timeout),
# for at most --claim-rounds rounds. THE GATE asks `claims.py status --format json`: nothing owed on its
# kind and exit 0 → accepted; else relaunch with the resume line, or time-up (rounds or 0.8 of the clock);
# a status that cannot be read is `unmeasured` and never accepted. SATURATION, the gap role only: a round
# after which the ledger holds no more `for` links than before it found no second source anywhere, so its
# label carries (saturated) and no further round is launched. Every decision is one `claim-gate:` line.
claim_rounds() {
  local role="$1" kind="$2" brief lrc n_sent t0 t_end r left devam spent s rc secs cost CWRAP
  local owed for_now found none base_for measured el why verdict sat label seen note n
  brief="$(awk -F'\t' -v r="$role" '$1 == r { print $3; exit }' "$HERE/roles.tsv")"
  if [ -z "$brief" ]; then
    printf 'claim-gate: %s — no row in roles.tsv → not launched\n' "$role" | tee -a "$OUT/gate.log"
    return 1
  fi
  python3 "$CLA" list "$OUT" --todo "$kind" --candidates 5 > "$OUT/rounds/list-$role.txt" 2> "$OUT/rounds/list-$role.err"
  lrc=$?
  n_sent=$(grep -c '^### C[0-9]' "$OUT/rounds/list-$role.txt")
  if [ "$lrc" -ne 0 ]; then
    printf 'claim-gate: %s round 1 — list unreadable → unmeasured (claims.py list kod %s · %s)\n' \
        "$role" "$lrc" "$OUT/rounds/list-$role.err" | tee -a "$OUT/gate.log"
    CLAIM_UNMEASURED="$CLAIM_UNMEASURED $role(unmeasured)"
    return 0
  fi
  if [ "$n_sent" -eq 0 ]; then
    printf 'claim-gate: %s — nothing to send → not launched (%s)\n' \
        "$role" "$(grep -m1 '^LIST:' "$OUT/rounds/list-$role.txt" || echo "LIST: -")" | tee -a "$OUT/gate.log"
    return 0
  fi
  mkdir -p "$HUNT_TMP/work-$role"
  CWRAP=90; [ "$CLAIM_TMO" -lt 360 ] && CWRAP=$(( CLAIM_TMO / 4 ))     # the hunters' WRAP rule, on this clock
  read -r _ base_for _ _ <<< "$(claim_left "$kind")"
  echo "  iddia avcisi sahada: $role — listesinde $n_sent iddia"
  t0=$(date +%s); t_end=$(( t0 + CLAIM_TMO )); r=1; left=$CLAIM_TMO; devam=""; spent=0
  while :; do
    write_claim_prompt "$r" "$left" "$devam"
    s=$(date +%s)
    hunt_round "$role" "$r" "$left"; rc=$?
    secs=$(( $(date +%s) - s ))
    cost="$(round_result "$OUT/rounds/$role.r$r.jsonl" cost)"
    spent="$(awk -v a="$spent" -v b="$cost" 'BEGIN { if (b ~ /^[0-9.]+$/) a += b; printf "%.2f", a }')"
    read -r owed for_now found none <<< "$(claim_left "$kind")"
    measured=1                                   # two whole numbers, or the round was not measured
    for n in "$owed" "$for_now"; do case "$n" in ''|*[!0-9]*) measured=0 ;; esac; done
    el=$(( $(date +%s) - t0 )); why=""; sat=""
    if [ "$measured" -eq 1 ] && [ "$owed" -eq 0 ] && [ "$rc" -eq 0 ]; then verdict=accepted
    elif [ "$r" -ge "$CLAIM_ROUNDS" ]; then verdict=time-up; why=" · tur $r/$CLAIM_ROUNDS"
    elif [ $(( el * 10 )) -ge $(( CLAIM_TMO * 8 )) ]; then verdict=time-up; why=" · saat $el/$CLAIM_TMO s"
    else verdict=relaunch; fi
    if [ "$kind" = gap ] && [ "$measured" -eq 1 ] && [ "$for_now" = "$base_for" ]; then
      sat=" (saturated)"; [ "$verdict" = relaunch ] && verdict=stopped
    fi
    if [ "$measured" -eq 1 ]; then
      seen="unchecked $owed"; label="$verdict$sat"; note="found $found · none $none · $secs s · \$$cost$why"
    else
      seen="status unreadable"; label=unmeasured; [ "$verdict" = relaunch ] || label="time-up (unmeasured)"
      note="$secs s · \$$cost$why · !! iddia defteri durumu okunamadi (claims.py status)"
    fi
    [ "$rc" -ne 0 ] && note="kod $rc · $note"
    [ "$verdict" = relaunch ] || note="$note · rol $r tur · \$$spent"
    printf 'claim-gate: %s round %s — %s → %s (%s)\n' "$role" "$r" "$seen" "$label" "$note" | tee -a "$OUT/gate.log"
    [ "$verdict" = relaunch ] || break
    if [ "$measured" -eq 0 ]; then
      devam="DEVAM — the claim ledger could not count your round $r; finish your list with link, then hand back your lines"
    elif [ "$owed" -gt 0 ]; then
      devam="DEVAM — $owed claims unchecked on your list; finish them with link"
    else
      devam="DEVAM — your round $r ended with exit code $rc; finish your list with link, then hand back your lines"
    fi
    base_for="$for_now"
    r=$(( r + 1 )); left=$(( t_end - $(date +%s) )); [ "$left" -lt 1 ] && left=1
  done
  [ "$label" = "time-up (unmeasured)" ] && CLAIM_UNMEASURED="$CLAIM_UNMEASURED $role(unmeasured)"
  bring_back "$HUNT_TMP/work-$role" "$OUT/work-$role"
}

# A CLAIM ROLE THE GATE COULD NOT MEASURE WAS NEVER ACCEPTED — K1's rule for the hunters, and the lead's
# ruling for karsi and bosluk (B56 K2): the tail goes on and the page is written, then the run's last line
# names the role and the run leaves with code 1.
CLAIM_UNMEASURED=""
claim_unmeasured_line() {
  echo "!! OLCULMEYEN IDDIA TURU:$CLAIM_UNMEASURED — iddia defteri durumu okunamadi, kapi kabul etmedi; kosu kodu 1: $OUT/gate.log"
}

# THE TAIL ITSELF, steps (1)-(6). Returns 1 when a writer pass wrote nothing; every other hole is a named line.
run_tail() {
  write_answer draft || return 1
  # a draft ledger left by an earlier tail is not this draft's: a failed step (2) would hand (5) its links
  rm -f "$OUT/claims.draft.jsonl"
  if ! claims_extract draft; then
    echo "!! iddia turlari: taslagin iddia defteri yok — karsi ve bosluk gonderilmedi."
  elif [ "$CLAIM_HUNT" -ne 1 ]; then
    echo "iddia turlari: atlandi (--no-claim-hunt) — taslagin iddialari kontrol edilmedi."
  else
    claim_rounds karsi counter
    claim_rounds bosluk gap
  fi
  write_answer final || return 1
  # the page reads claims.jsonl beside the answer when it is there: a ledger left by an earlier tail is
  # not this answer's, so it goes before step (5) writes this one
  rm -f "$OUT/claims.jsonl"
  claims_extract final
  # (6) no --out: render.py writes the page, final.html, and final.md beside it (Lane C, 2026-09-26)
  if python3 "$SKILL/scripts/render.py" "$OUT/answer.md" --evidence "$OUT/evidence.jsonl" > "$OUT/render.log" 2>&1; then
    sed 's/^/   /' "$OUT/render.log"
  else
    echo "!! render.py calismadi (kod $?) — sayfa yok: $OUT/render.log (lider birlestirir)."
  fi
}

# --write-only ENDS HERE: the jail, the arsenal and the two lists are standing, THE FIELD was skipped.
if [ -n "$WRITE_ONLY" ]; then
  run_tail
  tail_rc=$?
  rmdir "$HUNT_TMP" 2>/dev/null
  if [ -n "$CLAIM_UNMEASURED" ]; then
    echo
    claim_unmeasured_line
    exit 1
  fi
  exit "$tail_rc"
fi

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
echo

# THE DENOMINATOR IS COUNTED BEFORE IT IS PRINTED. The summary used to take "how many separate
# people" out of a hunter's own sentence: on the one kept run it showed the CEO 783 while that
# hunter's report said, twice, "783 person-rows, NOT de-duplicated … ~10 spoke to the question".
# So the fleet harvests the thread addresses of its run and counts the people in them with
# crowd.sh — a script, free, instant, and it never invents.
# THE THREADS COME FROM THE LEDGER FIRST (B56 K2). Measured on the K1 run: crowd-urls.txt held 0
# lines while the ledger held 177 Reddit addresses — the harvest read ground*/*.raw only, and the
# SUMMARY said "INSAN: SAYILMADI". crowd-urls.sh now takes the Reddit and Hacker News threads with a
# body from the ledger, at most --crowd-cap of them, and falls back to the raw files only when the
# ledger has none; the log line says which of the two it was.
CROWDF="$OUT/crowd-count.txt"
: > "$CROWDF"
# One thread, one line: a comment's address is cut back to its thread, markdown's escapes are undone
# before the de-dup (crowd-urls.sh).
bash "$HERE/crowd-urls.sh" "$OUT" --cap "$CROWD_CAP" $GROUND_DIRS > "$OUT/crowd-urls.txt" 2> "$OUT/crowd-urls.err"
if [ -s "$OUT/crowd-urls.txt" ]; then
  echo "kalabalik sayiliyor: $(grep -c . "$OUT/crowd-urls.txt") baslik ($(sed -n 's/^crowd-urls: .*(\([a-z]*\))$/\1/p' "$OUT/crowd-urls.err" | tail -1))"
  # HIS RULING, 2026-09-20 — every quote carries the DATE OF ITS THREAD. The ground that
  # found the address is the one that knows it: `created_utc` sits beside `url` in the
  # search rows already on the disk, so it is harvested, never fetched twice.
  # THE DATE TRAVELS BY THE THREAD. crowd.sh looks a date up by the exact address it was handed, and
  # the ledger names a thread canonically (…/r/openai/comments/1w7ppcj) where the raw search row wrote
  # it as found (…/r/OpenAI/comments/1w7ppcj/fable_51_vs…/); so every harvested date is written a
  # second time under the address crowd-urls.txt carries for the same thread.
  python3 "$SKILL/scripts/threaddates.py" $GROUND_DIRS > "$OUT/crowd-dates.raw" 2>/dev/null || : > "$OUT/crowd-dates.raw"
  python3 - "$SKILL/scripts" "$OUT/crowd-urls.txt" "$OUT/crowd-dates.raw" > "$OUT/crowd-dates.tsv" 2>/dev/null <<'PY' || cp "$OUT/crowd-dates.raw" "$OUT/crowd-dates.tsv"
import re, sys
sys.path.insert(0, sys.argv[1])
import platforms

def thread(u):
    return re.sub(r"(/comments/[A-Za-z0-9_]+).*$", r"\1", platforms.canonical_url(u))

raw = [ln.rstrip("\n").split("\t", 1) for ln in open(sys.argv[3], encoding="utf-8") if "\t" in ln]
when = {}
for u, d in raw:
    print(f"{u}\t{d}")
    when.setdefault(thread(u), d)
for u in (ln.strip() for ln in open(sys.argv[2], encoding="utf-8")):
    if u and thread(u) in when:
        print(f"{u}\t{when[thread(u)]}")
PY
  bash "$SKILL/scripts/crowd.sh" "$OUT/crowd-urls.txt" "$OUT/crowd" --workers 6 --dates "$OUT/crowd-dates.tsv" > "$OUT/crowd.log" 2>&1
  grep -m1 '^CROWD-COUNT' "$OUT/crowd.log" > "$CROWDF" 2>/dev/null || true
fi

SUMFILE="$OUT/SUMMARY.txt"
python3 "$HERE/merge.py" "$OUT" --crowd "$CROWDF" | tee "$SUMFILE"
merge_rc=${PIPESTATUS[0]}
reports=$(find "$OUT" -maxdepth 1 -name 'HUNTER-*.md' 2>/dev/null | wc -l)

# ── THE TAIL, AFTER THE GATE (run_tail, above) ───────────────────────────────────────────────────────
# Not on a run that failed — no hunter report, or a summary that could not be made: that run ends below.
# The hunters' outside folder goes once the tail's claim hunters are back.
echo
if [ "$WRITE" -ne 1 ]; then
  echo "writer: atlandi (--no-write) — answer.md oturumun."
elif [ "$reports" -eq 0 ] || [ "${merge_rc:-1}" -ne 0 ]; then
  echo "writer: cagrilmadi — kosu basarisiz (asagida)."
else
  run_tail
fi
rmdir "$HUNT_TMP" 2>/dev/null

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
echo "  keep.sh saklar: final.html · final.md · answer.md · evidence.jsonl · claims.jsonl · answer.draft.md · claims.draft.jsonl · SUMMARY.txt · HUNTER-*.md · soru · bodies/ (5 MB altindaysa)"

# A ROLE THE GATE COULD NOT MEASURE WAS NEVER ACCEPTED (its meta says `gate=time-up (unmeasured)`): the
# run's last line names it, and the run leaves with code 1 even when every report came back. A claim role
# of THE TAIL that ended unmeasured is named the same way, on its own line (claim_unmeasured_line).
if [ -n "$unmeasured" ] || [ -n "$CLAIM_UNMEASURED" ]; then
  echo
  [ -n "$unmeasured" ] && echo "!! OLCULMEYEN AVCI:$unmeasured — defter durumu okunamadi, kapi kabul etmedi; kosu kodu 1: $OUT/gate.log"
  [ -n "$CLAIM_UNMEASURED" ] && claim_unmeasured_line
  exit 1
fi
