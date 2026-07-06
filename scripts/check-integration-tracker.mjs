#!/usr/bin/env node
// check-integration-tracker.mjs — INTEG-01 / INTEG-02 compliance check.
// Rules:
//   1. Row floor: >=49 non-EXCLUDED main-table rows AND >=4 EXCLUDED rows.
//   2. Status enum: every main-table Status cell is exactly one of
//      STUDY|INSTALL|ADOPT|EMBED|EXCLUDED (bare token, no qualifiers).
//   3. Study-card coverage: every non-EXCLUDED row's Study Card file exists
//      under .planning/research/ (EXCLUDED rows exempt).
//   4. Excluded completeness: kickbacks.ai, automaton, llm-council, ToS-gray
//      all present in the "## Excluded Items" register.
//   5. Re-admission rule: a register item whose main-table Status is not
//      EXCLUDED requires a dated CEO entry in "## Re-admission Log".
// CLI: node scripts/check-integration-tracker.mjs   (exit 0 = compliant)
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const TRACKER = ".planning/research/INTEGRATION-TRACKER.md";
const BASE = ".planning/research";
const ENUM = new Set(["STUDY", "INSTALL", "ADOPT", "EMBED", "EXCLUDED"]);

const text = readFileSync(TRACKER, "utf8");
const failures = [];

// ---- main table (everything above "## Excluded Items") ----
const main = text.split("## Excluded Items")[0];
const rows = main
  .split("\n")
  .filter((l) => /^\|/.test(l) && !/^\|\s*-+/.test(l))
  .map((l) => l.split("|").map((s) => s.trim()))
  // data rows: first cell (before leading pipe) empty, Status cell present, not header
  .filter((c) => c[0] === "" && c[3] && c[3] !== "Status");

// Rule 2 — status enum
const badStatus = rows.filter((c) => !ENUM.has(c[3]));
if (badStatus.length)
  failures.push(
    "Rule 2 (status enum): " +
      badStatus.map((c) => `${c[1]} -> "${c[3]}"`).join("; ")
  );

// Rule 1 — row floor
const excludedRows = rows.filter((c) => c[3] === "EXCLUDED");
const nonExcluded = rows.filter((c) => ENUM.has(c[3]) && c[3] !== "EXCLUDED");
if (nonExcluded.length < 49)
  failures.push(`Rule 1: non-EXCLUDED rows ${nonExcluded.length} < 49`);
if (excludedRows.length < 4)
  failures.push(`Rule 1: EXCLUDED rows ${excludedRows.length} < 4`);

// Rule 3 — study-card coverage (EXCLUDED exempt)
const missingCards = [];
for (const c of nonExcluded) {
  const card = c[7];
  if (!card || card === "-") {
    missingCards.push(`${c[1]} (no Study Card path)`);
    continue;
  }
  if (!existsSync(path.join(BASE, card))) missingCards.push(`${c[1]} -> ${card}`);
}
if (missingCards.length)
  failures.push("Rule 3 (missing study cards): " + missingCards.join("; "));

// ---- register + log sections ----
const registerSection = text.includes("## Excluded Items")
  ? text.split("## Excluded Items")[1].split("## Re-admission Log")[0]
  : "";
const logSection = text.includes("## Re-admission Log")
  ? text.split("## Re-admission Log")[1]
  : "";

// Rule 4 — excluded completeness
for (const item of ["kickbacks.ai", "automaton", "llm-council", "ToS"]) {
  if (!registerSection.includes(item))
    failures.push(`Rule 4: excluded item missing from register: ${item}`);
}

// Rule 5 — re-admission enforcement
const registerRows = registerSection
  .split("\n")
  .filter((l) => /^\|/.test(l) && !/^\|\s*-+/.test(l))
  .map((l) => l.split("|").map((s) => s.trim()))
  .filter((c) => c[1] && c[1] !== "Item");
for (const reg of registerRows) {
  // normalized key: first token of the register item name, lowercased
  const key = reg[1].split(/[\s:(]/)[0].toLowerCase();
  const mainMatches = rows.filter((c) => c[1].toLowerCase().includes(key));
  for (const m of mainMatches) {
    if (m[3] !== "EXCLUDED") {
      const readmitted =
        /\d{4}-\d{2}-\d{2}/.test(logSection) &&
        /CEO/i.test(logSection) &&
        logSection.toLowerCase().includes(key);
      if (!readmitted)
        failures.push(
          `Rule 5 (INTEG-02): "${m[1]}" left EXCLUDED (Status ${m[3]}) with no dated CEO Re-admission Log entry for "${key}"`
        );
    }
  }
}

if (failures.length) {
  for (const f of failures) console.error("FAIL — " + f);
  process.exit(1);
}
const cardCount = nonExcluded.filter(
  (c) => c[7] && c[7] !== "-" && existsSync(path.join(BASE, c[7]))
).length;
console.log(
  `tracker OK: ${rows.length} data rows (${nonExcluded.length} non-excluded, ${excludedRows.length} excluded), ${cardCount} study cards`
);
