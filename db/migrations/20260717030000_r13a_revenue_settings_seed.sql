-- R1.3a — revenue settings seed (REVENUE_ENGINE_SPEC §22 / 0028d):
-- score weights (12 dims), halal intake screen mirror, SNEV constant, gap
-- alert threshold. Canonical haram term source stays hook policy
-- const.halal_screen (R1.5); 'revenue.halal_screen' is the intake-screen
-- mirror (spec §16 leg b) consumed by the revenue.scan job.

INSERT INTO public.settings_registry
  (key, category, value_schema, risk, requires_approval, cost_impact, affected_areas,
   description_en, description_tr, locked, scope_types, delegate)
VALUES
  ('revenue.score_weights', 'revenue',
   '{"type":"json","default":{"market":1,"trend":1,"demand":1,"competition":1,"price_gap":1,"logistics":1,"platform_fees":1,"tax_constraints":1,"ad_cost":1,"est_margin":1,"time_to_revenue_days":1,"scalability":1}}',
   'medium', false, 'none', '{revenue,scoring}',
   'Opportunity scoring weights (12 dims)', 'Fırsat skorlama ağırlıkları (12 boyut)',
   false, '{global}', NULL),
  ('revenue.halal_screen', 'revenue',
   '{"type":"json","default":[]}',
   'critical', false, 'none', '{revenue,intake,islamic_boundaries}',
   'Intake auto-flag term list (mirror of hook const.halal_screen; flags to review, never issues verdicts)',
   'Fırsat girişi otomatik işaretleme listesi (hook const.halal_screen aynası; review''a işaretler, hüküm VERMEZ)',
   false, '{global}', NULL),
  ('revenue.snev.concentration_penalty_factor', 'revenue',
   '{"type":"number","default":0.2}',
   'low', false, 'none', '{revenue,kpi}',
   'SNEV concentration penalty factor', 'SNEV yoğunlaşma ceza katsayısı',
   false, '{global}', NULL),
  ('revenue.gap_alert_threshold_pct', 'revenue',
   '{"type":"number","default":25}',
   'medium', false, 'none', '{revenue,alerts}',
   'Objective pacing gap alert threshold (%)', 'Hedef tempo açığı alarm eşiği (%)',
   false, '{global}', NULL)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.settings_values (key, scope, value, updated_by)
VALUES
  ('revenue.score_weights', 'global',
   '{"market":1,"trend":1,"demand":1,"competition":1,"price_gap":1,"logistics":1,"platform_fees":1,"tax_constraints":1,"ad_cost":1,"est_margin":1,"time_to_revenue_days":1,"scalability":1}'::jsonb,
   'migration-r13'),
  ('revenue.halal_screen', 'global',
   '["alcohol","alkol","içki","şarap","bira","rakı","vodka","viski","whisky","wine","beer","liquor",
     "tobacco","tütün","sigara","cigarette","vape","nargile","hookah",
     "pork","domuz","bacon","jambon",
     "gambling","kumar","casino","bahis","betting","poker","iddaa","piyango","lottery","slot machine",
     "riba","faiz","usury","tefecilik","payday loan","kredi faizi","interest-bearing",
     "pornography","porno","erotik","müstehcen","nsfw","adult content","adult entertainment",
     "fraud","dolandırıcılık","scam","phishing","sahtecilik","ponzi","pyramid scheme","saadet zinciri",
     "crypto trading","kripto ticareti","kripto al-sat","forex","binary option","margin trading","day trading",
     "stock trading","hisse senedi al-sat","borsa spekülasyon"]'::jsonb,
   'migration-r13'),
  ('revenue.snev.concentration_penalty_factor', 'global', '0.2'::jsonb, 'migration-r13'),
  ('revenue.gap_alert_threshold_pct', 'global', '25'::jsonb, 'migration-r13')
ON CONFLICT DO NOTHING;
