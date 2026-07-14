"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { subscribeDxb } from "@/lib/realtime";

// Hook violation feed + policy board (E10.1 — FABLE_5_HOOK_SPEC §5 "İhlal
// akışı UI", §13/§14). EVERY policy mutation goes through /api/control/hook
// (fn_hook_set_policy single door); the fn's verdict is surfaced verbatim.
// Weakening a block policy is a HIGH-risk governance change — the board says
// so before the CEO clicks, and the fn stamps it in the audit payload.

export type ViolationRow = {
  id: number;
  runId: string | null;
  policyId: string;
  policyTitle: string;
  standardNo: number | null;
  gate: string;
  detail: string;
  actionTaken: string;
  createdAt: string;
};

export type PolicyRow = {
  id: string;
  standardNo: number;
  gate: string;
  severity: string;
  enabled: boolean;
  version: number;
  title: string;
};

export type ViolationsLabels = {
  streamTitle: string;
  policiesTitle: string;
  colTime: string;
  colPolicy: string;
  colGate: string;
  colAction: string;
  colDetail: string;
  colRun: string;
  colStandard: string;
  colSeverity: string;
  colEnabled: string;
  colVersion: string;
  filterGate: string;
  filterAction: string;
  all: string;
  gates: Record<string, string>;
  actions: Record<string, string>;
  severities: Record<string, string>;
  enabledOn: string;
  enabledOff: string;
  toWarn: string;
  toBlock: string;
  disable: string;
  enable: string;
  highRiskNote: string;
  emptyStream: string;
  emptyStreamHint: string;
  shown: string;
  errorPrefix: string;
};

const ACTION_TONE: Record<string, string> = {
  rejected: "text-status-danger",
  escalated: "text-status-danger",
  revised: "text-status-warn",
  warned: "text-ink-muted",
};

async function callHook(body: Record<string, unknown>): Promise<string | null> {
  const res = await fetch("/api/control/hook", {
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

/** settings channel carries hook_policy.changed (§10 cache drop); the alerts
 *  channel fires on every violation (A4 trigger) — both refresh this board. */
export function ViolationsLive() {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const refresh = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => router.refresh(), 400);
    };
    const unsubSettings = subscribeDxb("settings", refresh);
    const unsubAlerts = subscribeDxb("alerts", refresh);
    return () => {
      if (timer.current) clearTimeout(timer.current);
      unsubSettings();
      unsubAlerts();
    };
  }, [router]);
  return null;
}

