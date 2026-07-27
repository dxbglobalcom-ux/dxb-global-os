// W2.6 — THE PROACTIVE MORNING BRIEFING: Hamza opens the conversation.
//
// Measured before this module existed (2026-07-27): the scheduler carried 14
// jobs and none of them wrote to `chat_messages`. Every row on the CEO's board
// since 2026-07-19 answered something he had typed first — the holding had
// never once spoken to its CEO unprompted. The operating manual promised him a
// 07:00 briefing and delivered a page that is "ready" at every hour of the day.
//
// Three rules shape everything below, and none of them is a style choice:
//
//   1. THE CONTENT COMES FROM ONE VIEW AND NO MODEL WRITES IT.
//      Phase 9 LOCKED this ("brifing tek SQL görünümden; ajan brifing yazmaz").
//      `v_ceo_briefing` measures; `renderBriefing` only formats. Consequences,
//      all deliberate: zero tokens, zero hallucination, and a dead subscription
//      lane cannot silence the one message the CEO is promised every day.
//
//   2. BOTH LANGUAGE LEGS ARE WRITTEN, because a system-authored message on the
//      CEO's board is an i18n surface (U26). The English board never borrows
//      the Turkish leg and vice versa.
//
//   3. EMPTINESS IS A FACT, NOT A FAILURE. Zero revenue, zero opportunities and
//      zero running work are the EXPECTED state while the factory is being
//      built (factory roadmap §0.1 — the CEO has corrected this framing twice).
//      The one interpretive line allowed here disappears by itself the day he
//      opens the money leg.
//
// Spec: VOICE_INTERACTION_SPEC §24quinquies.
import { sql, type Kysely } from "kysely";
import type { DB } from "@dxb/shared";
import { headline } from "./intent-intake.js";

/** One task line the night produced, in both legs (U29 headline law). */
export interface BriefingHeadline {
  label: string | null;
  label_tr: string | null;
  /** Owning department, localised — carried on the FAILED list only. */
  dept?: string | null;
  dept_tr?: string | null;
}

/** Exactly what `v_ceo_briefing` measures — the renderer may use nothing else. */
export interface BriefingFacts {
  /** The CEO's own day (Europe/Berlin), not the server's UTC one. */
  briefing_date: string;
  window_start: string;
  done_count: number;
  failed_count: number;
  done_headlines: BriefingHeadline[];
  /** What BROKE overnight, by name: a count alone sends the CEO hunting. */
  failed_headlines: BriefingHeadline[];
  /** W2.5 work the holding opened with nobody watching. */
  machine_opened: number;
  running_tasks: number;
  queued_tasks: number;
  pending_approvals: number;
  pending_high_risk: number;
  open_alerts: number;
  open_alerts_critical: number;
  cost_24h_eur: number;
  cost_month_eur: number;
  monthly_cap_eur: number;
  hard_stopped: boolean;
  revenue_lifetime_eur: number;
  opportunities_total: number;
  opportunities_capital_blocked: number;
  capital_limit_eur: number;
  /** True once the CEO has an active objective — i.e. the money leg is open. */
  active_objective_open: boolean;
}

export interface RenderedBriefing {
  /** Thread name on the board. */
  title: string;
  /** The message itself. */
  body: string;
}

export interface BriefingDelivery {
  delivered: boolean;
  /** DISABLED · DAILY_CAP · ALREADY_DELIVERED · NO_FACTS — never a silent skip. */
  reason?: string;
  sessionId?: string;
  messageId?: string;
}

// Month names are carried here rather than taken from Intl: a briefing must
// render identically on the laptop, the VPS and in a test, and ICU data is an
// environment property. Twelve strings are cheaper than that risk.
const MONTHS_TR = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];
const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** €1250.00 — the same two-decimal money shape the board uses. */
const eur = (n: number): string => `€${Number(n ?? 0).toFixed(2)}`;
/** A monthly cap is a round number; cents on a ceiling are noise. */
const cap = (n: number): string => `€${Math.round(Number(n ?? 0))}`;

function briefingDay(date: string): { day: number; monthIndex: number } {
  const [y, m, d] = date.split("-").map((p) => Number(p));
  void y;
  return { day: d ?? 1, monthIndex: (m ?? 1) - 1 };
}

/**
 * The night's finished work, as lines the CEO can read.
 *
 * Never a mid-word cut and never an ellipsis (CEO ruling 2026-07-18: shorten at
 * the source) — `headline()` cuts at a word boundary or drops the tail whole.
 * A task with no readable label contributes nothing rather than a blank bullet.
 */
function headlines(
  rows: BriefingHeadline[],
  lang: "tr" | "en",
  withDept = false,
): string[] {
  return rows
    .map((r) => {
      const text = lang === "tr" ? (r.label_tr ?? r.label) : r.label;
      const short = text ? headline(text) : null;
      if (!short) return null;
      const dept = withDept ? (lang === "tr" ? (r.dept_tr ?? r.dept) : r.dept) : null;
      return dept ? `${short} (${dept})` : short;
    })
    .filter((t): t is string => Boolean(t));
}

