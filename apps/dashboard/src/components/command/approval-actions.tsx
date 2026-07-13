"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DoubleConfirmApprove } from "@/components/approvals/approval-card";

// ApprovalActions — detail-page decision island (E9.3, APPROVAL_ENGINE R4:
// all 7 CEO actions). Every mutation goes through /api/control/approvals →
// control_approvals_action (idempotent; CEO wall; single transaction).
// §10: no optimistic update — after an accepted call the server refetch
// repaints the row. approve-with-modifications edits payload FIELDS (the
// CEO reads sentences, not JSON — R5) and shows the diff before the
// double-confirm; money_out approvals keep the double-confirm control.

export type EmployeeOption = { id: string; slug: string };
export type ModelOption = { id: string; displayName: string };
export type RuleOption = {
  id: string;
  operationPattern: string;
  riskClass: string;
  gate: string;
  locked: boolean;
  enabled: boolean;
};

export type ActionLabels = {
  actionsTitle: string;
  approve: string;
  confirmApprove: string;
  reject: string;
  modify: string;
  cancelModify: string;
  diffTitle: string;
  noChanges: string;
  approveWithChanges: string;
  delegate: string;
  delegateTo: string;
  alreadyDelegated: string;
  requestInfo: string;
  reanalyze: string;
  reanalyzeModel: string;
  modelAuto: string;
  changePolicy: string;
  policyRule: string;
  policyGate: string;
  lockedRule: string;
  gates: Record<string, string>;
  notePlaceholder: string;
  send: string;
  moneyOutNotice: string;
  done: Record<string, string>;
};

