// Every company model call runs with nothing of the construction loaded (CEO 2026-10-03:
// "evet tabi hamza ve herşey herkes inşaattan ayrı olmalı ya!").
//
// Measured that day from the residents' working directory (SDK 0.3.259): a `query()` holding only
// `tools: []` — Hamza's chat and voice lanes — loaded both CLAUDE.md files, the auto-memory index,
// the SessionStart hook's text, five MCP servers and 58 MCP tools (44,306 input tokens); the task
// lane's `settingSources: []` still loaded the auto-memory index (4,237); with
// `settings: { autoMemoryEnabled: false }` the call read 476 tokens and nothing of the construction.
// This ruler holds every `query()` in the company's runtime code to `companyIsolation()` and to its
// one-line receipt, so a new call site cannot quietly reopen the leak.
//
// It is FAIL-CLOSED. Sol's audit of phase 1 (2026-10-03) refuted the first ruler with forms it could
// not see — a namespace import, require() and import(), `const ask = query`, options that reopen what
// the helper closed, a receipt named only in a comment. What this ruler cannot read, it refuses: an
// SDK import other than `import { query }`, `query` used as anything but a direct call, options that
// are not a literal, an option outside the list below, a spread it cannot see into, a stream whose
// loop does not feed the receipt first. A runtime launch of `claude` is refused outright — a company
// model call goes through `query()`. Its limit: a program name assembled at run time outside the
// file is beyond any static reading; the receipts and the live probe are the run-time witnesses.
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { basename, join, relative } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const REPO = join(import.meta.dirname, "..", "..");
const SDK = "claude-agent-sdk";

function walk(dir: string, out: string[]): void {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist" || name === "__tests__") continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.[cm]?[jt]sx?$/.test(name) && !/\.(?:test|spec)\.[cm]?[jt]sx?$/.test(name) && !/\.d\.[cm]?ts$/.test(name)) {
      out.push(p);
    }
  }
}

/** The company's runtime source: every package's and app's `src/`, tests excluded. */
function runtimeSources(): string[] {
  const out: string[] = [];
  for (const top of ["packages", "apps"]) {
    for (const pkg of readdirSync(join(REPO, top))) {
      const src = join(REPO, top, pkg, "src");
      try {
        if (statSync(src).isDirectory()) walk(src, out);
      } catch {
        // a package without src/ holds no runtime call
      }
    }
  }
  return out;
}

// ── the reading tools ─────────────────────────────────────────────────────────────────────────────

const lineOf = (sf: ts.SourceFile, n: ts.Node): number => sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;

function nameText(n: ts.PropertyName | ts.ModuleExportName): string | null {
  return ts.isIdentifier(n) || ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n) || ts.isNumericLiteral(n)
    ? n.text
    : null;
}

function unwrap(e: ts.Expression): ts.Expression {
  while (
    ts.isParenthesizedExpression(e) ||
    ts.isAsExpression(e) ||
    ts.isSatisfiesExpression(e) ||
    ts.isNonNullExpression(e) ||
    ts.isTypeAssertionExpression(e)
  ) {
    e = e.expression;
  }
  return e;
}

const isConst = (d: ts.VariableDeclaration): boolean =>
  ts.isVariableDeclarationList(d.parent) && (d.parent.flags & ts.NodeFlags.Const) !== 0;

const isTypeOnly = (c: ts.ImportClause): boolean => c.phaseModifier === ts.SyntaxKind.TypeKeyword;

/** An identifier that names a slot (a key, a member, an import) rather than reading a binding. */
function isNameSlot(n: ts.Identifier): boolean {
  const p = n.parent;
  return (
    ts.isImportSpecifier(p) ||
    ts.isImportClause(p) ||
    ts.isNamespaceImport(p) ||
    (ts.isPropertyAccessExpression(p) && p.name === n) ||
    (ts.isPropertyAssignment(p) && p.name === n) ||
    (ts.isBindingElement(p) && p.propertyName === n) ||
    ((ts.isMethodDeclaration(p) ||
      ts.isPropertyDeclaration(p) ||
      ts.isPropertySignature(p) ||
      ts.isMethodSignature(p) ||
      ts.isGetAccessor(p) ||
      ts.isSetAccessor(p)) &&
      p.name === n) ||
    (ts.isQualifiedName(p) && p.right === n) ||
    ts.isLabeledStatement(p) ||
    ts.isBreakOrContinueStatement(p)
  );
}

function inTypePosition(n: ts.Node): boolean {
  for (let p = n.parent; p; p = p.parent) if (ts.isTypeNode(p)) return true;
  return false;
}

function enclosingFunction(n: ts.Node): ts.Node {
  for (let p = n.parent; p; p = p.parent) if (ts.isFunctionLike(p) || ts.isSourceFile(p)) return p;
  return n.getSourceFile();
}

/** Every node of one function — a nested function is its own scope and is not entered. */
function ownNodes(root: ts.Node, visit: (n: ts.Node) => void): void {
  const go = (n: ts.Node): void => {
    visit(n);
    if (!ts.isFunctionLike(n)) ts.forEachChild(n, go);
  };
  ts.forEachChild(root, go);
}

function constInits(scope: ts.Node, name: string): ts.Expression[] {
  const out: ts.Expression[] = [];
  ownNodes(scope, (n) => {
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.name.text === name && n.initializer && isConst(n)) {
      out.push(n.initializer);
    }
  });
  return out;
}

const isLoader = (n: ts.CallExpression): boolean =>
  n.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(n.expression) && n.expression.text === "require");

