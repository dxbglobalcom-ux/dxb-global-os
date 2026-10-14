# Two videos and one X post — the merge (lead, Opus 5.5 max, 2026-10-14 night)

His order (verbatim in `BRIEF.md`): the repos and skills of V1 (Nate Herk, "I Tried 100+ Github Repos for Claude",
HhZdNYI4pJs), V2 (Dubibubi, "9 Claude Skills I Use Every Single Day", LCwT00LrPZg) and X1 (RahulTechX's post) are
reviewed the way the 88 links were — two blind readers, the lead as referee at max — and written into his Excel as a
new sheet, "Yeni eklenenler". Excluded on his word: taste, impeccable, caveman, ponytail, Agent-Reach.
Readers: `reader-opus.md` (Opus 5.5 high, 19 blocks + 10 listed), `reader-fable.md` (Fable 5.1 high, 26 blocks).
The lead switched itself to max through operator (status line record `effort: max`, 2026-10-14 20:55:01Z) before this.

## 1. Agreement — measured

Both opened every named repo (`gh api`), both read both transcripts whole, both transcribed X1's 33-minute video by
audio only. **Same numbers** for every repo both measured (stars a few apart between their two reads — at most 6, on
Superpowers — same push dates, same licences, one exception below). **Same verdict** on every tool except the eight
splits in §2; the same top two (Supabase skills, Claude Security); the same two facts no video gave: X1's "leaked" video is Anthropic's public talk "The prompting playbook"
(Claude channel, `G2B0YWuJUgI`, 2026-05-22), and claude-mem 13.16.0 sends telemetry by default on this machine
(`~/.claude-mem/telemetry.json` `decidedAt: ""`, no `DO_NOT_TRACK`/`CLAUDE_MEM_TELEMETRY`).

## 2. The splits and the referee's call

| # | Tool | Opus | Fable | Call | Why (measured) |
|---|---|---|---|---|---|
| 1 | Matt Pocock skills | alma — method class | dene, only `code-review` + `diagnosing-bugs` | **alma** | His order 1-ter (`CAPABILITY_ARSENAL_DOCTRINE.md:167-181`, 2026-08-27) shuts out "a plugin whose product is a WAY OF WORKING"; the author sells it as the alternative to GSD/BMAD/Spec-Kit — the same class by its own words. Reopening is his word alone. |
| 2 | Addy Osmani agent-skills | alma — method class | izle — library for the holding's engineer agents | **alma** | /spec → /ship is a way of working (1-ter). |
| 3 | pstack, unlazy | alma — method class | izle | **alma** | Same rule; pstack is also a Cursor plugin. |
| 4 | Claude Security | dene — one scan at #4 and before #51; "Apache-2.0" | al — at #4, #32, #51; "All rights reserved" | **dene** at #4 (one scan on the construction copy), then #32 and #51 if it earns it | It does a job, so 1-ter does not touch it. Licence: Fable is right — `plugins/claude-security/LICENSE` "Copyright (c) 2026 Anthropic, PBC. All rights reserved" (the marketplace repo is Apache-2.0, the plugin is not) — used inside Claude Code, never copied into the holding. It ships 3 hooks (`hooks.json`: banner, usage counts after its own scripts, a scan tip after `git push`); per doctrine 1-bis `hooks.py` is read before it is enabled — not read tonight. |
| 5 | Google Workspace CLI | izle, try at #24 | al at #24 | **dene at #24** | Not an official Google product, pre-1.0 (README); the OAuth/Cloud project is his identity step. Installed before #24 it would sit idle — his bench rule. |
| 6 | Apify MCP | izle | dene at #48 within the free credit | **izle → dene at #48** only where Scrapling falls short | Money out per result; free twins first. |
| 7 | Vibe Security | izle — read its list at #4 | alma | **alma** | Last push 2026-03-15; Claude Security + Supabase skills cover it. |
| 8 | HyperFrames → construction? | yes, studio seat at #45 | no | **a studio tool, installed at #45** on the bench | It is the holding's studio hand, not a construction-session tool. |

## 3. What the holding takes, by where it goes

| Tool | Call | Rank (ORDER.md) | Construction team | Waits on his word |
|---|---|---|---|---|
| Supabase Agent Skills (skills only, not the MCP) | **al** | #3, #4 (next after the board) | yes — writer seats (lead, helper-writer, builder) | install |
| Claude Security plugin | **dene** | #4; then #32, #51 | yes — the lead's seat, one scan at a time | install, the scan's effort tier |
| HyperFrames | **al** | #45 (B43 studio) → #46, #49 | no (studio) | install |
| Humanizer vs No AI Slop | **dene** — his blind test (a47543aa), one stays | #45; then #24, #47 | no (selling seats) | install |
| Playwright CLI | **dene** — measured against the MCP on one real check | #15 (B35), #16 | yes — dxb-verify's browser checks | install |
| CodeBurn | **dene** — one read-only run (`quota`, `share` never used) | beside #37 (B34) | yes — the lead, once | `npx` download |
| Prompting playbook (X1) | **al** — knowledge, nothing to install | #11, #13, #16 | the persona / Hamza-context seats | a door line only on his word |
| Google Workspace CLI | **dene** | #24 (+ #52 B05) | not before #24 | install + Google Cloud/OAuth (identity) |
| Apify MCP | **izle** | #48 | no | account (identity), money out |
| Stripe best-practices skill | **izle** | #52 (B05) | not before B05 | Stripe account (identity) |
| Expo skills | **izle** | no place today (idea 22 → B17 #50) | no | Apple account $99/yr |
| ScrollCraft, Open Design, OpenSEO, autoresearch | **already here** | #42/#47, #21, #14/#47, #28 | — | — |
| claude-mem | **already here** — telemetry question | — | — | **one line: turn its telemetry off?** |
| Matt Pocock, Addy Osmani, pstack, unlazy, Superpowers | **alma** — method class, his 2026-08-27 order | — | — | reopening is his word |
| Vibe Security, RTK, Context Mode, Firecrawl, Remotion, AI Job Search, HubSpot guide | **alma / no place** | — | — | — |

No new board row: every tool lands in a rank that already exists; the rank's carries take it when the board is
written. Nothing is installed tonight.

## 4. For him, in one line each

- Install yes/no, per tool, at its rank — the first one (Supabase skills) is needed when rank 3 starts.
- claude-mem telemetry: turn it off? Recommendation: yes (`CLAUDE_MEM_TELEMETRY=0`), both readers measured it on.

## 5. Left unsettled

`hooks.py` of Claude Security not read · Playwright CLI's "lighter in tokens" and CodeBurn's numbers unmeasured here ·
what claude-mem's PostHog events carry was not read in code · X1's linked X article could not be opened (Fable:
"Article not found", 404; Opus: a general LLM article) — no tool in it either way. Leftover from Opus's interrupted
X1 transcription: 268 MB in `~/.cache/link-watch/X1-2110166431610572865*` — deleting it waits on his word.
