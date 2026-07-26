import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import {
  commissionScoutingRun,
  harvestScoutingRuns,
  parseCandidates,
} from "../../packages/revenue/src/discovery.js";

// W2.2 — the discovery engine.
//
// Measured before: `opportunities` was empty, `revenue.scan` only re-read rows
// that already existed, and the research tools installed for exactly this job
// had never been called once (tool_calls: 240 dxb-mcp, 2 git, 1 context7, ZERO
// scrapling). The spec had the answer since R1 (§5: scan jobs enqueue research
// tasks for departments, on the same seam that upgrades when the worker gets
// real tools); nothing was ever wired to it.
//
// These cases prove the seam. The live proof — a real scrapling fetch behind a
// real opportunity row — is recorded in the roadmap row, because it costs a
// model run and cannot be asserted from a test transaction.
process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const ROLLBACK = new Error("rollback-sentinel");
const inTrx = async (fn: (trx: never) => Promise<void>) =>
  getDb()
    .transaction()
    .execute(async (trx) => {
      await fn(trx as never);
      throw ROLLBACK;
    })
    .catch((e) => {
      if (e !== ROLLBACK) throw e;
    });

afterAll(async () => {
  await closeDb();
});

// State-INDEPENDENT setup (R4.2 lesson, re-learned live today): the real
// database may already hold an open scouting run or a pipeline of its own, and a
// test that assumes an empty world asserts about the machine's mood rather than
// its behaviour. Inside the rolled-back transaction we neutralise whatever is
// there, then build the world each case needs.
const emptyWorld = async (trx: never) => {
  await sql`UPDATE revenue_scout_runs SET harvested_at = now() WHERE harvested_at IS NULL`.execute(
    trx,
  );
  await sql`UPDATE opportunities SET state = 'retired' WHERE state <> 'retired'`.execute(trx);
};

describe("what the scout is asked for", () => {
  it("commissions ONE staffed research task in the strategy department", async () => {
    await inTrx(async (trx) => {
      await emptyWorld(trx as never);
      const res = await commissionScoutingRun(trx as never);
      expect(res.commissioned).toBe(true);
      const task = await sql<{
        department: string;
        model_tier: string;
        approval_class: string;
        status: string;
        agent_id: string | null;
        project_id: string | null;
        objective: string;
        output_contract: string;
      }>`SELECT department, model_tier, approval_class, status, agent_id, project_id, objective, output_contract
           FROM tasks WHERE id = ${res.taskId}`.execute(trx as never);
      const t = task.rows[0];
      expect(t.department).toBe("strategy");
      // The pre-task hook refuses a task with no project (holding-goal rule);
      // the first live run was blocked by the ladder for exactly this.
      expect(t.project_id).not.toBeNull();
      // Staffed on purpose: an agent-less task runs tool-LESS by default-deny,
      // and a research run with no tools is exactly the thing being fixed.
      expect(t.agent_id).not.toBeNull();
      expect(t.status).toBe("queued");
      // Nothing here faces outward — the scout reads public pages and writes a list.
      expect(t.approval_class).toBe("none");
      // The Islamic boundaries and the zero-capital rule are IN the brief, not
      // applied to its output afterwards.
      expect(t.objective.toLowerCase()).toContain("capital");
      // The contracted deliverable shape (line blocks, not nested json — the
      // ambiguity that cost four live runs).
      expect(t.output_contract).toContain("CANDIDATE");
      expect(t.output_contract).toContain("evidence:");
      // The knowledge-shelf gate demands a report artifact; the ref is stamped
      // in once the row exists, so the placeholder must be gone.
      expect(t.output_contract).not.toContain("REPORT_REF");
      // std.knowledge_shelf matches the CONTRACT text: a brief that avoids the
      // word slips past the gate silently (measured 2026-07-26). The scan is
      // research and must say so.
      expect(t.output_contract).toMatch(/\bRESEARCH\b/i);
      expect(t.output_contract).toContain(`dxb://scout-run/${res.taskId}`);
    });
  });

  it("does not commission a second run while one is still open", async () => {
    await inTrx(async (trx) => {
      await emptyWorld(trx as never);
      const first = await commissionScoutingRun(trx as never);
      expect(first.commissioned).toBe(true);
      const second = await commissionScoutingRun(trx as never);
      expect(second.commissioned).toBe(false);
      expect(second.reason).toBe("run_open");
    });
  });

  it("does not commission when the pipeline already has enough to decide on", async () => {
    await inTrx(async (trx) => {
      await emptyWorld(trx as never);
      await sql`
        INSERT INTO opportunities (title, engine_slug, region, channel, state, created_by)
        SELECT 'fixture candidate ' || g, 'consultancy', 'EU', 'direct', 'discovered', 'test'
          FROM generate_series(1, 9) g
      `.execute(trx as never);
      const res = await commissionScoutingRun(trx as never);
      expect(res.commissioned).toBe(false);
      expect(res.reason).toBe("pipeline_full");
    });
  });

  it("obeys its off switch", async () => {
    await inTrx(async (trx) => {
      await sql`
        INSERT INTO settings_values (key, scope, value, updated_by)
        VALUES ('revenue.discovery.enabled', 'global', 'false'::jsonb, 'test')
        ON CONFLICT (key, scope) DO UPDATE SET value = 'false'::jsonb
      `.execute(trx as never);
      const res = await commissionScoutingRun(trx as never);
      expect(res.commissioned).toBe(false);
      expect(res.reason).toBe("disabled");
    });
  });
});

