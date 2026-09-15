-- 20260903191000_b43_media_studio_kit.sql — B43: the studio gets the same house-bus kit every other
-- department holds. Measured 2026-09-03 on the company engine: 21 departments carry eight
-- library grants each (mcp/dxb-mcp/approval · audit · cost · crm · dashboard · memory · queue ·
-- registry) and a policy entry {"dxb-mcp": "*"}; media-studio, founded that morning, carried none —
-- its fourteen seats sat at hr.grant_package = pending_library ("until a real kit is granted", D11).
-- The kit is granted here through the ONE door (control_library_action, HOLDING_LIBRARY §3/§6), in CEO
-- context on his registered approval (studio-hands-build-plan-approved-2026-09-03); the policy entry is
-- the author's change in packages/gateway/policy/grants.json (same commit). Idempotent; self-skips where
-- the studio does not exist.

BEGIN;

DO $$
DECLARE v_item record; v_resp jsonb; v_n integer := 0;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.departments WHERE slug = 'media-studio') THEN
    RAISE NOTICE 'b43 kit: media-studio absent on this engine — nothing to grant';
    RETURN;
  END IF;
  -- W10 (2026-09-15, audit F032): the eight house groups are LIBRARY CATALOGUE rows, and the
  -- catalogue is registered by the seed (db/seed/build-seed.ts → scripts/library/intake.mjs),
  -- which runs after the whole migration chain. On a database built from zero they do not exist
  -- yet, so this file demanded nine grants where one item existed and the chain died here:
  -- "B43 kit: media-studio holds 1 dxb-mcp group grants (expected 9)". Same self-skip as the
  -- sibling file 20260903190000: what is not on this engine cannot be granted on this engine.
  IF NOT EXISTS (SELECT 1 FROM public.library_items
                  WHERE kind = 'mcp' AND name IN ('dxb-mcp/approval','dxb-mcp/audit','dxb-mcp/cost',
                                                  'dxb-mcp/crm','dxb-mcp/dashboard','dxb-mcp/memory',
                                                  'dxb-mcp/queue','dxb-mcp/registry')) THEN
    RAISE NOTICE 'b43 kit: the library catalogue is not registered on this engine — the seed''s library step owns the kit here';
    RETURN;
  END IF;
  PERFORM set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);
  FOR v_item IN
    SELECT id, name FROM public.library_items
     WHERE kind = 'mcp' AND name IN ('dxb-mcp/approval','dxb-mcp/audit','dxb-mcp/cost','dxb-mcp/crm',
                                     'dxb-mcp/dashboard','dxb-mcp/memory','dxb-mcp/queue','dxb-mcp/registry')
     ORDER BY name
  LOOP
    IF NOT EXISTS (SELECT 1 FROM public.library_grants
                    WHERE item_id = v_item.id AND grantee_kind = 'department' AND grantee_id = 'media-studio') THEN
      v_resp := public.control_library_action(jsonb_build_object(
        'action', 'grant', 'item_id', v_item.id::text, 'grantee_kind', 'department', 'grantee_id', 'media-studio'),
        'b43-media-studio-kit-' || replace(v_item.name, '/', '-') || '-2026-09-03');
      IF coalesce((v_resp->>'ok')::boolean, false) IS FALSE THEN
        RAISE EXCEPTION 'B43 kit: grant % failed: %', v_item.name, v_resp;
      END IF;
      v_n := v_n + 1;
    END IF;
  END LOOP;
  -- the fourteen seats' grant marker: the kit is real now
  UPDATE public.settings_values sv
     SET value = jsonb_set(coalesce(sv.value, '{}'::jsonb), '{status}', '"granted"'),
         updated_by = 'b43-media-hands', updated_at = now()
    FROM public.agents a
   WHERE sv.key = 'hr.grant_package' AND sv.scope = 'employee:' || a.id::text
     AND a.department = 'media-studio' AND sv.value->>'status' = 'pending_library';
  RAISE NOTICE 'b43 kit: % group grant(s) added to media-studio', v_n;
END $$;

-- guardrail: on an engine that has the studio, the kit is complete (8 house groups + media)
DO $$
DECLARE v_n integer; v_want integer;
BEGIN
  -- W10: the guarantee is measured against what this engine HOLDS in its catalogue, never
  -- against a number that assumes a seeded machine — on a seeded engine that is the nine the
  -- CEO's studio must have; on a bare chain it is the one this B43 pair registered itself.
  IF EXISTS (SELECT 1 FROM public.departments WHERE slug = 'media-studio') THEN
    SELECT count(*) INTO v_n FROM public.library_grants g JOIN public.library_items i ON i.id = g.item_id
     WHERE g.grantee_kind = 'department' AND g.grantee_id = 'media-studio' AND i.kind = 'mcp' AND i.name LIKE 'dxb-mcp/%';
    SELECT count(*) INTO v_want FROM public.library_items
     WHERE kind = 'mcp' AND name IN ('dxb-mcp/approval','dxb-mcp/audit','dxb-mcp/cost','dxb-mcp/crm',
                                     'dxb-mcp/dashboard','dxb-mcp/memory','dxb-mcp/queue','dxb-mcp/registry','dxb-mcp/media');
    IF v_n < v_want THEN
      RAISE EXCEPTION 'B43 kit: media-studio holds % of the % dxb-mcp group items this engine carries', v_n, v_want;
    END IF;
  END IF;
END $$;

COMMIT;
