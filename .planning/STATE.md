---
gsd_state_version: 1.0
milestone: v2.0
status: executing
last_updated: "2026-07-30"
session_author: opus-5
---

# STATE — where the work stands today

<!-- HISTORY -->

**This file is a photograph, not a history.** One page, current only. It was a 26-page narrative
that contradicted itself in three places until 2026-07-30; that narrative is frozen in
`.planning/STATE-ARCHIVE.md` and may never be cited as current state.

**One fact, one owner.** What is still open lives on the board and nowhere else. What the plan is
lives in the corpus and nowhere else. This file says only where we stand and what happens next.

## The CEO's live order

**2026-08-23 — THE CONSTRUCTION SITE IS BEING CUT OUT OF THE COMPANY. THIS IS THE LIVE ORDER.**
He opened the day with it: the very important gap on the board, and the complaint born from it —
*"inşaat sürecinin database'i ile holding kendi database'ini ferrari seviyesine yakışır şekilde
ayıracağız"*. It is board row **B36**, and his three decisions are registered
(`construction-company-db-separation-2026-08-23`): **two separate engines · the clone is a model,
not a mirror · the residue is moved, not deleted.** He then approved the architectural reversal the
measurement forced — *"tersini de onaylıyorum, blok 0 ile başla"*: **the company does NOT move; the
construction moves out**, because his live surfaces depend on Supabase Realtime (ten components),
his login on Supabase Auth, and the Supabase CLI pins the database name to `postgres`.
**2026-08-24 — BLOCK 3 FAILED ITS AUDIT AND WAS REBUILT THE SAME DAY.** His *"onaylıyorum"*
was permission to BUILD, in his own correction: *"Benim ‘onaylıyorum’ sözüm yapım izniydi;
sonuç kabulü değildi."* The line that stood here — *"BLOCK 3 IS DONE"* — is deleted by that
(LAW A). The day started with him
stopping the author twice: for beginning Block 3 before answering the question he had actually
asked, and for writing his sentences into the records as standing rules without asking. Everything
written that way was reverted in the same turn. **What he wants instead, in his own words:**
*"ne önüme gelecek benim ne önüme GELECEK"* · *"anladığım dilde bana sor önce ne nedir ne
yapacağım"* — explain it in his language first, then decide and report; do not hand him lists to
adjudicate. He also said, approving the residue move: *"bundan sonra TEK BİR HARF DAHİ ŞİRKETİN
VERİ TABANINA GİRMESİN!"* **He has NOT been asked whether either sentence should become a standing
rule, and neither has been written as one.**
**The one-way window is open, and it is one-way against CLASSES and not examples — but BLOCK 3 IS
STILL NOT CLOSED, and the reason is in the second audit.** `dxb_reader` on the holding's engine:
SELECT on `public` and `pgboss`, nothing else anywhere, and it cannot read `auth`.
**FIRST AUDIT — FAIL, on two escapes the drill had never tried,** both reproduced with the real
role on the disposable construction engine: a LARGE OBJECT (`lo_from_bytea` created oid 29009,
count 0 → 1; PostgreSQL hands that family to `PUBLIC` by default and 17 of them were callable) and
a SEQUENCE (`net.http_request_queue_id_seq` carried `=rwU` to `PUBLIC`; `nextval` moved it 1 → 2
and the `ROLLBACK` did not put it back — the one write a rolled-back drill can never see). Four
more the same sweep found: the window restarted the holding's outbound worker, VACUUMed one of its
tables, held TRIGGER on the pg_net queue, and could notify the CEO's live channel. The seal now
closes classes: every schema but `public`/`pgboss`, every sequence, every table on **seven** verbs,
every SECURITY DEFINER function in every schema plus the large-object family and the catalogue
functions that emit WAL, make replication slots, reset statistics, signal backends, read server
files or take the holding's own advisory locks, and the default privileges for what does not exist
yet. Seal and proof are interpolated from ONE constant so they cannot drift. **On the company: 47
functions walled · 1 schema closed · 1 sequence swept · 2 tables sealed · 4 default-privilege sets
rewritten · 51 privileges changed for `dxb_reader` · 0 for any other role** out of 7,494 answers —
`BLAST_RADIUS_CLEAN` — and the seal writes its own reversal first
(`var/b36/company-window-undo.sql`, 2,033 statements), because `pg_dump` does not carry
catalogue-function privileges and Block 0's dump could never have undone it.
**SECOND AUDIT — FAIL again, and it found the thing no privilege can fix. Its ruling is obeyed
literally: the fixed question is not narrowed, and `residual > 0` breaks the close.**
**(a) THE FORGED LIVE EVENT IS CLOSED.** `NOTIFY` is a COMMAND with no privilege in PostgreSQL, and
the ops:live collector republished anything that parsed as an envelope. RED, with the real role and
the listener exactly as committed: **a forged event reached the CEO's channel — 1**.
`fn_opslive_notify` — the single door — now writes a RECEIPT into `dxb_internal.ops_live_issued` in
the source write's own transaction (migration `20260824003000`); the collector verifies AND
consumes it and fails closed. GREEN: **forged 0 · the company's own events still arriving 1 · a
replay stays 1** · `FORGED_EVENT_REFUSED`. The window cannot reach the receipts: on the company,
`schema usage=false table select=false insert=false`. Board row **B37 is closed by this.**
**(b) WHAT A PLAIN POSTGRESQL LOGIN MAY DO TO ITSELF IS STILL OPEN** <!-- OPEN: B36 -->**, and it is why Block 3 is not
closed.** Measured with the real role: it changed **its own password** (`ALTER ROLE` — the next
connection then failed *password authentication failed*, because `pg_authid` really moved), made a
setting **permanent for itself** (`statement_timeout` 120s → 999s in `pg_db_role_setting`), and
wrote **its own default privileges** (a row in `pg_default_acl`). There is no `REVOKE` for any of
them. **So the fixed question — can `dxb_reader` make a permanent change or an outside effect
through any route given to it? — is answered YES while a direct login exists**, and
`pnpm b36:prove-window` prints `WINDOW_LEAKS` and exits non-zero on BOTH engines: **13 classes
measured · 0 privilege classes leaking · residual 3**.
**THIRD AUDIT, 2026-08-24 — FAIL, and it named the reason all three failed: the route is not in the
database at all.** *"the current gateway plan does not close host-level Docker access."* Every
attempt so far fought inside PostgreSQL while the construction runtime runs as the operating-system
user `dxb`, a member of the `docker` group — and the Docker socket is root on this machine.
Re-measured from the construction runtime with SELECT-only statements, **nothing changed in the
company**: `docker exec -U supabase_admin` → **`REACHED supabase_admin superuser=true`**;
`docker exec -U postgres` → `has_table_privilege` INSERT `cost_ledger` **true**, DELETE `audit_log`
**true**, UPDATE `approvals` **true**; `.env`, `.env.daemon`, `var/b36/company-window.env` all
**readable**; `psql "$DXB_COMPANY_READONLY_URL"` → **`TCP LOGIN SUCCEEDED as dxb_reader`**; and the
governance gate itself reads the holding through that same socket, its fallback branch as
**`-U postgres`** (`scripts/governance/ledger-truth.mjs:220-221`). **Closing the three
self-directed capabilities would not have closed this row either** — a runtime that can become
`supabase_admin` never needed `dxb_reader`.
**HE APPROVED THE CORRECTED PLAN AND IT WAS BUILT THE SAME DAY** — *"onaylıyorum"* · *"önce
bis-block3 yap ilk onayladığımı"*, registered as `b36-block3-bis-os-wall-2026-08-24`.
**`pnpm b36:prove-wall` → `WALL_IS_ONE_WAY`.** From inside the sandbox the construction actually
runs in: a direct TCP login to the holding refused in **all five spellings**, its HTTP gateway
refused in all five, the Docker socket `ENOENT`, the container unreachable, **no credential file
readable**, a real login refused, **all 6** smuggled SQL strings and **all 5** other operations
refused by the read gateway — while the construction's own engine, the gateway and a named question
(`agents_total = 205`) all answer. **Every attempt is fired twice**: unsandboxed it must SUCCEED,
and the drill prints `PROBE_IS_BLIND` and exits 1 instead of a verdict when it does not — it caught
that fault in itself on its first run. What was built: a `bubblewrap` sandbox with **no network at
all** and no Docker socket (`scripts/construction/run.sh`, seven named ports carried in over unix
sockets; 54322 and 54321 are not among them); `dxb_reader` **gone from the company engine**, renamed
to `dxb_gateway` so the audited privilege set moved on the role's OID and **not one GRANT was
re-issued**, its credential now outside the repository at `~/.config/dxb/`; a read gateway on the
company's side answering a **catalogue of named questions it freezes at startup**, over a unix
socket, with no SQL from the caller; and `ledger-truth.mjs` stripped of both `docker exec` branches
— gateway up `exit 0`, gateway stopped `exit 1`. **All 9 privilege classes are zero.**
**AND THE SAME DAY HE GAVE HIS PASSWORD AND THE TWO ROOT LAYERS WERE FINISHED — the wall is
doubled.** **(a)** The construction runs as its own operating-system identity `dxbbuild`, uid **997**,
own group, **not in `docker`, not in `sudo`**, shell `nologin`, no home; it holds the repository
through an access list and **nothing else on this machine**. Root performs the mounts and only then
drops the payload with `setpriv --clear-groups` — the drill prints `identity that fired them:
uid=997 gid=973 groups=973 sandbox=yes`. **(b)** The kernel refuses that identity a route to the
holding: `nftables` table `dxb_wall`, loaded at boot by `dxb-company-wall.service` (`enabled`).
**ITS FIRST SHAPE FAILED ITS AUDIT ON 2026-08-24 AND THAT SHAPE IS DELETED, NOT FOOTNOTED.** It
forbade the two published port numbers; the auditor did not attack a port at all — he asked the
holding's container for its own address and connected to **`172.18.0.6:5432`** from the real
`dxbbuild` identity, a **live PostgreSQL login with INSERT/UPDATE/DELETE true**. Re-measured
connect-only before anything changed, it was worse than the finding: the database, kong, rest, auth
and realtime all answered on their container addresses, **and so did this machine's own LAN address
and the docker gateway** on the published port; only the two `127.0.0.1` spellings were ever caught.
**Two reasons, either one enough:** a container address is not a port, and Docker rewrites the
destination of every non-loopback local address in the `nat` OUTPUT hook, which runs **before** the
filter hook. **A wall that names what it forbids is always shorter than the list of ways to spell an
address**, so it now names what it ALLOWS — eight construction ports on the loopback address,
everything else this identity emits refused, IPv4 and IPv6, TCP and non-TCP. Fired again with **no
sandbox at all** between it and the company: **21 addresses asked of Docker that run, the 19 of them that are real doors all refused**, **THAT COUNT WAS WRONG AND IS CORRECTED HERE, 2026-08-24:** a second, independent measurement built for the CEO's acceptance screen disagreed with the drill, and the drill was the one that was wrong. Docker's template prints the two words `invalid IP` when a container has no IPv6 address, and the sweep's filter turned both words into hostnames — so 18 of those 39 were names that never existed, and refusing to resolve a name that does not exist proves nothing. The real numbers, measured after the fix: **21 addresses discovered, 19 of them real doors** (two exposed ports have nothing listening behind them), **and every one of the 19 refused** from both walled runtimes. The drill now separates the two and prints `BLIND` if the red half reaches none of them.
the live login at the container address **refused by the network before any credential was
offered**, its own engine open. **The fix broke something else for thirty minutes and the sweep
caught it:** `meta skuid != 997 accept` does not match a packet the kernel emits with **no owning
socket**, so those packets fell into the default-deny — **ten packets of two of his own editor
processes destroyed in two idle seconds, for every user on this machine** — and the same trap turned
the wall's own refusal into a **2,769-packet storm from one connection attempt**. Written as
`meta skuid 997 jump`, idle cost is **zero packets** and one refused attempt costs **one packet,
answered in 32 ms**. Both lessons are in the battery, measured on the rules and not on the prose:
`tests/b36/company-is-read-only.test.ts` (6). **(b-2) AND THE SAME AUDIT EXPOSED THE HOLDING'S OWN FRONT DOOR — SHUT ON HIS ORDER THE SAME DAY** (*"tmm gerekeni sen düzgün bir şekilde yap"*). This one is not about the construction. The Supabase CLI publishes the holding's database and API gateway on **0.0.0.0**, and the password behind that database is the CLI's documented local default. Measured from a throwaway container on a different network — the nearest thing to another device on his wifi — **`192.168.178.44:54322` REACHABLE, `54321` REACHABLE, `172.17.0.1:54322` REACHABLE**, no login attempted. **The password was rejected as the lever on measurement:** no setting binds the doors to this machine, the canonical chain spells that password in three named places, the live `dxb_litellm` container connects with it, and `supabase start` writes it back. The door is shut in the kernel instead — a second chain in `dxb_wall` at PREROUTING priority -150, before Docker's address rewrite, loopback let past, both doors dropped for everything else. **All four probes refused after**, the same probe still reaches a non-holding door on this machine, `127.0.0.1` unaffected, five company containers healthy, dashboard `/login` **200**, and the chain survives a restart of its service. The construction engine's own doors (54421/54422) stay open by judgement, named in the record. **(c)** The wall's definition is **root-owned** —
`/usr/local/sbin/dxb-construction-sandbox` (`root:root 0755`), source
`scripts/construction/sandbox.sh`, one `sudoers` entry, and `run.sh` reduced to three lines; the
drill measures owner uid **0**, not writable by anyone else, **identical** to its source, and a test
fails on drift. **(d)** `.git` is bound **read-only** inside, so the construction cannot rewrite the
holding's history.
**THE BATTERY RUNS INSIDE THE WALL, AS THAT IDENTITY** — `pnpm construction:battery` →
**`BATTERY_GREEN`**: sandboxed **106 files / 769 passed / 15 skipped / exit 0**, plus a named host
half of **2 files / 11 tests** that must enter a container or read this machine's process tree,
printed on every run. `verify:ledger` OK · `SCHEMA_PARITY` · `I18N PURITY: PASS` · gitleaks no leaks
· `typecheck` exit 0 · three resident services active, 0 restarts.
**ONE DEVIATION REMAINS, deliberate:** `dxb_reader` was renamed rather than dropped and rebuilt —
the account is gone either way, and the rename carries the audited privilege set on the role's OID
without re-issuing one GRANT, the act that already broke the holding for eleven minutes here.
**A TRAP PAID FOR:** when the sandbox first ran as the new identity, the bridge directory was
root-owned, the forwarders could not create their sockets, every TCP handshake inside still
succeeded, and PostgreSQL answered *"Connection terminated unexpectedly"*. **A wall that looks like
a working bridge is worse than one that is plainly shut.**
**ACCEPTED BY THE CEO, 2026-08-24, AFTER HIS AUDITOR PASSED IT** — *"denetçi tamam dedi herşeyi kaydet. onaylıyorum."* Registered as `b36-block3-bis-accepted-2026-08-24`. LAW B is satisfied: the author's work was finished on 2026-08-24, his auditor examined it, and his own word makes it accepted. **The row B36 stays OPEN** — Block 3-bis is one block of eight; **Block 4 was built the same evening** and Blocks 5-7 are untouched. <!-- OPEN: B36 -->
**The block also broke the company and put it back**: its first version gave `anon` the right to
call all 85 control functions, its own blast-radius photograph caught it, and Block 0's dated dump
restored the exact prior state (`COMPANY_PRIVILEGES_RESTORED`).
**The company's data never moved through any of it:** 60 tables · 46,735 rows · `aecfcfa259c9c501`
· 18 sequences `98258eb817d8e3b8` · 0 large objects · audit_log 29,637 / hook_violations 1,963 ·
`STATE_FINGERPRINT de359137ee1d7c79`, identical at every step.
**That evening's holding order — *"Blok 4'e geçme; yalnız Blok 3'ü düzelt"* — is spent:** Block 3-bis
was corrected, audited and accepted by him, and Block 4 was then built. The sentence is kept here as
history, not as a live instruction (LAW A).
**He had the work audited by Codex Solo 5.6 TWICE the same day, and the second audit rejected the
first answer in full** — *"7 bulgunun 0'ı bütünüyle kapandı"*. It was right on all seven. The
critical one had **six** reproducible escapes, not three: six spellings of the company's address
(`?host=`, no database in the path, `127.1`, `2130706433`, `localhost.`, `127.0.0.2`) each CONNECTED
to the holding while the guard's parser called them a different database. **The guard no longer reads
the address at all** — it asks the server for its cluster id and the database's oid and name. The two
answers are `AUDIT-RESPONSE-1.md` and `AUDIT-RESPONSE-2.md` in the row's own folder.
**His standing correction from that day, worth carrying:** when a test failed one run in five the
author offered to set it aside, and he refused it in one line — *"o 5 test'in 1 hata ise neden hatalı
testi yok saymayı teklif ediyorsun?"* Frequency does not shrink a defect.


