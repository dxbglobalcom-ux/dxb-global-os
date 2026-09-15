#!/bin/bash
# THE CHECKER'S RULER for W7 — the cancelled TTS hand (handoff W7 / audit F009) — handed to the
# builder BEFORE the work and BEFORE the CEO's word (the ruler rule, CEO 2026-09-15). Written by the
# checker session (Fable 5.1, dxb-global-os-08) on 2026-09-15 14:1x from its own measurements; red on
# today's tree by design. Builder and checker run the same script. One metre, two hands.
#
#   bash CHECK-W7-2026-09-15.sh baseline   # what is true before the work (prints, no verdict)
#   bash CHECK-W7-2026-09-15.sh a          # road (a): the voice kind REMOVED outright
#   bash CHECK-W7-2026-09-15.sh b          # road (b): the voice kind GATED to his registered order
#   bash CHECK-W7-2026-09-15.sh guard      # the guard lines alone (what W7 must NOT touch)
#
# His ruling this work serves: tts-cancelled-engine-voice-only-2026-09-04 ("şu yapay sesi iptal et tüm video
# üretimlerinde … MiniMax H3'ün kendi sesi olsun"). His other ruling this work must not break:
# b33-voice-to-cloud-measurement-approved-2026-08-31 — the holding's own SPEAKING voice (packages/voice,
# speaches:piper, voice_identities, voice_calls) shares nothing with the media hand and stays untouched.
#
# Baseline measured by the checker on a275c3f6 (2026-09-15):
#   media_jobs kind CHECK = still|shoot|upscale|voice|assemble|probe on BOTH engines
#   media.ts: "voice" at lines 95 (params), 150 (description), 155 (enum); a stale comment at 56 lists edge-tts
#   media-lane.ts: voiceEngine at 305, resolveUserBinary("edge-tts") at 307, engines map key at 451
#   edge-tts referenced in exactly 2 source files (media.ts, media-lane.ts); binary /home/dxb/.local/bin/edge-tts present
#   tests/b43/media-hands.test.ts: kind "voice" submitted at 157 and 232; line 241 uses `engines: { voice: slow }`
#     as the SLOW-engine fixture for the cancel path — it needs another kind, not deletion
#   media_jobs kind='voice' rows: company 5 (all done, ids-md5 9ffe4755d860e7396420dab31271a636), construction 0
#   NOT W7: those 5 rows (W12, his separate word). NOT W7: packages/voice (0 references to media_jobs or edge-tts)
#   speaking voice: voice_identities 1 row (agents-orchestrator, speaches:piper, tr_TR-fahrettin-medium, active),
#     fingerprint md5 2ae50c4cdcc6127c9a055a6cc620473b; voice_calls 102; voice_daemon_state 1.
#     (There is NO voice_outbox table — the builder's lead named one; the real tables are the three above.)
#   F009 is in STUDIO_AUDIT_HANDOFF.md (line 150, the table at 1337, W7 at 1409) and NOT yet on the board —
#     closing it means writing "F009 closed" on the board the way F033 was.
#   STACK.md carries no edge-tts line today.
#   outbox-executor dist (media-lane.js) built 2026-09-05 01:16; scheduler ExecMainStart 14:01:14 today —
#     media-lane.ts IS code the daemon holds in memory: if its dist changes, the daemon must be restarted (W9 lesson).
set -u
D="/home/dxb/DxB Global OS"
CO="supabase_db_DxB_Global_OS"   # company engine (SELECT only here)
CB="supabase_db_DxB_Build"       # construction engine
BASE="a275c3f6"                  # the tree W7 starts from
q(){ docker exec -i "$1" psql -U postgres -d postgres -At -F'|' -c "$2" 2>&1; }
fail=0
ok(){ printf "PASS  %-62s %s\n" "$1" "$2"; }
no(){ printf "FAIL  %-62s %s\n" "$1" "$2"; fail=1; }
chk(){ if [[ "$2" =~ $3 ]]; then ok "$1" "$2"; else no "$1" "$2 (expected: $3)"; fi; }

part="${1:-baseline}"
MEDIA_TS="$D/packages/dxb-mcp/src/groups/media.ts"
LANE_TS="$D/packages/outbox-executor/src/media-lane.ts"
HANDS_TEST="$D/tests/b43/media-hands.test.ts"
BOARD="$D/HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md"
APPROVALS="$D/scripts/governance/ceo-approvals.json"
STACK="$D/.planning/research/STACK.md"

