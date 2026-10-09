-- B51 step 3 · P2 — THE SUCCESSION DOOR.
-- CEO 2026-10-09: "'hey opus 6 çıkmış ey hamza' dediğimde cart diye modeller güncellenmeli" (registered
-- all-brains-stay-current-gate-judges-2026-10-09). Spec: .planning/quick/20261009-masa-b51/step3-spec.md §P2,
-- design agreed at the table 2026-10-10 (lead Opus 5.5, second eye Fable 5.1).
--
-- fn_succeed_model(old, new, rationale, authority, idempotency_key) moves EVERY seat a model holds to its
-- successor in one transaction and retires the old row; fn_undo_succession(audit_id, key) puts back every
-- seat that still names the successor. Measured before this file (company, read-only, 2026-10-10):
--   · no change table and no undo exist for routing_rules, agents.brain or model_catalog — the only undo is
--     control_settings_undo, so the door keeps its own before-photograph in audit_log.payload;
--   · model_catalog.fallback_of on row X means "if X fails, use fallback_of" (fn_model_fallback);
--   · brains: claude-sonnet-5 slot 166, fable-5 slot 23 + ceo_override 10, fable-5.1 slot 14. His own
--     choices move too: the old row is retired and resolveModel refuses a retired model, so a seat left on it
--     could never run again. brain_source is kept — his choice was the seat's, not the model's;
--   · fn_update_routing / control_settings_undo derive the actor from current_user, which inside SECURITY
--     DEFINER is always the owner (anon counts as 'system' there). This door does NOT copy that: the actor
--     comes from the request's JWT role or the session's login role, and anon has no EXECUTE at all.
-- The door is mechanical. Whether a dearer successor may move a seat is the CALLER's policy (the drawer,
-- Hamza's tool, P4) — the door returns both prices and says whether the price rises. It writes no alias:
-- a historical row naming the old id stays on the retired row and resolveModel refuses it loudly.

-- ── succession is a change source of its own, never hidden under 'system' ─────────────────────────────
ALTER TABLE public.settings_change_log DROP CONSTRAINT IF EXISTS settings_change_log_change_source_check;
ALTER TABLE public.settings_change_log ADD CONSTRAINT settings_change_log_change_source_check
  CHECK (change_source IN ('ui', 'api', 'system', 'undo', 'succession'));

-- ── who is calling ───────────────────────────────────────────────────────────────────────────────────
-- 'ceo'    — a signed-in dashboard request (JWT role authenticated with a user id);
-- 'system' — the company's own runtime: a service_role request, or a direct login as postgres (the resident
--            scheduler, Hamza's deterministic command path, the canonical chain) with no request JWT;
-- NULL     — anyone else.
CREATE OR REPLACE FUNCTION public.fn_succession_actor()
RETURNS text LANGUAGE plpgsql STABLE SET search_path TO 'public' AS $$
DECLARE
  v_role text := nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'role';
BEGIN
  IF v_role = 'authenticated' AND auth.uid() IS NOT NULL THEN
    RETURN 'ceo';
  ELSIF v_role = 'service_role' THEN
    RETURN 'system';
  ELSIF v_role IS NULL AND session_user = 'postgres' THEN
    RETURN 'system';
  END IF;
  RETURN NULL;
END $$;

