-- E9.5 — Holding Library control surface (HOLDING_LIBRARY_SPEC).
-- 0024x/0024x-b tables are LIVE since 20260711002400/002450. This migration adds:
--   1. library_grants.expires_at — adaptation A2: PERMISSION_MODEL (edge, line
--      141) assigns temporary grants an expires_at column "in 0024x", which
--      shipped without it; expired grants are dead everywhere (compiler, view).
--   2. library_items.source_ref — adaptation A3: §16 keeps the item BODY out
--      of the DB and mandates a source-location reference (repo path / package
--      name / MCP group), but the §4 model had no field for it.
--   3. v_library_catalog v2 — §7 item card needs the 11 directive fields in
--      one read: adds usage_notes, dependencies, source_ref, owner display
--      columns, change count, active (non-expired) grant count.
--   4. control_library_action — API_CONTRACTS 8b `library` row (4 ops:
--      register_item/update_item/grant/revoke_grant), adaptation A1 single-door
--      idiom (spec §5 wrote a control_library_{...} family), §13 CEO wall,
--      idempotency twin (0025x), field-level change_log written INSIDE the fn
--      (§5: cannot be skipped), audit row per call (§15, detail_ref →
--      library_change_log), settings-channel broadcasts library_item.changed /
--      library_grant.changed (EVENT_MODEL §9b; §15 swallow rule).
--   5. trg_library_usage — adaptation A7: §6 asked for an async pg-boss
--      library.usage hop; the async property is already provided by the E8.1
--      observability batch buffer (tool_calls writes never block the agent),
--      so the counter rides an AFTER INSERT trigger on tool_calls instead.
--      Errors swallowed: usage_log is a counter, not an audit surface (§14).
-- Idempotent: safe to re-run.
--
-- ROLLBACK (spec §23): DROP TRIGGER trg_library_usage ON tool_calls;
-- DROP FUNCTION fn_library_usage, control_library_action; re-run the
-- v_library_catalog block of 20260711002500_api_support.sql; ALTER TABLE
-- library_grants DROP COLUMN expires_at; ALTER TABLE library_items DROP
-- COLUMN source_ref. 0024x tables stay (that family owns them).

-- ── 1+2. columns (adaptations A2, A3) ───────────────────────────────────────
ALTER TABLE public.library_grants
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;
COMMENT ON COLUMN public.library_grants.expires_at is
  'E9.5 adaptation A2 (PERMISSION_MODEL edge): temporary grant expiry — expired grants are skipped by the profile compiler and the catalog view; NULL = permanent.';

ALTER TABLE public.library_items
  ADD COLUMN IF NOT EXISTS source_ref text;
COMMENT ON COLUMN public.library_items.source_ref is
  'E9.5 adaptation A3 (HOLDING_LIBRARY §16): source-location reference (repo path / package name / MCP group) — the item body itself never enters the DB.';

-- ── 3. v_library_catalog v2 (§7 — 11 directive fields, one read) ────────────
DROP VIEW IF EXISTS public.v_library_catalog;
CREATE VIEW public.v_library_catalog
WITH (security_invoker = true) AS
SELECT
  li.id, li.kind, li.name, li.version, li.owner_dept, li.owner_employee_id,
  li.usage_notes, li.dependencies, li.source_ref,
  li.quality_score, li.review_status, li.last_used_at, li.updated_at,
  d.slug  AS owner_dept_slug,
  d.display_name    AS owner_dept_name,
  d.display_name_tr AS owner_dept_name_tr,
  ow.slug AS owner_employee_slug,
  ow.title    AS owner_employee_title,
  ow.title_tr AS owner_employee_title_tr,
  (SELECT count(*)::int FROM public.library_grants g
    WHERE g.item_id = li.id
      AND (g.expires_at IS NULL OR g.expires_at > now()))                        AS grant_count,
  (SELECT count(*)::int FROM public.library_usage_log u WHERE u.item_id = li.id) AS usage_count,
  (SELECT count(*)::int FROM public.library_change_log c WHERE c.item_id = li.id) AS change_count
FROM public.library_items li
LEFT JOIN public.departments d ON d.id = li.owner_dept
LEFT JOIN public.agents ow ON ow.id = li.owner_employee_id;

COMMENT ON VIEW public.v_library_catalog is
  'E9.5 HOLDING_LIBRARY §7: catalog read surface — the 11 directive fields plus owner display columns and active-grant/usage/change counters (expired grants excluded, adaptation A2).';

GRANT SELECT ON public.v_library_catalog TO authenticated, service_role;

