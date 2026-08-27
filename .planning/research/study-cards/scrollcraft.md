# Study Card: scrollcraft (nateherk-design)

> FILLED AND INSTALLED 2026-08-27 on the CEO's direct order — he brought the repository himself
> and, shown the measured picture and the recommendation, answered *"Ozaman Kur."*

- **Tool:** scrollcraft — a Claude Code skill that builds premium scroll-driven landing pages
- **Slug:** scrollcraft
- **Category:** Design / outward-facing web production
- **Status:** INSTALLED
- **Owner (dept/tier):** the department that owns a company's outward face; the skill is held by
  the session author and is available to every agent that can invoke a skill
- **Trigger Type:** skill (invoked by name)
- **Source:** https://github.com/nateherkai/scroll-craft — Nate Herk, MIT
- **Pinned Version:** upstream commit `e95798551874854cef6dd3996ec7de1364a82bbd`
  (2026-08-23 "fix: iOS scrub-clip priming, plus a real-device diagnostic page")
- **Vendored at:** `tools/scrollcraft/` — the holding keeps its own copy and installs FROM it
  (`bash tools/scrollcraft/install.sh`, `--check` proves the installed copy has not drifted)
- **Installed at:** `~/.claude/skills/scrollcraft` — a SKILL, deliberately not a plugin, because
  the CEO's order of 2026-08-09 keeps every plugin except claude-mem and context7 disabled
- **Purpose:** the visitor-facing website of a company the holding owns or serves. Scroll is the
  timeline: video scrubs frame by frame under the wheel, sections pin, rails pan sideways,
  headlines assemble, the page ground shifts colour, and the build is verified by screenshotting
  its own scroll.

## Why it was taken

**The CEO brought it himself**, with his own reading of what it was for: the websites of the
companies the holding will create should be built this way. He settled the scope the same
afternoon, when the session put a supposed spec gap to him: *"Holdingin kuracağı şirketlere web
sitesi yapma işi holdinge söylenince yapar yani holding tam anlamıyla ferrari seviyesinde
kurulunca. bir iş istenilince yapar. ayrıca bunun için satır açmaya gerek yok."* So this is a tool
the finished holding reaches for when it is told to build a site — not a project of its own.

Its discipline is the same law this holding already runs on, written for the web:
interview the human before generating anything; a fingerprint gate that refuses a build unless it
differs from every previous build on 4 of 6 dimensions; verification by screenshot at every scroll
position; and a hard-rules table that bans the tells of an amateur page (section counters, a
"scroll" arrow, invented statistics, text baked into images).

## Key API / Usage Notes

- `node <skill>/scripts/doctor.mjs` — preflight. Measured 2026-08-27 from the build workspace:
  node v22.23.2 ok · ffmpeg full build, 572 filters ok · playwright-core ok · Chrome ok ·
  workspace ok · registry ok · KIE_AI_API_KEY deliberately NOT set.
- Build workspace is `var/scrollcraft/` (gitignored), resolved through the repo-root
  `.scrollcraft.json`. `playwright-core@1.61.1` is installed there so the verification pass runs
  without a per-build install; that folder is outside the pnpm workspace globs on purpose.
- `scripts/serve.mjs` serves a build; `scripts/shoot.mjs` walks each act at six scroll positions
  and reports dead scroll, unreached cues and measured contrast, then writes a contact sheet.
- `scripts/kie.mjs` generates imagery through kie.ai. **It spends money and is gated.**

## Security gate (INTEG-01)

- Scan: `uvx --from git+https://github.com/nvidia/skillspector skillspector scan --no-llm …`,
  SkillSpector v2.10.0, archived at `.planning/research/skillspector/scrollcraft-e957985.txt`.
  Static-only: the three semantic analyzers need a paid model key, which was not spent.
- Headline verdict `CRITICAL 100/100 · DO NOT INSTALL`, 15 issues — **triaged at source, not
  auto-accepted**, exactly as the doctrine requires. Same headline SkillSpector gave scrapling,
  which is installed and in daily use.

