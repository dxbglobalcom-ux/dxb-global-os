#!/usr/bin/env bash
# QUICK MODE — Perplexity's everyday answer. One factual sentence goes in; in about a minute a
# numbered, de-duplicated digest of the pages that were actually READ comes out, the session writes a
# cited answer from it, and the same ruler that judges every answer of this skill judges it.
#
# WHY IT EXISTS. His order, 2026-09-24: "benim istedigim seviye perplexity seviyesi". The fleet
# (fleet/fleet.sh) takes minutes and exists for questions about PEOPLE — how many, who prefers what,
# what they say — because only it counts them (crowd.sh). A price, a rate or a limit needs none of
# that: his free Perplexity account answered the Opus 5.5 pricing question in ~15 s on the same day
# (measured 18:22 in the hidden Chrome). So a factual question takes this road, and a counting or
# opinion question is sent to the fleet by name instead of being answered here badly.
#
#   ask.sh "<question>" <outdir> [--pages N] [--force-quick]      the gather
#   ask.sh --check <outdir>                                        the judge
#
# THE GATHER, in order:
#   1. the wall sweep.sh stands behind (shortq.py --gate), fail-closed: exit 3, nothing fired;
#   2. a counting or opinion question (ROUTES below) is not a quick question: one line naming the
#      fleet, exit 5, nothing fired — --force-quick overrides;
#   3. in parallel: sweep.sh --tier core --no-browser --pages 0 into <outdir>/ground, and hidden.py
#      google into ground/google-deep.raw/.code/.err, its row appended to ground/.queries after
#      both have finished (sweep.sh empties that ledger when it starts);
#   4. PICK — a script, $0, no model: reciprocal-rank fusion (k=60) over the web engines' own
#      result lists (digest.engine_results: exa, parallel, tavily, firecrawl, youcom, google-deep,
#      and the google / duckduckgo stand-ins), so an address several engines return ranks first;
#      one address per canonical URL (sources.canon), at most 2 per domain, furniture and search
#      pages out (sources.canon again — no second filter); N (--pages, default 10) from the fusion,
#      then the reddit channel's own top 2 threads when it returned any. Audit: ground/pages/.pick.tsv;
#   5. READ — fetch.py --batch ground/pages/urls.txt --timeout 20 --workers 8, under the gather's
#      wall clock (below);
#   6. KAYNAKLAR.txt — the picked addresses READ with a body >= 1 KB, in pick order, then the rest,
#      so the read, best-ranked sources get the smallest ids; sources.py -> sources.json;
#      digest.py -> digest.md; .t1.
#
# THE WALL CLOCK. The gather must end within 75 s, and fetch.py's --timeout is PER DOOR: a walled page
# walks up to twelve doors, so one bad address could hold the batch for minutes. So the sweep and the
# hidden Google get FIRE_MAX seconds, and the reading chain is stopped READ_END seconds after .t0 at
# the latest (timeout kills its whole process group; hidden.py closes its window on SIGTERM). A page
# that landed before the stop is kept — fetch.py writes each page as it finishes, and sources.py maps
# NN-*.md back through urls.txt when FETCH-LOG.json was never written.
#
# A PREVIOUS RUN IN <outdir> IS MOVED ASIDE, NEVER REUSED: its sources.json may already be cited by
# an answer, and a new registry in the same folder would silently re-point every [n]. It goes to
# <outdir>.prev-<time>, and the line saying so is printed. A run is known by its own marker, .t0 —
# every deep record under .planning/research/answers/ holds a question.txt too — and any other
# non-empty folder is refused (exit 2). So is any folder inside the repository, for the gather and
# the judge alike: runs never write into the repo; a record is fleet/keep.sh's, on his "kaydet"
# (SKILL.md §7).
#
# THE JUDGE (--check): cite-check.py --mode quick -> <outdir>/cite-check.txt; on PASS render.py ->
# final.md + citations.json and .t2. Exit 1 on FAIL — and then none of those three exist: a previous
# PASS's final.md and .t2 are removed before judging, so no end-to-end time stands beside a FAIL. It
# needs only answer.md and sources.json, so the same judge runs on a pplx.py folder too.
set -uo pipefail

R="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
T0="$(date +%s.%N)"
FIRE_MAX=45        # seconds the sweep and the hidden Google may take
READ_END=62        # the reading chain stops at t0 + this many seconds

secs() {  # seconds from $1 to $2 (epoch strings), one decimal
  awk -v a="$1" -v b="$2" 'BEGIN { printf "%.1f", b - a }'
}

