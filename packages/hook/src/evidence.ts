// A10 evidence-package extraction — R2.3: moved verbatim from the
// orchestrator's hook-binding so BOTH spawn paths build the §6 package through
// one implementation. EXECUTOR-DECLARED keys only (`evidence[]`,
// `acceptance_map`, `decisions_claimed`, `memory_written`) extracted
// mechanically — the binding never fabricates evidence.
import type { EvidenceItem, PostTaskResult } from "./types.js";

export function extractEvidencePackage(output: unknown): PostTaskResult {
  const obj =
    output && typeof output === "object" ? (output as Record<string, unknown>) : {};
  const evidence = Array.isArray(obj.evidence) ? (obj.evidence as EvidenceItem[]) : [];
  const acceptanceMap =
    obj.acceptance_map && typeof obj.acceptance_map === "object"
      ? (obj.acceptance_map as Record<string, string>)
      : {};
  return {
    output,
    evidence,
    acceptanceMap,
    decisionsClaimed:
      typeof obj.decisions_claimed === "number" ? obj.decisions_claimed : undefined,
    memoryWritten: obj.memory_written === true ? true : undefined,
  };
}
