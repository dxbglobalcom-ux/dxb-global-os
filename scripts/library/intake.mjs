#!/usr/bin/env node
// E9.5 — Holding Library intake (HOLDING_LIBRARY_SPEC G4/§24/§26).
// Brings the EXISTING scattered assets into the record — skills dirs, plugin
// cache, tool_pins, dxb-mcp groups, personas/, gateway policy files, corpus
// docs, research, reports, study cards, workspace packages. Nothing invented:
// every row points at a real source (source_ref, §16 — body never enters DB).
//
//   node scripts/library/intake.mjs --dry-run   discovery report, zero writes
//   node scripts/library/intake.mjs --apply     register/update via control fn
//
// Writes go through control_library_action in CEO context (adaptation A8 —
// §13 keeps mutations CEO-only; this script IS the CEO's tool run, so every
// registration produces actor=ceo audit + change_log rows).
//
// Conservative update rule: existing rows only gain values for fields that
// are currently NULL (source_ref backfill etc.) — intake never overwrites
// CEO-curated metadata.
//
// §26: the report lists EVERY kind, including explicit zero-discovery kinds —
// silent gaps are forbidden.
import { readdirSync, statSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join } from "node:path";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

// pg lives in the workspace packages, not hoisted to the root (pnpm) — resolve
// it through @dxb/shared, the single sanctioned DB-access package.
const require = createRequire(
  new URL("../../packages/shared/package.json", import.meta.url),
);
const pg = require("pg");

// fileURLToPath, not URL.pathname — the repo root contains spaces and
// .pathname would leave them %20-encoded (readdir then finds nothing).
const ROOT = fileURLToPath(new URL("../..", import.meta.url)).replace(/\/$/, "");
const HOME = homedir();
const APPLY = process.argv.includes("--apply");
const DRY = process.argv.includes("--dry-run") || !APPLY;
const DB_URL =
  process.env.DXB_DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const KINDS = [
  "skill", "plugin", "tool", "mcp", "prompt_template", "persona", "policy",
  "governance_rule", "workflow", "sop", "framework", "code_component",
  "design_system", "research", "report", "project_doc", "training",
  "memory_source", "best_practice", "lesson_learned",
];

const listDirs = (p) => {
  try {
    return readdirSync(p).filter((f) => statSync(join(p, f)).isDirectory());
  } catch {
    return [];
  }
};
const listFiles = (p, ext) => {
  try {
    return readdirSync(p).filter((f) => (ext ? f.endsWith(ext) : true) && statSync(join(p, f)).isFile());
  } catch {
    return [];
  }
};

/** One discovered asset → control-fn payload fields. */
function asset(kind, name, { version = null, source_ref, usage_notes, owner_dept = null }) {
  return { kind, name, version, source_ref, usage_notes, owner_dept };
}

function discoverSkills() {
  const dir = join(HOME, ".claude", "skills");
  return listDirs(dir)
    .filter((d) => existsSync(join(dir, d, "SKILL.md")))
    .map((d) =>
      asset("skill", d, {
        source_ref: `~/.claude/skills/${d}`,
        usage_notes: "Claude Code skill (active skills directory).",
      }),
    );
}

function discoverPlugins() {
  const cache = join(HOME, ".claude", "plugins", "cache");
  const out = [];
  for (const marketplace of listDirs(cache)) {
    for (const plugin of listDirs(join(cache, marketplace))) {
      const versions = listDirs(join(cache, marketplace, plugin));
      const version = versions.sort().at(-1) ?? null;
      out.push(
        asset("plugin", plugin, {
          version,
          source_ref: `~/.claude/plugins/cache/${marketplace}/${plugin}`,
          usage_notes: `Claude Code plugin (marketplace: ${marketplace}).`,
        }),
      );
    }
  }
  return out;
}

async function discoverTools(client) {
  const { rows } = await client.query(
    "SELECT server, tool FROM tool_pins ORDER BY server, tool",
  );
  return rows.map((r) =>
    asset("tool", `${r.server}.${r.tool}`, {
      source_ref: "packages/dxb-mcp (pinned via tool_pins)",
      usage_notes: "Pinned MCP tool — schema-hash guarded (MCP-03).",
    }),
  );
}

function discoverMcpGroups() {
  const dir = join(ROOT, "packages/dxb-mcp/src/groups");
  return listFiles(dir, ".ts")
    .filter((f) => f !== "stub-error.ts")
    .map((f) => {
      const group = basename(f, ".ts");
      return asset("mcp", `dxb-mcp/${group}`, {
        source_ref: `packages/dxb-mcp/src/groups/${f}`,
        usage_notes: `DXB MCP tool group (${group}_* tools).`,
      });
    });
}

