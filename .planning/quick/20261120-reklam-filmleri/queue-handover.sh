#!/usr/bin/env bash
# One-off: wait for the running queue (old queue.sh) to empty out, then hand the kept list to a fresh queue.sh.
J="$(cd "$(dirname "$0")" && pwd)"
while systemctl --user is-active --quiet orvo-queue; do sleep 10; done
mv "$J/queue.next" "$J/queue.txt"
systemd-run --user --unit=orvo-queue --collect --quiet -p OOMScoreAdjust=200 "$J/queue.sh"
