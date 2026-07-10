-- crm_ceo_edit_path: CEO field-scoped CRM editing (DASH-04, 08-06).
-- ⛔ RLS/write-path change: Fable-only.
--
-- Same door pattern as 0015: ONE SECURITY DEFINER function, EXECUTE for
-- authenticated only, zero table/column UPDATE grants — so every direct
-- PostgREST write stays denied and the UI whitelist can never drift wider
-- than the database (parity is structural, and the test asserts both).
-- Field whitelists (the CEO's editable surface, mirrored in lib/crm.ts):
--   clients:  name, status        contacts: name, email, phone, role
--   requests: status              deals:    title, value_eur, stage
-- Unknown keys RAISE (never silently ignored); enum CHECKs still apply;
-- every edit appends ONE audit_log row (actor='ceo', action='crm.update').

CREATE OR REPLACE FUNCTION crm_update(
  p_entity text,
  p_id uuid,
  p_fields jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_allowed text[];
  v_key text;
  v_count int;
BEGIN
  v_allowed := CASE p_entity
    WHEN 'clients'  THEN ARRAY['name', 'status']
    WHEN 'contacts' THEN ARRAY['name', 'email', 'phone', 'role']
    WHEN 'requests' THEN ARRAY['status']
    WHEN 'deals'    THEN ARRAY['title', 'value_eur', 'stage']
    ELSE NULL
  END;
  IF v_allowed IS NULL THEN
    RAISE EXCEPTION 'unknown crm entity: %', p_entity;
  END IF;

  IF p_fields IS NULL OR p_fields = '{}'::jsonb THEN
    RAISE EXCEPTION 'empty field set';
  END IF;

  FOR v_key IN SELECT jsonb_object_keys(p_fields) LOOP
    IF NOT v_key = ANY (v_allowed) THEN
      RAISE EXCEPTION 'field % is not CEO-editable on crm_%', v_key, p_entity;
    END IF;
  END LOOP;

  CASE p_entity
    WHEN 'clients' THEN
      UPDATE crm_clients SET
        name   = coalesce(p_fields->>'name', name),
        status = coalesce(p_fields->>'status', status)
      WHERE id = p_id;
    WHEN 'contacts' THEN
      UPDATE crm_contacts SET
        name  = coalesce(p_fields->>'name', name),
        email = CASE WHEN p_fields ? 'email' THEN p_fields->>'email' ELSE email END,
        phone = CASE WHEN p_fields ? 'phone' THEN p_fields->>'phone' ELSE phone END,
        role  = CASE WHEN p_fields ? 'role'  THEN p_fields->>'role'  ELSE role  END
      WHERE id = p_id;
    WHEN 'requests' THEN
      UPDATE crm_requests SET
        status = coalesce(p_fields->>'status', status)
      WHERE id = p_id;
    WHEN 'deals' THEN
      UPDATE crm_deals SET
        title     = coalesce(p_fields->>'title', title),
        value_eur = CASE WHEN p_fields ? 'value_eur' THEN (p_fields->>'value_eur')::numeric(12,2) ELSE value_eur END,
        stage     = coalesce(p_fields->>'stage', stage)
      WHERE id = p_id;
  END CASE;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count = 0 THEN
    RAISE EXCEPTION 'crm_% row % not found', p_entity, p_id;
  END IF;

  INSERT INTO audit_log (actor, actor_type, action, payload)
  VALUES ('ceo', 'ceo', 'crm.update',
          jsonb_build_object('entity', p_entity, 'entity_id', p_id, 'fields', p_fields));

  RETURN jsonb_build_object('updated', 1);
END;
$$;

REVOKE ALL ON FUNCTION crm_update(text, uuid, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION crm_update(text, uuid, jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION crm_update(text, uuid, jsonb) TO authenticated;
