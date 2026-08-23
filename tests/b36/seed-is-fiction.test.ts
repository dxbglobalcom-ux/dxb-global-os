import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "@dxb/shared";
import {
  companyFictionFor,
  projectFictionFor,
  storeNoteFor,
  MEMORY_STORES,
} from "../../db/seed/generated-holding-core.ts";
import { personaPathFor, titlePairFor } from "../../db/seed/generated-workforce.ts";

// B36 · the independent auditor's third FAIL on Block 2, 2026-08-23:
//
//   "The seed must not copy the real persona and employee-record entries; it
//    must generate entirely synthetic data.
//    db/seed/build-seed.ts:137 pulls in the real 199-employee personas, and
//    :205 copies the sicil entries out of the files one for one. The approved
//    plan (PLAN.md:222) says in as many words: `entirely fictional` and `not
//    one row of his`."
//
// He was right, and it was the largest of the three: measured before the fix,
// 199 of 199 persona bodies on the construction engine were a dossier file
// byte for byte, and 975 sicil field values were copied word for word.
//
// WHAT MAY TRAVEL AND WHAT MAY NOT. The construction site's workforce carries
// the REAL SLUGS — `cfo`, `ciso`, `head-of-commerce` — and it must: those names
// arrive through db/migrations, the same chain a deploy runs, and the E12.5
// workforce gate holds the promise ledger's 67 of them to account by name. A
// slug is a key, not a record. What may not travel is what was WRITTEN: the
// authored persona body, and the sicil the CEO's own dossiers carry. Those are
// generated here from the shape of the row, and the fiction is announced inside
// the text itself.
//
// ─────────────────────────────────────────────────────────────────────────────
// AND THE HOLDING ITSELF — the RE-AUDIT of the same evening. The first answer
// made the workforce synthetic and stopped there. The auditor read on:
//
//   "Employee persona and sicil are synthetic now, but build-seed.ts:121 still
//    runs db/seed/20260711_holding_core.sql and copies the real DXB Global
//    company, its mission and the DXB Global OS project."
//
// He was right, and it was larger than the line he cited: the migration chain
// seeds a SECOND project (`revenue-discovery`) with its own authored purpose and
// its own real document link, and two later migrations write the Turkish halves
// of both. Cases (5)-(8) below hold the company, its projects and the four
// memory-store notes to the same rule the workforce is held to, and they hold it
// from BOTH sides: every row must BE the generated fiction, and none of the
// authored text this repository carries may appear anywhere in those tables.
//
// The KEYS stay and are named where they are used: `dxb-global` is read by four
// migrations and by a live database function, `dxb-global-os` by the
// orchestrator and by tests/r23, and the four memory-store NAMES by the CEO's
// Bellek page. The CEO's own line, 2026-08-23: *"Testlerin ihtiyaç duyduğu
// yapısal anahtarlar kalabilir; şirket adı, görev metni, proje adı/amacı ve
// gerçek dosya bağlantıları kopyalanamaz."*
// ─────────────────────────────────────────────────────────────────────────────

const REPO = join(process.cwd());
const db = () => getDb();

afterAll(async () => {
  await closeDb();
});

/** Every persona dossier's authored body, exactly as the file-first sync reads it. */
function dossierBodies(): Map<string, string> {
  const out = new Map<string, string>();
  for (const dept of readdirSync(join(REPO, "personas"))) {
    const dir = join(REPO, "personas", dept);
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      continue;
    }
    for (const file of entries) {
      if (!file.endsWith(".md") || file === "README.md") continue;
      const lines = readFileSync(join(dir, file), "utf8").split("\n");
      const start = lines.findIndex((l) => l.startsWith("# PERSONA — "));
      if (start < 0) continue;
      out.set(file.replace(/\.md$/, ""), lines.slice(start).join("\n"));
    }
  }
  return out;
}

/** Lines long enough that sharing one is copying, not coincidence. */
function distinctiveLines(bodies: Iterable<string>): Set<string> {
  const out = new Set<string>();
  for (const body of bodies) {
    for (const line of body.split("\n")) {
      const t = line.trim();
      if (t.length >= 60) out.add(t);
    }
  }
  return out;
}

