#!/usr/bin/env bash
# CHECK-W15-2026-09-16.sh — the checker's ruler for W15 (dictated by the checker session dxb-global-os-c7,
# Fable 5.1, 2026-09-16; copied and committed ALONE by the builder as `records(ruler): …` BEFORE the first line
# of W15 work — the audit law c7570071). Builder and checker run the SAME script. His word for W15
# (w15-ordered-to-start-on-the-rulers-arrival-2026-09-16): "cetvel gelince başla. bitincede biliyorsun süreci
# zaten. aynı w14te gibi."
#
# W15 (STUDIO_AUDIT_HANDOFF.md §7, row W15, the LAST row): governance hygiene. Findings F014 F015 F016 F017 F018
# F048 F054 F055 F056. Acceptance (the table): ledger entries or removals; STATE:76 corrected; both -13 prompts
# marked superseded; verify:ledger OK.
#
# THE CHECKER'S SCOPE RULING, measured 2026-09-16 before this ruler was written:
#   SETTLED by his registered words of 2026-09-15 — W15 executes CONSEQUENCES, it does not re-ask him:
#     F014 → law-c-not-a-ceo-law-source-unverified-2026-09-15  ("KANUN C: CEO böyle doğrulanmış bir yasa tanımıyor…")
#     F018 → board-rule-like-sentences-are-not-ceo-laws-2026-09-15 ("Tahtadaki '8 kural'… otomatik CEO yasası değildir")
#     F016 F017 F054 → handover-prompt-only-on-his-session-request-2026-09-15 ("Devir promptu: Global veya sürekli kural DEĞİLDİR…")
#     F015 → his prohibition of 2026-08-13 (CLAUDE.md §2: a remark is for THAT session; promoting it is forbidden)
#   MEASURED OPEN — real work, not wording:
#     F048  the door (dxb-verify) lists `pnpm test` and `gitleaks detect`; STATE's "battery" names a 3-folder subset;
#           2026-09-16 10:50 whole-suite run: 129 files, 6 FAILED (b23/graph-is-not-stale, b36/live-drills.host,
#           b36/seed-is-fiction, b36/wall-question, c42/rival-intel-ledger, phase4/velocity); gitleaks whole history: no leaks.
#           RULING: the battery is the door's list, whole — no subset adaptation. A red is fixed on ITS OWN row or named in
#           STATE.md as a known red WITH its owning board row. "Green on the parts you like is not green" (the door's words).
#     F055  measured: 'sadece bu ikisi' → 0 ledger entries, quoted only in commit a61d7ced; B39 migration 20260913001000
#           header cites (CEO 2026-09-13, "düzelt") — which entry covers it is unmeasured; 'devir promtu yazma' is covered
#           by the handover ruling's text; the "Turkish-summary decision" is on no active surface found by grep.
#           RULING: each of the four is REGISTERED (a ledger entry whose verbatim is COPIED from his typed record) or
#           written as UNVERIFIED in the evidence with the search that failed; the ledger gate learns the quotation-shaped
#           claim ("on his word/order", "on the CEO's order") so the hole ledger-truth.mjs:501 names is closed.
#     F056  CONFIRMED: no function in the company DB sets agents.persona_id (pg_proc: fn_persona_gate, fn_persona_submit,
#           fn_hr_evaluate, control_org_reactivate_employee — none SET it); raw `UPDATE agents … persona_id` in
#           scripts/hr-demo-hire.sh and scripts/bench/drain-throughput.mjs; the sync script binds by hand.
#           RULING: ONE new migration `…_persona_bind….sql` creating fn_persona_bind (gate-checked, audit row, persona_version)
#           applied through the canonical chain to BOTH engines; every bind path routed through it; NOT ONE existing binding
#           changes (snapshot below). This is the only db/ file W15 may touch, and the guard names it.
#
# THE SNAPSHOT the door's arrival must not disturb (company DB, SELECT only, 2026-09-16 10:4x):
BIND_MD5_BEFORE="1e2b5552947189574efcc386b8815358"   # md5(string_agg(id:persona_id order by id)) over agents
BOUND_BEFORE=213; AGENTS_BEFORE=219
MIG_BEFORE=169; MIG_AFTER=170                          # exactly one new migration, on both engines
#
# MODES
#   baseline | w15   — the records and their consequences (RED on today's tree by design)
#   db               — the persona door on both engines; the snapshot unchanged; sync --verify; persona ruler
#   guard <range>    — only the named files may change; exactly one new migration; apps/ packages/ untouched
#   battery          — THE DOOR'S BATTERY, WHOLE: typecheck · pnpm test (all files) · verify:ledger · i18n · gitleaks
#                      (whole history) · vitrin gate · the shared W9-B08 battery · tree clean. A failing test file passes
#                      this line only if STATE.md names it as a known red with a board row.
# Exit 0 = every line PASS in that mode; 1 otherwise.

