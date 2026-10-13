#!/usr/bin/env node
// B41 first slice (CEO 2026-10-13, "5-tmm") — register the design seats' skills as ONE governed
// library row (kind plugin, name dxb-design = the folder packages/gateway/plugins/dxb-design) and grant
// it to the design department and three named seats. Same single-door idiom as register-arsenal.mjs:
// every write through control_library_action in CEO context, idempotent, re-run safe. The profile
// compiler turns the grants into `_skills: ["dxb-design"]`; the runtime hands the plugin to those seats.
//   DXB_DATABASE_URL=<engine> node scripts/library/register-design-skills.mjs --apply
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(new URL("../../packages/shared/package.json", import.meta.url));
const pg = require("pg");

const APPLY = process.argv.includes("--apply");
const DB_URL = process.env.DXB_DATABASE_URL;
if (!DB_URL) {
  console.error("library/register-design-skills: DXB_DATABASE_URL is not set — name the engine explicitly.");
  process.exit(2);
}
const PLUGIN = new URL("../../packages/gateway/plugins/dxb-design/.claude-plugin/plugin.json", import.meta.url);
if (!existsSync(PLUGIN)) {
  console.error("library/register-design-skills: the plugin folder is missing — nothing to register.");
  process.exit(2);
}

const ITEM = {
  kind: "plugin",
  name: "dxb-design",
  version: "1.0.0",
  owner_dept: "design",
  usage_notes:
    "Design craft for the design seats: Emil Kowalski's 15 skills (MIT, emilkowalski/skills @2d228630) — motion, " +
    "polish, UI stress tests, mobile. Listed for the granted seat; the seat opens one with the Skill tool when a job " +
    "needs it; Read is confined to the plugin folder. Granted: design, engineering-frontend-developer, " +
    "media-creative-director, media-product-brand-consistency (CEO 2026-10-13).",
  source_ref: "packages/gateway/plugins/dxb-design",
};
const DEPARTMENTS = ["design"];
const SEATS = ["engineering-frontend-developer", "media-creative-director", "media-product-brand-consistency"];

async function ceoAction(client, payload, label) {
  // Sol's pass (B41): a fixed key replayed the stored answer of a grant revoked since — so the key
  // carries the moment; re-run safety comes from the active-grant check before each write instead.
  const key = `b41-design-skills-${createHash("md5").update(JSON.stringify(payload)).digest("hex")}-${Date.now()}`;
  await client.query("BEGIN");
  try {
    await client.query(
      `SELECT set_config('request.jwt.claims',
         '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true)`,
    );
    const { rows } = await client.query("SELECT control_library_action($1::jsonb, $2) AS resp", [
      JSON.stringify(payload),
      key,
    ]);
    if (!rows[0].resp.ok) throw new Error(`${label}: ${rows[0].resp.error} ${rows[0].resp.detail ?? ""}`);
    await client.query("COMMIT");
    return rows[0].resp;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  }
}

const client = new pg.Client({ connectionString: DB_URL });
await client.connect();
try {
  await run(client);
} finally {
  await client.end();
}

async function run(client) {
  const seats = (
    await client.query(
      "SELECT id, slug FROM agents WHERE slug = ANY($1) AND employment_status IS DISTINCT FROM 'archived' ORDER BY slug",
      [SEATS],
    )
  ).rows;
  const depts = (await client.query("SELECT slug FROM departments WHERE slug = ANY($1)", [DEPARTMENTS])).rows;
  const missing = [
    ...DEPARTMENTS.filter((d) => !depts.some((x) => x.slug === d)),
    ...SEATS.filter((s) => !seats.some((x) => x.slug === s)),
  ];
  if (missing.length > 0) {
    // Fail closed: a half-granted plugin is a record that lies about who holds it.
    console.error(`library/register-design-skills: absent on this engine: ${missing.join(", ")} — nothing written.`);
    process.exitCode = 3;
    return;
  }
  if (!APPLY) {
    console.log(`dry-run: plugin/${ITEM.name}; departments present ${depts.length}/${DEPARTMENTS.length}; seats present ${seats.length}/${SEATS.length}`);
    return;
  }

  let item = (
    await client.query("SELECT id FROM library_items WHERE kind = 'plugin' AND name = $1 AND version IS NOT DISTINCT FROM $2", [
      ITEM.name,
      ITEM.version,
    ])
  ).rows[0];
  if (item) {
    console.log(`exists  plugin/${ITEM.name}@${ITEM.version} (${item.id})`);
  } else {
    await ceoAction(client, { action: "register_item", ...ITEM, quality_score: 100, review_status: "approved" }, `register ${ITEM.name}`);
    item = (await client.query("SELECT id FROM library_items WHERE kind = 'plugin' AND name = $1 AND version = $2", [ITEM.name, ITEM.version])).rows[0];
    console.log(`registered plugin/${ITEM.name}@${ITEM.version} (${item.id})`);
  }

  const grants = [
    ...depts.map((d) => ({ grantee_kind: "department", grantee_id: d.slug, label: d.slug })),
    ...seats.map((s) => ({ grantee_kind: "employee", grantee_id: s.id, label: s.slug })),
  ];
  for (const g of grants) {
    const have = await client.query(
      `SELECT 1 FROM library_grants WHERE item_id = $1 AND grantee_kind = $2 AND grantee_id = $3
          AND (expires_at IS NULL OR expires_at > now())`,
      [item.id, g.grantee_kind, g.grantee_id],
    );
    if (have.rows.length > 0) {
      console.log(`exists  grant ${ITEM.name} → ${g.label}`);
      continue;
    }
    await ceoAction(client, { action: "grant", item_id: item.id, grantee_kind: g.grantee_kind, grantee_id: g.grantee_id }, `grant ${ITEM.name}→${g.label}`);
    console.log(`granted ${ITEM.name} → ${g.label}`);
  }
  // Read back what is really active — the answer of the door is not the record.
  const active = (
    await client.query(
      `SELECT grantee_kind, grantee_id FROM library_grants
        WHERE item_id = $1 AND (expires_at IS NULL OR expires_at > now())`,
      [item.id],
    )
  ).rows;
  const held = grants.filter((g) => active.some((a) => a.grantee_kind === g.grantee_kind && a.grantee_id === g.grantee_id));
  if (held.length !== grants.length) {
    const lost = grants.filter((g) => !held.includes(g)).map((g) => g.label);
    console.error(`library/register-design-skills: not active after the run: ${lost.join(", ")}`);
    process.exitCode = 4;
    return;
  }
  console.log(`done: ${held.length} active grant(s) held — ${held.map((g) => g.label).join(", ")}`);
}
