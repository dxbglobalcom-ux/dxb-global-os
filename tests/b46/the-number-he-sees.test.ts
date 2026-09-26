// B46 — THE NUMBER HE SEES MUST BE A COUNT, NOT A CLAIM.
//
// WHAT WENT WRONG. The skill's own contract (SKILL.md §6) promised the CEO four numbers "machine-
// counted, in every run", the first of them being "distinct people whose own words were read — the
// denominator". Measured on 2026-09-17, on the only fleet run that was kept:
//
//   * the summary put 783 in front of him. The hunter's own report said, twice, "783 person-rows,
//     NOT de-duplicated across threads … people who spoke to the actual question: ~10";
//   * `people_count()` does not count anything — it lifts the first bold number out of the
//     hunter's prose. Handed the sentence "Toplam **999** ayri insanin sozu okundu (hicbiri
//     sayilmadi)" it answers 999;
//   * the "sources" column counted the addresses a hunter TYPED, not the ones it fetched: a URL
//     inside a failing `echo`, paired with a tool result carrying `is_error: true`, was still
//     counted as one opened source and as a ground-read;
//   * the counter itself double-counted: `crowd.sh` unions (thread, author) PAIRS, so one person
//     writing in two threads is two people.
//
// This case fixes the denominator in place: what is counted is counted by a machine, and what is
// only claimed is labelled a claim and never dressed as a count.
//
// THE SHAPE CHANGED ON 2026-09-26, THE RULE DID NOT. The hunters now own platforms — `crowd` became
// `forums` — and hand back lines, not six blocks: one HÜKÜM line, one `PLATFORM <p>: bulundu N /
// okundu M / okunmadı: … / kapı kapalı: …` line per platform, and `KULLANDIĞIM SATIRLAR: L…`, the ids
// of the ledger's rows (fleet/ARSENAL.md). So the merge cases below moved to that shape: a hunter's
// number now stands in its own PLATFORM line and is printed under a heading that calls it a claim
// (there is no E block and no BEYAN column any more); a closed door arrives in that line, in every
// markdown shape a hunter writes it; a report is checked by its row ids, not by addresses in prose
// (KAYNAKSIZ became SATIRSIZ); the verdicts still stand side by side. The crowd.sh cases are unchanged.

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Bench, makeBench, sample } from "./engine-copy.js";

let b: Bench;
beforeAll(() => {
  b = makeBench();
});
afterAll(() => b?.dispose());

// ── the counter ─────────────────────────────────────────────────────────────

describe("crowd.sh — one human is one human, in however many threads", () => {
  it("counts the same author in two threads as ONE person", () => {
    const yaml = sample(
      b,
      "thread.yaml",
      "- type: COMMENT\n  author: same_reader\n  text: The same person writing in two different threads\n  score: 3\n",
    );
    const urls = sample(
      b,
      "crowd-urls.txt",
      "https://www.reddit.com/r/bench/comments/aaa/thread1\nhttps://www.reddit.com/r/bench/comments/bbb/thread2\n",
    );
    const out = join(b.root, "crowd-out");
    const stdout = execFileSync("bash", [join(b.engine, "scripts", "crowd.sh"), urls, out, "--workers", "2"], {
      encoding: "utf8",
      env: { ...process.env, PATH: `${b.bin}:${process.env.PATH}`, DXB_STUB_BODY: yaml, PYTHONDONTWRITEBYTECODE: "1" },
    });
    // two comments, two threads — but ONE human being.
    expect(stdout).toMatch(/2 yorum/);
    expect(stdout).toMatch(/·\s*1 ayri insan/);
  });

  it("prints a machine-readable count line the fleet can read back", () => {
    const yaml = sample(b, "thread2.yaml", "- type: COMMENT\n  author: reader_one\n  text: hello there friend\n  score: 1\n");
    const urls = sample(b, "crowd-urls2.txt", "https://www.reddit.com/r/bench/comments/ccc/thread3\n");
    const out = join(b.root, "crowd-out2");
    const stdout = execFileSync("bash", [join(b.engine, "scripts", "crowd.sh"), urls, out, "--workers", "1"], {
      encoding: "utf8",
      env: { ...process.env, PATH: `${b.bin}:${process.env.PATH}`, DXB_STUB_BODY: yaml, PYTHONDONTWRITEBYTECODE: "1" },
    });
    expect(stdout).toMatch(/^CROWD-COUNT\t1\t1\t1$/m);
  });
});

// ── the summary ─────────────────────────────────────────────────────────────

/** One hunter transcript: a tool call whose result FAILED, and a final report whose number is a claim
 *  and which cites no row of the ledger. */