# the repository this file lives in (…/.claude/skills/dxb-research/scripts → four folders up)
REPO="$(cd "$R/../../../.." && pwd -P)"
[ -e "$REPO/.git" ] || REPO=""
in_repo() {  # $1: a folder, there or not yet
  [ -n "$REPO" ] || return 1
  case "$(realpath -m -- "$1")/" in "$REPO/"*) return 0 ;; esac
  return 1
}
refuse_repo() {
  if in_repo "$1"; then
    echo "!! $1 depo icinde — kosular depoya yazmaz (SKILL.md §7); depo disinda bir klasor ver" >&2
    exit 2
  fi
}

# ================================================================== the judge
if [ "${1:-}" = "--check" ]; then
  OUT="${2:-}"; OUT="${OUT%/}"
  if [ -z "$OUT" ] || [ ! -d "$OUT" ]; then
    echo "kullanim: ask.sh --check <kosu-klasoru>" >&2
    exit 2
  fi
  refuse_repo "$OUT"
  for f in answer.md sources.json; do
    [ -f "$OUT/$f" ] || { echo "ask --check: $OUT/$f yok" >&2; exit 2; }
  done
  rm -f "$OUT/final.md" "$OUT/citations.json" "$OUT/.t2"     # a verdict never stands beside an old one
  QARG=(); [ -f "$OUT/question.txt" ] && QARG=(--question "$OUT/question.txt")
  python3 "$R/cite-check.py" "$OUT/answer.md" --sources "$OUT/sources.json" --run-dir "$OUT" \
      "${QARG[@]}" --mode quick > "$OUT/cite-check.txt" 2>&1
  CC_RC=$?
  VERDICT=FAIL
  if [ "$CC_RC" -eq 0 ]; then
    VERDICT=PASS
    if ! python3 "$R/render.py" "$OUT/answer.md" --sources "$OUT/sources.json" \
          --out "$OUT/final.md" --json "$OUT/citations.json" > /dev/null; then
      VERDICT="PASS (render.py HATA)"
    fi
    date +%s.%N > "$OUT/.t2"
  else
    # what the writer has to repair: every failing rule with its lines, and the ruler's own verdict
    awk '/^R[0-9]+  FAIL/ { on = 1; print; next } /^R[0-9]+  PASS/ { on = 0 } on && /^      / { print }' \
        "$OUT/cite-check.txt"
    tail -n 1 "$OUT/cite-check.txt"
  fi
  GATHER="—"; E2E="—"
  [ -f "$OUT/.t0" ] && [ -f "$OUT/.t1" ] && GATHER="$(secs "$(cat "$OUT/.t0")" "$(cat "$OUT/.t1")") s"
  [ "$CC_RC" -eq 0 ] && [ -f "$OUT/.t0" ] && E2E="$(secs "$(cat "$OUT/.t0")" "$(cat "$OUT/.t2")") s"
  echo "gather: $GATHER · uctan uca: $E2E · cite-check $VERDICT"
  [ "$CC_RC" -eq 0 ] && exit 0
  exit 1
fi

# ================================================================== the gather
Q="${1:-}"; OUT="${2:-}"; OUT="${OUT%/}"
shift 2 2>/dev/null || true
PAGES=10; FORCE=0
while [ $# -gt 0 ]; do
  case "$1" in
    --pages)   # an option that takes a value refuses to go without one — `shift 2` on one word loops
      if [ $# -lt 2 ] || [[ "$2" == --* ]]; then echo "ask.sh: --pages bir sayi ister (ornek: --pages 10)" >&2; exit 2; fi
      PAGES="$2"; shift 2 ;;
    --force-quick) FORCE=1; shift ;;
    *) echo "ask.sh: bilinmeyen secenek: $1" >&2; exit 2 ;;
  esac
done
if [ -z "$Q" ] || [ -z "$OUT" ] || ! [[ "$PAGES" =~ ^[0-9]+$ ]]; then
  echo "kullanim: ask.sh \"<tek cumlelik soru>\" <cikti-klasoru> [--pages N] [--force-quick]" >&2
  echo "          ask.sh --check <cikti-klasoru>" >&2
  exit 2
fi
refuse_repo "$OUT"

