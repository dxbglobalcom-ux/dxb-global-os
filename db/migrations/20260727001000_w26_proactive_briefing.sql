-- W2.6 — THE PROACTIVE MORNING BRIEFING: Hamza opens the conversation.
--
-- MEASURED before this migration (2026-07-27):
--   · `packages/outbox-executor/src/scheduler.ts` carried 14 scheduled jobs and
--     NOT ONE of them wrote to `chat_messages`. Every row on the CEO's board
--     since 2026-07-19 was an answer to something he typed first — the holding
--     had never once opened a conversation with its own CEO.
--   · `CEO_OPERATING_MANUAL.md:21` promises a briefing "07:00 itibarıyla hazır",
--     and that was true only passively: `/intelligence` renders a live view, so
--     the page is "ready" at every hour of the day and speaks to nobody.
--   · `pgboss.schedule` = 14 rows, every one of them `timezone = UTC`.
--
-- WHAT THIS ADDS, and the rule behind each part:
--   1. `v_ceo_briefing` — the ONE content source. Phase 9 LOCKED it: "brifing
--      tek SQL görünümden; ajan brifing yazmaz" (09-02-PLAN.md:14). The renderer
--      formats this row into sentences and may not introduce a number.
--   2. Both language legs on the CEO's board: `chat_messages.content_tr` and
--      `chat_sessions.title_tr`. U26 established that DB text is an i18n
--      surface and therefore the system authors NO title — a rule satisfied so
--      far by the system having nothing to say. Now that it speaks, it speaks
--      twice, and the English board never borrows the Turkish leg.
--   3. `ceo_briefings` — the delivery ledger, UNIQUE (briefing_date, slot), so
--      "exactly one briefing per morning" is structural rather than hopeful. The
--      date is the CEO's own day (Europe/Berlin), never the server's UTC one.
--   4. The CEO's switch and ceiling (`briefing.proactive.enabled` /
--      `.max_per_day`, U34 idiom): a daemon that speaks to him every morning
--      must have its off button in his hand. Both refusals are audited, so
--      "switched off" and "broken" can never look the same afterwards.
--
-- Spec: VOICE_INTERACTION_SPEC §24quinquies (registered adaptation, U37).

BEGIN;

-- ── 1. the CEO's board learns to hold system-authored text ────────────────
ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS content_tr text;

COMMENT ON COLUMN public.chat_messages.content_tr IS
  'Turkish leg of a SYSTEM-authored message (briefing). NULL on human/model conversation turns: the CEO''s own words and Hamza''s replies are the language they were spoken in, not translations.';

ALTER TABLE public.chat_sessions
  ADD COLUMN IF NOT EXISTS title_tr text;

COMMENT ON COLUMN public.chat_sessions.title_tr IS
  'Turkish leg of a system-authored thread name (W2.6). A thread named by the CEO''s own opening line needs no second leg — the view derives both from his words.';

-- A briefing is neither typed nor spoken; it is the holding addressing its CEO.
ALTER TABLE public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_source_check;
ALTER TABLE public.chat_messages
  ADD CONSTRAINT chat_messages_source_check
  CHECK (source = ANY (ARRAY['chat'::text, 'voice'::text, 'briefing'::text]));

