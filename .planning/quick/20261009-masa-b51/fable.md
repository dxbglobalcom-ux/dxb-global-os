# Fable half — (1) brains that are not fixed: model succession · (4) Hamza's level

Author: dxb-global-os-26 (Fable 5.1). Measured 2026-10-09 20:50–21:00 against the repository and the
company engine (54322, SELECT only). Cross-read by Opus in `itiraz-opus.md`.

## His words for this half (verbatim, 2026-10-09 20:46)

- *"b51 paket 3. llm modelleri sürekli değişiyor opus 5 ti veya fable 5 ti şimdi opus 5.5 sonnet 5.5 ve
  fable 5.1 falan çıktı yani holdingteki beyinler sabit kalmamalı iptal oluyor bazen yenisi geliyor."*
- *"modeller sürekli güncellendiği için holdingin sistemi de çalışanların modelleri de aslında buna göre
  yapılandırılmalıydı yani birini beyni opus 4.8 ise, ooooo.... şuan opus 5.5 teyiz yani."*
- *"ben hamzayı holdingte CEO veya tüm holdingin orkestratörü sandım ondan yüksek seviye istedim ama
  makulu, bu projedeki digital holdingte sizce hangi seviyede olmalı sizler ölçüp karar vermelisiniz. ben
  onu işleri dağıtan herşeyi kontrol eden kişi sandım ondan. ama o sadece hükümet sözcüsü galiba."*
- Desktop `Bazı notlar.txt` (2026-10-09 09:30), item 7: *"Hamza ve 213 personanın düzeltmeleri hazır ama
  uygulanmadı. Çalışanların Opus 5.5'e geçişine bağlılar (tahtadaki B51 kararı) … repitetive tasklarda
  kullanılacak haiku 5.5"*.

## (1) Where a brain is written today — five places, none of them one