set -u
R="/home/dxb/DxB Global OS"
Q="$R/.planning/quick/20260903-media-studio-founding"
BOARD="$R/HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md"
STATE="$R/.planning/STATE.md"
LEDGER="$R/scripts/governance/ceo-approvals.json"
HANDOFF="$Q/STUDIO_AUDIT_HANDOFF.md"
EVID="$Q/EVIDENCE-W15-2026-09-16.md"
SHARED="$Q/CHECK-W9-B08-2026-09-15.sh"
CO="supabase_db_DxB_Global_OS"; CB="supabase_db_DxB_Build"
SCRATCH="${TMPDIR:-/tmp}/check-w15-$$"; mkdir -p "$SCRATCH"

fails=0
line() { printf '%-4s  %-62s %s\n' "$1" "$2" "$3"; [ "$1" = PASS ] || fails=$((fails+1)); }
eq()   { if [ "$2" = "$3" ]; then line PASS "$1" "$2"; else line FAIL "$1" "$2 (expected: $3)"; fi; }
ge1()  { if [ "${2:-0}" -ge 1 ] 2>/dev/null; then line PASS "$1" "$2"; else line FAIL "$1" "${2:-0} (expected: ≥1)"; fi; }
q()    { docker exec -i "$1" psql -U postgres -d postgres -At -c "$2" 2>&1; }
active_planning() { # .planning files that are NOT archive / handoff / evidence — the surfaces a session reads as live
  find "$R/.planning" -type f -name '*.md' -not -path '*/_ARCHIVE/*' -not -path '*/recovered/*' -not -name 'STATE-ARCHIVE.md' \
       -not -name 'STUDIO_AUDIT_HANDOFF.md' -not -name 'EVIDENCE-*' -not -name 'WORK-ORDER-*' -not -path '*/research/*'; }

mode="${1:-baseline}"; shift || true
case "$mode" in
baseline|w15)
  echo "== W15 RECORDS AND CONSEQUENCES ($mode)"
  # F014 — LAW C: on every active surface the mention carries its label, or the surface is gone
  unl=$(grep -rn 'LAW C\b\|KANUN C\b' "$STATE" "$BOARD" "$R/.claude" "$R/docs" "$R/.planning/REQUIREMENTS.md" "$Q/PLAN.md" 2>/dev/null \
        | grep -v -i 'not a \(verified \)\?CEO law\|no law\|not a law\|source unverified\|law-c-not-a-ceo-law\|provenance settled\|"LAW C" no law' | wc -l)
  eq  "F014 LAW C mentions on active surfaces without the not-a-law label" "$unl" "0"
  # F018 — the eight board sentences: heading relabelled, none minted as a rule
  eq  "F018 'RULES BORN ON THIS ROW AND STILL LIVE' on the board" "$(grep -c 'RULES BORN ON THIS ROW AND STILL LIVE' "$BOARD")" "0"
  eq  "F018 ledger keys minting one of the eight (skin|tripod|sizes|folder-list)" "$(python3 -c "import json,re;d=json.load(open('$LEDGER',encoding='utf-8'));print(sum(1 for k in d if re.search(r'skin|tripod|with-sizes|folder-list',k,re.I)))")" "0"
  # F015 — session-only remarks out of every live planning file and every door
  rem=$(active_planning | xargs grep -l 'kısa yaz\|ÇALIŞMA TARZIM\|bir bok yapma' 2>/dev/null | wc -l)
  eq  "F015 live .planning files carrying his session remarks" "$rem" "0"
  eq  "F015 .claude files carrying 'kısa yaz'" "$(grep -rl 'kısa yaz' "$R/.claude" 2>/dev/null | wc -l)" "0"
  # F016/F054 — the three handover prompts: gone, or banner at line 1 and no first-person CEO body left
  bad=0; det=""
  for f in NEXT-SESSION-PROMPT-2026-09-13.md NEXT-SESSION-PROMPT-2026-09-13b.md NEXT-SESSION-PROMPT-2026-09-14.md; do
    p="$Q/$f"; [ -f "$p" ] || { det="$det $f:deleted"; continue; }
    b=$(head -1 "$p" | grep -c -i 'SUPERSEDED\|Provenance'); fp=$(grep -c "ben DxB Global OS\|Selam, ben\|İLK İŞ\|Kararlarım\|ÇALIŞMA TARZIM" "$p")
    if [ "$b" = 1 ] && [ "$fp" = 0 ]; then det="$det $f:banner,body-clean"; else bad=$((bad+1)); det="$det $f:banner=$b,first-person-lines=$fp"; fi
  done
  eq  "F016/F054 handover prompts (deleted, or banner + no CEO-voice body)" "$bad" "0"; echo "      $det"
  eq  "F016/F054 live surfaces telling a session to paste a NEXT-SESSION-PROMPT" "$(grep -rn 'NEXT-SESSION-PROMPT' "$STATE" "$R/.claude" 2>/dev/null | grep -i 'paste\|yapıştır\|open it\|read it first' | wc -l)" "0"
  # F017 — no record orders the next session to write a handover prompt; the door carries his ruling
  eq  "F017 STATE sentences ordering a handover prompt (write/goes to/Phase 5, not 'only when he asks')" "$(python3 - "$STATE" <<'PY'