**2026-08-24 — LIVE OPERATIONS SAT AT "Connecting" FOR EVER, AND IT IS FIXED AT ITS SOURCE.**
He saw it on his own screen: the badge on Live Operations never reached "Live" while the company
was healthy. Not caused by Block 3 (0 privileges changed for any role but `dxb_reader`). **The
cause is in the library, read in the shipped source of `@supabase/realtime-js` 2.110.0:**
`RealtimeClient.channel(topic)` hands back the channel the socket ALREADY has for that topic
(`RealtimeClient.js:330`), and `RealtimeChannel.subscribe()` does nothing at all unless the channel
is closed (`RealtimeChannel.js:140`) — **it never calls the callback back.** Nine panels share four
topics (`ops:live` 3, `alerts` 3, `approvals` 3, `settings` 2), so the first panel to ask was
answered and the rest waited for a reply that was never coming; the badge shows the WORST of the
channels a page watches, so one silent channel froze the whole surface. `removeChannel()` being
async made it a race: a panel that unmounted and remounted inside that window got the leaving
channel back and hung. **`apps/dashboard/src/lib/realtime.ts` now joins each topic ONCE and fans
messages and status out to every panel**, keeps the registry on a global symbol so a hot module
replacement cannot open a second channel on a topic the socket already joined, never leaves a
topic while the tab lives, and can no longer sit at "connecting" — an unconfirmed join says `stale`
after 10 s, which is a state the CEO can act on. **Measured:** battery **105 files / 769 passed /
15 skipped / exit 0** · `tsc --build` 0 · `verify:ledger` OK · `verify:schema-parity`
SCHEMA_PARITY · gitleaks no leaks. **Proved red first:** `tests/phase8/realtime-channel-sharing.test.ts`
(7 cases) goes red when the sharing is mutated away, and red again when the CLOSED status stops
being reported. **The fix is in ONE commit, `d8100c0a`** — `d92baac6` the same day touches only
`.claude/skills/dxb-operator/SKILL.md` and has nothing to do with the screen. A first report said
"two commits" and that was wrong.
**WHAT THOSE 7 CASES DO AND DO NOT PROVE, because an audit had to say it:** they drive the real
`subscribeDxb` against a STAND-IN for the socket — a fake client that copies the two behaviours of
`@supabase/realtime-js` 2.110.0 that caused the defect (`channel(topic)` dedupes; `subscribe()` is
a silent no-op on a channel that is not closed). They prove the LOGIC. They cannot prove every
transition of a real websocket, and the battery may not hold one: `tests/b36/battery-carries-no-
company-key.test.ts` forbids it a key to the holding. Whoever reads them should read them as that.
**AND THE AUDIT NAMED A GAP THAT WAS REAL — recovery after an outage LONGER than the 10 s deadline
was never proved, only the permanent "Connecting" was.** Measured live on 2026-08-24 in the CEO's
own browser, by holding the websocket down and letting it back up: baseline all three channels
`live` → socket held down **17.4 s** → within **2.4 s** all three said `stale` → socket released →
within **3 s** all three were `live` again, **with no reload and no navigation**. Eye evidence in
the same run: the badge visibly read the red **"Stale — reconnecting"** during the outage and green
**"Live"** afterwards. `tests/phase8/realtime-channel-sharing.test.ts` case 6 now holds that path.
**A TRAP THAT COST THIS SESSION AN HOUR AND WILL COST THE NEXT ONE THE SAME — a screen measured
through a HIDDEN browser tab lies.** Chrome defers React hydration in a background tab: the Live
Operations panel read "Connecting" and its channels were never subscribed for **97 seconds**
(the probe's own timestamps jump 47,322 ms → 97,322 ms, Chrome's intensive throttling), and the
moment the tab came to the front it hydrated and the badge read **Live**. Anything read out of
`javascript_tool` on a tab that is not in front is worthless. Take the screenshot FIRST; it brings
the tab forward, and then read.
**What was verified by eye and by whom:** the author's own session — badge **Live** on a full load
and after navigation, `ops:live` serving two panels from one join, six topics `joined` with 0 stuck.
That is a measurement, not an independent one: an auditor with no browser session cannot reproduce
it, and it should not be quoted as if he could.
**Not measured, and it is not measurable without breaking his order:** an end-to-end "a real
company event lights the page" needs a write into the holding's database — *"TEK BİR HARF DAHİ
ŞİRKETİN VERİ TABANINA GİRMESİN"* — so it was not attempted.


