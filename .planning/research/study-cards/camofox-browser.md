# Study Card: camofox (a hidden browser that acts inside walled pages)

> FILLED 2026-11-17 — row w098 of the 24 Sep - 16 Nov WhatsApp tab; installed and measured the same day on his word <!-- CEO-OK: w098-tools-into-their-rows-camofox-tried-now-2026-11-17 -->, then written here on his word <!-- CEO-OK: camofox-into-the-library-and-the-research-door-2026-11-17 -->: what it is good for, what is done with it, what it is used with. The engine underneath has its own card: [[camoufox]] (2026-07-17).

- **Tool:** camofox-browser — a local server that wraps the Camoufox browser for agents; on this machine, the `camofox` command
- **Slug:** camofox-browser
- **Category:** Research / the agents' hands and eyes
- **Status:** INSTALLED for the construction's sessions (2026-11-17) · not yet in the holding's own agents
- **Board row:** B30 (the agents' hands and eyes); used by B28 (format research), B83 (lead finding, the customer desk's audit), B84 (competitor and review reading)
- **Source:** https://github.com/jo-inc/camofox-browser — MIT, v1.19.0, commit `31376c27` (2026-11-10), 12,343★
- **Where:** server `/home/dxb/tools/camofox-browser` · browser `~/.cache/camoufox` (1.3 GB) · start script `/home/dxb/tools/camofox-start.sh` · command `/home/dxb/tools/camofox-cli/camofox` → `~/.local/bin/camofox` · signed-in sessions `~/.camofox/profiles/`

## What it is good for

A browser nobody sees that can **act** inside a page that turns ordinary automation away: type into a search box, click, scroll, turn pages, stay signed in — without his screen and without his Chrome.

It is **not** a better reader. Measured 2026-11-17: on twelve sites that turn bots away it read ten, Scrapling's stealthy fetcher nine, and the research door's own reading chain read the two (G2, Zillow) that neither browser could. Its post's "scraping nobody blocks" is not true.

## What is done with it

| Job | How |
|---|---|
| Search a walled site and walk its result pages (Upwork, Indeed, Crunchbase, Trustpilot — all opened) | `camofox open <url>` → `type <tab> <eN> "<words>" --enter` → `snap` → `click` / `scroll` → `links` |
| The ad libraries of the weekly format research (B28) | Meta's library read 38 ads with their start dates after one scroll (Scrapling: 28, no scroll). TikTok's, Google's and LinkedIn's libraries open as a search form: the search has to be typed and run in the page — not finished in the measurement |
| Walk a prospect's site like a visitor (the customer desk's audit, H7) | open, read the snapshot, follow the contact / booking links; **look, never submit** — a fake inquiry is on the 1 Nov not-passing list |
| A directory's weekly refresh, a client's competitor prices and reviews | the same walk, slowly |
| A page the reading chain could not read | nothing to do by hand: it is door 11 of the chain's thirteen (`fetch.py`) |
| A site that needs a sign-in | `camofox login <url>` puts a real browser window on his desktop at the sign-in page; **he signs in himself**; `camofox headless` hides it again and the session is kept |

`camofox help` prints every command. A session keeps its cookies apart with `CAMOFOX_USER=<name>` (default `dxb`; the reading chain uses `fetch`).

## What it is used with — which hand for which job

| The job | The hand |
|---|---|
| Read one page | the research door's reading chain, `fetch.py` — first, always |
| A platform he is signed in to (Instagram, LinkedIn, X) | the hidden research Chrome with the copy of his sessions (`hidden.py`, `opencli`) |
| Search, click, scroll, turn pages inside a site that turns automation away | **camofox** |
| Something his own eye must see, or his real browser | his Chrome (`claude-in-chrome`), `operator` |
| Our own pages and tests | Playwright |

The chain: camofox walks and collects the addresses → the reading chain reads each page → what is found becomes evidence rows.

## How it is set up

- Listens on `127.0.0.1:9377` only. Started by the command itself as the systemd user unit `camofox`; `camofox stop` ends it.
- Crash telemetry to the project's endpoint is off (`CAMOFOX_CRASH_REPORT_ENABLED=false`).
- Runs in the machine's user-local virtual display (`~/.local/opt/xvfb`) — a real window nobody sees, not headless; Glassdoor opened only this way.
- English locale, fixed (`CAMOFOX_LOCALE=en-US`): without it a site answers in the language of the exit IP.
- Hidden means hidden: the start script (`/home/dxb/tools/camofox-start.sh`) unsets `WAYLAND_DISPLAY` and `DISPLAY` and sets `MOZ_ENABLE_WAYLAND=0` unless `CAMOFOX_INTERACTIVE=desktop` — with the Wayland display in its environment Firefox opened on his desktop instead of the virtual one (seen by him, fixed 2026-11-17 14:22; a page opened afterwards showed no window on his screen).
- Cookie import from a file is off (it needs an API key). The sign-in road is the visible window above.

## Its limits, measured 2026-11-17 (v1.19.0)

1. **One address.** A site visited again and again marks it: Zillow opened on the first visit and showed "Press & Hold" on the next two. Walk slowly and seldom. Residential proxies (it supports them, with GeoIP) are the paid road — his.
2. G2 refused it in every mode. LinkedIn shows its sign-in dialog over a company page.
3. A click on a Google result link times out and the tab is destroyed: take the link's address from the snapshot and `go` there.
4. Refs go stale when the page changes: take a fresh `snap` before a click.
5. A "press and hold" or picture challenge is not solved.

## Not done

- **The holding's own agents do not have it.** Its MCP server (`npm run mcp` in the server folder — the same actions as tools) is the road onto the house bus (dxb-mcp): catalog entry, pins, grants, a `library_items` row and one live call — B30's install, at its rank.
- TikTok's, Google's and LinkedIn's ad libraries: the typed search inside the page is not measured.
- Whether a session he signs in to (the visible window) is still signed in after `camofox headless` is not measured — it needs his first sign-in.
