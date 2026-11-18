# Tab k1 — "Kasım 1 incelemeleri" — reader k1-f (rows k1-18, k1-19, k1-20)

All three rows come from one video: "Replace: Suno AI, ChatGPT, Perplexity, Lovable, Manus, Opus Clip & more" (The Next New Thing, Andrew Warner, 6 Oct 2026, 32:30, YouTube `GZtLsvklYBI`, sponsor Zapier). The video lists ten repos; these three are items 2, 3 and 4 of it.

**Common to the three rows — what could not be read.** `$J/src/k1-18.txt`, `k1-19.txt` and `k1-20.txt` are empty (0 bytes). The transcript the 1 Nov readers used (`$J/transcripts/v8-GZtLsvklYBI.txt` of that job) is not on disk any more. `~/.cache/link-watch/` holds only `v8-GZtLsvklYBI.audio.webm`, `.err` and `.lock`, and his order forbids transcribing it again. So the video's own words come only through the two 1 Nov reader reports, which read the transcript whole: `.planning/research/watch-links/2026-11-01-gelir/readers/ses-opus.md` §3 (lines 100-112) and `ses-fable.md` §3 (lines 63-75) and §7. Every repository fact below was measured again today (2026-11-18) with `gh api`.

**His note (the same on all three rows, written for the whole video):** "Bizde Voicebox var galiba. Çok güçlü değil galiba. … Open Resource Repo kaynakları olarak bizim holdingde de bir bak bunlarla ilgili bir şeyler yapılmış mı?" For each row the answer to "has the holding already done something about this?" is given under "What we have".

**Twins:** none. `$J/twins.tsv` has no k1-18/19/20 entry. `2026-11-16-whatsapp/plan.jsonl` and `recheck/*.md` do not mention Odysseus, FreeLLMAPI, Perplexica or ItzCrazyKns (grep -l, 0 files).

---

## k1-18 (ses-odysseus) — Odysseus: a self-hosted personal AI workspace (chat, agents, deep research, documents, email, notes, calendar, local-model "Cookbook")

- **Opened:**
  - `gh api repos/odysseus-dev/odysseus`, its README (whole) and the file tree of the `dev` branch.
  - At source: `services/hwfit/data/README.md`, `services/hwfit/fit.py` (head plus the function list), `services/tts/tts_service.py` (grep), `routes/compare/compare_routes.py` (grep), `services/memory/skill_extractor.py` (head), and two built-in skills (`resources/skills/agent/verified-state-change`, `artifact-completion`).
  - The 1 Nov readers' §3 lines.
  - The transcript is not on disk (see the top).
- **His note:** as above.
- **What is in it:**
  - The repo: `odysseus-dev/odysseus`, "Self-hosted AI workspace". 95,787★, AGPL-3.0. Created 2026-05-31, pushed 2026-11-18, default branch `dev`. 1,587 open issues, and the newest three releases all came out on 2026-11-17 (v0.16.32-34), so the release line moves fast and is fragile. Docker, port 7011.
  - Features:
    - chat plus agents (local or API models, MCP, shell, skills, memory);
    - **Cookbook**: hardware-aware model recommendation, download and serving;
    - Deep Research;
    - **Compare**: blind side-by-side model testing;
    - a documents editor;
    - an IMAP/SMTP email triage inbox;
    - notes, tasks and CalDAV calendar;
    - an image gallery;
    - Claude Code and Codex integrations (`integrations/claude/skills/odysseus`).
  - In the video the presenter himself says it is "not as good as ChatGPT" (05:28, per ses-fable §7). He also says PewDiePie made it, but the repo and the org do not carry that name, so it stays a claim.
  - Its voice is **Kokoro-82M** locally or any OpenAI-compatible `/audio/speech` endpoint (`tts_service.py:2,37`). Kokoro has no Turkish.
  - The Cookbook is `services/hwfit/`: a GPU memory-bandwidth table (it carries "5060 ti": 448 GB/s, our card) and per-quant speed and quality penalties. It also has per-use-case weights (general, coding, chat, embedding, tts, stt…), plus `_estimate_speed` (MoE-aware, active parameters), `_try_quant_at` (fits a quant at a given context into VRAM and RAM) and `rank_models(system, use_case, fit_only)`. The model catalogue ships empty and is fetched from Hugging Face at runtime (`hwfit/data/README.md`).
  - Compare runs blind: random left/right and the model identities withheld (`compare_routes.py:64-105, 223`).
  - `skill_extractor.py` turns any run of 2 or more rounds or tool calls into a candidate skill. Its prompt is conservative ("return null unless a reusable computer procedure"), the confidence floor is 0.6, and private identifiers are replaced.
