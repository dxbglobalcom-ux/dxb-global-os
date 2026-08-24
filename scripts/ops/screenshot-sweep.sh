#!/usr/bin/env bash
# WEEKLY HOUSEKEEPING — delete DXB screenshots older than seven days.
#
# WHY IT EXISTS. `/tmp` on this machine is a 15 GB RAM disk, so screenshots left
# there eat the memory this workstation is already short of. DXB tooling writes
# its captures under ~/Pictures instead, on real disk, and this sweep keeps those
# folders from growing without end.
#
# WHY IT IS WRITTEN THIS WAY — the CEO's ruling, 2026-08-24: *"başarısız
# olmasının sebebi her gece çalışmaması lazım, haftada bir yaparsak düzelir ama
# SS varsa çalışsın; yoksa neden başarısız diyor ki, bu bir başarı değil ki,
# küçük bir haftalık temizlik görevi."* Until that day the unit ran EVERY NIGHT
# as a bare `find %h/Pictures/dxb-screenshots -type f -mtime +7 -delete`, and on
# a machine where that folder does not exist `find` exits 1 — so systemd painted
# a small housekeeping chore RED every single night, and the red meant nothing.
#
# HAVING NOTHING TO DO IS NOT A FAILURE. No folder, an empty folder, or nothing
# old enough to delete: this says so in one line and exits 0. A REAL fault — a
# folder that is there and cannot be read, or a sweep that errors — still exits
# non-zero, because a gate nobody can ever see go red is not a gate.
#
# WHICH FOLDER, AND WHY ONLY ONE. The CEO's ruling, 2026-08-24: *"sadece
# ~/Pictures/operator kalsın."*
#
#   ~/Pictures/operator   where the `operator` command — what this machine
#                         actually uses for the screen — writes its captures
#                         (/opt/dxb-operator/cli.py:20, SHOTDIR).
#
# ~/Pictures/dxb-screenshots is NOT swept any more, and by his word it is not the
# screenshot folder at all. It was the folder the old design named, its producer
# `dxb-screenshot` is no longer on this machine (/usr/local/bin/dxb-screenshot
# does not exist), and nothing had written to it. One folder, the live one.
#
# NOT SWEPT, deliberately: ~/Pictures/Screenshots (29 files, 7.2 MB when this was
# written) is GNOME's own capture folder and those are the CEO's OWN pictures, and
# so are the loose files sitting directly in ~/Pictures. This job deletes what DXB
# tooling produced. It does not tidy his desk.
set -uo pipefail

DAYS="${DXB_SCREENSHOT_KEEP_DAYS:-7}"
if [ -n "${DXB_SCREENSHOT_DIRS:-}" ]; then
  # colon-separated, for the drills
  IFS=':' read -r -a DIRS <<< "${DXB_SCREENSHOT_DIRS}"
else
  DIRS=("$HOME/Pictures/operator")
fi

# `grep -c` on an empty string counts one empty line; count non-empty lines only.
count() { [ -z "$1" ] && echo 0 || printf '%s\n' "$1" | wc -l; }

faults=0
swept=0
for DIR in "${DIRS[@]}"; do
  if [ ! -d "$DIR" ]; then
    echo "screenshot-sweep: no folder at $DIR — nothing to sweep."
    continue
  fi

  if [ ! -r "$DIR" ] || [ ! -w "$DIR" ] || [ ! -x "$DIR" ]; then
    echo "screenshot-sweep: $DIR exists but $(id -un) cannot read and write it." >&2
    faults=$((faults + 1))
    continue
  fi

  # Counted before the delete so the line can say what was there and what went.
  if ! held="$(find "$DIR" -type f -printf 'x\n' 2>&1)"; then
    echo "screenshot-sweep: could not list $DIR — $held" >&2
    faults=$((faults + 1))
    continue
  fi

  if ! gone="$(find "$DIR" -type f -mtime "+${DAYS}" -print -delete 2>&1)"; then
    echo "screenshot-sweep: the sweep of $DIR failed — $gone" >&2
    faults=$((faults + 1))
    continue
  fi

  swept=$((swept + $(count "$gone")))
  echo "screenshot-sweep: $DIR held $(count "$held") file(s); deleted $(count "$gone") older than ${DAYS} days."
done

if [ "$faults" -gt 0 ]; then
  echo "screenshot-sweep: $faults folder(s) could not be swept." >&2
  exit 1
fi
echo "screenshot-sweep: done — $swept file(s) deleted in total."
exit 0