// ── the SDK's query() — every call isolated, every stream receipted ─────────────────────────────

/** What a company call may set beside companyIsolation(). Every other option is refused until it is
 *  measured not to reopen the construction: sdk.d.ts 0.3.259 names `settingSources`, `settings`,
 *  `managedSettings`, `plugins`, `env`, `extraArgs`, `executableArgs`, `pathToClaudeCodeExecutable`,
 *  `spawnClaudeCodeProcess`, `resume`, `continue`, `forkSession`, `sessionStore`, `persistSession` and
 *  `cwd`, each of which can bring back what the helper shut out (an `env` alone changed what loaded,
 *  probe D of 2026-10-03). */
const OPTIONS_ALLOWED = new Set(["model", "effort", "tools", "maxTurns", "outputFormat", "systemPrompt"]);
/** The compiled gateway profile (R2.2): allowed only as `<profile>.<key>`, where the profile is written
 *  by `buildSdkToolOptions()` from @dxb/gateway and by nothing else — the company's own servers. Its
 *  `strictMcpConfig` is held to `true` below, because it lands after the helper's own. */
const OPTIONS_FROM_PROFILE = new Set(["mcpServers", "allowedTools", "disallowedTools", "strictMcpConfig"]);
const isHelperHome = (spec: string): boolean => spec === "@dxb/kernel" || /^\.{1,2}\/(?:.*\/)?sdk-isolation\.js$/.test(spec);

interface Site {
  where: string;
  lane: string | null;
  problems: string[];
}

interface SdkReport {
  file: string;
  sites: Site[];
  /** What the ruler refuses before any call: an import form, a use of `query` it cannot follow. */
  problems: string[];
}

interface Bindings {
  isolation: Set<string>;
  receipt: Set<string>;
  fromProfile: (name: string) => boolean;
}

/** `name` is the compiled profile: every write to it is `buildSdkToolOptions(…)` (or an empty start). */
function profileBinding(sf: ts.SourceFile, builders: Set<string>): (name: string) => boolean {
  const memo = new Map<string, boolean>();
  return (name) => {
    const known = memo.get(name);
    if (known !== undefined) return known;
    let built = 0;
    let foreign = false;
    const fromBuilder = (x: ts.Expression): boolean => {
      const e = unwrap(x);
      return ts.isCallExpression(e) && ts.isIdentifier(e.expression) && builders.has(e.expression.text);
    };
    const empty = (x?: ts.Expression): boolean =>
      !x || x.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(x) && x.text === "undefined");
    const visit = (n: ts.Node): void => {
      if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.name.text === name) {
        if (n.initializer && fromBuilder(n.initializer)) built += 1;
        else if (!empty(n.initializer)) foreign = true;
      }
      if ((ts.isParameter(n) || ts.isBindingElement(n)) && ts.isIdentifier(n.name) && n.name.text === name) foreign = true;
      if (
        ts.isBinaryExpression(n) &&
        n.operatorToken.kind >= ts.SyntaxKind.FirstAssignment &&
        n.operatorToken.kind <= ts.SyntaxKind.LastAssignment
      ) {
        const left = unwrap(n.left);
        if (ts.isIdentifier(left) && left.text === name) {
          if (n.operatorToken.kind === ts.SyntaxKind.EqualsToken && fromBuilder(n.right)) built += 1;
          else foreign = true;
        }
        // a write INTO the profile (`toolOpts.mcpServers = …`) is one the builder did not make
        if ((ts.isPropertyAccessExpression(left) || ts.isElementAccessExpression(left))) {
          const owner = unwrap(left.expression);
          if (ts.isIdentifier(owner) && owner.text === name) foreign = true;
        }
      }
      ts.forEachChild(n, visit);
    };
    visit(sf);
    const ok = built > 0 && !foreign;
    memo.set(name, ok);
    return ok;
  };
}

function isIsolationSpread(x: ts.Expression, b: Bindings): boolean {
  const isCall = (y: ts.Expression): boolean => {
    const e = unwrap(y);
    return ts.isCallExpression(e) && ts.isIdentifier(e.expression) && b.isolation.has(e.expression.text) && e.arguments.length === 0;
  };
  const e = unwrap(x);
  if (isCall(e)) return true;
  if (!ts.isBinaryExpression(e) || e.operatorToken.kind !== ts.SyntaxKind.QuestionQuestionToken || !isCall(e.left)) return false;
  const right = unwrap(e.right);
  return ts.isObjectLiteralExpression(right) && right.properties.length === 0;
}

function checkMember(p: ts.ObjectLiteralElementLike, sf: ts.SourceFile, b: Bindings, problems: string[]): void {
  if (ts.isSpreadAssignment(p)) {
    checkSpread(p.expression, sf, b, problems);
    return;
  }
  const key = nameText(p.name);
  if (key === null) {
    problems.push(`a computed option name \`${p.name.getText(sf)}\``);
    return;
  }
  if (OPTIONS_ALLOWED.has(key)) return;
  if (OPTIONS_FROM_PROFILE.has(key)) {
    const v = ts.isPropertyAssignment(p) ? unwrap(p.initializer) : null;
    if (v && ts.isPropertyAccessExpression(v) && v.name.text === key && ts.isIdentifier(v.expression) && b.fromProfile(v.expression.text)) {
      return;
    }
    problems.push(`option \`${key}\` does not come straight from the compiled profile (\`<buildSdkToolOptions(…)>.${key}\`)`);
    return;
  }
  problems.push(`option \`${key}\` is not on the company-call list`);
}

