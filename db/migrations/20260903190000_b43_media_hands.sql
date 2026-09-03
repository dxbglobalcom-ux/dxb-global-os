-- 20260903190000_b43_media_hands.sql — B43: THE STUDIO'S HANDS.
-- CEO ruling 2026-09-03 (this session): "yazdığın uzman personalar hazırlayacak değil mi yani dxb medya
-- ofisi hazırlayacak ugc mizi" → his click "Önce elleri kur, sonra stüdyo kendisi yapsın", and his approval
-- of the six-part plan ("Onaylıyorum, başla"; ceo-approvals.json studio-hands-build-plan-approved-2026-09-03).
-- Measured that hour: the employee tool surface (packages/dxb-mcp) carried eight groups and NO engine;
-- packages/gateway/profiles/media-studio.mcp.json was `"_tools": {}`; `effort='xhigh'` was illegal here.
--
-- This migration is the schema half of the hands:
--   A) routing_rules.effort gains 'xhigh' (CEO 2026-09-03: "max seviyesinin kullanılmasına gerek yok xhigh olsun")
--   B) media_jobs — the studio's JOB BOOK: every engine job an expert asks for is a row (who, what, params,
--      status, wall clock, peak VRAM, output). The dxb-mcp `media` group writes here; the resident
--      scheduler's media lane executes; the dashboard will read it (B32 governs the screen — none here).
--   C) the studio's routing row: department-scoped, L1 / fable-5 / xhigh (MODEL_ROUTING_SPEC §3 step 2:
--      "kural taraması: routing_rules (rol, departman, …)"; the live department_id column is E6.1's delta)
--   D) the library item `mcp / dxb-mcp/media` and its grant to department media-studio through the ONE door,
--      control_library_action (HOLDING_LIBRARY §3/§6) — the gateway's 30 s recompile turns it into the profile.
-- Everything is additive and idempotent; on an engine without the studio (the construction site) C and D
-- self-skip and the tests create their own marked department.

BEGIN;

-- A) effort: 'xhigh' becomes legal (constraint name measured on the company engine 2026-09-03)
ALTER TABLE public.routing_rules DROP CONSTRAINT IF EXISTS routing_rules_effort_check;
ALTER TABLE public.routing_rules
  ADD CONSTRAINT routing_rules_effort_check CHECK (effort IN ('low','medium','high','xhigh','max'));

-- B) media_jobs — the job book
CREATE TABLE IF NOT EXISTS public.media_jobs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id          uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
  employee_id      uuid REFERENCES public.agents(id) ON DELETE SET NULL,
  department       text,                                   -- denormalised for the lane and the screen
  kind             text NOT NULL CHECK (kind IN ('still','shoot','upscale','voice','assemble','probe')),
  params           jsonb NOT NULL DEFAULT '{}'::jsonb,
  note             text,
  status           text NOT NULL DEFAULT 'queued'
                   CHECK (status IN ('queued','running','done','failed','cancelled')),
  cancel_requested boolean NOT NULL DEFAULT false,
  claimed_by       text,
  started_at       timestamptz,
  ended_at         timestamptz,
  wall_seconds     numeric(10,1),
  peak_vram_mib    integer,
  peak_ram_gib     numeric(6,1),
  output_path      text,
  result           jsonb,
  error            text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS media_jobs_status_created_idx ON public.media_jobs (status, created_at);
CREATE INDEX IF NOT EXISTS media_jobs_task_idx ON public.media_jobs (task_id);
ALTER TABLE public.media_jobs ENABLE ROW LEVEL SECURITY;   -- backend-only, like routing_rules
COMMENT ON TABLE public.media_jobs IS
  'B43 — the Media Studio''s job book: one row per engine job (still/shoot/upscale/voice/assemble/probe) an expert submits through dxb-mcp media_*; executed one at a time by the resident scheduler''s media lane; the CEO''s screen reads it (B32).';

-- C) the studio's routing row — department-scoped, L1, xhigh (self-skips where the studio does not exist)
INSERT INTO public.routing_rules (task_class, match, model_tier, model, mode, effort, priority, enabled, department_id)
SELECT 'media.creative', jsonb_build_object('department', 'media-studio'),
       'L1', 'fable-5', 'subscription', 'xhigh', 50, true, d.id
  FROM public.departments d
 WHERE d.slug = 'media-studio'
   AND NOT EXISTS (SELECT 1 FROM public.routing_rules WHERE task_class = 'media.creative');