/**
 * The briefing, in the CEO's language.
 *
 * PURE — same facts in, same words out. Every number printed comes from the
 * facts it was handed; a line whose figure would say nothing (nobody waiting,
 * nothing self-opened) is omitted rather than printed as a zero, because an
 * information-free field on a CEO surface is a defect (ruling 2026-07-18).
 */
export function renderBriefing(f: BriefingFacts, lang: "tr" | "en"): RenderedBriefing {
  const tr = lang === "tr";
  const { day, monthIndex } = briefingDay(f.briefing_date);
  const title = tr
    ? `${day} ${MONTHS_TR[monthIndex] ?? ""} sabah brifingi`
    : `Morning briefing — ${day} ${MONTHS_EN[monthIndex] ?? ""}`;

  const lines: string[] = [];

  // ── the night ──────────────────────────────────────────────────────────
  if (f.done_count === 0 && f.failed_count === 0) {
    lines.push(
      tr
        ? "• Gece sessiz geçti — biten ya da başarısız olan iş yok."
        : "• A quiet night — nothing finished and nothing failed.",
    );
  } else if (tr) {
    const done = f.done_count > 0 ? `${f.done_count} iş bitti` : "biten iş yok";
    const failed = f.failed_count > 0 ? `, ${f.failed_count} iş başarısız oldu` : "";
    lines.push(`• Gece: ${done}${failed}.`);
  } else {
    const done = f.done_count > 0 ? `${f.done_count} finished` : "nothing finished";
    const failed = f.failed_count > 0 ? `, ${f.failed_count} failed` : "";
    lines.push(`• Overnight: ${done}${failed}.`);
  }

  const heads = headlines(f.done_headlines ?? [], lang);
  if (heads.length > 0) {
    lines.push(tr ? `• Biten işler: ${heads.join(" · ")}` : `• Finished: ${heads.join(" · ")}`);
  }

  // A failure count with no name is a scavenger hunt through /ops/tasks.
  const broke = headlines(f.failed_headlines ?? [], lang, true);
  if (broke.length > 0) {
    lines.push(tr ? `• Başarısız olan: ${broke.join(" · ")}` : `• Failed: ${broke.join(" · ")}`);
  }

  // The self-opened work is the factory's own heartbeat — but "0 opened" is an
  // information-free line, so it only appears when it happened.
  if (f.machine_opened > 0) {
    lines.push(
      tr
        ? `• Holding gece boyunca ${f.machine_opened} işi kendi başlattı.`
        : `• The holding opened ${f.machine_opened} tasks by itself overnight.`,
    );
  }

  // ── right now ──────────────────────────────────────────────────────────
  if (f.running_tasks === 0 && f.queued_tasks === 0) {
    lines.push(
      tr
        ? "• Şu an koşan ya da kuyrukta bekleyen iş yok."
        : "• Nothing running and nothing queued right now.",
    );
  } else {
    lines.push(
      tr
        ? `• Şu an: ${f.running_tasks} iş koşuyor, ${f.queued_tasks} iş kuyrukta.`
        : `• Right now: ${f.running_tasks} running, ${f.queued_tasks} queued.`,
    );
  }

  // ── what needs him ─────────────────────────────────────────────────────
  if (f.pending_approvals === 0 && f.open_alerts === 0) {
    lines.push(tr ? "• Sizi bekleyen bir şey yok." : "• Nothing is waiting on you.");
  } else {
    const parts: string[] = [];
    if (f.pending_approvals > 0) {
      const risk =
        f.pending_high_risk > 0
          ? tr
            ? ` (${f.pending_high_risk} yüksek riskli)`
            : ` (${f.pending_high_risk} high risk)`
          : "";
      parts.push(tr ? `${f.pending_approvals} onay${risk}` : `${f.pending_approvals} approvals${risk}`);
    }
    if (f.open_alerts > 0) {
      // "3 alerts" and "3 alerts, one of them critical" are different mornings.
      const crit =
        f.open_alerts_critical > 0
          ? tr
            ? ` (${f.open_alerts_critical} kritik)`
            : ` (${f.open_alerts_critical} critical)`
          : "";
      parts.push(tr ? `${f.open_alerts} açık uyarı${crit}` : `${f.open_alerts} open alerts${crit}`);
    }
    lines.push(tr ? `• Sizi bekleyen: ${parts.join(", ")}.` : `• Waiting on you: ${parts.join(", ")}.`);
  }

  // ── money ──────────────────────────────────────────────────────────────
  const stopped = f.hard_stopped ? (tr ? " Bütçe durduruldu." : " Budget hard-stopped.") : "";
  lines.push(
    tr
      ? `• Para: son 24 saatte ${eur(f.cost_24h_eur)}, bu ay ${eur(f.cost_month_eur)} / ${cap(f.monthly_cap_eur)} tavan.${stopped}`
      : `• Money: ${eur(f.cost_24h_eur)} in the last 24 hours, ${eur(f.cost_month_eur)} of a ${cap(f.monthly_cap_eur)} monthly cap.${stopped}`,
  );

  // ── the revenue line ───────────────────────────────────────────────────
  const blocked =
    f.opportunities_capital_blocked > 0
      ? tr
        ? ` ${f.opportunities_capital_blocked} aday sermaye tavanını (${eur(f.capital_limit_eur)}) bekliyor — tavanı yükseltmek sizin kararınız.`
        : ` ${f.opportunities_capital_blocked} candidate(s) waiting on the ${eur(f.capital_limit_eur)} capital ceiling — raising it is your decision.`
      : "";
  lines.push(
    tr
      ? `• Gelir hattı: ömür boyu ${eur(f.revenue_lifetime_eur)}, ${f.opportunities_total} fırsat kaydı.${blocked}`
      : `• Revenue line: ${eur(f.revenue_lifetime_eur)} lifetime, ${f.opportunities_total} opportunity rows.${blocked}`,
  );

  // ── the one interpretive line, and the rule that removes it ────────────
  const factoryStage = !f.active_objective_open && Number(f.revenue_lifetime_eur) === 0;

  const opening = tr
    ? "Günaydın Muhittin Bey. Dün akşam 19:00'dan bu sabaha holdingde olanlar:"
    : "Good morning. Here is what happened across the holding since 19:00 last night:";
  const closing = tr
    ? "Sormak istediğiniz bir şey olursa buraya yazın, buradayım."
    : "If you want to go into any of it, write here.";
  const factory = factoryStage
    ? tr
      ? "Para ayağı henüz açılmadı — bu sizin kararınız, bir kusur değil; önce fabrika kuruluyor."
      : "The money leg is not open yet — that is your decision, not a fault; the factory is being built first."
    : null;

  const body = [opening, "", ...lines, "", ...(factory ? [factory, ""] : []), closing].join("\n");
  return { title, body };
}

