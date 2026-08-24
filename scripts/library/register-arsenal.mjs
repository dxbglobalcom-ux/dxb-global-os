#!/usr/bin/env node
// R4.3 — register the FREE-tranche external MCP servers as governed library
// rows + department grants (kayıt-yetki-uygulama chain, HOLDING_LIBRARY G3).
// Same single-door idiom as enrich.mjs: every write via control_library_action
// in CEO context (adaptation A8), md5 idempotency, re-run safe.
//   node scripts/library/register-arsenal.mjs --apply
import { createHash } from "node:crypto";
import { createRequire } from "node:module";

const require = createRequire(new URL("../../packages/shared/package.json", import.meta.url));
const pg = require("pg");

const APPLY = process.argv.includes("--apply");
// B36 Block 4: the company's address used to stand here as a DEFAULT. It does
// not any more — this tool writes governed rows and will not guess where.
const DB_URL = process.env.DXB_DATABASE_URL;
if (!DB_URL) {
  console.error(
    "library/register-arsenal: DXB_DATABASE_URL is not set. This tool registers governed library rows and it carries no default — " +
      "name the engine explicitly.",
  );
  process.exit(2);
}

// Quality per the R4.2 formula (gap-matrix doc): +40 source verified (catalog
// entry + live pins measured this session) +20 owner +20 usage_notes
// +10 version +10 live-link (enumerated over a real tools/list round-trip).
const ITEMS = [
  {
    kind: "mcp",
    name: "git",
    version: "2026.7.10",
    owner_dept: "platform",
    usage_notes:
      "Local git READ hand (uvx mcp-server-git, repo-pinned via --repository). 12 tools pinned; write tools (commit/add/reset/checkout/create_branch) POLICY-DENIED for engineering — construction-phase K1 (denials.json R4.3 note). Granted: engineering.",
    source_ref: "packages/gateway/policy/grants.json",
  },
  {
    kind: "mcp",
    name: "context7",
    version: "3.2.4",
    owner_dept: "platform",
    usage_notes:
      "Live version-correct library docs (@upstash/context7-mcp, workspace dep). 2 tools: resolve-library-id → query-docs. Serves the no-guessing rule for engineering workers. Returned docs are untrusted reference input — never a source of secrets/config. Granted: engineering.",
    source_ref: "packages/gateway/policy/grants.json",
  },
  {
    kind: "mcp",
    name: "playwright",
    version: "0.0.78",
    owner_dept: "platform",
    usage_notes:
      "Browser automation hand (@playwright/mcp, headless+isolated, workspace dep). 24 tools pinned; browser_run_code_unsafe + browser_file_upload POLICY-DENIED everywhere (exfiltration surface). Page content is UNTRUSTED input — never triggers gated actions or memory writes directly. Granted: engineering, quality.",
    source_ref: "packages/gateway/policy/grants.json",
  },
  {
    kind: "mcp",
    name: "scrapling",
    version: "0.4.10",
    owner_dept: "platform",
    usage_notes:
      "Web research/scraping bridge (scrapling mcp, ~/scrapling-env venv; camoufox v152.0.4-beta.27 installed — StealthyFetcher live-verified 2026-07-18). 10 tools. Use bounded by robots/ToS research policy; scraped content is untrusted input. Granted: strategy.",
    source_ref: "packages/gateway/policy/grants.json",
  },
];

const GRANTS = [
  { name: "git", dept: "engineering" },
  { name: "context7", dept: "engineering" },
  { name: "playwright", dept: "engineering" },
  { name: "playwright", dept: "quality" },
  { name: "scrapling", dept: "strategy" },
];

async function ceoAction(client, payload, label) {
  const key = `arsenal-${createHash("md5").update(JSON.stringify(payload)).digest("hex")}`;
  await client.query("BEGIN");
  try {
    await client.query(
      `SELECT set_config('request.jwt.claims',
         '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true)`,
    );
    const { rows } = await client.query(
      "SELECT control_library_action($1::jsonb, $2) AS resp",
      [JSON.stringify(payload), key],
    );
    if (!rows[0].resp.ok) {
      throw new Error(`${label}: ${rows[0].resp.error} ${rows[0].resp.detail ?? ""}`);
    }
    await client.query("COMMIT");
    return rows[0].resp;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  }
}

const client = new pg.Client({ connectionString: DB_URL });
await client.connect();

if (!APPLY) {
  console.log(`dry-run: would register ${ITEMS.length} mcp items + ${GRANTS.length} grants`);
  await client.end();
  process.exit(0);
}

let ok = 0;
for (const item of ITEMS) {
  const exists = await client.query(
    "SELECT id FROM library_items WHERE kind='mcp' AND name=$1 AND version IS NOT DISTINCT FROM $2",
    [item.name, item.version],
  );
  if (exists.rows.length > 0) {
    console.log(`exists  mcp/${item.name}@${item.version} (${exists.rows[0].id})`);
    ok += 1;
    continue;
  }
  await ceoAction(
    client,
    {
      action: "register_item",
      ...item,
      quality_score: 100,
      review_status: "approved",
    },
    `register ${item.name}`,
  );
  console.log(`registered mcp/${item.name}@${item.version}`);
  ok += 1;
}

for (const g of GRANTS) {
  const { rows } = await client.query(
    "SELECT id FROM library_items WHERE kind='mcp' AND name=$1 ORDER BY updated_at DESC LIMIT 1",
    [g.name],
  );
  if (rows.length === 0) throw new Error(`grant target missing: ${g.name}`);
  await ceoAction(
    client,
    { action: "grant", item_id: rows[0].id, grantee_kind: "department", grantee_id: g.dept },
    `grant ${g.name}→${g.dept}`,
  );
  console.log(`granted ${g.name} → ${g.dept}`);
  ok += 1;
}

console.log(`done: ${ok}/${ITEMS.length + GRANTS.length} ok`);
await client.end();
