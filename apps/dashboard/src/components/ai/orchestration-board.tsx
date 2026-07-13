"use client";

import { useMemo, useState } from "react";
import { Panel, StatusBadge } from "@/components/primitives";

// Model Orchestration Panel (E7.2 — MODEL_ROUTING_SPEC §5/§19).
// 13 role slots → model assignment (select + confirm dialog — registered
// adaptation A2: drag lands with graph v2), fallback chain per model,
// guardrail audit card (banned mechanism VISIBLE per roadmap E7.2), and the
// RoutingSimulator (§5: step-by-step selection transparency, log=false).
// Assignment truth lives in the DB; a change repaints only after the seam
// confirms it (§10: no optimistic update — no visual lies).

export type SlotRow = {
  roleSlot: string;
  modelId: string | null;
  displayName: string | null;
  modelStatus: string | null;
};

export type ModelRow = {
  id: string;
  displayName: string | null;
  status: string;
  banned: boolean;
  mechanicalOnly: boolean;
  fallbackOf: string | null;
};

export type DeptOption = { id: string; label: string };

export type OrchestrationLabels = {
  slotsTitle: string;
  colSlot: string;
  colModel: string;
  colFallback: string;
  unassigned: string;
  change: string;
  cancel: string;
  confirm: string;
  rationale: string;
  saved: string;
  guardrailsTitle: string;
  guardBanned: string;
  guardMechanical: string;
  guardTesting: string;
  guardNote: string;
  none: string;
  simulatorTitle: string;
  simSubtitle: string;
  simDept: string;
  simGlobal: string;
  simRisk: string;
  riskLow: string;
  riskMedium: string;
  riskHigh: string;
  riskCritical: string;
  simContext: string;
  simCost: string;
  simRun: string;
  simChosen: string;
  simEliminated: string;
  simRefused: string;
  slotNames: Record<string, string>;
  statuses: Record<string, string>;
};

const MECHANICAL_SLOTS = new Set(["fast_task", "low_cost"]);

function statusLevel(status: string | null): "ok" | "info" | "warn" | "danger" {
  if (status === "active") return "ok";
  if (status === "testing") return "info";
  if (status === "degraded" || status === "disabled") return "warn";
  return status === "retired" ? "danger" : "info";
}

function fallbackChain(modelId: string | null, byId: Map<string, ModelRow>): string[] {
  const chain: string[] = [];
  let cur = modelId ? byId.get(modelId)?.fallbackOf : null;
  let depth = 0;
  while (cur && depth < 4) {
    chain.push(cur);
    cur = byId.get(cur)?.fallbackOf ?? null;
    depth += 1;
  }
  return chain;
}

type SimResult = {
  ok: boolean;
  model_id?: string;
  error?: string;
  considered?: { model_id?: string; reason?: string }[];
};