describe("the brief must survive the holding's own firewall", () => {
  it("names no screened term — the boundary is a rule, not a word list", async () => {
    // Learned live 2026-07-26: the first brief enumerated the prohibited
    // categories, and the pre-task hook's halal screen fail-closed the task on
    // its own instructions ("flagged category 'pork'"). The screen matches TEXT
    // and is right not to guess intent, so the ask must state the rule instead.
    // Same trap as the CEO's "bahis" incident on 2026-07-23.
    await inTrx(async (trx) => {
      await emptyWorld(trx as never);
      const res = await commissionScoutingRun(trx as never);
      expect(res.commissioned).toBe(true);
      const t = await sql<{ objective: string; output_contract: string }>`
        SELECT objective, output_contract FROM tasks WHERE id = ${res.taskId}
      `.execute(trx as never);
      const text = `${t.rows[0].objective}\n${t.rows[0].output_contract}`.toLowerCase();

      const terms = await sql<{ term: string }>`
        SELECT lower(x.term) AS term
          FROM jsonb_array_elements_text(
                 COALESCE(resolve_setting('revenue.halal_screen'), '[]'::jsonb)) AS x(term)
      `.execute(trx as never);
      expect(terms.rows.length).toBeGreaterThan(10); // the screen itself must be loaded
      const hits = terms.rows.map((r) => r.term.trim()).filter((t2) => t2 && text.includes(t2));
      expect(hits, "the commissioned brief contains terms its own firewall blocks").toEqual([]);
    });
  });
});

describe("reading what the scout brought back", () => {
  it("reads the contracted CANDIDATE blocks", () => {
    const out = parseCandidates(
      [
        "I fetched four pages. Findings:",
        "",
        "CANDIDATE",
        "title: Turkish-language onboarding docs for EU SaaS vendors",
        "title_tr: AB'li SaaS satıcıları için Türkçe kullanıma alma dokümanları",
        "engine: consultancy",
        "region: EU",
        "channel: direct outreach",
        "capital_eur: 0",
        "evidence: https://example.org/a | https://example.org/b",
        "why: eleven live job posts asking for exactly this in the last month",
        "END",
        "",
        "CANDIDATE",
        "title: Second thing",
        "engine: content_monetization",
        "capital_eur: 25",
        "evidence: https://example.org/c",
        "END",
      ].join("\n"),
    );
    expect(out).toHaveLength(2);
    expect(out[0].engine_slug).toBe("consultancy");
    // The CEO's screen is Turkish; the scout writes both legs at the source.
    expect(out[0].title_tr).toBe("AB'li SaaS satıcıları için Türkçe kullanıma alma dokümanları");
    expect(out[0].evidence_urls).toEqual(["https://example.org/a", "https://example.org/b"]);
    expect(out[0].capital_required_eur).toBe(0);
    expect(out[1].capital_required_eur).toBe(25);
    // An honest empty result is not a parse failure.
    expect(parseCandidates("NO CANDIDATES — the two sources I reached had no pricing pages.")).toEqual(
      [],
    );
  });

  it("still reads the older json shape rather than throwing findings away", async () => {
    const fenced = parseCandidates(
      'here is what I found\n```json\n{"candidates":[{"title":"A","engine_slug":"consultancy","evidence_urls":["https://x.example/a"]}]}\n```\nthat is all',
    );
    expect(fenced).toHaveLength(1);
    expect(parseCandidates('{"candidates":[]}')).toEqual([]);
    // Prose with no list is not an error the pipeline should crash on — it is a
    // run that found nothing, which is a legitimate answer.
    expect(parseCandidates("I could not reach any source today.")).toEqual([]);
  });
});

