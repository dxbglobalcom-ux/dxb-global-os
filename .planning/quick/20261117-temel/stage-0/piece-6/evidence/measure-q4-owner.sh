#!/usr/bin/env bash
# Q4 owner experiments: an owner changed by hand (the installer cannot: shown; so by the bench's superuser through
# docker exec, the container ends in _DxB_Foundation), then the chain run again — does create or replace keep the
# wrong owner and ACL, does the chain stay green, what the snapshot shows.
set -u
R="/home/dxb/DxB Global OS"; E="$R/.planning/quick/20261117-temel/stage-0/piece-6/evidence"
S=/tmp/claude-1000/-home-dxb-DxB-Global-OS/8e9a56bf-6609-4e01-a8ec-ee3eba2f5cd9/scratchpad/h-measure
SU() { docker exec -i supabase_db_DxB_Foundation psql -X -q -v ON_ERROR_STOP=1 -U supabase_admin -d postgres -c "$1" 2>&1; }
echo "## before"; node "$E/run.cjs" "$E/q4-owner-read.sql"
echo "## the installer tries"; node "$E/run.cjs" "$E/q4-owner-try.sql"
echo "## superuser: function owner -> os_engine, and an extra grant to os_intake"
SU "alter function os.next_ticket(text, integer, double precision) owner to os_engine;"
SU "grant execute on function os.next_ticket(text, integer, double precision) to os_intake;"
node "$E/run.cjs" "$E/q4-owner-read.sql"
echo "## chain up (rootB; the functions pass replaces every function as os_owner)"
pnpm -s -C "$R" foundation:chain up --root "$S/rootB" 2>&1 | tail -2
node "$E/run.cjs" "$E/q4-owner-read.sql"
echo "## create or replace of the same text by its present owner (os_engine) as superuser: owner and ACL after"
SU "set role os_engine; $(cat "$S/rootB/functions/next_ticket.sql")"
node "$E/run.cjs" "$E/q4-owner-read.sql"
echo "## the snapshot's lines for it"
node "$E/snapshot.cjs" "$S/snap-q4-fn.txt" >/dev/null; grep "next_ticket" "$S/snap-q4-fn.txt"
echo "## superuser: function owner back to os_owner; schema os owner -> postgres"
SU "alter function os.next_ticket(text, integer, double precision) owner to os_owner;"
SU "alter schema os owner to postgres;"
node "$E/run.cjs" "$E/q4-owner-read.sql"
echo "## chain up (rootB) with schema os owned by postgres"
pnpm -s -C "$R" foundation:chain up --root "$S/rootB" 2>&1 | tail -2
echo "## the real chain (default root) — refused as another root's ledger, or green?"
pnpm -s -C "$R" foundation:chain up 2>&1 | tail -2
node "$E/run.cjs" "$E/q4-owner-read.sql"
echo "## the snapshot's schema lines"
node "$E/snapshot.cjs" "$S/snap-q4-schema.txt" >/dev/null; grep -E "^(schema|grant schema) os " "$S/snap-q4-schema.txt"
echo "## put back: schema os owner -> os_owner"
SU "alter schema os owner to os_owner;"
node "$E/run.cjs" "$E/q4-owner-read.sql"
