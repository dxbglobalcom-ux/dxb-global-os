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
// model call goes through `query()`. Sol's single pass refuted the reading itself (spellings, not
// bindings); since then every file is bound by the compiler — see "the reading tools". Its limit: a
// program name assembled at run time outside the file is beyond any static reading; the receipts and
// the live probe are the run-time witnesses.
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir, userInfo } from "node:os";
import { basename, dirname, join, relative, resolve } from "node:path";
import ts from "typescript";
import { describe, expect, it, vi } from "vitest";

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
// Sol's single pass (2026-10-03 14:16) refuted a ruler that matched spellings: a file was read only if
// its text held "claude-agent-sdk" (a computed or escaped specifier walked past it), the helper was
// any file named sdk-isolation, a receipt or the profile was a NAME (a hoisted function shadowed the
// one, Object.assign changed the other), and a launch was read only through `ns.fn` and the first
// word of a shell line. So every file is now bound by the TypeScript compiler itself
// (`ts.createProgram` + `getTypeChecker`, the file served from memory): a name is the declaration it
// resolves to, a specifier is its parsed value — and for a package, the module it resolves to — and a
// string is what its literals fold to.

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

/** A name being declared, not read. */
function isDeclarationName(n: ts.Identifier): boolean {
  const p = n.parent;
  if (isNameSlot(n) || ts.isImportEqualsDeclaration(p)) return true;
  if (ts.isBindingElement(p)) return p.name === n;
  return (
    (ts.isVariableDeclaration(p) ||
      ts.isParameter(p) ||
      ts.isFunctionDeclaration(p) ||
      ts.isFunctionExpression(p) ||
      ts.isClassDeclaration(p) ||
      ts.isClassExpression(p) ||
      ts.isEnumDeclaration(p) ||
      ts.isInterfaceDeclaration(p) ||
      ts.isTypeAliasDeclaration(p) ||
      ts.isModuleDeclaration(p)) &&
    p.name === n
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

function everyNode(root: ts.Node, visit: (n: ts.Node) => void): void {
  const go = (n: ts.Node): void => {
    visit(n);
    ts.forEachChild(n, go);
  };
  go(root);
}

interface Bound {
  sf: ts.SourceFile;
  /** The binding an identifier reads — a shorthand property its value, `export { x }` its local x. */
  symbolOf: (id: ts.Identifier) => ts.Symbol | undefined;
  /** What an expression folds to from literals, `+`, templates and the consts they name; null if not. */
  fold: (e: ts.Expression) => string | null;
}

/** One file, bound by the compiler: no lib, no other file — the names it declares and imports. */
function bind(rel: string, text: string): Bound {
  const fileName = join(REPO, rel);
  const options: ts.CompilerOptions = {
    noLib: true,
    noResolve: true,
    allowJs: true,
    noEmit: true,
    types: [],
    target: ts.ScriptTarget.Latest,
    module: ts.ModuleKind.ESNext,
  };
  const sf = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true);
  const host = ts.createCompilerHost(options, true);
  host.getSourceFile = (f) => (f === fileName ? sf : undefined);
  host.fileExists = (f) => f === fileName;
  host.readFile = (f) => (f === fileName ? text : undefined);
  const checker = ts.createProgram({ rootNames: [fileName], options, host }).getTypeChecker();
  const symbolOf = (id: ts.Identifier): ts.Symbol | undefined => {
    const p = id.parent;
    if (ts.isShorthandPropertyAssignment(p) && p.name === id) return checker.getShorthandAssignmentValueSymbol(p);
    if (ts.isExportSpecifier(p) && !p.parent.parent.moduleSpecifier) return checker.getExportSpecifierLocalTargetSymbol(p);
    return checker.getSymbolAtLocation(id);
  };
  const folding = new Set<ts.Node>();
  const fold = (x: ts.Expression): string | null => {
    const e = unwrap(x);
    if (ts.isStringLiteralLike(e) || ts.isNumericLiteral(e)) return e.text;
    if (ts.isTemplateExpression(e)) {
      let s = e.head.text;
      for (const span of e.templateSpans) {
        const v = fold(span.expression);
        if (v === null) return null;
        s += v + span.literal.text;
      }
      return s;
    }
    if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.PlusToken) {
      const l = fold(e.left);
      const r = l === null ? null : fold(e.right);
      return l !== null && r !== null ? l + r : null;
    }
    if (ts.isIdentifier(e)) {
      const d = symbolOf(e)?.valueDeclaration;
      if (!d || !ts.isVariableDeclaration(d) || !isConst(d) || !d.initializer || folding.has(d)) return null;
      folding.add(d);
      try {
        return fold(d.initializer);
      } finally {
        folding.delete(d);
      }
    }
    return null;
  };
  return { sf, symbolOf, fold };
}

/** Every identifier in the file that reads `s` (declarations and type positions left out). */
function referencesTo(b: Bound, s: ts.Symbol): ts.Identifier[] {
  const out: ts.Identifier[] = [];
  everyNode(b.sf, (n) => {
    if (ts.isIdentifier(n) && !isDeclarationName(n) && !inTypePosition(n) && b.symbolOf(n) === s) out.push(n);
  });
  return out;
}

/** `require(…)`, `import(…)`, `module.require(…)`, `createRequire(…)(…)` and a const made by createRequire. */
function isLoaderCall(n: ts.CallExpression, b: Bound): boolean {
  if (n.expression.kind === ts.SyntaxKind.ImportKeyword) return true;
  const e = unwrap(n.expression);
  const madeByCreateRequire = (x: ts.Expression): boolean => {
    const c = unwrap(x);
    return ts.isCallExpression(c) && /(?:^|\.)createRequire$/.test(c.expression.getText(b.sf));
  };
  if (ts.isIdentifier(e)) {
    if (e.text === "require") return true;
    const d = b.symbolOf(e)?.valueDeclaration;
    return !!d && ts.isVariableDeclaration(d) && !!d.initializer && madeByCreateRequire(d.initializer);
  }
  if (ts.isPropertyAccessExpression(e) && e.name.text === "require") return true;
  return madeByCreateRequire(e);
}

// ── module identity ──────────────────────────────────────────────────────────────────────────────

const SDK_PACKAGE = "@anthropic-ai/claude-agent-sdk";
/** The kernel's helper — the one file companyIsolation() and isolationReceipt() may come from. */
const HELPER = "packages/kernel/src/sdk-isolation.ts";
const GATEWAY = "@dxb/gateway";
const RESOLVE_OPTIONS: ts.CompilerOptions = { module: ts.ModuleKind.NodeNext, moduleResolution: ts.ModuleResolutionKind.NodeNext };
const RESOLVE_CACHE = ts.createModuleResolutionCache(REPO, (f) => f, RESOLVE_OPTIONS);

/** The SDK by the specifier's parsed value, or — for a package — by the module it resolves to
 *  (an npm alias of the SDK resolves into the SDK's own folder). */
function isSdkModule(spec: string, rel: string): boolean {
  if (spec.includes(SDK)) return true;
  if (/^(?:\.|\/|node:)/.test(spec)) return false;
  const r = ts.resolveModuleName(spec, resolve(REPO, rel), RESOLVE_OPTIONS, ts.sys, RESOLVE_CACHE).resolvedModule;
  return !!r && (r.packageId?.name === SDK_PACKAGE || r.resolvedFileName.includes(`/node_modules/${SDK_PACKAGE}/`));
}

/** `@dxb/kernel` (its index re-exports the helper — pinned below) or a relative path to the helper itself. */
function isHelperModule(spec: string, rel: string): boolean {
  if (spec === "@dxb/kernel") return true;
  if (!spec.startsWith(".")) return false;
  return join(dirname(rel), spec).replace(/\.[cm]?js$/, ".ts") === HELPER;
}

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
  bound: Bound;
  isolation: Set<ts.Symbol>;
  receipt: Set<ts.Symbol>;
  /** The binding is the compiled profile, built by buildSdkToolOptions() and only read. */
  fromProfile: (s: ts.Symbol) => boolean;
}

/** A parameter declared readonly, in a function this file declares: a profile member may be read there. */
function readonlyParameter(call: ts.CallExpression, arg: ts.Expression, b: Bound): boolean {
  const callee = unwrap(call.expression);
  if (!ts.isIdentifier(callee)) return false;
  const d = b.symbolOf(callee)?.valueDeclaration;
  if (!d || !ts.isFunctionDeclaration(d) || d.getSourceFile() !== b.sf) return false;
  const t = d.parameters[call.arguments.indexOf(arg)]?.type;
  if (!t) return false;
  if (ts.isTypeOperatorNode(t)) return t.operator === ts.SyntaxKind.ReadonlyKeyword;
  return ts.isTypeReferenceNode(t) && /^Readonly(?:Array|Set|Map)?$/.test(t.typeName.getText(b.sf));
}

/** The compiled profile: written only by `buildSdkToolOptions(…)` (or an empty start), then only
 *  tested (`p ? … : …`, `p !== null`) and read member by member into the options — never handed on,
 *  never changed (Sol's single pass: `Object.assign(profile, …)` went through). */
