#!/usr/bin/env node
// R4.2 — Holding Library enrichment (depth axis of roadmap row R4.2).
// Closes the measured gaps of the 2026-07-17 baseline: quality_score 0/438,
// real review 0/438, owner_dept NULL outside personas, library_grants 0.
//
//   node scripts/library/enrich.mjs --dry-run   scored plan, zero writes
//   node scripts/library/enrich.mjs --apply     write via control fn (CEO ctx)
//
// Every write goes through control_library_action in CEO context (adaptation
// A8 — §13 keeps mutations CEO-only; this script IS the CEO's tool run).
// Idempotency key = md5(payload): a re-run replays cached responses, never
// duplicates change_log rows.
//
// QUALITY FORMULA (deterministic, machine-measured — documented in
// .planning/research/R4.2-LIBRARY-GAP-MATRIX.md):
//   +40 source verified (per-kind: fs path exists / tool pinned non-quarantined
//        / mcp group file exists)
//   +20 owner_dept set (after this run's fill)
//   +20 usage_notes non-empty
//   +10 version present
//   +10 live-link (gateway kinds: capability resolvable today; persona: roster
//        file on disk)
// review_status: 'approved' when score ≥ 80 AND source verified, else
// 'needs_review'; rows already 'archived' keep their status (curated).
//
// GRANTS (core role-standard package v1): every active department × the 8
// dxb-mcp group items — an IDENTITY MIRROR of the live enforced surface
// (measured 2026-07-17: all 21 dept profiles carry the same 21 pinned dxb-mcp
// tools; the 8 group prefixes cover exactly those 21). The record becomes the
// governing layer (G3) with zero surface change; real per-department
// narrowing is a policy-file decision listed in the gap report — never done
// silently here.
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(
  new URL("../../packages/shared/package.json", import.meta.url),
);
const pg = require("pg");

const ROOT = fileURLToPath(new URL("../..", import.meta.url)).replace(/\/$/, "");
const HOME = homedir();
const APPLY = process.argv.includes("--apply");
const DB_URL =
  process.env.DXB_DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

// Custody map — which department CARES FOR the record (not a capability
// grant). NULL-fill only: intake/CEO-curated owners are never overwritten.
const KIND_CUSTODY = {
  skill: "platform",
  plugin: "platform",
  tool: "platform",
  mcp: "platform",
  code_component: "engineering",
  memory_source: "data-ai",
  design_system: "design",
  governance_rule: "ceo",
  project_doc: "ceo",
  research: "strategy",
  training: "people-hr", // U14: education dept not founded — HR carries training
};
// Per-item custody where one kind spans departments.
const NAME_CUSTODY = {
  "sop/design-verification-checklist": "design",
  "sop/i18n-purity-check": "quality",
  "policy/gateway-grants": "security",
  "policy/gateway-denials": "security",
  "report/solo-kadro-denetim-raporu": "people-hr",
  "report/design-bank-index": "design",
};
// Personas: intake left ceo-dir and _library rows NULL on purpose.
function personaCustody(sourceRef) {
  if (!sourceRef) return null;
  if (sourceRef.startsWith("personas/ceo/")) return "ceo";
  if (sourceRef.startsWith("personas/_library/")) return "people-hr";
  return null; // dept personas already owned
}

function custodyFor(item) {
  if (item.kind === "persona") return personaCustody(item.source_ref);
  return NAME_CUSTODY[`${item.kind}/${item.name}`] ?? KIND_CUSTODY[item.kind] ?? null;
}

function sourcePath(ref) {
  if (!ref) return null;
  if (ref.startsWith("~/")) return join(HOME, ref.slice(2));
  return join(ROOT, ref);
}

function sourceVerified(item, pins) {
  if (item.kind === "tool") {
    const [server, ...rest] = item.name.split(".");
    return pins.some(
      (p) => p.server === server && p.tool === rest.join(".") && !p.quarantined,
    );
  }
  const p = sourcePath(item.source_ref);
  return p ? existsSync(p) : false;
}

function liveLink(item, pins, verified) {
  // Gateway kinds: the capability resolves today; persona: roster file real.
  if (["tool", "mcp", "skill", "plugin", "persona"].includes(item.kind)) {
    if (item.kind === "tool") {
      const [server, ...rest] = item.name.split(".");
      return pins.some((p) => p.server === server && p.tool === rest.join("."));
    }
    return verified;
  }
  return false;
}

