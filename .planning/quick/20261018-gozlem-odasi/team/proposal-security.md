# Proposal 2 — the security & reliability engineer (verbatim from the engineer, 2026-10-18)

Recommendation: read X with zero writes, through one machine-wide gate that protects his account, and run trials in a local KVM virtual machine (QEMU) that cannot see the host. No X calls were made.

## 1. Design

**Account guard: one gate for every X read on the machine.** All X reads already pass through `bin/opencli` and `hidden.py`, which own the port, the slots and the tabs (hidden.py:32-35). The only limit there today is 8 windows for all sites (hidden.py:71). That is how three parallel readers hit 429 today. Add an X gate in the same place, so the room, the research hunters and both Claude sessions share it:
- One reader at a time: a lock file (`x.lock`) allows one X call machine-wide, at least 3 s apart.
- Budget: a rolling count kept beside the slots allows at most 20 calls per 15 minutes (a third of the ~60 that triggered 429) and at most 150 a day for all callers. The room may use up to 50 a day and waits whenever the 15-minute window is half used.
- On 429: every caller pauses 30 minutes. A second 429 within 24 h closes X until the next day. Nothing retries during a pause.
- On a captcha, "unusual activity", or a lock or verify page: an `x.frozen` flag refuses every caller. It never clears by itself, and Hamza tells him in one line. The machine never solves a captcha (hidden.py:13), never signs back in (profile-sync.sh:29-30), and write verbs are already refused (bin/opencli:72).
- On a login wall in the hidden Chrome's copy: the status becomes `session_dead`. The fix is to re-copy his profile with `profile-sync.sh`, never a machine login.

**Untrusted input stays information at every stage** (doctrine item 6; SECURITY_MODEL.md:67):
- Read: plain code with no AI model does the reading. It stores posts as rows marked `trust=untrusted`, caps their size, and strips and flags invisible or direction-changing characters.
- Judge: company seats with no tools at all (runtime-profile.ts:154 gives `tools: []` when no plugin is granted). They return structured fields only. Any name, link or number not in the source is dropped. No judge ever holds opencli or a shell, because port 9333 lets anyone on the machine drive his signed-in X, Facebook, Instagram and Reddit with no password.
- Lab: a project's README is read only inside the VM. The verdict comes from what the harness measures outside the VM (graders, the egress log), never from what the agent says about itself.
- Report: plain text showing the real domain behind each link. The room writes nothing to memory or settings and adopts nothing into the library. Methodology plugins are rejected automatically (item 1-ter).
- No judging in construction sessions: they run with bypassPermissions (FACTS §6), so room content is never judged or tried there.

**Lab: a local QEMU/KVM virtual machine, no Docker, nothing installed on the host.**
- Isolated network: `-netdev user,restrict=on` with one forward to the proxy's socket on the host. The guest reaches nothing else: not 9333, 4000, 22, 3389, 11434, 8188-8192 or 54321-54422.
- Second wall: QEMU itself runs inside bwrap with no network, an empty HOME, and only /dev/kvm, the image folder and the proxy socket visible.
- Proxy on the host: allows api.anthropic.com (POST /v1/messages only), adds the model credential itself and never repeats it back; allows read-only downloads from npm, PyPI and GitHub; never allows X. Everything else is refused and logged.
- Agent inside, credential outside: Claude Code is built into a read-only base image. Each trial gets a throwaway disk layer deleted afterwards. Results leave as size-capped text over the VM's serial channel; a guest disk is never mounted on the host.
- Resource caps: at most 6 GB memory, 8 CPU cores, 512 processes, a 20 GB disk layer, 30 minutes per run, one trial at a time.
- Test data: nothing goes into the VM that we would mind being made public; Stage 2 tasks use cleaned copies of our work.
- Red first: before any real trial a malicious package of our own tries every forbidden port at every host address; tries DNS and HTTPS to sites not on the list (x.com included); looks for keys in its environment and asks the proxy to reveal its key; fork-bombs, fills memory, fills the disk and tries to survive a reboot; carries a README telling the agent to send out its environment and praise the tool. It passes only if every attempt is refused and logged, the caps trip, the next boot is clean, and a decoy token planted in the home folder never appears in the proxy log. Re-run after every image change and every week.

