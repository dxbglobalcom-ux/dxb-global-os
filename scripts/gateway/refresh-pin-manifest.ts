/**
 * refresh-pin-manifest — the ONE hand that touches the live MCP servers.
 *
 * B49. `db/seed/tool-pins.manifest.json` is what the construction seed pins
 * from; this script is what fills it. It is human-initiated by design, exactly
 * like `pin-arsenal.mjs` was for the live gateway (which this does NOT replace
 * and does not touch): the seed must be able to build the same bench on any
 * machine, and a machine whose servers disagree with the file must say so
 * instead of quietly seeding something else.
 *
 *   pnpm construction:pins:refresh    enumerate the live servers, write the file
 *   pnpm construction:pins:check      compare only; name every difference, exit 1
 *
 * It opens no database and writes no rows — the corpus is a file question.
 *
 * A partial answer is REFUSED: if any catalogued server failed to answer
 * tools/list, the file is left exactly as it was and the run exits 1 naming the
 * servers. Writing what could be reached would silently shrink the bench, which
 * is the same class of defect this row was opened to close.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFullInventory } from "../../packages/gateway/dist/index.js";
import {
  buildManifest,
  diffManifest,
  readManifest,
  serializeManifest,
  verifyManifest,
  MANIFEST_RELATIVE_PATH,
} from "../../db/seed/tool-pins-manifest.ts";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const MANIFEST = join(REPO, MANIFEST_RELATIVE_PATH);
const check = process.argv.includes("--check");

const inventory = await readFullInventory();
const failures = Object.entries(inventory.failures);
if (failures.length > 0) {
  for (const [server, err] of failures) console.error(`UNREACHABLE ${server}: ${err}`);
  console.error(
    `refusing to ${check ? "check" : "write"} ${MANIFEST_RELATIVE_PATH} from a partial corpus — ` +
      `${failures.length} catalogued server(s) did not answer. The file is unchanged.`,
  );
  process.exit(1);
}

const live = buildManifest(inventory.entries);
for (const server of Object.keys(live.servers).sort()) {
  console.log(`enumerated ${server}: ${live.servers[server]} tools`);
}
const total = live.tools.length;

if (check) {
  const manifest = readManifest(MANIFEST);
  // The file must first agree with ITSELF. Measured while proving this script
  // (2026-09-21): a manifest whose description had been edited by hand while
  // its stored hash stayed put passed the diff below and printed "matches" —
  // the diff compares the STORED hash against the machine and can never see a
  // body that drifted from its own hash. The seed would have refused it at
  // verify time; the check that is supposed to warn first must refuse it too.
  try {
    verifyManifest(manifest);
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    console.error(
      `${MANIFEST_RELATIVE_PATH} disagrees with ITSELF — the seed would refuse it. ` +
        "Run pnpm construction:pins:refresh to rebuild it from the live servers.",
    );
    process.exit(1);
  }
  const diff = diffManifest(manifest, inventory.entries);
  const trouble = diff.missingLive.length + diff.extraLive.length + diff.drifted.length;
  if (trouble === 0) {
    // The MANIFEST's own count, not the live one: a file that carried a row the
    // machine does not serve used to be reported with the machine's number, so
    // a 49-tool file printed "48 tools" (adversarial pass, 2026-09-21).
    console.log(`manifest matches the live servers: ${manifest.tools.length} tools`);
    process.exit(0);
  }
  for (const key of diff.missingLive) console.error(`MISSING FROM THE MACHINE ${key}`);
  for (const key of diff.extraLive) console.error(`NOT IN THE MANIFEST     ${key}`);
  for (const key of diff.drifted) console.error(`SCHEMA DRIFTED          ${key}`);
  console.error(
    `${MANIFEST_RELATIVE_PATH} and the live servers disagree on ${trouble} tool(s) — ` +
      "run pnpm construction:pins:refresh when the machine is the one that is right.",
  );
  process.exit(1);
}

const next = serializeManifest(live);
let current = "";
try {
  current = readFileSync(MANIFEST, "utf8");
} catch {
  current = "";
}
if (current === next) {
  console.log(`unchanged: ${MANIFEST_RELATIVE_PATH} already holds ${total} tools`);
  process.exit(0);
}
writeFileSync(MANIFEST, next);
console.log(
  `wrote ${MANIFEST_RELATIVE_PATH}: ${Object.keys(live.servers).length} servers, ${total} tools`,
);
