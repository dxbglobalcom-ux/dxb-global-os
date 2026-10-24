#!/usr/bin/env bash
# Runs one DISPATCH row of the signed plan (job/plan.md) as the plan names it: a fresh Opus 5.5 agent at the row's
# effort in its own box, or — for the owner's own steps — the plan's author, resumed in its own session.
# usage: step.sh <step-id> <effort> [owner] [extra line for the prompt]
set -uo pipefail
J=/home/dxb/test-kutu/20261024-zeytin
id="$1"; effort="$2"; who="${3:-seat}"; extra="${4:-}"
row="$(sed -n '/^## DISPATCH/,$p' "$J/job/plan.md" | grep -F -- "- **$id** ·" | head -n 1)"
[ -n "$row" ] || { echo "no DISPATCH row $id" >&2; exit 2; }
p="$J/logs/step-$id.prompt.md"
tools="Bash,Read,Write,Edit,Glob,Grep,WebSearch,WebFetch"
if [ "$who" = owner ]; then
  cat >"$p" <<EOF
Now do your own step $id of your signed plan's DISPATCH:

$row

Your working directory (~/work) is the job folder: brief.md, plan.md (your signed plan) and the outputs of the parts
done so far under work/. Do this step as your plan describes it and write its output at the path named.
$extra
End with a one- or two-line result.
EOF
  exec "$J/tools/box.sh" head claude-opus-5-5 "$effort" "$tools" "$J/job" "$p" "$J/logs/step-$id.json" \
    --resume "$(cat "$J/sealed/head.session")"
else
  cat >"$p" <<EOF
You are one agent on a job. Your working directory (~/work) is the job folder: brief.md, and plan.md — the owner's
signed plan. Your part is this row of its DISPATCH:

$row

Read what the row names as your inputs. Where it names plan.md, read plan.md whole; where it names only some
sections of the plan, read only those sections of plan.md and nothing else of it. Do this part only, as plan.md
describes it, and write its output at the path named. The outputs of the parts done
before you are under work/. You start fresh: everything you know of this job is in these files.
$extra
End with a one- or two-line result.
EOF
  exec "$J/tools/box.sh" "seat-$id" claude-opus-5-5 "$effort" "$tools" "$J/job" "$p" "$J/logs/step-$id.json"
fi