/** A spread is read through: object literals, `c ? A : B`, `A ?? B`, `A || B`, `c && A`. Nothing else. */
function checkSpread(x: ts.Expression, sf: ts.SourceFile, b: Bindings, problems: string[]): void {
  const e = unwrap(x);
  if (ts.isObjectLiteralExpression(e)) {
    for (const q of e.properties) checkMember(q, sf, b, problems);
    return;
  }
  if (ts.isConditionalExpression(e)) {
    checkSpread(e.whenTrue, sf, b, problems);
    checkSpread(e.whenFalse, sf, b, problems);
    return;
  }
  if (ts.isBinaryExpression(e)) {
    const op = e.operatorToken.kind;
    if (op === ts.SyntaxKind.AmpersandAmpersandToken) {
      checkSpread(e.right, sf, b, problems);
      return;
    }
    if (op === ts.SyntaxKind.QuestionQuestionToken || op === ts.SyntaxKind.BarBarToken) {
      checkSpread(e.left, sf, b, problems);
      checkSpread(e.right, sf, b, problems);
      return;
    }
  }
  problems.push(`a spread the ruler cannot see into: \`...${e.getText(sf).slice(0, 60)}\``);
}

function checkSite(sf: ts.SourceFile, rel: string, call: ts.CallExpression, b: Bindings): Site {
  const problems: string[] = [];

  // 1. The options: one literal, the helper spread exactly once, nothing beside it off the list.
  const arg = call.arguments.length === 1 ? unwrap(call.arguments[0]) : undefined;
  let options: ts.ObjectLiteralExpression | undefined;
  if (!arg || !ts.isObjectLiteralExpression(arg)) {
    problems.push("query() takes one object literal `{ prompt, options }`");
  } else {
    for (const p of arg.properties) {
      const key = ts.isPropertyAssignment(p) || ts.isShorthandPropertyAssignment(p) ? nameText(p.name) : null;
      if (key === "prompt") continue;
      if (key === "options" && ts.isPropertyAssignment(p) && ts.isObjectLiteralExpression(unwrap(p.initializer))) {
        options = unwrap(p.initializer) as ts.ObjectLiteralExpression;
        continue;
      }
      problems.push(`query()'s argument holds \`${p.getText(sf).slice(0, 60)}\` — only \`prompt\` and a literal \`options\``);
    }
    if (!options) problems.push("query() has no literal `options` — nothing proves the isolation");
  }
  if (options) {
    let spreads = 0;
    for (const p of options.properties) {
      if (ts.isSpreadAssignment(p) && isIsolationSpread(p.expression, b)) spreads += 1;
      else checkMember(p, sf, b, problems);
    }
    if (spreads !== 1) problems.push(`the options spread companyIsolation() ${spreads} times — once, exactly`);
  }

  // 2. The receipt: this stream's own loop feeds it first, before anything can return.
  let lane: string | null = null;
  const decl = call.parent;
  if (!ts.isVariableDeclaration(decl) || decl.initializer !== call || !ts.isIdentifier(decl.name) || !isConst(decl)) {
    problems.push("the stream is not held in a `const` — the receipt cannot be bound to it");
  } else {
    const stream = decl.name.text;
    const scope = enclosingFunction(call);
    const loops: ts.ForOfStatement[] = [];
    ownNodes(scope, (n) => {
      if (!ts.isForOfStatement(n) || !n.awaitModifier) return;
      const of = unwrap(n.expression);
      if (ts.isIdentifier(of) && of.text === stream) loops.push(n);
    });
    if (loops.length !== 1) {
      problems.push(`the stream \`${stream}\` is read by ${loops.length} \`for await\` loops — one, exactly`);
    } else {
      const loop = loops[0];
      const init = loop.initializer;
      const message =
        ts.isVariableDeclarationList(init) && init.declarations.length === 1 && ts.isIdentifier(init.declarations[0].name)
          ? init.declarations[0].name.text
          : null;
      const first = ts.isBlock(loop.statement) ? loop.statement.statements[0] : undefined;
      let fed: string | null = null;
      if (first && ts.isExpressionStatement(first) && ts.isCallExpression(first.expression)) {
        const c = first.expression;
        const a = c.arguments[0];
        if (ts.isIdentifier(c.expression) && c.arguments.length === 1 && ts.isIdentifier(a) && a.text === message) fed = c.expression.text;
      }
      if (!message || !fed) {
        problems.push("the loop's first step is not `<receipt>(<message>)` — a result could leave before the receipt sees it");
      } else {
        const inits = constInits(scope, fed);
        const r = inits.length === 1 ? unwrap(inits[0]) : undefined;
        if (
          r &&
          ts.isCallExpression(r) &&
          ts.isIdentifier(r.expression) &&
          b.receipt.has(r.expression.text) &&
          r.arguments.length === 1 &&
          ts.isStringLiteral(r.arguments[0])
        ) {
          lane = r.arguments[0].text;
        } else {
          problems.push(`\`${fed}\` is not \`const ${fed} = isolationReceipt("<lane>")\` in this function`);
        }
      }
    }
  }
  return { where: `${rel}:${lineOf(sf, call)}`, lane, problems };
}

