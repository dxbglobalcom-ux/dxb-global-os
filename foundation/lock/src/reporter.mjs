// The judge's reporter (SPEC §5 step 5, §6). Plain JavaScript and Node built-ins
// only: Vitest loads it from outside the candidate.
//
// It writes one file, once, when the run ends: the result the judge reads. The
// judge names that file `<work>/result/<nonce>.json` and has written the
// candidate into `<work>/candidate`. Both are read off the file's name here —
// the nonce, to be written back into the result, and the candidate's root, so
// that every path in the result is spelled as a lock spells it.
import { writeFileSync } from "node:fs";
import { basename, dirname, join, relative, sep } from "node:path";

/** The suites a case stands in, the outermost first. */
function suitePathOf(test) {
  const path = [];
  for (let parent = test.parent; parent.type === "suite"; parent = parent.parent) path.unshift(parent.name);
  return path;
}

export default class LockReporter {
  /** The runner, as `onInit` was handed it: the result's path and the resolved configuration of every project. */
  #vitest;

  onInit(vitest) {
    this.#vitest = vitest;
  }

  onTestRunEnd(modules, unhandledErrors, reason) {
    const resultPath = this.#vitest.config.outputFile;
    if (typeof resultPath !== "string") throw new Error("the lock reporter writes to --outputFile=<work>/result/<nonce>.json, and none was given");
    const candidate = join(dirname(dirname(resultPath)), "candidate");
    // A path outside the candidate stays as it is: the judge then sees that it is no path of the tree.
    const asTheLockSpells = (path) => (path.startsWith(candidate + sep) ? relative(candidate, path) : path);
    const setupFiles = this.#vitest.projects.flatMap((project) => [...project.config.setupFiles, ...project.config.globalSetup]);

    const result = {
      nonce: basename(resultPath, ".json"),
      cases: modules.flatMap((module) =>
        [...module.children.allTests()].map((test) => ({
          file: asTheLockSpells(module.moduleId),
          suite: suitePathOf(test),
          name: test.name,
          state: test.result().state,
          retryCount: test.diagnostic()?.retryCount ?? 0,
          // What the case declares of itself — `lock` refuses either.
          retry: test.options.retry ?? 0,
          repeats: test.options.repeats ?? 0,
        })),
      ),
      modules: modules.map((module) => ({ file: asTheLockSpells(module.moduleId), state: module.state(), errors: module.errors().length })),
      unhandledErrors: unhandledErrors.length,
      reason,
      setupFiles: [...new Set(setupFiles.map(asTheLockSpells))].sort(),
    };
    // "wx": the file is created by this call or not at all — a result that already stands is never written over.
    writeFileSync(resultPath, JSON.stringify(result), { flag: "wx" });
  }
}