function profileCheck(b: Bound, builders: Set<ts.Symbol>, report: SdkReport, rel: string): (s: ts.Symbol) => boolean {
  const memo = new Map<ts.Symbol, boolean>();
  const isBuilt = (x: ts.Expression): boolean => {
    const e = unwrap(x);
    return ts.isCallExpression(e) && ts.isIdentifier(e.expression) && builders.has(b.symbolOf(e.expression)!);
  };
  const isEmpty = (x?: ts.Expression): boolean =>
    !x || x.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(x) && x.text === "undefined");
  const isNullish = (x: ts.Expression): boolean => isEmpty(unwrap(x));
  return (s) => {
    const known = memo.get(s);
    if (known !== undefined) return known;
    const why: string[] = [];
    let built = 0;
    for (const d of s.declarations ?? []) {
      if (!ts.isVariableDeclaration(d)) why.push(`it is a ${ts.SyntaxKind[d.kind]}, not a variable`);
      else if (d.initializer && isBuilt(d.initializer)) built += 1;
      else if (!isEmpty(d.initializer)) why.push(`it starts as \`${d.initializer!.getText(b.sf).slice(0, 40)}\``);
    }
    for (const id of referencesTo(b, s)) {
      const p = id.parent;
      const line = lineOf(b.sf, id);
      if (ts.isBinaryExpression(p) && p.left === id && p.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && p.operatorToken.kind <= ts.SyntaxKind.LastAssignment) {
        if (p.operatorToken.kind === ts.SyntaxKind.EqualsToken && isBuilt(p.right)) built += 1;
        else why.push(`line ${line} writes \`${p.getText(b.sf).slice(0, 50)}\``);
        continue;
      }
      const tested =
        (ts.isConditionalExpression(p) && p.condition === id) ||
        (ts.isIfStatement(p) && p.expression === id) ||
        (ts.isPrefixUnaryExpression(p) && p.operator === ts.SyntaxKind.ExclamationToken) ||
        (ts.isBinaryExpression(p) && p.left === id && p.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) ||
        (ts.isBinaryExpression(p) &&
          [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken, ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken].includes(p.operatorToken.kind) &&
          isNullish(p.left === id ? p.right : p.left));
      if (tested) continue;
      if (ts.isPropertyAccessExpression(p) && p.expression === id) {
        // a member: read straight into an option, or into a readonly parameter of this file's own function
        let top: ts.Expression = p;
        while ((ts.isPropertyAccessExpression(top.parent) || ts.isElementAccessExpression(top.parent)) && top.parent.expression === top) top = top.parent;
        const q = top.parent;
        if (ts.isPropertyAssignment(q) && q.initializer === top) continue;
        if (ts.isCallExpression(q) && q.arguments.includes(top) && readonlyParameter(q, top, b)) continue;
        why.push(`line ${line} \`${top.getText(b.sf).slice(0, 50)}\` is used where it can change or leave`);
        continue;
      }
      why.push(`line ${line} \`${p.getText(b.sf).slice(0, 60)}\``);
    }
    const ok = built > 0 && why.length === 0;
    if (!ok) {
      const name = s.getName();
      report.problems.push(
        why.length > 0
          ? `${rel} the profile \`${name}\` is handed on or changed — ${why.join("; ")}`
          : `${rel} the profile \`${name}\` is never built by buildSdkToolOptions()`,
      );
    }
    memo.set(s, ok);
    return ok;
  };
}

function isIsolationSpread(x: ts.Expression, b: Bindings): boolean {
  const isCall = (y: ts.Expression): boolean => {
    const e = unwrap(y);
    return ts.isCallExpression(e) && ts.isIdentifier(e.expression) && b.isolation.has(b.bound.symbolOf(e.expression)!) && e.arguments.length === 0;
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
    if (v && ts.isPropertyAccessExpression(v) && v.name.text === key && ts.isIdentifier(v.expression)) {
      const s = b.bound.symbolOf(v.expression);
      if (s && b.fromProfile(s)) return;
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
  const symbolOf = b.bound.symbolOf;

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

  // 2. The receipt: this stream's own loop feeds it first, before anything can return — the stream,
  //    the message and the receipt each the binding this function declares, not a name that shadows it.
  let lane: string | null = null;
  const decl = call.parent;
  if (!ts.isVariableDeclaration(decl) || decl.initializer !== call || !ts.isIdentifier(decl.name) || !isConst(decl)) {
    problems.push("the stream is not held in a `const` — the receipt cannot be bound to it");
  } else {
    const stream = symbolOf(decl.name);
    const scope = enclosingFunction(call);
    const loops: ts.ForOfStatement[] = [];
    ownNodes(scope, (n) => {
      if (!ts.isForOfStatement(n) || !n.awaitModifier) return;
      const of = unwrap(n.expression);
      if (ts.isIdentifier(of) && symbolOf(of) === stream) loops.push(n);
    });
    if (loops.length !== 1) {
      problems.push(`the stream \`${decl.name.text}\` is read by ${loops.length} \`for await\` loops — one, exactly`);
    } else {
      const loop = loops[0];
      const init = loop.initializer;
      const message =
        ts.isVariableDeclarationList(init) && init.declarations.length === 1 && ts.isIdentifier(init.declarations[0].name)
          ? symbolOf(init.declarations[0].name)
          : undefined;
      const first = ts.isBlock(loop.statement) ? loop.statement.statements[0] : undefined;
      let fed: ts.Identifier | null = null;
      if (first && ts.isExpressionStatement(first) && ts.isCallExpression(first.expression)) {
        const c = first.expression;
        const a = c.arguments[0];
        if (ts.isIdentifier(c.expression) && c.arguments.length === 1 && ts.isIdentifier(a) && message && symbolOf(a) === message) fed = c.expression;
      }
      if (!fed) {
        problems.push("the loop's first step is not `<receipt>(<message>)` — a result could leave before the receipt sees it");
      } else {
        const d = symbolOf(fed)?.valueDeclaration;
        const r = d && ts.isVariableDeclaration(d) && isConst(d) && enclosingFunction(d) === scope && d.initializer ? unwrap(d.initializer) : undefined;
        if (
          r &&
          ts.isCallExpression(r) &&
          ts.isIdentifier(r.expression) &&
          b.receipt.has(symbolOf(r.expression)!) &&
          r.arguments.length === 1 &&
          ts.isStringLiteral(r.arguments[0])
        ) {
          lane = r.arguments[0].text;
        } else {
          problems.push(`\`${fed.text}\` at the loop's first step is not the receipt this function declares — \`const ${fed.text} = isolationReceipt("<lane>")\``);
        }
      }
    }
  }
  return { where: `${rel}:${lineOf(sf, call)}`, lane, problems };
}

function analyzeSdk(rel: string, text: string): SdkReport {
  const report: SdkReport = { file: rel, sites: [], problems: [] };
  const bound = bind(rel, text);
  const { sf, symbolOf } = bound;
  const at = (n: ts.Node): string => `${rel}:${lineOf(sf, n)}`;
  const queries = new Set<ts.Symbol>();
  const isolation = new Set<ts.Symbol>();
  const receipt = new Set<ts.Symbol>();
  const builders = new Set<ts.Symbol>();
  const add = (set: Set<ts.Symbol>, id: ts.Identifier): void => {
    const s = symbolOf(id);
    if (s) set.add(s);
  };

  const imports = (n: ts.Node): void => {
    if (ts.isImportDeclaration(n) && ts.isStringLiteral(n.moduleSpecifier)) {
      const spec = n.moduleSpecifier.text;
      const clause = n.importClause;
      if (isSdkModule(spec, rel)) {
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
              if (imported === "query") add(queries, el.name);
              else report.problems.push(`${at(el)} \`${imported}\` imported from the SDK — not on the ruler's list`);
            }
          }
        }
      } else if (clause && !isTypeOnly(clause) && clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
        for (const el of clause.namedBindings.elements) {
          if (el.isTypeOnly) continue;
          const imported = nameText(el.propertyName ?? el.name);
          if (imported === "companyIsolation" || imported === "isolationReceipt") {
            if (!isHelperModule(spec, rel)) {
              report.problems.push(`${at(el)} \`${imported}\` imported from "${spec}" — not the kernel's helper (${HELPER})`);
            } else add(imported === "companyIsolation" ? isolation : receipt, el.name);
          }
          if (spec === GATEWAY && imported === "buildSdkToolOptions") add(builders, el.name);
        }
      }
    }
    if (
      ts.isImportEqualsDeclaration(n) &&
      ts.isExternalModuleReference(n.moduleReference) &&
      ts.isStringLiteral(n.moduleReference.expression) &&
      isSdkModule(n.moduleReference.expression.text, rel)
    ) {
      report.problems.push(`${at(n)} \`import … = require()\` of the SDK`);
    }
    if (ts.isExportDeclaration(n) && n.moduleSpecifier && ts.isStringLiteral(n.moduleSpecifier) && isSdkModule(n.moduleSpecifier.text, rel)) {
      report.problems.push(`${at(n)} a re-export from the SDK — a wrapper the ruler cannot follow`);
    }
    if (ts.isCallExpression(n) && isLoaderCall(n, bound)) {
      const a = n.arguments[0] ? unwrap(n.arguments[0]) : undefined;
      if (!a || !ts.isStringLiteralLike(a)) {
        report.problems.push(`${at(n)} \`${n.getText(sf).slice(0, 60)}\` — a module the ruler cannot name (its specifier is not a literal)`);
      } else if (isSdkModule(a.text, rel)) {
        report.problems.push(`${at(n)} \`${n.getText(sf).slice(0, 60)}\` — the SDK is taken only as a static \`import { query }\``);
      }
    }
    ts.forEachChild(n, imports);
  };
  imports(sf);

  const b: Bindings = { bound, isolation, receipt, fromProfile: profileCheck(bound, builders, report, rel) };
  for (const q of queries) {
    for (const id of referencesTo(bound, q)) {
      const p = id.parent;
      if (ts.isCallExpression(p) && p.expression === id) report.sites.push(checkSite(sf, rel, p, b));
      else report.problems.push(`${at(id)} \`${id.text}\` used as a value (\`${p.getText(sf).slice(0, 60)}\`) — an alias the ruler cannot follow`);
    }
  }
  return report;
}

// ── process launches — no runtime `claude`; the gate's `codex` from the company's own home ───────

