"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { StatusBadge, type StatusLevel } from "@/components/primitives";
import { subscribeDxb } from "@/lib/realtime";

// WorkflowCenter — /ops/workflows (E9.2, WORKFLOW_ENGINE_SPEC §7 + directive
// madde 6.4's 17 items). Left: workflow list. Right: definition editor
// (trigger, limits, risk, logging, output standard, step composer with
// per-kind config forms) + run history drill. EVERY mutation goes through
// /api/control/workflows (§8) — the CEO wall, B7b guard, versioning and
// snapshot freeze all live in control_workflow_action; this surface only
// composes payloads and shows fn verdicts verbatim. Liveness: ops:live
// Broadcast (run.* rows from the E9.1 trigger) → debounced server refetch.

export type WorkflowRowUi = {
  id: string;
  slug: string;
  name: string;
  trigger: { kind: string; cron?: string; match?: { type?: string; entity_kind?: string } };
  enabled: boolean;
  budget_eur: string | null;
  token_limit: number | null;
  timeout_s: number | null;
  risk: string;
  logging_level: string;
  output_standard: string | null;
  version: number;
};

export type StepRowUi = {
  workflow_id: string;
  seq: number;
  kind: string;
  config: Record<string, unknown>;
};

export type RunRowUi = {
  id: string;
  workflow_id: string;
  status: string;
  triggered_by: string;
  current_step: number | null;
  started_at: string;
  ended_at: string | null;
};

export type AgentRunUi = {
  id: string;
  workflow_run_id: string | null;
  status: string;
  model_id: string | null;
  employee_slug: string | null;
  started_at: string;
  tokens_in: number;
  tokens_out: number;
};

export type EmployeeOption = { id: string; slug: string; department: string };

export type WorkflowLabels = {
  newWorkflow: string;
  name: string;
  slug: string;
  enabled: string;
  disabled: string;
  version: string;
  risk: string;
  trigger: string;
  triggerCron: string;
  triggerEventType: string;
  triggerEventEntity: string;
  budget: string;
  tokenLimit: string;
  timeout: string;
  logging: string;
  outputStandard: string;
  outputStandardPh: string;
  steps: string;
  addStep: string;
  stepUp: string;
  stepDown: string;
  removeStep: string;
  employee: string;
  modelSlot: string;
  modelPin: string;
  modelPinNone: string;
  objective: string;
  outputContract: string;
  outboxAction: string;
  outboxActionPh: string;
  actionType: string;
  summary: string;
  criteria: string;
  minConfidence: string;
  onFail: string;
  maxAttempts: string;
  backoff: string;
  onExhaust: string;
  fallbackInfo: string;
  save: string;
  create: string;
  copy: string;
  enable: string;
  disable: string;
  runNow: string;
  cancelRun: string;
  resumeRun: string;
  saved: string;
  runQueued: string;
  runSkipped: string;
  drainHint: string;
  runHistory: string;
  runsEmpty: string;
  colStatus: string;
  colTrigger: string;
  colStarted: string;
  colEnded: string;
  colStep: string;
  agentRuns: string;
  agentRunsEmpty: string;
  liveLink: string;
  selectEmpty: string;
  listEmpty: string;
  unsaved: string;
  kinds: Record<string, string>;
  risks: Record<string, string>;
  loggingLevels: Record<string, string>;
  triggerKinds: Record<string, string>;
  statuses: Record<string, string>;
  onFailOptions: Record<string, string>;
  onExhaustOptions: Record<string, string>;
};

const RUN_BADGE: Record<string, StatusLevel> = {
  running: "info",
  waiting_approval: "warn",
  succeeded: "ok",
  failed: "danger",
  cancelled: "info",
};

const RISK_BADGE: Record<string, StatusLevel> = {
  low: "info",
  medium: "info",
  high: "warn",
  critical: "danger",
};

type EditableStep = {
  kind: string;
  config: Record<string, unknown>;
};

type Draft = {
  slug: string;
  name: string;
  triggerKind: string;
  triggerCron: string;
  eventType: string;
  eventEntity: string;
  budgetEur: string;
  tokenLimit: string;
  timeoutS: string;
  risk: string;
  loggingLevel: string;
  outputStandard: string;
  steps: EditableStep[];
};