function failedHunterRun(dir: string): void {
  mkdirSync(dir, { recursive: true });
  const lines = [
    {
      type: "assistant",
      message: {
        content: [
          {
            type: "tool_use",
            id: "call_1",
            name: "Bash",
            input: { command: 'echo "opencli google search https://audit.example/never-fetched /ground/reddit.raw"' },
          },
        ],
      },
    },
    {
      type: "user",
      message: {
        content: [{ type: "tool_result", tool_use_id: "call_1", is_error: true, content: "command failed: exit 7" }],
      },
    },
    {
      type: "result",
      total_cost_usd: 0.01,
      result:
        "HÜKÜM: the crowd is for A\n" +
        "PLATFORM reddit: bulundu 999 / okundu 999 / okunmadı: 0 / kapı kapalı: AUTH_REQUIRED\n",
    },
  ];
  writeFileSync(join(dir, "forums.jsonl"), lines.map((l) => JSON.stringify(l)).join("\n") + "\n", "utf8");
  writeFileSync(join(dir, "forums.meta"), "rc=0\nsecs=12\n", "utf8");
}

function merge(dir: string, extra: string[] = []): string {
  try {
    return execFileSync("python3", [join(b.engine, "fleet", "merge.py"), dir, ...extra], {
      encoding: "utf8",
      env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" },
    });
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string };
    return String(err.stdout ?? "") + String(err.stderr ?? "");
  }
}

describe("merge.py — what was fetched is a source; what was typed is not", () => {
  it("counts ZERO sources and ZERO doors when the tool call itself failed", () => {
    const dir = join(b.root, "merge-failed");
    failedHunterRun(dir);
    const out = merge(dir);
    // the hunter's row: SURE PARA KAYNAK FETCH ADD, then the doors it opened
    const row = out.split("\n").find((l) => l.startsWith("forums")) ?? "";
    expect(row).not.toBe("");
    const cells = row.replace(/^forums\s+/, "").trim().split(/\s+/);
    // …s  cost  KAYNAK  FETCH  ADD  doors…
    expect(cells[2]).toBe("0"); // KAYNAK — nothing was fetched
    expect(row).not.toMatch(/\bgoogle\b/); // a door named in a FAILED command was never opened
    expect(row).not.toMatch(/zemin-okudu/);
  });

  it("never presents a hunter's own sentence as a counted number of people", () => {
    const dir = join(b.root, "merge-claim");
    failedHunterRun(dir);
    const out = merge(dir);
    // The summary may carry the hunter's figure, but only on the hunter's own line, under a heading
    // that says nothing counted it — and it must never stand as the denominator.
    expect(out).toMatch(/AVCILARIN KENDI SATIRLARI — avcinin BEYANI, sayim degil/);
    const claimed = out.split("\n").filter((l) => /\b999\b/.test(l));
    expect(claimed, out).toHaveLength(1);
    expect(claimed[0]).toMatch(/^\s*\[forums\] PLATFORM reddit:/);
    expect(out).toMatch(/INSAN: SAYILMADI/);
  });

  it("carries a closed door to the summary in every markdown shape a hunter writes its line", () => {
    const shapes = ["PLATFORM reddit:", "- PLATFORM reddit:", "**PLATFORM reddit:**", "## PLATFORM reddit:"];
    shapes.forEach((shape, i) => {
      const dir = join(b.root, `merge-door-${i}`);
      mkdirSync(dir, { recursive: true });
      const line = {
        type: "result",
        total_cost_usd: 0,
        result: `HÜKÜM: something.\n${shape} bulundu 5 / okundu 0 / okunmadı: 5 / kapı kapalı: AUTH_REQUIRED\n`,
      };
      writeFileSync(join(dir, "forums.jsonl"), JSON.stringify(line) + "\n", "utf8");
      const out = merge(dir);
      expect(out, `the shape "${shape}" disappeared from the summary`).toMatch(/\[forums\] PLATFORM reddit: .*AUTH_REQUIRED/);
    });
  });

  it("names a report that cites no row of the ledger at all", () => {
    // seven of seven carried no address, on the only run that was kept, and it was committed anyway;
    // a row carries its address by construction, so the hole is now a report with no row id
    const dir = join(b.root, "merge-naked");
    failedHunterRun(dir);
    const out = merge(dir);
    expect(out).toMatch(/SATIRSIZ RAPOR/);
    expect(out).toMatch(/HUNTER-forums\.md/);
  });

  it("puts the lanes' own verdicts side by side so a contradiction cannot hide", () => {
    const dir = join(b.root, "merge-verdicts");
    mkdirSync(dir, { recursive: true });
    const lane = (role: string, verdict: string) =>
      writeFileSync(
        join(dir, `${role}.jsonl`),
        JSON.stringify({ type: "result", total_cost_usd: 0, result: `## HUKUM: ${verdict}\n\n## A) ...\n` }) + "\n",
        "utf8",
      );
    lane("forums", "the crowd is clearly for A");
    lane("counter", "the strongest case is in fact for B");
    const out = merge(dir);
    expect(out).toMatch(/AVCILARIN KENDI HUKUMLERI/);
    expect(out).toMatch(/clearly for A/);
    expect(out).toMatch(/in fact for B/);
  });

  it("reads the people number from the machine's own count when one is handed to it", () => {
    const dir = join(b.root, "merge-counted");
    failedHunterRun(dir);
    const counted = sample(b, "crowd-count.txt", "CROWD-COUNT\t306\t140\t4\n");
    const out = merge(dir, ["--crowd", counted]);
    expect(out).toMatch(/INSAN \(sayildi\): 140/);
    expect(out).not.toMatch(/INSAN: SAYILMADI/);
  });
});
