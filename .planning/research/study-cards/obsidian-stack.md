# Study Card: Obsidian stack (obsidian-mind, kepano/obsidian-skills, second-brain, claude-obsidian)

> FILLED 2026-07-08 (06-01 Task 1). The study PICKS the final combination per tracker mandate.

- **Tool:** Obsidian stack — vault-based artifact store for the Phase 6 memory router
- **Slug:** obsidian-stack
- **Category:** Memory/knowledge
- **Status:** ADOPT (write path needs no install — repo-root vault already live, quick task 260706-h26)
- **Target Phase:** 6
- **Owner (dept/tier):** Memory system
- **Trigger Type:** hook / skill
- **Source:** repo root = Obsidian vault (260706-h26); components below
- **Pinned Version:** n/a — write path is plain `fs` (no installable artifact); Obsidian desktop app is the CEO-side viewer only
- **Purpose:** Human-legible artifact store: the router's `obsidian` adapter persists `artifact`-kind memories as plain `.md` notes the CEO can read/edit in Obsidian, git-diffable, zero plugin dependency.
- **Official Docs URL:** https://help.obsidian.md/ (vault format = plain Markdown + YAML frontmatter)

## THE PICKED COMBINATION (final, consumed verbatim by 06-04)

**Write path (router-owned):** plain filesystem writes, **no Obsidian plugin dependency**.
- **Note location:** `memory-store/<kind>/<indexId>.md` — router-owned subtree at vault root. `memory-store/` is gitignored (runtime data; durability = disk + memory_index + audit_log, decision logged in 06-04).
- **Frontmatter contract (YAML):** `id` (memory_index uuid), `kind`, `trust_tier`, `provenance` (origin + source object, verbatim from memory_index.provenance), `created_at`. Body below frontmatter = the memory content. Optional wiki-links in body are allowed (vault convention).

**Component verdicts:**
| Component | Verdict | Reason |
|---|---|---|
| kepano/obsidian-skills | ADOPT (read-side/authoring conventions only) | Already installed as plugin marketplace `obsidian-skills` (~/.claude/plugins/marketplaces/obsidian-skills — LICENSE/README/skills present); official Obsidian-CEO skill set for Markdown/vault conventions; never in the router write path |
| obsidian-mind | EXCLUDED from runtime | Reference only; no install — write path must stay plugin-free |
| second-brain | EXCLUDED from runtime | Reference only; vault structure ideas already absorbed into 260706-h26 setup |
| claude-obsidian | EXCLUDED from runtime | Reference only; MCP-style vault access unnecessary — adapter uses `fs` directly |

## Key API / Usage Notes
- Adapter invocation (06-04): `fs.mkdir(memory-store/<kind>, recursive)` + `fs.writeFile(<indexId>.md, frontmatter+body)`; read = `fs.readFile` by ref path stored in memory_index.ref.
- Obsidian app picks the files up automatically (vault = folder watch); no API call, no plugin, no daemon.

## Known Pitfalls
- Frontmatter must be valid YAML — serialize with a YAML lib or strict template, never string-concat user content into frontmatter values (quote/escape).
- `memory-store/` in `.gitignore` (06-04): keeps runtime memories out of GSD commit discipline; wiki-graph tools that only see git content will not index it — acceptable, the router's own index is authoritative.
- Vault root also holds `.planning/` docs; adapter must never write outside `memory-store/` (path-join on validated uuid only).

- **Install Command:** none — vault live; components ADOPTed are already installed, EXCLUDED ones never install
- **Legitimacy Verdict:** OK — write path is our own fs code on our own repo; kepano/obsidian-skills is the Obsidian CEO's official skills repo, already vetted at plugin install

## Lifecycle Checklist
- [x] STUDY (2026-07-08, 06-01 — combination picked)
- [x] INSTALL (n/a — no artifact; vault live since 260706-h26)
- [x] ADOPT (2026-07-08 — contract above is the adopted design; code lands 06-04)
- [ ] EMBED (06-04 obsidian adapter + round-trip test)
