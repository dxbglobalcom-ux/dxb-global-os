// Which files a source reaches by a relative import (SPEC §4): that list decides
// what a lock protects beside the files it was pointed at. Pure — a text goes in.
import { posix } from "node:path";

// `import … from "x"`, `export … from "x"` and `import "x"`. Between the keyword
// and the specifier stands no quote and no semicolon: one statement at most.
const STATIC_IMPORT = /\b(?:import|export)\b(?:[^"'`;]*?\bfrom)?\s*(["'])([^"'`\n]+)\1/g;
// `import("x")`: a literal and nothing else between the brackets.
const DYNAMIC_IMPORT = /\bimport\s*\(\s*(["'`])([^"'`$\n]+)\1\s*\)/g;

const isRelative = (specifier: string): boolean => /^\.\.?(?:\/|$)/.test(specifier);

/**
 * Pure. The relative specifiers of one source text (static import, export-from,
 * import("literal")). The text is searched, not parsed: an import spelled inside
 * a comment or a string is found too — a path too many is protected, never one
 * too few. A bare specifier is the code under test or the platform, and is not here.
 */
export function relativeImports(source: string): string[] {
  const specifiers = [...source.matchAll(STATIC_IMPORT), ...source.matchAll(DYNAMIC_IMPORT)].map((match) => match[2] ?? "");
  return [...new Set(specifiers.filter(isRelative))];
}

/** The tests' own directory: an import is followed while it stays under it. */
export const TESTS_DIRECTORY = "foundation/tests";

export type Closure = {
  /** Every file reached, the starting files among them. */
  reached: string[];
  /** Every relative import that leaves `foundation/tests/`: a test reaches product code through its package. */
  leaving: { from: string; specifier: string }[];
};

/**
 * Pure. The relative-import closure of `from`. `sourceOf` answers the text of a
 * path, or undefined for a path the tree does not hold: such a target is not
 * followed — there is nothing of it to protect.
 */
export function importClosure(from: readonly string[], sourceOf: (path: string) => string | undefined): Closure {
  const reached = new Set(from);
  const leaving: Closure["leaving"] = [];
  const unread = from.map((file) => ({ file, source: sourceOf(file) ?? "" }));
  for (let next = unread.pop(); next !== undefined; next = unread.pop()) {
    for (const specifier of relativeImports(next.source)) {
      const target = posix.normalize(posix.join(posix.dirname(next.file), specifier));
      if (!target.startsWith(`${TESTS_DIRECTORY}/`)) {
        leaving.push({ from: next.file, specifier });
        continue;
      }
      const source = reached.has(target) ? undefined : sourceOf(target);
      if (source !== undefined) {
        reached.add(target);
        unread.push({ file: target, source });
      }
    }
  }
  return { reached: [...reached], leaving };
}
