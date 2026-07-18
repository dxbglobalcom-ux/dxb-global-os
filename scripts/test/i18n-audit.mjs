// L6 i18n completeness auditor (TEST_STRATEGY §24 command set — exact
// output contract: "EN keys == TR keys, missing: 0"). Deep-compares the
// two dictionary trees key-by-key in BOTH directions; any asymmetry lists
// the offending dotted paths and exits non-zero.
//   node scripts/test/i18n-audit.mjs
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "../..");
const load = (l) =>
  JSON.parse(readFileSync(join(REPO, `apps/dashboard/messages/${l}.json`), "utf8"));

const flatten = (obj, prefix = "") =>
  Object.entries(obj).flatMap(([k, v]) =>
    v !== null && typeof v === "object"
      ? flatten(v, `${prefix}${k}.`)
      : [`${prefix}${k}`],
  );

const en = new Set(flatten(load("en")));
const tr = new Set(flatten(load("tr")));
const missingInTr = [...en].filter((k) => !tr.has(k));
const missingInEn = [...tr].filter((k) => !en.has(k));
const missing = missingInTr.length + missingInEn.length;

for (const k of missingInTr) console.error(`missing in tr: ${k}`);
for (const k of missingInEn) console.error(`missing in en: ${k}`);
console.log(
  missing === 0
    ? `EN keys == TR keys, missing: 0 (${en.size} keys)`
    : `EN keys ${en.size} / TR keys ${tr.size}, missing: ${missing}`,
);
process.exit(missing === 0 ? 0 : 1);
