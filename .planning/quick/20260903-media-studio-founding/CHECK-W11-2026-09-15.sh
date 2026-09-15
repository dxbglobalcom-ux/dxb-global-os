#!/bin/bash
# THE CHECKER'S RULER for W11 — THE PRODUCT REGISTER (handoff §7 W11: F025 F043 F044 F045 F046 F078 F080 F106
# F107 F109) — dictated by the checker session (Fable 5.1) BEFORE the work, copied and committed by the builder
# alone as records(ruler) (the audit law c7570071). Builder and checker run the same script; the evidence header
# carries its md5. The vitrin lives OUTSIDE git (~/tools/h3/studio), so this file reaches out to it and RENDERS
# the page headless (the cast tags and the tab counters are painted by JavaScript — a grep on the source cannot
# see what he sees; lesson a: measure the artefact, not the pointer).
#
#   bash CHECK-W11-2026-09-15.sh baseline   # what is true before the work (prints, no verdict)
#   bash CHECK-W11-2026-09-15.sh w11        # the order: PASS on every line = W11 complete per the ruler
#   bash CHECK-W11-2026-09-15.sh guard      # what W11 must NOT have broken (nothing deleted, nothing dark)
#   the shared battery stays CHECK-W9-B08-2026-09-15.sh battery — every commit passes it too.
#
# THE ORDER, measured as outcomes (implementation is the builder's choice):
#  F025  no rendered cast card names FLUX for a person the engine bore (DXB-A-010 AHMET, DXB-A-011 JAMES); every
#        card names its true origin (FLUX / MiniMax H3 / written from his prompt); no card is left without one.
#  F046  no edge-tts on the vitrin or in the catalogue; no 2K promise — a "2K" that remains is marked cancelled
#        or stands under the 1080p ceiling ruling.
#  F043  no "Medya OS" pointer in index.html, KATALOG.md or avatars/ahmet.md (the folder he deleted 2026-09-04).
#  F044  AHMET's files carry AHMET's code: no a006-birth* file, no a006-birth reference, no "ARDA doğum" alt on
#        his card; the same six files stand under a010-birth*.
#  F045  no English as the studio's own content: rendered text outside lang="en" blocks carries 0 English
#        function words; an English document that stays is a quoted block with lang="en".
#  F080  the four LAB codes 003…006 have a catalogue row each, saying what was measured — nothing invented, nothing
#        deleted (his own words in his box).
#  F107  the tab counters are not hand-written in the source, and the rendered counter equals the cards under it.
#  F109  the catalogue's avatar file convention names files that exist (av_<slug>_<view>.png), not -p/-f/-b.
#  F106  the vitrin is not on 0.0.0.0: loopback (127.0.0.1:8899) or an authenticated front; the unit file and
#        STATE say the same address the socket shows.
#  F078  the register is under a gate: (a) a repo-tracked gate script that reads the vitrin and is green, and
#        (b) every acceptance claim ("kabul") on the vitrin and in the catalogue carries a ledger id that exists
#        in ceo-approvals.json (LAW B on his own showcase); every referenced media file exists; no avatar tile
#        renders "çiziliyor…" for a person in the cast.
#  Records: EVIDENCE-W11 with this ruler's md5; ledger entry for his word ("tmm başla", copied); board B43 closes
#        the ten findings; STATE names W11.
#  ⚠ UNVERIFIED by any terminal: RULE #0 eye pass on the vitrin — his screen (a headless screenshot in the evidence
#        helps him, it does not replace him).
set -u
D="/home/dxb/DxB Global OS"
V="$HOME/tools/h3/studio"; IDX="$V/index.html"; KAT="$V/KATALOG.md"; MEDIA="$V/media"
AHMET="$HOME/tools/h3/avatars/ahmet.md"
LEDGER="$D/scripts/governance/ceo-approvals.json"
EVID="$D/.planning/quick/20260903-media-studio-founding/EVIDENCE-W11-2026-09-15.md"
BOARD="$D/HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md"
UNIT="$(systemctl --user show dxb-vitrin.service -p FragmentPath --value 2>/dev/null)"
PROBE="/tmp/claude-1000/check-w11-render-probe.cjs"; OUT="/tmp/claude-1000/check-w11-render.txt"
fail=0
ok(){ printf "PASS  %-64s %s\n" "$1" "$2"; }
no(){ printf "FAIL  %-64s %s\n" "$1" "$2"; fail=1; }
chk(){ if [[ "$2" =~ $3 ]]; then ok "$1" "$2"; else no "$1" "$2 (expected: $3)"; fi; }
info(){ printf "INFO  %-64s %s\n" "$1" "$2"; }
part="${1:-baseline}"