-- ── the door ─────────────────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.fn_succeed_model(
  p_old text, p_new text, p_rationale text, p_authority text, p_idempotency_key text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_actor text := fn_succession_actor();
  v_digest text;
  v_prev record;
  v_old model_catalog%ROWTYPE;
  v_new model_catalog%ROWTYPE;
  v_routing uuid[];
  v_agents jsonb;
  v_override int;
  v_fallbacks jsonb;
  v_settings jsonb := '[]'::jsonb;
  v_registry jsonb;
  v_gate int := 0;
  v_row record;
  v_val jsonb;
  v_log_id bigint;
  v_snapshot jsonb;
  v_audit_id bigint;
  v_decision_id bigint;
  v_moved jsonb;
  v_price jsonb;
  v_resp jsonb;
BEGIN
  IF v_actor IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED');
  END IF;
  IF coalesce(p_idempotency_key, '') = '' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED', 'detail', 'idempotency key required');
  END IF;
  -- Whose word moves the seats is read on every record. The system acts only on his word or a written policy.
  IF coalesce(p_authority, '') = '' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED', 'detail', 'authority required');
  END IF;
  IF v_actor = 'system' AND p_authority NOT LIKE 'ceo-%' AND p_authority NOT LIKE 'policy:%' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED',
      'detail', 'the system moves seats only on the CEO''s word (ceo-…) or a written policy (policy:…)');
  END IF;

  v_digest := md5('succeed|' || coalesce(p_old, '') || '|' || coalesce(p_new, '') || '|' || p_authority);
  SELECT request_digest, response INTO v_prev FROM control_idempotency WHERE key = p_idempotency_key;
  IF FOUND THEN
    IF v_prev.request_digest <> v_digest THEN
      RETURN jsonb_build_object('ok', false, 'error', 'IDEMPOTENCY_MISMATCH');
    END IF;
    RETURN v_prev.response;
  END IF;

  SELECT * INTO v_old FROM model_catalog WHERE id = p_old FOR UPDATE;
  IF NOT FOUND OR v_old.status = 'retired' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', coalesce(p_old, '(null)') || ' is not a live catalogue model');
  END IF;
  SELECT * INTO v_new FROM model_catalog WHERE id = p_new FOR UPDATE;
  IF NOT FOUND OR v_new.banned OR v_new.status NOT IN ('testing', 'active') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', coalesce(p_new, '(null)') || ' is not a callable catalogue model (testing or active; a degraded one is activated first)');
  END IF;
  IF p_old = p_new THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED', 'detail', 'a model cannot succeed itself');
  END IF;
  -- Same lane, or a seat would land on a model its caller cannot reach (an SDK seat on a Codex model, a
  -- gate seat on a Claude model).
  IF v_old.lane IS DISTINCT FROM v_new.lane THEN
    RETURN jsonb_build_object('ok', false, 'error', 'LANE_MISMATCH',
      'detail', p_old || ' runs on ' || coalesce(v_old.lane, 'no lane') || ', ' || p_new || ' on ' || coalesce(v_new.lane, 'no lane'));
  END IF;
  -- The laws the routing already keeps are not bypassed through this door: R2 (a mechanical-only model
  -- never takes a seat that gives verdicts — fn_routing_mechanical_slots, "no bypass path") and the brain
  -- floor (§4f: a successor's tier floor is at least the old one's, so an L1 seat never lands on an L2 model).
  IF v_new.mechanical_only AND NOT v_old.mechanical_only THEN
    RETURN jsonb_build_object('ok', false, 'error', 'MECHANICAL_ONLY',
      'detail', p_new || ' is mechanical-only; it may not take the verdict seats ' || p_old || ' served');
  END IF;
  IF v_old.tier_floor IS NOT NULL AND (v_new.tier_floor IS NULL
      OR substr(v_new.tier_floor, 2)::int > substr(v_old.tier_floor, 2)::int) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'TIER_FLOOR',
      'detail', p_new || ' (floor ' || coalesce(v_new.tier_floor, 'none') || ') is below ' || p_old || ' (floor ' || v_old.tier_floor || ')');
  END IF;
  IF v_new.lane IS NULL OR (v_new.lane <> 'local' AND v_new.api_model_id IS NULL) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', p_new || ' has no API name for its lane — it could not be called');
  END IF;

  -- ── the before-photograph, taken before anything moves (a trigger may move studio brains in step 2) ──
  SELECT coalesce(array_agg(id), '{}') INTO v_routing
    FROM routing_rules WHERE model = p_old OR model_id = p_old;
  SELECT coalesce(jsonb_agg(jsonb_build_object('id', id, 'brain_source', brain_source)), '[]'::jsonb),
         count(*) FILTER (WHERE brain_source = 'ceo_override')
    INTO v_agents, v_override
    FROM agents WHERE brain = p_old;
  SELECT coalesce(jsonb_agg(jsonb_build_object('id', id, 'fallback_of', fallback_of)), '[]'::jsonb)
    INTO v_fallbacks
    FROM model_catalog WHERE fallback_of = p_old AND id NOT IN (p_old, p_new);
  SELECT coalesce(jsonb_agg(jsonb_build_object('key', key, 'old_default', value_schema->'default')), '[]'::jsonb)
    INTO v_registry
    FROM settings_registry
   WHERE (value_schema->>'type' = 'model_ref' AND value_schema->'default' = to_jsonb(p_old))
      OR (key = 'gate.challengers' AND value_schema->'default' @> jsonb_build_array(jsonb_build_object('model', p_old)));

  -- 1. the successor goes live and names whom it succeeds; it inherits the fallback when it has none
  UPDATE model_catalog
     SET status = CASE WHEN status = 'testing' THEN 'active' ELSE status END,
         succeeds = coalesce(succeeds, p_old),
         fallback_of = CASE WHEN fallback_of IS NULL OR fallback_of = p_old
                            THEN nullif(v_old.fallback_of, p_new) ELSE fallback_of END
   WHERE id = p_new;

  -- 2. routing rows, disabled ones too (a re-enabled row must not wake on a retired model); updated_at is
  --    left alone — loadPolicy orders by it
  UPDATE routing_rules SET model = p_new, model_id = p_new WHERE id = ANY (v_routing);

  -- 3. every brain that named the old model, whatever its source
  UPDATE agents SET brain = p_new, updated_at = now()
   WHERE id IN (SELECT (e->>'id')::uuid FROM jsonb_array_elements(v_agents) e);

  -- 4. settings values: model references, and the gate's seats
  FOR v_row IN
    SELECT v.key, v.scope, v.value
      FROM settings_values v JOIN settings_registry r ON r.key = v.key
     WHERE (r.value_schema->>'type' = 'model_ref' AND v.value = to_jsonb(p_old))
        OR (v.key = 'gate.challengers' AND v.value @> jsonb_build_array(jsonb_build_object('model', p_old)))
     FOR UPDATE OF v
  LOOP
    IF v_row.key = 'gate.challengers' THEN
      SELECT jsonb_agg(CASE WHEN e->>'model' = p_old THEN jsonb_set(e, '{model}', to_jsonb(p_new)) ELSE e END ORDER BY o)
        INTO v_val
        FROM jsonb_array_elements(v_row.value) WITH ORDINALITY AS x(e, o);
      v_gate := v_gate + (SELECT count(*) FROM jsonb_array_elements(v_row.value) e WHERE e->>'model' = p_old);
    ELSE
      v_val := to_jsonb(p_new);
    END IF;
    UPDATE settings_values SET value = v_val, updated_by = 'succession:' || v_actor, updated_at = now()
     WHERE key = v_row.key AND scope = v_row.scope;
    INSERT INTO settings_change_log (key, scope, old_value, new_value, changed_by, change_source)
    VALUES (v_row.key, v_row.scope, v_row.value, v_val, v_actor, 'succession')
    RETURNING id INTO v_log_id;
    v_settings := v_settings || jsonb_build_array(jsonb_build_object(
      'key', v_row.key, 'scope', v_row.scope, 'old_value', v_row.value, 'new_value', v_val, 'change_id', v_log_id));
  END LOOP;

  -- 5. registered defaults that name the old model
  UPDATE settings_registry r
     SET value_schema = jsonb_set(r.value_schema, '{default}',
           CASE WHEN r.key = 'gate.challengers'
                THEN (SELECT jsonb_agg(CASE WHEN e->>'model' = p_old THEN jsonb_set(e, '{model}', to_jsonb(p_new)) ELSE e END ORDER BY o)
                        FROM jsonb_array_elements(r.value_schema->'default') WITH ORDINALITY AS x(e, o))
                ELSE to_jsonb(p_new) END)
   WHERE r.key IN (SELECT e->>'key' FROM jsonb_array_elements(v_registry) e);

  -- 6. whoever fell back to the old model now falls back to the new one
  UPDATE model_catalog SET fallback_of = p_new
   WHERE id IN (SELECT e->>'id' FROM jsonb_array_elements(v_fallbacks) e);

  -- 7. the old row is retired — never deleted
  UPDATE model_catalog SET status = 'retired' WHERE id = p_old;

  v_moved := jsonb_build_object(
    'routing', coalesce(array_length(v_routing, 1), 0),
    'agents', jsonb_array_length(v_agents),
    'ceo_override', v_override,
    'settings', jsonb_array_length(v_settings),
    'registry', jsonb_array_length(v_registry),
    'gate_seats', v_gate,
    'fallbacks', jsonb_array_length(v_fallbacks) + CASE WHEN v_new.fallback_of IS DISTINCT FROM
       (SELECT fallback_of FROM model_catalog WHERE id = p_new) THEN 1 ELSE 0 END);
  v_price := jsonb_build_object(
    'old', jsonb_build_object('cost_in', v_old.cost_in_per_mtok, 'cost_out', v_old.cost_out_per_mtok),
    'new', jsonb_build_object('cost_in', v_new.cost_in_per_mtok, 'cost_out', v_new.cost_out_per_mtok),
    'price_known', v_old.cost_in_per_mtok IS NOT NULL AND v_new.cost_in_per_mtok IS NOT NULL
                   AND v_old.cost_out_per_mtok IS NOT NULL AND v_new.cost_out_per_mtok IS NOT NULL,
    'price_rises', coalesce(v_new.cost_in_per_mtok > v_old.cost_in_per_mtok
                            OR v_new.cost_out_per_mtok > v_old.cost_out_per_mtok, false));

  v_snapshot := jsonb_build_object(
    'old', p_old, 'new', p_new, 'rationale', p_rationale, 'authority', p_authority, 'actor', v_actor,
    'catalog', jsonb_build_object(
      'old', jsonb_build_object('status', v_old.status),
      'new', jsonb_build_object('status', v_new.status, 'succeeds', v_new.succeeds, 'fallback_of', v_new.fallback_of),
      'new_after', (SELECT jsonb_build_object('status', status, 'succeeds', succeeds, 'fallback_of', fallback_of)
                      FROM model_catalog WHERE id = p_new)),
    'routing', to_jsonb(v_routing),
    'agents', v_agents,
    'settings', v_settings,
    'registry', v_registry,
    'fallbacks', v_fallbacks,
    'moved', v_moved,
    'price', v_price);

  INSERT INTO audit_log (actor, actor_type, action, payload)
  VALUES (v_actor, v_actor, 'routing.succession', v_snapshot)
  RETURNING id INTO v_audit_id;

  INSERT INTO decision_log (decided_by, decision, rationale, alternatives, risk, outcome)
  VALUES (v_actor, 'model_succession',
          format('%s → %s on %s: %s routing rows, %s brains (%s of them the CEO''s own choices), %s settings, %s registered defaults, %s gate seats, %s fallbacks. %s',
                 p_old, p_new, p_authority, v_moved->>'routing', v_moved->>'agents', v_override,
                 v_moved->>'settings', v_moved->>'registry', v_gate, v_moved->>'fallbacks', coalesce(p_rationale, '')),
          jsonb_build_object('audit_id', v_audit_id, 'price', v_price), 'high', 'applied')
  RETURNING id INTO v_decision_id;

  PERFORM notify_broadcast('settings', 'routing.changed',
    jsonb_build_object('op', 'succession', 'old', p_old, 'new', p_new, 'audit_id', v_audit_id));

  v_resp := jsonb_build_object('ok', true, 'audit_id', v_audit_id, 'decision_id', v_decision_id,
                               'moved', v_moved, 'price', v_price);
  INSERT INTO control_idempotency (key, request_digest, response) VALUES (p_idempotency_key, v_digest, v_resp);
  RETURN v_resp;