function analyzeSdk(rel: string, text: string): SdkReport {
  const report: SdkReport = { file: rel, sites: [], problems: [] };
  if (!text.includes(SDK)) return report;
  const sf = ts.createSourceFile(rel, text, ts.ScriptTarget.Latest, true);
  const at = (n: ts.Node): string => `${rel}:${lineOf(sf, n)}`;
  const isSdk = (spec: string): boolean => spec.includes(SDK);
  const queries = new Set<string>();
  const isolation = new Set<string>();
  const receipt = new Set<string>();
  const builders = new Set<string>();

  const imports = (n: ts.Node): void => {
    if (ts.isImportDeclaration(n) && ts.isStringLiteral(n.moduleSpecifier)) {
      const spec = n.moduleSpecifier.text;
      const clause = n.importClause;
      if (isSdk(spec)) {
        if (!clause) report.problems.push(`${at(n)} a bare import of the SDK`);
        else if (!isTypeOnly(clause)) {
          if (clause.name) report.problems.push(`${at(n)} a default import of the SDK`);
          const nb = clause.namedBindings;
          if (nb && ts.isNamespaceImport(nb)) {
            report.problems.push(`${at(n)} a namespace import of the SDK — \`${nb.name.text}.query\` cannot be held`);
          }
          if (nb && ts.isNamedImports(nb)) {
            for (const el of nb.elements) {
              if (el.isTypeOnly) continue;
              const imported = nameText(el.propertyName ?? el.name);
              if (imported === "query") queries.add(el.name.text);
              else report.problems.push(`${at(el)} \`${imported}\` imported from the SDK — not on the ruler's list`);
            }
          }
        }
      } else if (clause && !isTypeOnly(clause) && clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
        for (const el of clause.namedBindings.elements) {
          const imported = nameText(el.propertyName ?? el.name);
          if (isHelperHome(spec) && imported === "companyIsolation") isolation.add(el.name.text);
          if (isHelperHome(spec) && imported === "isolationReceipt") receipt.add(el.name.text);
          if (spec === "@dxb/gateway" && imported === "buildSdkToolOptions") builders.add(el.name.text);
        }
      }
    }
    if (
      ts.isImportEqualsDeclaration(n) &&
      ts.isExternalModuleReference(n.moduleReference) &&
      ts.isStringLiteral(n.moduleReference.expression) &&
      isSdk(n.moduleReference.expression.text)
    ) {
      report.problems.push(`${at(n)} \`import … = require()\` of the SDK`);
    }
    if (ts.isExportDeclaration(n) && n.moduleSpecifier && ts.isStringLiteral(n.moduleSpecifier) && isSdk(n.moduleSpecifier.text)) {
      report.problems.push(`${at(n)} a re-export from the SDK — a wrapper the ruler cannot follow`);
    }
    if (ts.isCallExpression(n) && isLoader(n)) {
      const a = n.arguments[0];
      if (!a || !ts.isStringLiteralLike(a) || isSdk(a.text)) {
        report.problems.push(`${at(n)} \`${n.getText(sf).slice(0, 60)}\` — the SDK is taken only as a static \`import { query }\``);
      }
    }
    ts.forEachChild(n, imports);
  };
  imports(sf);

  const b: Bindings = { isolation, receipt, fromProfile: profileBinding(sf, builders) };
  const uses = (n: ts.Node): void => {
    if (ts.isIdentifier(n) && queries.has(n.text) && !isNameSlot(n) && !inTypePosition(n)) {
      const p = n.parent;
      if (ts.isCallExpression(p) && p.expression === n) report.sites.push(checkSite(sf, rel, p, b));
      else report.problems.push(`${at(n)} \`${n.text}\` used as a value (\`${p.getText(sf).slice(0, 60)}\`) — an alias the ruler cannot follow`);
    }
    ts.forEachChild(n, uses);
  };
  uses(sf);
  return report;
}

// ── process launches — no runtime `claude`; the gate's `codex` from the company's own home ───────

const CHILD = new Set(["node:child_process", "child_process"]);
const LAUNCHERS = new Set(["execFile", "execFileSync", "spawn", "spawnSync", "exec", "execSync", "fork"]);
const SHELL = new Set(["exec", "execSync"]);
const AGENT_WORD = /\b(?:claude|codex)\b/;

interface Launch {
  where: string;
  file: string;
  /** The program's basename, or null when the ruler cannot name it. */
  program: string | null;
  /** The literal `env` option handed to the launch, when there is one. */
  env: ts.Expression | null;
}

interface LaunchReport {
  launches: Launch[];
  problems: string[];
}

const isPromisify = (c: ts.CallExpression, sf: ts.SourceFile): boolean => /(?:^|\.)promisify$/.test(c.expression.getText(sf));

