-- 20260915002000 — W9: the two assigned seats become a RECORD, and the media drawer reaches them
--
-- WHY: the Media Studio was founded on 2026-09-03 with 16 seats, two of which are not new hires but
-- EXISTING employees of other departments, assigned to the studio (ledger
-- `media-studio-department-and-16-experts-2026-09-03`, "2 existing experts assigned"):
--   design-image-prompt-engineer        (home: design)     — Image Prompt Engineer
--   marketing-short-video-editing-coach (home: marketing)  — Short-Video Editing Coach
-- That assignment lived only in prose. Measured 2026-09-15 (audit F033): the two seats cannot work the
-- studio road at all — their home profiles emit 0 `media_*` tools where `media-studio.mcp.json` emits 5,
-- and both dispatcher doors refuse them ("belongs to 'design', not 'media-studio'"). The department is
-- described as 16 seats and 14 of them can be dispatched.
--
-- WHAT (the plan the CEO approved, EVIDENCE-W4b § "W9", his word 2026-09-15 "onay"):
--   A) `agent_assignments` — one row per assigned seat: the seat, the department it is assigned TO, the
--      title it carries there, since when, and the ledger entry that ordered it. The seat's HOME
--      department (`agents.department`) is not touched: an assignment is a second membership, not a move.
--   B) the two rows, written idempotently and self-skipping where either side is absent.
--   C) `dxb-mcp/media` granted `grantee_kind='employee'` to the two seats through the ONE door,
--      `control_library_action` (HOLDING_LIBRARY §3/§6) — the same idiom `20260903190000_b43_media_hands.sql`
--      used for the department grant. The mechanism already existed and had 0 rows using it.
--
-- WHAT THIS DOES NOT DO: nobody else in design or marketing gains a media tool (the grant is per employee,
-- and the department profiles are untouched); no seat changes department; no persona text moves.
--
-- ROLLBACK:
--   DELETE FROM public.library_grants g USING public.library_items i, public.agents a
--    WHERE g.item_id = i.id AND i.name = 'dxb-mcp/media' AND g.grantee_kind = 'employee'
--      AND g.grantee_id = a.id::text
--      AND a.slug IN ('design-image-prompt-engineer','marketing-short-video-editing-coach');
--   DROP TABLE IF EXISTS public.agent_assignments;
--   -- then recompile the gateway profiles (the two `<slug>.employee.mcp.json` overlays disappear)
--   -- and revert the two door checks in packages/dxb-mcp/src/groups/queue.ts.

BEGIN;

-- A) the record -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agent_assignments (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  agent_id      uuid NOT NULL REFERENCES public.agents(id),
  department_id uuid NOT NULL REFERENCES public.departments(id),
  seat_title    text NOT NULL,
  since         date NOT NULL,
  ledger_id     text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (agent_id, department_id)
);

COMMENT ON TABLE public.agent_assignments IS
  'W9 (CEO 2026-09-15): an employee of one department assigned to ALSO serve a seat in another. '
  'A second membership, never a move — agents.department stays the home department. The dispatcher '
  'reads this table to accept a cross-department seat, and the gateway profile compiler reads it to '
  'let the seat''s overlay draw on the assigned department''s surface as well as its home one.';

ALTER TABLE public.agent_assignments ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.agent_assignments TO authenticated;

CREATE INDEX IF NOT EXISTS agent_assignments_dept_idx ON public.agent_assignments (department_id);

-- B) the two rows the 2026-09-03 founding ordered ----------------------------
INSERT INTO public.agent_assignments (agent_id, department_id, seat_title, since, ledger_id)
SELECT a.id, d.id, v.seat_title, DATE '2026-09-03', 'media-studio-department-and-16-experts-2026-09-03'
  FROM (VALUES
         ('design-image-prompt-engineer',        'Image Prompt Engineer'),
         ('marketing-short-video-editing-coach', 'Short-Video Editing Coach')
       ) AS v(slug, seat_title)
  JOIN public.agents a       ON a.slug = v.slug
  JOIN public.departments d  ON d.slug = 'media-studio'
 WHERE NOT EXISTS (SELECT 1 FROM public.agent_assignments x
                    WHERE x.agent_id = a.id AND x.department_id = d.id);

-- C) the drawer, per employee, through the one door --------------------------
DO $$
DECLARE
  v_item uuid;
  v_emp  uuid;
  v_slug text;
  v_resp jsonb;
BEGIN
  SELECT id INTO v_item FROM public.library_items WHERE kind = 'mcp' AND name = 'dxb-mcp/media' LIMIT 1;
  IF v_item IS NULL THEN
    RETURN;  -- an engine without the studio's hands: nothing to grant (self-skip, as B43's own migration does)
  END IF;

  -- grant is CEO-only (HOLDING_LIBRARY §13): this migration carries his written approval of 2026-09-15
  -- (w9-assigned-seats-plan-approved-2026-09-15), so it speaks in CEO context for the calls below —
  -- transaction-local, the same idiom as 20260903190000_b43_media_hands.sql.
  PERFORM set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);

  FOR v_slug IN SELECT unnest(ARRAY['design-image-prompt-engineer','marketing-short-video-editing-coach'])
  LOOP
    SELECT id INTO v_emp FROM public.agents WHERE slug = v_slug;
    CONTINUE WHEN v_emp IS NULL;
    CONTINUE WHEN EXISTS (SELECT 1 FROM public.library_grants
                           WHERE item_id = v_item AND grantee_kind = 'employee' AND grantee_id = v_emp::text);
    v_resp := public.control_library_action(jsonb_build_object(
      'action', 'grant', 'item_id', v_item::text, 'grantee_kind', 'employee', 'grantee_id', v_emp::text),
      'w9-assigned-seat-media-grant-2026-09-15-' || v_slug);  -- one key per seat: the door refuses a reused key with IDEMPOTENCY_MISMATCH
    IF coalesce((v_resp->>'ok')::boolean, false) IS FALSE THEN
      RAISE EXCEPTION 'W9: employee grant failed for %: %', v_slug, v_resp;
    END IF;
  END LOOP;
END $$;

-- D) audit: an authority change is a recorded act, not a silent row ----------
INSERT INTO public.audit_log (actor, actor_type, action, payload)
SELECT 'ceo', 'system', 'library_grant',
       jsonb_build_object('reason', 'W9 (CEO 2026-09-15 "onay"): the two assigned studio seats recorded in agent_assignments and granted dxb-mcp/media as employees; their home departments unchanged')
WHERE EXISTS (SELECT 1 FROM public.agent_assignments)
  AND NOT EXISTS (SELECT 1 FROM public.audit_log WHERE action = 'library_grant'
                   AND payload->>'reason' LIKE 'W9 (CEO 2026-09-15%');

COMMIT;