END $$;

-- ── one call undoes it ───────────────────────────────────────────────────────────────────────────────
-- Only what still names the successor goes back: a seat someone moved again since is left alone and
-- counted as skipped. A second undo restores nothing.
CREATE OR REPLACE FUNCTION public.fn_undo_succession(p_audit_id bigint, p_idempotency_key text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_actor text := fn_succession_actor();
  v_digest text;
  v_prev record;
  v_s jsonb;
  v_old text;
  v_new text;
  v_n int;
  v_total int;
  v_routing int := 0;
  v_agents int := 0;
  v_settings int := 0;
  v_registry int := 0;
  v_fallbacks int := 0;
  v_skipped int := 0;
  v_e jsonb;
  v_audit_id bigint;
  v_resp jsonb;
BEGIN
  IF v_actor IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED');
  END IF;
  IF coalesce(p_idempotency_key, '') = '' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED', 'detail', 'idempotency key required');
  END IF;
  v_digest := md5('undo-succession|' || p_audit_id);
  SELECT request_digest, response INTO v_prev FROM control_idempotency WHERE key = p_idempotency_key;
  IF FOUND THEN
    IF v_prev.request_digest <> v_digest THEN
      RETURN jsonb_build_object('ok', false, 'error', 'IDEMPOTENCY_MISMATCH');
    END IF;
    RETURN v_prev.response;
  END IF;

  SELECT payload INTO v_s FROM audit_log WHERE id = p_audit_id AND action = 'routing.succession';
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED', 'detail', 'no succession with that audit id');
  END IF;
  v_old := v_s->>'old';
  v_new := v_s->>'new';

  -- the old model first: the gate's seats may only name a live model (unless someone changed it since)
  UPDATE model_catalog SET status = v_s#>>'{catalog,old,status}' WHERE id = v_old AND status = 'retired';

  v_total := jsonb_array_length(v_s->'routing');
  UPDATE routing_rules SET model = v_old, model_id = v_old
   WHERE id IN (SELECT (e #>> '{}')::uuid FROM jsonb_array_elements(v_s->'routing') e) AND model = v_new;
  GET DIAGNOSTICS v_routing = ROW_COUNT;
  v_skipped := v_skipped + (SELECT count(*) FROM routing_rules
                             WHERE id IN (SELECT (e #>> '{}')::uuid FROM jsonb_array_elements(v_s->'routing') e)
                               AND model NOT IN (v_old, v_new));

  UPDATE agents SET brain = v_old, updated_at = now()
   WHERE id IN (SELECT (e->>'id')::uuid FROM jsonb_array_elements(v_s->'agents') e) AND brain = v_new;
  GET DIAGNOSTICS v_agents = ROW_COUNT;
  v_skipped := v_skipped + (SELECT count(*) FROM agents
                             WHERE id IN (SELECT (e->>'id')::uuid FROM jsonb_array_elements(v_s->'agents') e)
                               AND brain NOT IN (v_old, v_new));

  FOR v_e IN SELECT * FROM jsonb_array_elements(v_s->'settings') LOOP
    UPDATE settings_values SET value = v_e->'old_value', updated_by = 'succession-undo:' || v_actor, updated_at = now()
     WHERE key = v_e->>'key' AND scope = v_e->>'scope' AND value = v_e->'new_value';
    GET DIAGNOSTICS v_n = ROW_COUNT;
    IF v_n = 1 THEN
      INSERT INTO settings_change_log (key, scope, old_value, new_value, changed_by, change_source, undo_of)
      VALUES (v_e->>'key', v_e->>'scope', v_e->'new_value', v_e->'old_value', v_actor, 'undo', (v_e->>'change_id')::bigint);
      v_settings := v_settings + 1;
    ELSIF EXISTS (SELECT 1 FROM settings_values WHERE key = v_e->>'key' AND scope = v_e->>'scope'
                   AND value IS DISTINCT FROM v_e->'old_value') THEN
      v_skipped := v_skipped + 1;
    END IF;
  END LOOP;

  FOR v_e IN SELECT * FROM jsonb_array_elements(v_s->'registry') LOOP
    UPDATE settings_registry SET value_schema = jsonb_set(value_schema, '{default}', v_e->'old_default')
     WHERE key = v_e->>'key' AND value_schema->'default' IS DISTINCT FROM v_e->'old_default'
       AND (value_schema->'default' = to_jsonb(v_new)
            OR value_schema->'default' @> jsonb_build_array(jsonb_build_object('model', v_new)));
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_registry := v_registry + v_n;
  END LOOP;

  UPDATE model_catalog SET fallback_of = v_old
   WHERE id IN (SELECT e->>'id' FROM jsonb_array_elements(v_s->'fallbacks') e) AND fallback_of = v_new;
  GET DIAGNOSTICS v_fallbacks = ROW_COUNT;

  -- the successor last: its own status, succession link and fallback as they were — unless someone changed
  -- them since the succession, then it is left as it is and counted
  UPDATE model_catalog
     SET status = v_s#>>'{catalog,new,status}',
         succeeds = v_s#>>'{catalog,new,succeeds}',
         fallback_of = v_s#>>'{catalog,new,fallback_of}'
   WHERE id = v_new
     AND status IS NOT DISTINCT FROM v_s#>>'{catalog,new_after,status}'
     AND succeeds IS NOT DISTINCT FROM v_s#>>'{catalog,new_after,succeeds}'
     AND fallback_of IS NOT DISTINCT FROM v_s#>>'{catalog,new_after,fallback_of}';
  GET DIAGNOSTICS v_n = ROW_COUNT;
  IF v_n = 0 THEN
    v_skipped := v_skipped + 1;
  END IF;

  INSERT INTO audit_log (actor, actor_type, action, payload)
  VALUES (v_actor, v_actor, 'routing.succession.undo',
          jsonb_build_object('undo_of', p_audit_id, 'old', v_old, 'new', v_new,
                             'restored', jsonb_build_object('routing', v_routing, 'agents', v_agents,
                               'settings', v_settings, 'registry', v_registry, 'fallbacks', v_fallbacks),
                             'skipped', v_skipped))
  RETURNING id INTO v_audit_id;
  INSERT INTO decision_log (decided_by, decision, rationale, alternatives, risk, outcome)
  VALUES (v_actor, 'model_succession_undo',
          format('%s ← %s undone: %s routing rows, %s brains, %s settings back; %s left as someone set them since',
                 v_old, v_new, v_routing, v_agents, v_settings, v_skipped),
          jsonb_build_object('audit_id', v_audit_id, 'undo_of', p_audit_id), 'high', 'applied');
  PERFORM notify_broadcast('settings', 'routing.changed',
    jsonb_build_object('op', 'succession_undo', 'old', v_old, 'new', v_new, 'audit_id', v_audit_id));

  v_resp := jsonb_build_object('ok', true, 'audit_id', v_audit_id,
    'restored', jsonb_build_object('routing', v_routing, 'agents', v_agents, 'settings', v_settings,
                                   'registry', v_registry, 'fallbacks', v_fallbacks),
    'skipped', v_skipped);
  INSERT INTO control_idempotency (key, request_digest, response) VALUES (p_idempotency_key, v_digest, v_resp);
  RETURN v_resp;
END $$;

REVOKE ALL ON FUNCTION public.fn_succession_actor() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.fn_succeed_model(text, text, text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.fn_undo_succession(bigint, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_succeed_model(text, text, text, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_undo_succession(bigint, text) TO authenticated, service_role;

COMMENT ON FUNCTION public.fn_succeed_model(text, text, text, text, text) IS
  'B51 P2: moves every seat of a model to its successor in one transaction (routing, brains, model settings and defaults, the gate''s seats, fallbacks), retires the old row; audit_log carries the before-photograph. Mechanical: the caller decides whether a dearer successor may move a seat.';
COMMENT ON FUNCTION public.fn_undo_succession(bigint, text) IS
  'B51 P2: undoes one succession from its audit row — only seats that still name the successor go back.';
