-- 20260711003000_persona_fns.sql — E5.1: persona submit/gate fn'leri + persona_id kilidi
-- Normatif: EMPLOYEE_PERSONA_STANDARD §7/§8/§11/§16 + DATA_MODEL §4.1.
-- KAYITLI UYARLAMA: quality_gate CHECK'ine 'superseded' eklendi — PERSONA spec
-- §27 hükmü ("ikinci submit birinciyi superseded kapatır") DATA_MODEL'in
-- üç-değerli taslağından sonra yazıldı; spec hükmü uygulanır, DATA_MODEL notu düşüldü.
-- İdempotent; dosya sonunda ROLLBACK bloğu.

-- 1) quality_gate değer kümesi genişletmesi (pending/passed/failed + superseded)
ALTER TABLE public.personas DROP CONSTRAINT IF EXISTS personas_quality_gate_check;
ALTER TABLE public.personas ADD CONSTRAINT personas_quality_gate_check
  CHECK (quality_gate IN ('pending','passed','failed','superseded'));

-- 2) agents.persona_id yalnız 'passed' persona gösterebilir (spec §11 — FK + trigger)
CREATE OR REPLACE FUNCTION public.enforce_persona_id_passed()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_gate text;
BEGIN
  IF NEW.persona_id IS NOT NULL THEN
    SELECT quality_gate INTO v_gate FROM public.personas WHERE id = NEW.persona_id;
    IF v_gate IS DISTINCT FROM 'passed' THEN
      RAISE EXCEPTION 'agents.persona_id only passed personas allowed (got %)', COALESCE(v_gate,'missing')
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_agents_persona_passed ON public.agents;
CREATE TRIGGER trg_agents_persona_passed
  BEFORE INSERT OR UPDATE OF persona_id ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.enforce_persona_id_passed();

-- 3) fn_persona_submit — yeni sürüm 'pending' + secret/injection taraması (spec §16)
--    DB katmanı son savunmadır; birincil tarama packages/hr gate'te koşar.
CREATE OR REPLACE FUNCTION public.fn_persona_submit(
  p_employee_id uuid,
  p_body_md     text,
  p_author      text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id      uuid;
  v_version integer;
BEGIN
  IF p_body_md IS NULL OR length(trim(p_body_md)) < 200 THEN
    RAISE EXCEPTION 'persona submit rejected: body too short for v2 standard';
  END IF;

  -- secret taraması (gitleaks çekirdeği — eşleşen değer mesaja YAZILMAZ)
  IF p_body_md ~ 'sk-[A-Za-z0-9_-]{20,}'
     OR p_body_md ~ 'AKIA[0-9A-Z]{16}'
     OR p_body_md ~ 'ghp_[A-Za-z0-9]{36}'
     OR p_body_md ~ 'xox[baprs]-[A-Za-z0-9-]{10,}'
     OR p_body_md ~ '-----BEGIN [A-Z ]*PRIVATE KEY-----'
     OR p_body_md ~* '(password|passwd|api[_-]?key|secret[_-]?key|access[_-]?token)\s*[:=]\s*[''"]?[A-Za-z0-9_\-./+]{8,}'
     OR p_body_md ~* 'postgres(ql)?://\w+:[^@\s]+@'
  THEN
    RAISE EXCEPTION 'persona submit rejected: secret pattern detected';
  END IF;

  -- injection taraması ("yukarıdaki talimatları yok say" sınıfı)
  IF p_body_md ~* 'ignore\s+(all\s+)?(previous|above|prior)\s+instructions'
     OR p_body_md ~* 'disregard\s+(the\s+)?(system\s+prompt|previous\s+instructions)'
     OR p_body_md ~* 'yukar[ıi]daki\s+talimatlar[ıi]\s+(yok\s+say|unut)'
  THEN
    RAISE EXCEPTION 'persona submit rejected: injection pattern detected';
  END IF;

  -- ikinci submit birinciyi kapatır (spec §27)
  UPDATE public.personas
     SET quality_gate = 'superseded'
   WHERE employee_id = p_employee_id AND quality_gate = 'pending';

  SELECT COALESCE(MAX(version), 0) + 1 INTO v_version
    FROM public.personas WHERE employee_id = p_employee_id;

  INSERT INTO public.personas (employee_id, version, author, body_md, quality_gate)
  VALUES (p_employee_id, v_version, p_author, p_body_md, 'pending')
  RETURNING id INTO v_id;

  INSERT INTO public.audit_log (actor, actor_type, action, payload)
  VALUES (p_author, 'system', 'persona.submitted',
          jsonb_build_object('persona_id', v_id, 'employee_id', p_employee_id, 'version', v_version));

  PERFORM public.notify_broadcast('org', 'persona.submitted',
          jsonb_build_object('persona_id', v_id, 'employee_id', p_employee_id, 'version', v_version));

  RETURN v_id;
END;
$$;

-- 4) fn_persona_gate — verdict yazımı + audit + Broadcast (spec §7/§8)
CREATE OR REPLACE FUNCTION public.fn_persona_gate(
  p_persona_id uuid,
  p_verdict    text,
  p_notes      text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_employee uuid;
  v_version  integer;
BEGIN
  IF p_verdict NOT IN ('passed','failed') THEN
    RAISE EXCEPTION 'persona gate verdict must be passed|failed (got %)', p_verdict;
  END IF;

  UPDATE public.personas
     SET quality_gate = p_verdict
   WHERE id = p_persona_id AND quality_gate = 'pending'
  RETURNING employee_id, version INTO v_employee, v_version;

  IF v_employee IS NULL THEN
    RAISE EXCEPTION 'persona gate: % not found or not pending', p_persona_id;
  END IF;

  -- red gerekçesi insan-okur saklanır (spec §15)
  INSERT INTO public.audit_log (actor, actor_type, action, payload)
  VALUES ('persona-gate', 'system', 'persona.gated',
          jsonb_build_object('persona_id', p_persona_id, 'employee_id', v_employee,
                             'version', v_version, 'verdict', p_verdict,
                             'notes', COALESCE(p_notes, '')));

  PERFORM public.notify_broadcast('org', 'persona.gated',
          jsonb_build_object('persona_id', p_persona_id, 'employee_id', v_employee,
                             'version', v_version, 'verdict', p_verdict));
END;
$$;

-- 5) yetki: control seam (E6) service_role üzerinden çağırır; client doğrudan çağıramaz
REVOKE ALL ON FUNCTION public.fn_persona_submit(uuid, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_persona_gate(uuid, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_persona_submit(uuid, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.fn_persona_gate(uuid, text, text) TO service_role;

-- ROLLBACK:
-- DROP TRIGGER IF EXISTS trg_agents_persona_passed ON public.agents;
-- DROP FUNCTION IF EXISTS public.enforce_persona_id_passed();
-- DROP FUNCTION IF EXISTS public.fn_persona_submit(uuid, text, text);
-- DROP FUNCTION IF EXISTS public.fn_persona_gate(uuid, text, text);
-- ALTER TABLE public.personas DROP CONSTRAINT IF EXISTS personas_quality_gate_check;
-- ALTER TABLE public.personas ADD CONSTRAINT personas_quality_gate_check
--   CHECK (quality_gate IN ('pending','passed','failed'));
