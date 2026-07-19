-- C12/C23 (CEO complaint ledger 2026-07-19): the Models page lied twice —
-- (1) catalog held only 4 anthropic rows while the company runs a 9-model
-- roster (measured: LiteLLM serves glm/kimi/deepseek/qwen/minimax/embed;
-- routing-seed also names codex-5.5); (2) KOŞU 30G showed 0 for sonnet
-- because agent_runs.model_id uses routing slugs ('sonnet-5') while the
-- catalog id is 'claude-sonnet-5' — the stats join missed.
--
-- Fixes: catalog completed (live roster active; CEO-ordered additions
-- codex-5.6 / kimi-3 / deepseek-v4-pro as 'testing' until their exam —
-- no guessed numbers: unknown stats stay NULL and the UI hides them, A1);
-- stats join alias-normalized. Fable fallback chain (standing order 3):
-- Codex 5.6 solo first, Opus 4.8 second — codex-5.6.fallback_of=fable-5.

insert into model_catalog (id, provider, status, display_name, mechanical_only, fallback_of)
values
  ('kimi-2.7-code',     'moonshotai', 'active',  'Kimi 2.7 Code',      false, null),
  ('glm-5.2',           'z-ai',       'active',  'GLM 5.2',            false, null),
  ('deepseek-v4-flash', 'deepseek',   'active',  'DeepSeek V4 Flash',  false, null),
  ('qwen3.6-flash',     'qwen',       'active',  'Qwen 3.6 Flash',     false, null),
  ('minimax-m3',        'minimax',    'active',  'MiniMax M3',         false, null),
  ('codex-5.5',         'openai',     'active',  'Codex 5.5',          false, null),
  ('codex-5.6',         'openai',     'testing', 'Codex 5.6 Solo',     false, 'fable-5'),
  ('kimi-3',            'moonshotai', 'testing', 'Kimi 3',             false, null),
  ('deepseek-v4-pro',   'deepseek',   'testing', 'DeepSeek V4 Pro',    false, null)
on conflict (id) do nothing;

create or replace view v_model_stats as
SELECT m.id,
    m.display_name,
    m.provider,
    m.context_window,
    m.cost_in_per_mtok,
    m.cost_out_per_mtok,
    m.speed_score,
    m.quality_score,
    m.status,
    m.banned,
    m.mechanical_only,
    m.fallback_of,
    COALESCE(r.runs_30d, 0::bigint) AS runs_30d,
    COALESCE(r.succeeded_30d, 0::bigint) AS succeeded_30d,
    COALESCE(r.failed_30d, 0::bigint) AS failed_30d,
        CASE
            WHEN COALESCE(r.finished_30d, 0::bigint) > 0 THEN round(r.succeeded_30d::numeric / r.finished_30d::numeric, 3)
            ELSE NULL::numeric
        END AS success_rate_30d,
    r.avg_duration_sec_30d,
    COALESCE(r.cost_30d_eur, 0::numeric) AS cost_30d_eur,
    COALESCE(r.active_runs, 0::bigint) AS active_runs,
    COALESCE(a.assigned_employees, 0::bigint) AS assigned_employees,
    COALESCE(s.slot_assignments, 0::bigint) AS slot_assignments
   FROM model_catalog m
     LEFT JOIN LATERAL ( SELECT count(*) AS runs_30d,
            count(*) FILTER (WHERE ar.status = 'succeeded'::text) AS succeeded_30d,
            count(*) FILTER (WHERE ar.status = 'failed'::text) AS failed_30d,
            count(*) FILTER (WHERE ar.status = ANY (ARRAY['succeeded'::text, 'failed'::text])) AS finished_30d,
            round(avg(EXTRACT(epoch FROM ar.ended_at - ar.started_at)) FILTER (WHERE ar.ended_at IS NOT NULL)) AS avg_duration_sec_30d,
            sum(ar.cost_eur) AS cost_30d_eur,
            count(*) FILTER (WHERE ar.status = 'running'::text) AS active_runs
           FROM agent_runs ar
          -- C23 alias fix: runs are stamped with routing slugs; the catalog
          -- carries canonical ids — 'sonnet-5' must count for
          -- 'claude-sonnet-5'.
          WHERE (ar.model_id = m.id OR ar.model_id = regexp_replace(m.id, '^claude-', ''))
            AND ar.started_at > (now() - '30 days'::interval)) r ON true
     LEFT JOIN LATERAL ( SELECT count(*) AS assigned_employees
           FROM agents ag
          WHERE ag.brain = m.id AND ag.employment_status <> 'archived'::text) a ON true
     LEFT JOIN LATERAL ( SELECT count(*) AS slot_assignments
           FROM routing_rules rr
          WHERE rr.model_id = m.id AND rr.role_slot IS NOT NULL AND rr.enabled) s ON true;

comment on view v_model_stats is
  'Model stats for the CEO Models page. C23 (2026-07-19): run stats join normalizes routing-slug aliases (sonnet-5 → claude-sonnet-5).';
