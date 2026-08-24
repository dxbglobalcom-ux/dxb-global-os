import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import type { Kysely } from "kysely";
import { closeDb, getDb, type DB } from "../../packages/shared/src/db.js";
import {
  deliverMorningBriefing,
  readBriefingFacts,
  renderBriefing,
  type BriefingFacts,
} from "../../packages/orchestrator/src/morning-briefing.js";

// W2.6 — THE PROACTIVE MORNING BRIEFING (factory roadmap row 2.6).
//
// Measured before a line was written (2026-07-27): the scheduler carried 14
// jobs and none of them wrote to `chat_messages`, so every row on the CEO's
// board since 2026-07-19 was an answer to something HE typed first. Hamza had
// never opened a conversation.
//
// What these cases hold:
//   · the words the CEO reads carry ONLY measured figures, in his language,
//     with an empty company stated as a fact and never as a failure;
//   · his switch and his ceiling actually refuse, and a refusal is audited so
//     "switched off" and "broken" never look the same;
//   · the same morning cannot be delivered twice, structurally;
//   · the thread Hamza opens contains no CEO message — that is the whole point
//     of the row.

const ROLLBACK = new Error("rollback-sentinel");
// The door reads COMMITTED rows, so a real briefing delivered today would make
// every case here answer ALREADY_DELIVERED — a suite that passes only before
// the feature runs in production is not a gate. These cases therefore book a
// day the company will never live through (live-DB tests are state-independent
// — the R4.2 lesson, paid for again here).
const DAY = "2099-07-27";
const inTrx = async (fn: (trx: Kysely<DB>) => Promise<void>) =>
  getDb()
    .transaction()
    .execute(async (trx) => {
      await fn(trx as unknown as Kysely<DB>);
      throw ROLLBACK;
    })
    .catch((e) => {
      if (e !== ROLLBACK) throw e;
    });

afterAll(async () => {
  await closeDb();
});

/** A company that had a night: the renderer's fixture, never a live read. */
function facts(over: Partial<BriefingFacts> = {}): BriefingFacts {
  return {
    briefing_date: "2026-07-27",
    window_start: "2026-07-26T17:00:00.000Z",
    done_count: 3,
    failed_count: 1,
    done_headlines: [
      { label: "Pilot plan for the consultancy feed", label_tr: "Danışmanlık akışı için pilot plan" },
      { label: "Compliance dossier", label_tr: "Uygunluk dosyası" },
    ],
    failed_headlines: [
      {
        label: "Halal compliance dossier",
        label_tr: "Helal uygunluk dosyası",
        dept: "Risk, Internal Audit & Assurance",
        dept_tr: "Risk, İç Denetim ve Güvence",
      },
    ],
    machine_opened: 2,
    running_tasks: 1,
    queued_tasks: 0,
    pending_approvals: 2,
    pending_high_risk: 1,
    open_alerts: 3,
    open_alerts_critical: 1,
    cost_24h_eur: 0.12,
    cost_month_eur: 3.4,
    monthly_cap_eur: 150,
    hard_stopped: false,
    revenue_lifetime_eur: 0,
    opportunities_total: 5,
    opportunities_capital_blocked: 1,
    capital_limit_eur: 0,
    active_objective_open: false,
    ...over,
  };
}

