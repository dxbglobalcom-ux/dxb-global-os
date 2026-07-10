// Inbox domain helpers (GATE-03). Pure functions — unit-tested directly by
// tests/phase8/approval-inbox.test.ts.
//
// B7b asymmetry note: money-IN never becomes an approvals row (the Phase-4
// gate only drafts approvals for OUTWARD actions), so the inbox never needs
// a direction filter — the money-OUT badge is derived from action_type.
export type RiskClass = "high" | "medium" | "low";

export type InboxApproval = {
  id: string;
  task_id: string;
  action_type: string;
  payload: Record<string, unknown>;
  risk_class: string;
  created_at: string;
  department: string | null;
  objective: string | null;
};

export const RISK_ORDER: RiskClass[] = ["high", "medium", "low"];

// action_type families that move money OUT (0003 comment: 'email.send'|
// 'payment'|'contract'|'ad_spend'|...). Prefix match so 'payment.stripe'
// and 'transfer.wise' classify without a registry.
const MONEY_OUT_PREFIXES = ["payment", "transfer", "ad_spend", "refund", "payout"];

export function isMoneyOut(actionType: string): boolean {
  return MONEY_OUT_PREFIXES.some(
    (prefix) => actionType === prefix || actionType.startsWith(`${prefix}.`) || actionType.startsWith(`${prefix}_`),
  );
}

export function groupApprovals(rows: InboxApproval[]): Record<RiskClass, InboxApproval[]> {
  const groups: Record<RiskClass, InboxApproval[]> = { high: [], medium: [], low: [] };
  for (const row of rows) {
    const key = (RISK_ORDER as string[]).includes(row.risk_class)
      ? (row.risk_class as RiskClass)
      : "high"; // unknown risk class fails safe: treat as high, never as batchable
    groups[key].push(row);
  }
  return groups;
}

// Gate-fatigue threshold (master plan LOCKED: 50+ pending = rubber-stamp risk)
export const GATE_FATIGUE_THRESHOLD = 50;
