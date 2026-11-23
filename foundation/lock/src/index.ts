// The contract of @dxb-foundation/lock, whole: everything a caller may use is exported here.
//
// THE STUB. The types are the contract's (SPEC §6); every function throws NotBuilt
// until the code is written — the tests were written first and are red on it.

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

class NotBuilt extends Error {
  constructor(what: string) {
    super(`NOT_BUILT ${what}`);
    this.name = "NotBuilt";
  }
}

/** Pure. SPEC §5 step 6: `result` is what was read (undefined: no file; null: malformed). */
export function judgeRun(_input: {
  cases: readonly LockedCase[];
  protectedPaths: readonly string[];
  result: RunResult | null | undefined;
  nonce: string;
  exitCode: number;
}): Offence[] {
  throw new NotBuilt("judgeRun");
}

/** Pure. SPEC §5 step 3's first four rules — the ones that need no history — on listings already read from git. */
export function judgeStructure(_input: {
  lock: LockFile;
  /** path → blob id, the candidate's whole tree */
  candidate: ReadonlyMap<string, string>;
  candidateScripts: Readonly<Record<string, string>>;
}): Offence[] {
  throw new NotBuilt("judgeStructure");
}

/** Pure. The relative specifiers of one source text (static import, export-from, import("literal")). */
export function relativeImports(_source: string): string[] {
  throw new NotBuilt("relativeImports");
}

/** Pure. Deterministic text of a lock file. */
export function serializeLock(_lock: LockFile): string {
  throw new NotBuilt("serializeLock");
}
