"use client";

import { useMemo, useState } from "react";
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
};

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
  locale: _locale,
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
      list.sort(
        (a, b) =>
          (rank[a.roleLevel ?? ""] ?? 9) - (rank[b.roleLevel ?? ""] ?? 9) ||
          a.label.localeCompare(b.label),
      );
    }
    return map;
  }, [nodes]);

  const byId = useMemo(() => new Map(nodes.map((n) => [n.nodeId, n])), [nodes]);

  // Live employee headcount per department subtree (honest counts, §35).
  const deptCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const n of nodes) {
      if (n.kind === "employee" && n.department) {
        counts.set(n.department, (counts.get(n.department) ?? 0) + 1);
      }
    }
    return counts;
  }, [nodes]);

  const [open, setOpen] = useState<Set<string>>(
    // Company + root departments visible; departments start collapsed.
    () => new Set(nodes.filter((n) => n.kind === "company").map((n) => n.nodeId)),
  );
  const [selected, setSelected] = useState<OrgNode | null>(null);

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
                node.kind === "employee" ? "text-ink-secondary" : "text-ink-primary"
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
            {node.kind === "employee" && node.status !== "active" && (
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

  return (
    <div className="@container">
      <div className="flex flex-col gap-4 @3xl:flex-row">
        <Panel className="min-w-0 flex-1 !p-3" title={labels.title}>
          <div data-testid="org-tree">
            {roots.map((root) => (
              <NodeRow key={root.nodeId} node={root} depth={0} />
            ))}
          </div>
        </Panel>

        <aside className="w-full @3xl:w-80 @3xl:shrink-0" data-testid="org-detail">
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
                  {selected.department && (
                    <div className="flex gap-2">
                      <dt className="text-ink-muted">{labels.departmentLabel}:</dt>
                      <dd className="font-data text-ink-primary">{selected.department}</dd>
                    </div>
                  )}
                  {selected.kind === "employee" && (
                    <div className="flex gap-2">
                      <dt className="text-ink-muted">{labels.managerLabel}:</dt>
                      <dd className="text-ink-primary">
                        {manager && manager.kind === "employee"
                          ? manager.label
                          : labels.noManager}
                      </dd>
                    </div>
                  )}
                  {selected.model && (
                    <div className="flex items-center gap-2">
                      <dt className="flex items-center gap-1 text-ink-muted">
                        <Cpu size={11} strokeWidth={1.5} aria-hidden />
                        {labels.modelLabel}:
                      </dt>
                      <dd className="font-data text-ink-primary">{selected.model}</dd>
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
                {selected.kind === "employee" && (
                  <a
                    href={`/org/employees?q=${encodeURIComponent(selected.label)}`}
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
