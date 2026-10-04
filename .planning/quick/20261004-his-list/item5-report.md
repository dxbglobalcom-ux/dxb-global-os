# Audit of the construction auto-memory: 67 files plus MEMORY.md, read-only

I read every file and checked each path against the disk, `git log` and `ceo-approvals.json`. I changed nothing. One deviation: I wrote two scratch lists to `/tmp` (`idx.txt` and `files.txt`).

**The index matches the files.** MEMORY.md has 67 links and there are 67 files, both ways.

**Burj Al Arab is not a real contradiction.**
- `eye-test-lessons.md:55` names **Burj Khalifa**, not Burj Al Arab. It is one illustration in his 2026-07-10 reference screenshot, and :54 says that screenshot is not a template.
- Inside `phase8-design-brief.md`, :12 holds his first vision (Burj Al Arab, 2026-07-10). His ruling at :47-50 the next day replaces it: *"sadece burj arab değil! tasarım iron man"*, so Burj is a quality bar only.
- That dated chain agrees with `DESIGN_SYSTEM.md:5-6,227-230` and `dxb-surface/SKILL.md:68-70`, which calls Burj "one throwaway example". The only risk is a reader who stops at :12.
- The real contradiction in that file is :29 ("RTX 4090 Linux laptop") against `dxb-center-machine-facts.md:75`: desktop machine, RTX 5060 Ti, his correction of 2026-09-21.

| file:line | problem | evidence | rec. |
|---|---|---|---|
| long-run-traps:22 | cites `tests/hooks/code-gate.test.ts:30` | deleted e18e0a33 (2026-09-28) | fix |
| long-run-traps:13 | `fleet/fleet.sh` | real path is `.claude/skills/dxb-research/fleet/fleet.sh` | fix |
| read-the-place:14 | `05-cnn-clipping-business.md` | purged f9220772 (2026-09-22); the seat lives on B28 | fix |
| dxb-center-machine-facts:19-21 | `/usr/local/bin/dxb-screenshot`, `~/Pictures/dxb-screenshots` | both missing; `operator shot` is the live path | fix |
| dxb-center-machine-facts:22-23 | earlyoom "--dryrun, not armed" | `active`; EARLYOOM_ARGS has no `--dryrun` | fix |
| dxb-center-machine-facts:24-27 | docker-group trap | `id -nG` now includes docker | fix |
| ceo-wants-human-operator:13,16-19 | xdotool/scrot how-to | `which` finds none; operator owns it (keep verbatim :11, :20) | fix |
| hetzner-access:12,17,20,28 | live VPS, xclip, pending outbox rebuild | `vps-copy-wiped…2026-08-27`, `hetzner-server-stopped…2026-09-19`; xclip absent | fix |
| systemd-resident-services:11-16 | "two 7/24 units" | 17 `dxb-*` unit files; `dxb-jarvis` disabled | fix |
| july-2026-session-lessons:90-91 | restart dxb-jarvis every round | jarvis disabled | fix |
| proactive-briefing-w26:21 | "bootstrap-db.sh does not run on the live DB" | company-migration-ledger-gap:11 says repaired 2026-08-25 | fix |
| persona-file-first:13,16 | `agency-agents/`, `planning` bind-mount | neither exists; no fstab line | fix |
| phase8-design-brief:29 | RTX 4090 laptop | see Burj note above | fix |
| ceo-delegation-rule:17 | "Hetzner spending scope survives below" | removed by `rules-prune-batch-2-2026-10-01`; :20 also cites the deleted SO13 | fix |
| ceo-speed-read-less:28-29 | read STATE plus the last section of board row B43 at session start | conflicts with core §0 (position is injected) | fix |
| one-worker-handover:11,15 | "parallel not the default; tell him first" | `orchestration-three-arrangements-lead-chooses-2026-10-03` (lead chooses per job) | fix |
| perfection-gate:17 | "CLAUDE.md RULE #0-B" | the core no longer carries it | fix |
| media-studio-trial-night:10 + its MEMORY.md line | cast "men and elderly women only" | `cast-law-client-may-order-female-content-2026-09-15` | fix |
| eye-test-lessons:11,40,60 | X230, port 3100, "awaiting his eye, record stays open" | port is 3000 (directive-history:23); the open eye claim dates from 2026-07-10 | fix |
| studio-hands-built:21 | "next session wait for auditor" | instruction for 2026-09-03 | fix |
| directive-history:41 | K2 "all personas written by Fable personally" | `h16-persona-author-is-the-chief-engineer-2026-09-24` | fix |
| position-block-must-sit-under-its-heading | heading "The CEO's live order" | STATE headings are now Where we left off / Next / Waiting | delete |
| persona-roster-scope | 153 legacy, agency-agents | dir missing; `headcount-205-settled-2026-08-31`; dxb-persona owns | delete |
| persona-quality-dna | restates the door | dxb-persona:35 | delete |
| ceo-ui-progressive-disclosure | restates the door | dxb-surface:57 (same verbatim) | delete |
| ceo-design-minimalism-ruling | mostly the door | dxb-surface:25,49; keep the `min-w-0` trap | fix |
| ceo-engineers-do-everything, vscode-handover, focus-vscode | overlap dxb-team2 §8:191-200 | keep only what §8 lacks: case inversion, stale focus, ghost text | fix |
| MEMORY.md:5 | heading "Kanunlar ve CEO hükümleri" | the files say "NOT rules / not a law" (ask-before:18, delete-list:16, plan-in:15, delegation:24); only Kanun D is a registered law | fix |
| July diaries: e125-wave, e12-gates-night, july-lessons, r4x r42/r43, voice-layer-u15, ceo-complaint-ledger-u19, directive-history, context-architecture | session history the repo already records (00-NOTE files, ledger, STATE-ARCHIVE) | he refused halving the index on 2026-09-19 ("gerek yok. kalsın", `memory-index-stays-l4-closed`) | his call: compress or keep |
| Dangling `[[links]]` | 19 targets, about 76 uses | `evidence-before-done` ×20; `ceo-report-format` ×7 points at a door he had deleted on 2026-09-26 | fix (low) |
| Deleted names, history only | dxb-team1, builder-medium | long-run:11, plan-in:11, one-worker:13 | keep |
| b36-seal-names-stale-window-role | still accurate | `grep -c dxb_gateway` in the seal SQL = 0; file untouched since 2026-09-28 | keep |
| model-routing-hierarchy | pointer only | repo file v18 matches | keep |

