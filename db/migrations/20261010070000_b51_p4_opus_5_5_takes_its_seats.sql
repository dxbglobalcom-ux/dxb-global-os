-- B51 step 3 · P4, the Opus line finished — OPUS 5 → OPUS 5.5 THROUGH THE DOOR, after a live call.
-- Plan approved 2026-10-09 (b51-plan-approved-2026-10-09): "İlk geçiş sizin istediğiniz: Opus 5'ten 5.5'e,
-- Sonnet 5'ten 5.5'e. Fable 5.1 günün en akıllı modeli olarak kalır."
--
-- 20261010040000 moved fable-5 → claude-opus-5-5 and 20261010050000 undid it: the CLI inside the company's
-- Agent SDK (2.1.259) could not call Opus 5.5. Both stay as history. The SDK is now 0.3.296 (CLI 2.1.296,
-- 785113e8) and Opus 5.5 answered a live call through company isolation — served claude-opus-5-5, is_error
-- false, "OK" (evidence/live-probe-sdk-0.3.296-2026-10-10.txt). Since 20261010060000 the door itself refuses
-- a successor that has not answered (SMOKE_REQUIRED):
--   · on the company, scripts/models/smoke.mjs stamps claude-opus-5-5 with a live call BEFORE this file runs;
--   · on the bench and on a fresh build no call is made by a migration, so an unstamped row is stamped from
--     the recorded live call of 2026-10-10 — through fn_model_smoke_passed, with `recorded` in its evidence
--     and the call's own time (started 01:05:50.410Z, answered after 3753 ms), never the migration's, and
--     never by writing the columns directly.
-- A new idempotency key: the door would replay 'b51-p4-opus-5-5' (040000's stored answer) and move nothing.
-- The successor keeps the fallback the undo gave back (claude-sonnet-5-5, L2): the SDK fallback stays at the
-- primary's tier floor, so Opus 5.5 seats carry none — as Opus 5's did. The only L1 Claude hop would be
-- fable-5.1, whose own chain the door re-points to claude-opus-5-5; both ways at once is a cycle.
-- fable-5.1 → claude-opus-5-5 (L1) — the door's step 6, good.
-- gpt-6.1-sol inherited codex-5.6's fallback_of = claude-opus-5-5 (a Codex judge falling onto a Claude
-- model; the gate refuses a Claude judge on purpose). With Opus 5.5 active that pointer would become live in
-- fn_model_fallback, which filters no lane, so it is cut here, with its own audit row.
-- Undo: fn_undo_succession(<this call's routing.succession audit id>, <key>); the cut pointer is in the
-- audit row's payload.

DO $$
DECLARE
  v_plan constant text := 'ceo-approvals:b51-plan-approved-2026-10-09';
  v_why constant text :=
    'B51 step 3 P4 — the Opus line of the plan he approved on 2026-10-09: '
    || '"İlk geçiş sizin istediğiniz: Opus 5''ten 5.5''e, Sonnet 5''ten 5.5''e." '
    || 'The SDK now carries CLI 2.1.296; Opus 5.5 answered a live call before this move.';
  v_resp jsonb;
BEGIN
  IF (SELECT status FROM public.model_catalog WHERE id = 'fable-5') IS DISTINCT FROM 'retired' THEN
    IF (SELECT smoke_ok_at FROM public.model_catalog WHERE id = 'claude-opus-5-5') IS NULL THEN
      v_resp := public.fn_model_smoke_passed('claude-opus-5-5', '2.1.296', jsonb_build_object(
        'recorded', '.planning/quick/20261009-masa-b51/evidence/live-probe-sdk-0.3.296-2026-10-10.txt',
        'sdk', '0.3.296', 'served', 'claude-opus-5-5', 'subtype', 'success', 'is_error', false, 'result', 'OK'),
        '2026-10-10T01:05:54Z'::timestamptz);
      IF NOT coalesce((v_resp->>'ok')::boolean, false) THEN
        RAISE EXCEPTION 'B51 P4: the recorded smoke of claude-opus-5-5 was refused: %', v_resp;
      END IF;
    END IF;
    v_resp := public.fn_succeed_model('fable-5', 'claude-opus-5-5', v_why, v_plan, 'b51-p4-opus-5-5-sdk-0.3.296');
    IF NOT coalesce((v_resp->>'ok')::boolean, false) THEN
      RAISE EXCEPTION 'B51 P4: fable-5 → claude-opus-5-5 refused by the door: %', v_resp;
    END IF;
    RAISE NOTICE 'B51 P4: fable-5 → claude-opus-5-5 %', v_resp;
  END IF;

  IF (SELECT fallback_of FROM public.model_catalog WHERE id = 'gpt-6.1-sol') = 'claude-opus-5-5' THEN
    UPDATE public.model_catalog SET fallback_of = NULL WHERE id = 'gpt-6.1-sol';
    INSERT INTO public.audit_log (actor, actor_type, action, payload)
    VALUES ('migration-b51', 'system', 'model_catalog.fallback_cut', jsonb_build_object(
      'authority', 'ceo-approvals:all-brains-stay-current-gate-judges-2026-10-09',
      'model', 'gpt-6.1-sol',
      'before', jsonb_build_object('fallback_of', 'claude-opus-5-5'),
      'after', jsonb_build_object('fallback_of', NULL),
      'why', 'a Codex-lane judge never falls onto a Claude model; inherited from codex-5.6 through the door (P4)'));
  END IF;
END $$;