-- ── 2. the thread list carries both legs ──────────────────────────────────
-- Stored titles win when they exist (a system-authored thread has both); a
-- thread named by the CEO's own first sentence derives the SAME text into both
-- legs, because his words are not a translation of anything.
-- CREATE OR REPLACE cannot insert a column in the middle of an existing view
-- ("cannot change name of view column created_at to title_tr"), and the new leg
-- belongs beside its English half rather than appended at the end where nobody
-- reading the view would find it.
DROP VIEW IF EXISTS public.v_chat_threads;
CREATE VIEW public.v_chat_threads AS
WITH opening AS (
  SELECT s.id,
         (
           SELECT CASE
                    WHEN length(btrim(split_part(m.content, E'\n', 1))) > 60
                      THEN left(btrim(split_part(m.content, E'\n', 1)), 57) || '...'
                    ELSE NULLIF(btrim(split_part(m.content, E'\n', 1)), '')
                  END
             FROM public.chat_messages m
            WHERE m.session_id = s.id AND m.role = 'ceo'
            ORDER BY m.created_at ASC
            LIMIT 1
         ) AS derived
    FROM public.chat_sessions s
)
SELECT
  s.id,
  COALESCE(NULLIF(btrim(s.title), ''), o.derived)                                AS title,
  COALESCE(NULLIF(btrim(s.title_tr), ''), NULLIF(btrim(s.title), ''), o.derived) AS title_tr,
  s.created_at,
  s.last_message_at,
  (SELECT count(*) FROM public.chat_messages m WHERE m.session_id = s.id)        AS messages,
  (SELECT count(*) FROM public.chat_messages m
    WHERE m.session_id = s.id AND m.role = 'ceo')                                AS ceo_turns,
  (SELECT bool_or(m.source = 'voice') FROM public.chat_messages m
    WHERE m.session_id = s.id)                                                   AS has_voice,
  (SELECT bool_or(m.source = 'briefing') FROM public.chat_messages m
    WHERE m.session_id = s.id)                                                   AS has_briefing
  FROM public.chat_sessions s
  JOIN opening o ON o.id = s.id;

GRANT SELECT ON public.v_chat_threads TO authenticated;

-- ── 3. the delivery ledger ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ceo_briefings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- The CEO's own day (Europe/Berlin). A UTC date would deliver two briefings
  -- on the day the clocks and his morning disagree.
  briefing_date date NOT NULL,
  slot text NOT NULL DEFAULT 'morning',
  session_id uuid NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  message_id uuid NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (briefing_date, slot)
);

COMMENT ON TABLE public.ceo_briefings IS
  'One row per delivered proactive briefing (W2.6). UNIQUE(briefing_date, slot) is the exactly-once guarantee: a restart storm, a re-fired cron or a manual trigger cannot produce a second morning.';

ALTER TABLE public.ceo_briefings ENABLE ROW LEVEL SECURITY;
-- A new table is invisible until it is given the seat the rest of the board
-- already has (U26 defect: chat_sessions shipped without this and the CEO's
-- board rendered empty).
GRANT SELECT ON public.ceo_briefings TO authenticated;
DROP POLICY IF EXISTS ceo_briefings_read ON public.ceo_briefings;
CREATE POLICY ceo_briefings_read ON public.ceo_briefings
  FOR SELECT TO authenticated USING (true);

-- ── 4. the CEO's switch and the CEO's ceiling ─────────────────────────────
INSERT INTO public.settings_registry
  (key, category, value_schema, risk, requires_approval, cost_impact, affected_areas,
   description_en, description_tr, locked, scope_types, delegate)
VALUES
  ('briefing.proactive.enabled', 'orchestration',
   '{"type":"boolean","default":true}',
   'low', false, 'none', '{orchestration,chat}',
   'When on, Hamza opens a briefing conversation on the chat board every morning at 07:00',
   'Açıkken, Hamza her sabah 07:00''de sohbet panosunda brifing konuşmasını kendisi açar',
   false, '{global}', NULL),
  ('briefing.proactive.max_per_day', 'orchestration',
   '{"type":"number","default":1}',
   'low', false, 'none', '{orchestration,chat}',
   'Maximum briefings the holding may open in one day, however often the job fires',
   'Holdingin bir günde açabileceği en fazla brifing sayısı (iş kaç kez tetiklenirse tetiklensin)',
   false, '{global}', NULL)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.settings_values (key, scope, value, updated_by)
VALUES
  ('briefing.proactive.enabled', 'global', 'true'::jsonb, 'migration-w26'),
  ('briefing.proactive.max_per_day', 'global', '1'::jsonb, 'migration-w26')
ON CONFLICT DO NOTHING;

