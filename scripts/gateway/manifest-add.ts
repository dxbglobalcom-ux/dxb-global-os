/**
 * manifest-add — the locked-tool review's last step, the construction engineer's (his yes of 2026-10-04,
 * PLAN-locked-tool.md step 4).
 *
 * The pin check locks a tool whose new text the repository does not vouch for; the security engineer
 * reviews it tool-less; the tool returns only when `db/seed/tool-pins.manifest.json` carries its new
 * text. This script is the hand that puts it there, AFTER A PERSON READ IT:
 *
 *   pnpm construction:pins:add <audit_id>          show the locked text, the signals, the seat's verdict;
 *                                                  write nothing
 *   pnpm construction:pins:add <audit_id> --yes    put the text into the manifest (replacing the tool's
 *                                                  entry), verify the file, write it
 *
 * Then commit the manifest. The lock lifts at the next tool check — the daily run, or the
 * tool-lock-watch catch-up when the last check is older than 24 h; the check reads the file fresh.
 *
 * It reads the company engine with SELECT only (the package script points DXB_DATABASE_URL at the
 * company; DXB_PINS_ADD_DATABASE_URL overrides it) — the audit row `tool_quarantined` carries the locked
 * text whole. `--manifest <path>` writes
 * another file (the tests).
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/dist/index.js";
import { computeToolHash } from "../../packages/gateway/dist/index.js";
import {
  readManifest,
  serializeManifest,
  verifyManifest,
  withTool,
  MANIFEST_RELATIVE_PATH,
} from "../../db/seed/tool-pins-manifest.ts";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const args = process.argv.slice(2);
const yes = args.includes("--yes");
const mIdx = args.indexOf("--manifest");
const manifestPath = mIdx >= 0 ? args[mIdx + 1]! : join(REPO, MANIFEST_RELATIVE_PATH);
const auditId = args.find((a, i) => /^\d+$/.test(a) && args[i - 1] !== "--manifest");

function fail(msg: string): never {
  console.error(`manifest-add: ${msg}`);
  process.exit(1);
}

if (!auditId) fail("usage: manifest-add <audit_id> [--yes] [--manifest <path>]");

const db = getDb();
try {
  const row = (
    await sql<{ action: string; payload: Record<string, unknown> }>`
      SELECT action, payload FROM audit_log WHERE id = ${Number(auditId)}
    `.execute(db)
  ).rows[0];
  if (!row) fail(`audit record ${auditId} does not exist`);
  if (row.action !== "tool_quarantined") fail(`audit record ${auditId} is '${row.action}', not a lock (tool_quarantined)`);
  const p = row.payload;
  const text = p.new_text as { description?: unknown; inputSchema?: unknown } | null;
  if (typeof p.server !== "string" || typeof p.tool !== "string" || !text || typeof text.description !== "string") {
    fail(`audit record ${auditId} carries no locked text`);
  }
  const entry = { server: p.server, tool: p.tool, description: text.description, inputSchema: text.inputSchema };
  // The record must agree with itself: the text it carries is the text that was locked.
  if (computeToolHash(entry) !== p.new_hash) fail(`audit record ${auditId}: the kept text does not hash to the locked hash`);

  const verdict = (
    await sql<{ payload: Record<string, unknown> }>`
      SELECT payload FROM audit_log
       WHERE action = 'tool_drift_verdict' AND (payload->>'lock_audit_id')::bigint = ${Number(auditId)}
       ORDER BY id DESC LIMIT 1
    `.execute(db)
  ).rows[0]?.payload;

  console.log(`Locked tool: ${entry.server}/${entry.tool} (audit record ${auditId})`);
  console.log(`Signals (they decide nothing): ${Array.isArray(p.signals) && p.signals.length ? p.signals.join(", ") : "none"}`);
  for (const line of Array.isArray(p.summary) ? p.summary : []) console.log(`  · ${String(line)}`);
  console.log(
    verdict
      ? `Security engineer's verdict: ${String(verdict.verdict)}${Array.isArray(verdict.reasons) && verdict.reasons.length ? ` — ${verdict.reasons.join(" | ")}` : ""}`
      : "Security engineer's verdict: none yet",
  );
  console.log("── the new text, whole ──");
  console.log(JSON.stringify({ description: entry.description, inputSchema: entry.inputSchema }, null, 2));

  if (!yes) {
    console.log(`Nothing written. Read the text above; to vouch for it: pnpm construction:pins:add ${auditId} --yes`);
    process.exit(0);
  }

  const before = readManifest(manifestPath);
  verifyManifest(before); // a file that disagrees with itself is never extended
  const after = withTool(before, entry);
  verifyManifest(after);
  writeFileSync(manifestPath, serializeManifest(after));
  const replaced = before.tools.some((t) => t.server === entry.server && t.tool === entry.tool);
  console.log(
    `${replaced ? "Replaced" : "Added"} ${entry.server}/${entry.tool} in ${manifestPath}. Commit it; the lock lifts at the next tool check.`,
  );
} finally {
  await closeDb();
}
