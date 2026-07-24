// Command Center information architecture — CC-SPEC §7 route table,
// verbatim. 7 groups × §31 pages; labels resolve through the i18n
// dictionary (command.nav.*), never hard-coded strings.
// ⛔ Changing group composition is a shell-composition decision:
// strongest available model + CEO approval (CC-SPEC §24).
//
// C-Hibrit bağlantı kontratı (R-kapısı 2026-07-11, reçete C): her nav
// kaydı ikonunu ve canlı sayaç kaynağını BURADAN alır — ikon/veri/drill
// eşlemesi tek kaynaktır; sayfa içinde ad-hoc ikon seçimi yasaktır.
import type { LucideIcon } from "lucide-react";
import {
  AlarmClock,
  Banknote,
  BookOpen,
  BrainCircuit,
  Briefcase,
  Cable,
  Building2,
  CircleDollarSign,
  ClipboardCheck,
  Coins,
  Compass,
  Cpu,
  Database,
  FileClock,
  Gauge,
  Gem,
  Handshake,
  GitBranch,
  Globe,
  HardDrive,
  HeartPulse,
  KeyRound,
  Landmark,
  Layers,
  LayoutDashboard,
  Library,
  MessagesSquare,
  Network,
  PieChart,
  Plug,
  Puzzle,
  Radio,
  Scale,
  ScrollText,
  Settings,
  Shield,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  Users,
  Workflow,
  Wrench,
} from "lucide-react";

export type NavCounter =
  | "active_tasks"
  | "pending_approvals"
  | "pending_high_risk";

export type NavItem = {
  key: string;
  href: string;
  icon: LucideIcon;
  /** Canlı sayaç anahtarı — CommandShell'in tek view okumasından beslenir. */
  counter?: NavCounter;
};
export type NavGroup = { key: string; items: NavItem[] };

export const COMMAND_NAV: NavGroup[] = [
  {
    key: "command",
    items: [
      { key: "overview", href: "/overview", icon: LayoutDashboard },
      // C1/C7/C10 (CEO orders 2026-07-19): the CEO talks to Hamza FIRST —
      // conversation and planning before any dispatch. The board lives at
      // the top of the command group, right under the overview.
      { key: "chat", href: "/chat", icon: MessagesSquare },
      { key: "live", href: "/live", icon: Radio },
      { key: "intel", href: "/intelligence", icon: Sparkles },
      {
        key: "approvals",
        href: "/approvals",
        icon: ClipboardCheck,
        counter: "pending_approvals",
      },
      {
        key: "alerts",
        href: "/alerts",
        icon: ShieldAlert,
        counter: "pending_high_risk",
      },
      // R3.1 voice line (§31 route) merged into /chat 2026-07-24 (complaint
      // ledger 1a-1e): /voice redirects there; no separate nav row.
    ],
  },
  {
    key: "organization",
    items: [
      { key: "org", href: "/org", icon: Landmark },
      { key: "companies", href: "/org/companies", icon: Building2 },
      { key: "departments", href: "/org/departments", icon: Network },
      { key: "directors", href: "/org/directors", icon: UserRound },
      { key: "employees", href: "/org/employees", icon: Users },
      { key: "hr", href: "/org/hr", icon: HeartPulse },
    ],
  },
  {
    key: "operations",
    items: [
      { key: "projects", href: "/ops/projects", icon: Briefcase },
      // C11/C13 (CEO orders 2026-07-19): the revenue family are MONEY-MAKING
      // operations, not "intelligence" — they live here now. Tasks left the
      // nav entirely (the CEO doesn't drive by task list; the route stays
      // reachable from drill links).
      { key: "revenue", href: "/revenue", icon: Gem },
      { key: "revenuePortfolio", href: "/revenue/portfolio", icon: PieChart },
      { key: "crm", href: "/revenue/crm", icon: Handshake },
      { key: "revenueOpportunities", href: "/revenue/opportunities", icon: Compass },
      { key: "revenueObjectives", href: "/revenue/objectives", icon: Target },
      { key: "workflows", href: "/ops/workflows", icon: Workflow },
      { key: "automations", href: "/ops/automations", icon: AlarmClock },
      { key: "runtime", href: "/ops/runtime", icon: Gauge },
    ],
  },
  {
    key: "intelligence",
    items: [
      { key: "models", href: "/ai/models", icon: Cpu },
      { key: "orchestration", href: "/ai/orchestration", icon: GitBranch },
      { key: "memory", href: "/ai/memory", icon: Database },
      { key: "knowledge", href: "/ai/knowledge", icon: BrainCircuit },
      { key: "library", href: "/ai/library", icon: Library },
      { key: "skills", href: "/ai/skills", icon: Wrench },
      { key: "plugins", href: "/ai/plugins", icon: Puzzle },
      // U8 (CEO emri 2026-07-11 ~02:55): MCP sunucuları Intelligence
      // grubuna eklendi — §7 tablosuna +1 sayfa, kayıtlı uyarlama.
      { key: "mcp", href: "/ai/mcp", icon: Cable },
      // R1.4 revenue routes lived here until 2026-07-19 — moved to the
      // Operations group by CEO order (C11/C13: money-making places belong
      // under Operations, not Intelligence).
    ],
  },
  {
    key: "governance",
    items: [
      { key: "audit", href: "/gov/audit", icon: FileClock },
      { key: "decisions", href: "/gov/decisions", icon: Scale },
      { key: "risks", href: "/gov/risks", icon: ShieldAlert },
      { key: "policies", href: "/gov/policies", icon: ScrollText },
      { key: "permissions", href: "/gov/permissions", icon: KeyRound },
      { key: "security", href: "/gov/security", icon: Shield },
    ],
  },
  {
    key: "finance",
    items: [
      // P&L leads the group (CEO directive 2026-07-12): the holding exists
      // to produce income — earnings stand next to costs, never behind them.
      { key: "pnl", href: "/fin/pnl", icon: TrendingUp },
      { key: "costs", href: "/fin/costs", icon: CircleDollarSign },
      { key: "tokens", href: "/fin/tokens", icon: Coins },
      { key: "budgets", href: "/fin/budgets", icon: Banknote },
      { key: "providers", href: "/fin/providers", icon: Globe },
      { key: "capacity", href: "/fin/capacity", icon: Layers },
    ],
  },
  {
    key: "system",
    items: [
      { key: "settings", href: "/sys/settings", icon: Settings },
      { key: "integrations", href: "/sys/integrations", icon: Plug },
      { key: "health", href: "/sys/health", icon: HeartPulse },
      { key: "logs", href: "/sys/logs", icon: BookOpen },
      { key: "backups", href: "/sys/backups", icon: HardDrive },
    ],
  },
];
