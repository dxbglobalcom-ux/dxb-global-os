import Link from "next/link";
import { Panel, Stat, StatusBadge } from "@/components/primitives";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// /gov/security v1 (E12.1-E) — the SECURITY_MODEL posture board from four
// REAL signals: Fable-hook violations (E10.x gates), high-risk audit
// actions (payload.risk stamp), the locked outward-action gates
// (approval_rules), and the global kill-switch state. The registered
// hardening deferral (CEO order: full hardening rides the pre-launch pass;
// the money-out gate NEVER waits) is stated on the board — a posture page
// that hides its own open items would be security theater.

export const metadata = { title: "Security — DXB" };

type ViolationRow = {
  id: number;
  gate: string;
  action_taken: string;
  detail: Record<string, unknown>;
  created_at: string;
};

type AuditRow = {
  id: number;
  actor: string;
  action: string;
  created_at: string;
};

export default async function SecurityPage() {
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command.security;
  const supabase = await createClient();

  const weekAgo = new Date(Date.now() - 7 * 24 * 3_600_000).toISOString();
  const [violationsRes, highRiskRes, lockedRes, pauseRes, hookFlagRes] =
    await Promise.all([
      supabase
        .from("hook_violations")
        .select("id, gate, action_taken, detail, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("audit_log")
        .select("id, actor, action, created_at")
        .eq("payload->>risk", "high")
        .gte("created_at", weekAgo)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("approval_rules")
        .select("id", { count: "exact", head: true })
        .eq("locked", true),
      supabase
        .from("settings_values")
        .select("value")
        .eq("key", "os.global_pause")
        .eq("scope", "global")
        .maybeSingle<{ value: boolean }>(),
      supabase
        .from("settings_values")
        .select("value")
        .eq("key", "hook.enabled")
        .eq("scope", "global")
        .maybeSingle<{ value: boolean }>(),
    ]);

  const firstError = violationsRes.error ?? highRiskRes.error ?? lockedRes.error;
  if (firstError) {
    return (
      <div className="mx-auto max-w-6xl">
        <Panel title={dict.command.nav.pages.security} state="error">
          <p className="text-body-s text-status-danger">{firstError.message}</p>
        </Panel>
      </div>
    );
  }

  const violations = (violationsRes.data ?? []) as ViolationRow[];
  const highRisk = (highRiskRes.data ?? []) as AuditRow[];
  const paused = pauseRes.data?.value === true;
  const hookOn = hookFlagRes.data?.value === true;

  const timeFmt = (iso: string) =>
    new Date(iso).toLocaleString(locale === "tr" ? "tr-TR" : "en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });

  return (
    <div className="mx-auto max-w-[1720px] space-y-6">
      <h1 className="font-display text-h1 text-ink-primary">
        {dict.command.nav.pages.security}
      </h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <Stat
          label={t.kpiViolations}
          value={String(violations.length)}
          glow
          drillHref="/gov/violations"
        />
        <Stat
          label={t.kpiHighRisk7d}
          value={String(highRisk.length)}
          drillHref="/gov/audit"
        />
        <Stat
          label={t.kpiLockedGates}
          value={String(lockedRes.count ?? 0)}
          drillHref="/gov/policies"
        />
        <Stat
          label={t.kpiKillSwitch}
          value={paused ? t.pausedOn : t.pausedOff}
          drillHref="/sys/settings"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel
          title={t.violationsTitle}
          action={
            <StatusBadge level={hookOn ? "ok" : "danger"}>
              {hookOn ? t.hookOn : t.hookOff}
            </StatusBadge>
          }
        >
          {violations.length === 0 ? (
            <p className="text-body-s text-ink-secondary">{t.violationsEmpty}</p>
          ) : (
            <ul className="space-y-2">
              {violations.map((v) => (
                <li key={v.id}>
                  <Link
                    href="/gov/violations"
                    className="flex items-center justify-between gap-3 rounded-input border border-edge-neutral bg-surface-graphite p-2 transition duration-[var(--t-fast)] ease-refined hover:border-edge-champagne"
                  >
                    <span className="min-w-0 truncate font-data text-body-s text-ink-primary">
                      {v.gate}
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <StatusBadge
                        level={v.action_taken === "rejected" ? "danger" : "warn"}
                      >
                        {v.action_taken}
                      </StatusBadge>
                      <span className="font-data text-caption text-ink-muted tabular-nums">
                        {timeFmt(v.created_at)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title={t.highRiskTitle}>
          {highRisk.length === 0 ? (
            <p className="text-body-s text-ink-secondary">{t.highRiskEmpty}</p>
          ) : (
            <ul className="space-y-2">
              {highRisk.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/gov/audit/${a.id}`}
                    className="flex items-center justify-between gap-3 rounded-input border border-edge-neutral bg-surface-graphite p-2 transition duration-[var(--t-fast)] ease-refined hover:border-edge-champagne"
                  >
                    <span className="min-w-0 truncate font-data text-body-s text-ink-primary">
                      {a.action}
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="font-data text-caption text-ink-secondary">
                        {a.actor}
                      </span>
                      <span className="font-data text-caption text-ink-muted tabular-nums">
                        {timeFmt(a.created_at)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title={t.postureTitle}>
        <ul className="space-y-2 text-body-s">
          <li className="flex flex-wrap items-baseline gap-2">
            <StatusBadge level="ok">{t.postureOkBadge}</StatusBadge>
            <span className="text-ink-secondary">{t.postureGates}</span>
          </li>
          <li className="flex flex-wrap items-baseline gap-2">
            <StatusBadge level="ok">{t.postureOkBadge}</StatusBadge>
            <span className="text-ink-secondary">{t.postureLeastPrivilege}</span>
          </li>
          <li className="flex flex-wrap items-baseline gap-2">
            <StatusBadge level="ok">{t.postureOkBadge}</StatusBadge>
            <span className="text-ink-secondary">{t.postureSecrets}</span>
          </li>
          <li className="flex flex-wrap items-baseline gap-2">
            <StatusBadge level="warn">{t.postureDeferredBadge}</StatusBadge>
            <span className="text-ink-secondary">{t.postureHardening}</span>
          </li>
        </ul>
      </Panel>
    </div>
  );
}
