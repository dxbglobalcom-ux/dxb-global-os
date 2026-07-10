// Command Center information architecture — CC-SPEC §7 route table,
// verbatim. 7 groups × §31 pages; labels resolve through the i18n
// dictionary (command.nav.*), never hard-coded strings.
// ⛔ Changing group composition is a shell-composition decision:
// strongest available model + CEO approval (CC-SPEC §24).

export type NavItem = { key: string; href: string };
export type NavGroup = { key: string; items: NavItem[] };

export const COMMAND_NAV: NavGroup[] = [
  {
    key: "command",
    items: [
      { key: "overview", href: "/overview" },
      { key: "live", href: "/live" },
      { key: "intel", href: "/intelligence" },
      { key: "approvals", href: "/approvals" },
      { key: "alerts", href: "/alerts" },
    ],
  },
  {
    key: "organization",
    items: [
      { key: "org", href: "/org" },
      { key: "companies", href: "/org/companies" },
      { key: "departments", href: "/org/departments" },
      { key: "directors", href: "/org/directors" },
      { key: "employees", href: "/org/employees" },
      { key: "hr", href: "/org/hr" },
    ],
  },
  {
    key: "operations",
    items: [
      { key: "projects", href: "/ops/projects" },
      { key: "workflows", href: "/ops/workflows" },
      { key: "tasks", href: "/ops/tasks" },
      { key: "automations", href: "/ops/automations" },
      { key: "runtime", href: "/ops/runtime" },
    ],
  },
  {
    key: "intelligence",
    items: [
      { key: "models", href: "/ai/models" },
      { key: "orchestration", href: "/ai/orchestration" },
      { key: "memory", href: "/ai/memory" },
      { key: "knowledge", href: "/ai/knowledge" },
      { key: "library", href: "/ai/library" },
      { key: "skills", href: "/ai/skills" },
      { key: "plugins", href: "/ai/plugins" },
    ],
  },
  {
    key: "governance",
    items: [
      { key: "audit", href: "/gov/audit" },
      { key: "decisions", href: "/gov/decisions" },
      { key: "risks", href: "/gov/risks" },
      { key: "policies", href: "/gov/policies" },
      { key: "permissions", href: "/gov/permissions" },
      { key: "security", href: "/gov/security" },
    ],
  },
  {
    key: "finance",
    items: [
      { key: "costs", href: "/fin/costs" },
      { key: "tokens", href: "/fin/tokens" },
      { key: "budgets", href: "/fin/budgets" },
      { key: "providers", href: "/fin/providers" },
      { key: "capacity", href: "/fin/capacity" },
    ],
  },
  {
    key: "system",
    items: [
      { key: "settings", href: "/sys/settings" },
      { key: "integrations", href: "/sys/integrations" },
      { key: "health", href: "/sys/health" },
      { key: "logs", href: "/sys/logs" },
      { key: "backups", href: "/sys/backups" },
    ],
  },
];