async function callApi(body: Record<string, unknown>): Promise<string | null> {
  const res = await fetch("/api/control/approvals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { ok: boolean; error?: string; detail?: string };
  return data.ok ? null : (data.detail ?? data.error ?? "request failed");
}

type Panel = "none" | "modify" | "delegate" | "info" | "reanalyze" | "policy";

export function ApprovalActions({
  approvalId,
  payload,
  moneyOut,
  delegatedToSlug,
  employees,
  models,
  rules,
  labels,
}: {
  approvalId: string;
  payload: Record<string, unknown>;
  moneyOut: boolean;
  delegatedToSlug: string | null;
  employees: EmployeeOption[];
  models: ModelOption[];
  rules: RuleOption[];
  labels: ActionLabels;
}) {
  const router = useRouter();
  const [panel, setPanel] = useState<Panel>("none");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneMsg, setDoneMsg] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [modelId, setModelId] = useState("");
  const [ruleId, setRuleId] = useState("");
  const [ruleGate, setRuleGate] = useState("");

  // Editable copy of the payload's SCALAR fields (string/number/boolean).
  // Nested values stay read-only here — structural edits are not a
  // rubber-stamp affordance.
  const scalarKeys = useMemo(
    () =>
      Object.entries(payload)
        .filter(([, v]) => ["string", "number", "boolean"].includes(typeof v))
        .map(([k]) => k),
    [payload],
  );
  const [draft, setDraft] = useState<Record<string, string>>(() =>
    Object.fromEntries(scalarKeys.map((k) => [k, String(payload[k] ?? "")])),
  );

  const modifications = useMemo(() => {
    const mods: Record<string, unknown> = {};
    for (const key of scalarKeys) {
      const original = payload[key];
      const edited = draft[key] ?? "";
      if (String(original ?? "") === edited) continue;
      if (typeof original === "number") {
        const n = Number(edited);
        mods[key] = Number.isFinite(n) ? n : edited;
      } else if (typeof original === "boolean") {
        mods[key] = edited === "true";
      } else {
        mods[key] = edited;
      }
    }
    return mods;
  }, [draft, payload, scalarKeys]);

  const act = async (action: string, extra?: Record<string, unknown>) => {
    setBusy(true);
    setError(null);
    setDoneMsg(null);
    const err = await callApi({ op: "decide", approvalId, action, ...extra });
    setBusy(false);
    if (err) setError(err);
    else {
      setDoneMsg(labels.done[action] ?? action);
      setPanel("none");
      setNote("");
      router.refresh();
    }
  };

  const panelBtn = (p: Panel, label: string, disabled = false) => (
    <button
      type="button"
      disabled={busy || disabled}
      onClick={() => setPanel(panel === p ? "none" : p)}
      className={`rounded-input border px-3 py-1 text-body-s transition duration-[var(--t-fast)] ease-refined disabled:opacity-50 ${
        panel === p
          ? "border-edge-champagne text-accent-champagne"
          : "border-edge-neutral text-ink-secondary hover:text-ink-primary"
      }`}
    >
      {label}
    </button>
  );

  const inputCls =
    "rounded-input border border-edge-neutral bg-surface-graphite px-2 py-1 text-body-s text-ink-primary";
  const selectedRule = rules.find((r) => r.id === ruleId);

  return (
    <div className="space-y-3">
      <div className="label-caps text-ink-muted">{labels.actionsTitle}</div>

      <div className="flex flex-wrap items-center gap-2">
        <DoubleConfirmApprove
          onConfirm={() => void act("approve", note ? { note } : undefined)}
          disabled={busy}
          approveLabel={labels.approve}
          confirmLabel={labels.confirmApprove}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => void act("reject", note ? { note } : undefined)}
          className="rounded-input border border-edge-neutral px-3 py-1 text-body-s text-ink-secondary transition duration-[var(--t-fast)] ease-refined hover:text-status-danger disabled:opacity-50"
        >
          {labels.reject}
        </button>
        {panelBtn("modify", labels.modify, scalarKeys.length === 0)}
        {panelBtn("delegate", labels.delegate, delegatedToSlug !== null)}
        {panelBtn("info", labels.requestInfo)}
        {panelBtn("reanalyze", labels.reanalyze)}
        {panelBtn("policy", labels.changePolicy, rules.length === 0)}
      </div>

      {delegatedToSlug && (
        <p className="text-body-s text-ink-muted">
          {labels.alreadyDelegated} {delegatedToSlug}
        </p>
      )}

      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={labels.notePlaceholder}
        maxLength={2000}
        className={`${inputCls} w-full`}
      />

      {panel === "modify" && (
        <div className="space-y-2 rounded-panel border border-edge-neutral bg-surface-graphite p-3">
          <dl className="grid gap-x-4 gap-y-1 md:grid-cols-[max-content_1fr]">
            {scalarKeys.map((key) => (
              <span key={key} className="contents">
                <dt className="label-caps self-center text-ink-muted">{key}</dt>
                <dd>
                  <input
                    type="text"
                    value={draft[key] ?? ""}
                    onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                    className={`${inputCls} w-full`}
                  />
                </dd>
              </span>
            ))}
          </dl>
          <div className="border-t border-edge-neutral pt-2">
            <div className="label-caps text-ink-muted">{labels.diffTitle}</div>
            {Object.keys(modifications).length === 0 ? (
              <p className="text-body-s text-ink-muted">{labels.noChanges}</p>
            ) : (
              <ul className="space-y-0.5">
                {Object.entries(modifications).map(([k, v]) => (
                  <li key={k} className="font-data text-body-s text-ink-secondary">
                    {k}: <span className="line-through opacity-60">{String(payload[k])}</span>{" "}
                    <span className="text-accent-champagne">{String(v)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <DoubleConfirmApprove
            onConfirm={() =>
              void act("approve_with_modifications", {
                modifications,
                ...(note ? { note } : {}),
              })
            }
            disabled={busy || Object.keys(modifications).length === 0}
            approveLabel={labels.approveWithChanges}
            confirmLabel={labels.confirmApprove}
          />
        </div>
      )}

      {panel === "delegate" && (
        <div className="flex flex-wrap items-center gap-2 rounded-panel border border-edge-neutral bg-surface-graphite p-3">
          <span className="label-caps text-ink-muted">{labels.delegateTo}</span>
          <select
            className={inputCls}
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          >
            <option value="">—</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.slug}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={busy || !employeeId}
            onClick={() =>
              void act("delegate", { employeeId, ...(note ? { note } : {}) })
            }
            className="rounded-input border border-edge-champagne px-3 py-1 text-body-s text-accent-champagne disabled:opacity-50"
          >
            {labels.send}
          </button>
        </div>
      )}

      {panel === "info" && (
        <div className="flex flex-wrap items-center gap-2 rounded-panel border border-edge-neutral bg-surface-graphite p-3">
          <button
            type="button"
            disabled={busy || !note}
            onClick={() => void act("request_info", { note })}
            className="rounded-input border border-edge-champagne px-3 py-1 text-body-s text-accent-champagne disabled:opacity-50"
          >
            {labels.send}
          </button>
        </div>
      )}

      {panel === "reanalyze" && (
        <div className="flex flex-wrap items-center gap-2 rounded-panel border border-edge-neutral bg-surface-graphite p-3">
          <span className="label-caps text-ink-muted">{labels.reanalyzeModel}</span>
          <select
            className={inputCls}
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
          >
            <option value="">{labels.modelAuto}</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.displayName}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              void act("reanalyze", {
                ...(modelId ? { modelId } : {}),
                ...(note ? { note } : {}),
              })
            }
            className="rounded-input border border-edge-champagne px-3 py-1 text-body-s text-accent-champagne disabled:opacity-50"
          >
            {labels.send}
          </button>
        </div>
      )}

      {panel === "policy" && (
        <div className="flex flex-wrap items-center gap-2 rounded-panel border border-edge-neutral bg-surface-graphite p-3">
          <span className="label-caps text-ink-muted">{labels.policyRule}</span>
          <select
            className={inputCls}
            value={ruleId}
            onChange={(e) => {
              setRuleId(e.target.value);
              const rule = rules.find((r) => r.id === e.target.value);
              setRuleGate(rule?.gate ?? "");
            }}
          >
            <option value="">—</option>
            {rules.map((r) => (
              <option key={r.id} value={r.id} disabled={r.locked}>
                {r.operationPattern} · {labels.gates[r.gate] ?? r.gate}
                {r.locked ? ` — ${labels.lockedRule}` : ""}
              </option>
            ))}
          </select>
          {selectedRule && !selectedRule.locked && (
            <>
              <span className="label-caps text-ink-muted">{labels.policyGate}</span>
              <select
                className={inputCls}
                value={ruleGate}
                onChange={(e) => setRuleGate(e.target.value)}
              >
                {Object.entries(labels.gates).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={busy || !ruleGate || ruleGate === selectedRule.gate}
                onClick={() =>
                  void act("change_policy", {
                    ruleId,
                    set: { gate: ruleGate },
                    ...(note ? { note } : {}),
                  })
                }
                className="rounded-input border border-edge-champagne px-3 py-1 text-body-s text-accent-champagne disabled:opacity-50"
              >
                {labels.send}
              </button>
            </>
          )}
        </div>
      )}

      {moneyOut && panel === "none" && !doneMsg && (
        <p className="text-caption text-ink-muted">{labels.moneyOutNotice}</p>
      )}
      {error && <p className="text-body-s text-status-danger">{error}</p>}
      {doneMsg && <p className="text-body-s text-status-ok">{doneMsg}</p>}
    </div>
  );
}
