"use client";

import { useEffect, useRef, useState } from "react";
import { Panel, StatusBadge, type StatusLevel } from "@/components/primitives";

// /ai/models catalog (E7.2 — MODEL_ROUTING_SPEC §5/§7/§19). One RSC pass of
// v_model_stats feeds the R3 meta table; the detail drawer lazy-loads
// assigned employees + recent routing decisions; the onboard drawer walks the
// §4c four-step chain (register → smoke → eval-first note → activate).
// Every number is real view output — no invented scores (§35): missing
// cost/quality render as em-dashes, never as fabricated values.

export type ModelStatsRow = {
  id: string;
  displayName: string | null;
  provider: string;
  contextWindow: number | null;
  costIn: number | null;
  costOut: number | null;
  speedScore: number | null;
  qualityScore: number | null;
  status: string;
  banned: boolean;
  mechanicalOnly: boolean;
  fallbackOf: string | null;
  runs30d: number;
  successRate30d: number | null;
  cost30dEur: number;
  activeRuns: number;
  assignedEmployees: number;
  slotAssignments: number;
};

export type ModelsLabels = {
  addModel: string;
  colModel: string;
  colProvider: string;
  colStatus: string;
  colContext: string;
  colCost: string;
  colSpeed: string;
  colQuality: string;
  colReliability: string;
  colRuns: string;
  colCost30d: string;
  colEmployees: string;
  colSlots: string;
  banned: string;
  mechanicalOnly: string;
  detailEmployees: string;
  detailEmployeesEmpty: string;
  detailDecisions: string;
  detailDecisionsEmpty: string;
  detailFallback: string;
  none: string;
  statusLabel: string;
  smokeTest: string;
  smokeRunning: string;
  smokeUnreachable: string;
  smokeFailed: string;
  activate: string;
  close: string;
  saved: string;
  onboardTitle: string;
  onboardIntro: string;
  stepRegister: string;
  stepSmoke: string;
  stepEval: string;
  stepActivate: string;
  formName: string;
  formApiKey: string;
  formApiKeyHint: string;
  formNote: string;
  submitAdd: string;
  addedTesting: string;
  evalNote: string;
  cancel: string;
  retiredShow: string;
  retiredHide: string;
  statuses: Record<string, string>;
  locale: string;
};

const STATUS_LEVEL: Record<string, StatusLevel> = {
  active: "ok",
  testing: "info",
  degraded: "warn",
  disabled: "warn",
  retired: "danger",
};

type DetailData = {
  employees: { slug: string; title: string | null; title_tr: string | null; department: string | null }[];
  decisions: { id: number; decision: string; rationale: string; outcome: string | null; created_at: string }[];
};

async function controlCall(body: Record<string, unknown>) {
  const res = await fetch("/api/control/models", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify(body),
  });
  return (await res.json()) as {
    ok: boolean;
    error?: string;
    detail?: string;
    latencyMs?: number;
    tokens?: number | null;
  };
}

function smokeMessage(
  r: { ok: boolean; error?: string; detail?: string; latencyMs?: number; tokens?: number | null },
  labels: { smokeUnreachable: string; smokeFailed: string },
): string {
  if (r.ok) return `OK — ${r.latencyMs} ms${r.tokens != null ? ` · ${r.tokens} token` : ""}`;
  if (r.error === "LITELLM_UNREACHABLE") return `${r.error} — ${labels.smokeUnreachable}`;
  return `${r.error} — ${labels.smokeFailed}`;
}

function fmt(n: number | null | undefined, digits = 0, locale = "en"): string {
  if (n === null || n === undefined) return "—";
  return n.toLocaleString(locale === "tr" ? "tr-TR" : "en-US", {
    maximumFractionDigits: digits,
  });
}