**2026-08-16/17 — the holding moved to the workstation, and it is measured, not assumed.** He
ordered a clean move ("tertemiz cillop gibi bir taşıma") with one binding condition: **nothing is
deleted on the X230**.

**THE CUTOVER HAPPENED ON HIS ORDER, 2026-08-17 16:23 — `DXB-Center` (192.168.178.44, user `dxb`)
IS THE LIVE MACHINE.** His words: *"git geçmişini de birleştir, servisleri PC de kur"*, after
*"oradaki opus 5 ile devam ederim ben"*. The sentence that stood here — *"the laptop is still the
live machine"* — is deleted by that order (LAW A). Measured, not assumed: the two histories had
genuinely **diverged** (the workstation committed the same work separately at 16:09 while this
session was running) and are now **one history, merged with no conflict and nothing lost** — both
machines read commit `8046e767` with the identical tree `c80e13db`, both working trees clean,
`tsc` exit 0, governance gates **23/23**. The resident services are **stopped and disabled on the
X230** (unit files left in place — nothing deleted) and **installed and running on the
workstation** through the repo's own `scripts/systemd/install.sh`: both `active`, **0 restarts**,
`linger` on so they survive logout, exactly one node process each, and the queue is demonstrably
working — **117 pg-boss jobs in ten minutes, 15 schedules live**. Nothing of the company was lost
in the switch: company memory is **74 rows on both machines**, and the entire 367-row difference
is the construction diary. **JARVIS runs but cannot speak or hear yet** — its log says
`speaches unreachable for cue synthesis — retrying in 30s`, which is the fail-soft behaviour
working as designed and is exactly the gap board row **B12** now carries.

**AND THE SAME HOUR HE STOPPED BOTH SERVICES: *"iki serviside şimdilik durdur"*.** The reason
outranks the machinery: **V1 is dead and everything is built again**, so the engine was turning
for a product with no future — 20 minutes of `chat.drain`, `voice.drain`, `intent-intake`,
`task.worker` and `outbox-tick` against 0 open tasks, 0 pending approvals, no incoming message
and no revenue. Both services are now **installed, `disabled` and `inactive` on BOTH machines**,
unit files in place, zero processes. They start again the day V2's spine exists.

**The machine, measured 2026-08-17:** Ryzen 9 7900X — **24 threads against the X230's 4** · 30 GB
RAM against 7.4 GB (which sat at 385 MB free with 3 GB of swap in use) · 1.8 TB NVMe at 2 % against
164 GB at 92 % · **RTX 5060 Ti, 16,311 MB, CUDA proven from Python** against no GPU at all. The
test battery: **701 passed / 6 failed / 37.6 s** there against **685 / 22 / 125.2 s** here. The new
machine is not merely bigger — it fails less.

**What the move exposed, and what it means.** Three defects were the author's own and are fixed
(the `.env.example` files excluded by a rule-ordering mistake; the workstation's own Codex config
overwritten with `/home/ghost` paths; and `--no-privileges` on the restore, which stripped **131
privilege grants** and left `anon` able to truncate tables the dashboard reads — all 824 grants now
match). One was the repository's and is fixed in commit `388ef52`: **`packages/hr` and
`packages/revenue` were never compiled at all** — absent from the root tsconfig — and nine
build-order links were missing across three packages. It passed on the X230 only because stale
`dist/` folders masked it. **A clean machine is an auditor.** One claim the author made was wrong
and was withdrawn by measurement: the repository *can* be installed from scratch — `bootstrap-db.sh`
applied 154 of 154 migrations to an empty database; `supabase start` was simply the wrong door.

**B12 is unblocked and is now the most valuable open row.** Its hardware arrived. The gap it must
close was measured against the rivals the same session: J.A.R.V.I.S answers in **1.30 s**, source 21
in 2.55-5.40 s, and **our 102 voice calls sit at a median 32,684 ms** — of which **hearing is
20,083 ms**. The killer is `faster-whisper-small` on a CPU, and rival report 21 already fixed the
target in his own words: **"1.5 s round trip — HIS FIGURE, no exception."** Row 4.2 (STT →
`whisper large-v3-turbo`) takes 20 seconds out of 32.7 in one move. No local model runner is
installed on the workstation yet.

**Open legs of the move live on board row B29** — the bulk folders still transferring, three
root-owned MySQL files that permissions refused, the resident services deliberately not started
(two machines running them would act twice and split the database), and his workstation password,
which was typed into a transcript and should be changed.

---

**2026-07-30 — the context architecture, both layers.** His session focus, in his words:
*"şuan sadece odak noktamız bu directive paketi o kadar ve bu context engineering işi… rakip
analizi vs bunlar hepsi sonra."* He approved the eight-step plan, Hamza included, and added two
laws now written into `.claude/CLAUDE.md`:

