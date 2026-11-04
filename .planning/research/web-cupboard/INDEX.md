# Web cupboard — what the web trade knows, and where

B84 decision 14. One copy of each piece: this page points, it does not repeat. Re-verify every six months; ad rules changed three times in the 13 months before 2026-11. Numbers carry their source and year; none was measured on Opus 5.5 unless it says so.

Base path: `.planning/quick/20261103-web-ders/tracks/`.

| Piece | Where |
|---|---|
| Evidence tables (what is measured, what is a vendor's word) | section 2 of each track: `1-seo.md` `2-aeo-geo.md` `3-eticaret.md` `4-reklam-olcum.md` `5-altyapi.md` `6-studyolar.md` `7-aletler.md` |
| Release gates | section 6 "Ofisin işi" of `1-seo.md`, `2-aeo-geo.md`, `3-eticaret.md`, `5-altyapi.md` |
| Free crawler, tested on a real site (LibreCrawl first, SiteOne second; rate patch) | `.planning/quick/20261104-web-bedava-aletler/crawl-test/RUN.md` |
| Eye rig: page capture, walled blind judge, scoring | `.planning/quick/20261104-goz-olcumu/` |
| Migration process | `1-seo.md` § 3.12 |
| Measurement template, gates before ads | `4-reklam-olcum.md` § 3.1, § 3.2 |
| Team and process tables | `6-studyolar.md` § 3.2, § 3.4 |
| Tool list with verdicts | section 5 of each track, `7-aletler.md` whole |
| The links he sent, judged | `../links.md` |
| Community sweep on AEO/GEO | `../sweep.md` |

## Teardown of a reference (decision 3)

`teardown.cjs` here measures what a page carries: bytes by type, canvas, video, scripts, at both widths. REA opens the code. They run together:

1. `OUT=<dir> node teardown.cjs <url> <tag> [mobile]`.
2. Own headless Chromium on a free port, never 9333 (the hidden research Chrome). After load, list every script origin from `performance.getEntriesByType('resource')`.
3. `rea analyze-web-bundle http://127.0.0.1:<port> <targetId> --observation-ms 6000 --allowed-origins <o1> --allowed-origins <o2>` (the flag repeats). Without it REA reads only the page's own origin and misses the site's code. Do not reload during observation.
4. `rea inspect-web-page … --include-script-sources --format json > page.json`, then `rea export-web-scripts page.json <absent dir>` and search the files.

Measured 2026-11-04 on landonorris.com: 9 scripts, the 1.3 MB main bundle, three.js r174, GSAP, Lenis, Rive and HDR file names.

## Two MCPs that can spend

Vercel's MCP can make purchases since 2026-07-21: if connected it sits behind the approval gate. Meta Ads' MCP can change a live budget at once by a third-party report: only `ads_read` is granted.

## Search and commercial side

What the outside cannot show: see `.planning/quick/20261104-web-bedava-aletler/`.