# ── 1. THE WALL — the same judge sweep.sh asks, and just as fail-closed ─────────────────────────
GATE_MSG="$(python3 "$R/shortq.py" --gate "$Q" 2>&1)"
GATE_RC=$?
if [ "$GATE_RC" -ne 0 ]; then
  if [ "$GATE_RC" = "3" ]; then
    echo "!! DUR: $GATE_MSG. Hizli mod tek cumlelik soru alir; arama kutusuna paragraf yazilmaz (SKILL.md, §0)." >&2
  else
    echo "!! DUR: kapi calisamadi (kod $GATE_RC): $GATE_MSG" >&2
  fi
  exit 3
fi

# ── 2. ROUTING — counting and opinion are the fleet's job ──────────────────────────────────────
# A small, explicit, bilingual list of PHRASES, never a bare word: a people noun and what they say,
# think, prefer or feel, at most six words apart ("İnsanlar Opus 5.5 hakkında ne diyor"), or a count
# question whose people noun stands at most three words on ("How many Claude Code users", "kaç tane
# geliştirici"). "Which region is preferred" names nobody and stays here, and so does a plan's limit:
# "how many monthly active users does the free plan allow" asks for a number the vendor wrote, not
# for people — a count question beside a limit word (LIMIT) is not routed. Matched on folded text
# (I/İ/ı/i one letter, accents off). Measured on 16 counting/opinion and 10 factual questions,
# 2026-09-24 (P4 round-1 repairs, B1).
ROUTE="$(python3 - "$Q" <<'PYEOF'
import re, sys, unicodedata

def gap(n):                       # at most n words between two parts of one phrase
    return rf"(?:\S+ ){{0,{n}}}"

EN = (r"(?:people|persons|humans|folks|users|developers|devs|engineers|programmers|coders|customers|"
      r"professionals|redditors|reddit|community|experts|reviewers)\b")
# a Turkish people noun with its own endings (plural, possessive, case) — "kişisel" is not one
TR = (r"(?:insan|kisi|kullanici|gelistirici|yazilimci|programci|muhendis|musteri|profesyonel|uzman|"
      r"toplulu[kg]|reddit)(?:l[ae]r)?(?:s?[iu])?(?:n?[iu]n|y?[iu]|y?[ae]|n?[dt][ae]n?)?(?:'\w+)?\b")
SAY_EN = r"(?:say|says|saying|said|think|thinks|thinking|thought|feel|feels|feeling)\b"
SAY_TR = r"(?:ne|nasil) (?:diyor|dusunuyor|buluyor|degerlendiriyor|yorumluyor|soyluyor)"
LIMIT = re.compile(r"\b(?:allow\w*|limit\w*|quota\w*|caps?|capped|max|maximum|seats?|up to|"
                   r"per (?:user|person|seat|developer|member)|izin|sinir\w*|kota\w*|maksimum|en fazla|"
                   r"basina|(?:monthly|daily|weekly) active|(?:aylik|gunluk|haftalik) aktif|mau|dau|wau)\b")
ROUTES = [   # (name, phrase, a count question — silent beside a limit word)
    ("how many <people>", rf"\bhow many {gap(3)}{EN}", True),
    ("kac <kisi>", rf"\bkac {gap(3)}{TR}", True),
    ("what do <people> say/think", rf"\bwhat (?:do|does|did|are|is|were|would) {gap(4)}{EN}\S* {gap(4)}{SAY_EN}", False),
    ("<people> prefer", rf"\b{EN}\S* {gap(6)}prefer(?:s|ring)?\b", False),
    ("preferred by <people>", rf"\bprefer(?:red|s)? (?:by|among|with) {gap(3)}{EN}", False),
    ("<people> satisfied", rf"\b{EN}\S* {gap(6)}(?:satisfied|dissatisfied|happy|unhappy)\b", False),
    ("<people> satisfaction", r"\b(?:developer|user|customer)s?'? satisfaction\b", False),
    ("<insanlar> ne diyor", rf"\b{TR} {gap(6)}{SAY_TR}", False),
    ("<insanlar> dusunuyor", rf"\b{TR} {gap(6)}dusunuyor", False),
    ("tercih ediyor", r"\btercih (?:ediyor|eder\b|ederler|eden|edilen|ediliyor)", False),
    ("<insanlar> tercihi", rf"\b{TR} {gap(3)}tercih", False),
    ("memnun mu", r"\bmemnun\w*(?: (?:kal|ol)\w*)? m[iu]\w*\b", False),
    ("<insanlar> memnun", rf"\b{TR} {gap(6)}memnun", False),
]
q = unicodedata.normalize("NFKD", sys.argv[1].translate(str.maketrans({"I": "i", "İ": "i", "ı": "i"})).lower())
q = " ".join("".join(c for c in q if not unicodedata.combining(c)).split())
limit = LIMIT.search(q)
print(", ".join(name for name, rx, count in ROUTES if re.search(rx, q) and not (count and limit)))
PYEOF
)"
ROUTE_RC=$?
if [ "$ROUTE_RC" -ne 0 ]; then
  echo "!! DUR: yonlendirme calisamadi (kod $ROUTE_RC) — soru hicbir kanala gitmedi" >&2
  exit 3