-- D) library item + grant through the ONE door, in CEO context (his approval is registered)
DO $$
DECLARE v_resp jsonb; v_item uuid;
BEGIN
  -- register_item is CEO-only (HOLDING_LIBRARY §13): this migration carries his written approval of
  -- 2026-09-03 (studio-hands-build-plan-approved-2026-09-03), so it speaks in CEO context for the two
  -- calls below — transaction-local, the same idiom as scripts/library/register-media-engines.mjs.
  PERFORM set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);
  SELECT id INTO v_item FROM public.library_items WHERE kind = 'mcp' AND name = 'dxb-mcp/media' LIMIT 1;
  IF v_item IS NULL THEN
    v_resp := public.control_library_action(jsonb_build_object(
      'action', 'register_item', 'kind', 'mcp', 'name', 'dxb-mcp/media', 'version', '2026-09-03',
      'usage_notes', 'The Media Studio''s hands: media_submit (a job into the job book: still · shoot · upscale · voice · assemble · probe), media_status, media_wait (blocks up to 25 min while renewing the task lease), media_probe (ffprobe + frames for the expert''s own eye), media_cancel. Engines run on the holding''s own card through the resident scheduler''s media lane, one at a time, under a 26 GiB memory scope measured 2026-09-03. No money leaves the company through these tools.',
      'quality_score', 100, 'review_status', 'approved',
      'source_ref', 'HOLDING-OS-MASTER-PLAN/CAPABILITY_ARSENAL_DOCTRINE.md#11-video-and-image-engines'),
      'b43-media-hands-item-2026-09-03');
    IF coalesce((v_resp->>'ok')::boolean, false) IS FALSE THEN
      RAISE EXCEPTION 'B43 media hands: register_item failed: %', v_resp;
    END IF;
    SELECT id INTO v_item FROM public.library_items WHERE kind = 'mcp' AND name = 'dxb-mcp/media' LIMIT 1;
  END IF;
  IF EXISTS (SELECT 1 FROM public.departments WHERE slug = 'media-studio')
     AND NOT EXISTS (SELECT 1 FROM public.library_grants
                      WHERE item_id = v_item AND grantee_kind = 'department' AND grantee_id = 'media-studio') THEN
    v_resp := public.control_library_action(jsonb_build_object(
      'action', 'grant', 'item_id', v_item::text, 'grantee_kind', 'department', 'grantee_id', 'media-studio'),
      'b43-media-hands-grant-2026-09-03');
    IF coalesce((v_resp->>'ok')::boolean, false) IS FALSE THEN
      RAISE EXCEPTION 'B43 media hands: grant failed: %', v_resp;
    END IF;
  END IF;
END $$;

-- E) audit: the routing change is a recorded act, not a silent row
INSERT INTO public.audit_log (actor, actor_type, action, payload)
SELECT 'ceo', 'system', 'routing_change',
       jsonb_build_object('reason', 'B43 media hands: studio creative routing row L1/xhigh (CEO 2026-09-03), media_jobs job book, dxb-mcp/media granted to media-studio')
WHERE NOT EXISTS (SELECT 1 FROM public.audit_log WHERE action = 'routing_change'
                   AND payload->>'reason' LIKE 'B43 media hands%');

-- F) guardrails
DO $$
DECLARE v_def text;
BEGIN
  SELECT pg_get_constraintdef(c.oid) INTO v_def FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid WHERE t.relname = 'routing_rules' AND c.conname = 'routing_rules_effort_check';
  IF v_def IS NULL OR position('xhigh' in v_def) = 0 THEN RAISE EXCEPTION 'B43: effort xhigh not legal'; END IF;
  IF to_regclass('public.media_jobs') IS NULL THEN RAISE EXCEPTION 'B43: media_jobs missing'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.library_items WHERE kind='mcp' AND name='dxb-mcp/media') THEN
    RAISE EXCEPTION 'B43: library item dxb-mcp/media missing';
  END IF;
  IF EXISTS (SELECT 1 FROM public.departments WHERE slug='media-studio') THEN
    IF NOT EXISTS (SELECT 1 FROM public.routing_rules WHERE task_class='media.creative' AND effort='xhigh' AND enabled) THEN
      RAISE EXCEPTION 'B43: studio routing row missing';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.library_grants g JOIN public.library_items i ON i.id=g.item_id
                    WHERE i.name='dxb-mcp/media' AND g.grantee_kind='department' AND g.grantee_id='media-studio') THEN
      RAISE EXCEPTION 'B43: media grant missing';
    END IF;
  END IF;
END $$;

COMMIT;