export function ModelsTable({
  models: initial,
  labels,
}: {
  models: ModelStatsRow[];
  labels: ModelsLabels;
}) {
  const [models, setModels] = useState(initial);
  const [selected, setSelected] = useState<ModelStatsRow | null>(null);
  const [detail, setDetail] = useState<DetailData | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [smoke, setSmoke] = useState<string | null>(null);
  const [onboardOpen, setOnboardOpen] = useState(false);
  // U20 (2026-07-25): retired rows stay in the catalog (cost/run history joins
  // on their id) but leave the default view — a retired generation is history,
  // not a choice the CEO is being offered. Progressive disclosure, not deletion.
  const [showRetired, setShowRetired] = useState(false);
  const detailReq = useRef(0);

  const retiredCount = models.filter((m) => m.status === "retired").length;
  const visibleModels = showRetired ? models : models.filter((m) => m.status !== "retired");

  useEffect(() => {
    if (!selected) {
      setDetail(null);
      return;
    }
    const req = ++detailReq.current;
    setDetail(null);
    fetch(`/api/ai/model-detail?id=${encodeURIComponent(selected.id)}`)
      .then((r) => r.json())
      .then((d: { ok: boolean } & DetailData) => {
        if (req === detailReq.current && d.ok) setDetail(d);
      })
      .catch(() => undefined);
  }, [selected]);

  async function setStatus(modelId: string, status: string) {
    setBusy(true);
    setNotice(null);
    try {
      const r = await controlCall({ op: "set_catalog_status", modelId, status });
      if (r.ok) {
        setModels((prev) => prev.map((m) => (m.id === modelId ? { ...m, status } : m)));
        setSelected((prev) => (prev && prev.id === modelId ? { ...prev, status } : prev));
        setNotice(labels.saved);
      } else {
        setNotice(`${r.error}${r.detail ? ` — ${r.detail}` : ""}`);
      }
    } finally {
      setBusy(false);
    }
  }

  async function runSmoke(modelId: string) {
    setSmoke(labels.smokeRunning);
    const r = await controlCall({ op: "test_model", modelId });
    setSmoke(smokeMessage(r, labels));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => setOnboardOpen(true)}
          className="rounded-input bg-accent-champagne px-3 py-1.5 text-body-s text-surface-obsidian"
          data-testid="add-model"
        >
          {labels.addModel}
        </button>
      </div>

      <div className="overflow-x-auto rounded-card border border-edge-neutral">
        <table className="w-full min-w-[56rem]">
          <thead>
            <tr className="border-b border-edge-neutral text-left">
              {[
                labels.colModel,
                labels.colProvider,
                labels.colStatus,
                labels.colReliability,
                labels.colRuns,
                labels.colCost30d,
                labels.colEmployees,
              ].map((h) => (
                <th key={h} className="label-caps whitespace-nowrap px-3 py-2 text-ink-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-edge-neutral">
            {visibleModels.map((m) => (
              <tr
                key={m.id}
                onClick={() => {
                  setSelected(m);
                  setSmoke(null);
                  setNotice(null);
                }}
                className={`cursor-pointer transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite ${
                  selected?.id === m.id ? "bg-surface-graphite" : ""
                }`}
                data-testid={`model-${m.id}`}
              >
                <td className="px-3 py-2">
                  <div className="text-body-s text-ink-primary">{m.displayName ?? m.id}</div>
                  <div className="font-data text-caption text-ink-muted">{m.id}</div>
                </td>
                <td className="px-3 py-2 text-body-s text-ink-secondary">{m.provider}</td>
                <td className="px-3 py-2">
                  <span className="flex flex-wrap items-center gap-1">
                    <StatusBadge level={STATUS_LEVEL[m.status] ?? "info"}>
                      {labels.statuses[m.status] ?? m.status}
                    </StatusBadge>
                    {m.banned && <StatusBadge level="danger">{labels.banned}</StatusBadge>}
                    {m.mechanicalOnly && (
                      <StatusBadge level="info">{labels.mechanicalOnly}</StatusBadge>
                    )}
                  </span>
                </td>
                <td className="px-3 py-2 font-data text-body-s tabular-nums text-ink-secondary">
                  {m.successRate30d === null ? "" : `${Math.round(m.successRate30d * 100)}%`}
                </td>
                <td className="px-3 py-2 font-data text-body-s tabular-nums text-ink-secondary">
                  {m.runs30d > 0 ? fmt(m.runs30d, 0, labels.locale) : ""}
                </td>
                <td className="px-3 py-2 font-data text-body-s tabular-nums text-ink-secondary">
                  {m.cost30dEur > 0 ? `€${fmt(m.cost30dEur, 2, labels.locale)}` : ""}
                </td>
                <td className="px-3 py-2 font-data text-body-s tabular-nums text-ink-secondary">
                  {fmt(m.assignedEmployees, 0, labels.locale)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {retiredCount > 0 && (
        <button
          type="button"
          onClick={() => setShowRetired((v) => !v)}
          className="text-caption text-ink-muted underline-offset-2 transition duration-[var(--t-fast)] ease-refined hover:text-ink-secondary hover:underline"
          data-testid="toggle-retired"
        >
          {showRetired
            ? labels.retiredHide
            : labels.retiredShow.replace("{n}", String(retiredCount))}
        </button>
      )}

      {selected && (
        <Panel title={selected.displayName ?? selected.id}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-body-s text-ink-secondary">{labels.statusLabel}</span>
                <select
                  className="rounded-input border border-edge-neutral bg-surface-graphite px-2 py-1 text-body-s text-ink-primary"
                  value={selected.status}
                  disabled={busy}
                  onChange={(e) => setStatus(selected.id, e.target.value)}
                  aria-label={labels.statusLabel}
                >
                  {["active", "testing", "degraded", "disabled", "retired"].map((s) => (
                    <option key={s} value={s}>
                      {labels.statuses[s] ?? s}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => runSmoke(selected.id)}
                  className="rounded-input border border-edge-neutral px-2 py-1 text-body-s text-ink-secondary hover:border-edge-champagne hover:text-ink-primary"
                  data-testid="smoke-test"
                >
                  {labels.smokeTest}
                </button>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="ml-auto rounded-input border border-edge-neutral px-2 py-1 text-body-s text-ink-secondary"
                >
                  {labels.close}
                </button>
              </div>
              {smoke && (
                <p className="font-data text-caption text-ink-secondary" role="status">
                  {smoke}
                </p>
              )}
              {notice && (
                <p className="text-caption text-ink-secondary" role="status">
                  {notice}
                </p>
              )}
              <p className="text-body-s">
                <span className="text-ink-secondary">{labels.detailFallback}: </span>
                <span className="font-data text-ink-primary">
                  {selected.fallbackOf ?? labels.none}
                </span>
              </p>
              <div>
                <p className="label-caps text-ink-muted">{labels.detailEmployees}</p>
                {detail === null ? (
                  <p className="mt-1 text-caption text-ink-muted">—</p>
                ) : detail.employees.length === 0 ? (
                  <p className="mt-1 text-body-s text-ink-secondary">
                    {labels.detailEmployeesEmpty}
                  </p>
                ) : (
                  <ul className="mt-1 space-y-1">
                    {detail.employees.map((e) => (
                      <li key={e.slug} className="text-body-s text-ink-primary">
                        {labels.locale === "tr" && e.title_tr ? e.title_tr : (e.title ?? e.slug)}
                        <span className="ml-2 font-data text-caption text-ink-muted">
                          {e.department}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div>
              <p className="label-caps text-ink-muted">{labels.detailDecisions}</p>
              {detail === null ? (
                <p className="mt-1 text-caption text-ink-muted">—</p>
              ) : detail.decisions.length === 0 ? (
                <p className="mt-1 text-body-s text-ink-secondary">
                  {labels.detailDecisionsEmpty}
                </p>
              ) : (
                <ul className="mt-1 space-y-2">
                  {detail.decisions
                    .filter((d) => !/\btest[:\s]/i.test(d.rationale ?? ""))
                    .map((d) => (
                    <li key={d.id} className="text-caption text-ink-secondary">
                      <span className="font-data text-ink-muted">
                        {new Date(d.created_at).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                          hourCycle: "h23",
                        })}
                      </span>{" "}
                      <span className="text-ink-primary">{d.decision}</span> — {d.rationale}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Panel>
      )}

      {onboardOpen && (
        <OnboardDrawer
          labels={labels}
          onClose={() => setOnboardOpen(false)}
          onAdded={(row) => setModels((prev) => [...prev, row])}
          onActivated={(id) =>
            setModels((prev) => prev.map((m) => (m.id === id ? { ...m, status: "active" } : m)))
          }
        />
      )}
    </div>
  );
}

// §4c four-step onboarding. The row is born testing (step 1) and only step 4
// moves it into the assignable pool; a failed/unreachable smoke keeps it in
// testing with the honest state on screen.
function OnboardDrawer({
  labels,
  onClose,
  onAdded,
  onActivated,
}: {
  labels: ModelsLabels;
  onClose: () => void;
  onAdded: (row: ModelStatsRow) => void;
  onActivated: (id: string) => void;
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    displayName: "",
    apiKey: "",
    note: "",
    id: "",
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [smoke, setSmoke] = useState<string | null>(null);

  const steps = [labels.stepRegister, labels.stepSmoke, labels.stepEval, labels.stepActivate];
  const inputCls =
    "w-full rounded-input border border-edge-neutral bg-surface-graphite px-2 py-1 text-body-s text-ink-primary";

  async function register() {
    setBusy(true);
    setMsg(null);
    // C12 (CEO order): adding a model needs a NAME and a KEY, nothing else —
    // id derives from the name; routing/provider wiring is the orchestrator's
    // job, not a CEO form field.
    const derivedId = form.displayName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, "-")
      .replace(/^-+|-+$/g, "");
    try {
      const r = await controlCall({
        op: "add_model",
        id: derivedId,
        provider: "custom",
        displayName: form.displayName.trim(),
      });
      if (r.ok && form.apiKey.trim()) {
        // Key never touches the database — vault seam only (chmod-600 file
        // outside the repo, A8 vault rule).
        await fetch("/api/control/model-key", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ modelId: derivedId, apiKey: form.apiKey.trim(), note: form.note.trim() || undefined }),
        });
      }
      if (r.ok) {
        setForm((f) => ({ ...f, id: derivedId }));
        onAdded({
          id: derivedId,
          displayName: form.displayName.trim(),
          provider: "custom",
          contextWindow: null,
          costIn: null,
          costOut: null,
          speedScore: null,
          qualityScore: null,
          status: "testing",
          banned: false,
          mechanicalOnly: false,
          fallbackOf: null,
          runs30d: 0,
          successRate30d: null,
          cost30dEur: 0,
          activeRuns: 0,
          assignedEmployees: 0,
          slotAssignments: 0,
        });
        setMsg(labels.addedTesting);
        setStep(2);
      } else {
        setMsg(`${r.error}${r.detail ? ` — ${r.detail}` : ""}`);
      }
    } finally {
      setBusy(false);
    }
  }

  async function runSmoke() {
    setBusy(true);
    setSmoke(labels.smokeRunning);
    try {
      const r = await controlCall({ op: "test_model", modelId: form.id.trim() });
      setSmoke(smokeMessage(r, labels));
    } finally {
      setBusy(false);
    }
  }

  async function activate() {
    setBusy(true);
    setMsg(null);
    try {
      const r = await controlCall({
        op: "set_catalog_status",
        modelId: form.id.trim(),
        status: "active",
      });
      if (r.ok) {
        onActivated(form.id.trim());
        setMsg(labels.saved);
        onClose();
      } else {
        setMsg(`${r.error}${r.detail ? ` — ${r.detail}` : ""}`);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-end bg-surface-obsidian/60"
      role="dialog"
      aria-label={labels.onboardTitle}
    >
      <div className="nav-scroll h-full w-full max-w-md overflow-y-auto border-l border-edge-neutral bg-surface-carbon p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-h3 text-ink-primary">{labels.onboardTitle}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-input border border-edge-neutral px-2 py-1 text-body-s text-ink-secondary"
          >
            {labels.close}
          </button>
        </div>
        <p className="mb-4 text-caption text-ink-muted">{labels.onboardIntro}</p>

        <ol className="mb-5 flex flex-wrap gap-2">
          {steps.map((s, i) => (
            <li key={s} className="flex items-center gap-1">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full font-data text-caption ${
                  step > i + 1
                    ? "bg-status-ok text-surface-obsidian"
                    : step === i + 1
                      ? "bg-accent-champagne text-surface-obsidian"
                      : "bg-surface-graphite text-ink-muted"
                }`}
              >
                {i + 1}
              </span>
              <span
                className={`text-caption ${step === i + 1 ? "text-ink-primary" : "text-ink-muted"}`}
              >
                {s}
              </span>
            </li>
          ))}
        </ol>

        {step === 1 && (
          <div className="space-y-2">
            <label className="block">
              <span className="label-caps text-ink-muted">{labels.formName}</span>
              <input
                className={`${inputCls} mt-1`}
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="label-caps text-ink-muted">{labels.formApiKey}</span>
              <input
                type="password"
                autoComplete="off"
                className={`${inputCls} mt-1`}
                value={form.apiKey}
                onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))}
              />
              <span className="mt-1 block text-caption text-ink-muted">{labels.formApiKeyHint}</span>
            </label>
            <label className="block">
              <span className="label-caps text-ink-muted">{labels.formNote}</span>
              <input
                className={`${inputCls} mt-1`}
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              />
            </label>
            <button
              type="button"
              disabled={busy || !form.displayName.trim()}
              onClick={register}
              className="mt-2 w-full rounded-input bg-accent-champagne px-3 py-1.5 text-body-s text-surface-obsidian disabled:opacity-50"
              data-testid="onboard-register"
            >
              {labels.submitAdd}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <button
              type="button"
              disabled={busy}
              onClick={runSmoke}
              className="w-full rounded-input bg-surface-graphite px-3 py-1.5 text-body-s text-ink-primary hover:bg-surface-obsidian disabled:opacity-50"
              data-testid="onboard-smoke"
            >
              {labels.smokeTest}
            </button>
            {smoke && (
              <p className="font-data text-caption text-ink-secondary" role="status">
                {smoke}
              </p>
            )}
            <button
              type="button"
              onClick={() => setStep(3)}
              className="w-full rounded-input border border-edge-neutral px-3 py-1.5 text-body-s text-ink-secondary"
            >
              {steps[2]} →
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <p className="text-body-s text-ink-secondary">{labels.evalNote}</p>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="w-full rounded-input border border-edge-neutral px-3 py-1.5 text-body-s text-ink-secondary"
            >
              {steps[3]} →
            </button>
          </div>
        )}

        {step === 4 && (
          <button
            type="button"
            disabled={busy}
            onClick={activate}
            className="w-full rounded-input bg-accent-champagne px-3 py-1.5 text-body-s text-surface-obsidian disabled:opacity-50"
            data-testid="onboard-activate"
          >
            {labels.activate}
          </button>
        )}

        {msg && (
          <p className="mt-3 text-caption text-ink-secondary" role="status">
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}