function analyzeLaunches(rel: string, text: string): LaunchReport {
  const report: LaunchReport = { launches: [], problems: [] };
  if (!text.includes("child_process")) return report;
  const sf = ts.createSourceFile(rel, text, ts.ScriptTarget.Latest, true);
  const at = (n: ts.Node): string => `${rel}:${lineOf(sf, n)}`;
  const fns = new Map<string, string>(); // local name → the child_process function it is
  const namespaces = new Set<string>();
  const strings = new Map<string, string>(); // const NAME = "literal"
  let namesAgent = false; // a string in this file names claude or codex

  const collect = (n: ts.Node): void => {
    if ((ts.isStringLiteralLike(n) && AGENT_WORD.test(n.text)) || (ts.isTemplateExpression(n) && AGENT_WORD.test(n.getText(sf)))) {
      namesAgent = true;
    }
    if (ts.isImportDeclaration(n) && ts.isStringLiteral(n.moduleSpecifier) && CHILD.has(n.moduleSpecifier.text)) {
      const c = n.importClause;
      if (c && !isTypeOnly(c)) {
        if (c.name) namespaces.add(c.name.text);
        if (c.namedBindings && ts.isNamespaceImport(c.namedBindings)) namespaces.add(c.namedBindings.name.text);
        if (c.namedBindings && ts.isNamedImports(c.namedBindings)) {
          for (const el of c.namedBindings.elements) {
            const imported = nameText(el.propertyName ?? el.name);
            if (!el.isTypeOnly && imported && LAUNCHERS.has(imported)) fns.set(el.name.text, imported);
          }
        }
      }
    }
    if (ts.isCallExpression(n) && isLoader(n)) {
      const a = n.arguments[0];
      if (a && ts.isStringLiteralLike(a) && CHILD.has(a.text)) {
        report.problems.push(`${at(n)} child_process taken by require()/import() — the ruler reads only a static import`);
      }
    }
    if (
      ts.isImportEqualsDeclaration(n) &&
      ts.isExternalModuleReference(n.moduleReference) &&
      ts.isStringLiteral(n.moduleReference.expression) &&
      CHILD.has(n.moduleReference.expression.text)
    ) {
      report.problems.push(`${at(n)} child_process taken by \`import … = require()\``);
    }
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer && isConst(n)) {
      const v = unwrap(n.initializer);
      if (ts.isStringLiteralLike(v)) strings.set(n.name.text, v.text);
    }
    ts.forEachChild(n, collect);
  };
  collect(sf);

  const launcher = (x: ts.Expression): string | null => {
    const e = unwrap(x);
    if (ts.isIdentifier(e)) return fns.get(e.text) ?? null;
    if (ts.isPropertyAccessExpression(e) && ts.isIdentifier(e.expression) && namespaces.has(e.expression.text)) {
      return LAUNCHERS.has(e.name.text) ? e.name.text : null;
    }
    return null;
  };
  // promisify(execFile) launches the same programs as execFile
  const twins = (n: ts.Node): void => {
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer) {
      const i = unwrap(n.initializer);
      if (ts.isCallExpression(i) && i.arguments.length === 1 && isPromisify(i, sf)) {
        const fn = launcher(i.arguments[0]);
        if (fn) fns.set(n.name.text, fn);
      }
    }
    ts.forEachChild(n, twins);
  };
  twins(sf);

  const launches = (n: ts.Node): void => {
    if (ts.isCallExpression(n)) {
      const fn = launcher(n.expression);
      if (fn) {
        const a = n.arguments[0] ? unwrap(n.arguments[0]) : undefined;
        let bin: string | null = null;
        if (a && ts.isStringLiteralLike(a)) bin = a.text;
        else if (a && ts.isIdentifier(a)) bin = strings.get(a.text) ?? null;
        if (bin !== null && SHELL.has(fn)) bin = bin.trim().split(/\s+/)[0] ?? null;
        const program = bin ? basename(bin) : null;
        const opts = n.arguments.slice(1).map(unwrap).find(ts.isObjectLiteralExpression);
        const envProp = opts?.properties.find((p) => ts.isPropertyAssignment(p) && nameText(p.name) === "env");
        const env = envProp && ts.isPropertyAssignment(envProp) ? unwrap(envProp.initializer) : null;
        report.launches.push({ where: at(n), file: rel, program, env });
        if (program === "claude") {
          report.problems.push(`${at(n)} a runtime launch of \`claude\` — a company model call goes through query() with companyIsolation()`);
        }
        if (program === null && namesAgent) {
          report.problems.push(`${at(n)} a launch whose program the ruler cannot name, in a file that names claude or codex`);
        }
      }
    }
    if (ts.isIdentifier(n) && fns.has(n.text) && namesAgent && !isNameSlot(n) && !inTypePosition(n)) {
      const p = n.parent;
      const called = ts.isCallExpression(p) && p.expression === n;
      const promisified = ts.isCallExpression(p) && p.arguments.some((a) => a === n) && isPromisify(p, sf);
      const declared = ts.isVariableDeclaration(p) && p.name === n;
      if (!called && !promisified && !declared) {
        report.problems.push(`${at(n)} \`${n.text}\` handed on as a value, in a file that names claude or codex`);
      }
    }
    ts.forEachChild(n, launches);
  };
  launches(sf);
  return report;
}

// ── the company's runtime, read ──────────────────────────────────────────────────────────────────

const SOURCES = runtimeSources().map((file) => ({ rel: relative(REPO, file), text: readFileSync(file, "utf8") }));
/** The eight company lanes on 2026-10-03. A ninth call site fails here until it is added on purpose. */
const LANES = ["chat", "classify", "council", "decompose", "qa", "task", "voice", "workflow"];

describe("company isolation — the ruler over every company model call (CEO 2026-10-03)", () => {
  const reports = SOURCES.map((s) => analyzeSdk(s.rel, s.text));
  const sites = reports.flatMap((r) => r.sites);

  it("reads every SDK import and every use of query() it finds — nothing it cannot follow", () => {
    expect(reports.flatMap((r) => r.problems)).toEqual([]);
  });

  it("finds exactly the eight company lanes, each once", () => {
    expect(sites.map((s) => s.lane).sort()).toEqual(LANES);
  });

  it("every query() spreads companyIsolation() once, sets nothing off the list, and feeds its receipt first", () => {
    expect(sites.filter((s) => s.problems.length > 0).map((s) => `${s.where}: ${s.problems.join("; ")}`)).toEqual([]);
  });

  it("no runtime code launches `claude`, and every launch in a file that names claude or codex is readable", () => {
    expect(SOURCES.flatMap((s) => analyzeLaunches(s.rel, s.text).problems)).toEqual([]);
  });
});

