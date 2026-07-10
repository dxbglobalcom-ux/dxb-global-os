import {
  CommandItem,
  DataGrid,
  Panel,
  Stat,
  StatusBadge,
  Surface,
  type Column,
  type StatusLevel,
  type SurfaceLevel,
} from "@/components/primitives";

// /design-preview — hidden audit route (DESIGN_SYSTEM §24: Storybook is
// deliberately skipped; this page renders the component×state matrix on
// real tokens as the eye-test input). Not linked from any nav.

export const metadata = { title: "Design preview — DXB Command Center" };

const SURFACES: SurfaceLevel[] = [
  "void",
  "obsidian",
  "carbon",
  "graphite",
  "anthracite",
  "titanium",
];

const ACCENTS = [
  ["champagne", "bg-accent-champagne"],
  ["brushed", "bg-accent-brushed"],
  ["amber", "bg-accent-amber"],
  ["copper", "bg-accent-copper"],
  ["platinum", "bg-accent-platinum"],
  ["ivory", "bg-accent-ivory"],
] as const;

const STATUSES: StatusLevel[] = ["ok", "warn", "danger", "info", "critical"];

type Row = { id: string; agent: string; dept: string; runs: number; cost: string; status: StatusLevel };
const ROWS: Row[] = [
  { id: "r1", agent: "Orchestrator", dept: "Core", runs: 128, cost: "€4.12", status: "ok" },
  { id: "r2", agent: "Finance Director", dept: "Finance", runs: 42, cost: "€1.87", status: "warn" },
  { id: "r3", agent: "Legal Reviewer", dept: "Legal", runs: 17, cost: "€0.94", status: "info" },
  { id: "r4", agent: "Outreach Writer", dept: "Growth", runs: 8, cost: "€0.31", status: "danger" },
];

const COLUMNS: Column<Row>[] = [
  { key: "agent", label: "Agent", render: (r) => r.agent },
  { key: "dept", label: "Department", render: (r) => r.dept },
  { key: "runs", label: "Runs", align: "right", numeric: true, render: (r) => r.runs },
  { key: "cost", label: "Cost", align: "right", numeric: true, render: (r) => r.cost },
  {
    key: "status",
    label: "Status",
    render: (r) => <StatusBadge level={r.status}>{r.status}</StatusBadge>,
  },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="label-caps text-ink-muted">{title}</h2>
      {children}
    </section>
  );
}

export default function DesignPreviewPage() {
  return (
    <div className="min-h-screen bg-surface-void px-10 py-12 font-body text-body-md text-ink-primary">
      <div className="mx-auto max-w-6xl space-y-12">
        <header>
          <h1 className="font-display text-display-lg text-ink-primary">
            Command Center design preview
          </h1>
          <p className="mt-1 text-body-s text-ink-secondary">
            Primitive × state matrix on live tokens. Audit input for the CEO
            eye test — normative source: HOLDING-OS-MASTER-PLAN/DESIGN_SYSTEM.md
          </p>
        </header>

        <Section title="Surfaces — obsidian depth stack">
          <div className="grid grid-cols-3 gap-4 lg:grid-cols-6">
            {SURFACES.map((s) => (
              <Surface key={s} level={s} elevation="e1" reflect bordered className="rounded-panel p-4">
                <div className="text-body-s text-ink-secondary">{s}</div>
              </Surface>
            ))}
          </div>
          <div className="glass rounded-modal border border-edge-neutral p-4 shadow-e3">
            <span className="text-body-s text-ink-secondary">
              glass — e3 surfaces only (drawer, modal, palette)
            </span>
          </div>
        </Section>

        <Section title="Accents — gold discipline (B4)">
          <div className="flex flex-wrap gap-4">
            {ACCENTS.map(([name, cls]) => (
              <div key={name} className="flex items-center gap-2">
                <span className={`size-5 rounded-input ${cls}`} />
                <span className="text-body-s text-ink-secondary">{name}</span>
              </div>
            ))}
          </div>
          <p className="text-caption text-ink-muted">
            Champagne appears only on active state, selection, primary CTA, CEO
            authority and key metrics — never as decoration.
          </p>
        </Section>

        <Section title="Status — shape + color pairs (§30)">
          <div className="flex flex-wrap gap-3">
            {STATUSES.map((s) => (
              <StatusBadge key={s} level={s}>
                {s}
              </StatusBadge>
            ))}
          </div>
        </Section>

        <Section title="Type scale">
          <div className="space-y-3">
            <div className="font-display text-display-xl text-accent-ivory tabular-nums">44 — display-xl</div>
            <div className="font-display text-display-lg">32 — display-lg</div>
            <div className="text-h1">24 — h1</div>
            <div className="text-h2">19 — h2</div>
            <div className="text-h3">16 — h3</div>
            <div className="text-body-md">14.5 — body-md</div>
            <div className="text-body-s">13 — body-s</div>
            <div className="text-caption text-ink-secondary">12 — caption</div>
            <div className="label-caps text-ink-secondary">11.5 — label-caps (floor)</div>
          </div>
        </Section>

        <Section title="Panel × states (§10 matrix)">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Panel title="Default" hoverable>
              <p className="text-body-s text-ink-secondary">
                Carbon surface, e1, neutral edge. Hover: graphite lift + e2 +
                champagne edge light.
              </p>
            </Panel>
            <Panel title="Selected" state="selected">
              <p className="text-body-s text-ink-secondary">
                Champagne edge + left accent bar + gold label.
              </p>
            </Panel>
            <Panel title="Disabled" state="disabled">
              <p className="text-body-s text-ink-secondary">
                Opacity .45, elevation removed, color unchanged.
              </p>
            </Panel>
            <Panel title="Loading" state="loading">
              <p>replaced by skeleton</p>
            </Panel>
            <Panel title="Error" state="error">
              <p className="text-body-s text-status-danger">
                Query failed: connection refused.
              </p>
              <button className="mt-2 rounded-input border border-edge-neutral px-3 py-1 text-body-s text-ink-primary transition duration-[var(--t-fast)] ease-refined hover:border-edge-champagne">
                Retry
              </button>
            </Panel>
            <Panel title="Critical" state="critical">
              <p className="text-body-s text-status-critical">
                Budget hard-stop reached — non-critical agents paused.
              </p>
            </Panel>
          </div>
        </Section>

        <Section title="Stat — executive KPI (every number is a door)">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Stat label="Active agents" value="24" delta={{ pct: 4.2, label: "vs yesterday" }} drillHref="/design-preview" />
            <Stat label="Daily cost" value="6.80" unit="EUR" delta={{ pct: -12.5, label: "vs 7d avg" }} drillHref="/design-preview" />
            <Stat label="Pending approvals" value="3" delta={{ pct: 0 }} drillHref="/design-preview" />
          </div>
        </Section>

        <Section title="DataGrid — 40px rows, separators, no zebra">
          <Panel>
            <DataGrid columns={COLUMNS} rows={ROWS} rowKey={(r) => r.id} />
          </Panel>
        </Section>

        <Section title="CommandItem — ⌘K rows">
          <div className="glass max-w-xl space-y-1 rounded-modal border border-edge-neutral p-2 shadow-e3">
            <CommandItem title="Go to Overview" hint="page" kbd="G O" />
            <CommandItem title="Pause agent: Outreach Writer" hint="action" selected trailing={<StatusBadge level="warn">mutation</StatusBadge>} />
            <CommandItem title="Open cost breakdown" hint="page" kbd="G C" />
          </div>
        </Section>
      </div>
    </div>
  );
}
