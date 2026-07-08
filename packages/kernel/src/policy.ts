// Routing policy engine — KERN-02: routing decisions are table lookups over
// routing_rules (seeded from packages/kernel/policy/routing-seed.json).
// This module only orders and matches. No model name may be written here;
// a no-match is a typed error, never a silent default model.
// No caching: rules are read per routing decision (table is tiny; Phase-8
// dashboard edits must take effect immediately).
import type { Kysely, Selectable } from "kysely";
import type { DB, RoutingRulesTable } from "@dxb/shared";
import type { ClassifiedIntent } from "./classify.js";

export type RoutingRule = Selectable<RoutingRulesTable>;

export interface ResolvedRoute {
  model_tier: string;
  model: string;
  mode: string;
  effort: string;
  needs_council: boolean;
}

export class NoRouteError extends Error {
  readonly task_class: string;
  constructor(taskClass: string) {
    super(`no enabled routing_rules row matches task_class '${taskClass}'`);
    this.name = "NoRouteError";
    this.task_class = taskClass;
  }
}

export async function loadPolicy(db: Kysely<DB>): Promise<RoutingRule[]> {
  return db
    .selectFrom("routing_rules")
    .selectAll()
    .where("enabled", "=", true)
    .orderBy("priority", "desc")
    .orderBy("updated_at", "desc")
    .execute();
}

// Supported match keys: dept (string ∈ ci.departments), keyword (case-insensitive
// substring of ci.intent_summary). An unknown match key makes the rule
// NON-matching — fail-closed so future match fields can't silently over-match.
function ruleMatches(ci: ClassifiedIntent, rule: RoutingRule): boolean {
  const m = rule.match;
  if (m === null || m === undefined) return true;
  if (typeof m !== "object" || Array.isArray(m)) return false; // malformed jsonb → fail closed
  for (const [key, val] of Object.entries(m as Record<string, unknown>)) {
    if (key === "dept") {
      if (typeof val !== "string" || !ci.departments.includes(val)) return false;
    } else if (key === "keyword") {
      if (typeof val !== "string" || !ci.intent_summary.toLowerCase().includes(val.toLowerCase()))
        return false;
    } else {
      return false; // unknown match key → fail closed
    }
  }
  return true;
}

export function route(ci: ClassifiedIntent, rules: RoutingRule[]): ResolvedRoute {
  for (const rule of rules) {
    if (rule.task_class !== ci.task_class) continue;
    if (!ruleMatches(ci, rule)) continue;
    return {
      model_tier: rule.model_tier,
      model: rule.model,
      mode: rule.mode,
      effort: rule.effort,
      needs_council: rule.needs_council,
    };
  }
  throw new NoRouteError(ci.task_class);
}
