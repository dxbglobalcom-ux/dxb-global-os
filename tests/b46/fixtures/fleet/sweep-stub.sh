#!/usr/bin/env bash
# THE GROUND'S STAND-IN (copied over scripts/sweep.sh inside the bench's engine copy): one channel
# file with one address, so the fleet has a ground to count. The real sweep is fired, offline, by
# no-green-on-a-failure.test.ts; this case measures what the fleet does AFTER the ground.
mkdir -p "$2"
printf -- '- title: stand-in result\n  url: https://bench.example/page\n' > "$2/google.raw"