function draftFrom(wf: WorkflowRowUi | null, steps: StepRowUi[]): Draft {
  return {
    slug: wf?.slug ?? "",
    name: wf?.name ?? "",
    triggerKind: wf?.trigger?.kind ?? "manual",
    triggerCron: wf?.trigger?.cron ?? "",
    eventType: wf?.trigger?.match?.type ?? "",
    eventEntity: wf?.trigger?.match?.entity_kind ?? "",
    budgetEur: wf?.budget_eur ?? "",
    tokenLimit: wf?.token_limit != null ? String(wf.token_limit) : "",
    timeoutS: wf?.timeout_s != null ? String(wf.timeout_s) : "",
    risk: wf?.risk ?? "low",
    loggingLevel: wf?.logging_level ?? "normal",
    outputStandard: wf?.output_standard ?? "",
    steps: steps
      .filter((s) => !wf || s.workflow_id === wf.id)
      .sort((a, b) => a.seq - b.seq)
      .map((s) => ({ kind: s.kind, config: { ...s.config } })),
  };
}

function defaultConfig(kind: string): Record<string, unknown> {
  switch (kind) {
    case "agent":
      return { employee_id: "", model_role_slot: "execution", objective: "", output_contract: "" };
    case "approval":
      return { action_type: "", risk_class: "high", summary: "" };
    case "review":
      return { employee_id: "", model_role_slot: "review", criteria: "", min_confidence: 0.6, on_fail: "escalate" };
    case "retry":
      return { max_attempts: 3, backoff_s: 0, on_exhaust: "fail" };
    case "fallback":
      return { alternate_steps: [] };
    default:
      return {};
  }
}

async function callWorkflowApi(body: Record<string, unknown>): Promise<
  { ok: true; data: Record<string, unknown> } | { ok: false; message: string }
