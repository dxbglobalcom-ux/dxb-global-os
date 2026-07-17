-- Voice fast lane (registered adaptation, VOICE_INTERACTION_SPEC §5/§27 note
-- 2026-07-17). Measured on the CEO's live call f05cf286: transcript at
-- 14:08:16Z, answer at 14:10:00Z — a 104s answer leg, because both the
-- un-targeted classify AND the 2-4 sentence spoken answer rode the L1
-- 'orchestration' row (opus-4.8) on X230 hardware. A spoken ack is
-- latency-critical and shallow; it belongs on the fast tier. Routing stays
-- pure data (KERN-02): this migration only adds rows, no code names a model.
-- packages/kernel/policy/routing-seed.json carries the same two rows for
-- fresh-bootstrap parity (R2.5 law).

INSERT INTO routing_rules (task_class, match, model_tier, model, mode, effort, needs_council, priority, enabled)
SELECT 'voice.classify', '{}'::jsonb, 'L4', 'claude-haiku-4-5', 'subscription', 'low', false, 0, true
WHERE NOT EXISTS (
  SELECT 1 FROM routing_rules WHERE task_class = 'voice.classify'
);

INSERT INTO routing_rules (task_class, match, model_tier, model, mode, effort, needs_council, priority, enabled)
SELECT 'voice.answer', '{}'::jsonb, 'L4', 'claude-haiku-4-5', 'subscription', 'low', false, 0, true
WHERE NOT EXISTS (
  SELECT 1 FROM routing_rules WHERE task_class = 'voice.answer'
);
