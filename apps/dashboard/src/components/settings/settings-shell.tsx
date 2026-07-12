"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Building2,
  Cpu,
  GitBranch,
  Lock,
  RotateCcw,
  Search,
  Settings2,
  UserPlus,
  Users,
  Workflow,
} from "lucide-react";
import { Panel, StatusBadge, type StatusLevel } from "@/components/primitives";
import { setSetting, undoSetting } from "@/lib/control/settings";
import type { Locale } from "@/lib/i18n";

// SettingsShell — E6.2 (SETTINGS_AND_CONTROL_SPEC §3, §5). Three panels:
// section navigation / searchable setting rows / Live Impact Preview.
// Every write rides the E6.1 seam (control_settings_set — idempotency,
// optimistic concurrency, audit + change_log in ONE transaction); undo is
// first-class (R4): the save toast and every history entry revert with one
// click, and the revert itself becomes a change_log row (history never
// shrinks). Locked keys (B7b) render a lock and no editor; delegated keys
// are read-only here — their owning seam is the single source of truth.
//
// Registered adaptation (visible, never silent — master-plan fidelity):
// §18 names 22 sections; the E6.1 registry seeded the 7 REAL categories
// below (89 keys). Rendering the other 15 as empty menus would be a §35
// fake-surface violation — they arrive WITH their subsystems (providers
// E7.1, budgets/cost keys with COST_CONTROL steps, security/backups P7).

export type SettingSchema = {
  type: string;
  default?: unknown;
  enum?: string[];
  minimum?: number;
  maximum?: number;
  allow_mechanical?: boolean;
};

export type SettingRowData = {
  key: string;
  category: string;
  schema: SettingSchema;
  risk: "low" | "medium" | "high" | "critical";
  requiresApproval: boolean;
  costImpact: string | null;
  affectedAreas: string[];
  locked: boolean;
  delegate: string | null;
  scopeTypes: string[];
  descriptionEn: string;
  descriptionTr: string;
};

export type SettingValueRow = { key: string; scope: string; value: unknown };

export type ChangeLogRow = {
  id: number;
  key: string;
  scope: string;
  oldValue: unknown;
  newValue: unknown;
  changedBy: string;
  changedAt: string;
  undoOf: number | null;
};

export type ScopeEntity = { id: string; label: string };

export type ModelOption = {
  id: string;
  displayName: string;
  mechanicalOnly: boolean;
};

export type SectionMeta = { slug: string; count: number };

export type SettingsLabels = {
  sections: Record<string, string>;
  searchPlaceholder: string;
  scopeGlobal: string;
  scopeDepartment: string;
  scopeEmployee: string;
  scopePickEntity: string;
  scopeBanner: string;
  hiddenAtScope: string;
  originScope: string;
  originGlobal: string;
  originDefault: string;
  riskLabel: string;
  risk: Record<string, string>;
  costLabel: string;
  cost: Record<string, string>;
  approvalBadge: string;
  lockedBadge: string;
  lockedReason: string;
  delegateBadge: string;
  delegateReason: string;
  save: string;
  saving: string;
  saved: string;
  noop: string;
  undo: string;
  undone: string;
  conflict: string;
  invalidJson: string;
  approvalCreated: string;
  viewApprovals: string;
  history: string;
  historyEmpty: string;
  revert: string;
  revertOf: string;
  impactTitle: string;
  impactAreas: string;
  impactSelect: string;
  impactChanges: string;
  impactNoChanges: string;
  boolOn: string;
  boolOff: string;
  entities: Record<string, string>;
  errorGeneric: string;
};

const SECTION_ICONS: Record<string, typeof Settings2> = {
  global_os: Settings2,
  models: Cpu,
  orchestrator: Workflow,
  departments: Building2,
  employees: Users,
  workflows: GitBranch,
  hr: UserPlus,
};

const RISK_LEVEL: Record<string, StatusLevel> = {
  low: "ok",
  medium: "info",
  high: "warn",
  critical: "critical",
};

// affected_areas tags that map to a COUNTED entity family. Tags without a
// live count render as plain chips — no invented numbers (§35).
const AREA_COUNT_KEY: Record<string, string> = {
  agents: "agents",
  all_agents: "agents",
  personas: "agents",
  department: "departments",
  org: "departments",
  all_workflows: "workflows",
  workflows: "workflows",
  tasks: "tasks",
  all_tasks: "tasks",
  approvals: "approvals",
};

