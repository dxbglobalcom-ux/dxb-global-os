import { beforeEach, describe, expect, it, vi } from "vitest";

// CEO order 2026-11-22: "Persona görmek istemiyorum artık." The database's old
// chain is not migrated and still refuses an employee over a persona; its
// wording must not reach his screen. These tests answer the control routes the
// way the database does and pin what the routes hand on, in both locales.

type RpcAnswer = { data: unknown; error: { message: string } | null };

const world = vi.hoisted(() => ({
  locale: "en" as "en" | "tr",
  answer: { data: null, error: null } as RpcAnswer,
}));

vi.mock("@/lib/locale", () => ({ getLocale: async () => world.locale }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: "ceo" } } }) },
    rpc: async () => world.answer,
  }),
}));

const SENTENCE = {
  en: "An old database rule refuses this employee; the rule goes when the foundation is rebuilt.",
  tr: "Eski bir veritabanı kuralı bu çalışanı reddediyor; kural, temel yeniden kurulunca kalkacak.",
} as const;
const EMPLOYEE_ID = "11111111-1111-4111-8111-111111111111";

const post = (path: string, body: unknown) =>
  new Request(`http://dxb.test${path}`, {
    method: "POST",
    headers: { "idempotency-key": "k-1", "content-type": "application/json" },
    body: JSON.stringify(body),
  });

async function saveWorkflow(answer: RpcAnswer) {
  world.answer = answer;
  const { POST } = await import("@/app/api/control/workflows/route");
  const response = await POST(post("/api/control/workflows", { action: "enable", slug: "weekly" }));
  return { status: response.status, body: await response.json() };
}

async function reactivate(answer: RpcAnswer) {
  world.answer = answer;
  const { POST } = await import("@/app/api/control/org/route");
  const response = await POST(
    post("/api/control/org", { op: "reactivate_employee", employeeId: EMPLOYEE_ID }),
  );
  return { status: response.status, body: await response.json() };
}

const refused = (detail: string): RpcAnswer => ({
  data: { ok: false, error: "VALIDATION_FAILED", detail },
  error: null,
});

beforeEach(() => {
  world.locale = "en";
});

describe.each(["en", "tr"] as const)("a refusal of the old database chain (%s)", (locale) => {
  beforeEach(() => {
    world.locale = locale;
  });

  it("reaches the workflow screen as the plain sentence", async () => {
    const { status, body } = await saveWorkflow(
      refused("step 2: employee must be non-archived with persona v2"),
    );

    expect(status).toBe(400);
    expect(body).toEqual({ ok: false, error: "VALIDATION_FAILED", detail: SENTENCE[locale] });
  });

  it("reaches the screen as the plain sentence when a reactivation is refused", async () => {
    const { status, body } = await reactivate(
      refused("persona quality gate is not passed (gate: failed)"),
    );

    expect(status).toBe(400);
    expect(body).toEqual({ ok: false, error: "VALIDATION_FAILED", detail: SENTENCE[locale] });
  });

  it("reaches the screen as the plain sentence when the activation trigger raises", async () => {
    const { status, body } = await reactivate({
      data: null,
      error: {
        message: `activation denied: agent ${EMPLOYEE_ID} has no persona (v2 persona with passed quality gate required)`,
      },
    });

    expect(status).toBe(500);
    expect(body).toEqual({ ok: false, error: "INTERNAL", detail: SENTENCE[locale] });
  });
});

describe("what the control routes hand on unchanged", () => {
  it("a refusal for any other reason keeps the database's own words", async () => {
    expect((await saveWorkflow(refused("step 1: employee does not exist"))).body.detail).toBe(
      "step 1: employee does not exist",
    );
    expect((await reactivate(refused("unknown employee"))).body.detail).toBe("unknown employee");
  });

  it("a success", async () => {
    const { status, body } = await saveWorkflow({
      data: { ok: true, workflow_id: "w-1" },
      error: null,
    });

    expect(status).toBe(200);
    expect(body).toEqual({ ok: true, workflow_id: "w-1" });
  });
});
