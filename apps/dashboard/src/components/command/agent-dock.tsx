import Link from "next/link";
import { StatusBadge } from "@/components/primitives";

// Agent Dock — floating bottom layer (CC-SPEC §3): badges for work
// running RIGHT NOW, from the tasks table (real query, E2.1 slice).
// Live status transitions via the ops:live channel arrive at E8.
// The dock hides itself when nothing runs — an empty dock is noise.

export type DockTask = { id: string; title: string; status: string };

// Status → badge level; the dock label already says "running now", so a
// running chip carries no redundant badge (wave 3f: "RUNNING NOW … running"
// double-print was noise). Non-default states keep their colored badge.
const DOCK_LEVEL: Record<string, "ok" | "info" | "warn"> = {
  claimed: "info",
  review: "info",
  awaiting_approval: "warn",
};

export function AgentDock({
  label,
  tasks,
  statusLabels,
}: {
  label: string;
  tasks: DockTask[];
  statusLabels: Record<string, string>;
}) {
  if (tasks.length === 0) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
      <div className="glass pointer-events-auto flex max-w-3xl items-center gap-2 rounded-modal border border-edge-neutral px-4 py-2 shadow-e3">
        <span className="label-caps shrink-0 text-ink-muted">{label}</span>
        <div className="flex items-center gap-2 overflow-x-auto">
          {tasks.map((t) => (
            <Link
              key={t.id}
              href={`/ops/tasks?focus=${t.id}`}
              title={t.title}
              className="flex shrink-0 items-center gap-1.5 rounded-input border border-edge-neutral bg-surface-graphite px-2 py-1 transition duration-[var(--t-fast)] ease-refined hover:border-edge-champagne"
            >
              {t.status !== "running" && (
                <StatusBadge level={DOCK_LEVEL[t.status] ?? "info"}>
                  {statusLabels[t.status] ?? t.status}
                </StatusBadge>
              )}
              <span className="max-w-96 truncate text-body-s text-ink-primary" title={t.title}>
                {t.title}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