describe("harvest — findings become opportunities, or say why not", () => {
  const seedRun = async (trx: never, result: unknown) => {
    const agent = await sql<{ id: string }>`
      SELECT id FROM agents WHERE department = 'strategy' AND employment_status = 'active' LIMIT 1
    `.execute(trx);
    const task = await sql<{ id: string }>`
      INSERT INTO tasks (department, agent_id, objective, output_contract, model_tier,
                         approval_class, status, result)
      VALUES ('strategy', ${agent.rows[0].id}::uuid, 'scout probe', 'candidates json', 'L3',
              'none', 'done', ${JSON.stringify(result)}::jsonb)
      RETURNING id
    `.execute(trx);
    await sql`
      INSERT INTO revenue_scout_runs (task_id) VALUES (${task.rows[0].id}::uuid)
    `.execute(trx);
    return task.rows[0].id;
  };

  it("registers a cited candidate and remembers where it came from", async () => {
    await inTrx(async (trx) => {
      const taskId = await seedRun(trx as never, {
        text: JSON.stringify({
          candidates: [
            {
              title: "EU-based Turkish-language SaaS onboarding consultancy",
              engine_slug: "consultancy",
              region: "EU",
              channel: "direct outreach",
              capital_required_eur: 0,
              evidence_urls: ["https://example.org/market-report"],
              rationale: "measured demand signal",
              title_tr: "AB merkezli Türkçe SaaS kullanıma alma danışmanlığı",
            },
          ],
        }),
        confidence: 0.7,
      });

      const res = await harvestScoutingRuns(trx as never);
      expect(res.registered).toBe(1);

      const opp = await sql<{
        title: string;
        state: string;
        capital_required_eur: string;
        title_tr: string | null;
        research_refs: { task_id?: string; evidence_urls?: string[] };
      }>`SELECT title, title_tr, state, capital_required_eur, research_refs FROM opportunities
          WHERE research_refs->>'task_id' = ${taskId}`.execute(trx as never);
      expect(opp.rows).toHaveLength(1);
      expect(opp.rows[0].state).toBe("discovered");
      expect(opp.rows[0].research_refs.task_id).toBe(taskId);
      expect(opp.rows[0].research_refs.evidence_urls).toEqual([
        "https://example.org/market-report",
      ]);
      expect(opp.rows[0].title_tr).toBe("AB merkezli Türkçe SaaS kullanıma alma danışmanlığı");

      // The audited door wrote the trail, not the job.
      const audit = await sql<{ n: string }>`
        SELECT count(*)::text AS n FROM audit_log
         WHERE action = 'revenue.opportunity.registered'
           AND payload->>'title' = 'EU-based Turkish-language SaaS onboarding consultancy'
      `.execute(trx as never);
      expect(Number(audit.rows[0].n)).toBe(1);
    });
  });

  it("refuses a candidate that cites nothing, and records the refusal", async () => {
    await inTrx(async (trx) => {
      const taskId = await seedRun(trx as never, {
        text: JSON.stringify({
          candidates: [
            { title: "Vague idea with no source", engine_slug: "consultancy", evidence_urls: [] },
          ],
        }),
      });
      const res = await harvestScoutingRuns(trx as never);
      expect(res.registered).toBe(0);
      expect(res.refused).toBe(1);
      const run = await sql<{ outcome: { refusals?: Array<{ why: string }> } }>`
        SELECT outcome FROM revenue_scout_runs WHERE task_id = ${taskId}
      `.execute(trx as never);
      expect(run.rows[0].outcome.refusals?.[0].why).toBe("no_evidence");
    });
  });

  it("refuses an unknown engine instead of inventing one", async () => {
    await inTrx(async (trx) => {
      await seedRun(trx as never, {
        text: JSON.stringify({
          candidates: [
            {
              title: "Something in an engine we do not run",
              engine_slug: "spaceflight",
              evidence_urls: ["https://example.org/x"],
            },
          ],
        }),
      });
      const res = await harvestScoutingRuns(trx as never);
      expect(res.registered).toBe(0);
      expect(res.refused).toBe(1);
    });
  });

  it("harvests a run exactly once", async () => {
    await inTrx(async (trx) => {
      await seedRun(trx as never, {
        text: JSON.stringify({
          candidates: [
            {
              title: "Repeat-safety probe",
              engine_slug: "consultancy",
              evidence_urls: ["https://example.org/y"],
            },
          ],
        }),
      });
      expect((await harvestScoutingRuns(trx as never)).registered).toBe(1);
      const second = await harvestScoutingRuns(trx as never);
      expect(second.registered).toBe(0);
      expect(second.runs).toBe(0);
    });
  });

  it("leaves a run that is still working alone", async () => {
    await inTrx(async (trx) => {
      const agent = await sql<{ id: string }>`
        SELECT id FROM agents WHERE department = 'strategy' AND employment_status = 'active' LIMIT 1
      `.execute(trx as never);
      const task = await sql<{ id: string }>`
        INSERT INTO tasks (department, agent_id, objective, output_contract, model_tier,
                           approval_class, status)
        VALUES ('strategy', ${agent.rows[0].id}::uuid, 'scout probe', 'candidates json', 'L3',
                'none', 'running')
        RETURNING id
      `.execute(trx as never);
      await sql`INSERT INTO revenue_scout_runs (task_id) VALUES (${task.rows[0].id}::uuid)`.execute(
        trx as never,
      );
      await harvestScoutingRuns(trx as never);
      // State-INDEPENDENT (R4.2 lesson): assert about THIS run, never about a
      // global count — the live database may carry runs of its own.
      const mine = await sql<{ harvested_at: string | null }>`
        SELECT harvested_at FROM revenue_scout_runs WHERE task_id = ${task.rows[0].id}
      `.execute(trx as never);
      expect(mine.rows[0].harvested_at).toBeNull();
    });
  });
});
