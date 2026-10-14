import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";

// B64 plan step 1 (CEO 2026-10-14): no one who has not logged in can call a function that writes.
// Before migration 20261014030000 thirteen SECURITY DEFINER writers in public were EXECUTE-able by anon
// (the browser's not-signed-in role), fn_org_actor() answered 'system' for anon (inside a definer
// current_user is always the owner), control_work_generate let a NULL actor through (`NULL NOT IN (...)`
// is not true), and every new function was born anon-executable — through the per-schema default
// (anon=X) and through PostgreSQL's built-in global default (PUBLIC=X).
//
// Every probe runs inside a rolled-back transaction: the resident scheduler is live against this engine.

const ROLLBACK = new Error("rollback-sentinel");

const inTrx = async (fn: (trx: never) => Promise<void>) =>
  getDb()
    .transaction()
    .execute(async (trx) => {
      await fn(trx as never);
      throw ROLLBACK;
    })
    .catch((e) => {
      if (e !== ROLLBACK) throw e;
    });

afterAll(async () => {
  await closeDb();
});

const CLOSED = [
  "public.control_ceo_briefing_post(text,date,text,text,text,text)",
  "public.control_opportunity_register(text,text,text,text,numeric,jsonb,text,text,text)",
  "public.control_voice_call_log(jsonb)",
  "public.control_voice_daemon_set_state(text,text,text)",
  "public.control_voice_identity_retire(text)",
  "public.control_voice_identity_upsert(text,text,text,text,text)",
  "public.fn_approvals_supersede_sweep()",
  "public.fn_chat_post_message(text,text,uuid,boolean)",
  "public.fn_chat_session_for_new_message(text,boolean,integer)",
  "public.fn_hr_machine_intake(uuid,text)",
  "public.fn_model_fallback(text,text,text,uuid,boolean)",
  "public.fn_persona_bind(uuid,uuid,text)",
  "public.fn_select_model(text,uuid,text,integer,numeric,uuid,boolean,boolean,uuid)",
];

const acl = async (fn: string) =>
  (
    await sql<{ anon: boolean; pub: boolean; authn: boolean; svc: boolean }>`
      SELECT has_function_privilege('anon', ${fn}::regprocedure, 'EXECUTE') AS anon,
             EXISTS (SELECT 1 FROM pg_proc p,
                       aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
                      WHERE p.oid = ${fn}::regprocedure AND a.grantee = 0
                        AND a.privilege_type = 'EXECUTE') AS pub,
             has_function_privilege('authenticated', ${fn}::regprocedure, 'EXECUTE') AS authn,
             has_function_privilege('service_role', ${fn}::regprocedure, 'EXECUTE') AS svc
    `.execute(getDb())
  ).rows[0];

const actor = async (trx: never) =>
  (await sql<{ a: string | null }>`SELECT fn_org_actor() AS a`.execute(trx)).rows[0].a;

const CEO_CLAIMS = '{"role":"authenticated","sub":"00000000-0000-0000-0000-000000000001"}';

describe("B64 step 1 — the writing doors are closed to anyone who has not logged in", () => {
  it.each(CLOSED)("%s: neither anon nor PUBLIC holds EXECUTE; authenticated and service_role still do", async (fn) => {
    expect(await acl(fn)).toEqual({ anon: false, pub: false, authn: true, svc: true });
  });

  it("anon calling a control_* door is refused by the server (42501)", async () => {
    await inTrx(async (trx) => {
      await sql`SET LOCAL ROLE anon`.execute(trx);
      await expect(
        sql`SELECT control_voice_daemon_set_state('muted', 'ceo', 'b64 anon probe')`.execute(trx),
      ).rejects.toMatchObject({ code: "42501" });
    });
  });

  it("anon calling an fn_* door is refused by the server (42501)", async () => {
    await inTrx(async (trx) => {
      await sql`SET LOCAL ROLE anon`.execute(trx);
      await expect(sql`SELECT fn_approvals_supersede_sweep()`.execute(trx)).rejects.toMatchObject({
        code: "42501",
      });
    });
  });
});

describe("B64 step 1 — fn_org_actor names nobody who has not logged in", () => {
  it("anon with no request identity is nobody (NULL), not 'system'", async () => {
    await inTrx(async (trx) => {
      await sql`SELECT set_config('request.jwt.claims', '', true)`.execute(trx);
      await sql`SET LOCAL ROLE anon`.execute(trx);
      expect(await actor(trx)).toBeNull();
    });
  });

  it("an authenticated request with no user id is nobody", async () => {
    await inTrx(async (trx) => {
      await sql`SELECT set_config('request.jwt.claims', '{"role":"authenticated"}', true)`.execute(trx);
      await sql`SET LOCAL ROLE authenticated`.execute(trx);
      expect(await actor(trx)).toBeNull();
    });
  });

  it("the legitimate paths keep their names: signed-in = 'ceo', service_role and the postgres login = 'system'", async () => {
    await inTrx(async (trx) => {
      expect(await actor(trx)).toBe("system");
      // the suites' own CEO idiom: the postgres login carrying a user id
      await sql`SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000001"}', true)`.execute(
        trx,
      );
      expect(await actor(trx)).toBe("ceo");
      await sql`SELECT set_config('request.jwt.claims', ${CEO_CLAIMS}, true)`.execute(trx);
      await sql`SET LOCAL ROLE authenticated`.execute(trx);
      expect(await actor(trx)).toBe("ceo");
      await sql`RESET ROLE`.execute(trx);
      await sql`SELECT set_config('request.jwt.claims', '{"role":"service_role"}', true)`.execute(trx);
      await sql`SET LOCAL ROLE service_role`.execute(trx);
      expect(await actor(trx)).toBe("system");
    });
  });

  it("control_work_generate refuses a caller fn_org_actor cannot name", async () => {
    await inTrx(async (trx) => {
      await sql`SELECT set_config('request.jwt.claims', '{"role":"authenticated"}', true)`.execute(trx);
      await sql`SET LOCAL ROLE authenticated`.execute(trx);
      const r = (
        await sql<{ r: { ok: boolean; error?: string } }>`
          SELECT control_work_generate(gen_random_uuid(), '[]'::jsonb) AS r`.execute(trx)
      ).rows[0].r;
      expect(r).toMatchObject({ ok: false, error: "PERMISSION_DENIED" });
    });
  });
});

describe("B64 step 1 — a new function is not born open to anon", () => {
  it("a function the postgres login creates in public carries no EXECUTE for anon or PUBLIC", async () => {
    await inTrx(async (trx) => {
      await sql`CREATE FUNCTION public.b64_default_acl_probe() RETURNS int LANGUAGE sql AS 'SELECT 1'`.execute(trx);
      const r = (
        await sql<{ anon: boolean; pub: boolean; authn: boolean }>`
          SELECT has_function_privilege('anon', 'public.b64_default_acl_probe()', 'EXECUTE') AS anon,
                 EXISTS (SELECT 1 FROM pg_proc p,
                           aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
                          WHERE p.oid = 'public.b64_default_acl_probe()'::regprocedure AND a.grantee = 0
                            AND a.privilege_type = 'EXECUTE') AS pub,
                 has_function_privilege('authenticated', 'public.b64_default_acl_probe()', 'EXECUTE') AS authn
        `.execute(trx)
      ).rows[0];
      expect(r).toEqual({ anon: false, pub: false, authn: true });
    });
  });
});