-- ── 5. the ONE content source ─────────────────────────────────────────────
-- Everything the briefing is allowed to say, measured in one place. The window
-- is the SAME one `v_morning_briefing` uses (yesterday 19:00 Europe/Berlin), so
-- the page and the conversation can never report different nights.
--
-- Task lines carry `label`/`label_tr` with the U29 fallback chain (label →
-- first LINE of the objective). Reading `objective` directly is the defect that
-- printed a 1700-character scout brief as one feed row.
DROP VIEW IF EXISTS public.v_ceo_briefing;
CREATE VIEW public.v_ceo_briefing
WITH (security_invoker = true) AS
WITH w AS (
  SELECT (((now() AT TIME ZONE 'Europe/Berlin')::date - 1) + time '19:00')
           AT TIME ZONE 'Europe/Berlin'                       AS start_ts,
         (now() AT TIME ZONE 'Europe/Berlin')::date           AS briefing_date
),
night AS (
  SELECT
    count(DISTINCT e.task_id) FILTER (WHERE e.to_status = 'done')::int   AS done_count,
    count(DISTINCT e.task_id) FILTER (WHERE e.to_status = 'failed')::int AS failed_count
    FROM public.task_events e, w
   WHERE e.created_at >= w.start_ts
),
night_list AS (
  SELECT COALESCE(
           jsonb_agg(jsonb_build_object(
             'label',    COALESCE(t.label, split_part(t.objective, E'\n', 1)),
             'label_tr', COALESCE(t.label_tr, t.label, split_part(t.objective, E'\n', 1))
           ) ORDER BY d.last_at DESC),
           '[]'::jsonb) AS headlines
    FROM (
      SELECT e.task_id, max(e.created_at) AS last_at
        FROM public.task_events e, w
       WHERE e.created_at >= w.start_ts AND e.to_status = 'done'
       GROUP BY e.task_id
       ORDER BY max(e.created_at) DESC
       LIMIT 3
    ) d
    JOIN public.tasks t ON t.id = d.task_id
),
night_failed AS (
  -- What BROKE overnight is the most actionable line in a morning report: a
  -- count alone sends the CEO hunting through /ops/tasks for a name.
  -- The owning department rides along: two tasks can carry the same headline
  -- (a reworded retry beside the attempt it replaced), and "finished" next to
  -- "failed" with the same name reads like a contradiction until you can see
  -- whose desk each one was on. Localised name, never the raw slug.
  SELECT COALESCE(
           jsonb_agg(jsonb_build_object(
             'label',    COALESCE(t.label, split_part(t.objective, E'\n', 1)),
             'label_tr', COALESCE(t.label_tr, t.label, split_part(t.objective, E'\n', 1)),
             'dept',     COALESCE(dep.display_name, t.department),
             'dept_tr',  COALESCE(dep.display_name_tr, dep.display_name, t.department)
           ) ORDER BY d.last_at DESC),
           '[]'::jsonb) AS headlines
    FROM (
      SELECT e.task_id, max(e.created_at) AS last_at
        FROM public.task_events e, w
       WHERE e.created_at >= w.start_ts AND e.to_status = 'failed'
       GROUP BY e.task_id
       ORDER BY max(e.created_at) DESC
       LIMIT 2
    ) d
    JOIN public.tasks t ON t.id = d.task_id
    LEFT JOIN public.departments dep ON dep.slug = t.department
),
machine AS (
  -- W2.5: work the holding opened with nobody watching. The CEO asked for a
  -- company that runs itself; this is the line that proves it did last night.
  SELECT count(*)::int AS opened
    FROM public.generated_work g, w
   WHERE g.created_at >= w.start_ts AND g.task_id IS NOT NULL
),
cost24 AS (
  -- Same table and same sum() semantics as COST-04 / v_morning_briefing —
  -- never a second way to compute the company's money.
  SELECT COALESCE(sum(c.cost_eur), 0)::numeric(12,6) AS total
    FROM public.cost_ledger c
   WHERE c.created_at >= now() - interval '24 hours'
),
alerts_open AS (
  SELECT count(*)::int AS n,
         count(*) FILTER (WHERE level IN ('critical','emergency'))::int AS critical
    FROM public.alerts WHERE resolved_at IS NULL
),
rev AS (
  SELECT COALESCE((SELECT sum(amount_eur) FROM public.revenue_ledger), 0)::numeric(14,2) AS lifetime,
         (SELECT count(*) FROM public.opportunities)::int                                AS opportunities
),
ceiling AS (
  -- Scalar form so this CTE is ALWAYS exactly one row: every block below is a
  -- plain cross join of single-row facts, and a missing ceiling can never make
  -- the whole briefing disappear.
  SELECT COALESCE((SELECT limit_eur FROM public.v_revenue_capital_ceiling LIMIT 1), 0) AS limit_eur,
         (SELECT objective_id FROM public.v_revenue_capital_ceiling LIMIT 1)           AS objective_id
),
blocked AS (
  SELECT count(*)::int AS n
    FROM public.opportunities o, ceiling c
   WHERE o.state IN ('discovered','scored','shortlisted','piloting','scaling')
     AND COALESCE(o.capital_required_eur, 0) > c.limit_eur
)
SELECT
  -- TEXT, not date, and deliberately so: a `date` crosses the driver as a JS
  -- Date at LOCAL midnight, and `toISOString()` on it hands back YESTERDAY for
  -- every hour of the CEO's morning that is still the previous day in UTC.
  -- Measured on the first live run (2026-07-27 01:30 Berlin): the briefing was
  -- filed and titled "26 Temmuz". The calendar day is decided here, in the
  -- CEO's timezone, and never re-derived downstream.
  to_char(w.briefing_date, 'YYYY-MM-DD')        AS briefing_date,
  w.start_ts                                    AS window_start,
  night.done_count,
  night.failed_count,
  night_list.headlines                          AS done_headlines,
  night_failed.headlines                        AS failed_headlines,
  machine.opened                                AS machine_opened,
  o.running_tasks,
  o.queued_tasks,
  o.pending_approvals,
  o.pending_high_risk,
  alerts_open.n                                 AS open_alerts,
  alerts_open.critical                          AS open_alerts_critical,
  cost24.total                                  AS cost_24h_eur,
  o.cost_month_eur,
  o.monthly_cap_eur,
  o.hard_stopped,
  rev.lifetime                                  AS revenue_lifetime_eur,
  rev.opportunities                             AS opportunities_total,
  blocked.n                                     AS opportunities_capital_blocked,
  ceiling.limit_eur                             AS capital_limit_eur,
  (ceiling.objective_id IS NOT NULL)            AS active_objective_open
  FROM w, night, night_list, night_failed, machine, cost24, alerts_open, rev, blocked, ceiling,
       public.v_exec_overview o;

