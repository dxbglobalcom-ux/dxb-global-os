#!/usr/bin/env node
/**
 * make-construction-config — generate the construction stack's `config.toml`
 * from the company's, so the two can never drift apart by hand.
 *
 * B36 Block 2. The construction site gets its own Supabase stack: its own
 * containers, its own ports, its own volume. Everything else — extensions,
 * auth settings, realtime settings, the Postgres major version — must stay
 * identical to the company's, or the battery stops proving anything about the
 * company at all.
 *
 * So this file is NOT hand-written. It is derived, by exactly two rules:
 *
 *   1. `project_id`  DxB_Global_OS -> DxB_Build   (names the container set)
 *   2. every port     543NN        -> 544NN       (moves the whole stack)
 *   3. [db.migrations] enabled     -> false       (see below)
 *
 * Why rule 3. The CLI's own migration runner is NOT this project's schema
 * chain and cannot reproduce it. Measured 2026-08-23 on the first start of
 * this stack: `supabase start` walked 20260707000001 .. 20260712007950 and
 * died — `relation "pgboss.queue" does not exist`. pg-boss's schema is
 * RUNTIME-born (its own initializer creates it), and three migrations from
 * 20260712007950 onwards read it. The repository already owns the answer,
 * and has since audit F-08: `scripts/bootstrap-db.sh` is the one command that
 * takes an empty database to the full DXB schema — preamble, then pg-boss's
 * OWN initializer, then every db/migrations/*.sql in order. So the CLI brings
 * up the containers and that script builds the schema, which also means the
 * construction stack is built by exactly the chain a deploy uses.
 *
 * `tests/b36/construction-config.test.ts` re-runs this generator against the
 * company's live config and fails if the checked-in file is not byte-identical
 * to the result. Change the company's config and forget the construction one,
 * and the battery goes red in the same run.
 *
 * Usage:
 *   node scripts/b36/make-construction-config.mjs            # check (exit 1 on drift)
 *   node scripts/b36/make-construction-config.mjs --write    # regenerate
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const COMPANY_CONFIG = join(repo, "supabase", "config.toml");
export const CONSTRUCTION_CONFIG = join(repo, "construction", "supabase", "config.toml");

const HEADER = `# GENERATED — DO NOT EDIT BY HAND.
#
# The construction site's Supabase stack (B36 Block 2). Produced from the
# company's supabase/config.toml by scripts/b36/make-construction-config.mjs,
# which changes exactly two things and nothing else:
#
#   project_id           DxB_Global_OS -> DxB_Build
#   every port           543NN         -> 544NN
#   [db.migrations]      enabled=true  -> enabled=false
#
# The schema is NOT built by the CLI here. It is built by the project's own
# canonical chain, which is the only thing that can build it from empty:
#
#   DXB_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54422/postgres scripts/bootstrap-db.sh
#
# Edit supabase/config.toml and re-run the generator with --write.
# tests/b36/construction-config.test.ts fails the battery on any drift.
`;

/** The whole transformation, in one place. */
export function derive(companyToml) {
  const renamed = companyToml.replace(
    /^project_id = "DxB_Global_OS"$/m,
    'project_id = "DxB_Build"',
  );
  if (renamed === companyToml) {
    throw new Error("project_id line not found in the company config — refusing to guess");
  }
  // 543NN -> 544NN. Bounded by non-digits so a longer number is never touched.
  const moved = renamed.replace(/(?<!\d)543(\d\d)(?!\d)/g, "544$1");
  // [db.migrations] enabled = true -> false. Anchored to the section, never to
  // the first `enabled` line that happens to say true.
  const section = /(\[db\.migrations\][\s\S]*?\n)enabled = true\n/;
  if (!section.test(moved)) {
    throw new Error("[db.migrations] enabled = true not found — refusing to guess");
  }
  const noMigrations = moved.replace(section, "$1enabled = false\n");
  return HEADER + noMigrations;
}

const wanted = derive(readFileSync(COMPANY_CONFIG, "utf8"));

if (process.argv.includes("--write")) {
  writeFileSync(CONSTRUCTION_CONFIG, wanted);
  console.log(`wrote ${CONSTRUCTION_CONFIG}`);
} else {
  let have = null;
  try {
    have = readFileSync(CONSTRUCTION_CONFIG, "utf8");
  } catch {
    console.error("construction/supabase/config.toml is missing — run with --write");
    process.exit(1);
  }
  if (have !== wanted) {
    console.error("DRIFT — construction/supabase/config.toml is not what the company's config derives to.");
    console.error("Run: node scripts/b36/make-construction-config.mjs --write");
    process.exit(1);
  }
  console.log("construction config matches the company config (2 derivations applied)");
}