// ── the ruler, tried on the forms that refuted its first version ───────────────────────────────

const HEAD = `import { companyIsolation, isolationReceipt } from "@dxb/kernel";\n`;
const lane = (opts: string, loop = "seen(msg);\n    if (msg.type === \"result\") return msg;"): string =>
  `export async function lane(prompt: string) {
  const seen = isolationReceipt("probe");
  const q = ask({ prompt, options: { ${opts} } });
  for await (const msg of q) {
    ${loop}
  }
}\n`;
const ISO = `...(companyIsolation() ?? {}), model: "m", tools: [], maxTurns: 4`;
const GOOD = `import { query as ask } from "@anthropic-ai/claude-agent-sdk";\n${HEAD}${lane(ISO)}`;

describe("the ruler refuses what it cannot follow (Sol's counter-examples, 2026-10-03)", () => {
  const verdict = (text: string): string[] => {
    const r = analyzeSdk("x/src/probe.ts", text);
    return [...r.problems, ...r.sites.flatMap((s) => s.problems), ...(r.sites.length === 0 ? ["no site found"] : [])];
  };

  it("passes the honest shape — an aliased named import, the helper spread, the receipt first", () => {
    const r = analyzeSdk("x/src/probe.ts", GOOD);
    expect(r.problems).toEqual([]);
    expect(r.sites).toEqual([{ where: "x/src/probe.ts:5", lane: "probe", problems: [] }]);
  });

  const refused: Array<[string, string]> = [
    ["a namespace import", `import * as sdk from "@anthropic-ai/claude-agent-sdk";\n${HEAD}const ask = sdk.query;\n${lane(ISO)}`],
    ["require()", `const { query: ask } = require("@anthropic-ai/claude-agent-sdk");\n${HEAD}${lane(ISO)}`],
    ["a dynamic import()", `const { query: ask } = await import("@anthropic-ai/claude-agent-sdk");\n${HEAD}${lane(ISO)}`],
    ["a re-export", `export { query } from "@anthropic-ai/claude-agent-sdk";\n${GOOD}`],
    ["an alias of query", `import { query } from "@anthropic-ai/claude-agent-sdk";\n${HEAD}const ask = query;\n${lane(ISO)}`],
    ["query handed on as a value", `${GOOD}export const run = { ask };\n`],
    ["settingSources after the helper", GOOD.replace(ISO, `${ISO}, settingSources: ["project"]`)],
    ["settings after the helper", GOOD.replace(ISO, `${ISO}, settings: {}`)],
    ["persistSession through a conditional spread", GOOD.replace(ISO, `${ISO}, ...(prompt ? { persistSession: true } : {})`)],
    ["a spread the ruler cannot see into", GOOD.replace(ISO, `${ISO}, ...extra`)],
    ["env", GOOD.replace(ISO, `${ISO}, env: { ...process.env }`)],
    ["plugins", GOOD.replace(ISO, `${ISO}, plugins: [{ type: "local", path: "/x" }]`)],
    ["resume", GOOD.replace(ISO, `${ISO}, resume: "abc"`)],
    ["mcpServers not from the compiled profile", GOOD.replace(ISO, `${ISO}, mcpServers: { playwright: { command: "npx" } }`)],
    ["a computed option name", GOOD.replace(ISO, `${ISO}, ["setting" + "Sources"]: []`)],
    ["the helper switched off by its argument", GOOD.replace("...(companyIsolation() ?? {})", `...(companyIsolation({ DXB_WORKER_ISOLATION: "0" }) ?? {})`)],
    ["no helper at all", GOOD.replace("...(companyIsolation() ?? {}), ", "")],
    ["options that are not a literal", GOOD.replace(`{ prompt, options: { ${ISO} } }`, "{ prompt, options: opts }")],
    ["a receipt named only in a comment", GOOD.replace(`seen(msg);`, `// isolationReceipt("probe") sees it`)],
    ["a receipt fed after the result can leave", GOOD.replace(`seen(msg);\n    if (msg.type === "result") return msg;`, `if (msg.type === "result") return msg;\n    seen(msg);`)],
    ["a receipt with its own sink", GOOD.replace(`isolationReceipt("probe")`, `isolationReceipt("probe", () => {})`)],
    ["a stream not held in a const", GOOD.replace("const q = ask", "let q = ask")],
    ["a helper that is not the kernel's", GOOD.replace(HEAD, `const companyIsolation = () => ({}); const isolationReceipt = (l: string) => (m: unknown) => {};\n`)],
  ];

  it.each(refused)("refuses %s", (_name, text) => {
    expect(verdict(text).length).toBeGreaterThan(0);
  });

  it("reads the profile keys only from buildSdkToolOptions()", () => {
    const profile = (write: string): string =>
      `import { query as ask } from "@anthropic-ai/claude-agent-sdk";\nimport { buildSdkToolOptions } from "@dxb/gateway";\n${HEAD}` +
      `let toolOpts: any = null;\n${write}\n` +
      lane(`${ISO}, ...(toolOpts ? { mcpServers: toolOpts.mcpServers, allowedTools: toolOpts.allowedTools, strictMcpConfig: toolOpts.strictMcpConfig } : {})`);
    expect(verdict(profile("toolOpts = buildSdkToolOptions(s, i);"))).toEqual([]);
    expect(verdict(profile("toolOpts = { mcpServers: { playwright: {} } };")).length).toBeGreaterThan(0);
    expect(verdict(profile("toolOpts = buildSdkToolOptions(s, i); toolOpts.mcpServers = {};")).length).toBeGreaterThan(0);
  });
});