- **What we have:**
  - **Workspace:** Odysseus is not installed anywhere. It is not in STACK, the board rows, `~/tools`, `~/.local/bin` or `~/.local/share/dxb/tools`; the inventory `$J/inv/k1.tsv` agrees. For the workspace itself we have Hamza, the dashboard and Claude Code, which STACK holds as the one agent framework (no second agent framework).
  - **Voice (his note):** the holding is already ahead of Odysseus. Voicebox 0.5.0 (`/home/dxb/voicebox/voicebox-main`) has Chatterbox Multilingual, which speaks Turkish. Odysseus only has Kokoro, without Turkish (ses-opus §2).
  - **Skill extraction:** Hermes already does this. `~/.hermes/hermes-agent`'s README says "Autonomous skill creation after complex tasks", `~/.hermes/config.yaml` has `skills.creation_nudge_interval: 15`, and `~/.hermes/skills/` holds 14 categories.
  - **Blind compare:** we have the method. The blind judge with a lead-only label map is in `.planning/quick/20261015-arama-testi/evidence/judge.md` and `MAPPING-lead-only.txt`.
  - **Hardware-fit estimator:** not found. B34's candidates were picked by hand and measured after download (`.planning/board-rows/B34.md:16`).
- **What it has that we do not:** one part, the Cookbook's fit estimator. It would tell, before anything is downloaded, whether a model at a given quant and context fits the 16 GB card and at roughly what tokens per second. Nothing else was found: the chat, research, mail and notes have counterparts in our core, Hermes already learns skills, and our blind judge does what Compare does.
- **Board:**
  - **Cookbook fit estimator (`services/hwfit/fit.py`)** — row **B34** (the local worker model's exam), second row **B33** (the bench: what fits beside the floor).
    - What stands there now: nothing. Candidates are named by hand and measured after download (Gemma 4 E4B 3,308 MB, Qwen3.8-27B 13,234 MB / ~20 tok/s, Ternary Bonsai 2 added 2026-11-17).
    - Relation: `new` (a part or method taken out of the project, not the workspace).
    - How it is used: a pre-filter step in the exam. Every candidate first gets an estimated footprint and speed on the RTX 5060 Ti at the quant and context the job needs, and only candidates that leave room for B33's floor (ear and mouth) are downloaded.
    - First trial: run `rank_models` / `analyze_model` offline against the B34 candidates whose real numbers we already measured (Gemma 4 E4B, Qwen3.8-27B IQ4_XS, gpt-oss-20b). If the estimate lands within about 20 % of the measured MB and tok/s, it becomes the exam's pre-filter. If not, it is dropped.
    - What stops at the CEO: nothing (no money; the code is read and run locally inside the row's build).
  - **The workspace itself** — no row. The nearest is B22 (the rival queue, watching only). Relation `none`: it would be a second chat and agent workspace beside our core.
- **The old verdict and reason:** partly holds. "Gerek yok" is right for the workspace. But "Teknoloji 0, no contribution" missed the one part worth taking, the hardware-fit estimator. The 1 Nov Fable reader had already pointed the Cookbook idea at B34 (ses-fable.md:67), and the old row dropped it.
- **Reader's first reading:** Gerek yok (the workspace) · Yöntem (the fit estimator into B34's exam).

---

## k1-19 (ses-freellmapi) — FreeLLMAPI: a router that stacks the free tiers of 87 providers behind one OpenAI/Anthropic-compatible endpoint and fails over when a cap is reached

- **Opened:**
  - `gh api repos/tashfeenahmed/freellmapi`, its README whole (532 lines), and `docs/en/clients/01-agent-clients.md` §"Context Handoff" (line 527 on).
  - Our files: `.planning/research/study-cards/freellmapi-9router.md`, `STACK.md` (lines 26, 69, 112, 126, 127), the board lines of B51, B66 and B08, `B08.md`, and the 2026-10-08 row W020 and the 2026-10-14 88-link batch-2 line 103.
  - The transcript is not on disk.
- **His note:** as above.
- **What is in it:**
  - The repo: `tashfeenahmed/freellmapi`, MIT. 54,241★ (45,501 on 1 Nov). Pushed 2026-11-17, created 2026-04-21, 50 open issues. Today it claims 87 providers and 1,313 free endpoints, about 10.1 B tokens a month.
  - One `/v1` endpoint covering chat, responses, embeddings, images, video, speech and transcription, plus the Anthropic `/v1/messages` format, so Claude Code can be pointed at it.
  - Routing: six strategies, per-key RPM/RPD/TPM/TPD counters that learn each provider's ceilings, cooldown and key rotation on 429/5xx, and named fallback-chain profiles (`auto:<profile>`).
  - "Fusion": a panel of free models answers and a judge model merges the answers.
  - Opt-in prompt compression, an `X-Routed-Via` header on every response, and an MCP server.
  - **Context handoff:** when it switches model mid-conversation it adds one compact system message. The message says "You are taking over an ongoing conversation from another model (A → B) … Do not restart the task, re-ask already answered setup questions, or discard prior tool results," followed by a short recent-session summary.
  - A signed catalogue updates itself. Premium costs $19/yr or $49 once and gives the live feed; free installs get the catalogue 30 days later.
  - Its own words: "no frontier models … the effective intelligence of the endpoint dips late in the day" and "personal experimentation and learning, not production."
- **What we have:**
  - Gateway: the LiteLLM proxy in front of OpenRouter, NVIDIA Build and Vercel AI Gateway, with per-department virtual keys and budget hard-stops (`STACK.md:26, 69`).
  - **STACK.md:126 names "free-tier-stacking routers" among the excluded tools** (a locked decision: "ToS"). The study card `study-cards/freellmapi-9router.md` is an empty STUB ("Legitimacy Verdict: TBD", owner line "ToS gray zones — use clean parts only").
  - It was judged twice before: W020 (2026-10-08, 9Router and Fusion) and the 88-link turn of 2026-10-14 (batch-2:103).
  - B51 move 6 deleted the dead council's code (`B51.md:39`, 2026-10-09). That council is the same panel-plus-judge idea as Fusion.
  - On B66 his word stands: a full quota is never answered by a weaker model but by an alert and a spare subscription (board line 144).
  - Nothing in `B08.md` covers carrying context when the brain switches (grep for handoff/context/carry: 0).
- **What it has that we do not:**
  - (a) The context-handoff note: a tested, minimal prompt for the moment one model takes over another's conversation.
  - (b) A maintained public catalogue of free endpoints with their rate limits and context windows (freellmapi.co/models). It could be a data source for the free drawer of the armoury.
  - The router itself does nothing our LiteLLM cannot do for the work we route. Its only extra is weaker free models, which his B66 word rules out for valuable work.
- **Board:**
  - **Context handoff note** — row **B08** (the per-employee brain switch: Hamza Opus 5 ⇄ Fable 5.1). Second row **B66** / B64 decision 13 (the backup pair: when a quota is full and work moves to the spare subscription mid-task).
    - What stands there now: nothing. B08's steps (1)-(7) do not cover what the new brain is told.
    - Relation: `method`.
    - How it is used: the brain-change function (B08 step 4) and the succession to the spare subscription add one system note saying who handed over, what not to restart or re-ask, and that the latest message is the highest-priority instruction, with a short summary of the session.
    - First trial: on the construction copy, 10 recorded multi-turn Hamza conversations are switched Opus → Fable at turn N, once with the note and once without. Count restarted tasks, re-asked questions and dropped tool results. The note stays if it lowers them.
    - What stops at the CEO: nothing for the trial. B08's steps themselves wait for his plan approval (board line 97).
  - **Free-endpoint catalogue as data** — row **B31** (the armoury: free ones beside paid ones), second **B42** (the world watch).
    - What stands there now: one filled drawer (web). The model drawers have no free-tier list.
    - Relation: `method` (a data source, nothing installed).
    - How it is used: when the armoury's model drawer is built, the free tier of each provider (limits, context) is read from that public catalogue and checked at the provider's own page.
    - First trial: take the ten providers we already use or could use (OpenRouter, NVIDIA, Google, Groq, Cerebras…), compare the catalogue's numbers with each provider's own page, and keep the catalogue as a source if they match.
    - What stops at the CEO: nothing (reading only; Premium at $19/yr would be money out and is not needed).
  - **The router itself** — B51 / B66. What stands there now: LiteLLM plus OpenRouter. Relation `none`, because of his B66 word and STACK:126.
  - **Fusion** — B51. Relation `none`: it is the council that B51 move 6 deleted. It is not brought back without his word.
- **The old verdict and reason:** partly holds.
  - "Gerek yok" holds for the router: his B66 word ("a full quota is never answered by a weaker model") and the locked STACK exclusion decide it.
  - The old reason "ToS gray, free tiers may train on company data" leans on ToS, which the brief says is not to be written as a blocker. The data point stands as an engineering fact: free tiers can keep and train on inputs, so client data would not go there.
  - The old row missed the context-handoff method.
- **Reader's first reading:** Gerek yok (the router) · Yöntem (the context-handoff note into B08; the free catalogue as armoury data).

---

## k1-20 (ses-vane) — Vane (ItzCrazyKns, formerly Perplexica): a self-hosted cited-answer engine over SearxNG plus a local or API model. **Already tested on his order and not taken.**

- **Opened:**
  - `gh api repos/ItzCrazyKns/Vane`, its releases, its last 3 commits, and the README (12,956 bytes; the headings and the Features section read).
  - Our files:
    - `.planning/quick/20261014-tahta-sirasi/HIS-WORDS-2026-10-15.md:92-119`;
    - `.planning/quick/20261015-arama-testi/evidence/judge.md` and `arm-vane.md`;
    - `scripts/governance/ceo-approvals.json:2518-2525`;
    - `.planning/research/RESEARCH-ENGINE-2026.md:836, 1186`;
    - the 1 Nov readers' §3 lines.
  - The transcript is not on disk.
- **His note:** as above.
- **What is in it:**
  - The repo: `ItzCrazyKns/Vane`, MIT. 38,240★. **Last push 2026-09-01, and that commit is "Update README.md"; the last code commit is 2026-04-11.** The last release is v1.12.2 (2026-04-10), and there are 384 open issues.
  - Features (README §Features): any provider or Ollama; Speed, Balanced and Quality modes; web, discussion or academic sources; SearxNG search ("Tavily and Exa coming soon"); image and video search; file Q&A; domain-limited search; a Discover feed; local history.
  - Known open security issues: #1155 / #1180, "Unauthenticated API Key Leak via GET /api/config + Arbitrary Config Overwrite + SSRF" (RESEARCH-ENGINE-2026.md:1186). Bound to 127.0.0.1 they are harmless (HIS-WORDS:98).
  - In the video the presenter says it is "not as strong as Perplexity" (11:19, per ses-fable §7).
- **What we have:**
  - **It was tested on his order of 2026-10-15** ("Öncelikle tabii ki bunu bir test edin … research tarafına entegre olabilir mi").
  - The test was blind, five questions and four arms (judge.md). Combined Claude web plus our toolbox scored 23/25, Claude web 21, our toolbox 21, **Vane 7/25, the slowest at 648 s**. Vane gave German tourism pages for an Istanbul price and said the Apify price was "not stated" when the page states it. Its bundled SearxNG got 0 results from Google, DuckDuckGo, Brave, Startpage and Qwant from this IP.
  - **His yes is registered:** `ceo-approvals.json` key `research-claude-web-and-toolbox-together-2026-10-15`, "Vane (ItzCrazyKns/Vane) is not taken", his words "Önerini kabul ediyorum."
  - The research door (`.claude/skills/dxb-research/`) holds the rule that came out of that test: Claude web and the toolbox on every search, numbers cross-checked. The door does not mention Vane, which is correct.
- **What it has that we do not:** nothing found. One caveat for the record: the 15 Oct test ran Vane on the local Ollama qwen3.8-27b, because the LiteLLM gateway answered HTTP 402 (no credit), and its search backend was blocked. So the 7/25 measures Vane as it can run on this machine, not Vane on a frontier model. It does not reopen the question: the repo has had no code commit since 2026-04-11, and our combined road scored 23/25.
- **Board:** the subject is owned by the research door (`dxb-research`, rule registered 2026-10-15). Second rows are B30 (the hands and eyes) and B69 (research tasks cannot finish).
  - What stands there now: Claude WebSearch/WebFetch plus the toolbox (agent-reach `~/.local/bin/agent-reach`, scrapling `~/.claude/skills/scrapling`, `scripts/maps.py`, camofox `~/tools/camofox-browser`).
  - Relation: `none`. The thing was tried beside ours, lost 7 to 23, and his word closed it.
  - How it is used: not used. First trial: done on 2026-10-15. What stops at the CEO: nothing (his decision is already given).
- **The old verdict and reason:** does not hold. The old row says "Dene — the 15 Oct test order is waiting" and "Plan: the comparison test is inside that order". The test was run on 2026-10-15, and his yes to "Vane not taken" is registered the same day. The 1 Nov Fable reader (ses-fable.md:69, :92) missed that record too.
- **Reader's first reading:** Gerek yok. It was tested and not taken by his registered word; the reason is a measurement, not "we have something like it".
