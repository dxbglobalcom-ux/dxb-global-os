-- R1.5 — Islamic boundary codification into the hook policy engine.
-- Source rulings: 00-CEO-DIRECTIVE-REVENUE-FIRST §2 (immutable boundaries),
-- MASTER_PLAN §11, REVENUE_ENGINE_SPEC §16 (Islamic gate triple, leg c),
-- FABLE_5_HOOK_SPEC registered amendment R1.5.
--
-- Design notes:
--   * Filed under standard_no 11 ("Do not conflict with holding goals") —
--     haram scope is the deepest possible conflict with holding goals; the
--     1..17 CHECK constraint stays untouched.
--   * severity 'block' + fn_hook_set_policy CEO wall (§13) together mean NO
--     agent can weaken or disable this rule; the CEO remains sovereign (§27).
--   * Terms are letter-boundary matched in packages/hook pre-task
--     'halal_screen' check (tr-locale lowering both sides). Multi-word terms
--     supported. Deliberately NOT included because of false positives on
--     legitimate work: "ham" (TR: raw), "stock" (inventory), "slot" (time
--     slot), bare "interest"/"bitcoin" (analysis/news mentions).
--   * The same canonical list is mirrored into settings
--     'revenue.halal_screen' by the R1.2/R1.3 revenue_core wave (intake
--     screen, REVENUE_ENGINE_SPEC §16 leg b). Canonical source: this policy row.

INSERT INTO public.hook_policies
  (id, standard_no, gate, severity, rule, title_en, title_tr)
VALUES
  ('const.halal_screen', 11, 'pre', 'block',
   jsonb_build_object(
     'check', 'halal_screen',
     'source', '00-CEO-DIRECTIVE-REVENUE-FIRST §2 + MASTER_PLAN §11',
     'categories', jsonb_build_object(
       'alcohol',        jsonb_build_array('alcohol','alkol','içki','şarap','bira','rakı','vodka','viski','whisky','wine','beer','liquor'),
       'tobacco',        jsonb_build_array('tobacco','tütün','sigara','cigarette','vape','nargile','hookah'),
       'pork',           jsonb_build_array('pork','domuz','bacon','jambon'),
       'gambling',       jsonb_build_array('gambling','kumar','casino','bahis','betting','poker','iddaa','piyango','lottery','slot machine'),
       'riba',           jsonb_build_array('riba','faiz','usury','tefecilik','payday loan','kredi faizi','interest-bearing'),
       'adult',          jsonb_build_array('pornography','porno','erotik','müstehcen','nsfw','adult content','adult entertainment'),
       'fraud',          jsonb_build_array('fraud','dolandırıcılık','scam','phishing','sahtecilik','ponzi','pyramid scheme','saadet zinciri'),
       'crypto_trading', jsonb_build_array('crypto trading','kripto ticareti','kripto al-sat','forex','binary option','margin trading','day trading'),
       'stock_trading',  jsonb_build_array('stock trading','hisse senedi al-sat','borsa spekülasyon')
     )
   ),
   'Halal boundaries are absolute — haram scope fail-closes',
   'Helal sınırlar mutlaktır — haram kapsam fail-closed durur');

COMMENT ON COLUMN public.hook_policies.rule IS
  'machine-readable parameters; const.halal_screen carries the CANONICAL haram term list (CEO-only edits via fn_hook_set_policy §13; revenue settings mirror it)';
