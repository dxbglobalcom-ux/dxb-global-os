// The contract of @dxb-foundation/lock, whole: everything a caller may use is exported here.
//
// The types are the contract's (SPEC §6) and stand here; each function is exported
// from the file that holds the decision it makes.

export type LockedCase = { file: string; suite: string[]; name: string; count: number };
export type CaseResult = { file: string; suite: string[]; name: string; state: string; retryCount: number };
export type RunResult = {
  nonce: string;
  cases: CaseResult[];
  modules: { file: string; state: string; errors: number }[];
  unhandledErrors: number;
  reason: string;
  setupFiles: string[];
};
export type Offence = { kind: string; detail: string };
export type LockFile = {
  format: 1;
  piece: string;
  dirs: string[];
  config: string;
  protected: Record<string, string>;
  scripts: Record<string, string>;
  cases: LockedCase[];
};

export { judgeRun, judgeStructure } from "./judge.ts";
export { relativeImports } from "./imports.ts";
export { serializeLock } from "./lockfile.ts";
