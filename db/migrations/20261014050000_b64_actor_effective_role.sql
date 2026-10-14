-- B64 plan step 1, audit fix (Sol's finding B1, 2026-10-14, on commit e63b8345) — THE ROUTING ACTOR
-- HONOURS THE ROLE THE CALLER IS ACTUALLY PLAYING.
--
-- fn_update_routing (20261014010000:42) takes its actor from fn_succession_actor (20261010020000:32),
-- which reads the request JWT's role and session_user, but never the effective role. Measured on the bench
-- (54422, rolled-back transaction, tests/b64/routing-door-closed.test.ts): a direct postgres login that runs
-- `SET ROLE authenticated` with no JWT and no user id got actor 'system' and was served
-- (`{ok: true, noop: true}`); fn_org_actor (20261014030000) answers NULL for the same caller. authenticated
-- holds EXECUTE on the routing door, so the downgraded connection passed its guard.
--
-- The fallback for a direct login now also asks the effective role — the `role` setting, which SET ROLE and
-- PostgREST write and a definer does not change; with no SET ROLE it is the login itself. Only postgres or
-- service_role count as 'system' there, as in fn_org_actor; anon, authenticated or any other role with no
-- JWT is NULL. The JWT branches are unchanged.
--
-- Callers, each read: fn_update_routing (20261014010000), fn_succeed_model and fn_undo_succession
-- (20261010020000, re-declared 20261010090000), the smoke gate's two doors (20261010060000). Their
-- legitimate callers keep their answer: the CEO's JWT → 'ceo'; a PostgREST service_role request (JWT role
-- service_role) → 'system'; the postgres login with no SET ROLE (scheduler, Hamza's command path, the
-- chain) → 'system'.
--
-- Idempotent: safe to run 2×.

BEGIN;

-- 'ceo'    — a signed-in dashboard request (JWT role authenticated with a user id);
-- 'system' — a service_role request, or a direct login as postgres with no request JWT whose effective role
--            is still postgres or service_role;
-- NULL     — anyone else, including a postgres login that stepped down to anon or authenticated.
CREATE OR REPLACE FUNCTION public.fn_succession_actor()
RETURNS text LANGUAGE plpgsql STABLE SET search_path TO 'public' AS $$
DECLARE
  v_role text := nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'role';
  v_effective text := coalesce(nullif(current_setting('role', true), 'none'), session_user::text);
BEGIN
  IF v_role = 'authenticated' AND auth.uid() IS NOT NULL THEN
    RETURN 'ceo';
  ELSIF v_role = 'service_role' THEN
    RETURN 'system';
  ELSIF v_role IS NULL AND session_user = 'postgres' AND v_effective IN ('postgres', 'service_role') THEN
    RETURN 'system';
  END IF;
  RETURN NULL;
END $$;

REVOKE ALL ON FUNCTION public.fn_succession_actor() FROM PUBLIC, anon;

COMMIT;

-- ROLLBACK PLAN: re-apply fn_succession_actor from 20261010020000 — which lets a postgres login that
-- stepped down to authenticated act as 'system' again; do not without his word.
