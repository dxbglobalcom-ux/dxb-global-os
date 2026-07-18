// EntityView (E12.4 command-shell port, RSC): shared composition every CRM
// page is a thin config over — fetch rows COMPANY-SCOPED (GAP-05 isolation:
// clients filter on company_id; children scope through their client_id
// inner join — the company column lives ONLY on crm_clients), derive
// provenance from audit_log's last crm.update writer, render table +
// side-panel form for the ?sel= row. Filter chips and pagination travel as
// searchParams.
import Link from "next/link";
import { Panel } from "@/components/primitives";
import { EntityTable } from "@/components/crm/entity-table";
import { EntityForm, type FormField } from "@/components/crm/entity-form";
import { createClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import {
  CLIENT_STATUS,
  CRM_COLUMNS,
  CRM_EDITABLE_FIELDS,
  CRM_TABLES,
  DEAL_STAGE,
  REQUEST_STATUS,
  type CrmEntity,
  type CrmRow,
} from "@/lib/crm";

const PAGE_SIZE = 50;

const FILTER_VALUES: Partial<Record<CrmEntity, readonly string[]>> = {
  clients: CLIENT_STATUS,
  requests: REQUEST_STATUS,
  deals: DEAL_STAGE,
};

const FILTER_COLUMN: Partial<Record<CrmEntity, string>> = {
  clients: "status",
  requests: "status",
  deals: "stage",
};

// Form field configs per entity: every visible field, editable per the
// whitelist; select inputs carry their enum options.
function formFields(entity: CrmEntity, row: CrmRow): FormField[] {
  const editable = new Set(CRM_EDITABLE_FIELDS[entity]);
  const str = (key: string) => (row[key] === null || row[key] === undefined ? "" : String(row[key]));
  const defs: Record<CrmEntity, FormField[]> = {
    clients: [
      { key: "name", value: str("name"), editable: editable.has("name"), input: "text" },
      { key: "status", value: str("status"), editable: editable.has("status"), input: "select", options: [...CLIENT_STATUS] },
      { key: "created_at", value: str("created_at"), editable: false, input: "text" },
    ],
    requests: [
      { key: "summary", value: str("summary"), editable: false, input: "text" },
      { key: "status", value: str("status"), editable: editable.has("status"), input: "select", options: [...REQUEST_STATUS] },
      { key: "client_name", value: str("client_name"), editable: false, input: "text" },
      { key: "created_at", value: str("created_at"), editable: false, input: "text" },
    ],
    contacts: [
      { key: "name", value: str("name"), editable: editable.has("name"), input: "text" },
      { key: "email", value: str("email"), editable: editable.has("email"), input: "email" },
      { key: "phone", value: str("phone"), editable: editable.has("phone"), input: "tel" },
      { key: "role", value: str("role"), editable: editable.has("role"), input: "text" },
      { key: "client_name", value: str("client_name"), editable: false, input: "text" },
    ],
    deals: [
      { key: "title", value: str("title"), editable: editable.has("title"), input: "text" },
      { key: "value_eur", value: str("value_eur"), editable: editable.has("value_eur"), input: "number" },
      { key: "stage", value: str("stage"), editable: editable.has("stage"), input: "select", options: [...DEAL_STAGE] },
      { key: "client_name", value: str("client_name"), editable: false, input: "text" },
      { key: "created_at", value: str("created_at"), editable: false, input: "text" },
    ],
  };
  return defs[entity];
}

export async function EntityView({
  entity,
  companyId,
  searchParams,
}: {
  entity: CrmEntity;
  /** Active company (GAP-05): every query below is scoped to it. */
  companyId: string;
  searchParams: Promise<{ sel?: string; filter?: string; page?: string }>;
}) {
  const params = await searchParams;
  const locale = await getLocale();
  const dict = getDict(locale);
  const supabase = await createClient();

  const filterValues = FILTER_VALUES[entity];
  const filterColumn = FILTER_COLUMN[entity];
  const filter =
    filterValues && params.filter && filterValues.includes(params.filter) ? params.filter : null;
  const page = Math.max(0, Number(params.page ?? 0) || 0);

  // Company isolation: clients carry company_id; every child row scopes
  // through its client (inner join — a child of another company's client
  // can never leak into this view).
  const needsClient = entity !== "clients";
  const columns = needsClient ? `*, crm_clients!inner(name, company_id)` : "*";
  let query = supabase
    .from(CRM_TABLES[entity])
    .select(columns)
    .order("created_at", { ascending: false })
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
  query = needsClient
    ? query.eq("crm_clients.company_id", companyId)
    : query.eq("company_id", companyId);
  if (filter && filterColumn) query = query.eq(filterColumn, filter);
  const { data, error } = await query;

  if (error) {
    return (
      <Panel title={dict.crm.entities[entity]} state="error">
        <p className="text-body-s text-status-danger">{error.message}</p>
      </Panel>
    );
  }

  const rows: CrmRow[] = ((data ?? []) as unknown as Array<Record<string, unknown>>).map((row) => ({
    ...row,
    id: String(row.id),
    created_at: String(row.created_at),
    client_name: (row.crm_clients as { name?: string } | null)?.name ?? null,
  }));

  // Provenance: last crm.update audit writer per row id — rows never
  // CEO-edited surface as agent/system writes.
  const provenance: Record<string, "ceo" | "agent"> = {};
  if (rows.length > 0) {
    const { data: audits } = await supabase
      .from("audit_log")
      .select("actor_type,payload->>entity_id")
      .eq("action", "crm.update")
      .in(
        "payload->>entity_id",
        rows.map((row) => row.id),
      );
    for (const audit of (audits ?? []) as Array<{ actor_type: string; entity_id: string }>) {
      provenance[audit.entity_id] = audit.actor_type === "ceo" ? "ceo" : "agent";
    }
  }

  const selected = params.sel ? (rows.find((row) => row.id === params.sel) ?? null) : null;
  const crm = dict.crm;
  const base = `/revenue/crm/${entity}`;
  const keepFilter = filter ? `&filter=${filter}` : "";

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <div className={selected ? "lg:col-span-8" : "lg:col-span-12"}>
        <Panel title={crm.entities[entity]}>
          {filterValues && (
            <div className="flex flex-wrap items-center gap-1 pb-3">
              <Link
                href={base}
                className={`inline-flex h-8 items-center rounded-input px-3.5 text-caption transition duration-[var(--t-fast)] ease-refined ${
                  !filter
                    ? "bg-surface-anthracite text-ink-primary"
                    : "text-ink-secondary hover:bg-surface-graphite hover:text-ink-primary"
                }`}
              >
                {crm.filterAll}
              </Link>
              {filterValues.map((value) => (
                <Link
                  key={value}
                  href={`${base}?filter=${value}`}
                  className={`inline-flex h-8 items-center rounded-input px-3.5 text-caption transition duration-[var(--t-fast)] ease-refined ${
                    filter === value
                      ? "bg-surface-anthracite text-ink-primary"
                      : "text-ink-secondary hover:bg-surface-graphite hover:text-ink-primary"
                  }`}
                >
                  {dict.crmStatus[value as keyof typeof dict.crmStatus] ?? value}
                </Link>
              ))}
            </div>
          )}
          <EntityTable
            entity={entity}
            columns={CRM_COLUMNS[entity]}
            rows={rows}
            columnLabels={crm.columns}
            statusLabels={dict.crmStatus}
            provenance={provenance}
            provenanceLabels={{ ceo: crm.byCeo, agent: crm.byAgent }}
            locale={locale}
            selectedId={selected?.id ?? null}
            makeHref={(rowId) => `${base}?sel=${rowId}${keepFilter}`}
            emptyLabel={crm.empty}
          />
          {rows.length === PAGE_SIZE && (
            <div className="flex justify-end pt-3">
              <Link
                href={`${base}?page=${page + 1}${keepFilter}`}
                className="text-caption text-accent-champagne transition duration-[var(--t-fast)] ease-refined hover:text-accent-ivory"
              >
                {crm.nextPage}
              </Link>
            </div>
          )}
        </Panel>
      </div>

      {selected && (
        <div className="lg:col-span-4">
          <Panel
            title={crm.detailTitle}
            action={
              <Link
                href={`${base}${filter ? `?filter=${filter}` : ""}`}
                className="text-caption text-ink-secondary transition duration-[var(--t-fast)] ease-refined hover:text-ink-primary"
              >
                {crm.close}
              </Link>
            }
          >
            <EntityForm
              entity={entity}
              rowId={selected.id}
              fields={formFields(entity, selected)}
              labels={crm.columns}
              statusLabels={dict.crmStatus}
              text={{
                save: crm.save,
                saved: crm.saved,
                lockedHint: crm.lockedHint,
                errorTitle: crm.errorTitle,
              }}
            />
          </Panel>
        </div>
      )}
    </div>
  );
}
