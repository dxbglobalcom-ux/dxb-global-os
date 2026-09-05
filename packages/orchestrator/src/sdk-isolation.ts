// B43 plan ② (CEO 2026-09-05, "herşey sende"): AN EMPLOYEE'S RUN IS THE EMPLOYEE'S, NOT THE
// SESSION'S.
//
// Measured 2026-09-03 (evening, recorded on B43 as "for his word") and again this night:
// the Agent SDK loads EVERY filesystem settings source when `settingSources` is omitted
// ("matches CLI defaults", sdk.d.ts), and the scheduler runs from the repository root — so
// a seat's run was reading the construction site's own CLAUDE.md and firing its
// session hooks (a QC probe once answered as the DXB session assistant would). That is
// the construction context leaking into the company's employees: tokens spent on text
// meant for the author, and an identity that is not the seat's.
//
// The road now runs every model call of a task — the seat's run and the QA gate that
// judges it — in SDK isolation: no filesystem settings, a fixed working directory. The
// tools a seat holds are still the compiled gateway profile (R2.2), passed explicitly.
// `DXB_WORKER_ISOLATION=0` is the rollback shape (the pre-2026-09-05 behaviour).
export interface SdkIsolation {
  settingSources: never[];
  cwd: string;
}

export function workerIsolation(env: NodeJS.ProcessEnv = process.env): SdkIsolation | null {
  if (env.DXB_WORKER_ISOLATION === "0") return null;
  return { settingSources: [], cwd: env.DXB_REPO_ROOT ?? process.cwd() };
}
