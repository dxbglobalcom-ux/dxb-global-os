import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  PROBES,
  TR,
  diffRowMaps,
  refusalOf,
  refusalTr,
  verdictForProbes,
} from "../../scripts/governance/company-untouched.mjs";
import {
  CONSTRUCTION_MARKS,
  SEPARATION_RECORDS,
} from "../../scripts/b36/construction-marks.mjs";

// B36 · Block 6 — THE BATTERY KEEPS THE PROOF COMMAND HONEST.
//
// `pnpm verify:separation` (scripts/governance/company-untouched.mjs) is the one
// command that answers the only question this row was opened for: can the
// construction site enter the company's database, write in it, or get round the
// wall — and do the company's own things still work?
//
// WHY THE COMMAND ITSELF IS NOT RUN HERE, and it is not an omission.
// Its second step IS this battery, so a battery that ran it would run itself;
// and tests/b36/battery-carries-no-company-key.test.ts forbids any file the
// battery loads from carrying a way into the holding — which that command must
// have, because attempting a real write with the real account is step four.
// Registered as an adaptation in PLAN.md §"Block 6" on 2026-08-25.
//
// WHAT THIS FILE DOES INSTEAD. It imports the command's JUDGEMENTS — the three
// pure functions that decide what counts as a breach — and requires each of them
// to convict on constructed input. The definition of a breach and the gate that
// enforces it therefore cannot drift apart: there is one of each, in one file,
// and the battery goes red if that file stops being able to say no.
//
// This is the same shape tests/b36/no-company-fallbacks.test.ts holds for the
// fallback counter, and for the same reason: on 2026-08-23 a detector in this
// row reported a comfortable zero because `\b` is a backspace in PostgreSQL's
// regular expressions, and nobody had ever asked it to find anything.

const REPO = process.cwd();
const COMMAND = "scripts/governance/company-untouched.mjs";

interface Probe {
  id: string;
  what: string;
  sqls: string[];
}
interface Step {
  sql: string;
  ok: boolean;
  error?: string;
}
interface Result extends Probe {
  steps: Step[];
}
interface Move {
  table: string;
  before: number | null;
  after: number | null;
  delta: number;
}

const probes = PROBES as Probe[];
const source = readFileSync(join(REPO, COMMAND), "utf8");