- **LAW A** — a live CEO order deletes what contradicts it. Not a footnote beside it.
- **LAW B** — finished ≠ approved. *"iş tamamlanınca bitti anlamına gelmez, ben bakmam lazım."*
  Only his own eye accepts. No record may claim his approval without a registered entry.

This work was **accepted by the CEO himself** (registered in `scripts/governance/ceo-approvals.json`):
*"kabul ediyorum"* (2026-07-31). His first test failed and is recorded on the board with its two
causes; his second passed. Nothing else on the board is accepted by that word.

## The newest written directive

**`docs/ceo-directives/2026-07-reanalysis/` (CEO, 2026-07-29)** — the correction, re-analysis and
design directive. It **supersedes the previous competitor-analysis conclusions and any plan built
on them**, and it forbids implementation until he has approved a visual design package. It is the
highest-ranking written source after his live order. Not started: he has ordered it after the
context work.

## What is open

`HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md` — the single register. Order of work is his:
**oldest first**, unless he names a focus for the session, which outranks it.

Waiting on him, not on the author: his approval of the design package · one hand-minted browser
session so authenticated surfaces can be checked by eye (B03-bis) · the connector accounts (W-C42-4)
· money for the paid model exams (B06, B09) · the acceptance session itself (B13).
Waiting on hardware: the workstation, and the local voice models chosen by measurement (B12).

**THE WORKSTATION, AFTER THE EVENING OF 2026-08-17 — measured, not assumed.** It froze hard at
18:04 and he was owed an answer. Cause, from the kernel's own record: a `grep` written by a session
became `ugrep` (Claude Code shadows `grep` with its bundled binary at
`~/.local/share/claude/versions/2.1.233`), and the bounded-repetition pattern `.{0,70}(…7 alternatives…).{0,70}`
built a **26 GB** matcher for a **380-byte** input — 30 GB RAM and 8 GB swap gone, `Free swap = 0kB`.
The kernel then killed the wrong processes (a 341 MB `python` and a 68 MB `kilo`, both at
`oom_score_adj 1000` because VS Code marks its children to die first) while the 26 GB offender at
`100` survived. **Never write `.{0,N}` on both sides of an alternation in a shadowed `grep`; use
`python3` or `rg` for that shape.** What was installed that evening, on his order and with his
password: `earlyoom` **in `--dryrun`** (`-m 10 -s 10`, avoid list covering code/chrome/claude/node,
prefer list covering ugrep/vite/esbuild/tsc — it closes NOTHING and only records what it would have
closed; **arming it is his decision and he has not taken it**), plus `psql`, `tesseract-ocr` (+tur/eng),
`imagemagick`, `gh`, `wl-clipboard`, and `dxb-screenshot` at `/usr/local/bin` (Wayland blocks
scrot/grim/import; it goes through the desktop portal and works — output lands in
`~/Pictures/dxb-screenshots`, swept after 7 days by a user timer, because `/tmp` here is a **15 GB
RAM disk** and screenshots left there eat the memory we are short of).
**CORRECTED 2026-08-24 on his ruling, and two things measured while doing it.** The sweep is
**weekly**, not nightly, and having nothing to sweep is a **success**: his words, *"küçük bir
haftalık temizlik görevi… yoksa neden başarısız diyor ki"* — the unit had been reporting FAILED
every night at 00:00 because `find` exits 1 on a folder that does not exist. The work is
`scripts/ops/screenshot-sweep.sh` and **both unit files are now in the repository**
(`scripts/systemd/dxb-screenshot-cleanup.{service,timer}`, installed by `scripts/systemd/install.sh`);
until today they existed ONLY on this machine, hand-written, in no repository at all. Measured the
same hour: **`dxb-screenshot` is NOT on this machine any more** — `/usr/local/bin/dxb-screenshot`
does not exist, so nothing has been writing to `~/Pictures/dxb-screenshots`; and the `operator`
command, which is what this machine actually uses for the screen, writes to **`~/Pictures/operator`**
(`/opt/dxb-operator/cli.py:20`). **His ruling on being shown that, the same evening:** *"sadece
~/Pictures/operator kalsın."* The sweep covers that ONE folder; `~/Pictures/dxb-screenshots` is not
the screenshot folder any more. It does **not** touch `~/Pictures/Screenshots` (GNOME's own, 29 files
/ 7.2 MB) or the loose files in `~/Pictures` — those are the CEO's own pictures. Machine after:
**0 failed units**, next fire Mon 2026-08-31 00:11.
**Two live gotchas for the next session:** `dxb` is in the `docker` group in `/etc/group` but this
desktop session predates the change, so `docker exec` is refused until he logs out and back in —
until then the governance gate must be run with a `docker` shim on `PATH` that rewrites
`docker exec … psql …` into `psql -h 127.0.0.1 -p 54322` (`PGPASSWORD=postgres`), which is the same
server and returns the same numbers. And a `sudo` timestamp does **not** survive between Bash tool
calls, so anything needing root must prime and run inside one command.

## Honest position

The holding **does not earn yet and has never been switched on end to end.** Revenue realised:
zero. The structure, the rules, the 199 written employees and the two-language discipline are real
and measured — and unproven, because none of it has produced anything. That is the CEO's own
verdict and it stands until a measurement replaces it.

**The completion percentage is deliberately absent.** The roadmap's status token is not
machine-readable, so every session re-derives a different figure — the drift is recorded in the
archive and owned by board row **B20**. A number nobody can reproduce is worse than no number.

## Next — read this before doing anything

**READ THIS FIRST — WHAT IS BEING BUILT IS V2, AND V1 IS DEAD.** His ruling of 2026-08-01, twice
registered on the board (§Decisions, `v2-location-and-v1-dead-2026-08-01`) and never softened
since: *"bu versiyon 1 olarak kayıt altına alınmalı ve yeni versiyona OPUS 5 ile beraber
başlamalıyız"* · *"V1 kesinlikle ölü yani."* The interface is written **from zero in a clean new
folder inside this repository**; the old screens get no repairs, no polish and no defence, and
**copying from the old code into the new folder is forbidden** — whatever is needed is written
again. What does NOT move: the company itself — its database, its 199 written employees, the
approvals register, the record gates and the board all stay where they are. **The 40 complaint rows
C26-C65 are his own words about what he did not like, and they are no longer work to do on V1 —
they are the specification V2 must satisfy.** V2's first law is his: **IT MUST BE ALIVE**
(2026-08-02). Nothing is built before he has seen it drawn, screen by screen, and said yes.
**Measured 2026-08-17: the new folder does not exist yet** — the repository still holds only V1's
`apps/dashboard`, `apps/jarvis` and twelve packages. The rival parts list (item 1) is what stands
between here and the first drawing.

**WHAT "V1 IS DEAD" DOES NOT MEAN — his correction, 2026-08-17, given after a session got it wrong:**
*"V1 in motoru kullanılacak sakın saçma sapan şeyler kendince yazma."* **The dead thing is the
INTERFACE.** The engine underneath stays and is what V2 is built on: the orchestrator, the claim
path, the pre-task gate, the halal screen at birth, the work generator, the revenue engine's
objective→opportunity→allocation→project chain, the 205 agents and every control function. A
session that treats the engine as scrap, or that invents a new structure beside the one already
specified, is doing the thing he named. **Before proposing any structure, read the spec that
already owns it** — `REVENUE_ENGINE_SPEC.md` §3 carries the whole venture lifecycle, and
`00-CEO-DIRECTIVE-SOCIAL-MEDIA-DEPT.md` owns the content side.

**AND THE EMPTY TABLES ARE NOT A DEFECT.** `00-NOTE-FACTORY-COMPLETION-ROADMAP-2026-07-26.md:16`,
in his words: *"şuan biz üretim aşamasında değiliz fabrikayı tam anlamıyla kurmamız lazım"* ·
*"ben bilerek henüz aktif para üretme mekanizmasını başlatmadım"* — therefore **zero revenue, zero
opportunities and zero running work are the EXPECTED state**, and that line ends: *"Any report that
frames the empty tables as a failure is wrong and has already been corrected twice in chat."* It
was corrected a **third** time on 2026-08-17, in a rival report that read 205 dormant agents and
217 lifetime tasks as our failure. The cause was named by him and it is the standing risk for every
session: **the author knows where the plan is, not what it says.** 59 files · 11,353 lines ·
151,838 words in `HOLDING-OS-MASTER-PLAN/`, and no session has read them end to end. He was offered
that reading as the next job and had not answered when the session closed.

