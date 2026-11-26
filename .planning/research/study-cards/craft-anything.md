# Study Card: Craft Anything (study a site, app or game, then have a coding agent rebuild it)

> FILLED 2026-11-26 — on the CEO's word to have it analysed, prepared for the holding and the construction, installed on demand only, and compared with REA. Analysed, run and installed the same day by an Opus 5.5 engineer; the full Study → Build → Check rebuild loop was NOT run (see "Not done").

- **Tool:** Craft Anything — a desktop app (egui), a CLI and an MCP server over one pure-Rust reverse-engineering engine; on this machine, the `craft-anything-cli` command
- **Slug:** craft-anything
- **Category:** Web Studio / reverse engineering / the construction's tools
- **Status:** INSTALLED on the shelf (on demand, never at opening) for the construction's sessions, 2026-11-26 · not in the holding's own agents
- **Board rows:** B84 (Web Studio — capture a client's or a reference site, compare a rebuild with the original) · B41 (the shelf; REA to every employee — this sits beside REA, it does not replace it)
- **Source:** https://github.com/storytold/craft-anything — MIT OR Apache-2.0 (the ArtCraft name and logos are trademarks, not licensed) · release v0.6.1 (2026-11-12) · source read at `main` `3e59a9c3` (2026-11-26)
- **Where:** binaries `~/.local/share/dxb/tools/craft-anything-0.6.1/bin/` · command `~/.local/bin/craft-anything-cli` · shelf skill `~/.local/share/dxb/skills/craft-anything/` (SKILL.md, INSTALL_PROVENANCE.txt, references/upstream-skill.md, references/mcpdrive.py) · settings `~/.config/craft-anything/config.toml`

## Measured facts (2026-11-26)

| Fact | Value |
|---|---|
| Owner | `storytold` — the ArtCraft team, an organisation (85 repos, ~73.7k followers); it ships a "Craft" suite (PhotoCraft, FilmCraft, FigCraft …), Craft Anything is one |
| Age and pull | created 2026-10-31; 44,089 stars, 8,714 forks, 475 open issues in 26 days; last push the day of reading |
| Size | 1,447 files, ~421k lines of Rust; 7 releases v0.1.0 → v0.6.1 in 12 days |
| Status | "early alpha", its own words. Its tool-status page marks many tools Unverified (Android device 23, Frida 9, runtime 5) |
| Tools | 324 tools in 16 toolsets (`craft-anything-cli commands`): native 55, formats 45, core 37, projects 29, phone 24, websites 22, engines 20, comparing-and-rebuilding 17, Apple 14, Android 14, running programs 14, JS/Electron 11, Frida 9, Java 6, building 6, databases 1 |
| Network | no telemetry found in the code; the GUI checks GitHub for updates and never installs without a click; the CLI makes no call of its own |
| Download | release tarball's SHA-256 `83ec0730…f704` matches the release's SHA256SUMS.txt |

The pitch: point it at a target, say what you want; it **studies** the original (real inspection tools), has a coding agent **build** a new project, **checks** the build against the original (pages at three widths, pixel and layout similarity) and refines it. Building runs our own `claude` program headless (`claude -p … --output-format stream-json`, its own MCP server for tools, `--permission-prompt-tool` for approvals), on the user's own sign-in and quota. Two modes: **Clean room** (default — only what a visitor sees; tools that look inside are refused) and **Deep** (reads code, files, page source; Ghidra when installed).

## What it really did here

| Test | Result |
|---|---|
| `triage` on this machine's `/usr/bin/ls` (Clean room) | refused with `clean_room` and the remedy — as documented |
| `--deep triage` on the same | 0.07 s: ELF x86-64, stripped, toolchain hint "Rust" — **correct** (Ubuntu 26.04's `ls` is uutils, Rust) |
| Decompile a small C licence check (`check_license`: length 12, `-` at 4, `checksum % 9973 == 4242`), built-in decompiler | 0.01 s, structured pseudo-C, but register-level: the `% 9973` appears as a magic multiply and the final `== 4242` is lost behind `__asm("sete al")` |
| Same, Deep mode with our Ghidra 12.1.4 | 7.4 s: `% 0x26f5` and `== 0x1092` recovered — **identical, line for line, to REA's `rea decompile` (7.1 s)**; both front the same Ghidra |
| `web_site_open` + `web_site_capture` on example.com and berkshirehathaway.com (MCP, one process) | ~6 s: screenshots at 1440/768/390, `capture.json` with fonts, sizes, colours, spacing, layout per width, outline, links; screenshots checked by eye and correct |
| `web_pixels_compare --common-area` (1440 vs 768 of the same site) | layout 75 % alike, detail (SSIM) 58 %, changed box — works as described |
| `doctor` on the installed copy | `healthy`; Ghidra and its JDK found; Chrome found; MCP self-test 30 tools |
| `native_source_folder_write` in Deep mode (v0.6.1) | used the built-in decompiler and said so in its limitation ("Deep mode's Ghidra isn't used here"), though the tool's description says it prefers Ghidra — fixed on `main`, not yet released |

## Craft Anything and REA side by side

REA = `reverse-engineer-anything` (morluto/rea, MIT, npm `rea-agents` 6.7.0, ~480k stars), installed 2026-10-21, on the same shelf.

| | REA | Craft Anything |
|---|---|---|
| What it is | an analysis instrument for an agent: evidence-backed answers about shipped software | the same kind of instrument **plus** a build loop: study → have Claude Code build → compare → refine |
| Maturity | v6.7, many engines verified | v0.6.1 alpha, many tools unverified |
| Native decompile | Ghidra, Hopper, IDA, Kuna; Rizin, GDB | its own Rust decompiler (works with nothing installed, weaker) and Ghidra in Deep mode (same output as REA) |
| Breadth of analysis | wider: Android via JADX MCP, PCAP/qlog/HAR/SAZ, sigrok signals, WASM via WABT, EVM bytecode, SQLite, recorded crashes, native UI scenarios | wide too (324 tools, Apple, Android, .NET, Java, firmware, Frida, adb), much of it unverified |
| Websites | brings-your-own browser over CDP; bundle analysis, screenshots, scenarios | launches its own private headless Chrome; **one call captures a site for rebuilding** — design tokens, breakpoints, layout per width; pixel/layout/SSIM compare of rebuild vs original |
| Building | none — the agent builds with its normal tools; REA gives a reconstruction ledger and coverage check | **drives the build itself** (Claude Code headless, approval cards, rounds, "how alike") |
| Guardrail | scope and consent per tool | the same plus Clean room as a product rule (not an OS sandbox — its own words) |
| Interface | CLI, MCP, skill | CLI, MCP, skill, **desktop GUI** for a non-engineer |

The two are visibly of one family: Craft Anything's evidence record (id, confidence, coverage, limitations), its "connect only when needed / summary first / never repeat a call" skill text and its rebuild-ledger and coverage tools follow REA's design.

**Is "more advanced" true?** Wider, not deeper. It reaches further along the job — from understanding to a built, checked copy — and for a website that is a real step REA does not take. For digging into a binary, an APK or traffic, REA is the more mature and better-equipped tool; with Ghidra both give the same answer. So: REA stays first for analysis; Craft Anything is for website capture, rebuild-vs-original checks and the rebuild loop.

## Where it fits in the holding

| Office | Job | How |
|---|---|---|
| **Web Studio (B84)** | A client's existing site to be rebuilt or redesigned: its current pages, design tokens and breakpoints in one capture, as the brief's evidence | `web_site_capture` at 1440/768/390 |
| Web Studio | "Is our build at the level of the reference?" — measured, not by eye alone | `web_pixels_compare --common-area` per width |
| Web Studio | A fast first build of a reference layout to start the director's round from | `rebuild … --clean-room` (to be measured first — see Not done) |
| Construction | A rival's product page or app studied for the Ferrari (dxb-rival-intel), a vendor's ASAR or binary | REA first; Craft Anything when the question is "how does it look and lay out" |
| Media Studio / ad office | none found — it does not make images, video or ads (its paid fal.ai picture generation is off: budget 0, no key) |

It adds no revenue road by itself; it shortens and measures Web Studio work, which is where it earns.

## Install recipe (done 2026-11-26)

1. `gh release download v0.6.1 -R storytold/craft-anything -p 'craft-anything-0.6.1-linux-x86_64.tar.gz' -p SHA256SUMS.txt`; checksum compared; unpacked into `~/.local/share/dxb/tools/craft-anything-0.6.1/`.
2. `ln -s ~/.local/share/dxb/tools/craft-anything-0.6.1/bin/craft-anything-cli ~/.local/bin/craft-anything-cli`.
3. `craft-anything-cli settings-set --key engines.ghidra.install_dir --value '"…/ghidra_12.1.4_PUBLIC"'`, the same for `engines.ghidra.java_home` (`jdk-21.0.12.1+1`), and `assets.budget_usd = 0`.
4. Shelf skill written at `~/.local/share/dxb/skills/craft-anything/` (when to use it, when REA instead, recipes); upstream's own skill kept beside it.
5. **Not run:** `craft-anything-cli setup` — it would register an MCP server in Claude Code and write a skill into `~/.claude/skills`, i.e. load it at every opening. Nothing was written to `~/.claude` (checked). No `.desktop` entry. Removal line in INSTALL_PROVENANCE.txt.

## Not done

- **The rebuild loop was not run.** It takes longer than a helper may wait (the cost gate stops a >4-minute command in a subagent). The lead's command, one round, unattended, clean room, our subscription quota, no money:
  `craft-anything-cli --format text rebuild https://www.berkshirehathaway.com/ "Recreate this website as a static HTML/CSS site" --project-folder <scratch>/rebuild-bh --rounds 1 --unattended --clean-room`
  Its child `claude -p` loads the user-level `~/.claude` settings and hooks, so the house gates apply to it too — to be watched in that run.
- The desktop GUI was not opened.
- The holding's own agents do not have it (the house MCP bus is B41's road, at its rank).
