// LOCKED transition map (master-plan PHASE-03): the ONLY authority queue_transition
// consults. queued→claimed is deliberately absent — claiming goes through
// claim_next_task() (SKIP LOCKED), never through a status transition.
const TRANSITIONS: Record<string, readonly string[]> = {
  inbox: ["queued"],
  claimed: ["running"],
  running: ["review", "failed"],
  review: ["awaiting_approval", "done", "returned"],
  awaiting_approval: ["done", "failed"],
  returned: ["queued"],
};

export function allowedTargets(from: string): readonly string[] {
  return TRANSITIONS[from] ?? [];
}

export function assertTransition(from: string, to: string): void {
  const allowed = allowedTargets(from);
  if (!allowed.includes(to)) {
    throw new Error(
      `illegal transition ${from}→${to}; allowed from '${from}': ${
        allowed.length ? allowed.join(", ") : "(none — terminal or claim-only state)"
      }`,
    );
  }
}