describe("B36 Block 6 — the proof command is registered, and its judgements convict", () => {
  it("(1) `pnpm verify:separation` exists and runs this command", () => {
    const pkg = JSON.parse(readFileSync(join(REPO, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(
      pkg.scripts["verify:separation"],
      "the proof command is no longer reachable by name — the CEO's gate has been unhooked",
    ).toBeTruthy();
    expect(pkg.scripts["verify:separation"]).toContain(COMMAND);
  });

  it("(2) it still declares all five steps, and the red-first step before them", () => {
    for (const step of [
      "0/6 · THE INSTRUMENTS PROVE THEMSELVES RED",
      "1/6 · THE COMPANY, PHOTOGRAPHED",
      "2/6 · THE WHOLE BATTERY",
      "3/6 · THE COMPANY, PHOTOGRAPHED AGAIN",
      "4/6 · A WRITE, ATTEMPTED AGAINST THE COMPANY",
      "5/6 · THE REPOSITORY, SWEPT",
      "6/6 · THE COMPANY'S OWN ROOMS, SWEPT FOR A CONSTRUCTION TRACE",
    ]) {
      expect(source, `the proof command no longer performs: ${step}`).toContain(step);
    }
    // And it may not print a verdict over unproven instruments.
    expect(
      source,
      "the command no longer refuses to continue when an instrument cannot be shown convicting",
    ).toContain("INSTRUMENTS_NOT_PROVEN");
  });

  // ── the row differ
  it("(3) the row differ convicts a row that appeared, and one that left", () => {
    expect(diffRowMaps({ agents: 205 }, { agents: 206 }) as Move[]).toEqual([
      { table: "agents", before: 205, after: 206, delta: 1 },
    ]);
    expect(diffRowMaps({ agents: 205 }, { agents: 204 }) as Move[]).toEqual([
      { table: "agents", before: 205, after: 204, delta: -1 },
    ]);
    // a table the construction created in the holding, and one it dropped
    expect(diffRowMaps({}, { _probe: 0 }) as Move[]).toEqual([
      { table: "_probe", before: null, after: 0, delta: 0 },
    ]);
    expect(diffRowMaps({ agents: 205 }, {}) as Move[]).toEqual([
      { table: "agents", before: 205, after: null, delta: -205 },
    ]);
  });

  it("(3b) and it does not cry over a company that did not move", () => {
    expect(diffRowMaps({ agents: 205, tasks: 217 }, { tasks: 217, agents: 205 }) as Move[]).toEqual(
      [],
    );
  });

  // ── the write prober's verdict
  it("(4) an accepted write is a breach, and a refused one is not", () => {
    const accepted: Result = {
      id: "insert",
      what: "add a row",
      sqls: [],
      steps: [
        { sql: "BEGIN", ok: true },
        { sql: "INSERT …", ok: true },
        { sql: "ROLLBACK", ok: true },
      ],
    };
    const refused: Result = {
      id: "insert",
      what: "add a row",
      sqls: [],
      steps: [
        { sql: "BEGIN", ok: true },
        { sql: "INSERT …", ok: false, error: "permission denied for table agents" },
      ],
    };
    const v = verdictForProbes([accepted, refused] as unknown[]) as {
      accepted: Result[];
      refused: Result[];
    };
    expect(
      v.accepted.length,
      "the prober no longer treats a statement that went through as a way into the company",
    ).toBe(1);
    expect(v.refused.length).toBe(1);
    expect(refusalOf(refused as unknown)).toContain("permission denied for table agents");
  });

  it("(4b) a probe that could not even log in is not counted as refused-and-safe by accident", () => {
    const noLogin: Result = {
      id: "insert",
      what: "add a row",
      sqls: [],
      steps: [{ sql: "<login>", ok: false, error: "password authentication failed" }],
    };
    const v = verdictForProbes([noLogin] as unknown[]) as { accepted: Result[] };
    expect(v.accepted.length).toBe(0);
    expect(refusalOf(noLogin as unknown)).toContain("password authentication failed");
  });

  // ── the probe set itself
  it("(5) every attempt is wrapped so it can never leave a write behind", () => {
    for (const p of probes) {
      const acts = p.sqls.filter((s) => !/^(BEGIN|ROLLBACK|SET )/i.test(s));
      expect(acts.length, `probe ${p.id} attempts nothing`).toBeGreaterThan(0);
      expect(p.sqls, `probe ${p.id} does not open a transaction`).toContain("BEGIN");
      expect(
        p.sqls[p.sqls.length - 1],
        `probe ${p.id} does not end in ROLLBACK — an accepted write would COMMIT into the holding`,
      ).toBe("ROLLBACK");
      expect(
        p.sqls.some((s) => /\bCOMMIT\b/i.test(s)),
        `probe ${p.id} commits`,
      ).toBe(false);
    }
  });

  it("(6) the three escapes and the two boundary tables are still attempted", () => {
    const ids = probes.map((p) => p.id);
    // Writing is only half of it. These three ask the engine to REMOVE the
    // restraint rather than to write past it — and step 4 measured on 2026-08-25
    // that the first two really do get past the read-only setting, and are
    // stopped by the privilege matrix underneath. Drop one of these and the
    // command stops testing the thing that is actually holding the wall up.
    for (const escape of ["read-only-off", "read-write-txn", "self-grant", "create-role"]) {
      expect(ids, `the escape attempt \`${escape}\` has been dropped from the drill`).toContain(
        escape,
      );
    }
    // The CEO's boundary: audit_log and hook_violations. Nothing moves in them
    // without his word, so the drill proves every run that nothing CAN.
    const sql = probes.flatMap((p) => p.sqls).join(" ");
    expect(sql, "the drill no longer tries to write into the legal record").toContain(
      "public.audit_log",
    );
    expect(sql, "the drill no longer tries to write into the governance record").toContain(
      "public.hook_violations",
    );
  });

  // ── the CEO's side of the same sentence
  //
  // `/blok6` on the acceptance screen paints exactly what this command emits, so
  // a judged line that has no Turkish twin becomes a line of English on a
  // surface HE reads. The standing language directive: a surface he looks at is
  // 100% one locale. This is the gate that holds it — not a habit.
  it("(8) every write attempt carries the sentence he will read", () => {
    for (const p of probes) {
      expect(
        (p as unknown as { tr?: string }).tr,
        `the attempt \`${p.id}\` would reach his screen in English`,
      ).toBeTruthy();
    }
  });

  it("(9) every judged line has a Turkish twin, and every step title too", () => {
    const table = TR as Record<string, string>;
    // Pulled out of the command's own source: the label of each judged line that
    // is written as a plain string. A line that passes its Turkish explicitly
    // (the templated ones) is not written this way and is not looked for here.
    const labels = [...source.matchAll(/(?:say|redSeen)\(\s*[^"]*?,\s*"((?:[^"\\]|\\.)*)"/g)].map(
      (m) => m[1],
    );
    expect(labels.length, "the extractor found no judged lines — it is blind, not clean").toBeGreaterThan(
      10,
    );
    const missing = labels.filter((l) => !table[l]);
    expect(
      missing,
      "these lines would reach the CEO's screen in English:\n" + missing.join("\n"),
    ).toEqual([]);
    for (const step of ["0/6", "1/6", "2/6", "3/6", "4/6", "5/6", "6/6"]) {
      expect(table[step], `step ${step} has no Turkish title`).toBeTruthy();
    }
  });

  it("(10) the engine's refusals are put into his language, not pasted raw", () => {
    const cases: Array<[string, string]> = [
      ["cannot execute INSERT in a read-only transaction", "salt-okunur"],
      ["permission denied for table agents", "yazma yetkisi yok"],
      ["permission denied to create role", "hesap açma yetkisi yok"],
      ["permission denied to COPY to or from an external program", "program çalıştırma yetkisi yok"],
      ["password authentication failed for user", "parola doğrulaması başarısız"],
    ];
    for (const [error, turkish] of cases) {
      const tr = refusalTr({
        steps: [
          { sql: "BEGIN", ok: true },
          { sql: "INSERT INTO public.agents …", ok: false, error },
        ],
      } as unknown) as string;
      expect(tr, `the engine's refusal "${error}" reaches his screen untranslated`).toContain(
        turkish,
      );
    }
  });

  // ── what "construction" means, and the innocents it must not convict
  it("(11) the construction marks are names, and each innocent one was left off deliberately", () => {
    const marks = CONSTRUCTION_MARKS as string[];
    expect(marks.length, "the list of construction names is empty — the sweep would find nothing").toBeGreaterThan(
      10,
    );
    // MEASURED, EACH ONE, AND EACH WAS A REAL FALSE CONVICTION BEFORE IT WAS
    // REMOVED. `resident-worker` is the COMPANY's own worker identity and it
    // claimed 214 of the company's 217 tasks; the bare word `test` names the
    // holding's eight real Quality employees; `engineering-worker` appeared in
    // an employee's own probation brief; `e10t` appeared in the CEO's own purge
    // decision; `smoke-e72-ui` is a model he added himself.
    for (const innocent of [
      "resident-worker",
      "engineering-worker",
      "e10t",
      "smoke-e7",
      "fable-5",
    ]) {
      expect(
        marks,
        `"${innocent}" is back on the construction list — it convicts the company of being the construction`,
      ).not.toContain(innocent);
    }
    expect(marks.some((m) => m === "test"), "the bare word `test` convicts the Quality department").toBe(
      false,
    );
    // and the company's own proof of the separation is never swept
    expect(SEPARATION_RECORDS as string[]).toContain("residue.moved_out");
  });

  it("(12) the proof command and the purge share ONE definition of construction", () => {
    expect(
      source,
      "the gate no longer reads the shared definition — it and the purge can now drift apart",
    ).toContain("construction-marks.mjs");
    const purge = readFileSync(join(REPO, "scripts/b36/move-residue.mjs"), "utf8");
    expect(
      purge,
      "the purge no longer reads the shared definition — it and the gate can now drift apart",
    ).toContain("construction-marks.mjs");
  });

  it("(7) the drill still records WHY the employee registry is not the truncate target", () => {
    // Measured 2026-08-25: `TRUNCATE public.agents` is refused to every identity
    // alive, superuser included, because a foreign key references it — so its
    // refusal on the company would have proved nothing. The instrument caught
    // its own blindness on the first run. If someone moves the target back, the
    // lesson goes with it.
    expect(source).toContain("cannot be truncated by ANYONE");
    expect(
      probes.find((p) => p.id === "truncate")?.sqls.join(" "),
      "the truncate probe is back on a table nobody can truncate — it proves nothing",
    ).toContain("TRUNCATE public.audit_log");
  });
});