/** The sicil values the file-first tool copies (row numbers, not labels — the
 *  labels changed language, the numbers never did). */
const SICIL_ROWS = new Set([10, 11, 12, 13, 15, 17, 18, 20]);
function dossierSicilValues(): Set<string> {
  const out = new Set<string>();
  for (const dept of readdirSync(join(REPO, "personas"))) {
    let entries: string[];
    try {
      entries = readdirSync(join(REPO, "personas", dept));
    } catch {
      continue;
    }
    for (const file of entries) {
      if (!file.endsWith(".md")) continue;
      const seen = new Set<number>();
      for (const line of readFileSync(join(REPO, "personas", dept, file), "utf8").split("\n")) {
        const m = /^\|\s*(\d+)\s*\|[^|]*\|(.*)\|\s*$/.exec(line);
        if (!m) continue;
        const n = Number(m[1]);
        if (!SICIL_ROWS.has(n) || seen.has(n)) continue;
        seen.add(n);
        const v = m[2].trim().replace(/^`|`$/g, "").trim();
        if (v.length >= 40) out.add(v);
      }
    }
  }
  return out;
}

const md5 = (s: string): string => createHash("md5").update(s).digest("hex");

/**
 * The four places this repository writes company and project TEXT. They are
 * named rather than discovered: a broad scan of every migration returns 426
 * literals of column names and SQL fragments, and a check with that much noise
 * is a check nobody can trust. If a fifth source appears, case (8)'s anchors are
 * what will notice — it fails when the extraction stops finding what it knows
 * must be there.
 */
const HOLDING_TEXT_SOURCES: Array<[string, RegExp]> = [
  ["db/seed/20260711_holding_core.sql", /^\s*INSERT\s+INTO\s+public\.(companies|projects)\b/i],
  ["db/migrations/20260726009100_revenue_discovery_project.sql", /^\s*INSERT\s+INTO\s+public\.projects\b/i],
  ["db/migrations/20260726011100_project_purpose_tr.sql", /^\s*UPDATE\s+public\.projects\s+SET\s+purpose_tr\b/i],
  ["db/migrations/20260726012500_project_name_tr.sql", /^\s*UPDATE\s+public\.projects\s+SET\s+name_tr\b/i],
];

/**
 * Split SQL into statements WITHOUT being fooled by a semicolon inside a string.
 * Measured on these four files: 9 of their literals contain one — the company's
 * own mission among them ("…states intent once; the company executes…"), so a
 * naive split truncates exactly the text this check exists to find. Comments are
 * dropped; dollar-quoting is not handled and does not need to be — none of the
 * four files contains `$$`, and `authoredHoldingText` refuses to read one that
 * does rather than quietly mis-parsing it.
 */
function statementsOf(sqlText: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inString = false;
  let i = 0;
  while (i < sqlText.length) {
    const ch = sqlText[i];
    if (inString) {
      if (ch === "'" && sqlText[i + 1] === "'") { cur += "''"; i += 2; continue; }
      if (ch === "'") { inString = false; cur += ch; i += 1; continue; }
      cur += ch; i += 1; continue;
    }
    if (ch === "'") { inString = true; cur += ch; i += 1; continue; }
    if (ch === "-" && sqlText[i + 1] === "-") {
      while (i < sqlText.length && sqlText[i] !== "\n") i += 1;
      continue;
    }
    if (ch === ";") { out.push(cur); cur = ""; i += 1; continue; }
    cur += ch; i += 1;
  }
  if (cur.trim()) out.push(cur);
  return out;
}

/** The authored text those sources carry — read out of them, never typed here. */
function authoredHoldingText(): Set<string> {
  const out = new Set<string>();
  for (const [file, opening] of HOLDING_TEXT_SOURCES) {
    const text = readFileSync(join(REPO, file), "utf8");
    if (text.includes("$$")) {
      throw new Error(`${file} now uses dollar-quoting — statementsOf() would mis-parse it`);
    }
    for (const stmt of statementsOf(text)) {
      if (!opening.test(stmt)) continue;
      for (const lit of stmt.matchAll(/'((?:[^']|'')*)'/g)) {
        const v = lit[1].replace(/''/g, "'").trim();
        if (v.length >= 10) out.add(v);
      }
    }
  }
  return out;
}