async function main() {
  const client = new pg.Client({ connectionString: DB_URL });
  await client.connect();

  const { rows: items } = await client.query(
    `SELECT id, kind, name, version, owner_dept, usage_notes, quality_score,
            review_status, source_ref
       FROM library_items ORDER BY kind, name`,
  );
  const { rows: pins } = await client.query(
    "SELECT server, tool, quarantined FROM tool_pins",
  );
  const { rows: deptRows } = await client.query("SELECT id, slug FROM departments ORDER BY slug");
  const deptById = new Map(deptRows.map((d) => [d.id, d.slug]));

  const updates = [];
  const stats = { owner_filled: 0, scored: 0, approved: 0, needs_review: 0, unchanged: 0 };

  for (const item of items) {
    const patch = {};
    let owner = item.owner_dept ? deptById.get(item.owner_dept) : null;
    if (!owner) {
      const custody = custodyFor(item);
      if (custody) {
        patch.owner_dept = custody;
        owner = custody;
        stats.owner_filled += 1;
      }
    }

    const verified = sourceVerified(item, pins);
    let score = 0;
    if (verified) score += 40;
    if (owner) score += 20;
    if (item.usage_notes && item.usage_notes.trim() !== "") score += 20;
    if (item.version) score += 10;
    if (liveLink(item, pins, verified)) score += 10;

    if (item.quality_score === null || Number(item.quality_score) !== score) {
      patch.quality_score = score;
    }
    if (item.review_status === "archived") {
      // curated archive — status untouched, metadata still enriched
    } else {
      const status = verified && score >= 80 ? "approved" : "needs_review";
      if (item.review_status !== status) patch.review_status = status;
      if (status === "approved") stats.approved += 1;
      else stats.needs_review += 1;
    }

    if (Object.keys(patch).length === 0) {
      stats.unchanged += 1;
      continue;
    }
    if ("quality_score" in patch) stats.scored += 1;
    updates.push({
      label: `enrich ${item.kind}/${item.name}`,
      payload: { action: "update_item", item_id: item.id, ...patch },
    });
  }

  // Core grant package v1: 21 departments × 8 dxb-mcp groups (identity mirror).
  const mcpItems = items.filter((i) => i.kind === "mcp");
  const grants = [];
  for (const dept of deptRows) {
    for (const mi of mcpItems) {
      grants.push({
        label: `grant ${mi.name} → ${dept.slug}`,
        payload: {
          action: "grant",
          item_id: mi.id,
          grantee_kind: "department",
          grantee_id: dept.slug,
        },
      });
    }
  }

  const mode = APPLY ? "APPLY" : "DRY-RUN";
  console.log(`\nHolding Library enrichment — ${mode} (${new Date().toISOString()})`);
  console.log(`items: ${items.length} · metadata updates planned: ${updates.length} (owner fills ${stats.owner_filled}, rescored ${stats.scored}, unchanged ${stats.unchanged})`);
  console.log(`review outcomes: approved ${stats.approved} · needs_review ${stats.needs_review} · archived preserved ${items.filter((i) => i.review_status === "archived").length}`);
  console.log(`grants planned: ${grants.length} (${deptRows.length} departments × ${mcpItems.length} dxb-mcp groups)`);

  if (APPLY) {
    let failed = 0;
    for (const act of [...updates, ...grants]) {
      const key = `enrich-${createHash("md5").update(JSON.stringify(act.payload)).digest("hex")}`;
      await client.query("BEGIN");
      try {
        await client.query(
          `SELECT set_config('request.jwt.claims',
             '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true)`,
        );
        const { rows } = await client.query(
          "SELECT control_library_action($1::jsonb, $2) AS resp",
          [JSON.stringify(act.payload), key],
        );
        if (!rows[0].resp.ok) throw new Error(`${act.label}: ${rows[0].resp.error} ${rows[0].resp.detail ?? ""}`);
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        console.error(`FAILED ${act.label}:`, err.message);
        failed += 1;
        process.exitCode = 1;
      }
    }
    console.log(`applied: ${updates.length + grants.length - failed} ok, ${failed} failed`);
  } else {
    console.log("dry-run: no writes performed. Re-run with --apply to enrich.");
  }

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