fi
if [ -n "$ROUTE" ] && [ "$FORCE" != "1" ]; then
  echo "bu soru derin mod ister: fleet/fleet.sh <klasor> --q \"<kisa sorgu>\" [--q ...] — sayim/gorus sorusu ($ROUTE); hizli modda yine de sormak icin --force-quick"
  exit 5
fi

# ── 3. THE FOLDER — a previous run is moved aside, never reused ────────────────────────────────
if [ -e "$OUT" ] && [ ! -d "$OUT" ]; then
  echo "!! $OUT bir klasor degil" >&2
  exit 2
fi
if [ -d "$OUT" ] && [ -n "$(ls -A "$OUT" 2>/dev/null)" ]; then
  if [ -f "$OUT/.t0" ]; then          # the gather's own marker — question.txt proves nothing
    PREV="$OUT.prev-$(date +%Y%m%d-%H%M%S)"
    mv "$OUT" "$PREV" || { echo "!! onceki kosu kenara alinamadi: $OUT" >&2; exit 2; }
    echo "onceki kosu kenara alindi: $PREV"
  else
    echo "!! $OUT bos degil ve bir ask.sh kosusu degil (.t0 yok) — bos ya da yeni bir klasor ver" >&2
    exit 2
  fi
fi
G="$OUT/ground"
mkdir -p "$G/pages" || exit 2
printf '%s\n' "$Q" > "$OUT/question.txt"
printf '%s\n' "$T0" > "$OUT/.t0"

# ── 4. FIRE — the keyless engines, the crowd channels and the hidden Google, at once ───────────
SP=""; HP=""; FP=""
trap 'for p in $SP $HP $FP; do kill -TERM "$p" 2>/dev/null; done; exit 130' INT TERM HUP
timeout -k 3 "$FIRE_MAX" bash "$R/sweep.sh" "$Q" "$G" --tier core --no-browser --timeout 25 --pages 0 \
    < /dev/null > "$G/.sweep.log" 2>&1 &
SP=$!
timeout -k 3 "$FIRE_MAX" python3 "$R/hidden.py" google "$Q" --timeout 40 \
    < /dev/null > "$G/google-deep.raw" 2> "$G/google-deep.err" &
HP=$!
wait "$SP"; SWEEP_RC=$?
wait "$HP"; echo "$?" > "$G/google-deep.code"
SP=""; HP=""
# the ledger row, exactly as sweep.sh writes its own: name<TAB>the text that left the machine
printf '%s\t%s\n' "google-deep" "$Q" >> "$G/.queries"
[ "$SWEEP_RC" -ne 0 ] && echo "!! sweep.sh kod $SWEEP_RC (${FIRE_MAX} sn siniri: 124) — kapsama satiri neyin geldigini soyler"

# ── 5. PICK — reciprocal-rank fusion, $0 ────────────────────────────────────────────────────────
python3 - "$R" "$G" "$PAGES" > "$G/pages/urls.txt" 2> "$G/pages/.pick.err" <<'PYEOF'
import sys
from pathlib import Path
sys.path.insert(0, sys.argv[1])
import digest
import sources as S
ground, n, K = Path(sys.argv[2]), int(sys.argv[3]), 60
lists = digest.engine_results(ground)
score, votes, best, first, url = {}, {}, {}, {}, {}
for ei, (eng, hits) in enumerate(lists):
    for rank, h in enumerate(hits, 1):
        score[h.key] = score.get(h.key, 0.0) + 1.0 / (K + rank)
        votes.setdefault(h.key, []).append(f"{eng}:{rank}")
        best[h.key] = min(best.get(h.key, rank), rank)
        if h.key not in first:
            first[h.key], url[h.key] = ei, h.url
order = sorted(score, key=lambda k: (-score[k], -len(votes[k]), best[k], first[k], k))
picked, per = [], {}
for k in order:
    if len(picked) >= n:
        break
    d = S.domain_of(url[k])
    if per.get(d, 0) >= 2:
        continue
    per[d] = per.get(d, 0) + 1
    picked.append(k)
