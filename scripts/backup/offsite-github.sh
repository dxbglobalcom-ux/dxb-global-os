# B72 — the off-site leg of the nightly backup, the github kind. Sourced by
# laptop-pg-dump.sh, never run: it is that job's other half and has no life of
# its own. The settings it reads are listed once, in the job's header.
#
# What the job calls, and nothing else here is its business:
#   offsite_by_github      carries tonight's set to the far side and proves it
#                          landed, or prints one fixed reason and returns 1
#   prune_github_releases  deletes the far side's nights past their retention,
#                          or prints one fixed reason and returns 1
# What it takes from the job: BACKUP_DEST, BACKUP_DIR, STEM, STAMP, SET_PARTS,
# RUN_DIR, READBACK and oldest_night_kept. It prints nothing but a reason: the
# job writes the log lines, and the destination is named in them only as github.

GITHUB_REPO="${BACKUP_DEST#github:}"
PUBLIC_KEY="${BACKUP_PUBLIC_KEY:-$HOME/.config/dxb/backup-public.asc}"
OFFSITE_RETENTION="${BACKUP_OFFSITE_RETENTION_DAYS:-90}"
GITHUB_WAIT="${BACKUP_GH_WAIT_SECONDS:-600}"
GITHUB_LIST_LIMIT=10000 # gh lists the newest 30 releases unless it is told how many

# gh, bounded and mute. Its own words name the repository and can quote what the
# far side answered, so its stderr goes nowhere, and a call whose stdout is not
# data sends that away too. Mute, it must never ask a question nobody would see.
# A call that outlasts GITHUB_WAIT, an upload included, is cut off (exit 124).
github() { GH_PROMPT_DISABLED=1 timeout "$GITHUB_WAIT" gh "$@" 2>/dev/null; }

# The three files go into one tar that is encrypted as it is written, to a
# public key read from a file; no unencrypted tar ever exists. gpg works in an
# empty home of the run's own: it reads no keyring and no gpg.conf of the
# user's, and there is no private key for it to see.
seal_set() {
  local sealed="$1" exits
  [ -r "$PUBLIC_KEY" ] || { echo "the public key cannot be read"; return 1; }
  mkdir -p "$RUN_DIR/gnupg" 2>/dev/null
  tar -C "$BACKUP_DIR" -cf - "${SET_PARTS[@]/#/$STEM.}" 2>/dev/null \
    | gpg --homedir "$RUN_DIR/gnupg" --batch --yes --quiet --trust-model always -e -f "$PUBLIC_KEY" -o "$sealed" >/dev/null 2>&1
  exits="${PIPESTATUS[*]}"
  [ "$exits" = "0 0" ] && [ -s "$sealed" ] || { echo "the set could not be encrypted (tar and gpg exited $exits)"; return 1; }
}

# One RELEASE per night in a private repository: tag = the set's stem, the
# encrypted set its one asset. Proven = the asset was downloaded back and is
# byte for byte what was sent; a listing is not proof.
# A same-day re-run overwrites the night's asset (--clobber) and then proves it.
# gh cannot hold two assets under one name, so proving first would need a second
# name and a rename over the raw API — more calls, each a way to leave a night
# whose asset has the wrong name. The price: if the overwrite fails, the far
# side has no copy of today until a run succeeds; that run says OFFSITE_FAIL,
# and today's set stands here.
# Whether gh holds a login is asked with `gh auth token`, its output thrown
# away. Measured on gh 2.46.0, 2026-11-22: `gh auth status` exits 0 while it
# says "Failed to log in", and with a login whose keyring cannot be read every
# other call fails with the same 1 as an upload that was refused.
offsite_by_github() {
  local sealed="$RUN_DIR/$STEM.set.tar.gpg" status=0
  [[ "$GITHUB_REPO" =~ ^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$ ]] || { echo "the destination is not github:<owner>/<repo>"; return 1; }
  seal_set "$sealed" || return 1
  github auth token -h github.com >/dev/null || { echo "gh is not logged in to github.com (gh exited $?)"; return 1; }
  if github release view "$STEM" -R "$GITHUB_REPO" >/dev/null; then
    github release upload "$STEM" "$sealed" -R "$GITHUB_REPO" --clobber >/dev/null || status=$?
  else
    github release create "$STEM" "$sealed" -R "$GITHUB_REPO" --title "$STEM" --notes "" >/dev/null || status=$?
  fi
  [ "$status" -eq 0 ] || { echo "the upload failed (gh exited $status)"; return 1; }
  github release download "$STEM" -R "$GITHUB_REPO" -p "${sealed##*/}" -O "$READBACK" >/dev/null \
    || { echo "the copy could not be read back (gh exited $?)"; return 1; }
  cmp -s "$sealed" "$READBACK" || { echo "the copy read back is not what was sent"; return 1; }
}

# The far side on the terms of this one: a night's age is the date in its
# release's tag, tonight's is never taken, and a release goes with its tag.
# What is not a night's release is left alone.
prune_github_releases() {
  local oldest_kept tags tag night failed=0
  oldest_kept="$(oldest_night_kept "$OFFSITE_RETENTION")" || { echo "the retention is not a number of days"; return 1; }
  tags="$(github release list -R "$GITHUB_REPO" --limit "$GITHUB_LIST_LIMIT" --json tagName -q '.[].tagName')" \
    || { echo "the releases could not be listed (gh exited $?)"; return 1; }
  while IFS= read -r tag; do
    [[ "$tag" =~ ^dxb-laptop-[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]] || continue
    night="${tag#dxb-laptop-}"
    [ "$night" != "$STAMP" ] && [[ "$night" < "$oldest_kept" ]] || continue
    github release delete "$tag" -R "$GITHUB_REPO" --yes --cleanup-tag >/dev/null || failed=$?
  done <<< "$tags"
  [ "$failed" -eq 0 ] || { echo "an old release could not be deleted (gh exited $failed)"; return 1; }
}
