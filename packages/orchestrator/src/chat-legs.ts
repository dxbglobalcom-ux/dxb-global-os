// Hamza's two legs — CEO directive 2026-07-25:
//
//   "2 ayak var: 1- para kazanma planları projeleri konusu konuşulması
//    2- gündelik rapor özetler şirket nasıl ilerliyor sohbeti."
//
// One conversation, two behaviours. The STRATEGY leg thinks with the CEO about
// money, plans and decisions. The BRIEF leg answers "how are we doing" — and it
// answers from MEASURED numbers, never from what the model remembers, because a
// status answer that is confidently wrong is worse than no status answer at all
// (RULE #0-A applied to Hamza himself).
//
// Both legs are L1. §4d is explicit: anything the CEO reads is Opus 5. The legs
// differ in effort and in what they are handed, not in quality.

import { sql, type Kysely } from "kysely";
import type { DB } from "@dxb/shared";

export type ChatLeg = "strategy" | "brief";

/**
 * Words that mean "tell me how it is going" in the CEO's actual writing — both
 * languages, because he switches mid-sentence. Deliberately narrow: this list
 * decides only whether to PULL DATA, and everything it fails to match falls to
 * the strategy leg.
 */
const BRIEF_MARKERS = [
  // Turkish
  "rapor", "özet", "ozet", "durum", "ne oldu", "neler oldu", "nasıl gidiyor",
  "nasil gidiyor", "ne durumda", "son durum", "bugün ne", "bugun ne", "dün ne",
  "dun ne", "gün sonu", "gun sonu", "kaç görev", "kac gorev", "bekleyen",
  "ne kadar harca", "maliyet ne",
  // English
  "report", "summary", "status", "how are we", "how is it going", "what happened",
  "update me", "daily brief", "how many tasks", "pending", "spend so far",
];

/**
 * Which leg answers this message.
 *
 * The safety rule the CEO set on 2026-07-25 is one-directional: **anything that
 * smells of money or planning goes UP, never down.** So `strategy` is the
 * default and `brief` is the narrow, explicitly-recognised case. Misrouting a
 * status question to the strategy leg costs a few tokens; misrouting a money
 * decision to the report leg costs a decision.
 */
export function classifyLeg(message: string): ChatLeg {
  const m = message.toLocaleLowerCase("tr");
  return BRIEF_MARKERS.some((k) => m.includes(k)) ? "brief" : "strategy";
}

/** Routing task_class per leg — the rows live in routing_rules, not here. */
export const LEG_TASK_CLASS: Record<ChatLeg, string> = {
  strategy: "chat.strategy",
  brief: "chat.brief",
};

export interface BriefSnapshot {
  /** Rendered lines, already in the CEO's language, ready to inject. */
  lines: string[];
  /** Raw values, for tests and for anything that wants to assert on them. */
  values: Record<string, number | string | null>;
}

/**
 * The measured state of the company, right now.
 *
 * Everything here is a live read. If a query fails the line is simply absent —
 * a brief with one missing figure is honest; a brief with an invented figure is
 * a governance violation.
 */