describe("the launch ruler refuses a runtime `claude`", () => {
  const verdict = (text: string): string[] => analyzeLaunches("x/src/launch.ts", text).problems;

  it("lets an honest launch through", () => {
    expect(verdict(`import { execFile } from "node:child_process";\nexecFile("graphify", ["update", "p"]);\n`)).toEqual([]);
  });

  const refused: Array<[string, string]> = [
    ["a named launch", `import { execFile } from "node:child_process";\nexecFile("claude", ["-p", "x"]);\n`],
    ["a namespace launch", `import * as cp from "node:child_process";\ncp.spawn("claude", []);\n`],
    ["a default-import launch", `import cp from "child_process";\ncp.execFileSync("/usr/bin/claude", []);\n`],
    ["a promisified launch", `import { execFile } from "node:child_process";\nimport { promisify } from "node:util";\nconst run = promisify(execFile);\nawait run("claude", []);\n`],
    ["a program held in a const", `import { spawn } from "node:child_process";\nconst BIN = "claude";\nspawn(BIN, []);\n`],
    ["a shell line", `import { exec } from "node:child_process";\nexec("claude -p hi");\n`],
    ["a program the ruler cannot name, beside a claude string", `import { spawn } from "node:child_process";\nconst why = "not claude";\nspawn(process.env.BIN!, []);\n`],
    ["child_process by require()", `const cp = require("child_process");\ncp.spawn("ls");\n`],
    ["a launcher handed on, beside a codex string", `import { execFile } from "node:child_process";\nconst tool = "codex";\nexport const deps = { execFile };\n`],
  ];

  it.each(refused)("refuses %s", (_name, text) => {
    expect(verdict(text).length).toBeGreaterThan(0);
  });
});

// ── the helper and its receipt ───────────────────────────────────────────────────────────────────

describe("companyIsolation() and its receipt", () => {
  const helper = () => import("../../packages/kernel/src/sdk-isolation.js");

  it("shuts out filesystem settings (hooks, plugins, MCP, CLAUDE.md), the auto-memory, the transcript and the account's connectors", async () => {
    const { companyIsolation } = await helper();
    expect(companyIsolation({ DXB_REPO_ROOT: "/r" } as NodeJS.ProcessEnv)).toEqual({
      settingSources: [],
      settings: { autoMemoryEnabled: false },
      persistSession: false,
      strictMcpConfig: true,
      cwd: "/r",
    });
  });

  it("the compiled profile keeps strictMcpConfig true — the lanes that pass it after the helper cannot loosen it", async () => {
    const { buildSdkToolOptions } = await import("../../packages/gateway/src/runtime-profile.js");
    expect(buildSdkToolOptions({ source: "none", mcpServers: {}, allowedTools: [], grantedPairs: [] }, []).strictMcpConfig).toBe(true);
  });

  it("DXB_WORKER_ISOLATION=0 is the rollback shape", async () => {
    const { companyIsolation } = await helper();
    expect(companyIsolation({ DXB_WORKER_ISOLATION: "0" } as NodeJS.ProcessEnv)).toBeNull();
  });

  it("prints one line per result — the lane, the run's own session, what it loaded, what it read", async () => {
    const { isolationReceipt } = await helper();
    const lines: string[] = [];
    const see = isolationReceipt("chat", (line) => lines.push(line));
    see({
      type: "system",
      subtype: "init",
      session_id: "5f0c",
      tools: [],
      mcp_servers: [],
      plugins: [],
      skills: ["update-config", "debug"],
      agents: ["general-purpose"],
    });
    see({ type: "assistant", message: { content: [] }, session_id: "5f0c" });
    see({
      type: "result",
      subtype: "success",
      session_id: "5f0c",
      usage: { input_tokens: 4, cache_creation_input_tokens: 400, cache_read_input_tokens: 72 },
    });
    expect(lines).toEqual(["[isolation] lane=chat session=5f0c tools=0 mcp=0 plugins=0 skills=2 agents=1 hooks=0 input=476"]);
  });

  it("names what a leaking run loaded, the hooks it fired included, so the line shows it", async () => {
    const { isolationReceipt } = await helper();
    const lines: string[] = [];
    const see = isolationReceipt("voice", (line) => lines.push(line));
    see({ type: "system", subtype: "hook_started", hook_event: "SessionStart", session_id: "9a1e" });
    see({
      type: "system",
      subtype: "init",
      session_id: "9a1e",
      tools: ["mcp__playwright__browser_navigate", "mcp__scrapling__fetch"],
      mcp_servers: [{ name: "playwright", status: "connected" }, { name: "scrapling", status: "connected" }],
      plugins: [{ name: "claude-mem", path: "/x" }],
      skills: ["dxb-team2"],
      agents: ["builder", "refuter"],
    });
    see({ type: "result", subtype: "success", usage: { input_tokens: 44_306 } });
    expect(lines).toEqual(["[isolation] lane=voice session=9a1e tools=2 mcp=2 plugins=1 skills=1 agents=2 hooks=1 input=44306"]);
  });

  it("never touches the call: a sink that throws and messages of any shape pass through quietly", async () => {
    const { isolationReceipt } = await helper();
    const see = isolationReceipt("chat", () => {
      throw new Error("journal sink failed");
    });
    for (const m of [null, undefined, "text", 7, { type: "system", subtype: "init", tools: "many" }, { type: "result", usage: null }]) {
      expect(() => see(m)).not.toThrow();
    }
    expect(() => see({ type: "result", subtype: "success", usage: { input_tokens: "lots" } })).not.toThrow();
  });

  it("an odd token count reads as zero, never as a broken line", async () => {
    const { isolationReceipt } = await helper();
    const lines: string[] = [];
    const see = isolationReceipt("qa", (line) => lines.push(line));
    see({ type: "result", usage: { input_tokens: "lots", cache_read_input_tokens: 9 } });
    expect(lines).toEqual(["[isolation] lane=qa session=? tools=? mcp=? plugins=? skills=? agents=? hooks=0 input=9"]);
  });
});

