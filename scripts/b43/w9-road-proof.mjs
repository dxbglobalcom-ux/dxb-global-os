// W9 (CEO 2026-09-15) — THE ROAD PROOF, kept: one studio call sheet that names the borrowed
// Editor, dispatched through the same door a director uses, on the CONSTRUCTION engine.
//
// Why a script and not only a test: the battery's cases clean up after themselves (a suite that
// leaves rows behind poisons the next audit), but the order asks for a dispatched sheet that can
// still be READ afterwards — by the checker, by the ruler, by anyone re-measuring the claim. This
// writes exactly one sheet, is idempotent (the same (author, code) returns the sheet already born,
// never a second crew), and refuses to run against anything but the construction engine.
//
//   DXB_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54422/postgres \
//     node scripts/b43/w9-road-proof.mjs
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { sql } from "kysely";
import { createDxbMcpServer } from "../../packages/dxb-mcp/dist/index.js";
import { getDb, closeDb } from "../../packages/shared/dist/index.js";
// B36's law: on the construction engine EVERY project row's text is what
// db/seed/build-seed.ts generates for its slug — the seed rewrites them all,
// whoever wrote the row. This script was born writing its own prose, so its
// row was fiction the seed did not own, and `tests/b36/seed-is-fiction` (6)
// went red the moment the proof was dispatched (measured 2026-09-21: the row
// carried "W9 road proof" against the generator's "Low Meadow Line"). The
// proof is KEPT and must not be deleted, so the fix is ownership: the row is
// written from the SEED'S OWN GENERATOR, at birth and on every re-run. Node
// strips the types on import (v22.18+); the seed itself runs the same way.
import { projectFictionFor } from "../../db/seed/generated-holding-core.ts";

const url = process.env.DXB_DATABASE_URL ?? "";
if (!url.includes("54422")) {
  console.error(
    "[w9-road-proof] REFUSED: this writes real task rows and runs on the construction engine only " +
      "(port 54422). The company engine stays SELECT-only in W9 — the CEO's order.",
  );
  process.exit(2);
}

const CODE = "DXB-W9-ROAD-PROOF";
const EDITOR = "marketing-short-video-editing-coach";
const db = getDb();

const server = createDxbMcpServer();
const client = new Client({ name: "w9-road-proof", version: "0.0.0" });
const [ct, st] = InMemoryTransport.createLinkedPair();
await Promise.all([server.connect(st), client.connect(ct)]);
const call = async (name, args) => {
  const res = await client.callTool({ name, arguments: args });
  if (res.isError) throw new Error(res.content?.[0]?.text ?? "tool error");
  return JSON.parse(res.content[0].text);
};

// the project and the director's own task, made once and reused on a re-run.
// The text is the seed's, never this script's — see the import above.
const PROJECT_SLUG = "w9-road-proof";
const fiction = projectFictionFor(PROJECT_SLUG);
await sql`
  INSERT INTO projects (slug, name, name_tr, purpose, purpose_tr, strategy_link, links, status)
  VALUES (${PROJECT_SLUG}, ${fiction.name}, ${fiction.name_tr}, ${fiction.purpose},
          ${fiction.purpose_tr}, ${fiction.strategy_link}, ${fiction.links}::jsonb, 'active')
  ON CONFLICT (slug) DO UPDATE
     SET name = EXCLUDED.name, name_tr = EXCLUDED.name_tr, purpose = EXCLUDED.purpose,
         purpose_tr = EXCLUDED.purpose_tr, strategy_link = EXCLUDED.strategy_link,
         links = EXCLUDED.links`.execute(db);
const project = (
  await sql`SELECT id FROM projects WHERE slug = ${PROJECT_SLUG}`.execute(db)
).rows[0];

const existing = (
  await sql`SELECT id FROM tasks WHERE project_id = ${project.id}::uuid AND parent_task_id IS NULL`.execute(db)
).rows[0];
const author =
  existing ??
  (
    await sql`
      INSERT INTO tasks (department, agent_id, objective, output_contract, model_tier, approval_class,
                         budget_max_tokens, priority, status, project_id)
      SELECT 'media-studio', a.id,
             'W9 road proof: the director plans the job and writes the sheet',
             'the call sheet, seat by seat', 'L1', 'none', 200000, 6, 'running', ${project.id}::uuid
        FROM agents a WHERE a.slug = 'media-creative-director'
      RETURNING id`.execute(db)
  ).rows[0];

const sheet = await call("queue_dispatch", {
  task_id: author.id,
  code: CODE,
  seats: [
    {
      seat: "media-ai-video-engineer",
      objective: "Shoot the take the brief asks for, whole.",
      output_contract: "the take, with its engine and settings recorded",
      label: "the take",
      label_tr: "çekim",
      deps: [],
    },
    {
      seat: EDITOR,
      objective: "Cut the take to the brief's length and rhythm.",
      output_contract: "the cut, with the edit decisions named",
      label: "the cut",
      label_tr: "kurgu",
      deps: [0],
    },
  ],
});

console.log(
  `[w9-road-proof] sheet ${CODE}: ${sheet.tasks.length} task(s)` +
    (sheet.already_dispatched ? " (already dispatched — idempotent, no second crew)" : " born"),
);
const rows = (
  await sql`
    SELECT a.slug, a.department AS home, t.department AS work_dept, t.status, t.id
      FROM tasks t JOIN agents a ON a.id = t.agent_id
     WHERE t.parent_task_id = ${author.id}::uuid ORDER BY a.slug`.execute(db)
).rows;
for (const r of rows) {
  console.log(`[w9-road-proof]   ${r.slug} — home '${r.home}' — task in '${r.work_dept}' — ${r.status} — ${r.id}`);
}
await client.close();
await closeDb();
