// AgentRoster (UI-SPEC §5 right rail): registry-backed, grouped by
// department. NO all-agents wall (LOCKED): default view shows active agents
// only; the full list sits behind a native disclosure. RSC — no client JS.
import { Panel } from "@/components/panel";

export type RosterAgent = {
  slug: string;
  department: string;
  role: string;
  status: string;
  activeTasks: number;
};

export function AgentRoster({
  agents,
  text,
}: {
  agents: RosterAgent[];
  text: {
    rosterTitle: string;
    rosterActive: string;
    rosterDormant: string;
    rosterShowAll: string;
    rosterTasksShort: string;
  };
}) {
  const active = agents.filter((a) => a.status === "active");
  const dormant = agents.filter((a) => a.status !== "active");
  const grouped = groupByDepartment(active);

  return (
    <Panel title={text.rosterTitle}>
      {grouped.map(([department, members]) => (
        <div key={department} className="border-b border-line py-3 last:border-b-0">
          <p className="pb-1.5 text-micro text-ink-2">{department}</p>
          <ul>
            {members.map((agent) => (
              <li key={agent.slug} className="flex items-center gap-2 py-1">
                <span aria-hidden className="size-1.5 rounded-full bg-ok" />
                <span className="min-w-0 flex-1 truncate text-body text-ink">{agent.slug}</span>
                <span className="text-micro text-ink-2">{text.rosterActive}</span>
                {agent.activeTasks > 0 && (
                  <span className="font-mono text-micro text-ink" data-numeric>
                    {agent.activeTasks} {text.rosterTasksShort}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
      {dormant.length > 0 && (
        <details className="pt-3">
          <summary className="cursor-pointer text-micro text-ink-2 hover:text-ink">
            {text.rosterShowAll}{" "}
            <span className="font-mono" data-numeric>
              ({dormant.length})
            </span>
          </summary>
          <ul className="pt-2">
            {dormant.map((agent) => (
              <li key={agent.slug} className="flex items-center gap-2 py-1">
                <span aria-hidden className="size-1.5 rounded-full bg-line" />
                <span className="min-w-0 flex-1 truncate text-body text-ink-2">{agent.slug}</span>
                <span className="text-micro text-ink-2">
                  {agent.department} · {text.rosterDormant}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </Panel>
  );
}

function groupByDepartment(agents: RosterAgent[]): Array<[string, RosterAgent[]]> {
  const map = new Map<string, RosterAgent[]>();
  for (const agent of agents) {
    const list = map.get(agent.department) ?? [];
    list.push(agent);
    map.set(agent.department, list);
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
}
