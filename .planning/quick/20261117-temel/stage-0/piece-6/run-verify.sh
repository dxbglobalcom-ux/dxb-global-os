#!/usr/bin/env bash
# The lead's verdict on the committed revision: every lock, then the old system's typecheck and a frozen install.
# $1 = the name of the log under evidence/ (e.g. verify-at-the-code-commit.log)
cd "/home/dxb/DxB Global OS" || exit 1
E=".planning/quick/20261117-temel/stage-0/piece-6/evidence"
{ echo "== verify --all --rev HEAD ($(git rev-parse HEAD))"; pnpm -s foundation:verify --all --rev HEAD 2>&1 | grep -E "^(JUDGE|LOCK_|LOCKS_|OFFENCE|NOTE)"; echo "verify exit=${PIPESTATUS[0]}"
  echo "== the old system's typecheck"; pnpm -s typecheck > /dev/null 2>&1; echo "old typecheck exit=$?"
  echo "== pnpm install --frozen-lockfile"; pnpm install --frozen-lockfile 2>&1 | tail -1; git status --short pnpm-lock.yaml | wc -l
  echo "== what stands"; pnpm -s foundation:instance status | tail -1; ls ~/.cache/dxb/foundation-verify/ 2>/dev/null | wc -l
} > "$E/$1" 2>&1
tail -14 "$E/$1"