| Place | What it holds | Measured |
|---|---|---|
| `packages/kernel/src/classify.ts:45-54` `SDK_MODEL_IDS` | internal id → the API id the Agent SDK is called with | `fable-5`→`claude-opus-5` · `fable-5.1`→`claude-fable-5-1` · `opus-5`→`claude-opus-5` · `opus-4.8`→`claude-opus-5` · `sonnet-5`→`claude-sonnet-5`. Hardcoded; the catalogue does not know the API id. |
| `model_catalog` (14 rows) | status, display name, tier floor, fallback, price | Active Anthropic rows: `fable-5` (display **Claude Opus 5**, L1) · `fable-5.1` (L1) · `claude-sonnet-5` (L2). **No row for Opus 5.5, Sonnet 5.5 or Haiku 5.5.** `cost_in/out_per_mtok` NULL on every Anthropic row (B51's "no model carries a price"). |
| `routing_rules` (39 rows) | the model and effort per task class | L1: `fable-5` ×28, `fable-5.1` ×1 (`media.creative`) · L2–L4: `sonnet-5` ×10. Efforts: 11 `slot.*` at medium (`slot.critical_decision` included), `voice.answer` low, `chat.answer` high, `chat.strategy`/`strategy`/`architecture`/`final-approval` max. |
| `agents.brain` (213 rows, all `dormant`) | each employee's brain | `claude-sonnet-5` 166 (slot) · `fable-5` 23 (slot) + 10 (ceo_override) · `fable-5.1` 14 (slot). 0 on Opus 4.8. Persona files carry no model (§4b, by design) — but Hamza's SİCİL field 8 still says the literal `glm-5.2` (`personas/ceo/agents-orchestrator.md:18`), a stale copy. |
| `packages/kernel/policy/routing-seed.json` | the seed mirror of the rules | regenerated from the live table by the §4e rule. |

The holding reaches the models through the Claude Agent SDK only (`query({... model: SDK_MODEL_IDS[r.model]
})` at `voice/answer.ts:126`, `orchestrator/qa.ts:87`, `chat-drain.ts:130`, `decompose.ts:117`; effort from the
routing row at `worker-shim.ts:383`). No `messages.create`, no `thinking`/`tool_choice` shapes in our code — a
generation change passes only a model id and an effort.

**So "Opus 5 → Opus 5.5" today means:** one map line in code, a catalogue row, 28 routing rows, 33 brains, the
seed, and the tests that pin them (`tests/c9/brain-floor.test.ts`, 14 cases). Five places edited by hand is
exactly what he described: the brain stays wherever the last session left it.

**Already ruled, and binding on the design:**
- B08 (open, parked until its turn — his order 2026-09-13 *"zamanı gelince yapılsın"*; its turn came today):
  the top tier is a SET, new models addable from the dashboard, every brain switchable by him or by Hamza,
  *"the director and the screenwriter always on the smartest model of the day"* — a policy that follows the
  day, which is the whole point.
- B42 (open, his order 2026-08-27, *"abartmadan, balanced, ölçülü"*): our versions with a last-checked date ·
  Hamza tells him one line when something we use is surpassed, **silent otherwise**.
- B55 (closed 2026-10-01 on his word *"11- tamamen kaldır"*): the old model watch — a timer scraping Anthropic's
  pages twice a week and a line at the top of every opening — is GONE (LAW A). It is not brought back in that
  shape; what follows is catalogue-driven succession, reported only through B42's one line.
- MODEL_ROUTING_SPEC §4c already defines adding a model (register `testing` → smoke test → eval → activate +
  bind); §4d the tier law (L1 judgement/human-visible, L2 mechanical code, L3 grunt text, L4 clerical); §4f the
  brain floor. None of them defines **succession** — a model retiring and its seats moving to its successor.

## (1) Proposal — model succession (nesil değişimi), registered as §4g of MODEL_ROUTING_SPEC, built under B08

1. **The catalogue becomes the one place.** New columns on `model_catalog`: `api_model_id` (what the SDK is
   called with), `family` (opus / sonnet / haiku / fable / gpt / local), `succeeds` (predecessor id),
   `released_at`, `last_checked_at`. `SDK_MODEL_IDS` is deleted from code; the kernel reads the catalogue
   (cached, invalidated by the same settings Broadcast §4b uses). Labels already come from the catalogue
   (`apps/dashboard/src/lib/model-names.ts`), so every screen follows by itself.
2. **One door: `fn_succeed_model(old_id, new_id, rationale, actor)`.** Validates the successor (active, not
   banned, `tier_floor` at least the old one's); rewrites `routing_rules.model` old → new on every row;
   rewrites `agents.brain` old → new where `brain_source='slot'`, and also the `ceo_override` rows of that
   family — listed in the one line to him, undone with one click; sets the old row `status='retired'` (never
   deleted, never banned by succession) and the fallback chain; one `audit_log` + `decision_log`
   (`routing_change`) + Broadcast; the seed regenerated. Direct table UPDATE stays an offence (§4b).
3. **Who pulls the door.** (a) He does — the `/ai/models` drawer gets "Halef yap" beside "Model Ekle"; and by
   telling Hamza (B08 step 5, the brain tool: *"Hamza, Opus'u 5.5'e geçir"*). (b) The watch, B42 leg 1, as a
   weekly job on the resident scheduler: `GET /v1/models` with the holding's key (exact, no page scraping),
   diffed against the catalogue. A new member of a family we use → catalogue row `status='testing'`, the §4c
   smoke test runs by itself, and **one line through Hamza**: *"Anthropic yeni Opus çıkardı: 5.6 — 56
   koltuğumuz 5.5'te, fiyat aynı. Halef yapayım mı?"* An id that disappears while a seat still names it → the
   same line, marked urgent. Nothing new → silence.
   **Policy, my recommendation:** L1 and L2 seats succeed on his one word; L3/L4 (mechanical) seats succeed
   by themselves after the smoke test, under the §4b seven-day watch, told in the same line. Alternative: his
   word for every tier — simpler, one more thing on him.
4. **The first succession is the update he asked for** (his note, item 7): Opus 5 → **Opus 5.5** (28 rules +
   33 brains, Hamza's included), Sonnet 5 → **Sonnet 5.5** (10 rules + 166 brains), Fable 5.1 stays the top of
   the day. Prices written for every Anthropic row from the official table (cached 2026-10-06 — verified live
   at build): Opus 5.5 $4/$20 · Sonnet 5.5 $2/$10 · Haiku 5.5 $0.10/$0.50 · Fable 5.1 $10/$50 · Opus 5 $5/$25
   — B51 move 2's missing input. Opus 5.5 is cheaper than Opus 5 at the same tier; Sonnet 5.5's effort
   levels are recalibrated, so the ten L2–L4 rows get one effort sweep on a 20-task sample before the switch.
5. **Haiku 5.5 — a conflict to name, his word decides:** B51's row (2026-09-21) says *"Haiku never returns
   (already the law, §4d)"*; MODEL_ROUTING_SPEC R2 says Haiku only for mechanical fetch-and-carry
   (`mechanical_only`); his note of 2026-10-09 09:30 says *"repitetive tasklarda kullanılacak haiku 5.5"*.
   Recommendation: Haiku 5.5 enters as `testing`, `mechanical_only`, L4 only (classify · extract · transcribe
   · subtitle · summarize — the seats Sonnet serves at `low` today, at a twentieth of the price), never a
   verdict; if he says yes, B51's "never returns" sentence is deleted (LAW A), §4d's roster line adapted.
6. **Verification:** `tests/c9/model-succession.test.ts` written first (red): one succession on the
   construction engine moves N rules + M brains, retires the old row, writes audit + decision, handles
   `ceo_override` as specified, and the kernel resolves the API id from the catalogue; `tests/c9/brain-floor`
   (14) and the routing tests stay green; Sol at `xhigh` (database + agents).

Cost of the design: one migration, one function, one scheduler job, one drawer button, one Hamza tool
(shared with B08 step 5), and the deletion of a hardcoded map. What it buys him: the day Opus 5.6 ships, the
holding knows it before he does, and moving 56 seats is one word.

## (4) Hamza — what he is today, measured

| | Measured |
|---|---|
| Company DB | slug `agents-orchestrator`, title **Holding Orchestrator**, department `ceo`, role `worker`, `role_level='orchestrator'` (the only one; 22 director · 27 senior_specialist · 163 specialist), `autonomy_level 0`, brain `fable-5` via slot (= Opus 5), status `dormant` — like all 213. |
| Persona (`personas/ceo/agents-orchestrator.md`, 202 lines) | "Holding Orkestratörü — Hamza"; method *anla→böl→eşle→dağıt→izle→doğrula→raporla*; dispatch mechanics (pg-boss, idempotency, budget check before dispatch). It promises the man who distributes and controls. |
| His hands | `packages/voice/src/answer.ts:138` **`tools: []`** — still true today; the 2026-08-01 ruling *"the man you talk to is the man who acts"* stands unbuilt. |
| His spine | the dispatch machine exists beside him: voice intake writes an `intents` row (`intake.ts:183`) → `orchestrator/intent-intake.ts` → `dispatch.ts` (classify → decompose → dispatch) under `dxb-scheduler`; B40 proved it end to end on 2026-08-27 (6 tasks, 5 departments). The **chat** line (`chat-drain.ts`) never calls intent-intake (its imports: mute, persona, recall, effort, prompt — no intake). |
| His effort | `voice.answer` **low** · `chat.answer` high · `chat.brief` medium · `chat.strategy` max · `orchestration`/`decompose` high · `slot.critical_decision` medium. |
| The line | no task created in the company since 2026-09-05 (Opus's measure); his own frame of 2026-08-25: *"ŞİRKET HENÜZ KURULMADI"*. |

**So today he is neither.** Not the orchestrator his title and persona promise (no hands, the chat line not
wired to the machine), and not merely a spokesman either (the machine that distributes exists and ran). He is
a voice without hands standing next to a machine nobody feeds.

## (4) Proposal — his level, our decision for his word

- **Organisational level: Genel Müdür.** The one door of the company — receives the CEO's intent, has hands
  (the orchestrator's chain becomes his tool: intent → tasks → departments → results back into the same
  conversation), controls (QA and gate results return to him), reports (the briefing). Not CEO — the CEO is
  the only human authority; money out, contracts, ad spend and identity steps still stop at him. Not a
  spokesman. This is his own 2026-08-01 ruling, unbuilt; the level needs no new decision, it needs the hands.
  The first leg, inside B51's build, is small: the chat line calls intent-intake like the voice line does; the
  brain tool (B08 step 5) and the read tools go into `tools`.
- **Model and effort — the "makul yüksek" level, my recommendation:** his conversation seats (`chat.answer`,
  `chat.brief`, `voice.answer`) on the current Opus (Opus 5.5, $4/$20) — `chat.answer` high, `chat.brief`
  medium, `voice.answer` raised low → medium (low was set for latency; the GM's spoken answer is worth the
  second); his decision seats (`chat.strategy`, `strategy`, `final-approval`, `architecture`,
  `slot.critical_decision`) on the smartest model of the day (Fable 5.1, $10/$50) at `xhigh` — move 3's own
  line, critical_decision medium → xhigh. His one-click Opus ⇄ Fable switch (B08 step 3) stays his.
  Alternative: all of Hamza on Fable 5.1 at xhigh — simplest, about 2.5× the price of a 7/24 talker; not
  recommended.
- **Two small corrections inside the same job:** the persona's SİCİL field 8 stops naming a model (it already
  says the DB is the source); `role` `worker` → `general_manager` on his row, so the org tree reads what he is.

## Answers to Opus's cross-read questions

1. R6 at the commit **and** in the battery: the commit bites at a job's end; the battery catches a session
   that never staged STATE. Both are one `git log` each.
2. The board row line is the truth and R6 watches it alone; the note command writes the same dated one-liner
   into the row's file too, and each file opens with one line saying it is history. No guard on prose.
3. The gate proof belongs inside this job: move 6 deletes the dead council, so the live gate must be shown
   working in the same commit — one `strategy` task through `worker-shim` on the construction engine is also
   the first proof that the chain is alive, which my Hamza leg needs anyway.
