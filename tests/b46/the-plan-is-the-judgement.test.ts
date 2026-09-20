// B46 — LAYER 2: THE PLAN IS THE SESSION'S JUDGEMENT, AND THE ENGINE MAY NOT TOUCH IT.
//
// His ruling of 2026-09-20: *"skill beni boru yaptı"* — the door took his COMPLAINT and pushed
// it, unchanged, into 37 search boxes. The repair was a layer: the session decomposes the
// complaint into tagged sub-questions and the weapons receive one row at a time (SKILL.md §0).
//
// The checker measured the first build of that layer the same night and refused it. Three of
// its findings live here, as behaviour rather than as prose:
//   * the plan's own box query never reached a box — the sweep re-derived one from the sentence;
//   * `--check --fix` REWROTE his plan file (fence, comments, body and the `dert: |` block all
//     destroyed) and the fleet called it on every single hunt;
//   * two rows could both be called S2, and a finding naming S2 would answer nobody.

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const SKILL = join(process.cwd(), ".claude/skills/dxb-research");
const PLAN = join(SKILL, "scripts", "plan.py");
const FIX = join(SKILL, "schemas", "plan-fixtures");

let work = "";
beforeAll(() => {
  work = mkdtempSync(join(tmpdir(), "dxb-plan-"));
});
afterAll(() => rmSync(work, { recursive: true, force: true }));

/** run a command and hand back what it said and how it left, without throwing */
function run(cmd: string, args: string[]): { out: string; code: number } {
  try {
    const out = execFileSync(cmd, args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" },
    });
    return { out, code: 0 };
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string; status?: number };
    return { out: String(err.stdout ?? "") + String(err.stderr ?? ""), code: err.status ?? 1 };
  }
}

describe("the plan is refused when it cannot be answered", () => {
  it("refuses two rows carrying the same id — a finding would answer nobody", () => {
    const r = run("python3", [PLAN, "--check", join(FIX, "dup-id.md")]);
    expect(r.code).toBe(3);
    expect(r.out).toMatch(/S2: iki kez var/);
  });

  it("answers a plan of the wrong shape with a REFUSAL, not a traceback", () => {
    const r = run("python3", [PLAN, "--check", join(FIX, "bad-type.md")]);
    expect(r.code).toBe(3);
    expect(r.out).toMatch(/`dert` bir metin de[gğ]il/);
    expect(r.out, "a stack trace is the engine talking to itself").not.toMatch(/Traceback/);
  });

  it("refuses a missing box query and SUGGESTS one instead of writing it in", () => {
    const r = run("python3", [PLAN, "--check", join(FIX, "no-kisa.md")]);
    expect(r.code).toBe(3);
    expect(r.out).toMatch(/`kisa` yok — öneri: "Claude Max 20x Pro"/);
    expect(r.out).toMatch(/kendi elinle plana yaz/);
  });

  it("does not change one byte of the plan it was asked to read", () => {
    const target = join(work, "plan.md");
    const original = [
      "---",
      "# the session's own note, which no engine may delete",
      "dert: |",
      "  uzun bir dert, iki satır halinde",
      "  ve ikinci satırı",
      "alt_sorular:",
      "  - id: S1",
      '    soru: "Claude Max 20x kullanım limiti nedir?"',
      "    etiket: DISARIDA",
      '    kisa: "Claude Max 20x limits"',
      "    silah: [crowd]",
      "---",
      "",
      "Bu gövde okunmaz ama silinmez de.",
      "",
    ].join("\n");
    execFileSync("bash", ["-c", `cat > ${JSON.stringify(target)} <<'EOF'\n${original}EOF`]);
    const before = readFileSync(target, "utf8");
    const r = run("python3", [PLAN, "--check", target]);
    expect(r.code).toBe(0);
    expect(readFileSync(target, "utf8"), "the plan is his paperwork, not the engine's scratch pad").toBe(before);
  });
});

describe("what the plan decided is what the channel is asked", () => {
  it("sends the plan's own box query to a search box, and the sentence to a sentence engine", () => {
    const out = join(work, "kisa-run");
    const r = run("bash", [join(SKILL, "scripts", "sweep.sh"),
      "Claude Max 20x kullanım limiti Pro'nun kaç katı?", out,
      "--tier", "core", "--no-browser", "--no-read", "--kisa", "Claude Max 20x limits"]);
    expect(r.code, r.out.slice(-400)).toBe(0);
    const ledger = readFileSync(join(out, ".queries"), "utf8");
    // the box gets what the session decided…
    expect(ledger).toMatch(/hackernews\tClaude Max 20x limits/);
    // …and the engine built to read a sentence still gets the whole sub-question
    expect(ledger).toMatch(/exa\tClaude Max 20x kullanım limiti/);
  }, 120_000);

  it("refuses a --kisa that is itself a paragraph", () => {
    const r = run("bash", [join(SKILL, "scripts", "sweep.sh"), "bir alt-soru", join(work, "bad-kisa"),
      "--tier", "core", "--no-browser",
      "--kisa", "codex'in 200 dolarlık paketinde %50 astra sınırı yok ama fable 5.1'de var ve bu aşırı can sıkıcı."]);
    expect(r.code).toBe(3);
    expect(r.out).toMatch(/--kisa kutuya yazilamaz/);
  }, 60_000);
});

describe("a gate that cannot run does not become a gate that said yes", () => {
  it("refuses the paragraph even when the judge itself is broken", () => {
    // Measured by an independent auditor on 2026-09-20: with `shortq.py` exiting 1, a
    // 177-character paragraph reached twelve channels, because the wall asked only whether the
    // gate had said "3". A judge that cannot sit does not acquit.
    const copy = join(work, "broken-gate");
    execFileSync("cp", ["-a", SKILL, copy]);
    execFileSync("bash", ["-c", `printf 'import sys\nsys.exit(1)\n' > ${JSON.stringify(join(copy, "scripts", "shortq.py"))}`]);
    const r = run("bash", [join(copy, "scripts", "sweep.sh"),
      "codex'in 200 dolarlık paketinde %50 astra sınırı yok ama fable 5.1'de var ve bu aşırı can " +
      "sıkıcı. Bu doğru mu? Ne yapmalıyım? Karar ver.",
      join(work, "broken-out"), "--tier", "core", "--no-browser", "--no-read"]);
    expect(r.code).toBe(3);
    expect(r.out).toMatch(/kapi calisamadi/);
    expect(existsSync(join(work, "broken-out")), "not one channel folder is opened").toBe(false);
  }, 60_000);
});

describe("a verdict that names no sub-question does not reach him", () => {
  it("drops it and says how many it dropped", () => {
    const lanes = join(work, "lanes");
    execFileSync("bash", ["-c",
      `mkdir -p ${JSON.stringify(lanes)} && cp ${JSON.stringify(join(FIX, "merge-lanes"))}/*.jsonl ${JSON.stringify(lanes)}/`]);
    const r = run("python3", [join(SKILL, "fleet", "merge.py"), lanes]);
    expect(r.out).toMatch(/dusurulen: 1 hukum/);
    expect(r.out).toMatch(/\[crowd\] S2/);
    expect(r.out, "the nameless verdict is not printed to him").not.toMatch(/belirgin fark yok/);
  });
});
