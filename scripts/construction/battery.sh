#!/usr/bin/env bash
# B36 · Block 3-bis — THE WHOLE BATTERY, and it says which half ran where.
#
# Two halves, both required, nothing hidden between them:
#
#   1. THE CONSTRUCTION RUNTIME — everything, inside the sandbox opened by
#      scripts/construction/run.sh: no network, no Docker socket, no credential,
#      and one unix socket to the company's read gateway.
#
#   2. THE AUTHOR'S HAND, on the company's side — the few files that must enter a
#      container or inspect this machine's own processes, and therefore cannot
#      run inside a sandbox built to take those away. They are named here, in
#      full, so that nothing can be moved out of the wall quietly.
set -uo pipefail
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO"

HOST_FILES=(
  tests/b36/live-drills.host.test.ts   # enters the construction container: creates and drops roles
  tests/ops/freeze-guard.test.ts       # reads this machine's process tree and its systemd units
  tests/ops/dashboard-launcher.host.test.ts  # asks WHICH process is serving the CEO's dashboard
  # B46 — the research engine's own battery. Each case COPIES the engine out of .claude/skills
  # and runs the real scripts against stubbed binaries; inside the sandbox (uid 997) the copy
  # is refused and every case dies on `cp`. The engine is the author's side of the house, not
  # the construction site's, so these belong here beside the other host files.
  tests/b46/research-ruler.test.ts
  tests/b46/judge-is-one-metre.test.ts
  tests/b46/the-number-he-sees.test.ts
  tests/b46/the-crowd-is-read.test.ts
  tests/b46/no-green-on-a-failure.test.ts
  tests/b46/one-run-one-owner.test.ts
  tests/b46/a-hunter-cannot-write.test.ts
)

echo "=== 1/2 · THE CONSTRUCTION RUNTIME — the sandboxed suite ==="
EXCLUDES=()
for f in "${HOST_FILES[@]}"; do EXCLUDES+=(--exclude "$f"); done
bash scripts/construction/run.sh pnpm vitest run "${EXCLUDES[@]}"
sandboxed=$?

echo
echo "=== 2/2 · THE AUTHOR'S HAND — on the company's side, outside the sandbox ==="
for f in "${HOST_FILES[@]}"; do echo "    $f"; done
pnpm vitest run "${HOST_FILES[@]}"
host=$?

echo
echo "sandboxed suite : exit $sandboxed"
echo "host suite      : exit $host"
if [ "$sandboxed" -ne 0 ] || [ "$host" -ne 0 ]; then
  echo "BATTERY_RED"
  exit 1
fi
echo "BATTERY_GREEN"
