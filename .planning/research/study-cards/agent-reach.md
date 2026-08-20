# Study Card: Agent-Reach — the internet capability router (the agents' eyes)

> **STUB REPLACED WITH A FILLED CARD, 2026-08-19, ON THE CEO'S LIVE ORDER** — *"'agent-reach' 'scrapling' adındaki tooları kur eğer kurulmadıysa"*, and, mid-work, *"proje dosyasına kurabilirsin istersen. genele de kurabilirsin. faydalı bir tool skill"*. **INSTALLED THE SAME SESSION.**

- **Tool:** Agent-Reach — one CLI + one agent skill that routes an agent to 13 platforms (web pages, RSS/Atom, V2EX, GitHub, YouTube, Bilibili, Twitter/X, Reddit, XiaoHongShu, Xiaoyuzhou, Xueqiu, LinkedIn, web search) **without paid platform APIs**.
- **Slug:** agent-reach
- **Category:** Research
- **Status:** **INSTALL** (was STUDY)
- **Target Phase:** 10 — installed early on his live order, and **no channel is gated**: he opened every one of them the same evening (`agent-reach-all-channels-2026-08-19`)
- **Owner (dept/tier):** Research / Social — the zero-config channels are open to every agent; the account-bound channels are CEO-only
- **Trigger Type:** skill (it registers itself as a Claude Code skill) + CLI
- **Source:** https://github.com/Panniantong/Agent-Reach
- **Measured live 2026-08-19 (GitHub API):** **73,067 stars · 6,212 forks · MIT · Python · last push 2026-08-12 · 94 open issues · created 2026-02-24 · 2,088 KB**
- **Pinned Version:** **v1.5.0** (release of 2026-06-11). Installed from the **tag archive**, never from `main`. **sha256 of the archive: `7c3d55c59dfdfce05b85b94800dc6ef6cc46caa8fb93a76eca9822eb66adefb2`**
- **Licence:** **MIT** — LICENSE read from the archive, not inferred; copied to `.claude/skills/agent-reach/LICENSE.txt`
- **Purpose:** This holding's agents could reach the outside world only through Scrapling/Camoufox (raw pages) and Playwright (a browser). Agent-Reach is the **router**: one grammar for reading a YouTube transcript, a GitHub repo, an RSS feed or a web page, so an employee does not invent a fetching method per platform.

## Where it is installed

| What | Where |
|---|---|
| Python package | `/home/dxb/agent-reach-env` — **its own venv, outside the repository**, the same pattern as `~/scrapling-env` |
| Skill (machine-wide) | `/home/dxb/.claude/skills/agent-reach` — written by the installer itself |
| **Skill (this repository)** | **`.claude/skills/agent-reach`** — SKILL.md + `references/` + LICENSE.txt, version-controlled, the `skill-creator` precedent |

## Install command, recorded before it was run (never blind)

```
python3 -m venv /home/dxb/agent-reach-env
/home/dxb/agent-reach-env/bin/pip install <v1.5.0 tag archive, sha256 above>
/home/dxb/agent-reach-env/bin/agent-reach doctor
```

**`browser-cookie3` was left out at first and is now INSTALLED**, on his order of the same evening to open every channel — it reads the local browser's cookie store, which is how the account-bound channels authenticate. The sentence that said no agent may add it is deleted (LAW A). `playwright` and `mcp` are installed with it.

## Static check before installing (the gate, done by hand)

- Archive downloaded from the **tag**, unzipped and read before any install.
- **No `setup.py`** — a declarative `pyproject.toml` only, so **nothing executes at install time**.
- Dependencies are ordinary and few: `requests`, `feedparser`, `python-dotenv`, `loguru`, `pyyaml`, `rich`, `yt-dlp`.
- `grep` for `os.system` / `eval(` / `exec(` / piped-curl across every `.py`: **no hits**.

## Live proof, taken the same minute