/** The measured state of the holding this morning — one row, one view. */
export async function readBriefingFacts(db: Kysely<DB>): Promise<BriefingFacts | null> {
  const r = await sql<Record<string, unknown>>`SELECT * FROM v_ceo_briefing`.execute(db);
  const row = r.rows[0];
  if (!row) return null;
  const num = (k: string): number => Number(row[k] ?? 0);
  return {
    // The view hands this over as TEXT already in the CEO's timezone. It is
    // never re-derived from a Date here: a `date` column arrives as local
    // midnight and `toISOString()` on it silently rolls the calendar back a day
    // — measured live on the first run, which filed a "26 Temmuz" briefing at
    // 01:30 on the 27th.
    briefing_date: String(row.briefing_date ?? ""),
    window_start: String(row.window_start ?? ""),
    done_count: num("done_count"),
    failed_count: num("failed_count"),
    done_headlines: (row.done_headlines as BriefingHeadline[]) ?? [],
    failed_headlines: (row.failed_headlines as BriefingHeadline[]) ?? [],
    machine_opened: num("machine_opened"),
    running_tasks: num("running_tasks"),
    queued_tasks: num("queued_tasks"),
    pending_approvals: num("pending_approvals"),
    pending_high_risk: num("pending_high_risk"),
    open_alerts: num("open_alerts"),
    open_alerts_critical: num("open_alerts_critical"),
    cost_24h_eur: num("cost_24h_eur"),
    cost_month_eur: num("cost_month_eur"),
    monthly_cap_eur: num("monthly_cap_eur"),
    hard_stopped: Boolean(row.hard_stopped),
    revenue_lifetime_eur: num("revenue_lifetime_eur"),
    opportunities_total: num("opportunities_total"),
    opportunities_capital_blocked: num("opportunities_capital_blocked"),
    capital_limit_eur: num("capital_limit_eur"),
    active_objective_open: Boolean(row.active_objective_open),
  };
}

/**
 * Deliver this morning's briefing as a conversation Hamza opens.
 *
 * The door owns every rule that could refuse it (the CEO's switch, his daily
 * ceiling, exactly-once); this function measures, renders both legs and knocks.
 * `db` is injectable so a test can run the whole path inside a rolled-back
 * transaction — the W1.6 lesson: a helper that reaches for its own connection
 * writes to the live database no matter what the test wrapped around it.
 */
export async function deliverMorningBriefing(
  db: Kysely<DB>,
  opts: { date?: string; slot?: string } = {},
): Promise<BriefingDelivery> {
  const facts = await readBriefingFacts(db);
  if (!facts) return { delivered: false, reason: "NO_FACTS" };
  const day = opts.date ?? facts.briefing_date;
  const dated = { ...facts, briefing_date: day };
  const en = renderBriefing(dated, "en");
  const tr = renderBriefing(dated, "tr");
  const slot = opts.slot ?? "morning";

  const r = await sql<{ out: { ok: boolean; reason?: string; session_id?: string; message_id?: string } }>`
    SELECT control_ceo_briefing_post(
      ${slot}, ${day}::date, ${en.title}, ${tr.title}, ${en.body}, ${tr.body}
    ) AS out
  `.execute(db);
  const out = r.rows[0]?.out;
  if (!out?.ok) return { delivered: false, reason: out?.reason ?? "REFUSED" };
  return { delivered: true, sessionId: out.session_id, messageId: out.message_id };
}
