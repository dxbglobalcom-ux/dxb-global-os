import { VoiceCall, type DirectorOption, type RecentCallRow } from "@/components/command/voice-call";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// /voice — R3.1 (VOICE_INTERACTION_SPEC §7, U4 refinement): the v1
// Ask-a-Director call line. Server side is pure projection: director picker
// options (V1 law population: directors + Hamza default) and the recent-call
// log straight from voice_calls RLS reads. The call itself flows through
// /api/voice/call (intake) → scheduler voice.drain (answer) — never here.

export const metadata = { title: "Voice — DXB" };

type AgentRow = {
  slug: string;
  title: string | null;
  title_tr: string | null;
  department: string;
};

type DeptRow = { slug: string; display_name: string | null; display_name_tr: string | null };

type CallRow = {
  id: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  degraded: boolean;
  target: { slug: string; title: string | null; title_tr: string | null } | null;
};

export default async function Page() {
  const locale = await getLocale();
  const t = getDict(locale).command.voice;
  const supabase = await createClient();

  const [directorsRes, deptsRes, callsRes] = await Promise.all([
    supabase
      .from("agents")
      .select("slug,title,title_tr,department")
      .eq("role_level", "director")
      .neq("employment_status", "archived")
      .order("department"),
    supabase.from("departments").select("slug,display_name,display_name_tr"),
    supabase
      .from("voice_calls")
      .select("id,status,started_at,ended_at,degraded,target:agents(slug,title,title_tr)")
      .order("started_at", { ascending: false })
      .limit(6),
  ]);

  // Bilingual purity: department shown by localized display name, never the
  // raw slug (DB text is i18n surface — title_tr/display_name_tr rule).
  const deptName = new Map(
    ((deptsRes.data ?? []) as DeptRow[]).map((d) => [
      d.slug,
      (locale === "tr" ? d.display_name_tr : d.display_name) ?? d.slug,
    ]),
  );
  const directors: DirectorOption[] = ((directorsRes.data ?? []) as AgentRow[]).map((a) => ({
    slug: a.slug,
    label: (locale === "tr" ? a.title_tr : a.title) ?? a.slug,
    department: deptName.get(a.department) ?? a.department,
  }));

  const recent: RecentCallRow[] = ((callsRes.data ?? []) as unknown as CallRow[]).map((c) => ({
    id: c.id,
    status: c.status,
    startedAt: c.started_at,
    targetLabel: c.target
      ? ((locale === "tr" ? c.target.title_tr : c.target.title) ?? c.target.slug)
      : null,
    degraded: c.degraded,
    totalMs:
      c.ended_at != null
        ? new Date(c.ended_at).getTime() - new Date(c.started_at).getTime()
        : null,
  }));

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-h2 text-ink-primary">{t.title}</h1>
        <p className="mt-1 text-body-s text-ink-secondary">{t.subtitle}</p>
      </header>
      <VoiceCall directors={directors} recent={recent} labels={t} locale={locale} />
    </div>
  );
}