At first install, `agent-reach doctor` → 4 of 13. **After his open-everything order, re-measured the same session: 6 of 13 live with no key at all** — **any web page** (Jina Reader) · **RSS/Atom** · **V2EX** · **YouTube** (yt-dlp JS-runtime line written) · **Bilibili** (`bili-cli` installed) · **whole-web semantic search** (mcporter + Exa MCP, free, no API key). **Proven live, not asserted:** a real query through it returned WooCommerce's official MCP announcement — the find now sitting on board row B30.

**Every backend for the remaining six is installed as well** — `twitter-cli` 0.8.5, `rdt-cli` 0.4.2 (pinned commit `5e4fb372`), OpenCLI, the Xiaoyuzhou transcription script, `browser-cookie3`, `playwright`, `mcp`, `mcporter`. **What each still needs is a credential, and only the CEO can supply it:**

| Channel | What it waits for |
|---|---|
| Twitter/X | a login (cookies) |
| Reddit | a login — no anonymous path exists any more (anonymous `.json` blocked, official API needs manual approval) |
| XiaoHongShu | the OpenCLI Chrome extension, one manual click, plus a logged-in Chrome |
| Xueqiu | a Xueqiu login, then `agent-reach configure --from-browser chrome` |
| Xiaoyuzhou | a **free** Groq API key (console.groq.com) |
| LinkedIn | `linkedin-scraper-mcp` + its MCP registration |
| GitHub | `gh auth login` — public reads already work without it |

## Registered adaptations to our copy of the skill

Both were made to `.claude/skills/agent-reach/SKILL.md` and are recorded here rather than done quietly:

1. **The auto-update instruction is removed.** Upstream rule 5 told the agent to fetch and follow `docs/update.md` from a moving branch — a remote document instructing an agent, which is precisely the tool-poisoning / prompt-injection surface `PITFALLS.md` records. Replaced with: the install is **pinned**, `check-update` may be run to report a number, and **nothing fetched is executed or followed**.
2. **The "fetch the install guide" instruction is removed**, and the grant is written explicitly — **EVERY CHANNEL IS OPEN.** The first version of this line held six channels behind his separate approval; **his live order of 2026-08-19 DELETED it (LAW A)**: *"twitter reddit gibi kanallar hayati önemde hepsini aç, bu beceriyi kesinlikle kısıtlama zira en derin bilgileri bulma en iyi araştırma yapma kaynak edinme holdinging en önemli noktası yani istihbarat HERŞEYDEN ÖNEMLİ. doğru ve en iyi bilgi yoksa başarı da yok."* <!-- CEO-OK: agent-reach-all-channels-2026-08-19 --> **What blocks a channel now is a credential, never a policy.**

## Known Pitfalls

1. **ToS exposure is real, and the CEO has weighed it and ruled**: intelligence outranks it for this holding (`agent-reach-all-channels-2026-08-19`). It is recorded here as an exposure the holding is **knowingly** carrying, not as an open question. Reading public pages is not the risk; the account-bound channels carry the account.
2. **`agent-reach read <url>` goes through Jina Reader (`r.jina.ai`), a third-party relay** — the URL and its content pass through someone else's server. **For anything of this holding's own, Scrapling fetches locally and nothing leaves the box.** That split is the rule: Agent-Reach for the open internet, Scrapling for us.
3. Untrusted content by construction — everything it returns is outside material and enters memory at the **quarantine tier** with trust tags (`PITFALLS.md` #7), never as fact.
4. The skill auto-registered itself machine-wide at install; that write happened outside the repository and is recorded here so no later session finds it unexplained.

## Lifecycle Checklist
- [x] STUDY (2026-08-19)
- [x] **INSTALL (2026-08-19 — his live order; pinned v1.5.0, sha256 recorded, live `doctor` proof)**
- [ ] ADOPT — when a DXB code path or a department profile actually consumes it
- [ ] EMBED