render(){  # paints the page headless and prints flat facts; the probe is written fresh on every run
  cat > "$PROBE" <<'JS'
const { chromium } = require('/home/dxb/DxB Global OS/node_modules/@playwright/test');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + process.env.HOME + '/tools/h3/studio/index.html');
  const r = await p.evaluate(() => {
    const out = [];
    const cards = [...document.querySelectorAll('#castgrid .card')];
    out.push('CARDS=' + cards.length);
    for (const c of cards) {
      const kod = c.querySelector('.kod')?.textContent.trim();
      const tags = [...c.querySelectorAll('.t')].map(t => t.textContent.trim());
      const flux = tags.filter(t => /FLUX/i.test(t)).length;
      const origin = tags.filter(t => /FLUX|MiniMax|yazı|prompt|motor|doğ/i.test(t)).length;
      out.push(`CARD ${kod} FLUX=${flux} ORIGIN=${origin} PENDING=${c.querySelectorAll('.pending').length}`);
    }
    const clone = document.body.cloneNode(true);
    clone.querySelectorAll('script,style,[lang="en"]').forEach(e => e.remove());
    const txt = clone.innerText || clone.textContent;
    out.push('EN=' + ((txt.match(/\b(the|and|with|into|from|through|one take)\b/g) || []).length));
    out.push('ENBLOCKS=' + document.querySelectorAll('[lang="en"]').length);
    let bad = 0, tabs = [];
    for (const t of document.querySelectorAll('nav [role=tab]')) {
      const sec = document.getElementById(t.dataset.tab); const n = sec ? sec.querySelectorAll('.card').length : 0;
      const c = t.querySelector('.c'); const shown = c ? c.textContent.trim() : '';
      tabs.push(`${t.dataset.tab}:${shown || '-'}/${n}`); if ((shown || '0') !== String(n)) bad++;
    }
    out.push('TABS=' + tabs.join(' ')); out.push('TABMISMATCH=' + bad);
    return out.join('\n');
  });
  console.log(r); await b.close();
})().catch(e => { console.error('RENDER_FAILED ' + e.message); process.exit(1); });
JS
  node "$PROBE" > "$OUT" 2>&1 || echo "RENDER_FAILED" >> "$OUT"
}
rv(){ grep -o "^$1=.*" "$OUT" | head -1 | cut -d= -f2-; }
card(){ grep "^CARD $1 " "$OUT" | grep -o "$2=[0-9]*" | cut -d= -f2; }
kabul_without_id(){  # acceptance claims on his showcase that carry no registered ledger id
  python3 - "$LEDGER" "$IDX" "$KAT" <<'PY'
import json,re,sys
keys=set(json.load(open(sys.argv[1])).keys()); n=0
for f in sys.argv[2:]:
    for line in open(f,encoding='utf-8'):
        if re.search(r'kabul',line,re.I) and not any(k in line for k in keys): n+=1
print(n)
PY
}
missing_media(){ grep -o 'media/[^"'"'"' )>?#]*' "$IDX" | sed 's#^media/##' | sort -u | grep -v '\${' | while read -r f; do [[ -e "$MEDIA/$f" ]] || echo "$f"; done | wc -l; }
two_k(){ grep -n "2K\|1440×2592\|1440x2592" "$IDX" "$KAT" | grep -vi "iptal\|tavan\|1080p" | wc -l; }
bind(){ ss -ltnp 2>/dev/null | grep ':8899 ' | awk '{print $4}' | tr '\n' ' '; }
gate_script(){ git -C "$D" ls-files 'scripts/*vitrin*' 'scripts/**/*vitrin*' 2>/dev/null | head -1; }

