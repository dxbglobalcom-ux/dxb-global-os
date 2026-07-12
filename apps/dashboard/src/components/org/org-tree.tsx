"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  Cpu,
  Landmark,
  User,
  Users,
} from "lucide-react";
import { Panel, StatusBadge, type StatusLevel } from "@/components/primitives";
import type { Locale } from "@/lib/i18n";

// OrgTree — E6.3 v1 (ORGANIZATION_ENGINE_SPEC §7, read-only slice of the
// roadmap line "read-only graph → sonra drag-drop"). Hierarchical collapse
// tree over v_org_graph: company → departments (nested by parent_id) →
// employees (nested by manager chain). Departments start collapsed with
// honest live counts; a node click fills the detail panel (v1 field set —
// the full madde 5.3 drawer + 7 overlay modes + drag-drop land with graph
// v2, where the ⛔ graph-library decision is taken).
//
// No graph library in v1 — a DOM tree needs no bundle-weight decision, and
// the ⛔ stays open for the interactive version (recorded boundary).

export type OrgNode = {
  nodeId: string;
  kind: "company" | "department" | "employee";
  label: string;
  roleLevel: string | null;
  parentNodeId: string | null;
  status: string;
  department: string | null;
  model: string | null;
  directorSlug: string | null;
  slug: string | null;
};

export type OrgLabels = {
  title: string;
  subtitle: string;
  employees: string;
  detailTitle: string;
  detailSelect: string;
  kind: Record<string, string>;
  roleLevel: Record<string, string>;
  statusLabel: string;
  status: Record<string, string>;
  departmentLabel: string;
  managerLabel: string;
  modelLabel: string;
  reportsLabel: string;
  noManager: string;
  openEmployees: string;
  directorLabel: string;
  headcountLabel: string;
  activeShort: string;
  deptDormantHint: string;
  idLabel: string;
  detailLoading: string;
  detailError: string;
  governanceTitle: string;
  personaLabel: string;
  personaGate: Record<string, string>;
  personaBy: string;
  personaRead: string;
  personaHide: string;
  recordLabel: string;
  recordNone: string;
  kpisLabel: string;
  runtimeTitle: string;
  autonomyLabel: string;
  mcpLabel: string;
  tasksLabel: string;
  runsLabel: string;
  costLabel: string;
  memoryLabel: string;
  skillsLabel: string;
  grantsLabel: string;
  phase7Hint: string;
};

// madde 5.3 field set served by v_org_node_detail (spec §12) — fetched per
// selected employee; the persona body stays lazy behind ?include=persona.
type NodeDetail = {
  employee_id: string;
  slug: string;
  title: string;
  title_tr: string | null;
  role_level: string | null;
  employment_status: string;
  department_slug: string;
  department_name: string;
  manager_id: string | null;
  manager_slug: string | null;
  manager_title: string | null;
  manager_title_tr: string | null;
  direct_reports: number;
  brain: string;
  model_status: string | null;
  autonomy_level: number;
  mcp_profile: string;
  persona_id: string | null;
  persona_version: number | null;
  persona_gate: string | null;
  persona_author: string | null;
  persona_updated_at: string | null;
  has_employee_record: boolean;
  kpi_count: number;
  cost_30d_eur: number;
  active_tasks: number;
  active_runs: number;
  skills: unknown[];
  grants_count: number;
  memory_count: number;
};

// Holding chart order (professional grouping, CEO eye-test wave 3):
// Leadership → Corporate functions → Revenue side → Product & Technology.
// Presentation-only — reporting lines and department rows stay canonical.
const DEPT_ORDER: Record<string, number> = {
  ceo: 0,
  strategy: 10,
  finance: 11,
  legal: 12,
  "risk-audit": 13,
  "people-hr": 14,
  sales: 20,
  revops: 21,
  marketing: 22,
  "paid-media": 23,
  "social-media": 24,
  commerce: 25,
  "customer-success": 26,
  product: 30,
  design: 31,
  engineering: 32,
  "data-ai": 33,
  platform: 34,
  security: 35,
  quality: 36,
  "project-management": 37,
};

function deptRank(n: OrgNode): number {
  return DEPT_ORDER[n.slug ?? ""] ?? 99;
}

const STATUS_LEVEL: Record<string, StatusLevel> = {
  active: "ok",
  probation: "info",
  dormant: "warn",
  draft: "warn",
  suspended: "danger",
  archived: "critical",
};

