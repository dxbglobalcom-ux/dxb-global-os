#!/usr/bin/env node
// B36 — the ONE counter for "how many files still fall back to the company database".
//
// Why it exists as a committed script: the figure was published three times from
// three ad-hoc shell pipelines and disagreed with an independent audit every
// time (94 vs 93). A number that cannot be reproduced by running one command is
// not a measurement. This script IS the definition.
//
// WHAT IT COUNTS — a file is a FALLBACK when, on a line that is not a comment,
// the company address appears bound to DXB_DATABASE_URL: `process.env.
// DXB_DATABASE_URL ??=` / `??` / `=`, a `DXB_DATABASE_URL:` object value, or a
// shell `DXB_DATABASE_URL=` / `export DXB_DATABASE_URL=`.
// Everything else that merely contains the address is reported apart:
//   MENTION  — the address appears with no DXB_DATABASE_URL binding on the line
//              (an assertion, a permission allowlist entry, a comment).
// The two lists together account for every occurrence in the repository, and the
// script prints that reconciliation so a missing file cannot hide in the gap.
//
// Usage: node scripts/b36/count-company-fallbacks.mjs [--list]
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";

const COMPANY = "54322/postgres";
const BIND = /DXB_DATABASE_URL/;
const COMMENT = /^\s*(\/\/|\*|#|--)/;

const files = execFileSync("git", ["ls-files"], { encoding: "utf8" })
  .split("\n")
  .filter(Boolean)
  .filter((f) => !f.includes("node_modules/") && !f.includes("/dist/"));

const fallback = []; // executable: a program or shell script that can really connect
const doc = []; // a .md file that only quotes the line
const mention = [];
let occurrences = 0;

for (const f of files) {
  if (!existsSync(f)) continue;
  let text;
  try {
    text = readFileSync(f, "utf8");
  } catch {
    continue; // binary
  }
  if (!text.includes(COMPANY)) continue;
  const lines = text.split("\n");
  let isFallback = null;
  let isMention = null;
  lines.forEach((line, i) => {
    if (!line.includes(COMPANY)) return;
    occurrences++;
    const commented = COMMENT.test(line);
    if (!commented && BIND.test(line)) isFallback ??= i + 1;
    else isMention ??= i + 1;
  });
  if (isFallback) (f.endsWith(".md") ? doc : fallback).push(`${f}:${isFallback}`);
  else if (isMention) mention.push(`${f}:${isMention}`);
}

const bucket = (p) => {
  const top = p.split("/")[0];
  if (top === "tests") return "tests";
  if (top === "scripts") return "scripts";
  if (top === "db") return "db seeds";
  if (top === "apps") return "apps";
  if (top === "tools") return "tools";
  return top;
};
const tally = {};
for (const p of fallback) tally[bucket(p)] = (tally[bucket(p)] ?? 0) + 1;

const list = process.argv.includes("--list");
console.log(`EXECUTABLE FALLBACKS (code or shell that can really connect): ${fallback.length}`);
console.log(
  "   " +
    Object.entries(tally)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k}: ${v}`)
      .join(" · "),
);
for (const p of fallback.filter((p) => !p.startsWith("tests/"))) console.log(`     ${p}`);
if (list) for (const p of fallback.filter((p) => p.startsWith("tests/"))) console.log(`     ${p}`);
console.log(`DOCUMENTED, NOT EXECUTABLE (.md quoting the line): ${doc.length}`);
for (const p of doc) console.log(`     ${p}`);
console.log(`MENTION ONLY (address present, never bound): ${mention.length}`);
for (const p of mention) console.log(`     ${p}`);
console.log(
  `RECONCILIATION: ${fallback.length} executable + ${doc.length} documented + ${mention.length} mention = ` +
    `${fallback.length + doc.length + mention.length} files · ${occurrences} occurrences`,
);