/**
 * THE TITLES THE COMPANY GAVE ITS PEOPLE — read out of the repository's own two
 * sources, never typed here.
 *
 *   english  row 3 of every persona dossier (the row NUMBER is stable across the
 *            TR/EN label eras; the label is not — the file-first sync matches by
 *            number for exactly this reason)
 *   turkish  `db/migrations/20260713023000_org_bilingual_complete_v15.sql`, which
 *            carries 133 `UPDATE public.agents SET title_tr='…' WHERE slug='…'`
 *            statements and is where the 132 real Turkish titles came from
 */
function companyTitles(): { english: Set<string>; turkish: Set<string> } {
  const english = new Set<string>();
  for (const dept of readdirSync(join(REPO, "personas"))) {
    let entries: string[];
    try {
      entries = readdirSync(join(REPO, "personas", dept));
    } catch {
      continue;
    }
    for (const file of entries) {
      if (!file.endsWith(".md")) continue;
      for (const line of readFileSync(join(REPO, "personas", dept, file), "utf8").split("\n")) {
        const m = /^\|\s*3\s*\|[^|]*\|(.*)\|\s*$/.exec(line);
        if (!m) continue;
        const v = m[1].trim().replace(/^`|`$/g, "").trim();
        if (v.length >= 3) english.add(v);
        break; // row 3 of the sicil table — the first occurrence is the one
      }
    }
  }
  const turkish = new Set<string>();
  const mig = readFileSync(
    join(REPO, "db/migrations/20260713023000_org_bilingual_complete_v15.sql"),
    "utf8",
  );
  for (const m of mig.matchAll(
    /UPDATE\s+public\.agents\s+SET\s+title_tr\s*=\s*'((?:[^']|'')*)'/gi,
  )) {
    turkish.add(m[1].replace(/''/g, "'").trim());
  }
  return { english, turkish };
}

/** Which of those authored strings this value carries. */
const hits = (value: string, authored: Set<string>): string[] =>
  [...authored].filter((a) => value.includes(a));

