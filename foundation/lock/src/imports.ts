// Which files a source reaches by a relative import (SPEC §4): that list decides
// what a lock protects beside the files it was pointed at. Pure — a text goes in.
import { posix } from "node:path";

// `import … from "x"`, `export … from "x"` and `import "x"`. Between the keyword
// and the specifier stands no quote and no semicolon: one statement at most.
const STATIC_IMPORT = /\b(?:import|export)\b(?:[^"'`;]*?\bfrom)?\s*(["'])([^"'`\n]+)\1/g;
// `import("x")`, `vi.mock("x")` and `vi.doMock("x")`: a literal first between the brackets — comments may stand before it.
const LOADED_BY_A_CALL = /\b(?:import|vi\s*\.\s*(?:mock|doMock))\s*\((?:\s|\/\*[\s\S]*?\*\/|\/\/[^\n]*\n)*(["'`])([^"'`$\n]+)\1/g;
// `new URL("x", import.meta.url)`: a file named by its place beside the source, and loaded by no import.
const NAMED_BY_A_URL = /\bnew\s+URL\s*\(\s*(["'`])([^"'`$\n]+)\1\s*,\s*import\s*\.\s*meta\s*\.\s*url\s*\)/g;
// `import.meta.glob`: the files it reaches are listed by the runner when it runs — by nobody before.
// Only a call counts — a type argument may stand before the bracket: the bare words, in a title or a message, reach nothing.
const GLOB = /\bimport\s*\.\s*meta\s*\.\s*glob\s*(?:<[^>()]*>\s*)?\(/;

const isRelative = (specifier: string): boolean => /^\.\.?(?:\/|$)/.test(specifier);
// To a URL every path that does not start at the root or with a scheme is relative, `./` before it or not.
const isRelativeToAUrl = (specifier: string): boolean => !/^(?:\/|[A-Za-z][A-Za-z0-9+.-]*:)/.test(specifier);

const specifiersOf = (source: string, spelling: RegExp): string[] => [...source.matchAll(spelling)].map((match) => match[2] ?? "");

/**
 * Pure. The relative specifiers of one source text (static import, export-from,
 * import("literal"), vi.mock("literal"), vi.doMock("literal")). The text is
 * searched, not parsed: an import spelled inside a comment or a string is found
 * too — a path too many is protected, never one too few. A bare specifier is
 * the code under test or the platform, and is not here.
 */
export function relativeImports(source: string): string[] {
  const specifiers = [...specifiersOf(source, STATIC_IMPORT), ...specifiersOf(source, LOADED_BY_A_CALL)];
  return [...new Set(specifiers.filter(isRelative))];
}

/** The paths a relative specifier may name, in the order the runner tries them (SPEC §10 item 4). */
const asTheRunnerResolves = (spelled: string): string[] => {
  const typed = spelled.replace(/\.(m?)js$/, ".$1ts");
  return [spelled, ...(typed === spelled ? [] : [typed]), `${spelled}.ts`, `${spelled}/index.ts`];
};

/** The tests' own directory: an import is followed while it stays under it. */
export const TESTS_DIRECTORY = "foundation/tests";

/** One relative import, as it is spelled and where. */
export type Spelled = { from: string; specifier: string };

export type Closure = {
  /** Every file reached, the starting files among them. */
  reached: string[];
  /** Every relative import that leaves `foundation/tests/`: a test reaches product code through its package. */
  leaving: Spelled[];
  /** Every relative import that resolves to no file of the tree: nothing of it is protected, and the reader must be told. */
  unresolved: Spelled[];
  /** Every file reached that spells `import.meta.glob`: what it reaches beyond this list cannot be known. */
  globbing: string[];
};

/**
 * Pure. The relative-import closure of `from`. `sourceOf` answers the text of a
 * path, or undefined for a path the tree does not hold. An import is resolved
 * as the runner resolves it; a file named by a URL is followed as it is spelled
 * and only to a file of the tree under `foundation/tests/` — one that is none
 * is no import, and is passed over.
 */
export function importClosure(from: readonly string[], sourceOf: (path: string) => string | undefined): Closure {
  const reached = new Set(from);
  const found: Omit<Closure, "reached"> = { leaving: [], unresolved: [], globbing: [] };
  const unread = from.map((file) => ({ file, source: sourceOf(file) ?? "" }));
  /** True when the tree holds `path`: it is reached, and read once. */
  const follow = (path: string): boolean => {
    const source = reached.has(path) ? undefined : sourceOf(path);
    if (source !== undefined) {
      reached.add(path);
      unread.push({ file: path, source });
    }
    return reached.has(path);
  };
  for (let next = unread.pop(); next !== undefined; next = unread.pop()) {
    const { file, source } = next;
    const spelledFrom = (specifier: string): string => posix.normalize(posix.join(posix.dirname(file), specifier)).replace(/\/$/, "");
    if (GLOB.test(source)) found.globbing.push(file);
    for (const specifier of relativeImports(source)) {
      const spelled = spelledFrom(specifier);
      if (!spelled.startsWith(`${TESTS_DIRECTORY}/`)) found.leaving.push({ from: file, specifier });
      else if (!asTheRunnerResolves(spelled).some(follow)) found.unresolved.push({ from: file, specifier });
    }
    for (const named of specifiersOf(source, NAMED_BY_A_URL).filter(isRelativeToAUrl).map(spelledFrom)) {
      if (named.startsWith(`${TESTS_DIRECTORY}/`)) follow(named);
    }
  }
  return { reached: [...reached], ...found };
}