if [[ $part == baseline ]]; then
  echo "== BASELINE (no verdict)"; render
  echo "render: $(rv CARDS) cards · A-010 FLUX=$(card DXB-A-010 FLUX) · A-011 FLUX=$(card DXB-A-011 FLUX) · EN words outside lang=en: $(rv EN) · EN blocks: $(rv ENBLOCKS) · tabs $(rv TABS) mismatch=$(rv TABMISMATCH)"
  echo "edge-tts: $(grep -c 'edge-tts' "$IDX" "$KAT" | tr '\n' ' ')  2K unmarked lines: $(two_k)  Medya OS: idx=$(grep -c 'Medya OS' "$IDX") kat=$(grep -c 'Medya OS' "$KAT") ahmet.md=$(grep -c 'Medya OS' "$AHMET" 2>/dev/null)"
  echo "a006-birth files: $(ls "$MEDIA" | grep -c '^a006-birth')  a010-birth files: $(ls "$MEDIA" | grep -c '^a010-birth')  index a006-birth refs: $(grep -c 'a006-birth' "$IDX")  'ARDA doğum' alt: $(grep -c 'ARDA doğum' "$IDX")"
  echo "LAB rows 003-006: $(grep -c 'LAB-00[3-6]' "$KAT")  hard-coded tab numbers in source: $(grep -c '<span class="c">[0-9]' "$IDX")  KATALOG -p convention: $(grep -c -- '`-p`' "$KAT")  av_ named in KATALOG: $(grep -c 'av_' "$KAT")"
  echo "socket: $(bind) unit: $(grep -o 'bind [0-9.]*' "$UNIT" 2>/dev/null)  gate script in repo: $(gate_script)  kabul lines without ledger id: $(kabul_without_id)  missing media refs: $(missing_media)  media files: $(ls "$MEDIA" | wc -l)"
  rm -f "$PROBE"; exit 0
fi

if [[ $part == w11 ]]; then
  echo "== W11 — THE PRODUCT REGISTER"; render
  chk "1  page renders headless (cards painted)"                          "$(rv CARDS)" "^[1-9][0-9]*$"
  chk "2  F025 AHMET DXB-A-010 rendered FLUX tags"                        "$(card DXB-A-010 FLUX)" "^0$"
  chk "3  F025 JAMES DXB-A-011 rendered FLUX tags"                        "$(card DXB-A-011 FLUX)" "^0$"
  chk "4  F025 cards without an origin tag (every person names how it was born)" "$(grep -c '^CARD .* ORIGIN=0' "$OUT")" "^0$"
  chk "5  F046 edge-tts on the vitrin + catalogue"                        "$(grep -c 'edge-tts' "$IDX" "$KAT" | awk -F: '{s+=$2} END{print s}')" "^0$"
  chk "6  F046 2K lines not marked cancelled / under the 1080p ceiling"   "$(two_k)" "^0$"
  chk "7  F043 'Medya OS' in index + KATALOG + avatars/ahmet.md"           "$(( $(grep -c 'Medya OS' "$IDX") + $(grep -c 'Medya OS' "$KAT") + $(grep -c 'Medya OS' "$AHMET" 2>/dev/null || echo 0) ))" "^0$"
  info "   F043 elsewhere (archive/evidence — the builder says in the evidence why each stays or goes)" "shoot.sh=$(grep -c 'Medya OS' "$HOME/tools/h3/lab/out/2026-09-04/shoot.sh" 2>/dev/null) EVIDENCE-position=$(grep -c 'Medya OS' "$D/.planning/quick/20260903-media-studio-founding/EVIDENCE-position.md")"
  chk "8  F044 a006-birth* files left"                                    "$(ls "$MEDIA" | grep -c '^a006-birth')" "^0$"
  chk "9  F044 a010-birth* files present (AHMET's six)"                   "$(ls "$MEDIA" | grep -c '^a010-birth')" "^[6-9]$"
  chk "10 F044 index references a006-birth / alt 'ARDA doğum'"            "$(( $(grep -c 'a006-birth' "$IDX") + $(grep -c 'ARDA doğum' "$IDX") ))" "^0$"
  chk "11 F045 English function words rendered outside lang=\"en\""       "$(rv EN)" "^0$"
  info "   F045 quoted English blocks kept under lang=\"en\""              "$(rv ENBLOCKS)"
  chk "12 F080 catalogue rows for LAB-003…006"                            "$(grep -o 'LAB-00[3-6]' "$KAT" | sort -u | wc -l)" "^4$"
  chk "13 F107 hand-written tab numbers in the source"                    "$(grep -c '<span class="c">[0-9]' "$IDX")" "^0$"
  chk "14 F107 rendered counter = cards under the tab (mismatches)"        "$(rv TABMISMATCH)" "^0$"
  chk "15 F109 catalogue names the -p/-f/-b convention that matches no file" "$(grep -c -- '`-p`' "$KAT")" "^0$"
  chk "16 F109 catalogue names the real avatar files (av_)"                "$(grep -c 'av_' "$KAT")" "^[1-9]"
  chk "17 F106 socket: not on 0.0.0.0 / *"                                "$(bind)" "^(127\.0\.0\.1:8899 ?)+$|^$"
  chk "18 F106 the vitrin answers on loopback (HTTP)"                      "$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 http://127.0.0.1:8899/ 2>/dev/null)" "^(200|401)$"
  chk "19 F106 unit file binds where the socket is"                        "$(grep -o 'bind 127\.0\.0\.1' "$UNIT" 2>/dev/null | head -1)" "bind 127"
  chk "20 F106 STATE names the loopback address for the vitrin"            "$(grep -c '127\.0\.0\.1:8899' "$D/.planning/STATE.md")" "^[1-9]"
  gs=$(gate_script)
  chk "21 F078 a repo-tracked gate script reads the vitrin"                "${gs:-none}" "vitrin"
  if [[ -n "$gs" ]]; then chk "22 F078 that gate is green (exit code)" "$(bash "$D/$gs" >/dev/null 2>&1; echo $?)" "^0$"; else no "22 F078 that gate is green" "no script"; fi
  chk "23 F078 acceptance claims without a registered ledger id (index + KATALOG)" "$(kabul_without_id)" "^0$"
  chk "24 F078 media referenced by index.html but missing on disk"        "$(missing_media)" "^0$"
  chk "25 F078 cast tiles rendering 'çiziliyor…' (avatar file missing)"    "$(grep -o 'PENDING=[0-9]*' "$OUT" | cut -d= -f2 | awk '{s+=$1} END{print s+0}')" "^0$"
  chk "26 EVIDENCE-W11 exists and carries THIS ruler's md5"                "$(grep -c "$(md5sum "$0" | cut -d' ' -f1)" "$EVID" 2>/dev/null || echo 0)" "^[1-9]"
  chk "27 ledger: his word for W11 registered (id w11-…-2026-09-15, verbatim copied)" "$(grep -o '"w11-[a-z0-9-]*-2026-09-15"' "$LEDGER" | head -1)" "w11-"
  chk "28 board B43: the ten findings closed"                             "$(grep -o 'F025 closed\|F043 closed\|F044 closed\|F045 closed\|F046 closed\|F078 closed\|F080 closed\|F106 closed\|F107 closed\|F109 closed' "$BOARD" | sort -u | wc -l)" "^10$"
  chk "29 STATE names W11"                                                 "$(grep -c 'W11' "$D/.planning/STATE.md")" "^[1-9]"
  echo "⚠ UNVERIFIED by this file: RULE #0 eye pass on the vitrin (cast cards, engines table, tab counters) — his screen; a headless screenshot in the evidence helps, it does not replace him."
  rm -f "$PROBE"
