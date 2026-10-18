# The cross-examiner's report (verbatim summary of findings, 2026-10-18)

All ten claims were checked at the source; nothing was written, no X call made, nothing started.

## Claims
| | Verdict | Evidence |
|---|---|---|
| a | VERIFIED | `w26_proactive_briefing.sql:337-339` counts every slot of the day; `:332` refuses a repeat of the same slot; the only caller is `morning-briefing.ts:328`. |
| b | VERIFIED | `library_family.sql:22` plain text, no later CHECK. Values in use: approved / needs_review / archived (`HOLDING_LIBRARY_SPEC.md:144`). 'shelved' still needs a spec line. |
| c | VERIFIED | The regex lives in the policy row (`r42_knowledge_shelf_policy.sql:30`) and matches `output_contract`; `post-task.ts:131-140` applies it; severity block → a match loops REVISE until a report file exists. Fix by editing the policy. |
| d | TRUE ONLY FOR BUILT-INS | `runtime-profile.ts:154` empties built-ins only; department grants still load (data-ai 23 dxb-mcp tools incl. memory_commit, queue_create_task, approval_submit_draft, registry_create_department; quality +22 playwright; strategy +10 scrapling). A per-employee profile can never be narrower than its department (`generate-profiles.ts:50,275-305`); a second membership widens it. |
| e | VERIFIED | `MODEL_ROUTING_SPEC.md:14, :98, :488, :545`. Haiku 4.5 retired; Haiku 5.5 still `testing` (`:148`). Every Jev line is OPEN (B64), route "measured at build". |
| f | VERIFIED | `personas/quality/testing-reality-checker.md` exists (quality → playwright). |
| g | VERIFIED, weak baseline | `MERGE.md:16-17` 67 of 88; both readers Claude models sorting into revenue/machine categories — no baseline for two-family four-verdict judging. |
| h | VERIFIED, hazard | `critical-gate.ts:311-370` runs `codex exec -s read-only --ephemeral` from the company's own Codex home (logged in); the worker calls it (`worker-shim.ts:964-972`) when `routing_rules.needs_council` is on (`:197-205`). It refutes an answer; not a blind judge. Hazard: read-only mode still runs model-written shell commands, can read the whole disk, inherits the scheduler's environment (`:355`). |
| i | VERIFIED; "X session only" REFUTED | Write/login verbs refused `opencli:72-74`; captcha never solved `hidden.py:13,26`; 8 windows `:71`. No X-specific rate gate exists. `profile-sync.sh:232-263` copies the whole Profile 5 (six logins, `:68-73`); an X-only copy is new code. The script's header records a copy creating a new sign-in by itself and calls that "an identity step" (`:22-29`). The control port accepts any local process (`hidden.py:153-155`). |
| j | VERIFIED, two traps | QEMU 10.2.1; `restrict=on` "does not affect explicitly set forwarding rules" (man :2958-2962) → guestfwd works. Trap 1: chardev guestfwd is one stream for the VM's life (:3117) → use `cmd:socat` per connection (socat installed). Trap 2: `/dev/kvm` access only while his desktop session is active (`70-uaccess.rules:54`); dxb not in the kvm group. |

## Rulings on the lead's calls
- L1 CHANGE how, keep what: his account with zero writes stands. "X-session-only copy, no identity step" is false: no such copy exists; a new holder of his session is what `profile-sync.sh` calls an identity step; two browsers sharing one X token is unmeasured; FACTS does not back "X challenges a fresh account most" (§5 says tool authors advise a throwaway). Change: `profile-sync.sh` stays the only copier with an X-only target; the company's browser through a pipe, no open port; never two browsers on his X session at once; the copy shown to him as one identity click; the gate's lock under the company's home, read-only to the construction; build the construction-side gate now (today's 429s came from construction research).
- L2 STANDS, different reason: not "know before he does" while the voice is weekly; the reasons are the alive law and harm alerts. Add jitter; skip a pass when the previous found nothing new.
- L3 STANDS, plus: reader and lab both depend on his desktop session (keyring, KVM); after a reboot without his login the room is dead and the screen must say so.
- L4 CHANGE: Opus 5.5 judges; the existing critical gate (Sol 6.1 high, on for the room's verdict task class) refutes; Opus revises and signs — his own two-family pattern (`critical-gate.ts:4-12`). Drop two co-equal judges + referee and the 67/88 baseline. Conditions: the gate sees only the evidence pack, its environment scrubbed, a planted "read the credentials" case must fail first.
- L5 STANDS, bundled: token (identity), X-only copy (identity), lab base image (install), kvm-group membership (sudo). Unmeasured: whether the proxy can swap the token into subscription calls.

## Law conflicts
- U4 vs doctrine item 6: judging seats hold memory, approval and queue tools plus a browser → a tool-less judge path registered as an adaptation; no second-department membership for judging seats.
- U3 "no install" vs "installs need his word": register in doctrine §9 that a throwaway-VM trial is not an install, or every trial breaks INTEG-01.
- U1 vs B42 `PLAN.md:3-5` ("no file outside this folder changes until he says yes"): the adapted plan is shown to him for that yes.
- Alive law: the screen goes through B32 (drawn and shown before built) with honest dead states (429 + resume time, keyring locked, KVM gone).
- B55's registered words "değersiz hiçbir birikim çöp istemiyorum … boşuna token masraf" (13 of 45 items called serious, none needed action) → Çöp keeps only its key; a per-trial token budget measured before Stage 2.

## Missing for first place
1. A tool-less judge path and an injection red test through the Codex gate.
2. A precision gate: "at least 2 of 3 findings he acts on", measured against his 88-link notes and closures, shown on screen.
3. The learning loop: author-record view, 30/90-day outcome checks, the "CEO was the detector" counter, a ranking that must beat a likes ranking.
4. Source health: a first-week X read for the mirror-verified half of the B tier; a weekly dead-source audit.
5. Unattended running: kvm-group membership, a recovery path when the session copy dies, one catch-up pass after sleep.

Lead's note on 5: kvm-group membership is not taken — the reader already needs his desktop session (the keyring), so the
group would add no independence; the room says when the session is missing instead.
