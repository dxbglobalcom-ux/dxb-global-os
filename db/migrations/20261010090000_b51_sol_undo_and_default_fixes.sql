-- B51 step 3 — the fixes of the step's single Sol pass (gpt-6.1-sol at xhigh, 2026-10-10;
-- .planning/quick/20261009-masa-b51/SOL-step3.md): one A and three of the six B findings live in these functions.
-- 20261010020000 and 20261010060000 reached the company and are never edited; the functions are re-created whole.
--
--   A1  fn_undo_succession checked only its own idempotency key. Measured on the bench by Sol: the first Opus
--       succession (undone already) still matched 22 routing rows and 22 brains after Opus 5.5's return, so a second
--       undo under another key would have moved the return's seats back. Now the succession's record is locked and
--       an undo is refused when that succession was undone already (ALREADY_UNDONE) or when any later succession
--       still stands (NOT_LATEST, naming it — successions are undone last-in, first-out). Replaying the SAME key
--       still returns the stored answer.
--   B1  the gate's seats (value and registered default) were restored as one JSON value: a later effort change on
--       the OTHER seat blocked the restore, and the successor was then lowered to 'testing' while a seat still named
--       it. Now seat by seat — the seat goes back to the old model with its current effort kept; a seat changed since
--       is left and counted — and a model_ref default goes back only while it still names the successor. The
--       successor's catalogue row is not lowered while any routing row, brain, model setting or default, gate seat
--       or workflow pin still names it (`status_kept` and its reason in the answer).
--   B2  fn_default_brain fell back to the literal 'claude-sonnet-5' — retired in P4 — when no enabled low_cost
--       row exists. It now refuses: a new employee is never created on a retired brain. Measured: both engines carry
--       an enabled slot.low_cost row (claude-sonnet-5-5), seeded by migration (20260713040000) before any seed
--       inserts an employee without a brain (db/seed/import-personas.ts), so the refusal fires only on the broken
--       state it names.
--   B3  a workflow step pinned to a model (workflow_steps.config.model_id — packages/kernel/src/workflow/steps/
--       agent.ts) was not moved by the door; a retired pin is refused at run time. The door now photographs, moves
--       and undoes those pins (definitions only — a finished run keeps its own steps_snapshot). Measured 2026-10-10:
--       0 workflow steps on either engine; the door is ready for the first one. A succession recorded before this
--       file carries no workflow_pins key; its undo reads it as none.
-- Everything else in both functions is unchanged; the grants are re-stated as they were.

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
  v_pins jsonb;
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
  -- A successor has answered one live call through the company's own runtime before any seat moves onto it
  -- (B51 P4's lesson): a catalogue row says a model exists, not that the CLI the company runs can call it.
  IF v_new.smoke_ok_at IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'SMOKE_REQUIRED',
      'detail', p_new || ' has not answered a live call through the company''s runtime — run scripts/models/smoke.mjs ' || p_new || ' first');
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
  -- workflow definitions pinned to the old model (a pin is the registered exception to the slot; finished runs keep
  -- their own steps_snapshot and are history)
  SELECT coalesce(jsonb_agg(jsonb_build_object('id', id) ORDER BY id), '[]'::jsonb)
    INTO v_pins
    FROM workflow_steps WHERE config->>'model_id' = p_old;

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

  -- 5b. workflow definitions pinned to the old model
  UPDATE workflow_steps SET config = jsonb_set(config, '{model_id}', to_jsonb(p_new))
   WHERE id IN (SELECT (e->>'id')::uuid FROM jsonb_array_elements(v_pins) e);

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
    'workflow_pins', jsonb_array_length(v_pins),
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
    'workflow_pins', v_pins,
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
  v_pins int := 0;
  v_skipped int := 0;
  v_e jsonb;
  v_cur jsonb;
  v_val jsonb;
  v_seats int;
  v_left int;
  v_log_id bigint;
  v_kept boolean := false;
  v_blocker bigint;
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

  -- the record is locked, so two undos of one succession cannot both pass the checks below
  SELECT payload INTO v_s FROM audit_log WHERE id = p_audit_id AND action = 'routing.succession' FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED', 'detail', 'no succession with that audit id');
  END IF;
  v_old := v_s->>'old';
  v_new := v_s->>'new';
  -- a succession is undone once: a second undo (under another key) would move seats a later succession placed
  IF EXISTS (SELECT 1 FROM audit_log WHERE action = 'routing.succession.undo'
              AND (payload->>'undo_of')::bigint = p_audit_id) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'ALREADY_UNDONE',
      'detail', 'succession ' || p_audit_id || ' was undone already');
  END IF;
  -- successions are undone last-in, first-out: a later succession that still stands (no undo of its own) may have
  -- moved the same seats, so it is undone first
  SELECT max(a.id) INTO v_blocker
    FROM audit_log a
   WHERE a.action = 'routing.succession' AND a.id > p_audit_id
     AND NOT EXISTS (SELECT 1 FROM audit_log u WHERE u.action = 'routing.succession.undo'
                      AND (u.payload->>'undo_of')::bigint = a.id);
  IF v_blocker IS NOT NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_LATEST', 'blocking_audit_id', v_blocker,
      'detail', 'succession ' || v_blocker || ' is the latest standing one after ' || p_audit_id || ' — undo that one first');
  END IF;

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
    IF v_e->>'key' = 'gate.challengers' THEN
      -- seat by seat: a seat that named the old model and still names the successor goes back, its current effort
      -- kept; a seat changed since is left and counted
      SELECT value INTO v_cur FROM settings_values WHERE key = v_e->>'key' AND scope = v_e->>'scope' FOR UPDATE;
      IF v_cur IS NULL OR jsonb_typeof(v_cur) <> 'array' THEN
        v_skipped := v_skipped + 1;
        CONTINUE;
      END IF;
      SELECT jsonb_agg(CASE WHEN o_e->>'model' = v_old AND c_e->>'model' = v_new
                            THEN jsonb_set(c_e, '{model}', to_jsonb(v_old)) ELSE c_e END ORDER BY c_o),
             count(*) FILTER (WHERE o_e->>'model' = v_old AND c_e->>'model' = v_new),
             count(*) FILTER (WHERE o_e->>'model' = v_old AND c_e->>'model' IS DISTINCT FROM v_new)
        INTO v_val, v_seats, v_left
        FROM jsonb_array_elements(v_cur) WITH ORDINALITY AS c(c_e, c_o)
        LEFT JOIN jsonb_array_elements(v_e->'old_value') WITH ORDINALITY AS o(o_e, o_o) ON o_o = c_o;
      v_skipped := v_skipped + v_left;
      IF v_seats > 0 THEN
        UPDATE settings_values SET value = v_val, updated_by = 'succession-undo:' || v_actor, updated_at = now()
         WHERE key = v_e->>'key' AND scope = v_e->>'scope';
        INSERT INTO settings_change_log (key, scope, old_value, new_value, changed_by, change_source, undo_of)
        VALUES (v_e->>'key', v_e->>'scope', v_cur, v_val, v_actor, 'undo', (v_e->>'change_id')::bigint);
        v_settings := v_settings + 1;
      END IF;
    ELSE
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
    END IF;
  END LOOP;

  FOR v_e IN SELECT * FROM jsonb_array_elements(v_s->'registry') LOOP
    IF v_e->>'key' = 'gate.challengers' THEN
      -- the registered default of the gate, seat by seat, the same way
      SELECT value_schema->'default' INTO v_cur FROM settings_registry WHERE key = v_e->>'key' FOR UPDATE;
      IF v_cur IS NULL OR jsonb_typeof(v_cur) <> 'array' THEN
        v_skipped := v_skipped + 1;
        CONTINUE;
      END IF;
      SELECT jsonb_agg(CASE WHEN o_e->>'model' = v_old AND c_e->>'model' = v_new
                            THEN jsonb_set(c_e, '{model}', to_jsonb(v_old)) ELSE c_e END ORDER BY c_o),
             count(*) FILTER (WHERE o_e->>'model' = v_old AND c_e->>'model' = v_new),
             count(*) FILTER (WHERE o_e->>'model' = v_old AND c_e->>'model' IS DISTINCT FROM v_new)
        INTO v_val, v_seats, v_left
        FROM jsonb_array_elements(v_cur) WITH ORDINALITY AS c(c_e, c_o)
        LEFT JOIN jsonb_array_elements(v_e->'old_default') WITH ORDINALITY AS o(o_e, o_o) ON o_o = c_o;
      v_skipped := v_skipped + v_left;
      IF v_seats > 0 THEN
        UPDATE settings_registry SET value_schema = jsonb_set(value_schema, '{default}', v_val) WHERE key = v_e->>'key';
        v_registry := v_registry + 1;
      END IF;
    ELSE
      -- a model_ref default goes back only while it still names the successor
      UPDATE settings_registry SET value_schema = jsonb_set(value_schema, '{default}', v_e->'old_default')
       WHERE key = v_e->>'key' AND value_schema->'default' = to_jsonb(v_new);
      GET DIAGNOSTICS v_n = ROW_COUNT;
      v_registry := v_registry + v_n;
      IF v_n = 0 THEN
        v_skipped := v_skipped + 1;
      END IF;
    END IF;
  END LOOP;

  -- workflow definitions pinned by the succession, where they still name the successor
  UPDATE workflow_steps SET config = jsonb_set(config, '{model_id}', to_jsonb(v_old))
   WHERE id IN (SELECT (e->>'id')::uuid FROM jsonb_array_elements(coalesce(v_s->'workflow_pins', '[]'::jsonb)) e)
     AND config->>'model_id' = v_new;
  GET DIAGNOSTICS v_pins = ROW_COUNT;
  v_skipped := v_skipped + jsonb_array_length(coalesce(v_s->'workflow_pins', '[]'::jsonb)) - v_pins;

  UPDATE model_catalog SET fallback_of = v_old
   WHERE id IN (SELECT e->>'id' FROM jsonb_array_elements(v_s->'fallbacks') e) AND fallback_of = v_new;
  GET DIAGNOSTICS v_fallbacks = ROW_COUNT;

  -- the successor last: its own status, succession link and fallback as they were — unless someone changed
  -- them since the succession, or anything still names it (a seat left on it must stay callable): then it is left
  -- as it is and counted
  v_kept := EXISTS (SELECT 1 FROM routing_rules WHERE model = v_new OR model_id = v_new)
         OR EXISTS (SELECT 1 FROM agents WHERE brain = v_new)
         OR EXISTS (SELECT 1 FROM settings_values v JOIN settings_registry r ON r.key = v.key
                     WHERE (r.value_schema->>'type' = 'model_ref' AND v.value = to_jsonb(v_new))
                        OR (v.key = 'gate.challengers' AND v.value @> jsonb_build_array(jsonb_build_object('model', v_new))))
         OR EXISTS (SELECT 1 FROM settings_registry
                     WHERE (value_schema->>'type' = 'model_ref' AND value_schema->'default' = to_jsonb(v_new))
                        OR (key = 'gate.challengers'
                            AND value_schema->'default' @> jsonb_build_array(jsonb_build_object('model', v_new))))
         OR EXISTS (SELECT 1 FROM workflow_steps WHERE config->>'model_id' = v_new);
  UPDATE model_catalog
     SET status = v_s#>>'{catalog,new,status}',
         succeeds = v_s#>>'{catalog,new,succeeds}',
         fallback_of = v_s#>>'{catalog,new,fallback_of}'
   WHERE id = v_new
     AND status IS NOT DISTINCT FROM v_s#>>'{catalog,new_after,status}'
     AND succeeds IS NOT DISTINCT FROM v_s#>>'{catalog,new_after,succeeds}'
     AND fallback_of IS NOT DISTINCT FROM v_s#>>'{catalog,new_after,fallback_of}'
     AND NOT v_kept;
  GET DIAGNOSTICS v_n = ROW_COUNT;
  IF v_n = 0 THEN
    v_skipped := v_skipped + 1;
  END IF;

  INSERT INTO audit_log (actor, actor_type, action, payload)
  VALUES (v_actor, v_actor, 'routing.succession.undo',
          jsonb_build_object('undo_of', p_audit_id, 'old', v_old, 'new', v_new,
                             'restored', jsonb_build_object('routing', v_routing, 'agents', v_agents,
                               'settings', v_settings, 'registry', v_registry, 'fallbacks', v_fallbacks,
                               'workflow_pins', v_pins),
                             'skipped', v_skipped, 'status_kept', v_kept,
                             'status_kept_reason', CASE WHEN v_kept THEN v_new || ' is still named by a routing row, a brain, a model setting or default, a gate seat or a workflow pin, so its catalogue status is left as it is' END))
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
                                   'registry', v_registry, 'fallbacks', v_fallbacks, 'workflow_pins', v_pins),
    'skipped', v_skipped, 'status_kept', v_kept,
    'status_kept_reason', CASE WHEN v_kept THEN v_new || ' is still named by a routing row, a brain, a model setting or default, a gate seat or a workflow pin, so its catalogue status is left as it is' END);
  INSERT INTO control_idempotency (key, request_digest, response) VALUES (p_idempotency_key, v_digest, v_resp);
  RETURN v_resp;
END $$;


CREATE OR REPLACE FUNCTION public.fn_default_brain()
RETURNS text LANGUAGE plpgsql STABLE AS $$
DECLARE
  v_model text;
BEGIN
  SELECT model INTO v_model FROM public.routing_rules
   WHERE role_slot = 'low_cost' AND enabled
   ORDER BY priority DESC, updated_at DESC LIMIT 1;
  IF v_model IS NULL THEN
    RAISE EXCEPTION 'no enabled low_cost routing row — the default brain cannot be chosen';
  END IF;
  RETURN v_model;
END $$;
COMMENT ON FUNCTION public.fn_default_brain() IS
  'B51 P1: the brain a new employee gets when none is named — the low_cost seat''s model (catalogue id). No enabled low_cost row → refused (B51 Sol B2), never a fixed model id.';

REVOKE ALL ON FUNCTION public.fn_succeed_model(text, text, text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.fn_undo_succession(bigint, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_succeed_model(text, text, text, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_undo_succession(bigint, text) TO authenticated, service_role;