describe("renderBriefing — the words the CEO reads", () => {
  it("Turkish: the CEO's date, his figures, and nothing he was not handed", () => {
    const b = renderBriefing(facts(), "tr");
    expect(b.title).toBe("27 Temmuz sabah brifingi");
    expect(b.body).toContain("Günaydın Muhittin Bey");
    expect(b.body).toContain("3 iş bitti");
    expect(b.body).toContain("1 iş başarısız");
    expect(b.body).toContain("Danışmanlık akışı için pilot plan");
    expect(b.body).toContain("2 işi kendi başlattı");
    expect(b.body).toContain("1 iş koşuyor");
    expect(b.body).toContain("2 onay");
    expect(b.body).toContain("3 açık uyarı (1 kritik)");
    // What broke is named, not counted (a count sends him hunting in /ops/tasks)
    // …and it says whose desk it was on: two tasks can share a headline (a
    // reworded retry beside the attempt it replaced), and the same name under
    // "finished" and "failed" reads like a contradiction without the owner.
    expect(b.body).toContain("Helal uygunluk dosyası (Risk, İç Denetim ve Güvence)");
    expect(b.body).toContain("€0.12");
    expect(b.body).toContain("€3.40");
    expect(b.body).toContain("€150");
    expect(b.body).toContain("5 fırsat");
    // Every number in the text must be one the facts carried — a figure with no
    // source is the exact defect this leg exists to prevent (RULE #0-A).
    const invented = ["€7", "42 ", "%"];
    for (const s of invented) expect(b.body).not.toContain(s);
  });

  it("English mirrors it, and never borrows the Turkish leg", () => {
    const b = renderBriefing(facts(), "en");
    expect(b.title).toBe("Morning briefing — 27 July");
    expect(b.body).toContain("Good morning");
    expect(b.body).toContain("3 finished");
    expect(b.body).toContain("Pilot plan for the consultancy feed");
    expect(b.body).not.toContain("Danışmanlık");
    expect(b.body).toContain("Halal compliance dossier (Risk, Internal Audit & Assurance)");
    expect(b.body).not.toMatch(/[çğıöşüİĞŞ]/);
  });

  it("a quiet night is a fact, not a failure — and it says so in both languages", () => {
    const quiet = facts({
      done_count: 0,
      failed_count: 0,
      done_headlines: [],
      machine_opened: 0,
      running_tasks: 0,
      queued_tasks: 0,
      pending_approvals: 0,
      pending_high_risk: 0,
      open_alerts: 0,
      open_alerts_critical: 0,
      failed_headlines: [],
    });
    const tr = renderBriefing(quiet, "tr").body;
    expect(tr).toContain("Gece sessiz geçti");
    expect(tr).toContain("Sizi bekleyen bir şey yok");
    // An information-free line is a defect on a CEO surface (ruling 2026-07-18):
    // "the holding opened 0 tasks by itself" says nothing.
    expect(tr).not.toContain("0 işi kendi başlattı");
    expect(renderBriefing(quiet, "en").body).toContain("A quiet night");
  });

  it("zero revenue is the CEO's own decision, and the line disappears when he opens the money leg", () => {
    const closed = renderBriefing(facts(), "tr").body;
    expect(closed).toContain("Para ayağı henüz açılmadı");
    expect(closed).toContain("kusur değil");

    const opened = renderBriefing(facts({ active_objective_open: true }), "tr").body;
    expect(opened).not.toContain("Para ayağı henüz açılmadı");
  });

  it("headlines are never cut mid-word and never carry an ellipsis", () => {
    const long = "a".repeat(60) + " " + "b".repeat(80);
    const b = renderBriefing(
      facts({ done_headlines: [{ label: long, label_tr: long }] }),
      "tr",
    ).body;
    expect(b).not.toContain("…");
    expect(b).not.toContain("...");
    expect(b).toContain("a".repeat(60));
    expect(b).not.toContain("b".repeat(80)); // dropped whole, never sliced mid-word
  });

  it("the capital ceiling is named only when a candidate is actually waiting on it", () => {
    const waiting = renderBriefing(facts({ opportunities_capital_blocked: 1 }), "tr").body;
    expect(waiting).toContain("sermaye tavanı");
    expect(waiting).toContain("sizin kararınız");
    const clear = renderBriefing(facts({ opportunities_capital_blocked: 0 }), "tr").body;
    expect(clear).not.toContain("sermaye tavanı");
  });

  it("a hard-stopped budget is stated, not hidden", () => {
    expect(renderBriefing(facts({ hard_stopped: true }), "tr").body).toContain("Bütçe durduruldu");
    expect(renderBriefing(facts({ hard_stopped: true }), "en").body).toContain("Budget hard-stopped");
  });
});