export async function buildBriefSnapshot(
  db: Kysely<DB>,
  lang: "tr" | "en",
): Promise<BriefSnapshot> {
  const values: Record<string, number | string | null> = {};
  const lines: string[] = [];
  const tr = lang === "tr";

  try {
    const o = await sql<{
      active_tasks: number; queued_tasks: number; running_tasks: number;
      tasks_awaiting_approval: number; failed_tasks_24h: number;
      pending_approvals: number; pending_high_risk: number;
      agents_active: number; projects_active: number;
      cost_today_eur: string | null; cost_month_eur: string | null;
      monthly_cap_eur: string | null; hard_stopped: boolean;
      last_activity_at: string | null;
    }>`SELECT * FROM v_exec_overview`.execute(db);
    const r = o.rows[0];
    if (r) {
      Object.assign(values, r);
      lines.push(
        tr
          ? `İş: ${r.active_tasks} aktif (${r.running_tasks} koşuyor, ${r.queued_tasks} kuyrukta), 24 saatte ${r.failed_tasks_24h} başarısız.`
          : `Work: ${r.active_tasks} active (${r.running_tasks} running, ${r.queued_tasks} queued), ${r.failed_tasks_24h} failed in 24h.`,
      );
      lines.push(
        tr
          ? `Onay bekleyen: ${r.pending_approvals} (${r.pending_high_risk} yüksek riskli).`
          : `Waiting on approval: ${r.pending_approvals} (${r.pending_high_risk} high risk).`,
      );
      lines.push(
        tr
          ? `Kadro: ${r.agents_active} aktif çalışan, ${r.projects_active} aktif proje.`
          : `Workforce: ${r.agents_active} active employees, ${r.projects_active} active projects.`,
      );
      lines.push(
        tr
          ? `Maliyet: bugün €${Number(r.cost_today_eur ?? 0).toFixed(2)}, bu ay €${Number(r.cost_month_eur ?? 0).toFixed(2)} / €${Number(r.monthly_cap_eur ?? 0).toFixed(0)} tavan${r.hard_stopped ? " — BÜTÇE DURDURULDU" : ""}.`
          : `Cost: €${Number(r.cost_today_eur ?? 0).toFixed(2)} today, €${Number(r.cost_month_eur ?? 0).toFixed(2)} of a €${Number(r.monthly_cap_eur ?? 0).toFixed(0)} monthly cap${r.hard_stopped ? " — BUDGET HARD-STOPPED" : ""}.`,
      );
    }
  } catch {
    // absent line, never an invented one
  }

  try {
    const rev = await sql<{ lifetime: string; opportunities: string }>`
      SELECT coalesce((SELECT sum(amount_eur) FROM revenue_ledger), 0)::text AS lifetime,
             (SELECT count(*) FROM opportunities)::text AS opportunities
    `.execute(db);
    const r = rev.rows[0];
    if (r) {
      values.revenue_lifetime_eur = Number(r.lifetime);
      values.opportunities = Number(r.opportunities);
      lines.push(
        tr
          ? `Gelir: ömür boyu €${Number(r.lifetime).toFixed(2)}, ${r.opportunities} fırsat satırı.`
          : `Revenue: €${Number(r.lifetime).toFixed(2)} lifetime, ${r.opportunities} opportunity rows.`,
      );
    }
  } catch {
    /* absent line */
  }

  try {
    const a = await sql<{ n: string }>`
      SELECT count(*)::text AS n FROM alerts WHERE resolved_at IS NULL
    `.execute(db);
    values.open_alerts = Number(a.rows[0]?.n ?? 0);
    lines.push(
      tr
        ? `Açık uyarı: ${a.rows[0]?.n ?? 0}.`
        : `Open alerts: ${a.rows[0]?.n ?? 0}.`,
    );
  } catch {
    /* absent line */
  }

  return { lines, values };
}

/**
 * The instruction each leg adds on top of Hamza's persona.
 *
 * The brief leg is told, in the strongest terms available, that the numbers it
 * was handed are the only numbers it may use. The empty-company case is spelled
 * out because it is the CURRENT state and the CEO has corrected it twice: no
 * revenue and no running work is the expected result of his own decision to
 * build the factory before starting the money leg. Reporting it as a failure is
 * the error, not the emptiness.
 */
export function legInstruction(leg: ChatLeg, snapshot: BriefSnapshot | null, lang: "tr" | "en"): string {
  if (leg === "strategy") {
    return [
      "This is the MONEY AND PLANNING leg of the conversation: opportunities, projects,",
      "budgets, priorities, decisions. Think WITH the CEO — take a position, name the",
      "trade-off, say what you would do and why. A decision he can act on beats a",
      "balanced survey he cannot.",
      "If a number matters to the decision and you do not have it measured, say you will",
      "measure it. Never estimate a company figure from memory.",
    ].join("\n");
  }
  const measured = snapshot?.lines.length
    ? snapshot.lines.map((l) => `- ${l}`).join("\n")
    : "(no figure could be measured right now — say exactly that)";
  return [
    "This is the DAILY REPORT leg: the CEO is asking how the company is doing.",
    "",
    "MEASURED STATE — these are live readings taken seconds ago. Use these numbers and",
    "ONLY these numbers. Do not add a figure that is not in this list, do not round one",
    "into a nicer story, and if something he asked about is missing, say it is not",
    "measured rather than filling the gap:",
    measured,
    "",
    lang === "tr"
      ? "Boş tablolar KUSUR DEĞİLDİR: CEO para ayağını bilerek henüz başlatmadı, önce fabrika kuruluyor. Sıfır geliri veya sıfır koşan işi bir başarısızlık gibi sunmak yanlıştır."
      : "Empty tables are NOT a defect: the CEO deliberately has not started the money leg yet — the factory is being built first. Presenting zero revenue or zero running work as a failure is wrong.",
    "Lead with what changed, then what needs him. Short. No dashboards in prose.",
  ].join("\n");
}
