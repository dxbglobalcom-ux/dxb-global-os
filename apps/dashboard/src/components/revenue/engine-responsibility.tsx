"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { StatusBadge, type StatusLevel } from "@/components/primitives";

// Ledger 10d/10e — the portfolio responsibility view. One card per revenue
// engine: WHO works on it (owner department + its active employees) and WHICH
// model is responsible (brain distribution). Controls ride the audited doors:
// set-owner → /api/control/engines (control_engine_set_owner, CEO-only),
// change-model → /api/control/org assign_model_group (§4b regime: banned or
// testing models never reach the select — active catalog only).

export type EngineEmployee = { id: string; title: string; brain: string };

export type EngineCard = {
  slug: string;
  title: string;
  lifecycle: string;
  ownerDept: string | null;
  employees: EngineEmployee[];
};

export type ResponsibilityLabels = {
  owner: string;
  noOwner: string;
  setOwner: string;
  pickDept: string;
  employees: string;
  brains: string;
  showPeople: string;
  hidePeople: string;
  changeModel: string;
  pickModel: string;
  apply: string;
  working: string;
  applied: string;
  failed: string;
  noPeople: string;
  lifecycle: Record<string, string>;
};

const LIFECYCLE_LEVEL: Record<string, StatusLevel> = {
  candidate: "info",
  pilot: "warn",
  scale: "ok",
  sunset: "danger",
};

function BrainChips({ employees }: { employees: EngineEmployee[] }) {
  const dist = new Map<string, number>();
  for (const e of employees) dist.set(e.brain, (dist.get(e.brain) ?? 0) + 1);
  return (
    <span className="flex flex-wrap gap-1.5">
      {[...dist.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([brain, n]) => (
          <span
            key={brain}
            className="rounded-input border border-edge-neutral px-1.5 py-0.5 font-data text-caption text-ink-secondary tabular-nums"
          >
            {brain} ×{n}
          </span>
        ))}
    </span>
  );
}

function Card({
  engine,
  departments,
  models,
  labels,
}: {
  engine: EngineCard;
  departments: string[];
  models: string[];
  labels: ResponsibilityLabels;
}) {
  const router = useRouter();
  const [dept, setDept] = useState("");
  const [model, setModel] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [appliedModel, setAppliedModel] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const post = async (url: string, body: unknown) => {
    setBusy(true);
    setFailed(false);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // the org control seam requires an idempotency key per call
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify(body),
      });
      if (res.ok) router.refresh();
      else setFailed(true);
      return res.ok;
    } finally {
      setBusy(false);
    }
  };

  const selectCls =
    "rounded-input border border-edge-neutral bg-surface-graphite px-2 py-1 text-body-s text-ink-primary outline-none focus:border-edge-champagne";

  return (
    <li className="rounded-input border border-edge-neutral bg-surface-graphite p-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-body-s text-ink-primary">{engine.title}</span>
        <StatusBadge level={LIFECYCLE_LEVEL[engine.lifecycle] ?? "info"}>
          {labels.lifecycle[engine.lifecycle] ?? engine.lifecycle}
        </StatusBadge>
        {engine.ownerDept ? (
          <span className="text-body-s text-ink-secondary">
            {labels.owner}: <span className="text-ink-primary">{engine.ownerDept}</span>
          </span>
        ) : (
          <span className="flex items-center gap-2 text-body-s text-ink-muted">
            {labels.noOwner}
            <select
              className={selectCls}
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              aria-label={labels.pickDept}
            >
              <option value="">{labels.pickDept}</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <button
              type="button"
              data-testid={`set-owner-${engine.slug}`}
              disabled={!dept || busy}
              onClick={() =>
                post("/api/control/engines", {
                  op: "set_owner",
                  slug: engine.slug,
                  department: dept,
                })
              }
              className="rounded-input border border-edge-neutral px-2.5 py-1 text-body-s text-ink-primary transition duration-[var(--t-fast)] ease-refined enabled:hover:border-edge-champagne disabled:opacity-40"
            >
              {busy ? labels.working : labels.setOwner}
            </button>
          </span>
        )}
      </div>

      {engine.ownerDept && (
        <div className="mt-2 space-y-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-body-s text-ink-secondary">
            <span className="font-data tabular-nums">
              {engine.employees.length} {labels.employees}
            </span>
            {engine.employees.length > 0 ? (
              <>
                <span className="flex items-center gap-2">
                  {labels.brains}: <BrainChips employees={engine.employees} />
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(!open)}
                  className="text-accent-champagne transition duration-[var(--t-fast)] ease-refined hover:text-accent-ivory"
                >
                  {open ? labels.hidePeople : labels.showPeople}
                </button>
              </>
            ) : (
              <span className="text-ink-muted">{labels.noPeople}</span>
            )}
          </div>

          {open && engine.employees.length > 0 && (
            <ul className="grid grid-cols-1 gap-x-6 gap-y-1 md:grid-cols-2 2xl:grid-cols-3">
              {engine.employees.map((e) => (
                <li
                  key={e.id}
                  className="flex items-baseline justify-between gap-3 text-body-s"
                >
                  <span className="min-w-0 break-words text-ink-secondary">{e.title}</span>
                  <span className="whitespace-nowrap font-data text-caption text-ink-muted">
                    {e.brain}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {engine.employees.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-body-s text-ink-muted">
              {labels.changeModel}
              <select
                className={selectCls}
                value={model}
                onChange={(e) => setModel(e.target.value)}
                aria-label={labels.pickModel}
              >
                <option value="">{labels.pickModel}</option>
                {models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <button
                type="button"
                data-testid={`change-model-${engine.slug}`}
                disabled={!model || busy}
                onClick={async () => {
                  const ok = await post("/api/control/org", {
                    op: "assign_model_group",
                    modelId: model,
                    employeeIds: engine.employees.map((e) => e.id),
                    rationale: `Portfolio brain change: engine ${engine.slug}`,
                  });
                  if (ok) setAppliedModel(model);
                }}
                className="rounded-input border border-edge-neutral px-2.5 py-1 text-body-s text-ink-primary transition duration-[var(--t-fast)] ease-refined enabled:hover:border-edge-champagne disabled:opacity-40"
              >
                {busy
                  ? labels.working
                  : `${labels.apply} (${engine.employees.length})`}
              </button>
              {appliedModel && (
                <span className="text-status-ok">
                  {labels.applied}: {appliedModel}
                </span>
              )}
              {failed && <span className="text-status-danger">{labels.failed}</span>}
            </div>
          )}
        </div>
      )}
    </li>
  );
}

export function EngineResponsibility({
  engines,
  departments,
  models,
  labels,
}: {
  engines: EngineCard[];
  departments: string[];
  models: string[];
  labels: ResponsibilityLabels;
}) {
  return (
    <ul className="space-y-2">
      {engines.map((e) => (
        <Card
          key={e.slug}
          engine={e}
          departments={departments}
          models={models}
          labels={labels}
        />
      ))}
    </ul>
  );
}
