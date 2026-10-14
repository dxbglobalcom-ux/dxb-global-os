import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";

// B64 plan step 1 (CEO 2026-10-14): the routing door is closed to callers who never logged in.
// fn_update_routing is SECURITY DEFINER. Before migration 20261014010000 anon held EXECUTE on it, and its
// actor line read current_user — inside a definer that is always the owner, so anon counted as 'system'
// and could flip a model's catalog status. Now anon and PUBLIC hold no EXECUTE, and the actor comes from
// fn_succession_actor(): 'ceo' for a signed-in request, 'system' for service_role or a direct postgres
// login with no request JWT, nobody else.
//
// Every probe runs inside a rolled-back transaction: the resident scheduler is live against this engine.

const SEED = "b64-door";
const ROLLBACK = new Error("rollback-sentinel");
const FN = "public.fn_update_routing(text,jsonb,text)";

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

type Resp = { ok: boolean; error?: string; detail?: string; noop?: boolean; audit_id?: number };

const route = async (trx: never, op: string, payload: Record<string, unknown>, key: string) =>
  (
    await sql<{ r: Resp }>`SELECT fn_update_routing(${op}, ${JSON.stringify(payload)}::jsonb, ${key}) AS r`.execute(trx)
  ).rows[0].r;

// a harmless op: set a model's status to the status it already has (the function answers noop)
const anyModel = async (trx: never) =>
  (
    await sql<{ id: string; status: string; fallback_of: string | null }>`
      SELECT id, status, fallback_of FROM model_catalog ORDER BY id LIMIT 1`.execute(trx)
  ).rows[0];

const CEO_CLAIMS = '{"role":"authenticated","sub":"00000000-0000-0000-0000-000000000001"}';

describe("B64 step 1 — the routing door is closed to anyone who has not logged in", () => {
  it("neither anon nor PUBLIC holds EXECUTE; authenticated and service_role still do", async () => {
    const acl = await sql<{ anon: boolean; pub: boolean; authn: boolean; svc: boolean }>`
      SELECT has_function_privilege('anon', ${FN}, 'EXECUTE') AS anon,
             EXISTS (SELECT 1 FROM pg_proc p,
                       aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
                      WHERE p.oid = ${FN}::regprocedure AND a.grantee = 0
                        AND a.privilege_type = 'EXECUTE') AS pub,
             has_function_privilege('authenticated', ${FN}, 'EXECUTE') AS authn,
             has_function_privilege('service_role', ${FN}, 'EXECUTE') AS svc
    `.execute(getDb());
    expect(acl.rows[0]).toEqual({ anon: false, pub: false, authn: true, svc: true });
  });

  it("anon calling it is refused by the server (42501)", async () => {
    await inTrx(async (trx) => {
      const m = await anyModel(trx);
      await sql`SET LOCAL ROLE anon`.execute(trx);
      await expect(
        route(trx, "set_catalog_status", { model_id: m.id, status: m.status }, `${SEED}-anon`),
      ).rejects.toMatchObject({ code: "42501" });
    });
  });

  it("an authenticated request with no user id is not the CEO and not the system", async () => {
    await inTrx(async (trx) => {
      const m = await anyModel(trx);
      await sql`SET LOCAL ROLE authenticated`.execute(trx);
      await sql`SELECT set_config('request.jwt.claims', '{"role":"authenticated"}', true)`.execute(trx);
      expect(await route(trx, "set_catalog_status", { model_id: m.id, status: m.status }, `${SEED}-nosub`)).toEqual({
        ok: false,
        error: "PERMISSION_DENIED",
      });
    });
  });

  it("a direct postgres login that steps down to authenticated, with no JWT at all, is refused (Sol B1)", async () => {
    // Before 20261014050000 fn_succession_actor saw no JWT role and session_user 'postgres' and answered
    // 'system' — it never looked at the effective role the login had switched to. fn_org_actor answers NULL.
    await inTrx(async (trx) => {
      const m = await anyModel(trx);
      await sql`SET LOCAL ROLE authenticated`.execute(trx);
      expect(await route(trx, "set_catalog_status", { model_id: m.id, status: m.status }, `${SEED}-setrole`)).toEqual({
        ok: false,
        error: "PERMISSION_DENIED",
      });
    });
  });

  it("a PostgREST-style service_role request is 'system': a system op passes", async () => {
    await inTrx(async (trx) => {
      const m = await anyModel(trx);
      await sql`SET LOCAL ROLE service_role`.execute(trx);
      await sql`SELECT set_config('request.jwt.claims', '{"role":"service_role"}', true)`.execute(trx);
      expect(await route(trx, "set_catalog_status", { model_id: m.id, status: m.status }, `${SEED}-svc`)).toEqual({
        ok: true,
        noop: true,
      });
    });
  });

  it("the company's own direct postgres login is 'system': a system op passes, a ceo-only op is refused", async () => {
    await inTrx(async (trx) => {
      const m = await anyModel(trx);
      expect(await route(trx, "set_catalog_status", { model_id: m.id, status: m.status }, `${SEED}-sys`)).toEqual({
        ok: true,
        noop: true,
      });
      expect(
        await route(trx, "set_fallback", { model_id: m.id, fallback_of: m.fallback_of }, `${SEED}-sys-fb`),
      ).toMatchObject({ ok: false, error: "PERMISSION_DENIED", detail: "set_fallback is ceo-only" });
    });
  });

  it("a signed-in dashboard request is the CEO: a ceo-only op passes and is audited under 'ceo'", async () => {
    await inTrx(async (trx) => {
      const m = await anyModel(trx);
      await sql`SET LOCAL ROLE authenticated`.execute(trx);
      await sql`SELECT set_config('request.jwt.claims', ${CEO_CLAIMS}, true)`.execute(trx);
      const r = await route(trx, "set_fallback", { model_id: m.id, fallback_of: m.fallback_of }, `${SEED}-ceo-fb`);
      expect(r).toMatchObject({ ok: true });
      await sql`RESET ROLE`.execute(trx);
      const a = (
        await sql<{ actor: string; actor_type: string; action: string }>`
          SELECT actor, actor_type, action FROM audit_log WHERE id = ${r.audit_id}`.execute(trx)
      ).rows[0];
      expect(a).toEqual({ actor: "ceo", actor_type: "ceo", action: "routing.set_fallback" });
    });
  });
});
