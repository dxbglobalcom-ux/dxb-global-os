#!/usr/bin/env bash
# context.sh <job-dir> — writes <job-dir>/context.md: what the readers need to judge with —
# the holding in brief, what we already have, and the open board rows (id | title).
set -u
J="$1"; R="/home/dxb/DxB Global OS"; mkdir -p "$J/rows"
{
cat <<'EOF'
# Context for judging

THE HOLDING — DXB Global OS: an AI-native operating system for one holding company with one human, the CEO.
It runs the company end to end: companies, departments, AI employee personas, projects, tasks, models,
costs, decisions, approvals, workflows, skills, knowledge, memory, risks, audit. Built with Claude Code
(the "construction" sessions, subagents, a GPT Sol auditor) on Supabase/Postgres, a TypeScript monorepo,
a scheduler, a runtime orchestrator (Hamza) routing tasks to models. A media studio makes video/images on a
local GPU. Revenue lines considered: websites/agency, SEO, content/YouTube, ads. Islamic boundaries are
constitutional: no gambling, betting, interest-based finance, haram content.

Two lenses for every item:
1. HOLDING — does it help the company itself (a department, a revenue line, a runtime capability, cost,
   quality, the media studio, marketing, sales)?
2. SESSIONS — does it make the construction sessions easier, cheaper or better (skills, plugins, MCP
   servers, orchestration patterns, token savings, audit)?
EOF
echo; echo "## What we already have"; echo "### Project skills"; ls "$R/.claude/skills"
echo "### Global skills"; ls ~/.claude/skills 2>/dev/null
echo "### Plugins (enabled and disabled)"; claude plugin list 2>/dev/null | grep -E '❯|Status'
echo "### MCP servers"; claude mcp list 2>/dev/null | sed -E 's/^([^:]+):.*(✔|✘).*/\1 \2/'
echo; echo "## Open board rows (id | title) — full rows in HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md"
grep -E '^\| B[0-9]' "$R/HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md" | grep -v 'CLOSED' | awk -F'|' '{print $2 "|" substr($4,1,160)}'
} > "$J/context.md"
echo "CONTEXT $J/context.md ($(wc -l < "$J/context.md") lines)"
