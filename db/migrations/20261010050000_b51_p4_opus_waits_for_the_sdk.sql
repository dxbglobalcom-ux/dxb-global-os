-- B51 step 3 · P4 — OPUS 5.5 WAITS FOR THE SDK: the first call of 20261010040000 (fable-5 → claude-opus-5-5)
-- is undone through the door's own undo (fn_undo_succession); Sonnet 5.5 and the judge's retirement stand.
--
-- Measured the night it went live (2026-10-10 ~02:45, the company's own Agent SDK and company isolation):
--   claude-opus-5-5   → "API Error: 400 Claude Code 2.1.259 does not support this model; version 2.1.280 or
--                        newer is required" — returned as a result of subtype success with is_error true, and
--                        the lanes read only the result text, so every seat on Opus 5.5 (Hamza's chat legs
--                        among them) would have answered with the error;
--   claude-sonnet-5-5 → OK; claude-opus-5 (fable-5) → OK; claude-fable-5-1 → OK.
-- The CLI inside @anthropic-ai/claude-agent-sdk 0.3.259 is 2.1.259. Opus 5.5 takes its seats again through the
-- door once the SDK carries a CLI that can call it — measured, not assumed. Raw probe:
-- .planning/quick/20261009-masa-b51/evidence/live-probe-p4-2026-10-10.txt.
--
-- On the company the undo already ran through the audited function the same minute (audit 76082, actor
-- system), so this file finds fable-5 active and does nothing there; on the bench and on a fresh build it
-- finds the succession of 20261010040000 standing and undoes it the same way.
--
-- Then the catalogue stops saying what is not true: the door had made claude-opus-5-5 'active', yet nothing
-- can call it. Without a seat it goes back to 'testing' (second eye's B3) — also out of fn_model_fallback,
-- which only falls onto an active hop (gpt-6.1-sol inherited a pointer to it from codex-5.6).

DO $$
DECLARE
  v_audit bigint;
  v_resp jsonb;
BEGIN
  IF (SELECT status FROM public.model_catalog WHERE id = 'fable-5') = 'retired' THEN
    SELECT a.id INTO v_audit
      FROM public.audit_log a
     WHERE a.action = 'routing.succession'
       AND a.payload->>'old' = 'fable-5' AND a.payload->>'new' = 'claude-opus-5-5'
       AND NOT EXISTS (SELECT 1 FROM public.audit_log u
                        WHERE u.action = 'routing.succession.undo' AND (u.payload->>'undo_of')::bigint = a.id)
     ORDER BY a.id DESC
     LIMIT 1;
    IF v_audit IS NULL THEN
      RAISE EXCEPTION 'B51 P4: fable-5 is retired but no standing succession to claude-opus-5-5 is on record';
    END IF;
    v_resp := public.fn_undo_succession(v_audit, 'b51-p4-undo-opus-5-5');
    IF NOT coalesce((v_resp->>'ok')::boolean, false) THEN
      RAISE EXCEPTION 'B51 P4: undo of fable-5 → claude-opus-5-5 refused: %', v_resp;
    END IF;
    RAISE NOTICE 'B51 P4: fable-5 → claude-opus-5-5 undone %', v_resp;
  END IF;

  IF (SELECT status FROM public.model_catalog WHERE id = 'claude-opus-5-5') = 'active'
     AND NOT EXISTS (SELECT 1 FROM public.routing_rules WHERE model = 'claude-opus-5-5' OR model_id = 'claude-opus-5-5')
     AND NOT EXISTS (SELECT 1 FROM public.agents WHERE brain = 'claude-opus-5-5') THEN
    UPDATE public.model_catalog SET status = 'testing' WHERE id = 'claude-opus-5-5';
    -- written on his plan's word, not in his name
    INSERT INTO public.audit_log (actor, actor_type, action, payload)
    VALUES ('migration-b51', 'system', 'model_catalog.status',
            jsonb_build_object('model', 'claude-opus-5-5', 'before', 'active', 'after', 'testing',
                               'reason', 'B51 P4: the company''s Agent SDK (CLI 2.1.259) cannot call Opus 5.5 '
                                         || '(live probe: subtype success, is_error true, "version 2.1.280 or newer '
                                         || 'is required"); no seat names it',
                               'authority', 'ceo-approvals:b51-plan-approved-2026-10-09'));
    RAISE NOTICE 'B51 P4: claude-opus-5-5 active → testing (no seat; the SDK cannot call it)';
  END IF;
END $$;