added = 0
for h in digest.reddit_threads(ground):
    if added >= 2:
        break
    if h.key in picked:
        continue
    picked.append(h.key)
    url[h.key], score[h.key], votes[h.key] = h.url, score.get(h.key, 0.0), ["reddit-kanali"]
    added += 1
(ground / "pages" / ".pick.tsv").write_text("".join(
    f"{i}\t{score[k]:.6f}\t{' '.join(votes[k])}\t{url[k]}\n" for i, k in enumerate(picked, 1)), encoding="utf-8")
(ground / "pages" / ".pick.txt").write_text(
    f"secim: {len(picked)} adres — RRF k={K} · {len(lists)} motor ({' '.join(e for e, _ in lists) or 'yok'})"
    f" · alan basina <= 2 · reddit +{added}\n", encoding="utf-8")
print("\n".join(url[k] for k in picked))
PYEOF
PICK_RC=$?
if [ "$PICK_RC" -ne 0 ]; then
  echo "!! secim calisamadi (kod $PICK_RC): $(tail -n 1 "$G/pages/.pick.err")" >&2
  exit 4
fi
NPICK=$(grep -c . "$G/pages/urls.txt")

# ── 6. READ — the reading chain, under the wall clock ──────────────────────────────────────────
CUT=""
if [ "$NPICK" -gt 0 ]; then
  LEFT="$(awk -v a="$T0" -v b="$(date +%s.%N)" -v e="$READ_END" 'BEGIN { l = e - (b - a); printf "%.1f", (l < 10 ? 10 : l) }')"
  timeout -k 5 "$LEFT" python3 "$R/fetch.py" --batch "$G/pages/urls.txt" --outdir "$G/pages" \
      --timeout 20 --workers 8 < /dev/null > "$G/pages/.fetch.log" 2>&1 &
  FP=$!
  wait "$FP"; FETCH_RC=$?
  FP=""
  [ "$FETCH_RC" -eq 124 ] || [ "$FETCH_RC" -eq 137 ] && CUT=" · okuma ${LEFT} sn'de durduruldu"
fi

# ── 7. KAYNAKLAR.txt — read first, in pick order; then the rest ────────────────────────────────
: > "$OUT/KAYNAKLAR.txt"
REST=""; NREAD=0; i=0
while IFS= read -r u; do
  [ -n "$u" ] || continue
  i=$((i + 1))
  body=""
  for f in "$G/pages/$(printf '%02d' "$i")-"*.md; do
    [ -f "$f" ] && body="$f" && break
  done
  if [ -n "$body" ] && [ "$(wc -c < "$body")" -ge 1024 ]; then
    printf '%s\n' "$u" >> "$OUT/KAYNAKLAR.txt"
    NREAD=$((NREAD + 1))
  else
    REST="$REST$u"$'\n'
  fi
done < "$G/pages/urls.txt"
printf '%s' "$REST" >> "$OUT/KAYNAKLAR.txt"

SRC_OUT="$(python3 "$R/sources.py" "$OUT" 2>&1)" || { echo "!! sources.py: $SRC_OUT" >&2; exit 4; }
DIG_OUT="$(python3 "$R/digest.py" "$OUT" 2>&1)" || { echo "!! digest.py: $DIG_OUT" >&2; exit 4; }
T1="$(date +%s.%N)"
printf '%s\n' "$T1" > "$OUT/.t1"

# ── 8. what the session needs to know, and nothing else ────────────────────────────────────────
echo "soru: $Q"
printf '%s\n' "$DIG_OUT" | grep '^kanallar:'
echo "$(cat "$G/pages/.pick.txt" 2>/dev/null || echo "secim: -") · okunan $NREAD/$NPICK (>= 1 KB)$CUT"
printf '%s\n' "$SRC_OUT" | tail -n 1 | sed -E 's/^sources: ([0-9]+) \([^)]*\) · with a body on disk ([0-9]+).*/kaynaklar: \1 (sources.json) · govdesi diskte \2/'
printf '%s\n' "$DIG_OUT" | grep '^digest:'
[ "$NREAD" -lt 5 ] && echo "!! okunan kaynak 5'ten az ($NREAD) — cevap zayif kalir; kapsama satirina bak"
echo "sonra: $OUT/answer.md yaz (digest.md'deki [n] ile) -> bash $R/ask.sh --check $OUT"
echo "gather: $(secs "$T0" "$T1") s"
exit 0