import re,sys
t=open(sys.argv[1],encoding='utf-8').read()
bad=[s for s in re.split(r'(?<=[.!?])\s+',t) if re.search(r'handover',s,re.I) and re.search(r'Phase 5|goes to|must be written|write[s]? (the|a) (next[- ]session|handover)',s,re.I) and not re.search(r'only when he asks|never automatically|not a rule|no handover',s,re.I)]
print(len(bad)); [print('      >',s[:200].replace('\n',' ')) for s in bad]
PY
)" "0"
  ge1 "F017 dxb-start Phase 5 carries the handover ruling's marker" "$(grep -c 'handover-prompt-only-on-his-session-request-2026-09-15' "$R/.claude/skills/dxb-start/SKILL.md")"
  # F048 — the battery sentence in STATE is the door's list, whole
  bl=$(grep -n 'the battery' "$STATE" | grep -i 'typecheck' | head -1)
  eq  "F048 STATE battery sentence names pnpm test AND gitleaks detect" "$(printf '%s' "$bl" | grep -c 'pnpm test.*gitleaks detect\|gitleaks detect.*pnpm test')" "1"
  eq  "F048 STATE still calls the 3-folder subset 'the battery'" "$(grep -c 'the battery (`pnpm typecheck` · `pnpm exec vitest run tests/b43' "$STATE")" "0"
  eq  "F048 'no registered adaptation (audit F048)' gap sentence left in STATE" "$(grep -c 'no registered adaptation (audit F048)' "$STATE")" "0"
  # F055 — four quotations each resolved in the evidence; the gate learns the quotation-shaped claim
  if [ -f "$EVID" ]; then
    miss=""; for k in 'sadece bu ikisi' '20260913001000' 'devir promtu yazma' 'Turkish summary|Türkçe özet'; do grep -q -E "$k" "$EVID" || miss="$miss [$k]"; done
    eq "F055 evidence resolves the four quoted orders (registered | UNVERIFIED + search)" "${miss:-all four}" "all four"
  else line FAIL "F055 evidence resolves the four quoted orders" "no evidence file"; fi
  ge1 "F055 ledger-truth.mjs catches the quotation-shaped claim (on his|the CEO's word|order)" "$(grep -c -E "on (his|the CEO'?s) (word|order)" "$R/scripts/governance/ledger-truth.mjs")"
  # F056 — script level (the DB level is mode db)
  ge1 "F056 sync-personas-to-db.sh binds through fn_persona_bind" "$(grep -c 'fn_persona_bind' "$R/scripts/sync-personas-to-db.sh")"
  eq  "F056 raw 'UPDATE agents … persona_id' in scripts/ packages/ apps/" "$(grep -rli -E 'update +agents +set +[^;]*persona_id' "$R/scripts" "$R/packages" "$R/apps" 2>/dev/null | grep -v node_modules | wc -l)" "0"
  eq  "F056 migration files named persona_bind" "$(ls "$R"/db/migrations/*persona_bind*.sql 2>/dev/null | wc -l)" "1"
  # records
  if [ -f "$EVID" ]; then
    eq "evidence header carries THIS ruler's md5" "$(grep -c "$(md5sum "$0" | cut -c1-32)" "$EVID")" "1"
    eq "evidence names all nine findings" "$(for f in F014 F015 F016 F017 F018 F048 F054 F055 F056; do grep -c "$f" "$EVID" | awk '$1>0'; done | wc -l)" "9"
  else line FAIL "evidence file EVIDENCE-W15-2026-09-16.md" "missing"; fi
  eq  "STATE branch count = git" "$(grep -o '\*\*[0-9]\+ commits\*\*' "$STATE" | head -1 | tr -dc 0-9)" "$(git -C "$R" rev-list --count master..HEAD)"
  eq  "handoff W15 row still names all nine findings" "$(grep '^| W15 |' "$HANDOFF" | grep -o 'F0[0-9][0-9]' | sort -u | wc -l)" "9"
  ;;
db)
  echo "== W15 THE PERSONA DOOR (both engines, SELECT only on the company)"
  eq  "fn_persona_bind exists — company"      "$(q $CO "select count(*) from pg_proc where proname='fn_persona_bind'")" "1"
  eq  "fn_persona_bind exists — construction" "$(q $CB "select count(*) from pg_proc where proname='fn_persona_bind'")" "1"
  eq  "fn_persona_bind writes an audit row and persona_version" "$(q $CO "select count(*) from pg_proc where proname='fn_persona_bind' and prosrc ilike '%audit_log%' and prosrc ilike '%persona_version%'")" "1"
  eq  "no OTHER function sets agents.persona_id" "$(q $CO "select count(*) from pg_proc where proname<>'fn_persona_bind' and prosrc ~* 'update\s+(public\.)?agents\s+set[^;]*persona_id'")" "0"
  eq  "migrations repo = company = construction" "$(ls "$R"/db/migrations/*.sql | wc -l) $(q $CO 'select count(*) from supabase_migrations.schema_migrations') $(q $CB 'select count(*) from supabase_migrations.schema_migrations')" "$MIG_AFTER $MIG_AFTER $MIG_AFTER"
  eq  "bindings unchanged: bound/agents/md5" "$(q $CO "select count(*) filter (where persona_id is not null)||'/'||count(*)||'/'||md5(string_agg(id::text||':'||coalesce(persona_id::text,'-'), ',' order by id)) from agents")" "$BOUND_BEFORE/$AGENTS_BEFORE/$BIND_MD5_BEFORE"
  eq  "sync --verify" "$(DXB_PERSONA_AUTHOR=fable-5 bash "$R"/scripts/sync-personas-to-db.sh --verify 2>&1 | tail -1)" "VERIFY: PASS"
  eq  "persona ruler" "$(bash "$R"/scripts/persona-ruler.sh 2>&1 | grep -o 'RULER: [0-9/]* PASS')" "RULER: 16/16 PASS"
  ;;