fi

if [[ $part == guard ]]; then
  echo "== GUARD — what W11 must not have broken"
  chk "G1 vitrin service active"                                           "$(systemctl --user is-active dxb-vitrin.service 2>/dev/null)" "^active$"
  chk "G2 media files: none deleted (75 before; renames keep the count)"  "$(ls "$MEDIA" | wc -l)" "^(7[5-9]|[89][0-9])$"
  chk "G3 the five accepted films still in the catalogue (EYW-001 002C 003 004 005)" "$(grep -o 'DXB-V-EYW-00[1-5]C\?' "$KAT" | sort -u | wc -l)" "^[5-9]$"
  chk "G4 catalogue codes: none lost (31 distinct before)"                 "$(grep -o 'DXB-[A-Z]-[A-Z0-9-]*[0-9]' "$KAT" | sort -u | wc -l)" "^(3[1-9]|[4-9][0-9])$"
  chk "G5 W8 pin: media_jobs 16277dac still failed|true"                   "$(docker exec -i supabase_db_DxB_Global_OS psql -U postgres -d postgres -At -c "select status||'|'||(error is not null) from media_jobs where id::text like '16277dac%'" 2>&1)" "^failed\|t"
  chk "G6 shared battery (CHECK-W9-B08) FAIL lines"                        "$(bash "$D/.planning/quick/20260903-media-studio-founding/CHECK-W9-B08-2026-09-15.sh" battery 2>&1 | grep -c '^FAIL')" "^0$"
  chk "G7 no probe artefact left behind"                                   "$(ls "$PROBE" 2>/dev/null | wc -l)" "^0$"
fi

echo; [[ $fail == 0 ]] && echo "CHECK $part: ALL PASS" || { echo "CHECK $part: FAIL"; exit 1; }
