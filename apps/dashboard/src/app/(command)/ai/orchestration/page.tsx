import { HelpTip } from "@/components/primitives";
import {
  OrchestrationBoard,
  type DeptOption,
  type ModelRow,
  type SlotRow,
} from "@/components/ai/orchestration-board";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

// /ai/orchestration — E7.2 (MODEL_ROUTING_SPEC §5/§19): the 13 role slots
// with their live assignments (v_role_slots), the fallback chains, the
// guardrail audit (banned mechanism visible) and the RoutingSimulator.
// One RSC pass; assignment truth stays in the DB (§10).

export const metadata = { title: "Orchestration — DXB" };

type SlotDbRow = {
  role_slot: string;
  model_id: string | null;
  display_name: string | null;
  model_status: string | null;
};
type ModelDbRow = {
  id: string;
  display_name: string | null;
  status: string;
  banned: boolean;
  mechanical_only: boolean;
  fallback_of: string | null;
};
type DeptDbRow = { id: string; display_name: string; display_name_tr: string | null };

export default async function Page() {
  const locale = await getLocale();
  const dict = getDict(locale);
  const t = dict.command.orchestration;
  const supabase = await createClient();

  const [slotsRes, modelsRes, deptsRes] = await Promise.all([
    supabase.from("v_role_slots").select("role_slot, model_id, display_name, model_status").returns<SlotDbRow[]>(),
    supabase
      .from("model_catalog")
      .select("id, display_name, status, banned, mechanical_only, fallback_of")
      .order("id")
      .returns<ModelDbRow[]>(),
    supabase
      .from("departments")
      .select("id, display_name, display_name_tr")
      .order("display_name")
      .returns<DeptDbRow[]>(),
  ]);

  const slots: SlotRow[] = (slotsRes.data ?? []).map((r) => ({
    roleSlot: r.role_slot,
    modelId: r.model_id,
    displayName: r.display_name,
    modelStatus: r.model_status,
  }));
  const models: ModelRow[] = (modelsRes.data ?? []).map((r) => ({
    id: r.id,
    displayName: r.display_name,
    status: r.status,
    banned: r.banned,
    mechanicalOnly: r.mechanical_only,
    fallbackOf: r.fallback_of,
  }));
  const departments: DeptOption[] = (deptsRes.data ?? []).map((d) => ({
    id: d.id,
    label: locale === "tr" && d.display_name_tr ? d.display_name_tr : d.display_name,
  }));

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-h2 text-ink-primary">
        {t.title}{" "}
        <HelpTip text={dict.help.orchestration} />
      </h1>
        <p className="mt-1 text-body-s text-ink-secondary">{t.subtitle}</p>
      </header>
      <OrchestrationBoard
        slots={slots}
        models={models}
        departments={departments}
        labels={{ ...t.ui, slotNames: t.slotNames, statuses: t.statuses }}
      />
    </div>
  );
}
