// Modül → canlı veri ailesi eşlemesi (C-Hibrit bağlantı kontratı,
// R-kapısı 2026-07-11): inşası süren her modül, kendi veri ailesinin
// GERÇEK canlı sayısını ve ilgili canlı yüzeyin kapısını gösterir —
// "salt metin placeholder" yasaktır (D4). Aile sorguları mevcut şemadan
// okur; yeni aile eklemek = önce DATA_MODEL, sonra burası.

export type LiveFamily =
  | "tasks"
  | "approvals"
  | "agents"
  | "departments"
  | "cost"
  | "events";

export type ModuleLive = {
  family: LiveFamily;
  /** İlgili CANLI yüzeye kapı — nav pages sözlüğündeki anahtar + href. */
  relatedKey: string;
  relatedHref: string;
};

const OPS: ModuleLive = {
  family: "tasks",
  relatedKey: "tasks",
  relatedHref: "/ops/tasks",
};
const ORG: ModuleLive = {
  family: "agents",
  relatedKey: "employees",
  relatedHref: "/org/employees",
};
const FIN: ModuleLive = {
  family: "cost",
  relatedKey: "costs",
  relatedHref: "/fin/costs",
};
const GOV: ModuleLive = {
  family: "events",
  relatedKey: "live",
  relatedHref: "/live",
};
const AI: ModuleLive = {
  family: "events",
  relatedKey: "live",
  relatedHref: "/live",
};
const SYS: ModuleLive = {
  family: "events",
  relatedKey: "live",
  relatedHref: "/live",
};

export const MODULE_LIVE: Record<string, ModuleLive> = {
  // command
  intel: { family: "approvals", relatedKey: "approvals", relatedHref: "/approvals" },
  alerts: { family: "approvals", relatedKey: "approvals", relatedHref: "/approvals" },
  // organization
  org: { family: "departments", relatedKey: "employees", relatedHref: "/org/employees" },
  companies: { family: "departments", relatedKey: "employees", relatedHref: "/org/employees" },
  departments: { family: "departments", relatedKey: "employees", relatedHref: "/org/employees" },
  directors: ORG,
  employees: ORG,
  hr: ORG,
  // operations
  projects: OPS,
  workflows: OPS,
  tasks: OPS,
  automations: OPS,
  runtime: OPS,
  // intelligence
  models: AI,
  orchestration: AI,
  memory: AI,
  knowledge: AI,
  library: AI,
  skills: AI,
  plugins: AI,
  // governance
  audit: GOV,
  decisions: GOV,
  risks: { family: "approvals", relatedKey: "approvals", relatedHref: "/approvals" },
  policies: GOV,
  permissions: GOV,
  security: GOV,
  // finance
  costs: FIN,
  tokens: FIN,
  budgets: FIN,
  providers: FIN,
  capacity: FIN,
  // system
  settings: SYS,
  integrations: SYS,
  health: { family: "tasks", relatedKey: "live", relatedHref: "/live" },
  logs: GOV,
  backups: SYS,
};