1. **B36 — cutting the construction site out of the company. THIS IS THE WORK IN HAND.** <!-- OPEN: B36 -->
   Plan: `.planning/quick/20260823-construction-company-separation/PLAN.md` (eight blocks, approved).
   Evidence: `EVIDENCE.md` in the same folder · audit answers: `AUDIT-RESPONSE-1.md`, `AUDIT-RESPONSE-2.md`.
   **AND HIS AUDITOR'S FIVE INSTRUCTIONS, CARRIED OUT THE SAME NIGHT — and the first measurement was
   worse than the question.** Asked whether the LIVE dashboard was started through
   `scripts/dashboard.sh`, the answer was **no**: the `next-server` serving :3000 had been started by
   hand 6h50m earlier (`pnpm --filter ./apps/dashboard dev` from a session shell), carried **zero**
   `DXB_DATABASE_URL`, and was bound to `*:3000` — **answering on 192.168.178.44:3000, the home
   network**. His voice line was already broken and nothing said so. Restarted through the wrapper:
   loopback only, and the listening process measured carrying both the address and the launcher stamp;
   the LAN door now refuses. **The gate:** `apps/dashboard/src/instrumentation.ts` stops the server at
   startup with a named reason if the wrapper did not start it — both refusal shapes run against a
   real `next dev` (exit 2 and exit 1, nothing left listening) — and
   `tests/ops/dashboard-launcher.host.test.ts` holds it in the battery's host half, seen RED first
   against an unstamped listener planted on the port. **The authenticated voice-call path proven end
   to end** — real Turkish speech through Piper, a real `@supabase/ssr` session, `HTTP 201` with
   `transcript "bugünkü açık işleri özetle."` — run against the **construction** engine, because a
   real call writes `voice_calls` and `intents` and his *"tek bir harf dahi"* order stands; the
   conflict was named to him, not decided quietly, and the last inch (one real call on the company)
   waits on his word. <!-- OPEN: B36 --> **Fixing the dashboard's open door blinded `pnpm b36:prove-wall`**, and that is
   the best thing that happened all night: the drill's control probe — the green half that must
   succeed for a refusal to mean anything — had been dialling the CEO's dashboard on the LAN, so its
   proof of its own eyesight was borrowing a security hole. It opens its own control door now.
   **STATE_FINGERPRINT de359137ee1d7c79 before and after all of it.**
   **DONE — Block 4, the company's address is no longer a default anywhere. 2026-08-24 evening.**
   **95 → 0.** Ninety-five files bound the holding's own address to `DXB_DATABASE_URL` as a fallback —
   82 suites opening with `??=`, three seeds, six operator tools, the Phase-5 exit gate in bash, and
   **one live application route** that invented a database for itself on every request. Each was inert
   while something else set the variable first and live the moment nothing did. They are gone. The
   seeds, the tools and the gate now refuse with a named reason and a non-zero exit, and **all eleven
   refusals were RUN, not predicted**. The battery's engine is named once, in `vitest.config.ts`, from
   the one spelling in `tests/construction-engine.ts`. `scripts/systemd/install.sh` still writes the
   company's address for the company's OWN daemons, under **`DXB_COMPANY_DATABASE_URL`** — a name
   nothing reads by accident — and each unit maps it back inside its own `ExecStart`; both daemons were
   measured carrying it, pg-boss reconnected, `NRestarts=0`. Removing the route's fallback left the
   dashboard with no address at all (it is the only file there that calls `getDb()`, and Next.js does
   not read the repository-root env files), so `scripts/dashboard.sh` / `pnpm dashboard` hands it one
   the same way. **The gate:** `tests/b36/no-company-fallbacks.test.ts` imports the counter itself, so
   the definition and the enforcement cannot drift apart; it proves its instrument can see a fallback
   in seven shapes before it is allowed to report none, and it was **seen RED first**. A defect found
   on the way and fixed at source: `scripts/library/intake.mjs` held **two raw NUL bytes**, which made
   `ugrep` — what `grep` resolves to on this machine — skip the file in silence; an audit of it would
   have reported clean. **Gates after:** `BATTERY_GREEN` 107 files / 775 passed / 15 skipped + host
   2/11 · `tsc` 0 · `verify:ledger` OK · `SCHEMA_PARITY` · `WALL_IS_ONE_WAY` · gitleaks clean ·
   `STATE_FINGERPRINT de359137ee1d7c79` identical before and after. **One flaky test was found by
