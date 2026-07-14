# E12.1 — Remaining §31 pages bound to real data — EXECUTION TICKET

**Roadmap row:** E12.1 — "Kalan §31 sayfaları gerçek veriye bağlanır (Memory, Library detay, Intelligence rayı içerikleri)".
**Acceptance:** rota-başı gerçek sorgu kanıtı; dummy widget 0.
**Specs:** CEO_COMMAND_CENTER_SPEC §3 (rail: approval özeti ✓E9.3 · critical alerts ✓E8.4b · **live ticker MISSING** · contextual controls) + §31 route list; MEMORY_ARCHITECTURE §7 (Memory page contract); HOLDING_LIBRARY_SPEC (detail — shipped E9.5, verify); per-family specs: ORGANIZATION_ENGINE, HR_OPERATING_SYSTEM (views live), MODEL_ROUTING (providers), OBSERVABILITY (runtime/logs/health), SECURITY_MODEL/PERMISSION_MODEL (gov), COST_CONTROL §5 (tokens/budgets/capacity), BACKUP_PLAN (backups), SETTINGS_AND_CONTROL (integrations).
**Zero new design decisions** — module template idiom (KPI Stats + Panel + DataGrid + drills + honest zeros), EN+TR.

## Baseline (verified at ticket time)

24 routes still render the 6-line `ModuleWaiting` stub: intelligence · org/{companies,departments,directors,hr} · ops/{automations,runtime} · ai/{memory,knowledge,skills,plugins,mcp} · gov/{risks,policies,permissions,security} · fin/{tokens,budgets,providers,capacity} · sys/{integrations,health,logs,backups}. Library detail (item record 11 fields + 4 tabs) shipped at E9.5 — this row VERIFIES it, no rebuild. Rail: live ticker missing.

## Wave plan (commit + design pass per wave; row closes when ModuleWaiting=0 on these)

- **A (headline trio):** /ai/memory (5-store cards + search/list + record detail + run bridge; mutations = recorded boundary, control_memory_* fns are spec-marked Dalga-4 additions) · /intelligence (v_morning_briefing blocks + v_alerts_active + v_decision_log + live tail) · rail live ticker (v_live_ops head + ops:live repaint). Data fix: claude-mem store missing its `memory_source` inventory row (spec §4 bridge) → register through control_library_action.
- **B (org):** companies · departments (v_org_tree) · directors · hr (v_hr_roster/probation/equipment).
- **C (fin):** tokens · budgets (budget_state+spend) · providers (model_catalog+v_model_stats) · capacity (system_health_snapshots + pgboss — empty = honest zero).
- **D (ai rest):** knowledge · skills · plugins · mcp (library_items kinds + v_library_catalog + gateway profiles).
- **E (gov):** risks (project_risks) · policies (hook_policies+approval_rules) · permissions (library_grants+profiles) · security (high-risk audit + hook_violations).
- **F (ops+sys):** automations (workflows cron/event + pgboss schedules) · runtime (v_live_ops/agent_runs) · integrations · health (snapshots+alert settings) · logs (audit/task_events tail) · backups (BACKUP_PLAN posture — no fake data).

## Evidence contract (per wave)

Per-route real query proof (SQL count vs page render) · vitest additions where logic is non-trivial · tsc/eslint/purity 0 · RULE #0 EN+TR × 1280+1920 per touched route + design-bank baselines · commit per wave.

## Boundaries (recorded)

control_memory_* mutations (archive/edit/reclassify/set_scope) → spec-registered Dalga-4 additions, NOT this row. Widget grid/persist → E12.2. Route DoD matrix + ModuleWaiting=0 gate report → E12.3. Contextual-controls rail slot → E12.2 (widget/control family).