describe("the door — control_ceo_briefing_post", () => {
  it("delivers one thread, one Hamza message, one ledger row and one audit row — both legs", async () => {
    await inTrx(async (trx) => {
      const r = await sql<{ out: { ok: boolean; session_id: string; message_id: string } }>`
        SELECT control_ceo_briefing_post(
          'morning', DATE '2099-07-27',
          'Morning briefing — 27 July', '27 Temmuz sabah brifingi',
          'Good morning. Quiet night.', 'Günaydın Muhittin Bey. Gece sessiz geçti.'
        ) AS out
      `.execute(trx);
      const out = r.rows[0]!.out;
      expect(out.ok).toBe(true);

      const msg = await sql<{
        role: string; source: string; status: string; content: string;
        content_tr: string; session_id: string;
      }>`SELECT role, source, status, content, content_tr, session_id
           FROM chat_messages WHERE id = ${out.message_id}::uuid`.execute(trx);
      expect(msg.rows[0]!.role).toBe("hamza");
      expect(msg.rows[0]!.source).toBe("briefing");
      expect(msg.rows[0]!.status).toBe("answered");
      expect(msg.rows[0]!.content_tr).toContain("Günaydın");
      expect(msg.rows[0]!.session_id).toBe(out.session_id);

      const thread = await sql<{ title: string; title_tr: string }>`
        SELECT title, title_tr FROM chat_sessions WHERE id = ${out.session_id}::uuid
      `.execute(trx);
      expect(thread.rows[0]!.title_tr).toBe("27 Temmuz sabah brifingi");

      const view = await sql<{ title: string; title_tr: string }>`
        SELECT title, title_tr FROM v_chat_threads WHERE id = ${out.session_id}::uuid
      `.execute(trx);
      expect(view.rows[0]!.title_tr).toBe("27 Temmuz sabah brifingi");

      const ledger = await sql<{ n: string }>`
        SELECT count(*)::text AS n FROM ceo_briefings
         WHERE briefing_date = DATE '2099-07-27' AND slot = 'morning'
      `.execute(trx);
      expect(Number(ledger.rows[0]!.n)).toBe(1);

      const audit = await sql<{ n: string }>`
        SELECT count(*)::text AS n FROM audit_log
         WHERE action = 'chat.briefing.delivered'
           AND payload->>'session_id' = ${out.session_id}
      `.execute(trx);
      expect(Number(audit.rows[0]!.n)).toBe(1);
    });
  });

  it("the same morning cannot be delivered twice", async () => {
    await inTrx(async (trx) => {
      await sql`SELECT control_ceo_briefing_post('morning', DATE '2099-07-27', 'a', 'a', 'body', 'gövde')`.execute(trx);
      const r = await sql<{ out: { ok: boolean; reason: string } }>`
        SELECT control_ceo_briefing_post('morning', DATE '2099-07-27', 'b', 'b', 'body2', 'gövde2') AS out
      `.execute(trx);
      expect(r.rows[0]!.out.ok).toBe(false);
      expect(r.rows[0]!.out.reason).toBe("ALREADY_DELIVERED");

      const n = await sql<{ n: string }>`
        SELECT count(*)::text AS n FROM chat_messages WHERE source = 'briefing' AND content = 'body2'
      `.execute(trx);
      expect(Number(n.rows[0]!.n)).toBe(0);
    });
  });

  it("the CEO's switch refuses the briefing — and the refusal is audited, so off never looks like broken", async () => {
    await inTrx(async (trx) => {
      await sql`
        INSERT INTO settings_values (key, scope, value, updated_by)
        VALUES ('briefing.proactive.enabled', 'global', 'false'::jsonb, 'test')
        ON CONFLICT (key, scope) DO UPDATE SET value = EXCLUDED.value
      `.execute(trx);
      const r = await sql<{ out: { ok: boolean; reason: string } }>`
        SELECT control_ceo_briefing_post('morning', DATE '2099-07-27', 'a', 'a', 'body', 'gövde') AS out
      `.execute(trx);
      expect(r.rows[0]!.out.ok).toBe(false);
      expect(r.rows[0]!.out.reason).toBe("DISABLED");

      const msgs = await sql<{ n: string }>`
        SELECT count(*)::text AS n FROM chat_messages WHERE source = 'briefing' AND content = 'body'
      `.execute(trx);
      expect(Number(msgs.rows[0]!.n)).toBe(0);

      const audit = await sql<{ n: string }>`
        SELECT count(*)::text AS n FROM audit_log
         WHERE action = 'chat.briefing.refused' AND payload->>'reason' = 'DISABLED'
      `.execute(trx);
      expect(Number(audit.rows[0]!.n)).toBe(1);
    });
  });

  it("the daily ceiling refuses beyond what the CEO allowed", async () => {
    await inTrx(async (trx) => {
      await sql`
        INSERT INTO settings_values (key, scope, value, updated_by)
        VALUES ('briefing.proactive.max_per_day', 'global', '0'::jsonb, 'test')
        ON CONFLICT (key, scope) DO UPDATE SET value = EXCLUDED.value
      `.execute(trx);
      const r = await sql<{ out: { ok: boolean; reason: string } }>`
        SELECT control_ceo_briefing_post('morning', DATE '2099-07-27', 'a', 'a', 'body', 'gövde') AS out
      `.execute(trx);
      expect(r.rows[0]!.out.ok).toBe(false);
      expect(r.rows[0]!.out.reason).toBe("DAILY_CAP");
    });
  });

  it("an empty briefing is not a briefing", async () => {
    await inTrx(async (trx) => {
      await expect(
        sql`SELECT control_ceo_briefing_post('morning', DATE '2099-07-27', 'a', 'a', '  ', '  ')`.execute(trx),
      ).rejects.toThrow();
    });
  });
});