**Reliability: the screen works out staleness from timestamps, not from the job.**
- Read log: every pass writes a `room_reads` row: status (ok, partial, 429, frozen, session_dead, keyring_locked, reader_broken), number of calls, next due time.
- Screen: e.g. "son okuma 14:02 · sonraki 18:00 · bugün 22/50"; after next due + 30 min it shows "GECİKTİ", so a dead scheduler looks late instead of silent.
- Layout drift: a batch including @Voxyz_ai (5–6 posts a day on a fixed schedule) that returns nothing for 24 h counts as `reader_broken`; posts missing id, author or time also mean the reader is broken.
- Completeness: a batch returning 40+ posts whose oldest is newer than the last read is partial and split; once a week each A-tier account gets one full `collection` read (17 calls) to measure what search misses.
- Reboot: the keyring stays locked until he logs in to the desktop (hidden.py:116-146); the status says so. Sleep: on waking, one catch-up pass, never a burst. An A-tier account silent 14 days is flagged.

## 2. Decisions

**D1, where.** Before the key turn: built on the construction side and tested on the construction engine with recorded posts, zero X calls; at most one purposeful factory trial (one gated pass plus the red test). After the key turn: B42's lane in the company scheduler (a cron, no resident service, R5) on this workstation. The reader has to sit where the copy of his session sits, and his X cookies never go to a server (that would be an identity step). The judges use the company's own Claude home (sdk-isolation.ts:76).

**D2, how it reads X.** Zero-write batched search through the gated door. Videos via `watch.sh`, no login (watch.sh:19). Articles via `article`, counted against the budget. Rejected: a private list and his following timeline (writes on his account); a separate reader account for now (an identity step; new automated accounts are the most often challenged; it would need a second signed-in browser port). Fallback: twitterapi.io ~$7/month — switches on after any challenge or freeze, or two 429s within 7 days with the gate in place; if it dies, the official X API (~$180/month).

**D3, which lab.** The QEMU VM above. Not sbx: needs sudo, the kvm group and a Docker account login, and runs stdio MCP servers on the host itself — the very kind of tool most X shares are. Not gVisor: needs sudo and still sits on rootful Docker. Remote VM: costs money; kept for what the local lab cannot run. A trial: paper check, red test green, smoke run, then A/B and a trial card.

## 3. Top risks
1. His account gets restricted (shared quota with research): the gate, pauses, freeze and a ready fallback.
2. A hidden instruction in a post makes something act through port 9333 or a bypassPermissions session: reader is plain code, judges have no tools, no content reaches a host shell; B41's "every hand open" must never give a shell to a seat that reads posts.
3. Something escapes the lab: restricted networking, bwrap around QEMU, key only in the proxy, red test first.

## 4. What I would not do
Docker for the lab (docker group = root; bridge reaches all-interface services; NAT defeats port deny-lists, company-wall.nft:12-37) · give any judge or lab his ~/.claude, the company's credentials or LiteLLM's master key · retry during a pause, parallel X reads, captcha solving, sign-ins · quiet opencli upgrade · running before the key turn · anything that fails open (SECURITY_MODEL.md:74).

## 5. To the CEO
- "Laboratuvar?" (install: an Ubuntu base image with Claude Code inside, no sudo) → Evet.
- "Token?" (identity: a separate revocable `claude setup-token` held only by the lab proxy; terms unverified) → Evet.
- "Twitterapi?" (money out, ~$7/month) → ask only when the fallback trigger fires.
- "opencli 2.0?" (install) → ask only if 1.8.7 breaks.