> {
  const res = await fetch("/api/control/workflows", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as {
    ok: boolean;
    error?: string;
    detail?: string;
    [k: string]: unknown;
  };
  if (!data.ok) return { ok: false, message: data.detail ?? data.error ?? "request failed" };
  return { ok: true, data };
}

function fmtTime(iso: string | null, locale: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(locale === "tr" ? "tr-TR" : "en-GB", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const inputCls =
  "w-full rounded-input border border-edge-neutral bg-surface-graphite px-2 py-1 text-body-s text-ink-primary placeholder:text-ink-muted";
const selectCls =
  "rounded-input border border-edge-neutral bg-surface-graphite px-2 py-1 text-body-s text-ink-primary";
const btnCls =
  "rounded-input border border-edge-neutral px-3 py-1 text-body-s text-ink-secondary transition duration-[var(--t-fast)] ease-refined hover:text-ink-primary disabled:opacity-40";
const btnAccentCls =
  "rounded-input border border-edge-champagne px-3 py-1 text-body-s text-accent-champagne transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite disabled:opacity-40";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="label-caps text-ink-muted">{label}</span>
      {children}
    </label>
  );
}

export function WorkflowCenter({
  workflows,
  steps,
  runs,
  agentRuns,
  employees,
  slots,
  models,
  labels,
  locale,
}: {
  workflows: WorkflowRowUi[];
  steps: StepRowUi[];
  runs: RunRowUi[];
  agentRuns: AgentRunUi[];
  employees: EmployeeOption[];
  slots: string[];
  models: { id: string; display_name: string | null }[];
  labels: WorkflowLabels;
  locale: string;
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(workflows[0]?.id ?? null);
  const [creating, setCreating] = useState(workflows.length === 0);
  const selected = creating ? null : (workflows.find((w) => w.id === selectedId) ?? null);
  const [draft, setDraft] = useState<Draft>(() => draftFrom(selected, steps));
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openRun, setOpenRun] = useState<string | null>(null);

  // server refetch delivers new props (create/copy/update bump version or
  // change the step set) — resync the CLEAN draft to them; a dirty draft is
  // never overwritten under the CEO's hands.
  const syncKey = selected ? `${selected.id}:${selected.version}` : "new";
  const lastSync = useRef(syncKey);
  useEffect(() => {
    if (lastSync.current === syncKey) return;
    lastSync.current = syncKey;
    if (!dirty) setDraft(draftFrom(selected, steps));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncKey]);

  // ops:live run.* → debounced refetch (run history stays honest without a
  // client cache; E9.1 broadcast trigger is the producer).
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const unsubscribe = subscribeDxb("ops:live", () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      refreshTimer.current = setTimeout(() => router.refresh(), 800);
    });
    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      unsubscribe();
    };
  }, [router]);

  const pick = (id: string | null, asNew: boolean) => {
    setSelectedId(id);
    setCreating(asNew);
    const wf = asNew ? null : (workflows.find((w) => w.id === id) ?? null);
    setDraft(draftFrom(wf, steps));
    setDirty(false);
    setNotice(null);
    setError(null);
    setOpenRun(null);
  };

  const patch = (p: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...p }));
    setDirty(true);
  };

  const patchStep = (i: number, config: Record<string, unknown>) => {
    setDraft((d) => {
      const next = [...d.steps];
      next[i] = { ...next[i], config };
      return { ...d, steps: next };
    });
    setDirty(true);
  };

  const moveStep = (i: number, dir: -1 | 1) => {
    setDraft((d) => {
      const next = [...d.steps];
      const j = i + dir;
      if (j < 0 || j >= next.length) return d;
      [next[i], next[j]] = [next[j], next[i]];
      return { ...d, steps: next };
    });
    setDirty(true);
  };

  const removeStep = (i: number) => {
    setDraft((d) => ({ ...d, steps: d.steps.filter((_, k) => k !== i) }));
    setDirty(true);
  };

  const addStep = (kind: string) => {
    setDraft((d) => ({ ...d, steps: [...d.steps, { kind, config: defaultConfig(kind) }] }));
    setDirty(true);
  };

  const buildPayload = (): Record<string, unknown> => {
    const trigger: Record<string, unknown> = { kind: draft.triggerKind };
    if (draft.triggerKind === "cron") trigger.cron = draft.triggerCron;
    if (draft.triggerKind === "event") {
      trigger.match = {
        ...(draft.eventType ? { type: draft.eventType } : {}),
        ...(draft.eventEntity ? { entity_kind: draft.eventEntity } : {}),
      };
    }
    return {
      name: draft.name,
      trigger,
      steps: draft.steps.map((s) => ({ kind: s.kind, config: s.config })),
      ...(draft.budgetEur !== "" ? { budgetEur: Number(draft.budgetEur) } : {}),
      ...(draft.tokenLimit !== "" ? { tokenLimit: Number(draft.tokenLimit) } : {}),
      ...(draft.timeoutS !== "" ? { timeoutS: Number(draft.timeoutS) } : {}),
      risk: draft.risk,
      loggingLevel: draft.loggingLevel,
      ...(draft.outputStandard !== "" ? { outputStandard: draft.outputStandard } : {}),
    };
  };

  const act = async (body: Record<string, unknown>, okNotice: string) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    const res = await callWorkflowApi(body);
    setBusy(false);
    if (!res.ok) {
      setError(res.message);
      return null;
    }
    setNotice(okNotice);
    setDirty(false);
    router.refresh();
    return res.data;
  };

  const save = async () => {
    if (creating) {
      const data = await act(
        { action: "create", slug: draft.slug, ...buildPayload() },
        labels.saved,
      );
      if (data?.workflow_id) {
        setCreating(false);
        setSelectedId(String(data.workflow_id));
      }
    } else if (selected) {
      await act({ action: "update", slug: selected.slug, ...buildPayload() }, labels.saved);
    }
  };

  const runNow = async () => {
    if (!selected) return;
    const data = await act({ action: "run_now", slug: selected.slug }, labels.runQueued);
    if (data?.skipped) setNotice(`${labels.runSkipped}: ${String(data.reason)}`);
  };

  const wfRuns = useMemo(
    () =>
      selected
        ? runs
            .filter((r) => r.workflow_id === selected.id)
            .sort((a, b) => (a.started_at < b.started_at ? 1 : -1))
        : [],
    [runs, selected],
  );
  const runsByAgent = useMemo(() => {
    const m = new Map<string, AgentRunUi[]>();
    for (const ar of agentRuns) {
      if (!ar.workflow_run_id) continue;
      const list = m.get(ar.workflow_run_id) ?? [];
      list.push(ar);
      m.set(ar.workflow_run_id, list);
    }
    return m;
  }, [agentRuns]);

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      {/* ── workflow list ── */}
      <div className="space-y-2">
        <button
          type="button"
          className={`${btnAccentCls} w-full`}
          onClick={() => pick(null, true)}
          disabled={busy}
        >
          {labels.newWorkflow}
        </button>
        {workflows.length === 0 ? (
          <p className="py-6 text-center text-body-s text-ink-muted">{labels.listEmpty}</p>
        ) : (
          <ul className="space-y-1">
            {workflows.map((w) => (
              <li key={w.id}>
                <button
                  type="button"
                  onClick={() => pick(w.id, false)}
                  aria-current={!creating && selectedId === w.id}
                  className={`flex w-full flex-wrap items-center gap-2 rounded-panel border px-3 py-2 text-left transition duration-[var(--t-fast)] ease-refined ${
                    !creating && selectedId === w.id
                      ? "border-edge-champagne bg-surface-graphite"
                      : "border-edge-neutral bg-surface-obsidian hover:bg-surface-graphite"
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate text-body-s text-ink-primary">
                    {w.name}
                  </span>
                  <StatusBadge level={RISK_BADGE[w.risk] ?? "info"}>
                    {labels.risks[w.risk] ?? w.risk}
                  </StatusBadge>
                  {!w.enabled && (
                    <span className="label-caps text-ink-muted">{labels.disabled}</span>
                  )}
                  <span className="w-full truncate font-data text-caption text-ink-muted">
                    {w.slug} · v{w.version} · {labels.triggerKinds[w.trigger.kind] ?? w.trigger.kind}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── editor + run history ── */}
      {!creating && !selected ? (
        <p className="py-10 text-center text-body-s text-ink-muted">{labels.selectEmpty}</p>
      ) : (
        <div className="min-w-0 space-y-4">
          {/* header actions */}
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="w-full min-w-0 truncate font-display text-h3 text-ink-primary 2xl:w-auto 2xl:flex-1">
              {creating ? labels.newWorkflow : selected?.name}
              {!creating && selected && (
                <span className="ml-2 font-data text-body-s text-ink-muted">
                  v{selected.version}
                </span>
              )}
            </h2>
            {!creating && selected && (
              <>
                <button type="button" className={btnCls} disabled={busy} onClick={runNow}>
                  {labels.runNow}
                </button>
                <button
                  type="button"
                  className={btnCls}
                  disabled={busy}
                  onClick={() => act({ action: "copy", slug: selected.slug }, labels.saved)}
                >
                  {labels.copy}
                </button>
                <button
                  type="button"
                  className={btnCls}
                  disabled={busy}
                  onClick={() =>
                    act(
                      { action: selected.enabled ? "disable" : "enable", slug: selected.slug },
                      labels.saved,
                    )
                  }
                >
                  {selected.enabled ? labels.disable : labels.enable}
                </button>
              </>
            )}
            <button type="button" className={btnAccentCls} disabled={busy || !dirty} onClick={save}>
              {creating ? labels.create : labels.save}
            </button>
          </div>

          {(notice || error || dirty) && (
            <p
              className={`text-body-s ${error ? "text-status-danger" : notice ? "text-status-ok" : "text-ink-muted"}`}
              role={error ? "alert" : undefined}
            >
              {error ?? notice ?? labels.unsaved}
            </p>
          )}

          {/* definition — madde 6.4 items 5, 12-17 */}
          <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
            {creating && (
              <Field label={labels.slug}>
                <input
                  className={inputCls}
                  value={draft.slug}
                  onChange={(e) => patch({ slug: e.target.value })}
                  placeholder="my-workflow"
                />
              </Field>
            )}
            <Field label={labels.name}>
              <input
                className={inputCls}
                value={draft.name}
                onChange={(e) => patch({ name: e.target.value })}
              />
            </Field>
            <Field label={labels.trigger}>
              <select
                className={selectCls}
                value={draft.triggerKind}
                onChange={(e) => patch({ triggerKind: e.target.value })}
              >
                {Object.entries(labels.triggerKinds).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>
            {draft.triggerKind === "cron" && (
              <Field label={labels.triggerCron}>
                <input
                  className={inputCls}
                  value={draft.triggerCron}
                  onChange={(e) => patch({ triggerCron: e.target.value })}
                  placeholder="0 6 * * *"
                />
              </Field>
            )}
            {draft.triggerKind === "event" && (
              <>
                <Field label={labels.triggerEventType}>
                  <input
                    className={inputCls}
                    value={draft.eventType}
                    onChange={(e) => patch({ eventType: e.target.value })}
                    placeholder="approval.decided"
                  />
                </Field>
                <Field label={labels.triggerEventEntity}>
                  <input
                    className={inputCls}
                    value={draft.eventEntity}
                    onChange={(e) => patch({ eventEntity: e.target.value })}
                    placeholder="approval"
                  />
                </Field>
              </>
            )}
            <Field label={labels.budget}>
              <input
                className={inputCls}
                type="number"
                min="0"
                value={draft.budgetEur}
                onChange={(e) => patch({ budgetEur: e.target.value })}
                placeholder="10"
              />
            </Field>
            <Field label={labels.tokenLimit}>
              <input
                className={inputCls}
                type="number"
                min="1"
                value={draft.tokenLimit}
                onChange={(e) => patch({ tokenLimit: e.target.value })}
                placeholder="100000"
              />
            </Field>
            <Field label={labels.timeout}>
              <input
                className={inputCls}
                type="number"
                min="1"
                value={draft.timeoutS}
                onChange={(e) => patch({ timeoutS: e.target.value })}
                placeholder="3600"
              />
            </Field>
            <Field label={labels.risk}>
              <select
                className={selectCls}
                value={draft.risk}
                onChange={(e) => patch({ risk: e.target.value })}
              >
                {Object.entries(labels.risks).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={labels.logging}>
              <select
                className={selectCls}
                value={draft.loggingLevel}
                onChange={(e) => patch({ loggingLevel: e.target.value })}
              >
                {Object.entries(labels.loggingLevels).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={labels.outputStandard}>
              <input
                className={inputCls}
                value={draft.outputStandard}
                onChange={(e) => patch({ outputStandard: e.target.value })}
                placeholder={labels.outputStandardPh}
              />
            </Field>
          </div>

          {/* step composer — items 6-11 (§7 vertical composition) */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="label-caps text-ink-muted">{labels.steps}</span>
              <span className="ml-auto flex flex-wrap gap-1">
                {Object.entries(labels.kinds).map(([k, v]) => (
                  <button
                    key={k}
                    type="button"
                    className={btnCls}
                    disabled={busy}
                    onClick={() => addStep(k)}
                  >
                    + {v}
                  </button>
                ))}
              </span>
            </div>
            <ol className="space-y-2">
              {draft.steps.map((s, i) => (
                <li
                  key={i}
                  className="rounded-panel border border-edge-neutral bg-surface-obsidian p-3"
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="font-data text-body-s tabular-nums text-ink-muted">
                      {i + 1}
                    </span>
                    <StatusBadge level="info">{labels.kinds[s.kind] ?? s.kind}</StatusBadge>
                    <span className="ml-auto flex gap-1">
                      <button
                        type="button"
                        className={btnCls}
                        aria-label={labels.stepUp}
                        disabled={busy || i === 0}
                        onClick={() => moveStep(i, -1)}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className={btnCls}
                        aria-label={labels.stepDown}
                        disabled={busy || i === draft.steps.length - 1}
                        onClick={() => moveStep(i, 1)}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className={btnCls}
                        disabled={busy}
                        onClick={() => removeStep(i)}
                      >
                        {labels.removeStep}
                      </button>
                    </span>
                  </div>
                  <StepConfigForm
                    kind={s.kind}
                    config={s.config}
                    employees={employees}
                    slots={slots}
                    models={models}
                    labels={labels}
                    onChange={(c) => patchStep(i, c)}
                  />
                </li>
              ))}
            </ol>
          </div>

          {/* run history (§7) */}
          {!creating && selected && (
            <div className="space-y-2">
              <span className="label-caps text-ink-muted">{labels.runHistory}</span>
              {wfRuns.length === 0 ? (
                <p className="py-4 text-center text-body-s text-ink-muted">
                  {labels.runsEmpty} — {labels.drainHint}
                </p>
              ) : (
                <ul className="space-y-1">
                  {wfRuns.map((r) => (
                    <li
                      key={r.id}
                      className="rounded-panel border border-edge-neutral bg-surface-obsidian"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenRun(openRun === r.id ? null : r.id)}
                        aria-expanded={openRun === r.id}
                        className="flex w-full flex-wrap items-center gap-3 px-3 py-2 text-left transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite"
                      >
                        <StatusBadge level={RUN_BADGE[r.status] ?? "info"}>
                          {labels.statuses[r.status] ?? r.status}
                        </StatusBadge>
                        <span className="label-caps text-ink-muted">
                          {labels.colTrigger}: {r.triggered_by}
                        </span>
                        {r.current_step != null && (
                          <span className="font-data text-body-s tabular-nums text-ink-muted">
                            {labels.colStep} {r.current_step}
                          </span>
                        )}
                        <span className="ml-auto font-data text-body-s tabular-nums text-ink-muted">
                          {fmtTime(r.started_at, locale)} → {fmtTime(r.ended_at, locale)}
                        </span>
                      </button>
                      {openRun === r.id && (
                        <div className="space-y-2 border-t border-edge-neutral px-3 py-2">
                          <div className="flex flex-wrap gap-2">
                            {(r.status === "running" || r.status === "waiting_approval") && (
                              <button
                                type="button"
                                className={btnCls}
                                disabled={busy}
                                onClick={() =>
                                  act({ action: "cancel_run", runId: r.id }, labels.saved)
                                }
                              >
                                {labels.cancelRun}
                              </button>
                            )}
                            {r.status === "waiting_approval" && (
                              <button
                                type="button"
                                className={btnCls}
                                disabled={busy}
                                onClick={() =>
                                  act({ action: "resume_run", runId: r.id }, labels.saved)
                                }
                              >
                                {labels.resumeRun}
                              </button>
                            )}
                            <Link
                              href="/live"
                              className={`${btnCls} inline-block no-underline`}
                            >
                              {labels.liveLink}
                            </Link>
                          </div>
                          <span className="label-caps text-ink-muted">{labels.agentRuns}</span>
                          {(runsByAgent.get(r.id) ?? []).length === 0 ? (
                            <p className="text-body-s text-ink-muted">{labels.agentRunsEmpty}</p>
                          ) : (
                            <ul className="space-y-1">
                              {(runsByAgent.get(r.id) ?? []).map((ar) => (
                                <li
                                  key={ar.id}
                                  className="flex flex-wrap items-center gap-3 rounded-input bg-surface-graphite px-2 py-1"
                                >
                                  <StatusBadge level={RUN_BADGE[ar.status] ?? "info"}>
                                    {labels.statuses[ar.status] ?? ar.status}
                                  </StatusBadge>
                                  <span className="text-body-s text-ink-primary">
                                    {ar.employee_slug ?? "—"}
                                  </span>
                                  <span className="font-data text-body-s text-ink-muted">
                                    {ar.model_id ?? "—"}
                                  </span>
                                  <span className="ml-auto font-data text-body-s tabular-nums text-ink-muted">
                                    {ar.tokens_in + ar.tokens_out} tok ·{" "}
                                    {fmtTime(ar.started_at, locale)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Per-kind config form — §7 "Zod şemasından türetilmiş": fields mirror
// packages/shared/src/contracts/workflow-steps.ts one-to-one; the fn
// re-validates on write (UI narrows, the wall stays in the DB).
function StepConfigForm({
  kind,
  config,
  employees,
  slots,
  models,
  labels,
  onChange,
}: {
  kind: string;
  config: Record<string, unknown>;
  employees: EmployeeOption[];
  slots: string[];
  models: { id: string; display_name: string | null }[];
  labels: WorkflowLabels;
  onChange: (c: Record<string, unknown>) => void;
}) {
  const set = (k: string, v: unknown) => {
    const next = { ...config };
    if (v === "" || v === undefined) delete next[k];
    else next[k] = v;
    onChange(next);
  };
  const str = (k: string) => (typeof config[k] === "string" ? (config[k] as string) : "");
  const num = (k: string) => (typeof config[k] === "number" ? String(config[k]) : "");

  if (kind === "agent" || kind === "review") {
    return (
      <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
        <Field label={labels.employee}>
          <select
            className={selectCls}
            value={str("employee_id")}
            onChange={(e) => set("employee_id", e.target.value)}
          >
            <option value="">—</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.slug} · {emp.department}
              </option>
            ))}
          </select>
        </Field>
        <Field label={labels.modelSlot}>
          <select
            className={selectCls}
            value={str("model_role_slot")}
            onChange={(e) => set("model_role_slot", e.target.value)}
          >
            <option value="">—</option>
            {slots.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label={labels.modelPin}>
          <select
            className={selectCls}
            value={str("model_id")}
            onChange={(e) => set("model_id", e.target.value)}
          >
            <option value="">{labels.modelPinNone}</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.display_name ?? m.id}
              </option>
            ))}
          </select>
        </Field>
        {kind === "agent" ? (
          <>
            <Field label={labels.objective}>
              <input
                className={inputCls}
                value={str("objective")}
                onChange={(e) => set("objective", e.target.value)}
              />
            </Field>
            <Field label={labels.outputContract}>
              <input
                className={inputCls}
                value={str("output_contract")}
                onChange={(e) => set("output_contract", e.target.value)}
              />
            </Field>
            <Field label={labels.outboxAction}>
              <input
                className={inputCls}
                value={str("outbox_action")}
                onChange={(e) => set("outbox_action", e.target.value)}
                placeholder={labels.outboxActionPh}
              />
            </Field>
          </>
        ) : (
          <>
            <Field label={labels.criteria}>
              <input
                className={inputCls}
                value={str("criteria")}
                onChange={(e) => set("criteria", e.target.value)}
              />
            </Field>
            <Field label={labels.minConfidence}>
              <input
                className={inputCls}
                type="number"
                min="0"
                max="1"
                step="0.05"
                value={num("min_confidence")}
                onChange={(e) =>
                  set("min_confidence", e.target.value === "" ? "" : Number(e.target.value))
                }
              />
            </Field>
            <Field label={labels.onFail}>
              <select
                className={selectCls}
                value={str("on_fail") || "escalate"}
                onChange={(e) => set("on_fail", e.target.value)}
              >
                {Object.entries(labels.onFailOptions).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>
          </>
        )}
      </div>
    );
  }

  if (kind === "approval") {
    return (
      <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
        <Field label={labels.actionType}>
          <input
            className={inputCls}
            value={str("action_type")}
            onChange={(e) => set("action_type", e.target.value)}
            placeholder="payment.send"
          />
        </Field>
        <Field label={labels.risk}>
          <select
            className={selectCls}
            value={str("risk_class") || "high"}
            onChange={(e) => set("risk_class", e.target.value)}
          >
            {Object.entries(labels.risks).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </Field>
        <Field label={labels.summary}>
          <input
            className={inputCls}
            value={str("summary")}
            onChange={(e) => set("summary", e.target.value)}
          />
        </Field>
      </div>
    );
  }

  if (kind === "retry") {
    return (
      <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
        <Field label={labels.maxAttempts}>
          <input
            className={inputCls}
            type="number"
            min="1"
            max="10"
            value={num("max_attempts")}
            onChange={(e) =>
              set("max_attempts", e.target.value === "" ? "" : Number(e.target.value))
            }
          />
        </Field>
        <Field label={labels.backoff}>
          <input
            className={inputCls}
            type="number"
            min="0"
            max="3600"
            value={num("backoff_s")}
            onChange={(e) => set("backoff_s", e.target.value === "" ? "" : Number(e.target.value))}
          />
        </Field>
        <Field label={labels.onExhaust}>
          <select
            className={selectCls}
            value={str("on_exhaust") || "fail"}
            onChange={(e) => set("on_exhaust", e.target.value)}
          >
            {Object.entries(labels.onExhaustOptions).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </Field>
      </div>
    );
  }

  // fallback — alternate chain composed as JSON for now (recorded in ticket:
  // nested composer is a later polish; the Zod schema is the contract).
  return (
    <Field label={labels.fallbackInfo}>
      <textarea
        className={`${inputCls} min-h-20 font-data`}
        value={JSON.stringify(config.alternate_steps ?? [], null, 1)}
        onChange={(e) => {
          try {
            onChange({ ...config, alternate_steps: JSON.parse(e.target.value) });
          } catch {
            /* keep typing — invalid JSON simply not committed */
          }
        }}
      />
    </Field>
  );
}