function discoverPersonas() {
  const dir = join(ROOT, "personas");
  const out = [];
  for (const dept of listDirs(dir)) {
    for (const f of listFiles(join(dir, dept), ".md")) {
      if (f === "README.md") continue;
      out.push(
        asset("persona", basename(f, ".md"), {
          source_ref: `personas/${dept}/${f}`,
          usage_notes:
            dept === "_library"
              ? null // curated archived templates — never overwrite their notes
              : `Employee persona (roster file, dept ${dept}); body lives in the personas table (§27 single source).`,
          owner_dept: dept === "_library" || dept === "ceo" ? null : dept,
        }),
      );
    }
  }
  return out;
}

function discoverPolicies() {
  return ["grants.json", "denials.json"]
    .filter((f) => existsSync(join(ROOT, "packages/gateway/policy", f)))
    .map((f) =>
      asset("policy", `gateway-${basename(f, ".json")}`, {
        source_ref: `packages/gateway/policy/${f}`,
        usage_notes: "MCP least-privilege policy input (profile compiler).",
      }),
    );
}

function discoverCorpusDocs() {
  const dir = join(ROOT, "HOLDING-OS-MASTER-PLAN");
  const gov = [];
  const docs = [];
  for (const f of listFiles(dir, ".md")) {
    const name = basename(f, ".md");
    if (name.startsWith("00-CEO-DIRECTIVE-")) {
      gov.push(
        asset("governance_rule", name, {
          source_ref: `HOLDING-OS-MASTER-PLAN/${f}`,
          usage_notes: "CEO directive (binding, corpus).",
        }),
      );
    } else {
      docs.push(
        asset("project_doc", name, {
          source_ref: `HOLDING-OS-MASTER-PLAN/${f}`,
          usage_notes: "Master-plan corpus document.",
        }),
      );
    }
  }
  return { gov, docs };
}

function discoverSops() {
  const out = [];
  if (existsSync(join(ROOT, "references/design-bank/CHECKLIST.md"))) {
    out.push(
      asset("sop", "design-verification-checklist", {
        source_ref: "references/design-bank/CHECKLIST.md",
        usage_notes: "RULE #0 design verification pass procedure.",
      }),
    );
  }
  if (existsSync(join(ROOT, "scripts/i18n-purity-check.sh"))) {
    out.push(
      asset("sop", "i18n-purity-check", {
        source_ref: "scripts/i18n-purity-check.sh",
        usage_notes: "Bilingual purity gate procedure (EN/TR parity).",
      }),
    );
  }
  return out;
}

function discoverResearch() {
  return listFiles(join(ROOT, ".planning/research"), ".md").map((f) =>
    asset("research", basename(f, ".md").toLowerCase(), {
      source_ref: `.planning/research/${f}`,
      usage_notes: "Project research document.",
    }),
  );
}

function discoverReports() {
  const out = [];
  if (existsSync(join(ROOT, "Solo -kadro denetim raporu.odt"))) {
    out.push(
      asset("report", "solo-kadro-denetim-raporu", {
        source_ref: "Solo -kadro denetim raporu.odt",
        usage_notes: "Workforce audit report (pre-directive artifact, Turkish).",
      }),
    );
  }
  if (existsSync(join(ROOT, "references/design-bank/INDEX.md"))) {
    out.push(
      asset("report", "design-bank-index", {
        source_ref: "references/design-bank/INDEX.md",
        usage_notes: "Design baseline acceptance ledger (CEO eye-test status).",
      }),
    );
  }
  return out;
}

function discoverTraining() {
  return listFiles(join(ROOT, ".planning/study-cards"), ".md").map((f) =>
    asset("training", basename(f, ".md"), {
      source_ref: `.planning/study-cards/${f}`,
      usage_notes: "Study card (tool onboarding material).",
    }),
  );
}

function discoverCodeComponents() {
  return listDirs(join(ROOT, "packages")).map((p) =>
    asset("code_component", `@dxb/${p}`, {
      source_ref: `packages/${p}`,
      usage_notes: "Workspace package (pnpm monorepo).",
    }),
  );
}

function discoverDesignSystem() {
  const out = [];
  if (existsSync(join(ROOT, "references/design-bank"))) {
    out.push(
      asset("design_system", "design-bank", {
        source_ref: "references/design-bank/",
        usage_notes: "Approved visual baselines + checklist (RULE #0 reference).",
      }),
    );
  }
  return out;
}