describe("the delivery seam", () => {
  it("the view answers with the shape the renderer was promised", async () => {
    const f = await readBriefingFacts(getDb());
    expect(f).not.toBeNull();
    expect(typeof f!.done_count).toBe("number");
    expect(typeof f!.monthly_cap_eur).toBe("number");
    expect(typeof f!.briefing_date).toBe("string");
    expect(Array.isArray(f!.done_headlines)).toBe(true);
    expect(Array.isArray(f!.failed_headlines)).toBe(true);
    expect(typeof f!.open_alerts_critical).toBe("number");
  });

  it("the briefing is dated in the CEO's timezone, not the server's", async () => {
    // FOUND LIVE, 2026-07-27 01:30 Europe/Berlin (= 23:30 UTC the previous
    // day): the first real delivery filed itself as "26 Temmuz". A `date`
    // column crosses the driver as a JS Date at LOCAL midnight, and
    // toISOString() on it rolls the calendar back a day for every hour of the
    // CEO's morning that is still yesterday in UTC. The view now hands the day
    // over as text; this case is the wall that keeps it there.
    const f = await readBriefingFacts(getDb());
    const db = await sql<{ day: string }>`
      SELECT to_char((now() AT TIME ZONE 'Europe/Berlin')::date, 'YYYY-MM-DD') AS day
    `.execute(getDb());
    expect(f!.briefing_date).toBe(db.rows[0]!.day);
    expect(f!.briefing_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("Hamza opens the conversation: the thread lands with NO CEO message in it", async () => {
    await inTrx(async (trx) => {
      const out = await deliverMorningBriefing(trx, { date: DAY });
      expect(out.delivered).toBe(true);

      const rows = await sql<{ role: string; source: string }>`
        SELECT role, source FROM chat_messages WHERE session_id = ${out.sessionId}::uuid
      `.execute(trx);
      expect(rows.rows).toHaveLength(1);
      expect(rows.rows[0]!.role).toBe("hamza");
      expect(rows.rows[0]!.source).toBe("briefing");

      // The board opens the newest thread when the CEO walks up to it
      // (chat/page.tsx: activeSessionId = params.s ?? sessions[0]?.id).
      const newest = await sql<{ id: string }>`
        SELECT id FROM v_chat_threads ORDER BY last_message_at DESC LIMIT 1
      `.execute(trx);
      expect(newest.rows[0]!.id).toBe(out.sessionId);
    });
  });

  it("a second delivery in the same day is refused by the ledger, not by luck", async () => {
    await inTrx(async (trx) => {
      const first = await deliverMorningBriefing(trx, { date: DAY });
      expect(first.delivered).toBe(true);
      const second = await deliverMorningBriefing(trx, { date: DAY });
      expect(second.delivered).toBe(false);
      expect(second.reason).toBe("ALREADY_DELIVERED");
    });
  });
});

describe("live invariants — whatever this database already holds", () => {
  it("every delivered briefing carries both language legs", async () => {
    const msgs = await sql<{ n: string }>`
      SELECT count(*)::text AS n FROM chat_messages
       WHERE source = 'briefing' AND (content_tr IS NULL OR btrim(content_tr) = '')
    `.execute(getDb());
    expect(Number(msgs.rows[0]!.n)).toBe(0);

    const threads = await sql<{ n: string }>`
      SELECT count(*)::text AS n FROM chat_sessions s
       WHERE EXISTS (SELECT 1 FROM chat_messages m WHERE m.session_id = s.id AND m.source = 'briefing')
         AND (s.title IS NULL OR s.title_tr IS NULL)
    `.execute(getDb());
    expect(Number(threads.rows[0]!.n)).toBe(0);
  });
});
