-- R2.5 dept parity backfill (audit F-08 gap migration, 2026-07-17): several
-- departments were born OUTSIDE the migration chain (live control fns /
-- persona waves) while later migrations FK-reference them — a fresh bootstrap
-- broke at 20260711005000 (agents.department → 'design' missing). This file
-- sorts BEFORE that break and seeds the full department set idempotently
-- (ON CONFLICT DO NOTHING = a no-op on the live database, where rows exist).
-- company/parent linkage intentionally omitted: later recorded migrations
-- (20260712014000 / 20260712230000) establish it by slug on every env.
INSERT INTO departments (slug, display_name, mcp_profile, status) VALUES ('ceo', 'CEO Office', 'default-deny', 'dormant') ON CONFLICT (slug) DO NOTHING;
INSERT INTO departments (slug, display_name, mcp_profile, status) VALUES ('commerce', 'Commerce Operations', 'default-deny', 'dormant') ON CONFLICT (slug) DO NOTHING;
INSERT INTO departments (slug, display_name, mcp_profile, status) VALUES ('customer-success', 'Customer Success & Professional Services', 'default-deny', 'dormant') ON CONFLICT (slug) DO NOTHING;
INSERT INTO departments (slug, display_name, mcp_profile, status) VALUES ('data-ai', 'Data, AI Platform & Evaluation', 'default-deny', 'dormant') ON CONFLICT (slug) DO NOTHING;
INSERT INTO departments (slug, display_name, mcp_profile, status) VALUES ('design', 'Design', 'default-deny', 'dormant') ON CONFLICT (slug) DO NOTHING;
INSERT INTO departments (slug, display_name, mcp_profile, status) VALUES ('engineering', 'Engineering', 'default-deny', 'dormant') ON CONFLICT (slug) DO NOTHING;
INSERT INTO departments (slug, display_name, mcp_profile, status) VALUES ('finance', 'Finance', 'default-deny', 'dormant') ON CONFLICT (slug) DO NOTHING;
INSERT INTO departments (slug, display_name, mcp_profile, status) VALUES ('legal', 'Legal, Compliance & Corporate Governance', 'default-deny', 'dormant') ON CONFLICT (slug) DO NOTHING;
INSERT INTO departments (slug, display_name, mcp_profile, status) VALUES ('marketing', 'Marketing', 'default-deny', 'dormant') ON CONFLICT (slug) DO NOTHING;
INSERT INTO departments (slug, display_name, mcp_profile, status) VALUES ('paid-media', 'Paid Media', 'default-deny', 'dormant') ON CONFLICT (slug) DO NOTHING;
INSERT INTO departments (slug, display_name, mcp_profile, status) VALUES ('people-hr', 'People / HR / Talent Operations', 'default-deny', 'dormant') ON CONFLICT (slug) DO NOTHING;
INSERT INTO departments (slug, display_name, mcp_profile, status) VALUES ('platform', 'Platform, Infrastructure & Reliability', 'default-deny', 'dormant') ON CONFLICT (slug) DO NOTHING;
INSERT INTO departments (slug, display_name, mcp_profile, status) VALUES ('product', 'Product', 'default-deny', 'dormant') ON CONFLICT (slug) DO NOTHING;
INSERT INTO departments (slug, display_name, mcp_profile, status) VALUES ('project-management', 'Project Management', 'default-deny', 'dormant') ON CONFLICT (slug) DO NOTHING;
INSERT INTO departments (slug, display_name, mcp_profile, status) VALUES ('quality', 'Quality Management & Operational Excellence', 'default-deny', 'dormant') ON CONFLICT (slug) DO NOTHING;
INSERT INTO departments (slug, display_name, mcp_profile, status) VALUES ('revops', 'Revenue Operations & Commercial Excellence', 'default-deny', 'dormant') ON CONFLICT (slug) DO NOTHING;
INSERT INTO departments (slug, display_name, mcp_profile, status) VALUES ('risk-audit', 'Risk, Internal Audit & Assurance', 'default-deny', 'dormant') ON CONFLICT (slug) DO NOTHING;
INSERT INTO departments (slug, display_name, mcp_profile, status) VALUES ('sales', 'Sales', 'default-deny', 'dormant') ON CONFLICT (slug) DO NOTHING;
INSERT INTO departments (slug, display_name, mcp_profile, status) VALUES ('security', 'Security, Trust & Safety', 'default-deny', 'dormant') ON CONFLICT (slug) DO NOTHING;
INSERT INTO departments (slug, display_name, mcp_profile, status) VALUES ('social-media', 'Social Media', 'default-deny', 'dormant') ON CONFLICT (slug) DO NOTHING;
INSERT INTO departments (slug, display_name, mcp_profile, status) VALUES ('strategy', 'Corporate Strategy & Business Operations', 'default-deny', 'dormant') ON CONFLICT (slug) DO NOTHING;
