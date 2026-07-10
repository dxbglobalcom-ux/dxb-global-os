-- intents_intake: durable intake queue for CEO intents (DASH-02, master plan
-- step 7). ⛔ RLS/write-path change: Fable-only.
--
-- The dashboard INSERTs raw text (its 2nd and last pre-CRM write path — the
-- column grant pins exactly what it may set; status always lands 'received').
-- The kernel-side intake worker (orchestrator intent-intake, hosted by the
-- pg-boss resident) claims received rows, runs classify→decompose→dispatch,
-- and records the resulting task chain in task_ids. No LLM ever runs in the
-- dashboard process.

CREATE TABLE intents (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text       text NOT NULL CHECK (char_length(text) BETWEEN 1 AND 500),
  lang       text NOT NULL DEFAULT 'en' CHECK (lang IN ('tr', 'en')),
  source     text NOT NULL DEFAULT 'dashboard',
  actor      text NOT NULL DEFAULT 'ceo',
  status     text NOT NULL DEFAULT 'received'
               CHECK (status IN ('received', 'classifying', 'dispatched', 'failed_dispatch')),
  error      text,
  task_ids   uuid[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_intents_status_created ON intents (status, created_at);

ALTER TABLE intents ENABLE ROW LEVEL SECURITY;

-- Cockpit read surface (IntentStrip, recent list)
GRANT SELECT ON intents TO authenticated;
CREATE POLICY intents_ceo_read ON intents FOR SELECT TO authenticated USING (true);

-- Dashboard submit path: column-level INSERT grant — status/task_ids/error
-- are NOT grantable columns, so they always take their defaults.
GRANT INSERT (text, lang, source, actor) ON intents TO authenticated;
CREATE POLICY intents_ceo_submit ON intents FOR INSERT TO authenticated
  WITH CHECK (source = 'dashboard' AND actor = 'ceo');
