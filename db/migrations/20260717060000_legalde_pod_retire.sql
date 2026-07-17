-- 20260717060000_legalde_pod_retire.sql — R2.5 gap migration (audit F-08),
-- pair of 20260711007900_legalde_pod_parity.sql.
-- WHY: on live, the runtime-born legal-de pod row was retired after the D2
-- wave absorbed its staffing into legal (the live departments table holds 21
-- rows, no legal-de — measured 2026-07-17). A fresh chain re-creates the pod
-- at its true position (007900) so the D2 guardrail holds; this tail file
-- replays the retirement so the chain's END STATE matches live exactly.
-- On live both files apply in the same bootstrap run: insert → delete,
-- net change zero.

BEGIN;

-- staffing safety: the pod must be empty before retirement (on every env its
-- one seat, legal-de-counsel, lives in department='legal' since D2)
DO $$
DECLARE v_cnt integer;
BEGIN
  SELECT count(*) INTO v_cnt FROM public.agents
   WHERE department = 'legal-de' AND employment_status <> 'archived';
  IF v_cnt > 0 THEN
    RAISE EXCEPTION 'legal-de retire: % active agents still seated in the pod', v_cnt;
  END IF;
END $$;

DELETE FROM public.departments WHERE slug = 'legal-de';

COMMIT;

-- ROLLBACK: re-run 20260711007900_legalde_pod_parity.sql legs (INSERT + parent bind).
