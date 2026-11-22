import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// CEO order 2026-11-22: "Persona tamamıyla silin gitsin. Persona görmek
// istemiyorum artık." The database's old chain stays as it is; these tests pin
// that the dashboard no longer reads it or shows it. Every page and route below
// runs against a fake PostgREST that STILL holds the persona columns and rows —
// the way the real database does — so a regression that reads them turns red.

type Row = Record<string, unknown>;
type Tables = Record<string, Row[]>;

const PLAIN_COLUMN = /^[a-z0-9_]+$/;
const INNER_EMBED = /^([a-z0-9_]+)!inner\(/;

/** `ilike` pattern as a case-insensitive regex; `%` is the only wildcard used here. */
const ilike = (pattern: string) =>
  new RegExp(
    `^${pattern
      .split("%")
      .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join(".*")}$`,
    "i",
  );

/** Read-only PostgREST stand-in: honours the column list and the filters used here. */
function fakeSupabase(tables: Tables) {
  const tablesRead: string[] = [];
  const rpc = vi.fn(async () => ({ data: { ok: true }, error: null }));

  function query(table: string) {
    let rows = tables[table] ?? [];
    let columns: string[] | null = null;
    const innerEmbeds = new Set<string>();
    const project = (row: Row): Row =>
      columns ? Object.fromEntries(columns.map((c) => [c, row[c]])) : row;
    const narrow = (column: string, keep: (value: unknown) => boolean) => {
      const [embed, field] = column.split(".");
      if (field === undefined) {
        rows = rows.filter((r) => keep(r[column]));
        return builder;
      }
      // A filter on an embedded column narrows the embed; only `!inner` drops the parent row.
      rows = rows.flatMap((r) => {
        const embedded = r[embed] as Row | null | undefined;
        if (embedded && keep(embedded[field])) return [r];
        return innerEmbeds.has(embed) ? [] : [{ ...r, [embed]: null }];
      });
      return builder;
    };
    const builder = {
      select(list = "*") {
        const names = list.split(",").map((c) => c.trim());
        // Aggregates and embeds are passed through whole; plain lists project.
        columns = names.every((c) => PLAIN_COLUMN.test(c)) ? names : null;
        for (const name of names) {
          const embed = INNER_EMBED.exec(name)?.[1];
          if (embed) innerEmbeds.add(embed);
        }
        rows = rows.filter((r) => [...innerEmbeds].every((embed) => r[embed] != null));
        return builder;
      },
      eq: (column: string, value: unknown) => narrow(column, (v) => v === value),
      neq: (column: string, value: unknown) => narrow(column, (v) => v !== value),
      in: (column: string, values: readonly unknown[]) =>
        narrow(column, (v) => values.includes(v)),
      like: (column: string, pattern: string) =>
        narrow(column, (v) => String(v ?? "").startsWith(pattern.replace(/%$/, ""))),
      not: (column: string, operator: string, pattern: string) =>
        operator === "ilike"
          ? narrow(column, (v) => !ilike(pattern).test(String(v ?? "")))
          : builder,
      order: () => builder,
      limit: () => builder,
      maybeSingle: async () => ({ data: rows[0] ? project(rows[0]) : null, error: null }),
      then<T>(resolve: (result: { data: Row[]; error: null; count: number }) => T) {
        return Promise.resolve(
          resolve({ data: rows.map(project), error: null, count: rows.length }),
        );
      },
    };
    return builder;
  }

  return {
    tablesRead,
    rpc,
    auth: { getUser: async () => ({ data: { user: { id: "ceo" } } }) },
    from(table: string) {
      tablesRead.push(table);
      return query(table);
    },
  };
}

const world = vi.hoisted(() => ({
  supabase: null as unknown,
  locale: "en" as "en" | "tr",
}));

vi.mock("@/lib/supabase/server", () => ({ createClient: async () => world.supabase }));
vi.mock("@/lib/locale", () => ({ getLocale: async () => world.locale }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push() {}, replace() {}, refresh() {} }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

function serve(tables: Tables) {
  const supabase = fakeSupabase(tables);
  world.supabase = supabase;
  return supabase;
}

/** Static markup of a server page, without React's text-separator comments. */
async function pageMarkup(page: Promise<React.ReactElement>): Promise<string> {
  return renderToStaticMarkup(await page).replaceAll("<!-- -->", "");
}

const EMPLOYEE_ID = "11111111-1111-4111-8111-111111111111";
const PERSONA_ID = "22222222-2222-4222-8222-222222222222";
const PERSONA_ITEM_ID = "33333333-3333-4333-8333-333333333333";

const AGENT: Row = {
  id: EMPLOYEE_ID,
  slug: "growth-head",
  department: "marketing",
  role: "head",
  brain: "glm-5.2",
  brain_source: "slot",
  autonomy_level: 2,
  hook_version: "h7",
  employment_status: "active",
  persona_id: PERSONA_ID,
  persona_version: "v2.0-fable",
};

const WORKFORCE: Tables = {
  agents: [AGENT],
  personas: [{ id: PERSONA_ID, version: 41, body_md: "PERSONA BODY TEXT" }],
  departments: [{ slug: "marketing", display_name: "Marketing", display_name_tr: "Pazarlama" }],
};

beforeEach(() => {
  world.locale = "en";
});

describe("GET /api/org/node", () => {
  const NODE_DETAIL: Row = {
    employee_id: EMPLOYEE_ID,
    slug: "growth-head",
    brain: "glm-5.2",
    autonomy_level: 2,
    persona_id: PERSONA_ID,
    persona_version: 41,
    persona_gate: "passed",
    persona_author: "fable-5",
    persona_updated_at: "2026-09-15T00:00:00Z",
  };

  it.each(["", "&include=persona"])(
    "carries no persona field and reads no persona (query suffix '%s')",
    async (suffix) => {
      const supabase = serve({ ...WORKFORCE, v_org_node_detail: [NODE_DETAIL] });
      const { GET } = await import("@/app/api/org/node/route");

      const response = await GET(
        new Request(`http://dxb.test/api/org/node?id=${EMPLOYEE_ID}${suffix}`),
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.detail.slug).toBe("growth-head");
      expect(body.detail.autonomy_level).toBe(2);
      expect(JSON.stringify(body)).not.toMatch(/persona/i);
      expect(supabase.tablesRead).not.toContain("personas");
    },
  );
});

describe("POST /api/control/library", () => {
  const register = (kind: string) =>
    new Request("http://dxb.test/api/control/library", {
      method: "POST",
      headers: { "idempotency-key": "k-1", "content-type": "application/json" },
      body: JSON.stringify({ op: "register_item", kind, name: "an-item" }),
    });

  it("refuses to register an item of kind persona", async () => {
    const supabase = serve({});
    const { POST } = await import("@/app/api/control/library/route");

    const response = await POST(register("persona"));

    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe("VALIDATION_FAILED");
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("still registers the kinds that stay", async () => {
    const supabase = serve({});
    const { POST } = await import("@/app/api/control/library/route");

    const response = await POST(register("skill"));

    expect(response.status).toBe(200);
    expect(supabase.rpc).toHaveBeenCalledTimes(1);
  });
});

describe("/ai/library", () => {
  const CATALOG: Row[] = [
    { id: "44444444-4444-4444-8444-444444444444", kind: "skill", name: "alpha-skill", updated_at: "2026-11-01T00:00:00Z" },
    { id: PERSONA_ITEM_ID, kind: "persona", name: "growth-head-text", updated_at: "2026-11-01T00:00:00Z" },
  ];

  it.each(["en", "tr"] as const)(
    "neither lists, counts nor opens a persona row (%s)",
    async (locale) => {
      world.locale = locale;
      serve({ v_library_catalog: CATALOG });
      const { default: LibraryPage } = await import("@/app/(command)/ai/library/page");

      const markup = await pageMarkup(
        LibraryPage({
          searchParams: Promise.resolve({ kind: "persona", item: PERSONA_ITEM_ID }),
        }),
      );

      expect(markup).not.toMatch(/persona/i);
      expect(markup).not.toContain("growth-head-text");
      expect(markup).toContain(locale === "en" ? ">1 items in record<" : ">1 kayıtlı öğe<");
    },
  );
});

describe("the workforce pages", () => {
  it.each(["en", "tr"] as const)("/org/employees shows no persona (%s)", async (locale) => {
    world.locale = locale;
    const supabase = serve(WORKFORCE);
    const { default: EmployeesPage } = await import("@/app/(command)/org/employees/page");

    const markup = await pageMarkup(EmployeesPage({ searchParams: Promise.resolve({}) }));

    expect(markup).toContain("growth-head");
    expect(markup).not.toMatch(/persona/i);
    expect(markup).not.toContain("v41");
    expect(supabase.tablesRead).not.toContain("personas");
  });

  it.each(["en", "tr"] as const)("/org/directors shows no persona (%s)", async (locale) => {
    world.locale = locale;
    const supabase = serve(WORKFORCE);
    const { default: DirectorsPage } = await import("@/app/(command)/org/directors/page");

    const markup = await pageMarkup(DirectorsPage({ searchParams: Promise.resolve({}) }));

    expect(markup).toContain("growth-head");
    expect(markup).not.toMatch(/persona/i);
    expect(markup).not.toContain("v41");
    expect(supabase.tablesRead).not.toContain("personas");
  });

  it("/ops/workflows offers every non-archived employee, whatever its version tag", async () => {
    const untagged = { ...AGENT, id: "55555555-5555-4555-8555-555555555555", slug: "untagged-worker", persona_version: null };
    const archived = { ...AGENT, id: "66666666-6666-4666-8666-666666666666", slug: "archived-worker", employment_status: "archived" };
    serve({ agents: [AGENT, untagged, archived] });
    const { default: WorkflowsPage } = await import("@/app/(command)/ops/workflows/page");

    const page = await WorkflowsPage();
    const offered = JSON.stringify(page.props.children);

    expect(offered).toContain("growth-head");
    expect(offered).toContain("untagged-worker");
    expect(offered).not.toContain("archived-worker");
  });
});

describe("/org/hr equipment verdict", () => {
  const equipped = { e1_org_row: true, e2_record: true, e3_hook: true, e4_grants: true, e5_litellm_key: true, e6_budget: true };
  // The view's own verdict still counts the seventh check; only that one fails here.
  const SIX_OF_SIX: Row = { employee_id: EMPLOYEE_ID, slug: "growth-head", department: "marketing", employment_status: "active", ...equipped, e7_persona_task: false, all_ok: false };
  const HOOKLESS: Row = { ...SIX_OF_SIX, employee_id: "77777777-7777-4777-8777-777777777777", slug: "hookless-worker", e3_hook: false };
  const HR: Tables = {
    ...WORKFORCE,
    v_hr_equipment_check: [SIX_OF_SIX, HOOKLESS],
    v_hr_roster: [SIX_OF_SIX, HOOKLESS].map((r) => ({ ...r, role: "worker", role_level: "specialist", equipment_ok: false })),
  };

  it("counts an employee as unequipped only for a check the page shows", async () => {
    serve(HR);
    const { default: HrPage } = await import("@/app/(command)/org/hr/page");

    const markup = await pageMarkup(HrPage({ searchParams: Promise.resolve({}) }));

    expect(markup).toContain(">1/2<");
    expect(markup).not.toContain(">2/2<");
  });

  it.each(["en", "tr"] as const)(
    "grades the equipment grid out of the six checks it shows (%s)",
    async (locale) => {
      world.locale = locale;
      serve(HR);
      const { default: HrPage } = await import("@/app/(command)/org/hr/page");

      const markup = await pageMarkup(
        HrPage({ searchParams: Promise.resolve({ view: "equipment" }) }),
      );

      expect(markup).not.toMatch(/persona/i);
      // One row complete, one row short of its hook; nothing is graded out of seven.
      expect(markup).toContain(">6/6<");
      expect(markup).toContain(">5/6<");
      expect(markup).not.toContain("/7");
      expect(markup).not.toMatch(/\b7\b/);
    },
  );
});

describe("/sys/settings/employees", () => {
  const setting = (key: string, descriptionEn: string, descriptionTr: string): Row => ({
    key,
    category: "employees",
    value_schema: { type: "string", default: "" },
    risk: "low",
    requires_approval: false,
    cost_impact: null,
    affected_areas: [],
    locked: false,
    delegate: null,
    scope_types: ["global"],
    description_en: descriptionEn,
    description_tr: descriptionTr,
  });
  // The registry, like the real one, still holds a persona setting and a persona note.
  const REGISTRY: Row[] = [
    setting("employee.persona", "Persona text each employee loads", "Her çalışanın yüklediği persona metni"),
    setting("employee.role_definition", "Role definition (persona §1 owner)", "Rol tanımı (persona §1 sahibi)"),
  ];
  const SECTION_LABEL = { en: "Employees", tr: "Çalışanlar" } as const;
  const ROLE_DEFINITION = { en: "Role definition", tr: "Rol tanımı" } as const;

  it.each(["en", "tr"] as const)(
    "neither lists, counts nor describes a persona setting (%s)",
    async (locale) => {
      world.locale = locale;
      serve({ settings_registry: REGISTRY });
      const { default: SettingsSectionPage } = await import(
        "@/app/(command)/sys/settings/[section]/page"
      );

      const markup = await pageMarkup(
        SettingsSectionPage({ params: Promise.resolve({ section: "employees" }) }),
      );

      expect(markup).not.toMatch(/persona/i);
      expect(markup).toContain(">employee.role_definition<");
      expect(markup).toContain(`>${ROLE_DEFINITION[locale]}<`);
      expect(markup).toMatch(new RegExp(`>${SECTION_LABEL[locale]}</span><span[^>]*>1<`));
    },
  );
});

describe("/gov/permissions", () => {
  const DEPARTMENT_ID = "88888888-8888-4888-8888-888888888888";
  const grant = (id: number, name: string, kind: string): Row => ({
    id,
    grantee_kind: "department",
    grantee_id: DEPARTMENT_ID,
    granted_by: "ceo",
    created_at: "2026-11-01T00:00:00Z",
    expires_at: null,
    library_items: { name, kind },
  });

  it.each(["en", "tr"] as const)("lists no grant on a persona item (%s)", async (locale) => {
    world.locale = locale;
    serve({
      library_grants: [grant(1, "alpha-skill", "skill"), grant(2, "growth-head-text", "persona")],
      departments: [
        { id: DEPARTMENT_ID, slug: "marketing", display_name: "Marketing", display_name_tr: "Pazarlama", mcp_profile: "default-deny" },
      ],
    });
    const { default: PermissionsPage } = await import("@/app/(command)/gov/permissions/page");

    const markup = await pageMarkup(PermissionsPage({ searchParams: Promise.resolve({}) }));

    expect(markup).toContain(">alpha-skill<");
    expect(markup).toContain(locale === "en" ? "Library grants · 1<" : "Kütüphane yetkileri · 1<");
    expect(markup).not.toContain("growth-head-text");
    expect(markup).not.toMatch(/persona/i);
  });
});

describe("the retired hook check", () => {
  const policy = (id: string, standardNo: number, severity: string, title: string): Row => ({
    id,
    standard_no: standardNo,
    gate: "pre",
    severity,
    enabled: true,
    version: 1,
    cnt: 1,
    title_en: title,
    title_tr: title,
  });
  const violation = (id: number, of: Row): Row => ({
    id,
    run_id: null,
    policy_id: of.id,
    gate: "pre",
    detail: `refusal-${id}`,
    action_taken: "rejected",
    created_at: "2026-11-01T00:00:00Z",
    hook_policies: of,
  });
  const BUDGET = policy("std.budget", 1, "block", "budget-standard");
  // The hook loader ignores this row; the database still holds it, blocking and enabled.
  const RETIRED = policy("std.persona_gate", 12, "block", "Only quality-gated personas may run");
  const HOOKS: Tables = {
    hook_policies: [BUDGET, policy("std.tone", 2, "warn", "tone-standard"), RETIRED],
    hook_violations: [violation(1, BUDGET), violation(2, RETIRED)],
  };

  it.each(["en", "tr"] as const)(
    "/gov/violations lists neither the check nor a refusal it made (%s)",
    async (locale) => {
      world.locale = locale;
      serve(HOOKS);
      const { default: ViolationsPage } = await import("@/app/(command)/gov/violations/page");

      const markup = await pageMarkup(ViolationsPage());

      expect(markup).toContain(">std.budget<");
      expect(markup).toContain(">std.tone<");
      expect(markup).toContain(">refusal-1<");
      expect(markup).not.toContain("refusal-2");
      expect(markup).not.toMatch(/persona/i);
    },
  );

  it("/gov/policies counts it in neither the hook standards nor the blocking ones", async () => {
    serve(HOOKS);
    const { default: PoliciesPage } = await import("@/app/(command)/gov/policies/page");

    const markup = await pageMarkup(PoliciesPage());

    expect(markup).toContain(">1/2<");
    expect(markup).not.toContain(">2/3<");
  });
});