// ── Phase 2 — the critical gate's Codex (CEO 2026-10-03, option (b): the company's own login) ────
// Measured that day: run from ~/.codex, the gate's challengers loaded the construction's global Codex
// notes (AGENTS.md) and started its MCP servers; `--ignore-user-config`, `--ignore-rules` and
// `-c project_doc_max_bytes=0` left the notes in; a clean CODEX_HOME holding only a login dropped
// both. Only the gate launches codex, and the last word of its env is the company's own home.

const GATE = "packages/orchestrator/src/critical-gate.ts";

/** `env: { …, CODEX_HOME: companyCodexHome() }` — the company home is the LAST word, so nothing after it overrides it. */
function namesCompanyHome(env: ts.Expression | null): boolean {
  if (!env || !ts.isObjectLiteralExpression(env)) return false;
  const last = env.properties[env.properties.length - 1];
  if (!last || !ts.isPropertyAssignment(last) || nameText(last.name) !== "CODEX_HOME") return false;
  const v = unwrap(last.initializer);
  return ts.isCallExpression(v) && ts.isIdentifier(v.expression) && v.expression.text === "companyCodexHome" && v.arguments.length === 0;
}

describe("company isolation — the critical gate's Codex runs from the company's own home", () => {
  const codex = SOURCES.flatMap((s) => analyzeLaunches(s.rel, s.text).launches).filter((l) => l.program === "codex");

  it("finds the gate's codex launch, and no other", () => {
    expect(codex.map((l) => l.file)).toEqual([GATE]);
  });

  it("the gate's launch ends its env with CODEX_HOME: companyCodexHome()", () => {
    expect(codex.filter((l) => !namesCompanyHome(l.env)).map((l) => l.where)).toEqual([]);
  });

  const launch = (opts: string): Launch => {
    const text = `import { execFile } from "node:child_process";\nexecFile("codex", ["exec"], { timeout: 1${opts} }, () => {});\n`;
    return analyzeLaunches("x/src/gate.ts", text).launches[0];
  };

  it("reads the honest env", () => {
    expect(namesCompanyHome(launch(", env: { ...process.env, CODEX_HOME: companyCodexHome() }").env)).toBe(true);
  });

  it.each([
    ["the environment spread after the home", ", env: { CODEX_HOME: companyCodexHome(), ...process.env }"],
    ["no env at all", ""],
    ["an env it cannot read", ", env: e"],
    ["the construction's home", ', env: { ...process.env, CODEX_HOME: "/home/dxb/.codex" }'],
    ["the helper given an argument", ", env: { ...process.env, CODEX_HOME: companyCodexHome({}) }"],
  ])("refuses %s", (_name, opts) => {
    expect(namesCompanyHome(launch(opts).env)).toBe(false);
  });

  it("the real runner hands a stand-in codex the company home, never the construction's ~/.codex", async () => {
    const box = mkdtempSync(join(tmpdir(), "company-codex-"));
    try {
      const bin = join(box, "bin");
      mkdirSync(bin);
      // The stand-in answers like `codex exec -o <file>`: it writes what it was handed, so no model is called.
      writeFileSync(
        join(bin, "codex"),
        '#!/usr/bin/env bash\nwhile [ $# -gt 0 ]; do [ "$1" = "-o" ] && out="$2"; shift; done\nprintf \'{"codex_home":"%s"}\' "$CODEX_HOME" > "$out"\n',
      );
      chmodSync(join(bin, "codex"), 0o755);
      const home = join(box, "company-codex");
      const { codexRunner, companyCodexHome } = await import("../../packages/orchestrator/src/critical-gate.js");
      const saved = { PATH: process.env.PATH, HOME_: process.env.DXB_COMPANY_CODEX_HOME };
      process.env.PATH = `${bin}:${process.env.PATH}`;
      process.env.DXB_COMPANY_CODEX_HOME = home;
      try {
        expect(companyCodexHome()).toBe(home);
        const res = await codexRunner({ model: "stand-in", prompt: "p", timeoutMs: 10_000 });
        expect(res.ok).toBe(true);
        expect(JSON.parse((res as { raw: string }).raw)).toEqual({ codex_home: home });
      } finally {
        process.env.PATH = saved.PATH;
        if (saved.HOME_ === undefined) delete process.env.DXB_COMPANY_CODEX_HOME;
        else process.env.DXB_COMPANY_CODEX_HOME = saved.HOME_;
      }
      // with no override, the company home is its own place — not the construction's ~/.codex
      expect(companyCodexHome({} as NodeJS.ProcessEnv)).toBe(join(homedir(), ".local", "share", "dxb", "company-codex"));
    } finally {
      rmSync(box, { recursive: true, force: true });
    }
  });
});