function statusLevel(status: string): StatusLevel {
  return STATUS_LEVEL[status] ?? "info";
}

export function OrgTree({
  nodes,
  labels,
  locale,
}: {
  nodes: OrgNode[];
  labels: OrgLabels;
  locale: Locale;
}) {
  const byParent = useMemo(() => {
    const map = new Map<string | null, OrgNode[]>();
    for (const n of nodes) {
      const list = map.get(n.parentNodeId) ?? [];
      list.push(n);
      map.set(n.parentNodeId, list);
    }
    // Directors first inside a level, then seniors, then the rest by label.
    const rank: Record<string, number> = {
      orchestrator: 0,
      director: 1,
      senior_specialist: 2,
      specialist: 3,
      ops_agent: 4,
    };
    for (const list of map.values()) {
      list.sort((a, b) => {
        // Departments follow the holding chart order; employees come before
        // sub-departments and rank director → senior → specialist inside.
        if (a.kind === "department" && b.kind === "department")
          return deptRank(a) - deptRank(b) || a.label.localeCompare(b.label);
        if (a.kind !== b.kind && (a.kind === "department" || b.kind === "department"))
          return a.kind === "department" ? 1 : -1;
        return (
          (rank[a.roleLevel ?? ""] ?? 9) - (rank[b.roleLevel ?? ""] ?? 9) ||
          a.label.localeCompare(b.label)
        );
      });
    }
    return map;
  }, [nodes]);

  const byId = useMemo(() => new Map(nodes.map((n) => [n.nodeId, n])), [nodes]);

  // Live employee headcounts per department (honest counts, §35) —
  // total and active tracked separately so the detail panel can explain
  // a dormant department instead of leaving the badge unexplained.
  const deptCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const n of nodes) {
      if (n.kind === "employee" && n.department) {
        counts.set(n.department, (counts.get(n.department) ?? 0) + 1);
      }
    }
    return counts;
  }, [nodes]);

  const deptActiveCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const n of nodes) {
      if (n.kind === "employee" && n.department && n.status === "active") {
        counts.set(n.department, (counts.get(n.department) ?? 0) + 1);
      }
    }
    return counts;
  }, [nodes]);

  const [open, setOpen] = useState<Set<string>>(
    // Fully expanded by default (CEO eye-test verdict 2026-07-13: the whole
    // workforce must be visible by scrolling, no click-hunting). Chevrons
    // still collapse any branch.
    () => new Set(nodes.map((n) => n.nodeId)),
  );
  const [selected, setSelected] = useState<OrgNode | null>(null);
  const [detail, setDetail] = useState<NodeDetail | null>(null);
  const [detailState, setDetailState] = useState<"idle" | "loading" | "error">("idle");
  const [personaBody, setPersonaBody] = useState<string | null>(null);
  const [personaOpen, setPersonaOpen] = useState(false);

  // madde 5.3 set arrives per selection from /api/org/node (spec §12 view);
  // stale responses are dropped when the selection has already moved on.
  useEffect(() => {
    setDetail(null);
    setPersonaBody(null);
    setPersonaOpen(false);
    if (selected?.kind !== "employee") {
      setDetailState("idle");
      return;
    }
    let stale = false;
    setDetailState("loading");
    fetch(`/api/org/node?id=${selected.nodeId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json) => {
        if (stale) return;
        setDetail(json.detail as NodeDetail);
        setDetailState("idle");
      })
      .catch(() => {
        if (!stale) setDetailState("error");
      });
    return () => {
      stale = true;
    };
  }, [selected]);

  async function togglePersona() {
    if (personaOpen) {
      setPersonaOpen(false);
      return;
    }
    setPersonaOpen(true);
    if (personaBody || selected?.kind !== "employee") return;
    try {
      const r = await fetch(`/api/org/node?id=${selected.nodeId}&include=persona`);
      const json = await r.json();
      setPersonaBody(json.personaBody ?? "");
    } catch {
      setPersonaBody("");
    }
  }

  function toggle(id: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function NodeRow({ node, depth }: { node: OrgNode; depth: number }) {
    const children = byParent.get(node.nodeId) ?? [];
    const expanded = open.has(node.nodeId);
    const Icon =
      node.kind === "company" ? Landmark : node.kind === "department" ? Building2 : User;
    const count =
      node.kind === "department" ? (deptCounts.get(node.department ?? "") ?? 0) : null;
    return (
      <div>
        <div
          className={`flex items-center gap-1.5 rounded-input py-1 pr-2 transition duration-[var(--t-fast)] ease-refined hover:bg-surface-carbon ${
            selected?.nodeId === node.nodeId
              ? "border-l-2 border-l-accent-champagne bg-surface-carbon"
              : "border-l-2 border-l-transparent"
          }`}
          style={{ paddingLeft: `${depth * 16 + 6}px` }}
        >
          {children.length > 0 ? (
            <button
              type="button"
              onClick={() => toggle(node.nodeId)}
              aria-expanded={expanded}
              aria-label={node.label}
              data-testid={`org-toggle-${node.nodeId}`}
              className="text-ink-muted hover:text-ink-primary"
            >
              {expanded ? (
                <ChevronDown size={13} strokeWidth={1.5} aria-hidden />
              ) : (
                <ChevronRight size={13} strokeWidth={1.5} aria-hidden />
              )}
            </button>
          ) : (
            <span className="w-[13px]" aria-hidden />
          )}
          <button
            type="button"
            data-testid={`org-node-${node.nodeId}`}
            onClick={() => setSelected(node)}
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
          >
            <Icon
              size={13}
              strokeWidth={1.5}
              className={
                node.kind === "employee" ? "text-ink-muted" : "text-accent-brushed"
              }
              aria-hidden
            />
            <span
              className={`min-w-0 truncate text-body-s ${
                node.kind !== "employee"
                  ? "text-ink-primary"
                  : node.status === "dormant"
                    ? "text-ink-muted"
                    : "text-ink-secondary"
              }`}
            >
              {node.label}
            </span>
            {node.roleLevel === "director" && (
              <span className="label-caps text-caption text-accent-champagne">
                {labels.roleLevel.director}
              </span>
            )}
            {count !== null && (
              <span className="ml-auto flex items-center gap-1 font-data text-caption text-ink-muted tabular-nums">
                <Users size={11} strokeWidth={1.5} aria-hidden />
                {count}
              </span>
            )}
            {/* Badge diet (eye-test wave 3): dormant is the pre-launch default
                for the whole workforce — a badge on every row reads as a fault
                wall. Dormant shows as muted text only; the badge is reserved
                for exceptional states (draft, probation, suspended). */}
            {node.kind === "employee" &&
              node.status !== "active" &&
              node.status !== "dormant" && (
                <span className="ml-auto">
                  <StatusBadge level={statusLevel(node.status)}>
                    {labels.status[node.status] ?? node.status}
                  </StatusBadge>
                </span>
              )}
          </button>
        </div>
        {expanded &&
          children.map((child) => (
            <NodeRow key={child.nodeId} node={child} depth={depth + 1} />
          ))}
      </div>
    );
  }

  const roots = byParent.get(null) ?? [];
  const manager = selected?.parentNodeId ? byId.get(selected.parentNodeId) : null;
  const directReports = selected ? (byParent.get(selected.nodeId) ?? []) : [];
  // Slug → node lookups so the detail panel can show human names
  // (department display name, director title) instead of raw slugs.
  const deptBySlug = useMemo(
    () => new Map(nodes.filter((n) => n.kind === "department").map((n) => [n.slug, n])),
    [nodes],
  );
  const employeeBySlug = useMemo(
    () => new Map(nodes.filter((n) => n.kind === "employee").map((n) => [n.slug, n])),
    [nodes],
  );
  const selectedDirector = selected?.directorSlug
    ? employeeBySlug.get(selected.directorSlug)
    : null;

  return (
    <div className="@container">
      <div className="flex flex-col gap-4 @3xl:flex-row">
        <Panel className="min-w-0 flex-1 !p-3" title={labels.title}>
          {/* The tree scrolls inside its own box (~220 rows fully expanded) —
              the page keeps viewport height and the detail panel never drifts
              a full workforce away (CEO eye-test wave 3b). */}
          <div data-testid="org-tree" className="max-h-[70vh] overflow-y-auto pr-1">
            {roots.map((root) => (
              <NodeRow key={root.nodeId} node={root} depth={0} />
            ))}
          </div>
        </Panel>

        {/* Sticky detail (CEO eye-test wave 3b): the fully-expanded tree is
            ~220 rows tall — the panel follows the scroll so a node click is
            readable without traveling back up. */}
        <aside
          className="order-first w-full @3xl:sticky @3xl:top-4 @3xl:order-none @3xl:w-80 @3xl:shrink-0 @3xl:self-start"
          data-testid="org-detail"
        >
          <Panel title={labels.detailTitle}>
            {!selected ? (
              <p className="text-body-s text-ink-muted">{labels.detailSelect}</p>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-data text-body-md text-ink-primary">
                    {selected.label}
                  </p>
                  <StatusBadge level={statusLevel(selected.status)}>
                    {labels.status[selected.status] ?? selected.status}
                  </StatusBadge>
                </div>
                <dl className="space-y-1.5 text-body-s">
                  <div className="flex gap-2">
                    <dt className="text-ink-muted">{labels.kind[selected.kind]}</dt>
                    {selected.roleLevel && (
                      <dd className="text-ink-primary">
                        {labels.roleLevel[selected.roleLevel] ?? selected.roleLevel}
                      </dd>
                    )}
                  </div>
                  {selected.kind === "department" && (
                    <div className="flex gap-2">
                      <dt className="text-ink-muted">{labels.directorLabel}:</dt>
                      <dd className="text-ink-primary">
                        {selectedDirector?.label ?? selected.directorSlug ?? "—"}
                      </dd>
                    </div>
                  )}
                  {selected.kind === "department" && selected.department && (
                    <div className="flex gap-2">
                      <dt className="text-ink-muted">{labels.headcountLabel}:</dt>
                      <dd className="font-data text-ink-primary tabular-nums">
                        {deptCounts.get(selected.department) ?? 0}
                        {" · "}
                        {deptActiveCounts.get(selected.department) ?? 0}{" "}
                        {labels.activeShort}
                      </dd>
                    </div>
                  )}
                  {selected.kind === "employee" && selected.department && (
                    <div className="flex gap-2">
                      <dt className="text-ink-muted">{labels.departmentLabel}:</dt>
                      <dd className="text-ink-primary">
                        {deptBySlug.get(selected.department)?.label ?? selected.department}
                      </dd>
                    </div>
                  )}
                  {selected.kind === "employee" && selected.slug && (
                    <div className="flex gap-2">
                      <dt className="text-ink-muted">{labels.idLabel}:</dt>
                      <dd className="font-data text-ink-secondary">{selected.slug}</dd>
                    </div>
                  )}
                  {selected.kind === "employee" && (
                    <div className="flex gap-2">
                      <dt className="text-ink-muted">{labels.managerLabel}:</dt>
                      <dd className="text-ink-primary">
                        {detail?.manager_slug ? (
                          <button
                            type="button"
                            className="text-left text-accent-champagne hover:text-accent-ivory"
                            onClick={() => {
                              const node = employeeBySlug.get(detail.manager_slug);
                              if (node) setSelected(node);
                            }}
                          >
                            {locale === "tr" && detail.manager_title_tr
                              ? detail.manager_title_tr
                              : detail.manager_title}
                          </button>
                        ) : manager && manager.kind === "employee" ? (
                          manager.label
                        ) : (
                          labels.noManager
                        )}
                      </dd>
                    </div>
                  )}
                  {directReports.length > 0 && (
                    <div className="flex gap-2">
                      <dt className="text-ink-muted">{labels.reportsLabel}:</dt>
                      <dd className="font-data text-ink-primary tabular-nums">
                        {directReports.length}
                      </dd>
                    </div>
                  )}
                </dl>

                {selected.kind === "employee" && detailState === "loading" && (
                  <p className="text-caption text-ink-muted">{labels.detailLoading}</p>
                )}
                {selected.kind === "employee" && detailState === "error" && (
                  <p className="text-caption text-status-danger">{labels.detailError}</p>
                )}

                {selected.kind === "employee" && detail && (
                  <>
                    {/* Governance — persona + sicil (madde 5.3: persona, sicil) */}
                    <div className="space-y-1.5 border-t border-edge-neutral pt-3">
                      <p className="label-caps text-caption text-ink-muted">
                        {labels.governanceTitle}
                      </p>
                      <dl className="space-y-1.5 text-body-s">
                        <div className="flex flex-wrap items-center gap-2">
                          <dt className="text-ink-muted">{labels.personaLabel}:</dt>
                          <dd className="flex flex-wrap items-center gap-2 text-ink-primary">
                            v{detail.persona_version ?? "—"}
                            {detail.persona_gate && (
                              <StatusBadge
                                level={
                                  detail.persona_gate === "passed"
                                    ? "ok"
                                    : detail.persona_gate === "failed"
                                      ? "danger"
                                      : "info"
                                }
                              >
                                {labels.personaGate[detail.persona_gate] ??
                                  detail.persona_gate}
                              </StatusBadge>
                            )}
                            {detail.persona_author && (
                              <span className="text-caption text-ink-muted">
                                {labels.personaBy} {detail.persona_author}
                              </span>
                            )}
                          </dd>
                        </div>
                        <div className="flex gap-2">
                          <dt className="text-ink-muted">{labels.recordLabel}:</dt>
                          <dd className="text-ink-primary">
                            {detail.has_employee_record
                              ? `${labels.kpisLabel}: ${detail.kpi_count}`
                              : labels.recordNone}
                          </dd>
                        </div>
                      </dl>
                      {detail.persona_id && (
                        <button
                          type="button"
                          onClick={togglePersona}
                          className="text-body-s text-accent-champagne hover:text-accent-ivory"
                        >
                          {personaOpen ? labels.personaHide : labels.personaRead}
                        </button>
                      )}
                      {personaOpen && (
                        <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-input border border-edge-neutral bg-surface-graphite p-2 font-data text-caption text-ink-secondary">
                          {personaBody ?? labels.detailLoading}
                        </pre>
                      )}
                    </div>

                    {/* Runtime — model, yetki, tool access, görev/koşu/maliyet/memory */}
                    <div className="space-y-1.5 border-t border-edge-neutral pt-3">
                      <p className="label-caps text-caption text-ink-muted">
                        {labels.runtimeTitle}
                      </p>
                      <dl className="space-y-1.5 text-body-s">
                        <div className="flex items-center gap-2">
                          <dt className="flex items-center gap-1 text-ink-muted">
                            <Cpu size={11} strokeWidth={1.5} aria-hidden />
                            {labels.modelLabel}:
                          </dt>
                          <dd className="font-data text-ink-primary">{detail.brain}</dd>
                        </div>
                        <div className="flex gap-2">
                          <dt className="text-ink-muted">{labels.autonomyLabel}:</dt>
                          <dd className="font-data text-ink-primary tabular-nums">
                            {detail.autonomy_level}
                          </dd>
                        </div>
                        <div className="flex gap-2">
                          <dt className="text-ink-muted">{labels.mcpLabel}:</dt>
                          <dd className="font-data text-ink-primary">{detail.mcp_profile}</dd>
                        </div>
                        <div className="flex gap-2">
                          <dt className="text-ink-muted">{labels.tasksLabel}:</dt>
                          <dd className="font-data text-ink-primary tabular-nums">
                            {detail.active_tasks}
                          </dd>
                        </div>
                        <div className="flex gap-2">
                          <dt className="text-ink-muted">{labels.runsLabel}:</dt>
                          <dd className="font-data text-ink-primary tabular-nums">
                            {detail.active_runs}
                          </dd>
                        </div>
                        <div className="flex gap-2">
                          <dt className="text-ink-muted">{labels.costLabel}:</dt>
                          <dd className="font-data text-ink-primary tabular-nums">
                            €{detail.cost_30d_eur}
                          </dd>
                        </div>
                        <div className="flex gap-2">
                          <dt className="text-ink-muted">{labels.memoryLabel}:</dt>
                          <dd className="font-data text-ink-primary tabular-nums">
                            {detail.memory_count}
                          </dd>
                        </div>
                        <div className="flex gap-2">
                          <dt className="text-ink-muted">{labels.skillsLabel}:</dt>
                          <dd className="font-data text-ink-primary tabular-nums">
                            {Array.isArray(detail.skills) ? detail.skills.length : 0}
                            {" · "}
                            {labels.grantsLabel}: {detail.grants_count}
                          </dd>
                        </div>
                      </dl>
                      {detail.active_tasks === 0 &&
                        detail.active_runs === 0 &&
                        detail.employment_status !== "active" && (
                          <p className="text-caption text-ink-muted">
                            {labels.phase7Hint}
                          </p>
                        )}
                    </div>
                  </>
                )}
                {selected.kind === "department" && selected.status === "dormant" && (
                  <p className="text-caption text-ink-muted">
                    {labels.deptDormantHint}
                  </p>
                )}
                {selected.kind === "employee" && (
                  <a
                    href={`/org/employees?q=${encodeURIComponent(selected.slug ?? selected.label)}`}
                    className="inline-block text-body-s text-accent-champagne hover:text-accent-ivory"
                  >
                    {labels.openEmployees} →
                  </a>
                )}
              </div>
            )}
          </Panel>
        </aside>
      </div>
    </div>
  );
}
