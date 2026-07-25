-- C9 FilterBar rollout (2026-07-25): expose the department on the HR
-- equipment audit view so /org/hr?view=equipment can narrow server-side.
-- Appended as the LAST column (CREATE OR REPLACE VIEW may only append).

CREATE OR REPLACE VIEW v_hr_equipment_check AS
SELECT id AS employee_id,
    slug,
    employment_status,
    role_level IS NOT NULL AND (manager_id IS NOT NULL OR role = 'head') AS e1_org_row,
    (EXISTS ( SELECT 1 FROM employee_records er
          WHERE er.employee_id = a.id)) AS e2_record,
    hook_version IS NOT NULL AS e3_hook,
    mcp_profile IS NOT NULL AND (EXISTS ( SELECT 1 FROM settings_values sv
          WHERE sv.key = 'hr.grant_package' AND sv.scope = ('employee:' || a.id::text))) AS e4_grants,
    (EXISTS ( SELECT 1 FROM settings_values sv
          WHERE sv.key = 'hr.litellm_key_alias' AND sv.scope = ('employee:' || a.id::text)
            AND (sv.value ->> 'status') = 'ready')) AS e5_litellm_key,
    (EXISTS ( SELECT 1 FROM settings_values sv
          WHERE sv.key = 'hr.employee_budget' AND sv.scope = ('employee:' || a.id::text))) AS e6_budget,
    (EXISTS ( SELECT 1 FROM personas p WHERE p.employee_id = a.id))
      OR (EXISTS ( SELECT 1 FROM tasks t
          WHERE t.agent_id = a.id AND t.objective LIKE 'HR: author persona%')) AS e7_persona_task,
    role_level IS NOT NULL AND (manager_id IS NOT NULL OR role = 'head')
      AND (EXISTS ( SELECT 1 FROM employee_records er WHERE er.employee_id = a.id))
      AND hook_version IS NOT NULL
      AND mcp_profile IS NOT NULL
      AND (EXISTS ( SELECT 1 FROM settings_values sv
            WHERE sv.key = 'hr.grant_package' AND sv.scope = ('employee:' || a.id::text)))
      AND (EXISTS ( SELECT 1 FROM settings_values sv
            WHERE sv.key = 'hr.litellm_key_alias' AND sv.scope = ('employee:' || a.id::text)
              AND (sv.value ->> 'status') = 'ready'))
      AND (EXISTS ( SELECT 1 FROM settings_values sv
            WHERE sv.key = 'hr.employee_budget' AND sv.scope = ('employee:' || a.id::text)))
      AND ((EXISTS ( SELECT 1 FROM personas p WHERE p.employee_id = a.id))
        OR (EXISTS ( SELECT 1 FROM tasks t
            WHERE t.agent_id = a.id AND t.objective LIKE 'HR: author persona%'))) AS all_ok,
    a.department
   FROM agents a
  WHERE employment_status <> 'archived';