export function OrchestrationBoard({
  slots,
  models,
  departments,
  labels,
}: {
  slots: SlotRow[];
  models: ModelRow[];
  departments: DeptOption[];
  labels: OrchestrationLabels;
}) {
  const byId = useMemo(() => new Map(models.map((m) => [m.id, m])), [models]);
  const [board, setBoard] = useState<SlotRow[]>(slots);
  const [editing, setEditing] = useState<string | null>(null);
  const [pick, setPick] = useState("");
  const [rationale, setRationale] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ slot: string; text: string; ok: boolean } | null>(null);

  const [simSlot, setSimSlot] = useState("execution");
  const [simDept, setSimDept] = useState("");
  const [simRisk, setSimRisk] = useState("low");
  const [simContext, setSimContext] = useState("");
  const [simCost, setSimCost] = useState("");
  const [simBusy, setSimBusy] = useState(false);
  const [sim, setSim] = useState<SimResult | null>(null);

  // Pool per slot mirrors the fn rule exactly: active + not banned; mechanical
  // models only on the mechanical slots (the fn refuses anyway — the UI just
  // never offers what the seam would reject).
  const poolFor = (slot: string) =>
    models.filter(
      (m) =>
        m.status === "active" &&
        !m.banned &&
        (!m.mechanicalOnly || MECHANICAL_SLOTS.has(slot)),
    );

  async function submitAssign(slot: string) {
    if (!pick) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch("/api/control/models", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify({
          op: "assign_role",
          roleSlot: slot,
          modelId: pick,
          rationale: rationale || undefined,
        }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string; detail?: string };
      if (data.ok) {
        const m = byId.get(pick);
        setBoard((prev) =>
          prev.map((r) =>
            r.roleSlot === slot
              ? {
                  ...r,
                  modelId: pick,
                  displayName: m?.displayName ?? pick,
                  modelStatus: m?.status ?? null,
                }
              : r,
          ),
        );
        setNotice({ slot, text: labels.saved, ok: true });
        setEditing(null);
        setPick("");
        setRationale("");
      } else {
        setNotice({ slot, text: `${data.error}${data.detail ? ` — ${data.detail}` : ""}`, ok: false });
      }
    } finally {
      setBusy(false);
    }
  }

  async function runSim() {
    setSimBusy(true);
    setSim(null);
    try {
      const res = await fetch("/api/ai/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleSlot: simSlot,
          departmentId: simDept || null,
          risk: simRisk,
          minContext: simContext ? Number(simContext) : null,
          estCostEur: simCost ? Number(simCost) : null,
        }),
      });
      setSim((await res.json()) as SimResult);
    } finally {
      setSimBusy(false);
    }
  }

  const banned = models.filter((m) => m.banned);
  const mechanical = models.filter((m) => m.mechanicalOnly);
  const testing = models.filter((m) => m.status === "testing");

  const inputCls =
    "rounded-input border border-edge-neutral bg-surface-graphite px-2 py-1 text-body-s text-ink-primary";

  return (
    <div className="@container">
    <div className="grid gap-4 @4xl:grid-cols-[1fr_20rem]">
      {/* 13 role slots */}
      <Panel title={labels.slotsTitle}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem]">
            <thead>
              <tr className="text-left">
                <th className="label-caps px-2 py-1 text-ink-muted">{labels.colSlot}</th>
                <th className="label-caps px-2 py-1 text-ink-muted">{labels.colModel}</th>
                <th className="label-caps px-2 py-1 text-ink-muted">{labels.colFallback}</th>
                <th className="px-2 py-1" />
              </tr>
            </thead>
            <tbody className="divide-y divide-edge-neutral">
              {board.map((row) => {
                const chain = fallbackChain(row.modelId, byId);
                const isEditing = editing === row.roleSlot;
                return (
                  <tr key={row.roleSlot} data-testid={`slot-${row.roleSlot}`}>
                    <td className="px-2 py-2 text-body-s text-ink-primary">
                      {labels.slotNames[row.roleSlot] ?? row.roleSlot}
                    </td>
                    <td className="px-2 py-2">
                      {isEditing ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            className={inputCls}
                            value={pick}
                            onChange={(e) => setPick(e.target.value)}
                            aria-label={labels.colModel}
                          >
                            <option value="">—</option>
                            {poolFor(row.roleSlot).map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.displayName ?? m.id}
                              </option>
                            ))}
                          </select>
                          <input
                            className={inputCls}
                            placeholder={labels.rationale}
                            value={rationale}
                            onChange={(e) => setRationale(e.target.value)}
                          />
                          <button
                            type="button"
                            disabled={busy || !pick}
                            onClick={() => submitAssign(row.roleSlot)}
                            className="rounded-input bg-accent-champagne px-2 py-1 text-body-s text-surface-obsidian disabled:opacity-50"
                          >
                            {labels.confirm}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(null);
                              setPick("");
                              setNotice(null);
                            }}
                            className="rounded-input border border-edge-neutral px-2 py-1 text-body-s text-ink-secondary"
                          >
                            {labels.cancel}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-data text-body-s text-ink-primary">
                            {row.displayName ?? row.modelId ?? labels.unassigned}
                          </span>
                          {row.modelStatus && row.modelStatus !== "active" && (
                            <StatusBadge level={statusLevel(row.modelStatus)}>
                              {labels.statuses[row.modelStatus] ?? row.modelStatus}
                            </StatusBadge>
                          )}
                        </div>
                      )}
                      {notice?.slot === row.roleSlot && (
                        <p
                          className={`mt-1 text-caption ${notice.ok ? "text-status-ok" : "text-status-danger"}`}
                          role="status"
                        >
                          {notice.text}
                        </p>
                      )}
                    </td>
                    <td className="px-2 py-2 font-data text-caption text-ink-muted">
                      {chain.length > 0
                        ? chain.map((c) => byId.get(c)?.displayName ?? c).join(" → ")
                        : labels.none}
                    </td>
                    <td className="px-2 py-2 text-right">
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(row.roleSlot);
                            setPick(row.modelId ?? "");
                            setNotice(null);
                          }}
                          className="rounded-input border border-edge-neutral px-2 py-1 text-body-s text-ink-secondary transition duration-[var(--t-fast)] ease-refined hover:border-edge-champagne hover:text-ink-primary"
                        >
                          {labels.change}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="space-y-4">
        {/* Guardrail audit — the banned mechanism is VISIBLE (roadmap E7.2) */}
        <Panel title={labels.guardrailsTitle}>
          <ul className="space-y-2 text-body-s">
            <li className="flex items-center justify-between gap-2">
              <span className="text-ink-secondary">{labels.guardBanned}</span>
              <span className="font-data tabular-nums text-ink-primary">
                {banned.length === 0 ? labels.none : banned.map((m) => m.id).join(", ")}
              </span>
            </li>
            <li className="flex items-center justify-between gap-2">
              <span className="text-ink-secondary">{labels.guardMechanical}</span>
              <span className="font-data text-ink-primary">
                {mechanical.length === 0 ? labels.none : mechanical.map((m) => m.id).join(", ")}
              </span>
            </li>
            <li className="flex items-center justify-between gap-2">
              <span className="text-ink-secondary">{labels.guardTesting}</span>
              <span className="font-data text-ink-primary">
                {testing.length === 0 ? labels.none : testing.map((m) => m.id).join(", ")}
              </span>
            </li>
          </ul>
          <p className="mt-3 text-caption text-ink-muted">{labels.guardNote}</p>
        </Panel>

        {/* Routing simulator — §5 rule transparency */}
        <Panel title={labels.simulatorTitle}>
          <p className="mb-3 text-caption text-ink-muted">{labels.simSubtitle}</p>
          <div className="space-y-2">
            <select
              className={`${inputCls} w-full`}
              value={simSlot}
              onChange={(e) => setSimSlot(e.target.value)}
              aria-label={labels.colSlot}
            >
              {board.map((s) => (
                <option key={s.roleSlot} value={s.roleSlot}>
                  {labels.slotNames[s.roleSlot] ?? s.roleSlot}
                </option>
              ))}
            </select>
            <select
              className={`${inputCls} w-full`}
              value={simDept}
              onChange={(e) => setSimDept(e.target.value)}
              aria-label={labels.simDept}
            >
              <option value="">{labels.simGlobal}</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <select
                className={inputCls}
                value={simRisk}
                onChange={(e) => setSimRisk(e.target.value)}
                aria-label={labels.simRisk}
              >
                {(
                  [
                    ["low", labels.riskLow],
                    ["medium", labels.riskMedium],
                    ["high", labels.riskHigh],
                    ["critical", labels.riskCritical],
                  ] as const
                ).map(([r, label]) => (
                  <option key={r} value={r}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                className={`${inputCls} w-24`}
                placeholder={labels.simContext}
                inputMode="numeric"
                value={simContext}
                onChange={(e) => setSimContext(e.target.value.replace(/\D/g, ""))}
              />
              <input
                className={`${inputCls} w-20`}
                placeholder={labels.simCost}
                inputMode="decimal"
                value={simCost}
                onChange={(e) => setSimCost(e.target.value.replace(/[^\d.]/g, ""))}
              />
            </div>
            <button
              type="button"
              disabled={simBusy}
              onClick={runSim}
              className="w-full rounded-input bg-surface-graphite px-2 py-1.5 text-body-s text-ink-primary transition duration-[var(--t-fast)] ease-refined hover:bg-surface-carbon disabled:opacity-50"
              data-testid="sim-run"
            >
              {labels.simRun}
            </button>
          </div>
          {sim && (
            <div className="mt-3 space-y-2" data-testid="sim-result">
              {sim.ok ? (
                <p className="text-body-s">
                  <span className="text-ink-secondary">{labels.simChosen}: </span>
                  <span className="font-data text-status-ok">{sim.model_id}</span>
                </p>
              ) : (
                <p className="text-body-s text-status-danger">
                  {labels.simRefused}: <span className="font-data">{sim.error}</span>
                </p>
              )}
              {(sim.considered?.length ?? 0) > 0 && (
                <div>
                  <p className="label-caps text-ink-muted">{labels.simEliminated}</p>
                  <ul className="mt-1 space-y-1">
                    {sim.considered?.map((c, i) => (
                      <li key={i} className="text-caption text-ink-secondary">
                        <span className="font-data text-ink-primary">{c.model_id}</span> — {c.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Panel>
      </div>
    </div>
    </div>
  );
}
