# EVIDENCE — B43 leg (3), the continuity rule written into the two directors' personas (2026-09-14)

His word (2026-09-14, this session), after the rule had been put to him engine-agnostic: *"lakin işte flux kareleri sadece bu bilgisayardaki localdeki model için kapalı. diğer runpod veya api veya mcp için değil.çünkü burada yani localde üretim yaptığımızda herşeyi baştan sonra minimax H3 yapıyor. ok."* Read by the author as yes-with-the-amendment and said to him in the same turn. Ledger: `astra-rule-accepted-flux-scoped-to-local-2026-09-14`.

## What changed (files, by the session author Claude Fable 5.1, inline)
- `personas/media-studio/media-creative-director.md` §3: one new line "Continuity between takes — the CEO's rule of 2026-09-14 …"; the engine-floor line now names the external hands (a membership over MCP or a pay-as-you-go engine API, chosen per job — his 2026-09-14 word); dossier row 31 dated.
- `personas/media-studio/media-film-director.md` §3: the "Long form: …" line REPLACED by the continuity rule (LAW A — the old line let a scene be pre-chained; the new rule takes one take first); dossier row 31 dated.
- Board B43: leg (3) header → PARKED with the accepted rule; amendment (c) and leg (3)'s Flux sentence scoped to the station's own engine; STATE.md leg (3) + waits-on-him list; ledger entry.
- No code. `grep -c Flux` on both persona files before the change: 0 and 0 (the closure had never been written into them; it now is, scoped).

## Delivery chain — commands and decisive output (persona door)
```
DXB_PERSONA_AUTHOR=fable-5 bash scripts/sync-personas-to-db.sh <the two files>
  SUBMIT media-creative-director — persona id: fd5ccb88-00e1-43f1-b411-0e6da512d81b · author: fable-5
  SUBMIT media-film-director    — persona id: 816fe584-cf92-4ec2-9ea2-bb5fc8d829b8 · author: fable-5
  submit: 2 · skip(⏳): 0 · fail: 0
SELECT fn_persona_gate(<id>,'passed','…Fable 5.1 in person; deep verdict signed by the author…')
  media-creative-director: v10 → passed
  media-film-director:     v8  → passed
BEGIN; UPDATE agents SET persona_id=<latest passed> … ; INSERT INTO audit_log('fable-5','system','persona.bound', {slug, department, persona_id, from_version, to_version, why}) …; COMMIT
  INSERT 0 2 · COMMIT
  media-creative-director | bound v10 | passed | fable-5
  media-film-director     | bound v8  | passed | fable-5
bash scripts/sync-personas-to-db.sh --verify <the two files>
  match: 2 · diff: 0 · skip(⏳): 0 · fail: 0 · VERIFY: PASS
```

## Battery
```
pnpm exec vitest run tests/r31/persona-delivery.test.ts   → Test Files 1 passed · Tests 4 passed (4)
pnpm verify:ledger  → ledger truth OK: … 118 CEO approval claims each backed by a registered approval
bash scripts/i18n-purity-check.sh → I18N PURITY: PASS
```

## Blast radius (his order of 2026-08-17 — name what stands on the thing changed, then re-measure it)
- The runtime reads a seat's persona from the FILE (`packages/orchestrator/src/worker-shim.ts` `loadPersonaBody(repoRoot, employee.persona_path)`), so the live seats see the new lines at their next run; `agents.persona_id` is the HR record and is now at the passed version (bound v10 / v8). The delivery test (4/4) proves the whole body from `# PERSONA — ` crosses, dossier excluded.
- Nothing in code reads the replaced "Long form" sentence; `tests/b43` + `tests/b39` re-run after the change (result in the session's commit message).
- The four Flux-drawn presenters stay out of use (2026-09-13); his scope did not reopen them and this change does not touch the catalogue or the vitrin.

## Not done, on purpose
- No exam of the rule: it runs on the first job that needs more than one take (the station's limit is one take ≤ 15.1 s; every accepted film is one take).
- No route beyond the station exists yet (leg 6).
