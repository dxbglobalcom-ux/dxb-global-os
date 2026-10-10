-- B51 step 3 · B2 — THE SMOKE GATE IN THE DOOR: a successor is called once, live, before the door moves a seat
-- onto it (MODEL_ROUTING_SPEC A-2026-10-10 §9; second eye's B2 of P4).
--
-- Measured 2026-10-10 (~02:45): 20261010040000 moved 33 brains and 28 routing rows from fable-5 to
-- claude-opus-5-5 through the door; the company's Agent SDK (0.3.259, CLI 2.1.259) refused that model ("version
-- 2.1.280 or newer is required") and returned the refusal as a result of subtype success, so every seat would
-- have answered with the error. The door checked the catalogue, lane, floor and API name — all true — and none
-- of them says the model can be called. 20261010050000 undid it. Once P8 lets Hamza call the door on the CEO's
-- word, no engineer stands between his sentence and the seats; so the guard lives in the door itself.
--
--   · model_catalog.smoke_ok_at / smoke_cli — when a live call through the company's runtime last answered,
--     and with which CLI (the SDK's bundled Claude Code, or the Codex CLI);
--   · fn_model_smoke_passed(model, cli, evidence, at) — the ONLY writer of the stamp: the company's own system
--     (scripts/models/smoke.mjs after a passing call; P8's tool the same way), never a dashboard session — a
--     person cannot attest a call that did not happen. One audit row per stamp. `at` is when the call
--     answered: now() for a live stamp; a migration that stamps from a recorded call passes that call's time,
--     never the migration's, and never a time to come;
--   · fn_succeed_model — unchanged except one guard after the successor's checks: no stamp → SMOKE_REQUIRED.
--     Re-created whole from 20261010020000 (a migration that reached the company is never edited).
-- A stamp is not cleared by a later SDK change; smoke_cli says which CLI earned it, and the script re-stamps.

ALTER TABLE public.model_catalog
  ADD COLUMN IF NOT EXISTS smoke_ok_at timestamptz,
  ADD COLUMN IF NOT EXISTS smoke_cli text;

COMMENT ON COLUMN public.model_catalog.smoke_ok_at IS
  'When this model last answered one live call through the company''s own runtime (company isolation). NULL: never — the succession door refuses it as a successor (SMOKE_REQUIRED). Written only by fn_model_smoke_passed.';
COMMENT ON COLUMN public.model_catalog.smoke_cli IS
  'The CLI that answered the smoke call (the Agent SDK''s bundled Claude Code version, or the Codex CLI''s).';

-- ── the stamp ────────────────────────────────────────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS public.fn_model_smoke_passed(text, text, jsonb);
CREATE OR REPLACE FUNCTION public.fn_model_smoke_passed(p_model text, p_cli text, p_evidence jsonb,
                                                        p_at timestamptz DEFAULT now())
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_actor text := fn_succession_actor();
  v_row model_catalog%ROWTYPE;
  v_audit_id bigint;
BEGIN
  IF v_actor IS DISTINCT FROM 'system' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED',
      'detail', 'only the company''s own runtime stamps a smoke call — it is what made the call');
  END IF;
  IF coalesce(p_cli, '') = '' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED', 'detail', 'the answering CLI is required');
  END IF;
  IF p_at IS NULL OR p_at > now() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED', 'detail', 'the call''s time is required and is not in the future');
  END IF;
  SELECT * INTO v_row FROM model_catalog WHERE id = p_model FOR UPDATE;
  IF NOT FOUND OR v_row.status = 'retired' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', coalesce(p_model, '(null)') || ' is not a live catalogue model');
  END IF;
  UPDATE model_catalog SET smoke_ok_at = p_at, smoke_cli = p_cli WHERE id = p_model;
  INSERT INTO audit_log (actor, actor_type, action, payload)
  VALUES (v_actor, v_actor, 'model.smoke',
          jsonb_build_object('model', p_model, 'cli', p_cli, 'at', p_at, 'evidence', coalesce(p_evidence, '{}'::jsonb),
                             'before', jsonb_build_object('smoke_ok_at', v_row.smoke_ok_at, 'smoke_cli', v_row.smoke_cli)))
  RETURNING id INTO v_audit_id;
  RETURN jsonb_build_object('ok', true, 'model', p_model, 'cli', p_cli, 'audit_id', v_audit_id);
END $$;

REVOKE ALL ON FUNCTION public.fn_model_smoke_passed(text, text, jsonb, timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_model_smoke_passed(text, text, jsonb, timestamptz) TO service_role;

-- ── the door, with the guard ─────────────────────────────────────────────────────────────────────────
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

REVOKE ALL ON FUNCTION public.fn_succeed_model(text, text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_succeed_model(text, text, text, text, text) TO authenticated, service_role;