guard)
  range="${1:-}"; [ -n "$range" ] || { echo "usage: guard <hash|range>"; exit 2; }
  case "$range" in *..*) ;; *) range="${range}^..${range}";; esac
  echo "== W15 GUARD — only the named files may change ($range)"
  ALLOW='^(\.planning/|HOLDING-OS-MASTER-PLAN/|docs/|scripts/governance/ceo-approvals\.json$|scripts/governance/ledger-truth\.mjs$|scripts/sync-personas-to-db\.sh$|scripts/hr-demo-hire\.sh$|scripts/bench/drain-throughput\.mjs$|db/migrations/[0-9]+_[a-z0-9_]*persona_bind[a-z0-9_]*\.sql$|tests/(personas|governance)/|\.claude/skills/(dxb-verify|dxb-start)/SKILL\.md$|AGENTS\.md$|\.codex/)'
  git -C "$R" diff --name-only "$range" > "$SCRATCH/files"
  out=$(grep -v -E "$ALLOW" "$SCRATCH/files" | grep -v '^$')
  eq  "files outside the W15 allow-list" "$(printf '%s' "$out" | grep -c .)" "0"; [ -z "$out" ] || printf '%s\n' "$out" | sed 's/^/      /'
  eq  "new migration files in range" "$(git -C "$R" diff --diff-filter=A --name-only "$range" -- db/migrations | wc -l)" "1"
  eq  "files under apps/ packages/" "$(grep -c -E '^(apps|packages)/' "$SCRATCH/files")" "0"
  eq  "hooks or CLAUDE.md touched" "$(grep -c -E '^\.claude/(hooks/|CLAUDE\.md)' "$SCRATCH/files")" "0"
  add=$(git -C "$R" log --format=%h -1 --diff-filter=A -- "$Q/CHECK-W15-2026-09-16.sh")
  if [ -z "$add" ]; then line PASS "ruler changed inside the range (a metre may not certify itself)" "n/a — ruler not yet in git"
  else eq "ruler changed inside the range (a metre may not certify itself; adding commit $add excepted)" "$(git -C "$R" log --format=%h "$range" -- "$Q/CHECK-W15-2026-09-16.sh" | grep -v -c "^$add")" "0"; fi
  ;;
