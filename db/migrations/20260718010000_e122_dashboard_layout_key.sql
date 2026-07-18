-- E12.2 — register the widget-layout settings key (CC-SPEC R8/§10).
-- The layout JSON {dashboards:[{id,name,default,widgets:[{type,x,y,w,h,filters}]}]}
-- lives in settings_values under the ceo_dashboard scope CLASS; the settings
-- engine's scoped-write law (E6.1: "scoped write needs an id: <class>:<id>")
-- makes the stored scope string 'ceo_dashboard:default' — recorded adaptation
-- in CEO_COMMAND_CENTER_SPEC §10 (spec scope name = the class, engine adds
-- the id segment; 'default' = the CEO's dashboard set).
-- Shape-level validation (widget types, grid bounds) is the /api/control/layout
-- Zod wall; the registry schema pins it to a JSON object.
INSERT INTO settings_registry
  (key, category, value_schema, risk, requires_approval, cost_impact,
   affected_areas, description_en, description_tr, locked, scope_types, delegate)
VALUES
  ('dashboard.layout', 'dashboard', '{"type": "json"}'::jsonb, 'low', false, false,
   ARRAY['dashboard'],
   'Executive Overview widget layout (WidgetGrid): dashboards, widget order, spans. Written only through /api/control/layout.',
   'Yönetici Özeti widget yerleşimi (WidgetGrid): panolar, widget sırası, boyutlar. Yalnız /api/control/layout üzerinden yazılır.',
   false, ARRAY['ceo_dashboard'], NULL)
ON CONFLICT (key) DO NOTHING;