async function main() {
  const client = new pg.Client({ connectionString: DB_URL });
  await client.connect();

  const { gov, docs } = discoverCorpusDocs();
  const discovered = [
    ...discoverSkills(),
    ...discoverPlugins(),
    ...(await discoverTools(client)),
    ...discoverMcpGroups(),
    ...discoverPersonas(),
    ...discoverPolicies(),
    ...gov,
    ...discoverSops(),
    ...discoverResearch(),
    ...discoverReports(),
    ...docs,
    ...discoverTraining(),
    ...discoverCodeComponents(),
    ...discoverDesignSystem(),
  ];

  // Existing record (any version — the 15 archived _library personas carry
  // v1.0-legacy and must match by kind+name, not duplicate on version null).
  const { rows: existing } = await client.query(
    "SELECT id, kind, name, version, usage_notes, source_ref, owner_dept FROM library_items",
  );
  const byKindName = new Map();
  for (const row of existing) {
    const key = `${row.kind} ${row.name}`;
    byKindName.set(key, [...(byKindName.get(key) ?? []), row]);
  }
  const { rows: deptRows } = await client.query("SELECT id, slug FROM departments");
  const deptBySlug = new Map(deptRows.map((d) => [d.slug, d.id]));

  const stats = Object.fromEntries(
    KINDS.map((k) => [k, { discovered: 0, registered: 0, updated: 0, unchanged: 0 }]),
  );
  const actions = []; // {label, payload}

  for (const a of discovered) {
    stats[a.kind].discovered += 1;
    const matches = byKindName.get(`${a.kind} ${a.name}`) ?? [];
    const ownerDept = a.owner_dept && deptBySlug.has(a.owner_dept) ? a.owner_dept : null;

    if (matches.length === 0) {
      stats[a.kind].registered += 1;
      actions.push({
        label: `register ${a.kind}/${a.name}`,
        payload: {
          action: "register_item",
          kind: a.kind,
          name: a.name,
          version: a.version,
          source_ref: a.source_ref,
          usage_notes: a.usage_notes,
          owner_dept: ownerDept,
        },
      });
    } else if (matches.length === 1) {
      // NULL-fill only — CEO-curated metadata is never overwritten by intake.
      const row = matches[0];
      const patch = {};
      if (row.source_ref === null && a.source_ref) patch.source_ref = a.source_ref;
      if (row.usage_notes === null && a.usage_notes) patch.usage_notes = a.usage_notes;
      if (row.owner_dept === null && ownerDept) patch.owner_dept = ownerDept;
      if (Object.keys(patch).length > 0) {
        stats[a.kind].updated += 1;
        actions.push({
          label: `backfill ${a.kind}/${a.name}`,
          payload: { action: "update_item", item_id: row.id, ...patch },
        });
      } else {
        stats[a.kind].unchanged += 1;
      }
    } else {
      // Two active versions (§27) — ambiguous target, intake never guesses.
      stats[a.kind].unchanged += 1;
    }
  }

  // memory_source rows are seeded (E4) and have no scannable directory —
  // reported from the live record so the CEO sees the real count.
  stats.memory_source.unchanged = existing.filter((r) => r.kind === "memory_source").length;
  stats.memory_source.discovered = stats.memory_source.unchanged;

  if (APPLY) {
    for (const act of actions) {
      const key = `intake-${createHash("md5").update(JSON.stringify(act.payload)).digest("hex")}`;
      await client.query("BEGIN");
      try {
        // Adaptation A8: CEO context — intake is the CEO's tool run (§13).
        await client.query(
          `SELECT set_config('request.jwt.claims',
             '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true)`,
        );
        const { rows } = await client.query(
          "SELECT control_library_action($1::jsonb, $2) AS resp",
          [JSON.stringify(act.payload), key],
        );
        const resp = rows[0].resp;
        if (!resp.ok) throw new Error(`${act.label}: ${resp.error} ${resp.detail ?? ""}`);
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        console.error(`FAILED ${act.label}:`, err.message);
        process.exitCode = 1;
      }
    }
  }

  // ── report (§26: every kind visible, zero-rows explicit) ──────────────────
  const mode = APPLY ? "APPLY" : "DRY-RUN";
  console.log(`\nHolding Library intake — ${mode} (${new Date().toISOString()})`);
  console.log("kind               discovered  new  backfill  unchanged");
  console.log("─".repeat(58));
  for (const kind of KINDS) {
    const s = stats[kind];
    console.log(
      `${kind.padEnd(18)} ${String(s.discovered).padStart(10)} ${String(s.registered).padStart(4)} ${String(s.updated).padStart(9)} ${String(s.unchanged).padStart(10)}`,
    );
  }
  const zero = KINDS.filter((k) => stats[k].discovered === 0);
  console.log("─".repeat(58));
  console.log(`total discovered: ${discovered.length}; planned writes: ${actions.length}`);
  console.log(
    zero.length > 0
      ? `zero-discovery kinds (§26 — explicitly listed, no silent gaps): ${zero.join(", ")}`
      : "zero-discovery kinds: none",
  );
  if (DRY) console.log("dry-run: no writes performed. Re-run with --apply to register.");

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