/** One spelling for one object, whatever order its keys arrived in. */
function canonical(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(canonical).join(",")}]`;
  if (v && typeof v === "object") {
    return `{${Object.entries(v as Record<string, unknown>)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([k, x]) => `${JSON.stringify(k)}:${canonical(x)}`)
      .join(",")}}`;
  }
  return JSON.stringify(v);
}

describe("B36 — the construction site's workforce is fiction, not his record", () => {
  // THE INSTRUMENT FIRST. A comparison that can find nothing reports a
  // comfortable zero and proves nothing at all.
  it("(0) the dossier corpus is real and the comparison can register a copy", () => {
    const bodies = dossierBodies();
    expect(bodies.size, "no persona dossiers were read — the comparison is blind").toBeGreaterThan(
      150,
    );
    const lines = distinctiveLines(bodies.values());
    expect(lines.size, "no distinctive lines were extracted").toBeGreaterThan(1000);
    const values = dossierSicilValues();
    expect(values.size, "no sicil values were extracted").toBeGreaterThan(500);

    // A positive control: a body taken straight out of a dossier IS recognised.
    const [, sample] = [...bodies][0];
    const fileHashes = new Set([...bodies.values()].map((b) => md5(b)));
    expect(fileHashes.has(md5(sample)), "the md5 comparison cannot see an exact copy").toBe(true);
    expect(
      sample.split("\n").some((l) => lines.has(l.trim())),
      "the line comparison cannot see a copied line",
    ).toBe(true);
  });

  it("(1) no persona body stored here is a dossier file", async () => {
    const hashes = [...dossierBodies().values()].map((b) => md5(b));
    const r = await sql<{ n: string; who: string | null }>`
      SELECT count(*)::text n,
             string_agg(DISTINCT a.slug, ', ' ORDER BY a.slug) who
        FROM personas p JOIN agents a ON a.id = p.employee_id
       WHERE md5(p.body_md) = ANY(${hashes})`.execute(db());
    expect(
      Number(r.rows[0].n),
      `persona rows holding a dossier file byte for byte: ${r.rows[0].who ?? ""}`,
    ).toBe(0);
  });

  it("(2) no persona body stored here shares an authored line with a dossier", async () => {
    const lines = distinctiveLines(dossierBodies().values());
    const rows = await sql<{ slug: string; body_md: string }>`
      SELECT a.slug, p.body_md FROM personas p JOIN agents a ON a.id = p.employee_id`.execute(db());
    expect(rows.rows.length, "there are no personas here to judge").toBeGreaterThan(150);
    const copied: string[] = [];
    for (const row of rows.rows) {
      const hit = row.body_md.split("\n").find((l) => lines.has(l.trim()));
      if (hit) copied.push(`${row.slug}: ${hit.trim().slice(0, 90)}`);
    }
    expect(copied.slice(0, 8), `${copied.length} persona rows carry authored dossier lines`).toEqual(
      [],
    );
  });

  it("(3) no employee record here carries a sicil entry out of a dossier", async () => {
    const values = [...dossierSicilValues()];
    const r = await sql<{ n: string }>`
      SELECT count(*)::text n
        FROM employee_records e
        CROSS JOIN LATERAL unnest(
          ARRAY[e.decision_scope, e.methodology, e.reporting_standard,
                e.quality_standard, e.escalation_rules]
          || coalesce(e.responsibilities, '{}')
          || coalesce(e.authority_limits, '{}')
          || coalesce(e.expertise, '{}')) AS f(v)
       WHERE f.v = ANY(${values})`.execute(db());
    expect(Number(r.rows[0].n), "sicil field values copied verbatim from his dossiers").toBe(0);
  });

  it("(4) and the workforce is still whole — fiction, not an empty table", async () => {
    const r = await sql<{ personas: string; employees: string; records: string; live: string }>`
      SELECT (SELECT count(DISTINCT employee_id)::text FROM personas) personas,
             (SELECT count(*)::text FROM agents WHERE employment_status <> 'archived') employees,
             (SELECT count(*)::text FROM employee_records) records,
             (SELECT count(*)::text FROM agents a JOIN personas p ON p.id = a.persona_id
               WHERE p.quality_gate = 'passed' AND a.employment_status <> 'archived') live`.execute(
      db(),
    );
    const got = r.rows[0];
    expect(Number(got.personas), "employees without a persona of their own").toBe(
      Number(got.employees),
    );
    expect(Number(got.live), "employees whose persona is not bound and passed").toBe(
      Number(got.employees),
    );
    expect(Number(got.records), "employees without a sicil row").toBe(Number(got.employees));
    expect(Number(got.employees)).toBeGreaterThan(150);
  });

  // ── the holding itself ─────────────────────────────────────────────────────

  it("(5) every company row IS the generated fiction, name and mission", async () => {
    const rows = await sql<{ slug: string; name: string; mission: string | null }>`
      SELECT slug, name, mission FROM companies ORDER BY slug`.execute(db());
    expect(rows.rows.length, "there is no company here at all").toBeGreaterThan(0);
    const wrong = rows.rows
      .filter((r) => {
        const f = companyFictionFor(r.slug);
        return r.name !== f.name || r.mission !== f.mission;
      })
      .map((r) => `${r.slug}: name="${r.name}" mission="${String(r.mission).slice(0, 70)}…"`);
    expect(wrong, "company rows that are not what the seed generates for them").toEqual([]);
  });

  it("(6) every project row IS the generated fiction — both languages, link and links", async () => {
    const rows = await sql<{
      slug: string; name: string; name_tr: string | null; purpose: string;
      purpose_tr: string | null; strategy_link: string | null; links: unknown;
    }>`
      SELECT slug, name, name_tr, purpose, purpose_tr, strategy_link, links
        FROM projects ORDER BY slug`.execute(db());
    expect(rows.rows.length, "there are no projects here at all").toBeGreaterThan(0);
    const wrong: string[] = [];
    for (const r of rows.rows) {
      const f = projectFictionFor(r.slug);
      const mismatched = [
        r.name === f.name ? null : `name="${r.name}"`,
        r.name_tr === f.name_tr ? null : `name_tr="${String(r.name_tr)}"`,
        r.purpose === f.purpose ? null : `purpose="${r.purpose.slice(0, 60)}…"`,
        r.purpose_tr === f.purpose_tr ? null : `purpose_tr="${String(r.purpose_tr).slice(0, 60)}…"`,
        r.strategy_link === f.strategy_link ? null : `strategy_link="${String(r.strategy_link)}"`,
        // jsonb comes back with its keys in the server's order, not the
        // generator's — compare the CONTENT, with the keys put in one order
        // first. Measured: the server returns docs/repos/deploys/versions and
        // the generator writes repos/docs/deploys/versions, which is the same
        // object and a different string.
        canonical(r.links) === canonical(JSON.parse(f.links))
          ? null
          : `links=${canonical(r.links)}`,
      ].filter(Boolean);
      if (mismatched.length) wrong.push(`${r.slug}: ${mismatched.join(" · ")}`);
    }
    expect(wrong, "project rows that are not what the seed generates for them").toEqual([]);
  });

  it("(7) the four memory-store notes are generated, not the catalogue's own", async () => {
    const rows = await sql<{ name: string; usage_notes: string | null }>`
      SELECT name, usage_notes FROM library_items WHERE kind = 'memory_source' ORDER BY name`
      .execute(db());
    // The NAMES are the identity the CEO's Bellek page joins on — they must all
    // still be here.
    expect(rows.rows.map((r) => r.name).sort()).toEqual([...MEMORY_STORES].sort());
    const wrong = rows.rows
      .filter((r) => r.usage_notes !== storeNoteFor(r.name))
      .map((r) => `${r.name}: "${String(r.usage_notes).slice(0, 70)}…"`);
    expect(wrong, "memory-store notes that are not generated").toEqual([]);
  });

  it("(8) and none of the holding's own authored text is anywhere in those tables", async () => {
    const authored = authoredHoldingText();
    // THE KEYS ARE NOT THE TEXT. The CEO's own line, 2026-08-23: *"Testlerin
    // ihtiyaç duyduğu yapısal anahtarlar kalabilir; şirket adı, görev metni,
    // proje adı/amacı ve gerçek dosya bağlantıları kopyalanamaz."* A slug is
    // read by code — four migrations and a live database function read
    // `dxb-global`, the orchestrator reads `dxb-global-os` — and the generated
    // text names its own key on purpose, so a reader can tell which fixture row
    // they are looking at. The keys are taken from the LIVE database rather than
    // typed here, so this exemption can never quietly grow.
    const keys = await sql<{ k: string }>`
      SELECT slug AS k FROM companies
      UNION ALL SELECT slug FROM projects
      UNION ALL SELECT slug FROM agents
      UNION ALL SELECT name FROM library_items WHERE kind = 'memory_source'`.execute(db());
    expect(keys.rows.length, "no structural keys were read — the exemption is unmeasured")
      .toBeGreaterThan(100);
    for (const r of keys.rows) authored.delete(r.k);
    // THE INSTRUMENT FIRST. If the extraction found nothing, or missed the
    // company's own name, this case would pass on an empty question.
    expect(authored.size, "no authored holding text was extracted — the check is blind")
      .toBeGreaterThan(8);
    for (const anchor of [
      "DXB Global",
      "DXB Global OS",
      "Revenue Discovery",
      "HOLDING-OS-MASTER-PLAN/MASTER_PLAN.md",
    ]) {
      expect(authored.has(anchor), `the extraction missed '${anchor}'`).toBe(true);
    }
    // A positive control: the real mission, fed through the same containment
    // rule, IS caught.
    const realMission = [...authored].find((v) => v.startsWith("AI-native technology"));
    expect(realMission, "the company's real mission was not extracted").toBeTruthy();
    expect(hits(String(realMission), authored).length, "the containment rule cannot see a copy")
      .toBeGreaterThan(0);

    const rows = await sql<{ what: string; value: string }>`
      SELECT 'companies.' || slug || '.name' AS what, name AS value FROM companies
      UNION ALL SELECT 'companies.' || slug || '.mission', coalesce(mission, '') FROM companies
      UNION ALL SELECT 'projects.' || slug || '.name', name FROM projects
      UNION ALL SELECT 'projects.' || slug || '.name_tr', coalesce(name_tr, '') FROM projects
      UNION ALL SELECT 'projects.' || slug || '.purpose', purpose FROM projects
      UNION ALL SELECT 'projects.' || slug || '.purpose_tr', coalesce(purpose_tr, '') FROM projects
      UNION ALL SELECT 'projects.' || slug || '.strategy_link', coalesce(strategy_link, '') FROM projects
      UNION ALL SELECT 'projects.' || slug || '.links', links::text FROM projects
      UNION ALL SELECT 'library_items.' || name || '.usage_notes', coalesce(usage_notes, '')
                  FROM library_items WHERE kind = 'memory_source'`.execute(db());
    expect(rows.rows.length, "nothing was read back to judge").toBeGreaterThan(10);
    const copied: string[] = [];
    for (const r of rows.rows) {
      for (const h of hits(r.value, authored)) copied.push(`${r.what} carries "${h.slice(0, 80)}"`);
    }
    expect(copied, `${copied.length} value(s) carry the holding's own authored text`).toEqual([]);
  });

  // ── the last three columns that were still his ─────────────────────────────

  it("(9) no employee's persona document is one of his — and every generated path is real", async () => {
    const rows = await sql<{ slug: string; persona_path: string | null }>`
      SELECT slug, persona_path FROM agents ORDER BY slug`.execute(db());
    expect(rows.rows.length, "there are no employees here at all").toBeGreaterThan(200);

    // The defect, stated as the auditor stated it: a path into the CEO's own
    // dossier tree. Archived seats included — six of them pointed at OTHER
    // people's dossiers.
    const intoHisTree = rows.rows
      .filter((r) => (r.persona_path ?? "").startsWith("personas/"))
      .map((r) => `${r.slug} → ${r.persona_path}`);
    expect(
      intoHisTree.slice(0, 8),
      `${intoHisTree.length} employee(s) still point at the repository's real dossier tree`,
    ).toEqual([]);

    const wrong = rows.rows
      .filter((r) => r.persona_path !== personaPathFor(r.slug))
      .map((r) => `${r.slug}: ${String(r.persona_path)}`);
    expect(wrong.slice(0, 8), "paths that are not what the seed generates").toEqual([]);

    // A generated path that is not on disk would break the workforce gate, the
    // registry tool and the live answer lane — the reason the seed writes the
    // document rather than only naming it.
    const missing = rows.rows
      .filter((r) => !existsSync(join(REPO, r.persona_path ?? "")))
      .map((r) => `${r.slug}: ${String(r.persona_path)}`);
    expect(missing.slice(0, 8), "generated persona documents that do not exist").toEqual([]);
  });

  it("(10) no employee wears a title the company gave him — either language", async () => {
    const { english, turkish } = companyTitles();
    // THE INSTRUMENT FIRST.
    expect(english.size, "no dossier titles were read — the check is blind").toBeGreaterThan(100);
    expect(turkish.size, "no Turkish titles were read — the check is blind").toBeGreaterThan(130);
    expect(english.has("Head of Commerce"), "the English extraction missed a known title").toBe(true);
    expect(turkish.has("CEO Ofisi Müdürü"), "the Turkish extraction missed a known title").toBe(true);

    const rows = await sql<{
      slug: string; title: string | null; title_tr: string | null;
      department: string | null; role_level: string | null;
    }>`SELECT slug, title, title_tr, department, role_level FROM agents ORDER BY slug`.execute(db());
    const worn = rows.rows
      .filter((r) => english.has(r.title ?? "\u0000") || turkish.has(r.title_tr ?? "\u0000"))
      .map((r) => `${r.slug}: "${String(r.title)}" / "${String(r.title_tr)}"`);
    expect(
      worn.slice(0, 8),
      `${worn.length} employee(s) wear a title taken from the company`,
    ).toEqual([]);

    const wrong = rows.rows
      .filter((r) => {
        const t = titlePairFor(r);
        return r.title !== t.title || r.title_tr !== t.title_tr;
      })
      .map((r) => `${r.slug}: "${String(r.title)}" / "${String(r.title_tr)}"`);
    expect(wrong.slice(0, 8), "titles that are not what the seed generates").toEqual([]);
  });
});