kind_check(){ q "$1" "select pg_get_constraintdef(oid) from pg_constraint where conrelid='public.media_jobs'::regclass and pg_get_constraintdef(oid) ilike '%kind%'"; }
voice_rows_co(){ q $CO "select count(*)||'|'||coalesce(string_agg(distinct status, ','),'')||'|'||coalesce(md5(string_agg(id::text, ',' order by id)),'') from media_jobs where kind='voice'"; }
edge_refs(){ grep -rln "edge-tts" "$D/packages" "$D/scripts" "$D/tools" --include=*.ts --include=*.mjs --include=*.sh --include=*.py 2>/dev/null | grep -v "/dist/\|node_modules" | wc -l; }
voice_fp(){ q $CO "select count(*)||' identities, md5='||coalesce(md5(string_agg(id::text||engine||coalesce(profile_ref,'')||status, ',' order by id)),'') from voice_identities"; }
hamza_voice(){ q $CO "select a.slug||'|'||v.engine||'|'||v.profile_ref||'|'||v.status from voice_identities v join agents a on a.id=v.agent_id where a.slug='agents-orchestrator'"; }
# 2026-09-15: this ran media-hands ALONE, and W7 shipped with media-lanes red because of it.
hands_green(){ (cd "$D" 2>/dev/null; npx vitest run tests/b43 2>&1 | grep -E '^ *Tests ' | grep -oE '[0-9]+ (passed|failed)' | head -2 | tr '\n' ' '); }
daemon_delta(){ echo $(( $(date -d "$(systemctl --user show dxb-scheduler.service -p ExecMainStartTimestamp --value)" +%s) - $(stat -c %Y "$D/packages/outbox-executor/dist/media-lane.js") )); }