-- ── 4. control_library_action (API_CONTRACTS 8b; §13 CEO wall) ──────────────
-- Payload: {"action": "register_item"|"update_item"|"grant"|"revoke_grant", ...}
--   register_item: {kind, name, version?, owner_dept?(uuid|slug),
--                   owner_employee_id?, usage_notes?, dependencies?,
--                   quality_score?, review_status?, source_ref?}
--                  existing (kind,name,version) → CONFLICT_STALE (§27 allows
--                  two versions of one capability — version-specific rows).
--   update_item:   {item_id | (kind,name,version)} + any register fields —
--                  field-level diff lands in library_change_log INSIDE the fn
--                  (§5); a diff-empty update writes no change row (no-op).
--   grant:         {item_id, grantee_kind: department|employee|role_level,
--                   grantee_id, expires_at?} — department accepts slug or uuid
--                  and is stored as the registry slug (profile compiler key);
--                  re-grant refreshes expires_at (union rule §19 — permissive,
--                  no conflict error).
--   revoke_grant:  {grant_id | (item_id, grantee_kind, grantee_id)}
CREATE OR REPLACE FUNCTION public.control_library_action(
  p_payload         jsonb,
  p_idempotency_key text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor      text;
  v_digest     text;
  v_prev       record;
  v_action     text;
  v_item       record;
  v_item_id    uuid;
  v_grant_id   bigint;
  v_grant      record;
  v_grantee    text;
  v_dept_uuid  uuid;
  v_changes    jsonb := '[]'::jsonb;
  v_change_id  bigint;
  v_audit_id   bigint;
  v_resp       jsonb;
  v_detail_tbl text;
  v_detail_id  text;
BEGIN
  v_actor := CASE
    WHEN auth.uid() IS NOT NULL THEN 'ceo'
    WHEN current_user IN ('service_role', 'postgres') THEN 'system'
  END;
  IF v_actor IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED');
  END IF;

  p_payload := jsonb_strip_nulls(p_payload);

  v_digest := md5('library|' || p_payload::text);
  SELECT request_digest, response INTO v_prev
    FROM control_idempotency WHERE key = p_idempotency_key;
  IF FOUND THEN
    IF v_prev.request_digest <> v_digest THEN
      RETURN jsonb_build_object('ok', false, 'error', 'IDEMPOTENCY_MISMATCH');
    END IF;
    RETURN v_prev.response;
  END IF;

  v_action := p_payload->>'action';
  IF v_action IS NULL OR v_action NOT IN
     ('register_item','update_item','grant','revoke_grant') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'action must be register_item|update_item|grant|revoke_grant');
  END IF;

  -- §13: registration and grant mutations are CEO-only through this seam.
  -- The HR onboarding exception grants nothing per person — HR only assigns
  -- role_level on agents; role-standard grants pre-exist as role_level rows.
  IF v_actor <> 'ceo' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED',
      'detail', 'library ' || v_action || ' is CEO-only (HOLDING_LIBRARY §13)');
  END IF;

  -- owner_dept normalization: uuid or registry slug.
  IF p_payload ? 'owner_dept' THEN
    BEGIN
      v_dept_uuid := (p_payload->>'owner_dept')::uuid;
    EXCEPTION WHEN invalid_text_representation THEN
      SELECT id INTO v_dept_uuid FROM departments WHERE slug = p_payload->>'owner_dept';
    END;
    IF v_dept_uuid IS NULL OR NOT EXISTS (SELECT 1 FROM departments WHERE id = v_dept_uuid) THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'owner_dept not found (uuid or registry slug)');
    END IF;
  END IF;

  IF v_action = 'register_item' THEN
    IF coalesce(p_payload->>'kind','') = '' OR coalesce(p_payload->>'name','') = '' THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'register_item needs kind and name');
    END IF;
    IF p_payload->>'kind' NOT IN (
        'skill','plugin','tool','mcp','prompt_template','persona','policy',
        'governance_rule','workflow','sop','framework','code_component',
        'design_system','research','report','project_doc','training',
        'memory_source','best_practice','lesson_learned') THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'kind must be one of the 20 directive item-13 kinds (DATA_MODEL 4.5)');
    END IF;
    IF EXISTS (SELECT 1 FROM library_items
                WHERE kind = p_payload->>'kind' AND name = p_payload->>'name'
                  AND version IS NOT DISTINCT FROM p_payload->>'version') THEN
      RETURN jsonb_build_object('ok', false, 'error', 'CONFLICT_STALE',
        'detail', 'item already registered for this kind/name/version — use update_item');
    END IF;
    INSERT INTO library_items (kind, name, version, owner_dept, owner_employee_id,
                               usage_notes, dependencies, quality_score,
                               review_status, source_ref)
    VALUES (p_payload->>'kind', p_payload->>'name', p_payload->>'version',
            v_dept_uuid, (p_payload->>'owner_employee_id')::uuid,
            p_payload->>'usage_notes',
            CASE WHEN p_payload ? 'dependencies'
                 THEN ARRAY(SELECT jsonb_array_elements_text(p_payload->'dependencies')) END,
            (p_payload->>'quality_score')::numeric,
            p_payload->>'review_status', p_payload->>'source_ref')
    RETURNING id INTO v_item_id;
    -- §5: creation is the first change_log entry ({field:'*'}).
    INSERT INTO library_change_log (item_id, changed_by, change)
    VALUES (v_item_id, v_actor,
            jsonb_build_array(jsonb_build_object('field', '*', 'old', NULL,
              'new', p_payload - 'action')))
    RETURNING id INTO v_change_id;
    v_detail_tbl := 'library_change_log'; v_detail_id := v_change_id::text;
    BEGIN
      PERFORM notify_broadcast('settings', 'library_item.changed', jsonb_build_object(
        'actor', v_actor,
        'entity', jsonb_build_object('kind', 'library_item', 'id', v_item_id::text),
        'corr', '{}'::jsonb,
        'payload', jsonb_build_object('op', 'register', 'kind', p_payload->>'kind',
                                      'name', p_payload->>'name', 'change_id', v_change_id)));
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'settings broadcast swallowed: %', SQLERRM;
    END;

  ELSIF v_action = 'update_item' THEN
    IF p_payload ? 'item_id' THEN
      SELECT * INTO v_item FROM library_items WHERE id = (p_payload->>'item_id')::uuid;
    ELSE
      SELECT * INTO v_item FROM library_items
       WHERE kind = p_payload->>'kind' AND name = p_payload->>'name'
         AND version IS NOT DISTINCT FROM p_payload->>'version';
    END IF;
    IF NOT FOUND THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'item not found (item_id or kind/name/version)');
    END IF;
    v_item_id := v_item.id;

    -- Field-level diff (§5/§14: change = {field, old, new} list) — only fields
    -- present in the payload AND actually different are recorded and applied.
    IF p_payload ? 'usage_notes' AND p_payload->>'usage_notes' IS DISTINCT FROM v_item.usage_notes THEN
      v_changes := v_changes || jsonb_build_object('field','usage_notes','old',v_item.usage_notes,'new',p_payload->>'usage_notes');
    END IF;
    IF p_payload ? 'quality_score' AND (p_payload->>'quality_score')::numeric IS DISTINCT FROM v_item.quality_score THEN
      v_changes := v_changes || jsonb_build_object('field','quality_score','old',v_item.quality_score,'new',(p_payload->>'quality_score')::numeric);
    END IF;
    IF p_payload ? 'review_status' AND p_payload->>'review_status' IS DISTINCT FROM v_item.review_status THEN
      v_changes := v_changes || jsonb_build_object('field','review_status','old',v_item.review_status,'new',p_payload->>'review_status');
    END IF;
    IF p_payload ? 'source_ref' AND p_payload->>'source_ref' IS DISTINCT FROM v_item.source_ref THEN
      v_changes := v_changes || jsonb_build_object('field','source_ref','old',v_item.source_ref,'new',p_payload->>'source_ref');
    END IF;
    IF p_payload ? 'owner_dept' AND v_dept_uuid IS DISTINCT FROM v_item.owner_dept THEN
      v_changes := v_changes || jsonb_build_object('field','owner_dept','old',v_item.owner_dept,'new',v_dept_uuid);
    END IF;
    IF p_payload ? 'owner_employee_id' AND (p_payload->>'owner_employee_id')::uuid IS DISTINCT FROM v_item.owner_employee_id THEN
      v_changes := v_changes || jsonb_build_object('field','owner_employee_id','old',v_item.owner_employee_id,'new',(p_payload->>'owner_employee_id')::uuid);
    END IF;
    IF p_payload ? 'dependencies' THEN
      IF ARRAY(SELECT jsonb_array_elements_text(p_payload->'dependencies'))
         IS DISTINCT FROM v_item.dependencies THEN
        v_changes := v_changes || jsonb_build_object('field','dependencies',
          'old', to_jsonb(v_item.dependencies),
          'new', p_payload->'dependencies');
      END IF;
    END IF;

    IF jsonb_array_length(v_changes) = 0 THEN
      -- Nothing actually changed: a no-op is not an update — no change row.
      v_resp := jsonb_build_object('ok', true, 'action', v_action,
                  'item_id', v_item_id, 'no_change', true);
      INSERT INTO control_idempotency (key, request_digest, response)
      VALUES (p_idempotency_key, v_digest, v_resp);
      RETURN v_resp;
    END IF;

    UPDATE library_items SET
      usage_notes       = CASE WHEN p_payload ? 'usage_notes' THEN p_payload->>'usage_notes' ELSE usage_notes END,
      quality_score     = CASE WHEN p_payload ? 'quality_score' THEN (p_payload->>'quality_score')::numeric ELSE quality_score END,
      review_status     = CASE WHEN p_payload ? 'review_status' THEN p_payload->>'review_status' ELSE review_status END,
      source_ref        = CASE WHEN p_payload ? 'source_ref' THEN p_payload->>'source_ref' ELSE source_ref END,
      owner_dept        = CASE WHEN p_payload ? 'owner_dept' THEN v_dept_uuid ELSE owner_dept END,
      owner_employee_id = CASE WHEN p_payload ? 'owner_employee_id' THEN (p_payload->>'owner_employee_id')::uuid ELSE owner_employee_id END,
      dependencies      = CASE WHEN p_payload ? 'dependencies'
                               THEN ARRAY(SELECT jsonb_array_elements_text(p_payload->'dependencies'))
                               ELSE dependencies END,
      updated_at        = now()
    WHERE id = v_item_id;

    INSERT INTO library_change_log (item_id, changed_by, change)
    VALUES (v_item_id, v_actor, v_changes)
    RETURNING id INTO v_change_id;
    v_detail_tbl := 'library_change_log'; v_detail_id := v_change_id::text;
    BEGIN
      PERFORM notify_broadcast('settings', 'library_item.changed', jsonb_build_object(
        'actor', v_actor,
        'entity', jsonb_build_object('kind', 'library_item', 'id', v_item_id::text),
        'corr', '{}'::jsonb,
        'payload', jsonb_build_object('op', 'update', 'change_id', v_change_id,
                                      'fields', (SELECT jsonb_agg(c->>'field')
                                                   FROM jsonb_array_elements(v_changes) c))));
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'settings broadcast swallowed: %', SQLERRM;
    END;

  ELSIF v_action = 'grant' THEN
    IF (p_payload->>'item_id') IS NULL
       OR p_payload->>'grantee_kind' IS NULL
       OR p_payload->>'grantee_kind' NOT IN ('department','employee','role_level')
       OR coalesce(p_payload->>'grantee_id','') = '' THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'grant needs item_id, grantee_kind department|employee|role_level, grantee_id');
    END IF;
    v_item_id := (p_payload->>'item_id')::uuid;
    IF NOT EXISTS (SELECT 1 FROM library_items WHERE id = v_item_id) THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'item not found');
    END IF;
    v_grantee := p_payload->>'grantee_id';
    IF p_payload->>'grantee_kind' = 'employee' THEN
      IF NOT EXISTS (SELECT 1 FROM agents WHERE id = v_grantee::uuid) THEN
        RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
          'detail', 'employee not found');
      END IF;
    ELSIF p_payload->>'grantee_kind' = 'department' THEN
      -- Stored as the registry slug — the profile compiler's department key.
      IF EXISTS (SELECT 1 FROM departments WHERE slug = v_grantee) THEN
        NULL;
      ELSE
        BEGIN
          SELECT slug INTO STRICT v_grantee FROM departments WHERE id = v_grantee::uuid;
        EXCEPTION WHEN OTHERS THEN
          RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
            'detail', 'department not found (slug or uuid)');
        END;
      END IF;
    END IF;
    INSERT INTO library_grants (item_id, grantee_kind, grantee_id, granted_by, expires_at)
    VALUES (v_item_id, p_payload->>'grantee_kind', v_grantee, v_actor,
            (p_payload->>'expires_at')::timestamptz)
    ON CONFLICT (item_id, grantee_kind, grantee_id)
      DO UPDATE SET expires_at = (p_payload->>'expires_at')::timestamptz,
                    granted_by = v_actor
    RETURNING id INTO v_grant_id;
    v_detail_tbl := 'library_grants'; v_detail_id := v_grant_id::text;
    BEGIN
      PERFORM notify_broadcast('settings', 'library_grant.changed', jsonb_build_object(
        'actor', v_actor,
        'entity', jsonb_build_object('kind', 'library_item', 'id', v_item_id::text),
        'corr', '{}'::jsonb,
        'payload', jsonb_build_object('op', 'grant', 'grant_id', v_grant_id,
                                      'grantee_kind', p_payload->>'grantee_kind',
                                      'grantee_id', v_grantee)));
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'settings broadcast swallowed: %', SQLERRM;
    END;

  ELSIF v_action = 'revoke_grant' THEN
    IF p_payload ? 'grant_id' THEN
      SELECT * INTO v_grant FROM library_grants WHERE id = (p_payload->>'grant_id')::bigint;
    ELSE
      SELECT * INTO v_grant FROM library_grants
       WHERE item_id = (p_payload->>'item_id')::uuid
         AND grantee_kind = p_payload->>'grantee_kind'
         AND grantee_id = p_payload->>'grantee_id';
    END IF;
    IF NOT FOUND THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'grant not found');
    END IF;
    DELETE FROM library_grants WHERE id = v_grant.id;
    v_item_id := v_grant.item_id; v_grant_id := v_grant.id;
    v_detail_tbl := 'library_items'; v_detail_id := v_item_id::text;
    BEGIN
      PERFORM notify_broadcast('settings', 'library_grant.changed', jsonb_build_object(
        'actor', v_actor,
        'entity', jsonb_build_object('kind', 'library_item', 'id', v_item_id::text),
        'corr', '{}'::jsonb,
        'payload', jsonb_build_object('op', 'revoke', 'grant_id', v_grant.id,
                                      'grantee_kind', v_grant.grantee_kind,
                                      'grantee_id', v_grant.grantee_id)));
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'settings broadcast swallowed: %', SQLERRM;
    END;
  END IF;

  -- ── audit (API_CONTRACTS §14: every B-class call writes its own row) ─────
  INSERT INTO audit_log (actor, actor_type, action, payload, detail_ref)
  VALUES (v_actor, 'ceo', 'library.' || v_action,
          jsonb_build_object('item_id', v_item_id)
            || CASE WHEN v_grant_id IS NOT NULL THEN jsonb_build_object('grant_id', v_grant_id) ELSE '{}'::jsonb END,
          jsonb_build_object('table', v_detail_tbl, 'id', v_detail_id))
  RETURNING id INTO v_audit_id;

  v_resp := jsonb_build_object('ok', true, 'action', v_action,
              'item_id', v_item_id, 'audit_id', v_audit_id);
  IF v_change_id IS NOT NULL THEN v_resp := v_resp || jsonb_build_object('change_id', v_change_id); END IF;
  IF v_grant_id  IS NOT NULL THEN v_resp := v_resp || jsonb_build_object('grant_id', v_grant_id);   END IF;

  INSERT INTO control_idempotency (key, request_digest, response)
  VALUES (p_idempotency_key, v_digest, v_resp);
  RETURN v_resp;