COMMENT ON VIEW public.v_ceo_briefing IS
  'W2.6 single content source for the proactive morning briefing (Phase 9 LOCKED: one SQL view, no agent authorship). The renderer formats these facts in both languages and may not add a figure.';

GRANT SELECT ON public.v_ceo_briefing TO authenticated;
GRANT SELECT ON public.v_ceo_briefing TO service_role;

-- ── 6. the door ───────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.control_ceo_briefing_post(
  p_slot     text DEFAULT 'morning',
  p_date     date DEFAULT NULL,
  p_title_en text DEFAULT NULL,
  p_title_tr text DEFAULT NULL,
  p_body_en  text DEFAULT NULL,
  p_body_tr  text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_date     date := COALESCE(p_date, (now() AT TIME ZONE 'Europe/Berlin')::date);
  v_slot     text := COALESCE(NULLIF(btrim(p_slot), ''), 'morning');
  v_en       text := btrim(COALESCE(p_body_en, ''));
  v_tr       text := btrim(COALESCE(p_body_tr, ''));
  v_title_en text := btrim(COALESCE(p_title_en, ''));
  v_title_tr text := btrim(COALESCE(p_title_tr, ''));
  v_max      int;
  v_today    int;
  v_session  uuid;
  v_message  uuid;
BEGIN
  -- A half-translated briefing would put an English paragraph on the Turkish
  -- board, which is the defect class this column pair exists to prevent.
  IF v_en = '' OR v_tr = '' THEN
    RAISE EXCEPTION 'a briefing needs both language legs' USING ERRCODE = '22023';
  END IF;
  IF v_title_en = '' OR v_title_tr = '' THEN
    RAISE EXCEPTION 'a briefing thread needs a name in both languages' USING ERRCODE = '22023';
  END IF;

  IF NOT COALESCE((resolve_setting('briefing.proactive.enabled'))::text = 'true', true) THEN
    INSERT INTO audit_log (actor, actor_type, action, payload)
    VALUES ('ceo.briefing', 'system', 'chat.briefing.refused',
            jsonb_build_object('reason', 'DISABLED', 'briefing_date', v_date, 'slot', v_slot,
                               'detail', 'briefing.proactive.enabled is off — the CEO closed his morning briefing'));
    RETURN jsonb_build_object('ok', false, 'reason', 'DISABLED');
  END IF;

  -- This morning first, the ceiling second: with a cap of 1 both refusals are
  -- true, and "you already have today's briefing" tells the caller something
  -- "you reached your daily limit" does not. No audit row — the delivered
  -- briefing IS the record, and a re-fired cron may not spam the log daily.
  IF EXISTS (SELECT 1 FROM ceo_briefings WHERE briefing_date = v_date AND slot = v_slot) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'ALREADY_DELIVERED',
                              'briefing_date', v_date, 'slot', v_slot);
  END IF;

  v_max := GREATEST(COALESCE(fn_setting_numeric('briefing.proactive.max_per_day', 1), 1), 0)::int;
  SELECT count(*) INTO v_today FROM ceo_briefings WHERE briefing_date = v_date;
  IF v_today >= v_max THEN
    INSERT INTO audit_log (actor, actor_type, action, payload)
    VALUES ('ceo.briefing', 'system', 'chat.briefing.refused',
            jsonb_build_object('reason', 'DAILY_CAP', 'briefing_date', v_date, 'slot', v_slot,
                               'delivered_today', v_today, 'max_per_day', v_max));
    RETURN jsonb_build_object('ok', false, 'reason', 'DAILY_CAP',
                              'delivered_today', v_today, 'max_per_day', v_max);
  END IF;

  -- Thread and message are born together: a conversation that exists before the
  -- message that starts it is the ghost-thread defect of 2026-07-26 (U27).
  INSERT INTO chat_sessions (title, title_tr) VALUES (v_title_en, v_title_tr)
  RETURNING id INTO v_session;

  INSERT INTO chat_messages (role, content, content_tr, mode, status, source, session_id)
  VALUES ('hamza', v_en, v_tr, 'normal', 'answered', 'briefing', v_session)
  RETURNING id INTO v_message;

  INSERT INTO ceo_briefings (briefing_date, slot, session_id, message_id)
  VALUES (v_date, v_slot, v_session, v_message);

  INSERT INTO audit_log (actor, actor_type, action, payload)
  VALUES ('ceo.briefing', 'system', 'chat.briefing.delivered',
          jsonb_build_object('briefing_date', v_date, 'slot', v_slot,
                             'session_id', v_session, 'message_id', v_message));

  RETURN jsonb_build_object('ok', true, 'session_id', v_session, 'message_id', v_message,
                            'briefing_date', v_date, 'slot', v_slot);