const GATE = "packages/orchestrator/src/critical-gate.ts";
const CHILD = new Set(["node:child_process", "child_process"]);
const LAUNCHERS = new Set(["execFile", "execFileSync", "spawn", "spawnSync", "exec", "execSync", "fork"]);
const SHELL = new Set(["exec", "execSync"]);
const AGENT_WORD = /\b(?:claude|codex)\b/;
/** Programs that run another program named in their arguments — read through, never trusted. */
const WRAPPERS = new Set([
  "env", "sh", "bash", "dash", "zsh", "ksh", "fish", "busybox", "nohup", "timeout", "xargs", "exec", "nice", "ionice",
  "setsid", "stdbuf", "sudo", "doas", "su", "runuser", "command", "time", "flock", "chrt", "taskset", "unbuffer",
  "script", "systemd-run", "strace", "ltrace", "watch", "parallel", "firejail", "bwrap", "npx", "pnpm", "node",
]);

interface Launch {
  where: string;
  file: string;
  /** The program's basename, or null when the ruler cannot name it. */
  program: string | null;
  /** The `env` the launch's options literal LEAVES — the last one — or null when there is none or it cannot be read. */
  env: ts.Expression | null;
}

interface LaunchReport {
  launches: Launch[];
  problems: string[];
}

const isPromisify = (c: ts.CallExpression, sf: ts.SourceFile): boolean => /(?:^|\.)promisify$/.test(c.expression.getText(sf));

