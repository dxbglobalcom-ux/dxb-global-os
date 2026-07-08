# Study Card: open-notebook

> FILLED 2026-07-08 (06-01 Task 1). Verdict recorded BEFORE install per INTEG-01.

- **Tool:** open-notebook — open-source NotebookLM replacement (research brain: notebooks, sources, search, podcasts)
- **Slug:** open-notebook
- **Category:** Memory/knowledge
- **Status:** INSTALL (local; VPS placement = Phase 7 RAM budget decision, master §5)
- **Target Phase:** 6
- **Owner (dept/tier):** Memory — research brain (replaces NotebookLM)
- **Trigger Type:** service
- **Source:** github.com/lfnovo/open-notebook — **35.2k stars re-verified 2026-07-08** (tracker said 34.9k), MIT license, latest release v1.10.0 (2026-06-18)
- **Pinned Version:** image `lfnovo/open_notebook:1.10.0` (exact tag on Docker Hub; `v1-latest` is a moving tag — NOT used) + `surrealdb/surrealdb:v2.6.5` (exact; upstream compose uses moving `v2`)
- **Purpose:** `procedure`/research-kind store behind the memory router: long-form research material, document Q&A. Phase 6 wires the `notebook` adapter (06-06) against its REST API; NotebookLM subscription replaced before Oct 2026.
- **Official Docs URL:** https://github.com/lfnovo/open-notebook/tree/main/docs (installation: docs/1-INSTALLATION/docker-compose.md)

## Key API / Usage Notes (adapter contract for 06-06)

- **Architecture:** two services (single-container variant is DEPRECATED upstream): `surrealdb` (SurrealDB v2, RocksDB file backend) + `open_notebook` app. App ports: **5055 = FastAPI REST API** (business logic), 8502 = web UI.
- **SurrealDB command (upstream-verbatim):** `start --log info --user root --pass root rocksdb:/mydata/mydatabase.db`; `user: root` is REQUIRED even with a named volume — verified 2026-07-08: without it the container crash-loops with `Failed to create RocksDB directory: PermissionDenied`.
- **Health endpoint:** `GET http://127.0.0.1:5055/health` → `{"status":"healthy"}` (verified live 2026-07-08, see compose.local.yml + 06-01-SUMMARY).
- **API surface:** OpenAPI at `http://127.0.0.1:5055/docs`; adapter (06-06) uses notebooks/sources/search REST endpoints; base URL carried by env `DXB_NOTEBOOK_URL`.
- **Env (names only):** `OPEN_NOTEBOOK_ENCRYPTION_KEY` (required — encrypts stored provider credentials; local value lives in untracked `vps/open-notebook/secrets.local`, NEVER in repo), `SURREAL_URL=ws://surrealdb:8000/rpc`, `SURREAL_USER`/`SURREAL_PASSWORD` (root/root acceptable local-only), `SURREAL_NAMESPACE`/`SURREAL_DATABASE`.
- **Auth model:** optional password protection for public deployments (docs/5-CONFIGURATION/security.md); local install binds 127.0.0.1 only, so no password this phase — Phase 7 gateway decides exposure.
- **AI providers:** 18+ providers configurable; NOT configured this phase (adapter stores/searches documents; any LLM features later route via LiteLLM base-URL so spend stays in the ledger).

## Known Pitfalls
- `v1-latest` + `pull_policy: always` in upstream compose = silent drift — we pin exact tags and drop pull_policy.
- Losing `OPEN_NOTEBOOK_ENCRYPTION_KEY` makes stored provider credentials unreadable (docs security note) — key value in local env file only.
- SurrealDB is a second database engine (RocksDB file) — memory footprint counts against the Phase 7 8GB VPS budget; measured local RSS recorded below.
- Do not expose 5055/8502 beyond localhost this phase (T-06-03).

## RAM note (Phase 7 budget input — measured 2026-07-08 local)
- `docker stats --no-stream` after healthy boot: open_notebook **535.8 MiB**, surrealdb **84.4 MiB** (idle, empty DB) → combined ≈ **620 MiB idle**; compose caps: app `mem_limit: 1g`, surrealdb `mem_limit: 512m` (headroom for ingest); Phase 7 must budget ≥1.5G worst-case or defer per master §5 fallback.

- **Install Command:** `docker compose -f vps/open-notebook/compose.local.yml up -d` then `curl -sf http://127.0.0.1:5055/health`
- **Legitimacy Verdict:** OK — 35.2k-star MIT repo, active releases (v1.10.0 June 2026), official Docker Hub images under author namespace, no install-time code execution beyond the containers themselves; local-only binding this phase

## Lifecycle Checklist
- [x] STUDY (2026-07-08, 06-01)
- [x] INSTALL (2026-07-08 local — compose.local.yml, health OK)
- [x] ADOPT (2026-07-09, 06-06 — notebook adapter live: POST/GET /api/notes, server-assigned ref, NotebookDownError typed-loud)
- [ ] EMBED (06-06 round-trip green ✓; 06-08 battery pending)