type ScopeState = { cls: "global" | "department" | "employee"; id: string };
type Toast =
  | { kind: "saved"; key: string; changeId: number }
  | { kind: "noop"; key: string }
  | { kind: "undone"; key: string }
  | { kind: "approval"; key: string; approvalId: string }
  | { kind: "error"; key: string; detail: string };

function scopeString(scope: ScopeState): string {
  return scope.cls === "global" ? "global" : `${scope.cls}:${scope.id}`;
}

function fmtValue(value: unknown): string {
  if (value === undefined || value === null) return "—";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

export function SettingsShell({
  sections,
  section,
  rows,
  values,
  history,
  departments,
  employees,
  models,
  counts,
  labels,
  locale,
}: {
  sections: SectionMeta[];
  section: string;
  rows: SettingRowData[];
  values: SettingValueRow[];
  history: ChangeLogRow[];
  departments: ScopeEntity[];
  employees: ScopeEntity[];
  models: ModelOption[];
  counts: Record<string, number>;
  labels: SettingsLabels;
  locale: Locale;
}) {
  const router = useRouter();
  const [scope, setScope] = useState<ScopeState>({ cls: "global", id: "" });
  const [query, setQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [rowError, setRowError] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<Toast | null>(null);
  const [historyOpen, setHistoryOpen] = useState<string | null>(null);

  const valueMap = useMemo(() => {
    const map = new Map<string, unknown>();
    for (const v of values) map.set(`${v.key}|${v.scope}`, v.value);
    return map;
  }, [values]);

  const dirty = Object.keys(drafts).length > 0;

  function confirmLeave(): boolean {
    // Spec §10: leaving a section with unsaved drafts asks first.
    return !dirty || window.confirm(labels.conflict.split("—")[0].trim() + "?");
  }

  function gotoSection(slug: string) {
    if (slug === section || !confirmLeave()) return;
    router.push(`/sys/settings/${slug}`);
  }

  // Resolution chain (spec §4): scoped value → global value → registry
  // default. The origin is displayed on every row (wrong-scope edge).
  function resolve(row: SettingRowData): { value: unknown; origin: string } {
    const scoped = scope.cls !== "global" && scope.id
      ? valueMap.get(`${row.key}|${scopeString(scope)}`)
      : undefined;
    if (scoped !== undefined) return { value: scoped, origin: labels.originScope };
    const global = valueMap.get(`${row.key}|global`);
    if (global !== undefined) return { value: global, origin: labels.originGlobal };
    return { value: row.schema.default, origin: labels.originDefault };
  }

  const scopedRows = useMemo(
    () =>
      scope.cls === "global"
        ? rows
        : rows.filter((r) => r.scopeTypes.includes(scope.cls)),
    [rows, scope.cls],
  );
  const hiddenCount = rows.length - scopedRows.length;

  const visibleRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return scopedRows;
    return scopedRows.filter(
      (r) =>
        r.key.toLowerCase().includes(q) ||
        (locale === "tr" ? r.descriptionTr : r.descriptionEn)
          .toLowerCase()
          .includes(q),
    );
  }, [scopedRows, query, locale]);

  function parseDraft(row: SettingRowData, raw: string): { value?: unknown; error?: string } {
    const t = row.schema.type;
    if (t === "boolean") return { value: raw === "true" };
    if (t === "number" || t === "integer") {
      const n = Number(raw);
      if (raw.trim() === "" || Number.isNaN(n)) return { error: labels.errorGeneric };
      return { value: t === "integer" ? Math.trunc(n) : n };
    }
    if (t === "json" || t === "object") {
      try {
        return { value: JSON.parse(raw) };
      } catch {
        return { error: labels.invalidJson };
      }
    }
    return { value: raw }; // string | enum | model_ref | duration
  }

  async function save(row: SettingRowData) {
    const raw = drafts[row.key];
    if (raw === undefined) return;
    const parsed = parseDraft(row, raw);
    if (parsed.error) {
      setRowError((e) => ({ ...e, [row.key]: parsed.error! }));
      return;
    }
    setRowError(({ [row.key]: _drop, ...rest }) => rest);
    setBusyKey(row.key);
    try {
      const scopeStr = scopeString(scope);
      const existing = valueMap.get(`${row.key}|${scopeStr}`);
      const res = await setSetting({
        key: row.key,
        scope: scopeStr,
        value: parsed.value,
        // Optimistic concurrency only when a row exists at this scope —
        // the fn treats null as "no check" (first write has no version).
        expectedCurrent: existing,
        rationale: "CEO edit — settings UI (E6.2)",
      });
      if (res.ok && res.noop) {
        setToast({ kind: "noop", key: row.key });
        setDrafts(({ [row.key]: _d, ...rest }) => rest);
      } else if (res.ok && res.change_id) {
        setToast({ kind: "saved", key: row.key, changeId: res.change_id });
        setDrafts(({ [row.key]: _d, ...rest }) => rest);
        router.refresh();
      } else if (res.error === "APPROVAL_REQUIRED" && res.approval_id) {
        setToast({ kind: "approval", key: row.key, approvalId: res.approval_id });
        setDrafts(({ [row.key]: _d, ...rest }) => rest);
      } else if (res.error === "CONFLICT_STALE") {
        setRowError((e) => ({ ...e, [row.key]: labels.conflict }));
        router.refresh();
      } else {
        setRowError((e) => ({ ...e, [row.key]: res.detail ?? res.error ?? labels.errorGeneric }));
      }
    } finally {
      setBusyKey(null);
    }
  }

  async function undo(changeId: number, key: string) {
    setBusyKey(key);
    try {
      const res = await undoSetting({ changeId });
      if (res.ok) {
        setToast({ kind: "undone", key });
        router.refresh();
      } else {
        setToast({ kind: "error", key, detail: res.detail ?? res.error ?? "" });
      }
    } finally {
      setBusyKey(null);
    }
  }

  const selectedRow = rows.find((r) => r.key === selectedKey) ?? null;
  const selectedHistory = selectedRow
    ? history.filter((h) => h.key === selectedRow.key).slice(0, 5)
    : [];

  return (
    // Container query, not viewport breakpoint: the command canvas shares
    // the window with the side nav, intelligence rail and agent dock, so
    // only the CONTAINER width says whether three panels fit (34" ultrawide
    // → 3 columns; laptop canvas → stacked, zero overlap).
    <div className="@container">
    <div className="flex min-h-0 flex-col gap-4 @4xl:flex-row">
      {/* Panel 1 — section navigation (7 real categories, live key counts) */}
      <nav
        className="flex flex-row flex-wrap gap-1 @4xl:w-52 @4xl:shrink-0 @4xl:flex-col"
        data-testid="settings-sections"
      >
        {sections.map((s) => {
          const Icon = SECTION_ICONS[s.slug] ?? Settings2;
          const active = s.slug === section;
          return (
            <button
              key={s.slug}
              type="button"
              onClick={() => gotoSection(s.slug)}
              className={`flex items-center gap-2 rounded-input border px-3 py-2 text-left text-body-s transition duration-[var(--t-fast)] ease-refined @4xl:w-full ${
                active
                  ? "border-edge-champagne bg-surface-carbon text-accent-champagne"
                  : "border-transparent text-ink-secondary hover:bg-surface-carbon hover:text-ink-primary"
              }`}
            >
              <Icon size={14} strokeWidth={1.5} aria-hidden />
              <span className="min-w-0 flex-1 truncate">
                {labels.sections[s.slug] ?? s.slug}
              </span>
              <span className="font-data text-caption text-ink-muted tabular-nums">
                {s.count}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Panel 2 — setting rows (searchable; scope always visible) */}
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-input border border-edge-neutral bg-surface-carbon px-2.5 py-1.5">
            <Search size={13} strokeWidth={1.5} className="text-ink-muted" aria-hidden />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={labels.searchPlaceholder}
              data-testid="settings-search"
              className="w-48 bg-transparent text-body-s text-ink-primary outline-none placeholder:text-ink-muted"
            />
          </div>
          {/* ScopeSwitcher — the edited scope is visible AT ALL TIMES */}
          <div
            className="flex items-center gap-1 rounded-input border border-edge-neutral bg-surface-carbon p-1"
            data-testid="scope-switcher"
          >
            {(
              [
                ["global", labels.scopeGlobal],
                ["department", labels.scopeDepartment],
                ["employee", labels.scopeEmployee],
              ] as const
            ).map(([cls, label]) => (
              <button
                key={cls}
                type="button"
                onClick={() => confirmLeave() && setScope({ cls, id: "" })}
                aria-pressed={scope.cls === cls}
                className={`rounded-input px-2.5 py-1 text-body-s transition duration-[var(--t-fast)] ease-refined ${
                  scope.cls === cls
                    ? "bg-surface-graphite text-accent-champagne"
                    : "text-ink-secondary hover:text-ink-primary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {scope.cls !== "global" && (
            <select
              value={scope.id}
              onChange={(e) => setScope({ ...scope, id: e.target.value })}
              data-testid="scope-entity"
              className="rounded-input border border-edge-neutral bg-surface-carbon px-2 py-1.5 text-body-s text-ink-primary outline-none"
            >
              <option value="">{labels.scopePickEntity}</option>
              {(scope.cls === "department" ? departments : employees).map((e) => (
                <option key={e.id} value={e.id}>
                  {e.label}
                </option>
              ))}
            </select>
          )}
        </div>

        {scope.cls !== "global" && (
          <p className="label-caps rounded-input border border-edge-champagne/40 bg-surface-carbon px-3 py-1.5 text-accent-champagne">
            {labels.scopeBanner}{" "}
            <span className="font-data">{scopeString(scope) || scope.cls}</span>
            {hiddenCount > 0 && (
              <span className="ml-2 text-ink-muted">
                · {hiddenCount} {labels.hiddenAtScope}
              </span>
            )}
          </p>
        )}

        <div className="space-y-2" data-testid="settings-rows">
          {visibleRows.map((row) => {
            const { value, origin } = resolve(row);
            const draft = drafts[row.key];
            const isDirty = draft !== undefined;
            const editable =
              !row.locked &&
              !row.delegate &&
              (scope.cls === "global" || scope.id !== "");
            const desc = locale === "tr" ? row.descriptionTr : row.descriptionEn;
            const rowHistory = history.filter((h) => h.key === row.key);
            return (
              <Panel
                key={row.key}
                state={selectedKey === row.key ? "selected" : "default"}
                className="!p-4"
              >
                <button
                  type="button"
                  data-testid={`setting-row-${row.key}`}
                  onClick={() => setSelectedKey(row.key)}
                  className="block w-full text-left"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-data text-body-s text-ink-primary">
                      {row.key}
                    </span>
                    <StatusBadge level={RISK_LEVEL[row.risk] ?? "info"}>
                      {labels.riskLabel}: {labels.risk[row.risk] ?? row.risk}
                    </StatusBadge>
                    {row.costImpact && row.costImpact !== "none" && (
                      <StatusBadge level="warn">
                        {labels.costLabel}: {labels.cost[row.costImpact] ?? row.costImpact}
                      </StatusBadge>
                    )}
                    {row.requiresApproval && (
                      <StatusBadge level="danger">{labels.approvalBadge}</StatusBadge>
                    )}
                    {row.locked && (
                      <span className="inline-flex items-center gap-1 text-caption text-status-danger">
                        <Lock size={11} strokeWidth={1.5} aria-hidden />
                        {labels.lockedBadge}
                      </span>
                    )}
                    {row.delegate && (
                      <StatusBadge level="info">{labels.delegateBadge}</StatusBadge>
                    )}
                    <span className="ml-auto text-caption text-ink-muted">{origin}</span>
                  </div>
                  <p className="mt-1 text-body-s text-ink-secondary">{desc}</p>
                </button>

                {row.locked ? (
                  <p className="mt-2 text-body-s text-ink-muted">{labels.lockedReason}</p>
                ) : row.delegate ? (
                  <p className="mt-2 text-body-s text-ink-muted">
                    {labels.delegateReason}{" "}
                    <span className="font-data text-ink-secondary">{fmtValue(value)}</span>
                  </p>
                ) : (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Editor
                      row={row}
                      current={value}
                      draft={draft}
                      models={models}
                      labels={labels}
                      disabled={!editable || busyKey === row.key}
                      onChange={(raw) =>
                        setDrafts((d) => ({ ...d, [row.key]: raw }))
                      }
                    />
                    {isDirty && (
                      <button
                        type="button"
                        data-testid={`setting-save-${row.key}`}
                        onClick={() => void save(row)}
                        disabled={busyKey === row.key}
                        className="rounded-input border border-edge-champagne px-3 py-1 text-body-s text-accent-champagne transition duration-[var(--t-fast)] ease-refined hover:bg-surface-graphite disabled:opacity-50"
                      >
                        {busyKey === row.key ? labels.saving : labels.save}
                      </button>
                    )}
                    {rowHistory.length > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setHistoryOpen(historyOpen === row.key ? null : row.key)
                        }
                        className="ml-auto inline-flex items-center gap-1 text-caption text-ink-muted hover:text-ink-primary"
                      >
                        <RotateCcw size={11} strokeWidth={1.5} aria-hidden />
                        {labels.history} ({rowHistory.length})
                      </button>
                    )}
                  </div>
                )}
                {rowError[row.key] && (
                  <p className="mt-2 text-body-s text-status-danger" role="alert">
                    {rowError[row.key]}
                  </p>
                )}
                {historyOpen === row.key && (
                  <ul className="mt-3 space-y-1 border-t border-edge-neutral pt-2" data-testid={`history-${row.key}`}>
                    {rowHistory.slice(0, 5).map((h) => (
                      <li key={h.id} className="flex items-baseline gap-2 text-caption">
                        <span className="font-data text-ink-muted">
                          {new Date(h.changedAt).toLocaleString(locale)}
                        </span>
                        <span className="min-w-0 truncate text-ink-secondary">
                          {fmtValue(h.oldValue)} → {fmtValue(h.newValue)}
                        </span>
                        {h.undoOf && (
                          <span className="text-ink-muted">({labels.revertOf} #{h.undoOf})</span>
                        )}
                        <button
                          type="button"
                          onClick={() => void undo(h.id, row.key)}
                          disabled={busyKey === row.key}
                          className="ml-auto text-accent-champagne hover:text-accent-ivory disabled:opacity-50"
                        >
                          {labels.revert}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            );
          })}
        </div>
      </div>

      {/* Panel 3 — Live Impact Preview */}
      <aside className="w-full @4xl:w-72 @4xl:shrink-0" data-testid="impact-preview">
        <Panel title={labels.impactTitle}>
          {!selectedRow ? (
            <p className="text-body-s text-ink-muted">{labels.impactSelect}</p>
          ) : (
            <div className="space-y-4">
              <p className="font-data text-body-s text-ink-primary">{selectedRow.key}</p>
              <p className="text-body-s text-ink-secondary">
                {locale === "tr" ? selectedRow.descriptionTr : selectedRow.descriptionEn}
              </p>
              <div>
                <p className="label-caps mb-1 text-ink-muted">{labels.impactAreas}</p>
                <div className="flex flex-wrap gap-1.5" data-testid="impact-areas">
                  {selectedRow.affectedAreas.length === 0 ? (
                    <span className="text-body-s text-ink-muted">—</span>
                  ) : (
                    selectedRow.affectedAreas.map((area) => {
                      const countKey = AREA_COUNT_KEY[area];
                      const count = countKey ? counts[countKey] : undefined;
                      return (
                        <span
                          key={area}
                          className="rounded-input border border-edge-neutral bg-surface-graphite px-2 py-0.5 text-caption text-ink-secondary"
                        >
                          {labels.entities[area] ?? area}
                          {count !== undefined && (
                            <span className="ml-1 font-data text-accent-champagne tabular-nums">
                              {count}
                            </span>
                          )}
                        </span>
                      );
                    })
                  )}
                </div>
              </div>
              <div className="space-y-1 text-body-s">
                <p>
                  <span className="text-ink-muted">{labels.riskLabel}: </span>
                  <span className="text-ink-primary">
                    {labels.risk[selectedRow.risk] ?? selectedRow.risk}
                  </span>
                </p>
                <p>
                  <span className="text-ink-muted">{labels.costLabel}: </span>
                  <span className="text-ink-primary">
                    {labels.cost[selectedRow.costImpact ?? "none"] ??
                      selectedRow.costImpact ??
                      "—"}
                  </span>
                </p>
                {selectedRow.requiresApproval && (
                  <p className="text-status-danger">{labels.approvalBadge}</p>
                )}
              </div>
              <div>
                <p className="label-caps mb-1 text-ink-muted">{labels.impactChanges}</p>
                {selectedHistory.length === 0 ? (
                  <p className="text-body-s text-ink-muted">{labels.impactNoChanges}</p>
                ) : (
                  <ul className="space-y-1">
                    {selectedHistory.map((h) => (
                      <li key={h.id} className="text-caption text-ink-secondary">
                        <span className="font-data text-ink-muted">
                          {new Date(h.changedAt).toLocaleDateString(locale)}
                        </span>{" "}
                        {fmtValue(h.oldValue)} → {fmtValue(h.newValue)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </Panel>
      </aside>

      {/* Undo toast — one-click revert of the change just made (R4) */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-panel border border-edge-champagne bg-surface-obsidian px-4 py-3 shadow-e2"
          data-testid="settings-toast"
          role="status"
        >
          <span className="text-body-s text-ink-primary">
            {toast.kind === "saved" && `${labels.saved} — ${toast.key}`}
            {toast.kind === "noop" && `${labels.noop} — ${toast.key}`}
            {toast.kind === "undone" && `${labels.undone} — ${toast.key}`}
            {toast.kind === "approval" && `${labels.approvalCreated} — ${toast.key}`}
            {toast.kind === "error" && `${labels.errorGeneric}: ${toast.detail}`}
          </span>
          {toast.kind === "saved" && (
            <button
              type="button"
              data-testid="toast-undo"
              onClick={() => {
                void undo(toast.changeId, toast.key);
              }}
              className="rounded-input border border-edge-champagne px-2.5 py-1 text-body-s text-accent-champagne hover:bg-surface-carbon"
            >
              {labels.undo}
            </button>
          )}
          {toast.kind === "approval" && (
            <a
              href="/approvals?state=pending"
              className="text-body-s text-accent-champagne hover:text-accent-ivory"
            >
              {labels.viewApprovals}
            </a>
          )}
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="dismiss"
            className="text-ink-muted hover:text-ink-primary"
          >
            ×
          </button>
        </div>
      )}
    </div>
    </div>
  );
}

// Type-appropriate editor (spec §5 SettingRow). The draft is a STRING in
// component state; parseDraft converts on save so a half-typed JSON never
// crashes the row.
function Editor({
  row,
  current,
  draft,
  models,
  labels,
  disabled,
  onChange,
}: {
  row: SettingRowData;
  current: unknown;
  draft: string | undefined;
  models: ModelOption[];
  labels: SettingsLabels;
  disabled: boolean;
  onChange: (raw: string) => void;
}) {
  const t = row.schema.type;
  const base =
    "rounded-input border border-edge-neutral bg-surface-graphite px-2 py-1 text-body-s text-ink-primary outline-none focus:border-edge-champagne disabled:opacity-50";

  if (t === "boolean") {
    const effective = draft !== undefined ? draft === "true" : current === true;
    return (
      <div className="flex items-center gap-1" role="group">
        {[
          [true, labels.boolOn],
          [false, labels.boolOff],
        ].map(([v, label]) => (
          <button
            key={String(v)}
            type="button"
            disabled={disabled}
            aria-pressed={effective === v}
            data-testid={`bool-${row.key}-${v}`}
            onClick={() => onChange(String(v))}
            className={`rounded-input border px-2.5 py-1 text-body-s transition duration-[var(--t-fast)] ease-refined disabled:opacity-50 ${
              effective === v
                ? "border-edge-champagne bg-surface-graphite text-accent-champagne"
                : "border-edge-neutral text-ink-secondary hover:text-ink-primary"
            }`}
          >
            {label as string}
          </button>
        ))}
      </div>
    );
  }

  if (t === "enum" && row.schema.enum) {
    return (
      <select
        value={draft ?? (typeof current === "string" ? current : "")}
        disabled={disabled}
        data-testid={`editor-${row.key}`}
        onChange={(e) => onChange(e.target.value)}
        className={base}
      >
        {row.schema.enum.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (t === "model_ref") {
    // Value space comes from model_catalog (MODEL_ROUTING_SPEC); banned
    // models never reach the list, mechanical-only models appear only on
    // slots that allow them — same rule the fn enforces server-side.
    const options = models.filter(
      (m) => !m.mechanicalOnly || row.schema.allow_mechanical === true,
    );
    return (
      <select
        value={draft ?? (typeof current === "string" ? current : "")}
        disabled={disabled}
        data-testid={`editor-${row.key}`}
        onChange={(e) => onChange(e.target.value)}
        className={base}
      >
        {options.map((m) => (
          <option key={m.id} value={m.id}>
            {m.displayName}
          </option>
        ))}
      </select>
    );
  }

  if (t === "json" || t === "object") {
    return (
      <textarea
        value={draft ?? JSON.stringify(current ?? row.schema.default ?? null, null, 0)}
        disabled={disabled}
        rows={2}
        data-testid={`editor-${row.key}`}
        onChange={(e) => onChange(e.target.value)}
        className={`${base} min-w-64 flex-1 font-data`}
      />
    );
  }

  const inputType = t === "number" || t === "integer" ? "number" : "text";
  return (
    <input
      type={inputType}
      value={draft ?? (current === undefined || current === null ? "" : String(current))}
      disabled={disabled}
      min={row.schema.minimum}
      max={row.schema.maximum}
      data-testid={`editor-${row.key}`}
      onChange={(e) => onChange(e.target.value)}
      className={`${base} w-40`}
    />
  );
}