export function ViolationStream({
  rows,
  labels,
}: {
  rows: ViolationRow[];
  labels: ViolationsLabels;
}) {
  const [gate, setGate] = useState("");
  const [action, setAction] = useState("");

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) => (!gate || r.gate === gate) && (!action || r.actionTaken === action),
      ),
    [rows, gate, action],
  );

  const selectCls =
    "rounded-input border border-edge-neutral bg-surface-graphite px-2 py-1 text-body-s text-ink-primary";

  if (rows.length === 0) {
    return (
      <div className="space-y-1 py-6 text-center">
        <p className="text-body-m text-ink-secondary">{labels.emptyStream}</p>
        <p className="text-body-s text-ink-muted">{labels.emptyStreamHint}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="label-caps text-ink-muted">{labels.filterGate}</span>
          <select className={selectCls} value={gate} onChange={(e) => setGate(e.target.value)}>
            <option value="">{labels.all}</option>
            {["pre", "runtime", "post"].map((g) => (
              <option key={g} value={g}>
                {labels.gates[g] ?? g}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="label-caps text-ink-muted">{labels.filterAction}</span>
          <select className={selectCls} value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="">{labels.all}</option>
            {["rejected", "revised", "escalated", "warned"].map((a) => (
              <option key={a} value={a}>
                {labels.actions[a] ?? a}
              </option>
            ))}
          </select>
        </label>
        <span className="ml-auto text-body-s text-ink-muted">
          {filtered.length} {labels.shown}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead>
            <tr className="border-b border-edge-neutral">
              <th className="label-caps py-2 pr-3 text-ink-muted">{labels.colTime}</th>
              <th className="label-caps py-2 pr-3 text-ink-muted">{labels.colPolicy}</th>
              <th className="label-caps py-2 pr-3 text-ink-muted">{labels.colGate}</th>
              <th className="label-caps py-2 pr-3 text-ink-muted">{labels.colAction}</th>
              <th className="label-caps py-2 pr-3 text-ink-muted">{labels.colDetail}</th>
              <th className="label-caps py-2 text-ink-muted">{labels.colRun}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-edge-neutral/40 align-top">
                <td className="whitespace-nowrap py-2 pr-3 font-data text-body-s text-ink-muted">
                  {r.createdAt}
                </td>
                <td className="py-2 pr-3">
                  <span className="text-body-s text-ink-primary">{r.policyTitle}</span>
                  {r.standardNo != null && (
                    <span className="ml-1 font-data text-body-s text-ink-muted">
                      #{r.standardNo}
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap py-2 pr-3 text-body-s text-ink-secondary">
                  {labels.gates[r.gate] ?? r.gate}
                </td>
                <td
                  className={`whitespace-nowrap py-2 pr-3 text-body-s ${ACTION_TONE[r.actionTaken] ?? "text-ink-secondary"}`}
                >
                  {labels.actions[r.actionTaken] ?? r.actionTaken}
                </td>
                <td className="max-w-[28rem] py-2 pr-3 text-body-s text-ink-secondary">
                  {r.detail}
                </td>
                <td className="py-2">
                  {r.runId ? (
                    <Link
                      href="/live"
                      className="font-data text-body-s text-accent-champagne hover:underline"
                    >
                      {r.runId.slice(0, 8)}
                    </Link>
                  ) : (
                    <span className="text-body-s text-ink-muted">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PolicyBoard({
  policies,
  labels,
}: {
  policies: PolicyRow[];
  labels: ViolationsLabels;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (policyId: string, patch: Record<string, unknown>) => {
    setBusyId(policyId);
    setError(null);
    const failure = await callHook({ op: "set_policy", policyId, ...patch });
    setBusyId(null);
    if (failure) setError(failure);
    else router.refresh();
  };

  const btnCls =
    "whitespace-nowrap rounded-input border border-edge-neutral px-2 py-0.5 text-body-s text-ink-secondary transition duration-[var(--t-fast)] ease-refined hover:text-ink-primary disabled:opacity-50";

  return (
    <div className="space-y-3">
      <p className="text-body-s text-ink-muted">{labels.highRiskNote}</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="border-b border-edge-neutral">
              <th className="label-caps py-2 pr-3 text-ink-muted">{labels.colStandard}</th>
              <th className="label-caps py-2 pr-3 text-ink-muted">{labels.colPolicy}</th>
              <th className="label-caps py-2 pr-3 text-ink-muted">{labels.colGate}</th>
              <th className="label-caps py-2 pr-3 text-ink-muted">{labels.colSeverity}</th>
              <th className="label-caps py-2 pr-3 text-ink-muted">{labels.colEnabled}</th>
              <th className="label-caps py-2 pr-3 text-ink-muted">{labels.colVersion}</th>
              <th className="label-caps py-2 text-ink-muted" />
            </tr>
          </thead>
          <tbody>
            {policies.map((p) => (
              <tr key={p.id} className="border-b border-edge-neutral/40">
                <td className="py-2 pr-3 font-data text-body-s text-ink-muted">#{p.standardNo}</td>
                <td className="py-2 pr-3">
                  <span className="block text-body-s text-ink-primary">{p.title}</span>
                  <span className="block font-data text-body-s text-ink-muted">{p.id}</span>
                </td>
                <td className="whitespace-nowrap py-2 pr-3 text-body-s text-ink-secondary">
                  {labels.gates[p.gate] ?? p.gate}
                </td>
                <td className="whitespace-nowrap py-2 pr-3">
                  <span
                    className={`text-body-s ${p.severity === "block" ? "text-status-danger" : "text-status-warn"}`}
                  >
                    {labels.severities[p.severity] ?? p.severity}
                  </span>
                </td>
                <td className="whitespace-nowrap py-2 pr-3 text-body-s text-ink-secondary">
                  {p.enabled ? labels.enabledOn : labels.enabledOff}
                </td>
                <td className="py-2 pr-3 font-data text-body-s text-ink-muted">v{p.version}</td>
                <td className="py-2">
                  <div className="flex flex-col items-end gap-1 2xl:flex-row 2xl:justify-end">
                    <button
                      type="button"
                      disabled={busyId === p.id}
                      className={btnCls}
                      onClick={() =>
                        mutate(p.id, { severity: p.severity === "block" ? "warn" : "block" })
                      }
                    >
                      {p.severity === "block" ? labels.toWarn : labels.toBlock}
                    </button>
                    <button
                      type="button"
                      disabled={busyId === p.id}
                      className={btnCls}
                      onClick={() => mutate(p.id, { enabled: !p.enabled })}
                    >
                      {p.enabled ? labels.disable : labels.enable}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {error && (
        <p className="text-body-s text-status-danger">
          {labels.errorPrefix}: {error}
        </p>
      )}
    </div>
  );
}