| Finding | Where | Verdict at source |
|---|---|---|
| AR1 anti-refusal | `references/assets.md:111` | FALSE POSITIVE — *"do not refuse a justified reroll"* is about image quality inside a spend cap, not about refusing unsafe work. Neutralised anyway by house rule 2. |
| P2 hidden instructions ×4 | `device-diag.html:2`, `template.html:2,50,65` | FALSE POSITIVE — ordinary HTML comments (`<!-- scrollcraft skeleton. -->`, `<!-- 1 · RECOGNITION: scrub -->`), read by eye. |
| PE3 credential access ×5 | `doctor.mjs:129,139`, `kie.mjs:20,39,50` | **REAL — and fixed.** Upstream walked up to EIGHT parent directories reading every `.env` it met. Inside this holding that walk reaches company secrets. Our copy reads the environment first, then a `.env` in the current directory only. No upward walk. |
| LP1 capability not declared | `engine/scrollcraft.js`, `doctor.mjs` | Declaration hygiene, not behaviour. The only `fetch()` in the engine loads the page's OWN local clip (`scrollcraft.js:591`); `doctor.mjs` reads env vars to report versions. |
| EA2 autonomous decision | `references/worldflight.md:283` | FALSE POSITIVE — a paragraph about scroll speed guardrails. No command execution. |
| E1 external transmission ×2 | `kie.mjs:5,6` | TRUE and disclosed: `api.kie.ai` and its upload host, reachable only when a key is set. Held shut by house rule 2. |

Full-tree sweep the same session: the only outbound hosts in the whole skill are those two.
No telemetry, no phone-home. `child_process` appears only in the version probe and the ffmpeg /
montage calls.

## DXB adaptations (doctrine D6 — adapt, do not merely scan)

Three house rules were written into the head of our copy of `SKILL.md`, above everything else:

1. **Outward-facing sites only.** Never the holding's own command surface.
2. **Money out stops at the CEO.** No kie.ai call — not one still, not one reroll — without a
   registered approval for that build. Building from the client's own photographs needs no key
   and no spend and is the default route.
3. **No secret of the holding goes near it**, enforced by the `.env` change above, which is
   commented in both scripts so a future session does not silently restore the walk.

## Known Pitfalls

1. A green verification run does not cover a real phone. The skill says so itself and ships
   `references/device-diag.html` for that; headless Chrome cannot reproduce an iPhone's video
   decoder, autoplay policy or Low Power Mode.
2. The upstream repository is young — created 2026-08-22, one commit at intake. This is why the
   holding keeps its own vendored copy rather than depending on the remote.
3. Contrast failures are reported against the composited frame, so a page over bright footage
   will fail even when the CSS looks fine. That is the harness working, not a false alarm.

- **Install Command:** `bash tools/scrollcraft/install.sh` (copies the vendored skill into
  `~/.claude/skills/scrollcraft` and proves both copies are byte-identical by sha256).
- **Legitimacy Verdict:** OK — MIT, free (D1 compliant), no telemetry, single paid dependency
  optional and gated. 1,055 stars and 172 forks at intake.

## Lifecycle Checklist
- [x] STUDY (2026-08-27)
- [x] INSTALL (2026-08-27 — doctor green from the build workspace; the skill was listed as live
      in the running session the moment it landed)
- [x] ADOPT (2026-08-27 — end-to-end proof build at `var/scrollcraft/builds/_install-proof`:
      assets made locally with ffmpeg at zero spend, page served, 47 frames shot by the harness,
      `no dead scroll detected`, `all 2 scrub clip(s) keep moving`, one real CONTRAST FAIL at
      2.37:1 correctly convicted on the placeholder art. Contact sheet read by the author's own
      eye and sent to the CEO.)
- [ ] EMBED — no employee persona names this skill yet. Per the CEO's ruling of 2026-08-27 there
      is no row for this and there will not be one: the finished holding builds a site when it is
      told to. The skill therefore embeds through the personas of the departments that would be
      handed such a job — the same five the live test routed to (marketing, design, engineering,
      product, commerce) — whenever those personas are next written.