END $$;

COMMENT ON FUNCTION public.control_library_action(jsonb, text) IS
  'E9.5 HOLDING_LIBRARY §5/§13/§14: the single write door for library records — register_item/update_item/grant/revoke_grant. CEO-only; update change-diffs land in library_change_log inside the fn; grant changes broadcast on the settings channel and feed the gateway profile compiler.';

REVOKE ALL ON FUNCTION public.control_library_action(jsonb, text)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.control_library_action(jsonb, text)
  TO authenticated, service_role;

-- ── 5. usage counter (adaptation A7) ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.fn_library_usage()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_item_id uuid;
  v_used_by uuid;
BEGIN
  BEGIN
    SELECT id INTO v_item_id FROM library_items
     WHERE kind = 'tool'
       AND (name = 'dxb-mcp.' || NEW.tool OR name = NEW.tool)
     LIMIT 1;
    IF v_item_id IS NOT NULL THEN
      IF NEW.run_id IS NOT NULL THEN
        SELECT employee_id INTO v_used_by FROM agent_runs WHERE id = NEW.run_id;
      END IF;
      INSERT INTO library_usage_log (item_id, used_by, run_id, used_at)
      VALUES (v_item_id, v_used_by, NEW.run_id, NEW.created_at);
      UPDATE library_items SET last_used_at = NEW.created_at WHERE id = v_item_id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- §14: usage_log is a counter, never an audit surface — a lost row must
    -- never fail the observed tool call's write path.
    RAISE WARNING 'library usage counter swallowed: %', SQLERRM;
  END;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_library_usage ON public.tool_calls;
CREATE TRIGGER trg_library_usage
  AFTER INSERT ON public.tool_calls
  FOR EACH ROW EXECUTE FUNCTION public.fn_library_usage();

COMMENT ON FUNCTION public.fn_library_usage() is
  'E9.5 adaptation A7: usage counter rides the E8.1 tool_calls batch path (already async/non-blocking) instead of a redundant pg-boss hop; matches kind=tool items by <server>.<tool> naming.';