battery)
  echo "== W15 BATTERY — the door's list, whole (dxb-verify)"
  eq  "typecheck (error lines)" "$(pnpm -C "$R" typecheck 2>&1 | grep -c -i 'error TS')" "0"
  pnpm -C "$R" test > "$SCRATCH/vitest.log" 2>&1; rc=$?
  summary=$(grep -E '^ *Test Files' "$SCRATCH/vitest.log" | tail -1 | sed 's/^ *//')
  failing=$(grep -E '^ *(FAIL|❯) +tests/' "$SCRATCH/vitest.log" | grep -o 'tests/[^ :]*\.test\.tsx\?' | sort -u)
  unnamed=""; for f in $failing; do grep -q -F "$f" "$STATE" || unnamed="$unnamed $f"; done
  if [ -z "$failing" ]; then line PASS "pnpm test — whole suite" "$summary (exit $rc)"
  elif [ -z "$unnamed" ]; then line PASS "pnpm test — every red named in STATE as a known red" "$summary; reds: $(echo $failing | tr '\n' ' ')"
  else line FAIL "pnpm test — reds NOT named in STATE.md" "$summary; unnamed:$unnamed"; fi
  for f in $failing; do row=$(grep -o -F "$f" "$STATE" | head -1); printf '      red %-52s in STATE: %s\n' "$f" "$([ -n "$row" ] && echo yes || echo NO)"; done
  eq  "verify:ledger" "$(node "$R"/scripts/governance/ledger-truth.mjs 2>&1 | tail -1 | grep -o 'ledger truth OK')" "ledger truth OK"
  eq  "i18n purity" "$(bash "$R"/scripts/i18n-purity-check.sh 2>&1 | tail -1)" "I18N PURITY: PASS"
  eq  "gitleaks detect — whole history" "$(gitleaks detect -s "$R" --no-banner --redact 2>&1 | grep -o 'no leaks found' | head -1)" "no leaks found"
  eq  "vitrin register gate" "$(bash "$R"/scripts/b43/vitrin-register-gate.sh 2>&1 | tail -1 | grep -o 'VITRIN REGISTER: PASS\|nothing to gate')" "VITRIN REGISTER: PASS"
  eq  "shared W9-B08 battery" "$(bash "$SHARED" battery 2>&1 | tail -1)" "CHECK battery: ALL PASS"
  eq  "tree clean" "$(git -C "$R" status --short | wc -l)" "0"
  ;;
*) echo "usage: $0 {baseline|w15|db|guard <hash|range>|battery}"; exit 2;;
esac
rm -rf "$SCRATCH"
echo; if [ "$fails" -eq 0 ]; then echo "CHECK W15 [$mode]: PASS"; exit 0; else echo "CHECK W15 [$mode]: FAIL ($fails)"; exit 1; fi