**Missing Desktop and root files.** `~/Desktop/şikayet.odt`, `repo vb şeyler.odt`, `kasa-alternatifleri-2026-07.md` and `GOREV-CUDA-EXPO.md` are gone, as are the repo-root `BEKLENTILER` and `.planning/MASTER-PLAN.md` (`ls`). They are named in ceo-complaint-ledger-u19:11, directive-history:13,21,69,71 and r4x:13. They are historical records, so this is low priority.

**The other 35 files, kept as they stand.** They hold machine facts, the CEO's words or lessons that cannot be derived from the repo, and every path in them exists. Examples: cross-session-messages, click-questions, date-relative, remedy-measured, subagent-tool-limits, bypass-prompt-gate, dxb-ctx, mcp-context7, two-sessions, validate-the-detector, ceo-address-protocol (kept on his word in rules-prune-batch-2).

**Counts:** fix 25 (24 table rows plus the Desktop/root-files group) · delete 4 · his call 8 files (the July diaries) · keep 37 (2 verified in the table, 35 others). That is 74 because MEMORY.md is counted as a fix.

**UNVERIFIED:**
- Whether EXPO was ever switched on. `sudo -n dmidecode` was refused, and B42 is not on the live board.
- Where `agency-agents/` lived. It was never tracked in git and is not in `.gitignore`.
- Whether the scrapling entry in `.claude/settings.local.json` is still there.
- Whether the 2026-09-03 "wait for the auditor" studio leg was resolved.
- Whether Astra (Codex) is still in use now that Sol 6.1 is the auditor (`auditor-sol-6-1-2026-10-01`).

**Outside memory, one conflict for the lead.** Core `.claude/CLAUDE.md` §2 still says other subagents "never write". The ledger entry `helpers-write-code-under-lead-verification-2026-10-03` overrides that sentence under LAW A and says both files are "to be changed", but they have not been yet.