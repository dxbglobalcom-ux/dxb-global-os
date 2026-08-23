#!/usr/bin/env node
/**
 * schema-parity — prove the construction engine's schema IS the company's.
 *
 * B36 Block 2, risk R3: "Two engines drift apart in schema." One migration
 * folder feeds both, but a folder is an intention. This is the measurement.
 *
 * It asks BOTH servers the same eight questions about the `public` schema —
 * columns, constraints, indexes, functions, views, RLS policies, triggers,
 * sequences — sorted, rendered as text, hashed. Identical hash, identical
 * schema. On a mismatch it prints the first differing lines from each side so
 * the answer is the diff itself, not "they differ".
 *
 * The company is read with SELECT and nothing else (CLAUDE.md §5): every query
 * below is a catalogue read.
 *
 *   DXB_COMPANY_URL=…      the holding's engine
 *   DXB_CONSTRUCTION_URL=… the construction site's engine
 *
 * Exit 0 and SCHEMA_PARITY on identical; exit 1 and the diff otherwise.
 */
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// `pg` is a dependency of @dxb/shared, not of the repository root, and this is
// a pnpm workspace — so it is resolved from the package that owns it rather
// than from here. Same reason the other b36 drills ride the shared package.
const require = createRequire(
  join(dirname(fileURLToPath(import.meta.url)), "..", "..", "packages", "shared", "package.json"),
);
const pg = require("pg");

const COMPANY = process.env.DXB_COMPANY_URL;
const CONSTRUCTION = process.env.DXB_CONSTRUCTION_URL;
if (!COMPANY || !CONSTRUCTION) {
  console.error("schema-parity: DXB_COMPANY_URL and DXB_CONSTRUCTION_URL are both required.");
  process.exit(2);
}

/**
 * Eight catalogue questions. Each returns one text column, one row per object.
 * Everything is ordered inside SQL so two servers cannot disagree by accident
 * of collation of the transport.
 */
const QUESTIONS = {
  columns: `
    SELECT c.relname||'.'||a.attname||' '||format_type(a.atttypid, a.atttypmod)
           ||CASE WHEN a.attnotnull THEN ' NOT NULL' ELSE '' END
           ||coalesce(' DEFAULT '||pg_get_expr(d.adbin, d.adrelid), '') AS line
      FROM pg_attribute a
      JOIN pg_class c ON c.oid = a.attrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
     WHERE n.nspname = 'public' AND c.relkind IN ('r','p') AND a.attnum > 0 AND NOT a.attisdropped
     ORDER BY 1`,
  constraints: `
    SELECT c.relname||' '||con.conname||' '||pg_get_constraintdef(con.oid) AS line
      FROM pg_constraint con
      JOIN pg_class c ON c.oid = con.conrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public'
     ORDER BY 1`,
  indexes: `
    SELECT indexdef AS line FROM pg_indexes WHERE schemaname = 'public' ORDER BY 1`,
  functions: `
    SELECT p.proname||'('||pg_get_function_identity_arguments(p.oid)||') -> '
           ||pg_get_function_result(p.oid)||' '||p.prosecdef::text||' '||p.provolatile::text AS line
      FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public'
     ORDER BY 1`,
  views: `
    SELECT c.relname||' :: '||pg_get_viewdef(c.oid, true) AS line
      FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public' AND c.relkind IN ('v','m')
     ORDER BY 1`,
  view_columns: `
    SELECT c.relname||'.'||a.attname||' '||format_type(a.atttypid, a.atttypmod) AS line
      FROM pg_attribute a
      JOIN pg_class c ON c.oid = a.attrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public' AND c.relkind IN ('v','m') AND a.attnum > 0 AND NOT a.attisdropped
     ORDER BY 1`,
  policies: `
    SELECT tablename||' '||policyname||' '||cmd||' '||coalesce(qual,'-')||' '||coalesce(with_check,'-') AS line
      FROM pg_policies WHERE schemaname = 'public' ORDER BY 1`,
  triggers: `
    SELECT c.relname||' '||t.tgname||' '||pg_get_triggerdef(t.oid) AS line
      FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public' AND NOT t.tgisinternal
     ORDER BY 1`,
  sequences: `
    SELECT c.relname||' '||s.seqtypid::regtype::text||' start '||s.seqstart||' inc '||s.seqincrement AS line
      FROM pg_sequence s JOIN pg_class c ON c.oid = s.seqrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public'
     ORDER BY 1`,
};

