# ODT Sanitization Evidence (SEC-04, plan 01-05)

- **UTC timestamp:** 2026-07-06T15:45Z
- **Method note (recorded deviation):** Task 1 mechanics executed by builder via `evidence/odt-sanitize.py` under CEO delegation — content never entered agent context (counts/indices only); all procedure invariants held (distinct /tmp paths, full container rewrite, versions dropped, tracked-changes stripped). CEO review gate (Task 3) unchanged.

## Gate results (command → observed)

| Gate | Command | Observed |
|------|---------|----------|
| md exists | `test -f docs/source-architecture-notes-sanitized.md` | OK |
| md key-shape | `grep -cE 'sk-...\|nvapi-...\|apify_api_...'` | 0 |
| gitleaks docs | `gitleaks dir docs --redact` | exit 0 |
| path guard | `cmp -s /tmp/odt-original-work.odt /tmp/odt-sanitized-check.odt` | exit 1 (distinct, both exist) |
| gitleaks container | `gitleaks dir /tmp/odt-check --redact` | exit 0 |
| container key-shape | count over extracted container | 0 |
| scratch cleanup | `test ! -e /tmp/odt-check` | OK |
| original ignored | `git check-ignore -q <original>.odt` | exit 0 |
| odt in history | `git log --all --name-only \| grep -ci '\.odt$'` | 0 |
| odt tracked | `git ls-files \| grep -ci '\.odt$'` | 0 |

container-verified-path: /tmp/odt-sanitized-check.odt
container-scan: PASS

## Sweep locations (Step 6)

| Location | Found? | Action taken |
|----------|--------|---------------|
| Downloads folder | not found | — |
| Cloud-sync folders | no sync folders exist on machine | — |
| ~/.local/share/Trash | no copy of original (unrelated `deepseek planı.odt` present, out of scope) | — |
| LibreOffice autobackup (~/.config/libreoffice/4/user/backup) | FOUND `.odt.bak` copy | shred -u, absence machine-verified |
| Email attachments — sent | not found (CEO attestation: never emailed) | — |
| Email attachments — received | not found (CEO attestation: never emailed) | — |
| External/USB backups | /media /mnt scanned: not found | — |

## Word-match summary (line numbers + categories only)

- line 15 — token
- line 47 — token
- line 55 — token
- line 57 — token
- line 59 — api key
- line 93 — api key
- line 279 — api key
- line 287 — secret
- line 305 — token
- line 311 — token
- line 363 — api key
- line 475 — api key
- line 667 — api key
- line 684 — api key
- line 708 — api key
- line 748 — api key
- line 750 — api key

## CEO approval (Task 3)

- 2026-07-06T15:51Z — CEO reviewed all 17 word-match lines from /tmp scratch: no residual values or value-adjacent fragments ("API key falan yok artık"). Email sweep: CEO attests the original was never sent or received by email. Original .odt contained to single non-synced location (repo root, gitignored, machine has no cloud-sync folders).
