#!/usr/bin/env node
// B36 — the ONE counter for "how many files can still fall back to the company
// database", and the ONE definition of what that means.
//
// Why it is a committed script: the figure was published from three throw-away
// shell pipelines and disagreed with two independent audits every time (94, 93,
// 96). A number nobody can reproduce by running one command is not a
// measurement.
//
// Why it PARSES instead of grepping: the third audit was right that counting
// "the address and the variable name on the same line" is not behaviour. This
// reads the code — TypeScript's own parser for every .ts/.tsx/.mts/.js/.mjs/.cjs
// file — and counts a file only where the company address is really BOUND to
// DXB_DATABASE_URL:
//
//     process.env.DXB_DATABASE_URL ??= "…"      (also  =  and  ||=)
//     process.env.DXB_DATABASE_URL ?? "…"       (also  ||)
//     { DXB_DATABASE_URL: "…" }                 (an env object handed to a child)
//     …and the same four shapes where the value is a const holding the address,
//        which a line-based counter cannot see at all.
//
// Shell and other non-parsed files fall back to a line rule, and say so.
//
// THE HEADLINE IS THE EXECUTABLE COUNT. Markdown files that merely quote the
// address are listed separately and deliberately kept OUT of the arithmetic:
// every report written about this work quotes it, so any total that includes
// documentation is stale the moment the next report is written — which is
// exactly how the last published reconciliation went wrong.
//
// Usage: node scripts/b36/count-company-fallbacks.mjs [--list] [--json]
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import ts from "typescript";

const COMPANY = "54322/postgres";
const VAR = "DXB_DATABASE_URL";
const PARSED = /\.(ts|tsx|mts|cts|js|mjs|cjs)$/;

const files = execFileSync("git", ["ls-files"], { encoding: "utf8" })
  .split("\n")
  .filter(Boolean)
  .filter((f) => !f.includes("node_modules/") && !f.includes("/dist/"));

/** Does this expression evaluate to the company address? */
function isCompanyValue(node, companyConsts) {
  if (!node) return false;
  if (ts.isStringLiteralLike(node)) return node.text.includes(COMPANY);
  if (ts.isTemplateExpression(node)) return node.getText().includes(COMPANY);
  if (ts.isIdentifier(node)) return companyConsts.has(node.text);
  if (ts.isBinaryExpression(node))
    return isCompanyValue(node.left, companyConsts) || isCompanyValue(node.right, companyConsts);
  if (ts.isParenthesizedExpression(node)) return isCompanyValue(node.expression, companyConsts);
  return false;
}

/** Is this expression the DXB_DATABASE_URL slot of some environment? */
function isEnvSlot(node) {
  if (ts.isPropertyAccessExpression(node)) return node.name.text === VAR;
  if (ts.isElementAccessExpression(node))
    return ts.isStringLiteralLike(node.argumentExpression) && node.argumentExpression.text === VAR;
  return false;
}

function scanParsed(file, text) {
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const companyConsts = new Set();
  const hits = [];

  // pass 1 — names that hold the company address
  const collect = (n) => {
    if (
      ts.isVariableDeclaration(n) &&
      ts.isIdentifier(n.name) &&
      n.initializer &&
      ts.isStringLiteralLike(n.initializer) &&
      n.initializer.text.includes(COMPANY)
    )
      companyConsts.add(n.name.text);
    ts.forEachChild(n, collect);
  };
  collect(sf);

  // pass 2 — bindings of that value to DXB_DATABASE_URL
  const walk = (n) => {
    let shape = null;
    if (ts.isBinaryExpression(n) && isEnvSlot(n.left)) {
      const op = n.operatorToken.kind;
      const assigns =
        op === ts.SyntaxKind.EqualsToken ||
        op === ts.SyntaxKind.QuestionQuestionEqualsToken ||
        op === ts.SyntaxKind.BarBarEqualsToken;
      const defaults =
        op === ts.SyntaxKind.QuestionQuestionToken || op === ts.SyntaxKind.BarBarToken;
      if ((assigns || defaults) && isCompanyValue(n.right, companyConsts))
        shape = `${n.left.getText()} ${n.operatorToken.getText()} …`;
    }
    if (
      ts.isPropertyAssignment(n) &&
      (ts.isIdentifier(n.name) || ts.isStringLiteralLike(n.name)) &&
      n.name.text === VAR &&
      isCompanyValue(n.initializer, companyConsts)
    )
      shape = `{ ${VAR}: … }`;
    if (shape) {
      const { line } = sf.getLineAndCharacterOfPosition(n.getStart(sf));
      hits.push({ line: line + 1, shape });
    }
    ts.forEachChild(n, walk);
  };
  walk(sf);
  return hits;
}

function scanLines(text) {
  const hits = [];
  text.split("\n").forEach((l, i) => {
    if (!l.includes(COMPANY)) return;
    if (/^\s*(#|\/\/|--|\*)/.test(l)) return;
    if (new RegExp(`${VAR}\\s*[:=]`).test(l)) hits.push({ line: i + 1, shape: "line rule" });
  });
  return hits;
}

const executable = [];
const documented = [];
const mention = [];
let occurrences = 0;

for (const f of files) {
  if (!existsSync(f)) continue;
  let text;
  try {
    text = readFileSync(f, "utf8");
  } catch {
    continue;
  }
  if (!text.includes(COMPANY)) continue;
  const hits = PARSED.test(f) ? scanParsed(f, text) : f.endsWith(".md") ? [] : scanLines(text);
  if (hits.length) {
    occurrences += hits.length;
    executable.push({ file: f, line: hits[0].line, shape: hits[0].shape, hits: hits.length });
  } else if (f.endsWith(".md")) documented.push(f);
  else mention.push(f);
}

const bucket = (p) => {
  const top = p.split("/")[0];
  return ["tests", "scripts", "db", "apps", "tools"].includes(top)
    ? top === "db"
      ? "db seeds"
      : top
    : top;
};
const tally = {};
for (const e of executable) tally[bucket(e.file)] = (tally[bucket(e.file)] ?? 0) + 1;

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ executable, documented, mention, tally, occurrences }, null, 2));
  process.exit(0);
}

console.log(`EXECUTABLE FALLBACKS (the address really bound to ${VAR}): ${executable.length}`);
console.log(
  "   " +
    Object.entries(tally)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k}: ${v}`)
      .join(" · "),
);
console.log(`   ${occurrences} bindings inside them`);
for (const e of executable)
  if (!e.file.startsWith("tests/") || process.argv.includes("--list"))
    console.log(`     ${e.file}:${e.line}   ${e.shape}`);
console.log("");
console.log(
  `Kept OUT of the count on purpose — these move whenever a report is written about this work:`,
);
console.log(`   ${documented.length} markdown files quote the address`);
console.log(`   ${mention.length} files carry it without binding it (assertions, allowlists, comments)`);
for (const f of mention) console.log(`     ${f}`);
