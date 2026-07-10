-- COST-04 fix: PostgREST ships with aggregate functions disabled
-- (db-aggregates-enabled defaults to false). The cockpit's cost tiles read
-- cost_ledger through `cost_eur.sum()` (apps/dashboard/src/lib/costs.ts), so
-- every authenticated render of / and /costs failed with
-- "Use of aggregate functions is not allowed" (digest 1516538040).
-- Aggregates stay safe here: RLS on cost_ledger still scopes what the
-- authenticated CEO role can aggregate over.
alter role authenticator set pgrst.db_aggregates_enabled = 'true';

notify pgrst, 'reload config';