async function ask(url) {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    const who = await client.query(
      `SELECT (SELECT system_identifier FROM pg_control_system())::text AS sysid,
              current_database() AS dbname`,
    );
    const out = { who: `${who.rows[0].sysid} / ${who.rows[0].dbname}` };
    for (const [name, sql] of Object.entries(QUESTIONS)) {
      const r = await client.query(sql);
      out[name] = r.rows.map((x) => x.line);
    }
    return out;
  } finally {
    await client.end();
  }
}

const digest = (lines) => createHash("sha256").update(lines.join("\n")).digest("hex").slice(0, 16);

/**
 * PostgreSQL's OWN default column labels, and nothing else.
 *
 * Measured 2026-08-23 on `public.v_alerts_active`: the company renders the
 * second arm of its UNION as `'approval'::text AS text` and the construction
 * engine renders it as `'approval'::text`. Same image (17.6.1.140), same server
 * version, same migration file — which has exactly one commit and was never
 * edited (`git log` on it). The company's stored parse tree simply carries the
 * label PostgreSQL assigns by default to a cast expression; the fresh chain's
 * does not.
 *
 * It cannot mean anything: a column alias in a NON-FIRST arm of a UNION is
 * discarded — the output names come from the first arm — and the gate proves
 * that separately and STRICTLY in `view_columns`, which is never normalised.
 *
 * So this strips ` AS x` in exactly one shape: where `x` is the very type the
 * expression was just cast to. `::text AS text`, `::uuid AS uuid`,
 * `::timestamp with time zone AS timestamptz`. Nothing a person would write on
 * purpose matches that, and every line it touches is printed.
 */
const TYPE_LABEL = {
  "timestamp with time zone": "timestamptz",
  "timestamp without time zone": "timestamp",
  "double precision": "float8",
  "character varying": "varchar",
};
function stripDefaultTypeLabels(line) {
  return line.replace(
    /::([a-z ]+?) AS ([a-z0-9_]+)/g,
    (whole, type, label) => (label === (TYPE_LABEL[type] ?? type) ? `::${type}` : whole),
  );
}

const [company, construction] = await Promise.all([ask(COMPANY), ask(CONSTRUCTION)]);

if (company.who.split(" / ")[0] === construction.who.split(" / ")[0]) {
  console.error(
    `schema-parity: both addresses reach the SAME cluster (${company.who.split(" / ")[0]}). ` +
      "There is nothing to compare and the separation is not real — refusing to print a green line.",
  );
  process.exit(1);
}

console.log(`company      : ${company.who}`);
console.log(`construction : ${construction.who}`);
console.log("");

let differing = 0;
for (const name of Object.keys(QUESTIONS)) {
  const a = company[name];
  const b = construction[name];
  let same = digest(a) === digest(b);
  let note = "same";
  // Views only, and only after the strict comparison has already failed: the
  // default type labels above are removed from BOTH sides and the comparison is
  // repeated. Every line the normaliser changed is printed below.
  let normalised = null;
  if (!same && name === "views") {
    const na = a.map(stripDefaultTypeLabels);
    const nb = b.map(stripDefaultTypeLabels);
    if (digest(na) === digest(nb)) {
      same = true;
      note = "same after removing PostgreSQL's own default type labels";
      normalised = a.filter((l, i) => l !== na[i]).concat(b.filter((l, i) => l !== nb[i]));
    }
  }
  console.log(
    `${name.padEnd(12)} company ${String(a.length).padStart(5)} ${digest(a)}  ` +
      `construction ${String(b.length).padStart(5)} ${digest(b)}  ${same ? note : "DIFFERENT"}`,
  );
  if (normalised) {
    for (const l of normalised) {
      console.log(`    normalised : ${l.split("\n")[0].slice(0, 100)} …`);
    }
    console.log(
      `    ${normalised.length} view definition(s) matched only after that removal. ` +
        "Their OUTPUT columns are compared strictly under `view_columns` and are identical.",
    );
  }
  if (!same) {
    differing++;
    const onlyCompany = a.filter((l) => !b.includes(l));
    const onlyConstruction = b.filter((l) => !a.includes(l));
    for (const l of onlyCompany.slice(0, 8)) console.log(`    only on the company      : ${l.slice(0, 160)}`);
    if (onlyCompany.length > 8) console.log(`    … and ${onlyCompany.length - 8} more only on the company`);
    for (const l of onlyConstruction.slice(0, 8)) console.log(`    only on the construction : ${l.slice(0, 160)}`);
    if (onlyConstruction.length > 8) console.log(`    … and ${onlyConstruction.length - 8} more only on the construction`);
  }
}

console.log("");
if (differing === 0) {
  console.log("SCHEMA_PARITY — the two engines carry the same public schema, object for object.");
  process.exit(0);
}
console.log(`SCHEMA_DRIFT — ${differing} of ${Object.keys(QUESTIONS).length} categories differ.`);
process.exit(1);