running the battery five times and fixed at source, and it was never B36's:**
`tests/phase5/decompose-dispatch.test.ts` read two rows with `ORDER BY created_at` and took the first
as A — a coin flip, because `created_at` defaults to `now()`, which is the TRANSACTION's timestamp,
and `dispatch()` inserts the batch in one transaction, so both rows carry the identical value
(measured: `count(DISTINCT created_at) = 1`). It now looks the rows up by id. **12 consecutive runs
of the file, 12 passed; then the whole battery three times, green each time.** **NEXT IS BLOCK 5** — the residue
   moves out of the company (moved, never deleted — his decision 3), and it begins with a dry-run
   report put in front of him before one row moves.
   **BLOCK 1 IS CLOSED AND DOES NOT REOPEN — the finish line was fixed on 2026-08-23** after three
   audits rejected three different proofs of a block that was already finished. The auditor's wording,
   adopted by the CEO, is the only thing that can reopen it: *"can the SessionEnd hook send an INSERT,
   UPDATE or DELETE to the company's database, regardless of how the address is spelled, of a missing
   or stale identity record, or of a connection failure?"* **Measured answer: NO** —
   `scripts/b36/prove-block1.mjs`, run as `pnpm b36:prove-block1` (it left the battery on 2026-08-23: a construction battery may not hold the company's address and its write-capable account — the auditor's first FAIL on Block 2). What stays in the battery is `tests/b36/block1-question.test.ts`, which answers the same question without reaching the holding:
   **18 hostile conditions · 18 refused · 0 rows in the company carrying any of the 18 session ids the drill handed the hook · the compiled hook holds exactly one write construct and it is the `cost_ledger` insert**,
   and the drill proves in the same run that its detector can see a write. Every other finding —
   counting, backups, record wording, portable builds — goes to its own block and does not hold this
   one. **The next work is Block 3 — the one-way window.**
   **DONE — Block 2, the construction site is OUT of the company's engine.** On his word,
   *"block 2 ye başlayabilirsin"*. It runs its own Supabase stack — `DxB_Build`, ports 544xx, its own
   container set, its own volume, its own PostgreSQL **cluster identifier** — so a mistyped address no
   longer lands on his data; it lands on a port where the holding does not exist. **`dxb_test` is
   dropped**: 138 MB holding 205 agents, 217 tasks, 1,596 cost rows and **40,137 audit rows**, every one
   a copy of his. The company engine now carries `postgres`, `_supabase` and the two templates. The
   address is spelled ONCE (`tests/construction-engine.ts`); the config is **generated** from the
   company's (`scripts/b36/make-construction-config.mjs`) and `tests/b36/construction-config.test.ts`
   fails the battery on drift or a port collision. **Its data is GENERATED, not copied** — his decision
   2: `db/seed/build-seed.ts` (`pnpm construction:seed`) builds a whole holding out of this repository's
   own files, a GENERATED company and GENERATED projects plus 199 seats with GENERATED personas and sicils, gated/bound/active (the first version copied his 199 authored dossiers and 975 sicil values; the re-audit found it also still running the company's own `20260711_holding_core.sql` — his company name, mission, project name, purpose and real document links. A third review found the last of it: 205 real dossier paths and 132 real Turkish titles on `agents`, and the title stamped inside the persona-creation branch so a re-seed repaired nothing — the stamping is unconditional now and covers all 205 including the archived. All fixed at source; the keys code reads stay; guarded by `tests/b36/seed-is-fiction.test.ts`, eleven cases), and refuses to run against the company
   by asking the server who it is. **Proven by destroying the stack and rebuilding it from empty:**
   156 migrations through the canonical chain, then **`Test Files 99 passed · Tests 737 passed | 15
   skipped` exit 0**, `tsc` 0, `verify:ledger` OK, `i18n` PASS, `gitleaks` clean, and **`SCHEMA_PARITY`**
   — the two engines' `public` identical in all nine categories, the single normalisation printed rather
   than hidden. **The company: 0 inserted · 0 updated · 0 deleted across the block**, and when it moved
   minutes later the same watch named it in seconds — the scheduler restart made pg-boss clear 276,569
   completed jobs of its own while `public` stayed at 0/0/0 over all 60 tables. **Seven defects it found,
   all fixed at source:** the chain **resurrects the 15 employees he ordered deleted** on 2026-07-19
   (*"C8 sil."* was executed directly and never written into the chain — new migration `20260823001000`,
   a proven no-op on the company) · the velocity breaker and the monthly cap both **die** when the
   LiteLLM spend table is absent, the cap swallowing an error that had already poisoned its transaction
   · the **`git` MCP server has been dead holding-wide** behind stale pins (the server was pinned, the
   SDK it imports was not) · `scrapling` pointed at `/home/ghost` · on a fresh environment the holding's **entire senior layer**
   (CFO, CISO, CMO, CHRO, Chief AI Officer, General Counsel and seven more heads) reads a gap-analysis
   document as its own identity, because the chain never learned the repoint done directly on the
   company (migration `20260823002000`, also a no-op there) · and the sicil sync **silently dropped 28
   of 199 employees** outside the company, because it matched by a uuid written in the file instead of
   by the slug. **AND A SECOND WRITER WAS FOUND, STILL LIVE, AND IT IS HIS TO RULE ON:** the company's
   own hourly job `claude-mem-sync` pulls the construction sessions' diary into the holding's
   `memory_index` at `scope='holding'` — measured today, it fired at 15:00:29 and put **1,818 rows** of
   this afternoon's work into the holding's brain (13,919 → 15,737). It is the company reaching out and
   pulling construction in, on a schedule, which is why Block 1 never saw it. Nothing was changed:
   `claude-mem` is one of the two plugins he ordered ON, and what the holding's memory may contain is
   the author's to rule on, per his order of 2026-08-24; it goes to Block 5. And one test carried the literal uuid
   of a company row; it finds the project by slug now.
   **DONE — Block 1, the writer is dead, and the SERVER is what says so.** The `SessionEnd` hook that
   wrote the author's own token burn into the holding's `cost_ledger` writes only to
   `DXB_CONSTRUCTION_DATABASE_URL`, nothing when that is unset, and refuses when the address REACHES
   the company. **Three guards were built and the first three audits broke all three.** Two compared the
   ADDRESS (text, then `server:port/database`) — six spellings connected to the holding while the parser
   called them a different database. The third asked the server for its identity but compared it against
   the holding's, which is a DENY rule: rebuild the holding and the recorded identity stops matching, so
   it fails OPEN. The fourth, and the shape that holds: an **ALLOW list**. The hook writes only into a
   database whose identity is on `tools/hooks/ledger-identity.json`, refuses everything else, refuses
   when the recorded company identity has gone stale, has a deadline on every leg and a watchdog over the
   whole run, and the built file now travels with the commit. `tests/b36/` **21/21** ·
   `node scripts/b36/prove-address-escapes.mjs` (read-only) → `ESCAPES THROUGH THE DELETED RULE: 6 of 6`
   · `ALL_ESCAPES_CLOSED`.
   **DONE — Block 0, the safety net, proven in a SECOND ENGINE.** The off-site copy was **fetched back**
   from the Hetzner Storage Box and compared byte for byte (`sha256 cf87ca2d…9501fa`), and that fetched
   file was restored WITH owners and privileges into its own container from the same Supabase image
   (own port, own volume, own `system_identifier`), then compared with the live company: 60 base
   tables · identical row counts in all 60 · 226 functions · 117 indexes · 57 RLS policies ·
   1 sequence · 1482 grants · 34 views, and it answers real queries. **Named boundary:** 133 ignored
   errors, all Supabase's own internals, so this is a DATABASE backup and not a whole-cluster backup —
   a recovery drill must start a Supabase stack first. The probe container and the fetched copy of his
   data were destroyed the same hour.
   **The measurement that settles the whole row:** PostgreSQL's own per-tuple counters — **0 inserted ·
   0 updated · 0 deleted across the 73 tables the holding owns** (`public`, `pgboss`,
   `supabase_migrations`) since the engine came up at 2026-08-23 07:49:54Z, which is before this work
   began. The watch covers **every** schema, 186 tables, 18 sequences, 2,616 grants and 1,614 structural
   objects, splits them into HIS / services-inside-his-database / Supabase's own, treats an unknown
   schema as HIS, and REFUSES to answer if the engine restarts or the statistics are reset.
   `node scripts/b36/company-write-watch.mjs`.
   **NEXT IS BLOCK 2** — the construction moves out to its own Supabase stack (own container, own
   ports, own credentials, project `DxB_Build`), schema from the same `supabase/migrations`, and its
   data GENERATED, never copied from his real rows. Then Block 3 (the read-only window, `dxb_reader`
   with SELECT and nothing else), Block 4 (the **97** remaining fallbacks — 85 tests · 8 scripts ·
   3 seeds · 1 live route, counted by `scripts/b36/count-company-fallbacks.mjs`, which PARSES the code
   after three audits produced four disagreeing figures — which cannot move before Block 2 because the
   tests would have nowhere to point), Block 5 (the residue move, classified and reported by the author), Block 6 (`pnpm verify:separation`),
   Block 7 (records, including closing C36).
   **State when this was written:** battery `96 files · 725 passed · 15 skipped` · `tsc --build` exit 0 ·
   `pnpm verify:ledger` OK · the company measured after the whole battery ran:
   `COMPANY UNTOUCHED SINCE THE BASELINE — 0 inserts, 0 updates, 0 deletes, 0 row-count changes`.


2. **B22 — the rival re-analysis, which waits behind B36.** <!-- OPEN: B22 -->

   **WHY IT EXISTS — order C42, sharpened 2026-08-09:** *"bu rakip video raporlarını niye
   hazırlıyoruz adam gibi hatırlamanız lazım."* He hands over a rival; the author watches it whole,
   reports what that rival **PRODUCES**, then builds the same **or better** — *"RAKİPLERİMİZDEN ÇOK
   İİ OLSUN."* It is the parts list for **the Ferrari**, not research, and **no design work starts
   until every source is watched.** A sentence not traceable to the source is `UNVERIFIED`, or it
   is not written. Full reason: `.claude/skills/dxb-rival-intel` + ledger §Why this exists.

   **The queue position is NOT copied here.** It has one home — the `NEXT:` line at the top of
   `.planning/research/rival-intel/00-LEDGER.md`, printed by `scripts/rival-intel/next.sh`. A copy
   in this file is exactly the stale number he caught on the board on 2026-08-10 (it said
   `16 of 35 · NEXT: 19` while the ledger said 18 and 21). Run the script; never quote a count.

   **Source 20 (2026-08-10) is No Hype Ai (`_no_hype_ai`) — a complete four-stage loop with no
   human inside it**, and it lands on our sorest measurement. A sentence dictated into a phone
   becomes a filed note: `cron · hourly` wakes a **read-only** classifier (`Haiku 4.5`) that emits
   one typed intent with a **confidence**, and a **separate** program performs the write —
   `folder = state`. A Telegram bot then *edits* the same store by conversation
   (*"I already bought tomatoes, please remove that"* → `✓ Done`, stamped `recalled from vault ·
   0.3s`), and the wall prints the human's cost as a number: **`manual filing 0 · you typed
   1 sentence`**. Measured against us the same session: **51 of our 57 captured intents stand at
   `received`** — never classified, never routed — and the last `intents` row (`2026-07-28
   09:03:27`) and the last `task_events` row (`09:04:56`) stop in the same minute, **13 days ago**,
   with `0` task events in 24 h. Our chat can be told things but changes nothing:
   `api/chat/route.ts` is 91 lines with **0** write calls. The cheap model tier we already pay for
   (`deepseek-v4-flash`, `qwen3.6-flash`, …) is wired and unused while all **205** agents sit on
   `claude-sonnet-5`/`fable-5`. Six projects **P20-1 … P20-6**; the first two need no install, no
   money and no account. Its screen motion IS measured: the Obsidian graph moves at **4.52×** the
   floor of static text on the same screen (0.677 vs 0.150 per 100 ms over 63 camera-still pairs).
   **Source 18 (2026-08-10, on his live order "18. video ile devam et") is the other half of source
   01 — the same man's Slack workspace, where his six agents are members of seven rooms named after
   the business.** Its receipt is timed by the workspace's own clock: a customer e-mail at **12:47 PM**
   becomes an escalation the same minute (with a permission to refuse and a permalink back to the
   letter), a diagnosis with file and line numbers at **12:49**, the owner's one-line *"Yes @Tom, go
   ahead"* at **12:50**, and **pull request #15 at 1:06 PM** — 19 minutes, one sentence and one
   approval from him. Its advertising room ends every briefing with **`Approval needed`** whose first
   line is *"No changes were made"* and which asks him to **refuse** one of its own options. Measured
   against us the same session: our whole chat history is **102 messages between exactly two
   participants** (hamza 53, ceo 49), **no room, no colleague, no handover**; **`approvals` holds 51
   rows and 0 pending** although the page already renders recommendation, reasoning, alternatives,
   risk and cost; **`outbox` holds 51 rows and all 51 failed**. Six projects **P18-1 … P18-6**, three
   needing no install, no money and no account. Its screen motion is **UNVERIFIED and says so** — the
   film is handheld and the static control moved 25.83 % against the screen's 43.47 %.
   **Source 17 (2026-08-10) is Higgsfield, and it films the anti-babysitting contract end to end** —
   85.6 s in one take: the owner speaks once, the machine reports the week, **raises the goal itself**
   from $105,200 to $150,000, admits an outage he never saw with its root cause and its 23-minute
   repair, and closes *"My recommendation: double the budget on the Street interview ad… **what would
   you like me to handle first, sir?**"* Measured here the same session: our own briefing closes
   *"Sormak istediğiniz bir şey olursa buraya yazın"* — an open door, no recommendation, no
   answerable question (**P17-1**, a surface change, his eye). Also **P17-2** (no incident record
   exists: 149 alerts, 0 open, none carrying a root cause, a repair or a duration, and no provider
   fallback configured — which is why a missing key becomes 18 failed runs instead of a reroute),
   **P17-3** (the motion law, measured from the film: a counter eases to its true value in ≈ 5.6 s
   with the last second moving 0.002 % of its range, and then **stops** — while the only animation
   machinery in our whole product sits on the **login page**), **P17-4** and **P17-5** (46 of our 205
   written employees are marketing or social, among them `social-scheduler-publisher` and
   `marketing-content-creator` — and **all 205 are dormant**). Refused: autonomous account creation
   and unapproved outward posting, both on his identity gate.
   **15 of 35 reported at the previous measurement, `NEXT: 18`.**
   **The queue grew to 35 on his live order of 2026-08-10** — *"kuyruğa ekle 36 olarak, sırası gelince
   izle."* He noticed row 16 was absent from the directive's §11 list, and the answer exposed a
   dropped source of his own: the YouTube link standing beside the OpenJarvis repository in the very
   sentence that orders the Jarvis system (`docs/source-architecture-notes-sanitized.md` line 17) had
   **never owned a ledger row** — the repository half became row 16 on 2026-07-28 and the video half
   was lost. It is now **row 36**, fetched at 1912×1080 with audio. Defect fixed at source the same
   turn: `scripts/rival-intel/fetch.sh` named every YouTube source `watch`, because it read the slug
   out of the path while YouTube carries its identity in the query — the second such source would
   have collided with the first.
   **Source 16 (2026-08-10) is the queue's second repository and the only source that can be READ
   rather than watched** — Stanford's OpenJarvis, 8,492 stars, Apache-2.0, pushed the morning it was
   read; our clone measured **28 commits behind** and the drift written into the report. Its shape is
   the finding: **the measurement harness is larger than the agents** (37,178 lines of `evals`
   against 22,181 of `agents`). Measured here the same session: we have spent **5,721,728,099 tokens
   across 1,590 `cost_ledger` rows and priced none of them — €0.0000 on every row**, and `cost_eur`
   is 0 on all 378 `agent_runs`; **128 of 378 runs failed (33.9 %)** with configuration failures and
   stale zombies counted as agent error, where their trace carries `harness_error` vs `agent_error`;
   and we hold **zero outside-world connectors against their 39** (a search for gmail/calendar/slack/
   rss/weather/imap returns two hits, both the word "calendar" in a date comment). Projects **P16-1**
   (price the tokens — no install, no money, no approval), **P16-2** (error taxonomy), **P16-3** (the
   briefing contract: importance first, connect related items, interpret don't enumerate, never name
   an empty source, word ceiling — a surface change, his eye), **P16-4** (the first connector — his
   identity), **P16-5** (a standing scorecard for our own agents). Installing the framework is
   refused on our own stack rules and K1; its energy metric is refused as irrelevant to a rented box.
   **13 of 34 sources reported at the previous measurement, `NEXT: 16`.**
   **Source 15 (2026-08-10) is the queue's only PDF** — a two-page Turkish lead magnet naming four
   hosted services against four infrastructure jobs. Its checklist is the finding: of the four,
   **DXB has finished exactly one.** Measured the same session in the company database — background
   work runs (`pgboss.job` **141,856** rows, both resident services `active`), while **no e-mail has
   ever left the system** (`outbox` 51 rows, **0 executed**; the only handler targets a Mailpit
   sandbox), **no euro has ever entered the ledger** (`revenue_ledger` **0** rows, **€0**, against 6
   written revenue engines) and **no deploy artefact exists on disk** (no compose file; two systemd
   units). Its sharpest item costs nothing: Trigger.dev's resume-from-step was adopted as an idea and
   never exercised — `workflow_runs.current_step` exists and `workflows`/`workflow_runs`/
   `workflow_steps` are all **0 rows** — project **P15-3**. Also **P15-1** (real outward mail behind
   the outbox seam that is already built; Resend free at 3,000/month — needs his domain), **P15-2**
   (a Merchant of Record at 5 % + 50¢ as the entry path to a first euro — needs his identity),
   **P15-4** (the `.md` → headless-Chrome → A4 PDF press; Playwright + `chromium-1228` already on
   disk, €0) and **P15-5** (symptom-before-remedy panels, into the design package). Coolify and
   Trigger.dev-as-runtime stay refused on our own stack rules.
   **Sources 07, 08, 09, 10 and 11 were rewritten from
   nothing on his order — *"7'den tekrar başla, bu sefer doğru yap"*** — under law 7, which judges a
   rival by what it PRODUCES. **Row 13 is `skipped` on his live order of 2026-08-10** — *"13.videoyu
   atla ama yanına not düş kısa CEO emri ile atlandı diye. şimdi 14. video ile devam et."* The row,
   its number and its material stay; the queue steps over it, and `next.sh` counts it apart.
   **Source 14 (2026-08-10) is the same product's AGENTS page, and it lands the data model the queue
   was missing: an employee is a role, a live state and a list of NAMED SKILLS, each declaring the
   sentences that trigger it, what it costs and where it was learned.** Measured here the same
   session: `agents.skills` is `[]` on **all 205** of our rows — project **P14-1**, needs no install.
   It also lands **P14-3** (51 of 57 `intents` sit at `received`, and nothing anywhere proposes who
   should own a request — 0 matches in the dashboard and packages) and **P14-4** (the memory node
   states its own provenance; we already carry richer provenance on 13,403 rows and lack the
   inspector). The motion law of sources 11/12 gained its second clause and its second figure:
   **1.5 s per edge, a 1.90 s round, and an `idle` employee receives NO pulse — 0 across 180 frames**.

   **His live order of 2026-08-09 gave the queue its second reading law, and it is now machine-held.**
   His words, handing over source 11: *"zaten 11 de göreceksiniz bağlantı dallarından böyle bir nokta
   akıyor damarın içinden geçen kan gibi. bu sistemler güzel. 1'den 10'a kadar hepsi canlı kanlı. şimdi
   raporlarda bunlar gözden kaçmamalı, ki inşaa sürecinde değerlendirilsin."* **The movement on a
   rival's screen is a PART FOR THE BUILD, so it is measured, never admired** — what moves, in which
   direction, how long it takes, how often it repeats, with the figures, cut at 5-10 frames per second
   because at one frame per second a travelling pulse aliases and its direction cannot be read. A
   twelfth case in `tests/c42/rival-intel-ledger.test.ts` fails a reel that only admires it. Measured
   when the clause was written: **only 3 of the 9 finished reports had timed anything**, and **the
   other five films were measured and repaired the same session** (01, 03, 04, 05, 07).

   **From source 11 (`rinaldojanjua.ai`, watched whole with sound on 2026-08-09):** a five-stage mail
   pipeline drawn as a circuit — its clock printed on its own header (`8:00 AM AND 4:00 PM, EVERY
   DAY`), each stage naming the file that runs it, hard rules as chips on each card, the one
   outward-facing limit hung beside the acting stage as its own object (`CONSTRAINT / mailto
   List-Unsubscribe only`), a shared `AGENT BRAIN` with its read/write edge drawn, and the human as the
   last stage (`TEXTS YOU`, *sent even on quiet days*). **His pulse, measured:** the bead crosses a wire
   in **≈ 1.0-1.2 s**, a new one every **≈ 2.3 s**, always in the arrow's direction. **Measured here the
   same session:** `workflows`/`workflow_steps`/`workflow_runs` hold **0 / 0 / 0 rows**, `memory_index`
   holds **13,194 rows with `run_id` NULL on every one**, and **exactly 3 files in the whole dashboard
   draw a shape** — so there is no wire for anything to travel along. We do have the clock (15 scheduled
   jobs) and live data on the screen (15 realtime subscriptions). Projects **P11-2** (a step declares its
   constraint) and **P11-3** (a run accounts for every item; memory names its run) need no install and no
   money; **P11-1** (the wire that carries the work) enters the design package and waits on his approval. <!-- OPEN: B22 -->

   **Source 12 (the same board, filmed as a clean screen recording, watched whole on 2026-08-09) turned
   that pulse into a specification.** Because the canvas is pixel-stable, the animation could be measured
   exactly: **one duration per edge — 1.8 s whether the edge is 44 px or 340 px long** — constant speed
   inside it with no easing, **one 2.4 s period for the whole board** with neighbouring wires ≈ 1.2 s out
   of phase, and **≈ 0.5 s of every cycle with the wire empty**, so rest is part of the design. The brain's
   sphere lives by brightness, not motion: **(0, 0) px of displacement over 2.0 s** while 1–2 of its 13–20
   lit vertices change every 0.1 s. Its second mechanism is the **viewport as an actor** — four camera moves
   in 52 s, each landing the stage being spoken about within **0.02–0.44 s** of the sentence naming it.
   **P12-1** is those numbers, filed into P11-1 rather than beside it. **P12-2** — an answer names where it
   lives and the surface travels to it — needs no install and no money for its data half, and it is the
   missing half of complaint **C26**: `api/chat/route.ts` holds **0** references to a page or a route.
   **Measured the same session:** the holding's only 2.4-second heartbeat is `hl-pulse … infinite` on the
   **login page's beacon**; inside the cockpit every perpetual motion is a loading placeholder. Two errors
   in report 11 were corrected at source (the sphere flickers in place rather than turning; one cited
   command was wrong while its number was right).

   **The one thing on this page he should read first — from source 08 (`paperclip`, read at live HEAD
   on 2026-08-08, 75,865 stars, pushed two hours before the reading).** Measured: **nothing in this
   holding binds the act that executes to the text the CEO signed.** A search of every column in the
   database for `signed`, `signature` or `snapshot` returns `workflow_runs.steps_snapshot` and nothing
   else; the approval is one row, the execution is another, and only a foreign key joins them. The
   whole product is *he approves the acts that face outward* — **project P08-1** closes it with a
   signed spec and a target snapshot, needs no download, costs nothing, and waits on his word. <!-- OPEN: B22 -->
   Source 07 lands **P07-1** beside it: every agent run must end in one measured sentence, because
   1,543 of our task events carry **zero** statements of what an agent found.

   **Source 09 (`huwprosser`, watched whole with sound on 2026-08-09) is the second thing he should
   read.** A man says one sentence out loud and **2.8–3.2 seconds later** the machine has drawn a
   live map across his whole screen — measured inside a single unbroken take — and the assistant's
   own mark steps out of the way first. The size of the work that follows from it, measured the same
   session: our voice loop's **median is 32.7 seconds** (hearing 20.1 / thinking 14.8 / speaking 2.6)
   across 102 calls, the
   last of them on 2026-07-28, and the voice surface can render **only text** — a spoken request
   cannot draw anything at all. Projects **P09-1** (the answer lands on the screen) and **P09-2**
   (the 32-second answer) need no install and no money; the design half waits for his design package.

   **Source 10 (`cloud9.markets`, watched whole with sound on 2026-08-09) found the third thing.**
   A rival draws his nine workers as one living screen where the one that is working lights up and
   the centre says its name — and he draws **the permission to act as a diamond sitting on the wire
   between the one who decides and the one who acts.** That is this whole product in one symbol.
   What that makes buildable here, measured to size the work and not to grade the holding: we have 205
   written employees and **not one picture of any of them** — three files in the entire dashboard draw
   a shape, two are a logo and a ring — and our decision record cannot yet learn, because
   **`decision_log` holds 4,730 rows and 3,248 of them (68.7 %) never say what happened.** Project **P10-1** closes that and needs no install; **P10-2** (the desk map) and
   **P10-3** (the gate drawn where it stands) enter the design package and are not built.

   **His live order of 2026-08-09 changed how the whole queue is read, and his correction the same
   evening decided what the reading IS.** He first named the property the author had failed to weigh:
   *"Operating System'i rakip bir canlı organizma gibi çalışıyor yaşayan bir varlık. bu holdigimizdeki
   en önemli özellik olmalı."* — the board's **FIRST LAW OF V2, "IT MUST BE ALIVE" (2026-08-02)**.
   The first repair asked the wrong question, and he struck it out: *"onların hepsi canlı ve gerçek
   zaten… en sondaki nimbus zaten capcanlı yaşayan sistemler. Ekrandaki şeyler canlı mı diye sormanıza
   gerek yok."* **Aliveness is the PREMISE, never the question.** Every source here is a live, running
   system — he knows them first-hand — and a clip is an advertisement, so what a film does not show is
   a limit of the film, never a fact about the rival. **Ledger law 8, rewritten:** read each rival for
   **HOW it is built to live** — what runs on its own clock, what makes the surface breathe, how it
   answers the human and how fast, and **what DXB takes** — because the holding itself is to be built
   as a living organism. A machine check enforces it, proven to bite, and **all nine finished reports
   were rewritten to that reading.** **The order of the work is his too:** *"bizim durumumuz zaten
   daha ferrari kalitesinde bir holding OS sistemi henüz kurulmadı. önce rakipleri inceliyoruz."* —
   our own zero readings are not news and never a grade against a rival; the machine is not built yet.
   The synthesis at the end of this queue is built on that lens. <!-- OPEN: B22 -->

   Sources 07-11 had been reported in the night session of 2026-08-08 and
   **the CEO deleted all five reports the same morning** — his words:
   *"BOZUK OLAN BOKTAN RAPORLAR HEPSİNİ sil. 7 8 9 10 11."* The five rows are back to `fetched` and
   the raw material (videos, audio, frames, zooms, transcripts) is untouched, per his standing ruling
   *"hükümler çöpe, ham malzeme kalsın."* The queue also changed that night on his live order: **row
   06 struck** (*"6 videoyu izleme onu sil"*) and **row 35 added and fetched** (*"34. video olarak
   bunu koy … izle ve raporla sonra"*) — total still 34, row 35 last. Run
   `scripts/rival-intel/next.sh`. Everything else lives in
   `.planning/research/rival-intel/00-LEDGER.md`: the queue, its **seven** laws, and what each source
   cost to learn. Do not repeat it here.

   **Why he burned them, and the rule that replaces it — read this before writing a single word about
   a rival.** The five reports called the distance between DXB and these systems **"legibility"** —
   *they are not really ahead of us, they are only easier to read.* That is the verdict he had already
   burned on 2026-08-01 (*"UNDERESTIMATED MY OPPONENTS TOOOOOOO MUCH"*) wearing a politer word, and it
   was reached by counting our agents, tables and persona files and calling the count a judgement.
   **Ledger law 7, added 2026-08-08, with the tenth test case behind it: a rival is judged by what it
   PRODUCES, never by what it owns.** Every source on this queue runs and earns; DXB has never run end
   to end and `realized_revenue_eur` is 0. On the measure that decides we are behind all of them, and
   any sentence that softens that is deleted on sight.

3. **B28 — the clipping business, and he has decided its shape.** <!-- OPEN: B28 -->
   **The AGENCY seat is approved in his own words** (2026-08-07): *"ajans koltuğunu onaylıyorum…"*
   <!-- CEO-OK: c42-agency-seat-2026-08-07 --> DXB wins brand clients, launches campaigns under its
   own name, keeps and scores a roster, guarantees delivery, keeps the spread — entering through the
   clipper seat, never attempting the marketplace. **His absolute line binds all of it:**
   *"bahislerle asla işimiz yok ÇOK BÜYÜK UYARI SAKIN HEEE UFACIK ŞEKİLDE YAPMAYIN!"* — every
   campaign, every client, every clip, at any size. **Nothing is built: he approved the seat, not a
   start.** Everything about it is in `.planning/research/rival-intel/05-cnn-clipping-business.md` §5.
4. **What is blocked on him, and cannot move without him:** his approval of a visual design package
   before any redesign is built · one hand-minted browser session so authenticated surfaces can be
   checked by eye (B03-bis) · which outside accounts may be connected (W-C42-4) · money for the two
   paid model exams (B06, B09) · the acceptance session itself (B13) · replacing the Gemini key
   after the work, his own ruling *"ben iş bitince değersiz kılıcam"* (B26) · **whether to pursue the
   three document skills he approved but whose licence forbids copying them here (B27) — the
   capability he wanted already works without them, so this is a choice, not a blocker** · **money
   out to clippers once the agency seat starts operating (B28).**
5. **Nothing else starts without a row on the board.** If he gives a new order, it outranks all of
   this (authority order, `.claude/CLAUDE.md` §1) — and it DELETES whatever contradicts it (LAW A).

## Where things live

| Question | File |
|---|---|
| What is the plan? | `HOLDING-OS-MASTER-PLAN/` — the corpus |
| What work remains? | `00-BOARD-OPEN-WORK.md` |
| What was deferred or adapted, and why? | `00-INDEX.md` — the registered-adaptation table |
| What did the CEO order in writing? | `docs/ceo-directives/` |
| How do I do X? | `.claude/skills/dxb-*` — the doors |
| Why was that decided back then? | `.planning/STATE-ARCHIVE.md` and `.planning/_ARCHIVE/` |
