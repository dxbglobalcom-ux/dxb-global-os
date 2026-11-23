#!/usr/bin/env bash
# Q5 on a fresh instance with the real chain: roles before/after `logins`, a login's own settings, and the read that sees them.
set -u
R="/home/dxb/DxB Global OS"; E="$R/.planning/quick/20261117-temel/stage-0/piece-6/evidence"
S=/tmp/claude-1000/-home-dxb-DxB-Global-OS/8e9a56bf-6609-4e01-a8ec-ee3eba2f5cd9/scratchpad/h-measure
echo "## before logins"; node "$E/run.cjs" "$E/q5-read.sql" | tee "$S/q5-before.txt"
node "$E/snapshot.cjs" "$E/snap-q5-1-before-logins.txt"
echo "## logins"; pnpm -s -C "$R" foundation:instance logins 2>&1 | tail -1 | sed -E 's/sysid=[0-9]+/sysid=<…>/'
echo "## after logins"; node "$E/run.cjs" "$E/q5-read.sql" | tee "$S/q5-after.txt"
node "$E/snapshot.cjs" "$E/snap-q5-2-after-logins.txt"
echo "## diff of the reads before/after logins (only the password count may move)"; diff "$S/q5-before.txt" "$S/q5-after.txt"
echo "## snapshot before/after logins: cmp"; cmp "$E/snap-q5-1-before-logins.txt" "$E/snap-q5-2-after-logins.txt" && echo IDENTICAL
echo "## os_reader over TCP gives itself settings"; node "$E/q5-login.mjs"
echo "## after"; node "$E/run.cjs" "$E/q5-read.sql" | sed -n '/Q5.4/,$p'
node "$E/snapshot.cjs" "$E/snap-q5-3-after-self-settings.txt"
echo "## snapshot diff after the login's own settings"; diff "$E/snap-q5-2-after-logins.txt" "$E/snap-q5-3-after-self-settings.txt"
