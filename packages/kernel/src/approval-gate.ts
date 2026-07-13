// Operation risk classifier binding — APPROVAL_ENGINE §3: classification
// lives in the KERNEL as the single point; an agent can never declare its
// own operation "autonomous". The decision itself is DATA (approval_rules,
// scanned by fn_classify_operation in priority order, fail-closed to
// 'gated'), this wrapper is the one call site shape every kernel path uses.
import { sql } from "kysely";
import { getDb } from "@dxb/shared";

export type OperationGate = "autonomous" | "notify" | "gated";
export type OperationClass = "money_out" | "contract" | "identity" | "high_cost" | "other";

export interface ClassifiedOperation {
  gate: OperationGate;
  risk_class: OperationClass;
  rule_id: string | null;
}

export async function classifyOperation(
  operation: string,
  payload: Record<string, unknown> = {},
): Promise<ClassifiedOperation> {
  const row = await sql<{ result: ClassifiedOperation }>`
    SELECT fn_classify_operation(${operation}, ${JSON.stringify(payload)}::jsonb) AS result
  `.execute(getDb());
  const result = row.rows[0]?.result;
  if (!result || !result.gate) {
    // The SQL fn itself fails closed; a missing row here means the call
    // failed structurally — same answer, never autonomous.
    return { gate: "gated", risk_class: "other", rule_id: null };
  }
  return result;
}
