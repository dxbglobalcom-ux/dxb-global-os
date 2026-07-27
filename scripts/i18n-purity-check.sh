#!/usr/bin/env bash
# I18N PURITY CHECK — org surface bilingual completeness gate (E6.3 wave 3d).
# Run before any "done" claim that touches CEO-visible org UI. Three checks:
#   1. every live agent has a Turkish title (title_tr)
#   2. every department has a Turkish display name (display_name_tr)
#   3. message dictionaries EN/TR carry identical key sets
# Exit 0 = PASS, 1 = FAIL (with the failing rows listed).
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PSQL=(docker exec -i supabase_db_DxB_Global_OS psql -U postgres -d postgres -At)

fail=0

agents_missing="$("${PSQL[@]}" -c "SELECT slug FROM agents WHERE employment_status<>'archived' AND role_level IS DISTINCT FROM 'sub_agent' AND (title IS NULL OR title_tr IS NULL);")"
if [ -n "$agents_missing" ]; then
  echo "FAIL agents missing title/title_tr:"; echo "$agents_missing"; fail=1
else
  echo "PASS agents: every live agent titled EN+TR"
fi

depts_missing="$("${PSQL[@]}" -c "SELECT slug FROM departments WHERE display_name_tr IS NULL;")"
if [ -n "$depts_missing" ]; then
  echo "FAIL departments missing display_name_tr:"; echo "$depts_missing"; fail=1
else
  echo "PASS departments: every department named EN+TR"
fi

# Projects are CEO-visible cards; heading AND purpose both render (found
# 2026-07-26: purpose had its Turkish leg, the heading did not, so the TR board
# read "HR Sandbox"). Archived projects are out of the CEO's live view.
projects_missing="$("${PSQL[@]}" -c "SELECT slug FROM projects WHERE status <> 'archived' AND (name_tr IS NULL OR purpose_tr IS NULL);")"
if [ -n "$projects_missing" ]; then
  echo "FAIL projects missing name_tr/purpose_tr:"; echo "$projects_missing"; fail=1
else
  echo "PASS projects: every live project named + explained EN+TR"
fi

# The risk register is CEO-visible too — /gov/risks and every project's Command
# View render the title. Found by the W5.1 audit twin 2026-07-26: three English
# sentences on the Turkish board because `project_risks` had no `title_tr`.
risks_missing="$("${PSQL[@]}" -c "SELECT left(title, 40) FROM project_risks WHERE title_tr IS NULL OR (note IS NOT NULL AND note_tr IS NULL);")"
if [ -n "$risks_missing" ]; then
  echo "FAIL risks missing title_tr:"; echo "$risks_missing"; fail=1
else
  echo "PASS risks: every risk titled + noted EN+TR"
fi

# W2.6: the holding now writes on the CEO's board itself. A SYSTEM-authored
# message is an i18n surface — a briefing missing its Turkish leg would print an
# English paragraph straight onto the Turkish board, and its thread name would
# sit in the conversation list in the wrong language. Conversation turns (the
# CEO's own words, Hamza's replies) are deliberately single-leg and out of scope.
briefings_missing="$("${PSQL[@]}" -c "
  SELECT 'message ' || m.id FROM chat_messages m
   WHERE m.source = 'briefing' AND (m.content_tr IS NULL OR btrim(m.content_tr) = '')
  UNION ALL
  SELECT 'thread ' || s.id FROM chat_sessions s
   WHERE EXISTS (SELECT 1 FROM chat_messages m WHERE m.session_id = s.id AND m.source = 'briefing')
     AND (s.title IS NULL OR s.title_tr IS NULL);")"
if [ -n "$briefings_missing" ]; then
  echo "FAIL system-authored chat rows missing a language leg:"; echo "$briefings_missing"; fail=1
else
  echo "PASS briefings: every system-authored chat row carries EN+TR"
fi

node - <<EOF || fail=1
const en = require("$REPO_DIR/apps/dashboard/messages/en.json");
const tr = require("$REPO_DIR/apps/dashboard/messages/tr.json");
const flat = (o, p = "") =>
  Object.entries(o).flatMap(([k, v]) =>
    typeof v === "object" ? flat(v, p + k + ".") : [p + k]);
const e = flat(en), t = flat(tr);
const diff = e.filter((k) => !t.includes(k)).concat(t.filter((k) => !e.includes(k)));
if (diff.length) { console.log("FAIL dictionary parity, diff:", diff.join(",")); process.exit(1); }
console.log("PASS dictionary parity: en", e.length, "= tr", t.length);
EOF

[ $fail -eq 0 ] && echo "I18N PURITY: PASS" || { echo "I18N PURITY: FAIL"; exit 1; }