EXCEPTION
  WHEN unique_violation THEN
    -- Two processes racing for the same morning: the ledger decides, and the
    -- loser's thread rolls back with it (plpgsql block = subtransaction).
    RETURN jsonb_build_object('ok', false, 'reason', 'ALREADY_DELIVERED',
                              'briefing_date', v_date, 'slot', v_slot);
END
$$;

COMMENT ON FUNCTION public.control_ceo_briefing_post(text, date, text, text, text, text) IS
  'W2.6: the ONLY door that opens a briefing conversation on the CEO board. Switch + daily ceiling + audited refusals + exactly-once ledger.';

COMMIT;

-- ROLLBACK:
--   DROP FUNCTION IF EXISTS public.control_ceo_briefing_post(text, date, text, text, text, text);
--   DROP VIEW IF EXISTS public.v_ceo_briefing;
--   DROP TABLE IF EXISTS public.ceo_briefings;
--   DELETE FROM public.settings_values  WHERE key LIKE 'briefing.proactive.%';
--   DELETE FROM public.settings_registry WHERE key LIKE 'briefing.proactive.%';
--   ALTER TABLE public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_source_check;
--   ALTER TABLE public.chat_messages ADD CONSTRAINT chat_messages_source_check
--     CHECK (source = ANY (ARRAY['chat'::text, 'voice'::text]));
--   ALTER TABLE public.chat_sessions DROP COLUMN IF EXISTS title_tr;
--   ALTER TABLE public.chat_messages DROP COLUMN IF EXISTS content_tr;
--   (v_chat_threads: re-run db/migrations/20260726007000_chat_threads_view.sql)
