-- B51 step 3 · P4 — THE FIRST SUCCESSION, through the door (fn_succeed_model, 20261010020000).
-- Plan approved 2026-10-09 (b51-plan-approved-2026-10-09): "İlk geçiş sizin istediğiniz: Opus 5'ten 5.5'e,
-- Sonnet 5'ten 5.5'e. Fable 5.1 günün en akıllı modeli olarak kalır." His acceptance sentence
-- (all-brains-stay-current-gate-judges-2026-10-09): "hey opus 6 çıkmış ey hamza" dediğimde cart diye modeller
-- güncellenmeli.
--
-- A migration, not a call typed into the company: the seed (packages/kernel/policy/routing-seed.json) mirrors
-- the live table so a fresh bootstrap reproduces the law instead of resurrecting a fired model
-- (MODEL_ROUTING_SPEC §4e), and the construction bench must hold the company's law. On a fresh build this
-- file runs before the seed: the door moves the rows the migrations wrote and activates the successors;
-- the seed then names the successors itself.
--
-- Three calls, each skipped once its old model is retired (a re-run is a no-op), each refused loudly:
--   1. fable-5 (Opus 5)          → claude-opus-5-5 (Opus 5.5)
--   2. claude-sonnet-5           → claude-sonnet-5-5
--   3. codex-5.6 (no seats)      → gpt-6.1-sol — retired through the door, never by hand (step3-spec P1.3),
--      on his OTHER word of that night (all-brains-stay-current-gate-judges-2026-10-09): "bu iki hakem nedir
--      bunlar eski modeller … şuan solo 6.1 e çıktı gpt5.5 eskidi artık." The plan names only calls 1-2;
--      each call carries the authority that really says it.
-- Run as the login role postgres → the door's actor is 'system', which acts only on his word (ceo-…).
-- The door returns both prices: the old rows never carried a token price (the company runs on subscriptions,
-- no API key — his word, 2026-10-09), so price_known is false; the price is his approved plan's to bear.
-- Undo, per call, in reverse (2 before 1 — call 2 rewrote the chains call 1 wrote; 3 is independent):
-- fn_undo_succession(<the routing.succession audit id>, <key>).

DO $$
DECLARE
  v_plan constant text := 'ceo-approvals:b51-plan-approved-2026-10-09';
  v_plan_why constant text :=
    'B51 step 3 P4 — the first succession of the plan he approved on 2026-10-09: '
    || '"İlk geçiş sizin istediğiniz: Opus 5''ten 5.5''e, Sonnet 5''ten 5.5''e." '
    || 'His acceptance sentence: "hey opus 6 çıkmış ey hamza" dediğimde cart diye modeller güncellenmeli.';
  v_judges constant text := 'ceo-approvals:all-brains-stay-current-gate-judges-2026-10-09';
  v_judges_why constant text :=
    'B51 step 3 P4 — the gate''s old judge retires; its seats moved to Sol 6.1 and Astra 6 on his word of '
    || '2026-10-09: "bu iki hakem nedir bunlar eski modeller … şuan solo 6.1 e çıktı gpt5.5 eskidi artık."';
  v_step record;
  v_resp jsonb;
BEGIN
  FOR v_step IN
    SELECT * FROM (VALUES
      (1, 'fable-5',         'claude-opus-5-5',   'b51-p4-opus-5-5',   v_plan,   v_plan_why),
      (2, 'claude-sonnet-5', 'claude-sonnet-5-5', 'b51-p4-sonnet-5-5', v_plan,   v_plan_why),
      (3, 'codex-5.6',       'gpt-6.1-sol',       'b51-p4-codex-5-6',  v_judges, v_judges_why)
    ) AS s(n, old_id, new_id, idem_key, authority, rationale)
    ORDER BY n
  LOOP
    IF (SELECT status FROM public.model_catalog WHERE id = v_step.old_id) IS DISTINCT FROM 'retired' THEN
      v_resp := public.fn_succeed_model(v_step.old_id, v_step.new_id, v_step.rationale, v_step.authority,
                                        v_step.idem_key);
      IF NOT coalesce((v_resp->>'ok')::boolean, false) THEN
        RAISE EXCEPTION 'B51 P4: % → % refused by the door: %', v_step.old_id, v_step.new_id, v_resp;
      END IF;
      RAISE NOTICE 'B51 P4: % → % %', v_step.old_id, v_step.new_id, v_resp;
    END IF;
  END LOOP;
END $$;