if [[ $part == baseline ]]; then
  echo "== W7 BASELINE"
  echo "kind CHECK company:      $(kind_check $CO)"
  echo "kind CHECK construction: $(kind_check $CB)"
  echo "media.ts voice-kind lines: $(grep -cE '"voice"|^[[:space:]]*voice: z\.|"voice \{' "$MEDIA_TS")   media-lane voiceEngine/edge-tts lines: $(grep -c 'voiceEngine\|edge-tts' "$LANE_TS")   edge-tts source files: $(edge_refs)"
  echo "media-hands kind:\"voice\" submits: $(grep -c 'kind: "voice"' "$HANDS_TEST")   engines:{ voice: } fixtures: $(grep -c 'engines: { voice:' "$HANDS_TEST")"
  echo "historical voice rows (company count|statuses|ids-md5): $(voice_rows_co)"
  echo "speaking voice: $(voice_fp) · Hamza: $(hamza_voice) · voice_calls $(q $CO 'select count(*) from voice_calls')"
  echo "F009 closed on board: $(grep -ci 'F009 closed' "$BOARD")   STACK edge-tts lines: $(grep -ci 'edge-tts' "$STACK")"
  echo "daemon start − media-lane.js build (s): $(daemon_delta)"
fi

if [[ $part == a ]]; then
  echo "== W7 ROAD (a) — the voice kind removed outright"
  chk "a1 company media_jobs kind CHECK has no 'voice'"           "$(kind_check $CO | grep -c "'voice'")" "^0$"
  chk "a2 construction kind CHECK has no 'voice'"                 "$(kind_check $CB | grep -c "'voice'")" "^0$"
  chk "a3 both engines' kind CHECK identical"                     "$([[ "$(kind_check $CO)" == "$(kind_check $CB)" ]] && echo same || echo differ)" "^same$"
  chk "a4 media.ts carries no voice kind (enum, params key, description entry)" "$(grep -cE '"voice"|^[[:space:]]*voice: z\.|"voice \{' "$MEDIA_TS")" "^0$"   # line 148 (\"the engine's own voice\") is HIS ruling and must stay
  chk "a5 media.ts stale comment no longer lists edge-tts"        "$(grep -c 'edge-tts' "$MEDIA_TS")" "^0$"
  chk "a6 media-lane.ts has no voiceEngine / edge-tts"            "$(grep -c 'voiceEngine\|edge-tts' "$LANE_TS")" "^0$"
  chk "a7 edge-tts source references (packages/scripts/tools)"   "$(edge_refs)" "^0$"
  chk "a8 migration file present (2026091*, voice)"               "$(ls "$D"/db/migrations/ | grep -E '^2026091' | grep -ci 'voice')" "^[1-9]"
  chk "a9 migration applied on both engines (ledger)"             "$(q $CO "select count(*) from supabase_migrations.schema_migrations where name ilike '%voice%' and version like '2026091%'")$(q $CB "select count(*) from supabase_migrations.schema_migrations where name ilike '%voice%' and version like '2026091%'")" "^11$"
  chk "a10 media-hands test submits no kind \"voice\""             "$(grep -c 'kind: "voice"' "$HANDS_TEST")" "^0$"
  chk "a11 media-hands cancel fixture re-pointed (no engines:{voice})" "$(grep -c 'engines: { voice:' "$HANDS_TEST")" "^0$"
  chk "a12 tests/b43 whole suite green"                               "$(hands_green)" "^[0-9]+ passed $"
  chk "a13 media-studio profile still the 5 media_* tool names"   "$(grep -o '"media_[a-z]*"' "$D/packages/gateway/profiles/media-studio.mcp.json" | sort -u | wc -l)" "^5$"
  chk "a14 approval registered (w7-voice-hand-removed-2026-09-15)" "$(grep -c 'w7-voice-hand-removed-2026-09-15' "$APPROVALS")" "^[1-9]"
  chk "a15 F009 closed on the board"                              "$(grep -ci 'F009 closed' "$BOARD")" "^[1-9]"
  chk "a16 STACK.md carries the edge-tts note"                    "$(grep -ci 'edge-tts' "$STACK")" "^[1-9]"
fi

if [[ $part == b ]]; then
  echo "== W7 ROAD (b) — the voice kind gated to his registered order"
  chk "b1 company kind CHECK still carries 'voice'"               "$(kind_check $CO | grep -c "'voice'")" "^1$"
  chk "b2 construction kind CHECK still carries 'voice'"          "$(kind_check $CB | grep -c "'voice'")" "^1$"
  chk "b3 a gate exists in the catalogue (function/trigger naming voice + approval)" "$(q $CO "select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.prokind='f' and pg_get_functiondef(p.oid) ~* 'voice' and pg_get_functiondef(p.oid) ~* 'approv'")" "^[1-9]"
  chk "b4 media.ts tells the seat voice needs his registered order" "$(grep -c 'voice' "$MEDIA_TS")" "^[1-9]"
  chk "b5 media-hands has a refusal case for voice without his order" "$(grep -ci 'voice[^\n]*refus\|refus[^\n]*voice\|without his order\|no approval' "$HANDS_TEST")" "^[1-9]"
  chk "b6 media-hands suite green"                                "$(hands_green)" "^[0-9]+ passed $"
  chk "b7 approval registered (w7-voice-hand-gated-2026-09-15)"   "$(grep -c 'w7-voice-hand-gated-2026-09-15' "$APPROVALS")" "^[1-9]"
  chk "b8 F009 closed on the board"                               "$(grep -ci 'F009 closed' "$BOARD")" "^[1-9]"
  chk "b9 STACK.md carries the edge-tts note"                     "$(grep -ci 'edge-tts' "$STACK")" "^[1-9]"
fi

if [[ $part == a || $part == b || $part == guard ]]; then
  echo "== GUARD — what W7 must NOT touch (worth more than the removal lines)"
  chk "g1 the 5 historical voice rows untouched (count|done|ids-md5)" "$(voice_rows_co)" "^5\|done\|9ffe4755d860e7396420dab31271a636$"
  chk "g2 packages/voice untouched in the diff since $BASE"       "$(git -C "$D" diff --stat $BASE..HEAD -- packages/voice | wc -l)" "^0$"
  chk "g3 voice_identities fingerprint unchanged"                 "$(voice_fp)" "^1 identities, md5=2ae50c4cdcc6127c9a055a6cc620473b$"
  chk "g4 Hamza still speaks through speaches:piper, active"      "$(hamza_voice)" "^agents-orchestrator\|speaches:piper\|tr_TR-fahrettin-medium\|active$"
  chk "g5 voice_calls not purged (≥ 102)"                         "$(q $CO 'select count(*) from voice_calls')" "^(10[2-9]|1[1-9][0-9]|[2-9][0-9][0-9]|[0-9]{4,})$"
  chk "g6 resident scheduler postdates media-lane.js build (s ≥ 0)" "$(daemon_delta)" "^[0-9]+$"
  chk "g7 media_jobs non-voice rows unchanged vs baseline (company: 32)" "$(q $CO "select count(*) from media_jobs where kind <> 'voice'")" "^32$"
  echo "== BATTERY (shared, from the W9/B08 ruler)"
  batout="$(bash "$D/.planning/quick/20260903-media-studio-founding/CHECK-W9-B08-2026-09-15.sh" battery 2>&1 | grep -E '^(PASS|FAIL)')"
  echo "$batout" | sed 's/^/      /'
  bat=$(echo "$batout" | grep -c '^FAIL')
  chk "battery (W9/B08 ruler) FAIL lines"                         "$bat" "^0$"
fi

echo; [[ $fail == 0 ]] && echo "CHECK W7 $part: ALL PASS" || { echo "CHECK W7 $part: FAIL"; exit 1; }
