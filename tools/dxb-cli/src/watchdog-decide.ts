// Watchdog decision core (07-06, VPS-02). PURE functions — the systemd-timer
// shell (vps/watchdog/watchdog.sh) gathers facts and applies THE SAME
// thresholds; tests prove the logic here deterministically. Field parity with
// vps/hermes/load-jobs.sh validation — change both or neither (Pitfall 9).

export interface JobBudget {
  max_steps: number;
  max_tokens: number;
  max_cost_eur: number;
}

export interface RunningJobFacts {
  job: string;
  budget: JobBudget;
  startedAt: Date;
  /** Declared artifact exists on disk (any bytes). */
  artifactExists: boolean;
  /** Observed consumption so far. */
  spentEur: number;
  steps: number;
  tokens: number;
}

export interface KillDecision {
  kill: boolean;
  reason: string | null;
}

/** Master PHASE-07 watchdog rule: kill when over ANY budget field, or when
 *  running past 2 hours without the declared artifact on disk. */
export const ARTIFACTLESS_LIMIT_MS = 2 * 60 * 60 * 1000;

export function decideKill(facts: RunningJobFacts, now: Date): KillDecision {
  if (facts.spentEur > facts.budget.max_cost_eur) {
    return { kill: true, reason: `over_budget:cost ${facts.spentEur}>${facts.budget.max_cost_eur}` };
  }
  if (facts.steps > facts.budget.max_steps) {
    return { kill: true, reason: `over_budget:steps ${facts.steps}>${facts.budget.max_steps}` };
  }
  if (facts.tokens > facts.budget.max_tokens) {
    return { kill: true, reason: `over_budget:tokens ${facts.tokens}>${facts.budget.max_tokens}` };
  }
  const runtimeMs = now.getTime() - facts.startedAt.getTime();
  if (!facts.artifactExists && runtimeMs > ARTIFACTLESS_LIMIT_MS) {
    return { kill: true, reason: `artifactless_2h runtime_min=${Math.round(runtimeMs / 60000)}` };
  }
  return { kill: false, reason: null };
}

/** Load-time job validation (loader parity): every mandatory field of the
 *  master's bounded-job template must be present. Returns missing keys. */
export function validateJob(jobFileText: string): string[] {
  const required = ["schedule:", "max_steps:", "max_tokens:", "max_cost_eur:", "artifact:", "on_output:"];
  return required.filter((f) => !jobFileText.includes(f));
}