/** The program a shell line runs: past `NAME=value`, option flags, durations and the wrappers. */
function shellProgram(line: string): string | null {
  for (const w of line.trim().split(/\s+/)) {
    if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(w) || w.startsWith("-") || /^\d+[smhd]?$/.test(w) || WRAPPERS.has(basename(w))) continue;
    return basename(w.replace(/^["']|["']$/g, ""));
  }
  return null;
}

/** The env an options literal leaves: properties in order, spreads read through; unreadable → null. */
function lastEnv(options: ts.ObjectLiteralExpression, b: Bound): { env: ts.Expression | null; readable: boolean } {
  let env: ts.Expression | null = null;
  let readable = true;
  const walk = (o: ts.ObjectLiteralExpression): void => {
    for (const p of o.properties) {
      if (ts.isSpreadAssignment(p)) {
        const e = unwrap(p.expression);
        if (ts.isObjectLiteralExpression(e)) walk(e);
        else readable = false; // a spread the ruler cannot see into could carry an env
        continue;
      }
      const key = p.name && ts.isComputedPropertyName(p.name) ? b.fold(p.name.expression) : p.name ? nameText(p.name as ts.PropertyName) : null;
      if (key === null) {
        readable = false;
        continue;
      }
      if (key !== "env") continue;
      if (ts.isPropertyAssignment(p)) env = unwrap(p.initializer);
      else readable = false; // `{ env }` or a method: not a literal the ruler can read
    }
  };
  walk(options);
  return readable ? { env, readable } : { env: null, readable };
}

function analyzeLaunches(rel: string, text: string): LaunchReport {
  const report: LaunchReport = { launches: [], problems: [] };
  const bound = bind(rel, text);
  const { sf, symbolOf, fold } = bound;
  const at = (n: ts.Node): string => `${rel}:${lineOf(sf, n)}`;
  const launchers = new Map<ts.Symbol, string>(); // a binding → the child_process function it is
  const namespaces = new Set<ts.Symbol>();
  let namesAgent = false; // a string in this file — as its literals fold — names claude or codex

  everyNode(sf, (n) => {
    const plusRoot =
      ts.isBinaryExpression(n) &&
      n.operatorToken.kind === ts.SyntaxKind.PlusToken &&
      !(ts.isBinaryExpression(n.parent) && n.parent.operatorToken.kind === ts.SyntaxKind.PlusToken);
    if (ts.isStringLiteralLike(n) || ts.isTemplateExpression(n) || plusRoot) {
      const v = fold(n as ts.Expression) ?? (ts.isTemplateExpression(n) ? n.getText(sf) : null);
      if (v !== null && AGENT_WORD.test(v)) namesAgent = true;
    }
    if (ts.isImportDeclaration(n) && ts.isStringLiteral(n.moduleSpecifier) && CHILD.has(n.moduleSpecifier.text)) {
      const c = n.importClause;
      if (c && !isTypeOnly(c)) {
        const ns = (id: ts.Identifier): void => {
          const s = symbolOf(id);
          if (s) namespaces.add(s);
        };
        if (c.name) ns(c.name);
        if (c.namedBindings && ts.isNamespaceImport(c.namedBindings)) ns(c.namedBindings.name);
        if (c.namedBindings && ts.isNamedImports(c.namedBindings)) {
          for (const el of c.namedBindings.elements) {
            const imported = nameText(el.propertyName ?? el.name);
            const s = symbolOf(el.name);
            if (!el.isTypeOnly && imported && LAUNCHERS.has(imported) && s) launchers.set(s, imported);
          }
        }
      }
    }
    if (ts.isExportDeclaration(n) && n.moduleSpecifier && ts.isStringLiteral(n.moduleSpecifier) && CHILD.has(n.moduleSpecifier.text)) {
      report.problems.push(`${at(n)} child_process re-exported — a launcher the ruler cannot follow`);
    }
    if (ts.isCallExpression(n) && isLoaderCall(n, bound)) {
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
  });

  const isNamespace = (x: ts.Expression): boolean => {
    const e = unwrap(x);
    const s = ts.isIdentifier(e) ? symbolOf(e) : undefined;
    return !!s && namespaces.has(s);
  };
  /** The child_process function an expression is — a binding, `ns.fn`, `ns["fn"]` — or null. */
  const launcherOf = (x: ts.Expression): string | null => {
    const e = unwrap(x);
    if (ts.isIdentifier(e)) {
      const s = symbolOf(e);
      return s ? (launchers.get(s) ?? null) : null;
    }
    if (ts.isPropertyAccessExpression(e) && isNamespace(e.expression)) return LAUNCHERS.has(e.name.text) ? e.name.text : null;
    if (ts.isElementAccessExpression(e) && isNamespace(e.expression)) {
      const key = fold(e.argumentExpression);
      return key !== null && LAUNCHERS.has(key) ? key : null;
    }
    return null;
  };

  // const aliases, to a fixpoint: `const run = cp.execFile`, `promisify(execFile)`, `const { spawn: s } = cp`, `const c = cp`
  for (let grew = true; grew; ) {
    grew = false;
    everyNode(sf, (n) => {
      if (!ts.isVariableDeclaration(n) || !n.initializer || !isConst(n)) return;
      const init = unwrap(n.initializer);
      if (ts.isIdentifier(n.name)) {
        const s = symbolOf(n.name);
        if (!s || launchers.has(s) || namespaces.has(s)) return;
        const fn = launcherOf(init) ?? (ts.isCallExpression(init) && init.arguments.length === 1 && isPromisify(init, sf) ? launcherOf(init.arguments[0]) : null);
        if (fn) {
          launchers.set(s, fn);
          grew = true;
        } else if (isNamespace(init)) {
          namespaces.add(s);
          grew = true;
        }
      } else if (ts.isObjectBindingPattern(n.name) && isNamespace(init)) {
        for (const el of n.name.elements) {
          const prop = el.propertyName ? nameText(el.propertyName) : ts.isIdentifier(el.name) ? el.name.text : null;
          const s = ts.isIdentifier(el.name) ? symbolOf(el.name) : undefined;
          if (prop && LAUNCHERS.has(prop) && s && !launchers.has(s)) {
            launchers.set(s, prop);
            grew = true;
          }
        }
      }
    });
  }

  // every reference to a launcher or the namespace is a launch, an alias, or a member read — never handed on
  // a const alias stays in this file: exported, it would launch where the ruler does not read
  const localConst = (d: ts.Node): boolean =>
    ts.isVariableDeclaration(d) && isConst(d) && (ts.getCombinedModifierFlags(d) & ts.ModifierFlags.Export) === 0;
  const aliasOrLaunch = (e: ts.Expression): boolean => {
    const p = e.parent;
    if (ts.isCallExpression(p) && p.expression === e) return true;
    if (ts.isVariableDeclaration(p) && p.initializer === e) return localConst(p);
    return ts.isCallExpression(p) && p.arguments.length === 1 && p.arguments[0] === e && isPromisify(p, sf) && localConst(p.parent);
  };
  everyNode(sf, (n) => {
    if (!ts.isIdentifier(n) || isDeclarationName(n) || inTypePosition(n)) return;
    const s = symbolOf(n);
    if (!s) return;
    if (launchers.has(s) && !aliasOrLaunch(n)) {
      report.problems.push(`${at(n)} \`${n.text}\` handed on as a value — a launcher the ruler cannot follow`);
    }
    if (namespaces.has(s)) {
      const p = n.parent;
      if (ts.isPropertyAccessExpression(p) && p.expression === n) {
        if (LAUNCHERS.has(p.name.text) && !aliasOrLaunch(p)) report.problems.push(`${at(n)} \`${p.getText(sf)}\` handed on as a value`);
      } else if (ts.isElementAccessExpression(p) && p.expression === n) {
        const key = fold(p.argumentExpression);
        if (key === null) report.problems.push(`${at(n)} \`${p.getText(sf).slice(0, 60)}\` — a child_process member the ruler cannot name`);
        else if (LAUNCHERS.has(key) && !aliasOrLaunch(p)) report.problems.push(`${at(n)} \`${p.getText(sf)}\` handed on as a value`);
      } else if (!(ts.isVariableDeclaration(p) && p.initializer === n && localConst(p))) {
        report.problems.push(`${at(n)} the child_process namespace \`${n.text}\` handed on as a value`);
      }
    }
  });

  everyNode(sf, (n) => {
    if (!ts.isCallExpression(n)) return;
    const fn = launcherOf(n.expression);
    if (!fn) return;
    const args = n.arguments.map(unwrap);
    const first = args[0] ? fold(args[0]) : null;
    const list = args[1] && ts.isArrayLiteralExpression(args[1]) ? args[1] : undefined;
    const listed = list ? list.elements.map((e) => (ts.isSpreadElement(e) ? null : fold(e))) : null;
    // Node's own signatures: exec(command, options?, cb?); the others (file, args?, options?, cb?) —
    // a literal second argument is the options, anything else there is the args
    const options = SHELL.has(fn) || (args[1] && ts.isObjectLiteralExpression(args[1])) ? args[1] : args[2];
    const optionsLiteral = options && ts.isObjectLiteralExpression(options) ? options : undefined;
    const shellOpt = optionsLiteral?.properties.some(
      (p) => ts.isPropertyAssignment(p) && nameText(p.name) === "shell" && unwrap(p.initializer).kind !== ts.SyntaxKind.FalseKeyword,
    );
    let program: string | null;
    if (SHELL.has(fn) || shellOpt) {
      const line = SHELL.has(fn) ? first : first !== null && listed && !listed.includes(null) ? [first, ...listed].join(" ") : null;
      if (line !== null && AGENT_WORD.test(line)) {
        report.problems.push(`${at(n)} a shell line that names claude or codex — only the gate's own \`execFile("codex", …)\` may launch one`);
      }
      program = line !== null ? shellProgram(line) : null;
    } else {
      program = first !== null ? basename(first) : null;
      if (program !== null && WRAPPERS.has(program)) {
        if (listed && listed.some((v) => v !== null && AGENT_WORD.test(v))) {
          report.problems.push(`${at(n)} a launch through \`${program}\` that names claude or codex`);
        } else if ((!listed || listed.includes(null)) && namesAgent) {
          report.problems.push(`${at(n)} a launch through \`${program}\` whose arguments the ruler cannot read, in a file that names claude or codex`);
        }
      }
    }
    const env = optionsLiteral ? lastEnv(optionsLiteral, bound).env : null;
    report.launches.push({ where: at(n), file: rel, program, env });
    if (program === "claude") {
      report.problems.push(`${at(n)} a runtime launch of \`claude\` — a company model call goes through query() with companyIsolation()`);
    }
    if (program === "codex") {
      if (rel !== GATE) report.problems.push(`${at(n)} a launch of \`codex\` outside the critical gate (${GATE})`);
      const home = env && ts.isObjectLiteralExpression(env) ? env.properties[env.properties.length - 1] : undefined;
      const call = home && ts.isPropertyAssignment(home) ? unwrap(home.initializer) : undefined;
      if (call && ts.isCallExpression(call) && ts.isIdentifier(call.expression)) {
        const d = symbolOf(call.expression)?.valueDeclaration;
        if (!d || !ts.isFunctionDeclaration(d) || d.parent !== sf) {
          report.problems.push(`${at(n)} \`${call.expression.text}\` here is not the function this file declares at its top level`);
        }
      }
    }
    if (program === null && namesAgent) {
      report.problems.push(`${at(n)} a launch whose program the ruler cannot name, in a file that names claude or codex`);
    }
  });
  return report;
}

// ── no runtime code writes process.env (Sol's single pass on phase 3, A2) ──────────────────────
// The helper hands a company call an allowlisted copy of the parent's env, so a variable off the list
// never reaches the call whatever the parent holds. What the list does carry — DXB_*, PATH — and the
// home's own knob DXB_COMPANY_CLAUDE_HOME would still move with a write to process.env before the
// call; Sol's counter-example set one and the ruler said problems=[]. The runtime writes none today,
// so the ruler refuses every write it can see: an assignment (=, ??=, ||=, &&=) to a member of
// process.env, a delete of one, process.env replaced, and Object.assign / Object.defineProperty /
// Reflect.set / Reflect.deleteProperty / Object.defineProperties on it. Its limit, named: a write
// through an alias of process.env held elsewhere — the allowlist and the home's own refusals are the
// run-time guard there.
const ASSIGN = new Set([
  ts.SyntaxKind.EqualsToken,
  ts.SyntaxKind.QuestionQuestionEqualsToken,
  ts.SyntaxKind.BarBarEqualsToken,
  ts.SyntaxKind.AmpersandAmpersandEqualsToken,
]);
const ENV_WRITERS = /^(?:Object\.(?:assign|defineProperty|defineProperties)|Reflect\.(?:set|deleteProperty|defineProperty))$/;

function isProcessEnv(e: ts.Expression, sf: ts.SourceFile): boolean {
  const x = unwrap(e);
  return (
    (ts.isPropertyAccessExpression(x) && x.name.text === "env" && unwrap(x.expression).getText(sf) === "process") ||
    (ts.isElementAccessExpression(x) && ts.isStringLiteralLike(x.argumentExpression) && x.argumentExpression.text === "env" && unwrap(x.expression).getText(sf) === "process")
  );
}

function analyzeEnvWrites(rel: string, text: string): string[] {
  const sf = ts.createSourceFile(rel, text, ts.ScriptTarget.Latest, true, rel.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const problems: string[] = [];
  const at = (n: ts.Node): string => `${rel}:${lineOf(sf, n)}`;
  const member = (e: ts.Expression): boolean => {
    const x = unwrap(e);
    return (ts.isPropertyAccessExpression(x) || ts.isElementAccessExpression(x)) && isProcessEnv(x.expression, sf);
  };
  everyNode(sf, (n) => {
    if (ts.isBinaryExpression(n) && ASSIGN.has(n.operatorToken.kind)) {
      if (member(n.left)) problems.push(`${at(n)} a write to process.env (\`${n.getText(sf).slice(0, 60)}\`)`);
      else if (isProcessEnv(n.left, sf)) problems.push(`${at(n)} process.env replaced`);
    } else if (ts.isDeleteExpression(n) && member(n.expression)) {
      problems.push(`${at(n)} a delete from process.env (\`${n.getText(sf).slice(0, 60)}\`)`);
    } else if (ts.isCallExpression(n) && ENV_WRITERS.test(unwrap(n.expression).getText(sf)) && n.arguments[0] && isProcessEnv(n.arguments[0], sf)) {
      problems.push(`${at(n)} \`${unwrap(n.expression).getText(sf)}\` on process.env`);
    }
  });
  return problems;
}

// ── the company's runtime, read ──────────────────────────────────────────────────────────────────

const SOURCES = runtimeSources().map((file) => ({ rel: relative(REPO, file), text: readFileSync(file, "utf8") }));
/** The eight company lanes on 2026-10-03. A ninth call site fails here until it is added on purpose. */
const LANES = ["chat", "classify", "council", "decompose", "qa", "task", "voice", "workflow"];
/** Every runtime file bound and read once — every file, not the ones whose text names the SDK. */
const SDK_REPORTS = SOURCES.map((s) => analyzeSdk(s.rel, s.text));
const LAUNCH_REPORTS = SOURCES.map((s) => analyzeLaunches(s.rel, s.text));
const ENV_WRITE_PROBLEMS = SOURCES.flatMap((s) => analyzeEnvWrites(s.rel, s.text));

describe("company isolation — the ruler over every company model call (CEO 2026-10-03)", () => {
  const sites = SDK_REPORTS.flatMap((r) => r.sites);

  it("reads every SDK import and every use of query() it finds — nothing it cannot follow", () => {
    expect(SDK_REPORTS.flatMap((r) => r.problems)).toEqual([]);
  });

  it("finds exactly the eight company lanes, each once", () => {
    expect(sites.map((s) => s.lane).sort()).toEqual(LANES);
  });

  it("every query() spreads companyIsolation() once, sets nothing off the list, and feeds its receipt first", () => {
    expect(sites.filter((s) => s.problems.length > 0).map((s) => `${s.where}: ${s.problems.join("; ")}`)).toEqual([]);
  });

  it("no runtime code writes process.env — what the allowlist carries cannot be moved before a call (phase 3, A2)", () => {
    expect(ENV_WRITE_PROBLEMS).toEqual([]);
  });

  it("no runtime code launches `claude`, and every launch in a file that names claude or codex is readable", () => {
    expect(LAUNCH_REPORTS.flatMap((r) => r.problems)).toEqual([]);
  });

  it("@dxb/kernel hands out the helper of sdk-isolation.ts and nothing else under its names", () => {
    const index = ts.createSourceFile("index.ts", readFileSync(join(REPO, "packages", "kernel", "src", "index.ts"), "utf8"), ts.ScriptTarget.Latest, true);
    const from = new Map<string, string>();
    for (const st of index.statements) {
      if (!ts.isExportDeclaration(st) || st.isTypeOnly || !st.exportClause || !ts.isNamedExports(st.exportClause)) continue;
      const spec = st.moduleSpecifier && ts.isStringLiteral(st.moduleSpecifier) ? st.moduleSpecifier.text : "(local)";
      for (const el of st.exportClause.elements) from.set(el.name.text, spec);
    }
    expect([from.get("companyIsolation"), from.get("isolationReceipt")]).toEqual(["./sdk-isolation.js", "./sdk-isolation.js"]);
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
/** A lane that takes the compiled profile, with `write` deciding what the profile is. */
const profileLane = (write: string): string =>
  `import { query as ask } from "@anthropic-ai/claude-agent-sdk";\nimport { buildSdkToolOptions } from "@dxb/gateway";\n${HEAD}` +
  `let toolOpts: any = null;\n${write}\n` +
  lane(`${ISO}, ...(toolOpts ? { mcpServers: toolOpts.mcpServers, allowedTools: toolOpts.allowedTools, strictMcpConfig: toolOpts.strictMcpConfig } : {})`);

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
    ["cwd (phase 3: the working folder is the helper's)", GOOD.replace(ISO, `${ISO}, cwd: "/home/dxb/DxB Global OS"`)],
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

  // Sol's single pass on phase 3 (A2): a write to process.env before the call passed with problems=[].
  const envWrites: Array<[string, string]> = [
    ["the home's own knob set before the call", `process.env.DXB_COMPANY_CLAUDE_HOME = "/home/dxb/.claude";\n${GOOD}`],
    ["XDG_CONFIG_HOME set before the call", `${GOOD}process.env.XDG_CONFIG_HOME = "/home/dxb/DxB Global OS/.claude";\n`],
    ["an element write", `process.env["GIT_CONFIG_GLOBAL"] ??= "/r/.claude/skills/x/SKILL.md";\n${GOOD}`],
    ["a delete", `delete process.env.HOME;\n${GOOD}`],
    ["Object.assign", `Object.assign(process.env, { GIT_CONFIG_GLOBAL: "/x" });\n${GOOD}`],
    ["Reflect.set", `Reflect.set(process.env, "XDG_CONFIG_HOME", "/x");\n${GOOD}`],
    ["process.env replaced", `process.env = { ...process.env, HOME: "/x" };\n${GOOD}`],
    ["a parenthesised write", `(process.env).DXB_DATABASE_URL = "postgres://construction";\n${GOOD}`],
  ];

  it.each(envWrites)("refuses a write to process.env: %s", (_name, text) => {
    expect(analyzeEnvWrites("x/src/probe.ts", text).length).toBeGreaterThan(0);
  });

  it("reads of process.env are not writes", () => {
    expect(analyzeEnvWrites("x/src/probe.ts", `const a = process.env.X ?? "d";\nconst b = { ...process.env };\nf(process.env);\n${GOOD}`)).toEqual([]);
  });

  it("reads the profile keys only from buildSdkToolOptions()", () => {
    const profile = profileLane;
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

// ── the ruler, tried on Sol's single pass (2026-10-03 14:16) ─────────────────────────────────────
// Sol ran the analysis functions themselves and read `sites=[]`, `problems=[]` — which the harness
// above would have hidden behind "no site found". So each form is held to the reason the ruler gives.

describe("the ruler refuses each of Sol's single-pass counter-examples for its own reason", () => {
  const said = (r: SdkReport): string => [...r.problems, ...r.sites.flatMap((s) => s.problems)].join("\n");

  it("a require() specifier assembled at run time, in a file that names no SDK — a module it cannot name", () => {
    const text = `const sdk = require("@anthropic-ai/" + "claude-agent-" + "sdk");\nexport const run = (prompt: string) => sdk.query({ prompt });\n`;
    expect(said(analyzeSdk("x/src/fresh.ts", text))).toMatch(/a module the ruler cannot name/);
  });

  it("an escaped SDK specifier — the site is found and held to the helper", () => {
    const text = GOOD.replace('"@anthropic-ai/claude-agent-sdk"', '"@anthropic-ai/claude-agent-\\u0073dk"').replace("...(companyIsolation() ?? {}), ", "");
    const r = analyzeSdk("x/src/probe.ts", text);
    expect(r.sites).toHaveLength(1);
    expect(said(r)).toMatch(/spread companyIsolation\(\) 0 times/);
  });

  it("the helper taken from another file named sdk-isolation — not the kernel's helper", () => {
    const text = GOOD.replace(HEAD, `import { companyIsolation, isolationReceipt } from "./fake/sdk-isolation.js";\n`);
    expect(said(analyzeSdk("x/src/probe.ts", text))).toMatch(/not the kernel's helper/);
  });

  it("Object.assign on the compiled profile — the profile handed on or changed", () => {
    const text = profileLane(
      "toolOpts = buildSdkToolOptions(s, i);\nObject.assign(toolOpts, { strictMcpConfig: false, mcpServers: { playwright: { command: \"npx\" } } });",
    );
    expect(said(analyzeSdk("x/src/probe.ts", text))).toMatch(/the profile `toolOpts` is handed on or changed/);
  });

  it("a receipt shadowed by a function hoisted inside the loop — not the receipt this function declares", () => {
    const text = GOOD.replace(`if (msg.type === "result") return msg;`, `if (msg.type === "result") return msg;\n    function seen(_m: unknown) {}`);
    expect(said(analyzeSdk("x/src/probe.ts", text))).toMatch(/not the receipt this function declares/);
  });

  it("element access on a child_process namespace — the launch of codex is seen, and refused outside the gate", () => {
    const r = analyzeLaunches("x/src/launch.ts", `import * as cp from "node:child_process";\ncp["execFile"]("codex", ["exec"]);\n`);
    expect(r.launches.map((l) => l.program)).toEqual(["codex"]);
    expect(r.problems.join("\n")).toMatch(/a launch of `codex` outside the critical gate/);
  });

  it("a shell line that reaches codex through env — refused for naming it", () => {
    const r = analyzeLaunches("x/src/launch.ts", `import { exec } from "node:child_process";\nexec("env CODEX_HOME=/home/dxb/.codex codex exec hi");\n`);
    expect(r.problems.join("\n")).toMatch(/a shell line that names claude or codex/);
  });

  // the classes those forms belong to, closed with them
  it.each([
    ["a computed key that folds to a launcher", `import * as cp from "node:child_process";\ncp["exec" + "File"]("codex", ["exec"]);\n`, /a launch of `codex` outside the critical gate/],
    ["a key the ruler cannot fold", `import * as cp from "node:child_process";\nconst k = process.argv[2];\ncp[k]("ls");\n`, /a child_process member the ruler cannot name/],
    ["a launcher held in a const", `import * as cp from "node:child_process";\nconst run = cp.execFile;\nrun("codex", ["exec"]);\n`, /a launch of `codex` outside the critical gate/],
    ["a program folded from pieces", `import { execFile } from "node:child_process";\nexecFile("co" + "dex", ["exec"]);\n`, /a launch of `codex` outside the critical gate/],
    ["codex named in a wrapper's arguments", `import { execFile } from "node:child_process";\nexecFile("env", ["CODEX_HOME=/x", "codex", "exec"]);\n`, /a launch through `env` that names claude or codex/],
    ["a shell line through sh -c", `import { spawn } from "node:child_process";\nspawn("sh", ["-c", "claude -p hi"]);\n`, /a launch through `sh` that names claude or codex/],
    ["spawn with shell: true", `import { spawn } from "node:child_process";\nspawn("nohup", ["codex", "exec"], { shell: true });\n`, /a shell line that names claude or codex/],
    ["the namespace exported under another name", `import * as cp from "node:child_process";\nexport const deps = cp;\n`, /namespace `cp` handed on/],
    ["a launcher exported through a const", `import { execFile } from "node:child_process";\nexport const run = execFile;\n`, /`execFile` handed on/],
  ])("closes the class — %s", (_name, text, why) => {
    expect(analyzeLaunches("x/src/launch.ts", text).problems.join("\n")).toMatch(why);
  });

  it("a companyCodexHome that shadows the gate's own — not the function the file declares", () => {
    const head = `import { execFile } from "node:child_process";\nexport function companyCodexHome() { return "/c"; }\n`;
    const launchLine = `execFile("codex", ["exec"], { env: { ...process.env, CODEX_HOME: companyCodexHome() } }, () => {});`;
    expect(analyzeLaunches(GATE, `${head}${launchLine}\n`).problems).toEqual([]);
    const shadowed = `${head}export function run() {\n  const companyCodexHome = () => "/home/dxb/.codex";\n  ${launchLine}\n}\n`;
    expect(analyzeLaunches(GATE, shadowed).problems.join("\n")).toMatch(/not the function this file declares at its top level/);
  });

  it("an SDK import the ruler resolves, not spells — a package that resolves into the SDK's folder is the SDK", () => {
    const box = mkdtempSync(join(tmpdir(), "sdk-alias-"));
    try {
      mkdirSync(join(box, "node_modules"));
      mkdirSync(join(box, "src"));
      writeFileSync(join(box, "package.json"), '{ "type": "module" }\n');
      // what an npm alias ("my-sdk": "npm:@anthropic-ai/claude-agent-sdk") leaves in node_modules
      symlinkSync(realpathSync(join(REPO, "packages", "kernel", "node_modules", "@anthropic-ai", "claude-agent-sdk")), join(box, "node_modules", "my-sdk"));
      expect(isSdkModule("my-sdk", join(box, "src", "probe.ts"))).toBe(true);
      expect(isSdkModule("@dxb/kernel", "packages/orchestrator/src/chat-drain.ts")).toBe(false);
      expect(isSdkModule("zod", "packages/orchestrator/src/chat-drain.ts")).toBe(false);
    } finally {
      rmSync(box, { recursive: true, force: true });
    }
  });
});

// ── the helper and its receipt ───────────────────────────────────────────────────────────────────

describe("companyIsolation() and its receipt", () => {
  const helper = () => import("../../packages/kernel/src/sdk-isolation.js");

  it("shuts out filesystem settings (hooks, plugins, MCP, CLAUDE.md), the auto-memory, the transcript and the account's connectors — and runs in the company's own Claude home and working folder (phase 3)", async () => {
    const { companyIsolation } = await helper();
    // Sol's single pass on phase 3 (A2): a denylist of CLAUDE* let every other path-moving variable
    // through — GIT_CONFIG_GLOBAL=<repo>/.claude/skills/…/SKILL.md reached the file. The env is an
    // allowlist now; everything not on it — HOME, XDG_CONFIG_HOME, GIT_*, NODE_OPTIONS, ANTHROPIC_* —
    // stays behind.
    const parent = {
      DXB_REPO_ROOT: "/r",
      DXB_DATABASE_URL: "postgres://company",
      DXB_LITELLM_KEY_FINANCE: "sk-dept",
      PATH: "/usr/bin",
      LANG: "C.UTF-8",
      LC_ALL: "C.UTF-8",
      HTTPS_PROXY: "http://proxy:3128",
      SSL_CERT_FILE: "/etc/ssl/cert.pem",
      LITELLM_BASE_URL: "http://127.0.0.1:4000",
      LITELLM_MASTER_KEY: "sk-admin",
      DXB_COMPANY_CLAUDE_HOME: "/co",
      CLAUDECODE: "1",
      CLAUDE_CODE_ENTRYPOINT: "cli",
      CLAUDE_CONFIG_DIR: "/home/x/.claude",
      HOME: "/home/x",
      XDG_CONFIG_HOME: "/home/x/.config",
      GIT_CONFIG_GLOBAL: "/r/.claude/skills/dxb-team2/SKILL.md",
      GIT_DIR: "/r/.git",
      ANTHROPIC_CONFIG_DIR: "/home/x/.config/anthropic",
      ANTHROPIC_API_KEY: "sk-ant-raw",
      NODE_OPTIONS: "--require /r/x.js",
      PWD: "/r",
    } as NodeJS.ProcessEnv;
    expect(companyIsolation(parent)).toEqual({
      settingSources: [],
      settings: { autoMemoryEnabled: false },
      persistSession: false,
      strictMcpConfig: true,
      cwd: "/co/work",
      env: {
        DXB_REPO_ROOT: "/r",
        DXB_DATABASE_URL: "postgres://company",
        DXB_LITELLM_KEY_FINANCE: "sk-dept",
        PATH: "/usr/bin",
        LANG: "C.UTF-8",
        LC_ALL: "C.UTF-8",
        HTTPS_PROXY: "http://proxy:3128",
        SSL_CERT_FILE: "/etc/ssl/cert.pem",
        LITELLM_BASE_URL: "http://127.0.0.1:4000",
        CLAUDE_CONFIG_DIR: "/co",
        HOME: "/co",
        XDG_CACHE_HOME: "/co/cache",
        PWD: "/co/work",
      },
    });
  });

  it("phase 3: the company Claude home defaults to ~/.local/share/dxb/company-claude", async () => {
    const { companyClaudeHome } = await helper();
    expect(companyClaudeHome({} as NodeJS.ProcessEnv)).toBe(join(userInfo().homedir, ".local", "share", "dxb", "company-claude"));
  });

  it("phase 3: never the construction's ~/.claude — not it, not inside it, not a link to it", async () => {
    const { companyClaudeHome, companyIsolation } = await helper();
    const theirs = join(userInfo().homedir, ".claude");
    const box = mkdtempSync(join(tmpdir(), "company-claude-home-"));
    const link = join(box, "looks-like-ours");
    symlinkSync(theirs, link);
    for (const home of [theirs, join(theirs, "company"), link, join(link, "deeper")]) {
      expect(() => companyClaudeHome({ DXB_COMPANY_CLAUDE_HOME: home } as NodeJS.ProcessEnv), home).toThrow(/construction's Claude home/);
      expect(() => companyIsolation({ DXB_COMPANY_CLAUDE_HOME: home } as NodeJS.ProcessEnv), home).toThrow(/construction's Claude home/);
    }
    expect(companyClaudeHome({ DXB_COMPANY_CLAUDE_HOME: join(box, "ours") } as NodeJS.ProcessEnv)).toBe(join(box, "ours"));
    rmSync(box, { recursive: true, force: true });
  });

  // Sol's single pass on phase 3, A4: the construction's identity followed $HOME — with HOME moved, the
  // real ~/.claude passed. It comes from the passwd entry (os.userInfo()) now.
  it("A4: the construction's ~/.claude is the passwd home's, whatever $HOME says", async () => {
    const { companyClaudeHome } = await helper();
    const box = mkdtempSync(join(tmpdir(), "company-claude-a4-"));
    const realHome = process.env.HOME;
    process.env.HOME = box;
    try {
      const theirs = join(userInfo().homedir, ".claude");
      expect(() => companyClaudeHome({ DXB_COMPANY_CLAUDE_HOME: theirs } as NodeJS.ProcessEnv)).toThrow(/construction's Claude home/);
      expect(() => companyClaudeHome({ DXB_COMPANY_CLAUDE_HOME: join(theirs, "company") } as NodeJS.ProcessEnv)).toThrow(/construction's Claude home/);
      // a box that merely holds a .claude is not the construction
      mkdirSync(join(box, ".claude"));
      expect(companyClaudeHome({ DXB_COMPANY_CLAUDE_HOME: join(box, ".claude") } as NodeJS.ProcessEnv)).toBe(realpathSync(join(box, ".claude")));
    } finally {
      process.env.HOME = realHome;
      rmSync(box, { recursive: true, force: true });
    }
  });

  // Sol's single pass on phase 3, A1: the check took the repository, its .claude/, a relative value and
  // an empty one; it returned the raw value (a relative one resolves elsewhere in the child); and it
  // never looked at the parts the CLI uses — work/, cache/, .claude.json, .credentials.json.
  it("A1: an empty or relative home, the repository, its .claude/, ~ itself and / are refused", async () => {
    const { companyClaudeHome, companyIsolation } = await helper();
    const refused: Array<[string, RegExp]> = [
      ["", /absolute path/],
      ["company-claude", /absolute path/],
      ["./company-claude", /absolute path/],
      [REPO, /the repository/],
      [join(REPO, ".claude"), /the repository/],
      [join(REPO, "var", "company-claude"), /the repository/],
      [userInfo().homedir, /construction's Claude home/],
      ["/", /construction's Claude home|the repository/],
    ];
    for (const [home, why] of refused) {
      expect(() => companyClaudeHome({ DXB_COMPANY_CLAUDE_HOME: home } as NodeJS.ProcessEnv), home).toThrow(why);
      expect(() => companyIsolation({ DXB_COMPANY_CLAUDE_HOME: home } as NodeJS.ProcessEnv), home).toThrow(why);
    }
  });

  it("A1: the home is returned canonical — a link to a folder of the company's own answers with the folder", async () => {
    const { companyClaudeHome, companyIsolation } = await helper();
    const box = realpathSync(mkdtempSync(join(tmpdir(), "company-claude-canon-")));
    mkdirSync(join(box, "real"));
    symlinkSync(join(box, "real"), join(box, "link"));
    expect(companyClaudeHome({ DXB_COMPANY_CLAUDE_HOME: join(box, "link") } as NodeJS.ProcessEnv)).toBe(join(box, "real"));
    const iso = companyIsolation({ DXB_COMPANY_CLAUDE_HOME: join(box, "link") } as NodeJS.ProcessEnv)!;
    expect([iso.cwd, iso.env.CLAUDE_CONFIG_DIR, iso.env.HOME, iso.env.PWD]).toEqual([join(box, "real", "work"), join(box, "real"), join(box, "real"), join(box, "real", "work")]);
    rmSync(box, { recursive: true, force: true });
  });

  it("A1: a home whose work/, cache/, .claude.json or .credentials.json leads out through a link is refused", async () => {
    const { companyClaudeHome } = await helper();
    const box = realpathSync(mkdtempSync(join(tmpdir(), "company-claude-parts-")));
    const out = join(box, "elsewhere");
    mkdirSync(out);
    const cases: Array<[string, string]> = [
      ["work", REPO],
      ["cache", join(userInfo().homedir, ".cache")],
      [".claude.json", join(userInfo().homedir, ".claude.json")],
      [".credentials.json", join(userInfo().homedir, ".claude", ".credentials.json")],
      ["work", out],
    ];
    try {
      for (const [part, target] of cases) {
        const home = mkdtempSync(join(box, "home-"));
        symlinkSync(target, join(home, part));
        expect(() => companyClaudeHome({ DXB_COMPANY_CLAUDE_HOME: home } as NodeJS.ProcessEnv), `${part} -> ${target}`).toThrow(new RegExp(`${part.replace(".", "\\.")} leads outside`));
      }
      // a part that is a link inside the home is the home's own
      const home = mkdtempSync(join(box, "home-"));
      mkdirSync(join(home, "work-real"));
      symlinkSync(join(home, "work-real"), join(home, "work"));
      expect(companyClaudeHome({ DXB_COMPANY_CLAUDE_HOME: home } as NodeJS.ProcessEnv)).toBe(home);
    } finally {
      rmSync(box, { recursive: true, force: true });
    }
  });

  it("A2: what the parent's process.env holds before a call never moves the call — off-list variables stay behind, a construction home fails closed", async () => {
    const { companyIsolation } = await helper();
    const keys = ["XDG_CONFIG_HOME", "GIT_CONFIG_GLOBAL", "ANTHROPIC_CONFIG_DIR", "GIT_DIR", "NODE_OPTIONS", "ANTHROPIC_API_KEY", "DXB_COMPANY_CLAUDE_HOME"] as const;
    const saved = Object.fromEntries(keys.map((k) => [k, process.env[k]]));
    try {
      process.env.XDG_CONFIG_HOME = join(REPO, ".claude");
      process.env.GIT_CONFIG_GLOBAL = join(REPO, ".claude", "skills", "dxb-team2", "SKILL.md");
      process.env.ANTHROPIC_CONFIG_DIR = join(userInfo().homedir, ".config", "anthropic");
      process.env.GIT_DIR = join(REPO, ".git");
      process.env.NODE_OPTIONS = `--require ${join(REPO, "x.js")}`;
      process.env.ANTHROPIC_API_KEY = "sk-ant-raw";
      delete process.env.DXB_COMPANY_CLAUDE_HOME;
      const env = companyIsolation()!.env;
      for (const k of keys) expect(env[k], k).toBeUndefined();
      expect(env.HOME).toBe(env.CLAUDE_CONFIG_DIR);
      for (const home of [join(userInfo().homedir, ".claude"), REPO, join(REPO, ".claude")]) {
        process.env.DXB_COMPANY_CLAUDE_HOME = home;
        expect(() => companyIsolation(), home).toThrow(/construction's Claude home|the repository/);
      }
    } finally {
      for (const k of keys) {
        if (saved[k] === undefined) delete process.env[k];
        else process.env[k] = saved[k];
      }
    }
  });

  it("phase 3: the scheduler's start-up line says whether the company home holds a login — never a secret, never a throw", async () => {
    const { companyClaudeLoginLine } = await helper();
    const box = mkdtempSync(join(tmpdir(), "company-claude-login-"));
    expect(companyClaudeLoginLine({ DXB_COMPANY_CLAUDE_HOME: box } as NodeJS.ProcessEnv)).toBe(`[isolation] company-claude home=${box} credentials=absent`);
    writeFileSync(join(box, ".credentials.json"), '{"claudeAiOauth":{"accessToken":"SECRET-NEVER-PRINTED"}}');
    const line = companyClaudeLoginLine({ DXB_COMPANY_CLAUDE_HOME: box } as NodeJS.ProcessEnv);
    expect(line).toBe(`[isolation] company-claude home=${box} credentials=present`);
    expect(line).not.toMatch(/SECRET/);
    expect(companyClaudeLoginLine({ DXB_COMPANY_CLAUDE_HOME: join(userInfo().homedir, ".claude") } as NodeJS.ProcessEnv)).toBe("[isolation] company-claude home=refused credentials=absent");
    rmSync(box, { recursive: true, force: true });
    const main = readFileSync(join(REPO, "packages", "outbox-executor", "src", "main.ts"), "utf8");
    expect(main).toMatch(/console\.log\(companyClaudeLoginLine\(\)\)/);
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
    expect(lines).toEqual([`[isolation] lane=chat session=5f0c tools=0 mcp=0 plugins=0 skills=2 agents=1 hooks=0 input=476 home=${join(userInfo().homedir, ".local", "share", "dxb", "company-claude")}`]);
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
    expect(lines).toEqual([`[isolation] lane=voice session=9a1e tools=2 mcp=2 plugins=1 skills=1 agents=2 hooks=1 input=44306 home=${join(userInfo().homedir, ".local", "share", "dxb", "company-claude")}`]);
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
    expect(lines).toEqual([`[isolation] lane=qa session=? tools=? mcp=? plugins=? skills=? agents=? hooks=0 input=9 home=${join(userInfo().homedir, ".local", "share", "dxb", "company-claude")}`]);
  });
});

// ── Phase 2 — the critical gate's Codex (CEO 2026-10-03, option (b): the company's own login) ────
// Measured that day: run from ~/.codex, the gate's challengers loaded the construction's global Codex
// notes (AGENTS.md) and started its MCP servers; `--ignore-user-config`, `--ignore-rules` and
// `-c project_doc_max_bytes=0` left the notes in; a clean CODEX_HOME holding only a login dropped
// both. Only the gate launches codex, and the last word of its env is the company's own home.

/** `env: { …, CODEX_HOME: companyCodexHome() }` — the company home is the LAST word, so nothing after it overrides it. */
function namesCompanyHome(env: ts.Expression | null): boolean {
  if (!env || !ts.isObjectLiteralExpression(env)) return false;
  const last = env.properties[env.properties.length - 1];
  if (!last || !ts.isPropertyAssignment(last) || nameText(last.name) !== "CODEX_HOME") return false;
  const v = unwrap(last.initializer);
  return ts.isCallExpression(v) && ts.isIdentifier(v.expression) && v.expression.text === "companyCodexHome" && v.arguments.length === 0;
}

describe("company isolation — the critical gate's Codex runs from the company's own home", () => {
  const codex = LAUNCH_REPORTS.flatMap((r) => r.launches).filter((l) => l.program === "codex");

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
    // Sol's single pass: the env that counts is the LAST one the options literal leaves behind
    ["an env spread in after a valid env (Sol, single pass)", ", env: { ...process.env, CODEX_HOME: companyCodexHome() }, ...{ env: process.env }"],
    ["a spread after env the ruler cannot see into", ", env: { ...process.env, CODEX_HOME: companyCodexHome() }, ...extra"],
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
      expect(companyCodexHome({} as NodeJS.ProcessEnv)).toBe(join(userInfo().homedir, ".local", "share", "dxb", "company-codex"));
    } finally {
      rmSync(box, { recursive: true, force: true });
    }
  });

  // ── Sol's single pass (2026-10-03 14:16): the override and the missing journal line ────────────

  /** A stand-in `codex`: a session header and a `tokens used` footer on stderr like the real CLI, the
   *  home it was handed in its answer, a marker file when STANDIN_MARK is set, its arguments one per
   *  line into STANDIN_ARGS, a failure on STANDIN_FAIL, a death before the footer on STANDIN_NOFOOT. */
  const STANDIN = [
    "#!/usr/bin/env bash",
    '[ -n "${STANDIN_ARGS:-}" ] && printf \'%s\\n\' "$@" > "$STANDIN_ARGS"',
    'out=""; while [ $# -gt 0 ]; do [ "$1" = "-o" ] && out="$2"; shift; done',
    '[ -n "${STANDIN_MARK:-}" ] && : > "$STANDIN_MARK"',
    "printf 'OpenAI Codex v0.0.0 (stand-in)\\n--------\\nworkdir: /tmp\\nmodel: stand-in\\nsession id: 0199a2b3-stand-in\\n--------\\n' >&2",
    'if [ -n "${STANDIN_NOFOOT:-}" ]; then echo "ERROR: the stand-in died before its footer" >&2; exit 4; fi',
    'if [ -n "${STANDIN_FAIL:-}" ]; then echo "ERROR: the stand-in failed" >&2; printf \'tokens used\\n7\\n\' >&2; exit 3; fi',
    'printf \'{"codex_home":"%s"}\' "$CODEX_HOME" > "$out"',
    "printf 'tokens used\\n12,345\\n' >&2",
    "",
  ].join("\n");

  /** Runs `body` with the stand-in first on PATH and these variables set; everything restored after. */
  async function withStandIn(vars: Record<string, string>, body: (box: string) => Promise<void>): Promise<void> {
    const box = mkdtempSync(join(tmpdir(), "company-codex-"));
    const keys = ["PATH", "DXB_COMPANY_CODEX_HOME", "STANDIN_MARK", "STANDIN_FAIL", ...Object.keys(vars)];
    const saved = Object.fromEntries(keys.map((k) => [k, process.env[k]]));
    try {
      mkdirSync(join(box, "bin"));
      writeFileSync(join(box, "bin", "codex"), STANDIN);
      chmodSync(join(box, "bin", "codex"), 0o755);
      process.env.PATH = `${join(box, "bin")}:${process.env.PATH}`;
      for (const [k, v] of Object.entries(vars)) process.env[k] = v.replaceAll("<box>", box);
      await body(box);
    } finally {
      for (const [k, v] of Object.entries(saved)) {
        if (v === undefined) delete process.env[k];
        else process.env[k] = v;
      }
      rmSync(box, { recursive: true, force: true });
    }
  }

  it("refuses a company home that is the construction's ~/.codex, a path inside it, or a link to it", async () => {
    const { companyCodexHome } = await import("../../packages/orchestrator/src/critical-gate.js");
    const construction = join(userInfo().homedir, ".codex");
    const box = mkdtempSync(join(tmpdir(), "company-codex-home-"));
    try {
      symlinkSync(construction, join(box, "link"));
      for (const home of [construction, join(construction, "nested"), join(box, "link"), join(box, "link", "nested")]) {
        expect(() => companyCodexHome({ DXB_COMPANY_CODEX_HOME: home } as NodeJS.ProcessEnv), home).toThrow(/the construction's Codex home/);
      }
      expect(companyCodexHome({ DXB_COMPANY_CODEX_HOME: join(box, "own") } as NodeJS.ProcessEnv)).toBe(join(box, "own"));
    } finally {
      rmSync(box, { recursive: true, force: true });
    }
  });

  it("A4: the construction's ~/.codex is the passwd home's, whatever $HOME says", async () => {
    const { companyCodexHome } = await import("../../packages/orchestrator/src/critical-gate.js");
    const box = mkdtempSync(join(tmpdir(), "company-codex-a4-"));
    const realHome = process.env.HOME;
    process.env.HOME = box;
    try {
      const construction = join(userInfo().homedir, ".codex");
      expect(() => companyCodexHome({ DXB_COMPANY_CODEX_HOME: construction } as NodeJS.ProcessEnv)).toThrow(/the construction's Codex home/);
      expect(() => companyCodexHome({ DXB_COMPANY_CODEX_HOME: join(construction, "nested") } as NodeJS.ProcessEnv)).toThrow(/the construction's Codex home/);
    } finally {
      process.env.HOME = realHome;
      rmSync(box, { recursive: true, force: true });
    }
  });

  it("the real runner under a refused home never launches codex — ok:false, the reason named", async () => {
    await withStandIn({ DXB_COMPANY_CODEX_HOME: join(userInfo().homedir, ".codex"), STANDIN_MARK: "<box>/launched" }, async (box) => {
      const { codexRunner } = await import("../../packages/orchestrator/src/critical-gate.js");
      const res = await codexRunner({ model: "stand-in", prompt: "p", timeoutMs: 10_000 });
      expect(res.ok).toBe(false);
      expect(res.error).toMatch(/the construction's Codex home/);
      expect(existsSync(join(box, "launched"))).toBe(false);
    });
  });

  it("writes one isolation line per Codex call — what it loaded and what it read — on success and on failure", async () => {
    await withStandIn({ DXB_COMPANY_CODEX_HOME: "<box>/company-codex" }, async (box) => {
      const home = join(box, "company-codex");
      mkdirSync(home);
      // a home that holds notes and two servers must SAY so — the line reports what is there
      writeFileSync(join(home, "AGENTS.md"), "notes\n");
      writeFileSync(join(home, "config.toml"), '[mcp_servers.alpha]\ncommand = "a"\n[mcp_servers.beta]\ncommand = "b"\n[mcp_servers.beta.env]\nX = "1"\n');
      const { codexRunner } = await import("../../packages/orchestrator/src/critical-gate.js");
      const lines: string[] = [];
      const spy = vi.spyOn(console, "log").mockImplementation((...a: unknown[]) => {
        lines.push(a.map(String).join(" "));
      });
      try {
        const ok = await codexRunner({ model: "stand-in", prompt: "p", timeoutMs: 10_000 });
        process.env.STANDIN_FAIL = "1";
        const failed = await codexRunner({ model: "stand-in", prompt: "p", timeoutMs: 10_000 });
        expect([ok.ok, failed.ok]).toEqual([true, false]);
      } finally {
        spy.mockRestore();
      }
      expect(lines.filter((l) => l.startsWith("[isolation]"))).toEqual([
        `[isolation] lane=gate model=stand-in session=0199a2b3-stand-in home=${home} notes=1 mcp=2 ok=true tokens=12345`,
        `[isolation] lane=gate model=stand-in session=0199a2b3-stand-in home=${home} notes=1 mcp=2 ok=false tokens=7`,
      ]);
    });
  });

  it("writes tokens=? when the CLI left no tokens-used footer — an unknown is never written as 0", async () => {
    await withStandIn({ DXB_COMPANY_CODEX_HOME: "<box>/company-codex", STANDIN_NOFOOT: "1" }, async (box) => {
      const home = join(box, "company-codex");
      const { codexRunner } = await import("../../packages/orchestrator/src/critical-gate.js");
      const lines: string[] = [];
      const spy = vi.spyOn(console, "log").mockImplementation((...a: unknown[]) => {
        lines.push(a.map(String).join(" "));
      });
      try {
        expect((await codexRunner({ model: "stand-in", prompt: "p", timeoutMs: 10_000 })).ok).toBe(false);
      } finally {
        spy.mockRestore();
      }
      expect(lines.filter((l) => l.startsWith("[isolation]"))).toEqual([
        `[isolation] lane=gate model=stand-in session=0199a2b3-stand-in home=${home} notes=0 mcp=0 ok=false tokens=?`,
      ]);
    });
  });

  // The company home has no config.toml, so nothing there sets an effort: from it both challengers
  // ran at `reasoning effort: none`, where from ~/.codex (model_reasoning_effort = "high") they had
  // run at high (first fork, B3, 2026-10-03). The isolation must not change how hard they think.
  it("pins the challengers' reasoning effort to high — the level they ran at before the company home", async () => {
    await withStandIn({ DXB_COMPANY_CODEX_HOME: "<box>/company-codex", STANDIN_ARGS: "<box>/args" }, async (box) => {
      const { codexRunner } = await import("../../packages/orchestrator/src/critical-gate.js");
      expect((await codexRunner({ model: "stand-in", prompt: "p", timeoutMs: 10_000 })).ok).toBe(true);
      const args = readFileSync(join(box, "args"), "utf8").split("\n");
      const at = args.indexOf('model_reasoning_effort="high"');
      expect(at, args.join(" ")).toBeGreaterThan(0);
      expect(args[at - 1]).toBe("-c");
      expect(args.filter((a) => a.includes("model_reasoning_effort"))).toHaveLength(1);
    });
  });

  it("the isolation line never touches the call: a sink that throws leaves the answer as it was", async () => {
    await withStandIn({ DXB_COMPANY_CODEX_HOME: "<box>/company-codex" }, async (box) => {
      const { codexRunnerWith } = await import("../../packages/orchestrator/src/critical-gate.js");
      const run = codexRunnerWith(() => {
        throw new Error("journal sink failed");
      });
      const res = await run({ model: "stand-in", prompt: "p", timeoutMs: 10_000 });
      expect(res).toEqual({ ok: true, raw: JSON.stringify({ codex_home: join(box, "company-codex") }) });
    });
  });
});

// ── phase 3: the company's memory never reads the construction's claude-mem ─────────────────────
// The CEO, 2026-10-03 ("ikisine de evet", ledger isolation-phase3-plan-and-memory-path-2026-10-03).
// Measured before: recallMemory routes only KIND_STORE's four stores, and readObservationByRef /
// syncClaudeMem had no runtime caller — the path was unused. The cut makes it impossible: the adapter
// refuses the construction's ~/.claude-mem before opening anything, and recall holds no reader for it.
describe("phase 3 — the company's memory never reads the construction's claude-mem", () => {
  const adapter = () => import("../../packages/memory-router/src/adapters/claude-mem.js");
  const fixture = async (dbPath: string) => {
    mkdirSync(dirname(dbPath), { recursive: true });
    const { DatabaseSync } = await import("node:sqlite");
    const db = new DatabaseSync(dbPath);
    db.exec("CREATE TABLE observations (id INTEGER PRIMARY KEY, project TEXT, title TEXT, subtitle TEXT, narrative TEXT, facts TEXT, text TEXT, type TEXT, created_at_epoch INTEGER)");
    db.prepare("INSERT INTO observations VALUES (?,?,?,?,?,?,?,?,?)").run(77, "DxB Global OS", "a construction session", null, "what an engineer did", null, null, "change", 1);
    db.close();
  };

  // The construction's ~/.claude-mem is the passwd home's (Sol's single pass on phase 3, A4: it followed
  // $HOME, so a moved HOME let the real database through). The refusal comes before any open, so these
  // name the real place without touching it: the file names below do not exist, and a refused path is
  // never opened — an unrefused one would fail with sqlite's own "unable to open", not this error.
  it("refuses the construction's claude-mem — by default, by DXB_CLAUDE_MEM_DB and through a link — before opening it", async () => {
    const { readObservationByRef, syncClaudeMem } = await adapter();
    const box = mkdtempSync(join(tmpdir(), "company-claude-mem-"));
    const realDb = process.env.DXB_CLAUDE_MEM_DB;
    const theirs = join(userInfo().homedir, ".claude-mem");
    try {
      symlinkSync(theirs, join(box, "a-link"));
      delete process.env.DXB_CLAUDE_MEM_DB;
      expect(() => readObservationByRef("77")).toThrow(/construction's claude-mem/);
      expect(() => readObservationByRef("77", join(theirs, "no-such-probe.db"))).toThrow(/construction's claude-mem/);
      expect(() => readObservationByRef("77", join(box, "a-link", "no-such-probe.db"))).toThrow(/construction's claude-mem/);
      process.env.DXB_CLAUDE_MEM_DB = join(theirs, "no-such-probe.db");
      expect(() => readObservationByRef("77")).toThrow(/construction's claude-mem/);
      await expect(syncClaudeMem({} as never)).rejects.toThrow(/construction's claude-mem/);
      // a database of the company's own (the suites' fixtures) still reads
      const ours = join(box, "company", "claude-mem.db");
      await fixture(ours);
      expect(readObservationByRef("77", ours)).toMatch(/what an engineer did/);
    } finally {
      if (realDb === undefined) delete process.env.DXB_CLAUDE_MEM_DB;
      else process.env.DXB_CLAUDE_MEM_DB = realDb;
      rmSync(box, { recursive: true, force: true });
    }
  });

  it("A4: a moved $HOME does not move the bar — the real ~/.claude-mem is still refused, a box's own .claude-mem reads", async () => {
    const { readObservationByRef } = await adapter();
    const box = mkdtempSync(join(tmpdir(), "company-claude-mem-a4-"));
    const realHome = process.env.HOME;
    process.env.HOME = box;
    try {
      expect(() => readObservationByRef("77", join(userInfo().homedir, ".claude-mem", "no-such-probe.db"))).toThrow(/construction's claude-mem/);
      const boxes = join(box, ".claude-mem", "claude-mem.db");
      await fixture(boxes);
      expect(readObservationByRef("77", boxes)).toMatch(/what an engineer did/);
    } finally {
      process.env.HOME = realHome;
      rmSync(box, { recursive: true, force: true });
    }
  });

  it("recall holds no claude-mem reader", () => {
    const src = readFileSync(join(REPO, "packages", "memory-router", "src", "classify-read.ts"), "utf8");
    expect(src).not.toMatch(/readObservationByRef/);
    expect(src).not.toMatch(/"claude-mem":\s*makeRefReader/);
  });
});

// Fork 6 found it: with HOME set to the company Claude home (A2), the dxb-mcp child of a company call
// resolved the holding's own ffmpeg (~/.local/bin, the station user's) through $HOME and fell back to
// the system's. The station user's home comes from passwd.
describe("the holding's media binaries under a company HOME", () => {
  const own = join(userInfo().homedir, ".local", "bin", "ffmpeg");
  it.skipIf(!existsSync(own))("resolveMediaBinary finds ~/.local/bin/ffmpeg of the station user, not of $HOME", async () => {
    const { resolveMediaBinary } = await import("../../packages/shared/src/media-probe.js");
    const realHome = process.env.HOME;
    const override = process.env.DXB_FFMPEG;
    const box = mkdtempSync(join(tmpdir(), "company-home-"));
    try {
      process.env.HOME = box;
      delete process.env.DXB_FFMPEG;
      expect(resolveMediaBinary("ffmpeg")).toBe(own);
    } finally {
      process.env.HOME = realHome;
      if (override !== undefined) process.env.DXB_FFMPEG = override;
      rmSync(box, { recursive: true, force: true });
    }
  });
});
