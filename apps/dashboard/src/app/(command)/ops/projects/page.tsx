import Link from "next/link";
import { Panel, StatusBadge, type StatusLevel, HelpTip } from "@/components/primitives";
import {
  healthBand,
  fmtDate,
  fmtTokens,
  mapProjectRow,
  type ProjectCommandViewRow,
} from "@/lib/projects-command";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// /ops/projects — Project OS index (E9.4, PROJECT_OS §7/§8). One round-trip
// per project from v_project_command (live §10 health + counters); every
// card opens the Command View. Premium operations surface — NOT a classic
// PM tool (§23 acceptance rule).

export const metadata = { title: "Projects — DXB" };

const STATUS_LEVEL: Record<string, StatusLevel> = {
  draft: "info",
  active: "ok",
  paused: "warn",
  done: "info",
  archived: "info",
};

const BAND_TEXT: Record<"ok" | "warn" | "danger", string> = {
  ok: "text-status-ok",
  warn: "text-status-warn",
  danger: "text-status-danger",
};

export default async function ProjectsPage() {
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command.projects;
  const supabase = await createClient();

  const { data } = await supabase
    .from("v_project_command")
    .select("*")
    .order("status", { ascending: true })
    .order("created_at", { ascending: true });

  const projects = ((data ?? []) as unknown as ProjectCommandViewRow[]).map(mapProjectRow);

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <header>
        <h1 className="font-display text-h2 text-ink-primary">
        {t.title}{" "}
        <HelpTip text={dict.help.projects} />
      </h1>
        <p className="mt-1 text-body-s text-ink-secondary">{t.subtitle}</p>
      </header>

      {/* Column count follows the CONTAINER, never the viewport. Measured
          2026-07-26 at 1366 with both rails open: `xl:grid-cols-3` fires on
          viewport width while the content area is ~790px, so each card fell to
          ~250px and its text column collapsed to one word per line. A 22rem
          floor gives 2 columns there and 3 on the wide screen. */}
      {projects.length === 0 ? (
        <Panel>
          <p className="py-10 text-center text-body-s text-ink-muted">{t.ui.empty}</p>
        </Panel>
      ) : (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(22rem,1fr))]">
          {projects.map((p) => {
            const band = healthBand(p.health);
            const statuses = t.ui.statuses as Record<string, string>;
            return (
              <Link
                key={p.id}
                href={`/ops/projects/${p.slug}`}
                className="group rounded-panel border border-edge-neutral bg-surface-graphite p-5 transition duration-[var(--t-fast)] ease-refined hover:border-edge-champagne"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {/* the HEADING is i18n text too (migration 20260726012500)
                        — the purpose leg alone left "HR Sandbox" on the TR board */}
                    <h2 className="break-words font-display text-h4 text-ink-primary group-hover:text-accent-champagne">
                      {locale === "tr" ? (p.nameTr ?? p.name) : p.name}
                    </h2>
                    {/* DB text is an i18n surface — the TR card reads the
                        purpose's Turkish leg (migration 20260726011100) */}
                    <p className="mt-1 break-words text-body-s text-ink-secondary">
                      {(locale === "tr" ? (p.purposeTr ?? p.purpose) : p.purpose)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className={`font-display text-display-l tabular-nums ${BAND_TEXT[band]}`}>
                      {p.health}
                    </span>
                    <StatusBadge level={STATUS_LEVEL[p.status] ?? "info"}>
                      {statuses[p.status] ?? p.status}
                    </StatusBadge>
                  </div>
                </div>

                {p.currentPhase ? (
                  <p className="mt-3 text-caption text-ink-muted">
                    <span className="label-caps">{t.ui.currentPhase}</span>{" "}
                    <span className="text-ink-secondary">{p.currentPhase}</span>
                  </p>
                ) : null}

                {/* 2×2, not 4-in-a-row: a quarter of a card cannot hold
                    "KİLOMETRE TAŞLARI" without breaking mid-word (eye pass
                    2026-07-26 — the "KİLOM ETRE" class) */}
                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-edge-neutral pt-3">
                  {(
                    [
                      [t.ui.milestones, `${p.milestonesReached}/${p.milestonesTotal}`],
                      [t.ui.tasks, String(p.tasksTotal)],
                      [t.ui.risks, String(p.risksOpen)],
                      [t.ui.blockers, String(p.blockersCount)],
                    ] as const
                  ).map(([label, value]) => (
                    <div key={label} className="min-w-0">
                      <dt className="label-caps text-ink-muted">
                        {label}
                      </dt>
                      <dd className="font-data text-body-s tabular-nums text-ink-primary">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-3 flex items-center justify-between text-caption text-ink-muted">
                  <span className="font-data tabular-nums">
                    €{p.costTotalEur.toFixed(2)} · {fmtTokens(p.tokensIn + p.tokensOut)}{" "}
                    {t.ui.tokensShort}
                  </span>
                  <span>
                    {t.ui.lastActivity}: {fmtDate(p.lastActivityAt, locale)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
