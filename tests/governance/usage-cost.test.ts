// usage.mjs — the token and list-price counter the dxb-team2 door names for a card's cost, run as the real
// file where it stands. Sol's pass on 193eea17 (B4) found the door promised a cost the script never printed,
// and the lead measured a second hole: the top-level message.usage holds only the executor's iterations, so
// an advisor call (an `advisor_message` iteration on claude-fable-5-1) was missing from tokens and cost alike.
// The fixture below is a small hand-built transcript; every number asserted is worked out in the comments.
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

const ROOT = resolve(__dirname, "../..");
const SCRIPT = join(ROOT, ".planning", "quick", "20261003-runtime-isolation", "usage.mjs");

const dir = mkdtempSync(join(tmpdir(), "usagecost"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

const OPUS = "claude-opus-5-5";
const row = (timestamp: string, id: string, model: string, usage: object) =>
  ({ type: "assistant", timestamp, message: { id, model, usage } });
const cw = (m5: number, h1: number) => ({ ephemeral_5m_input_tokens: m5, ephemeral_1h_input_tokens: h1 });

const rows = [
  { type: "user", timestamp: "2026-10-04T08:59:00Z", message: { role: "user", content: "go" } },
  // E — before --from: 1,000,000 input on Opus = $4.00
  row("2026-10-04T08:00:00Z", "msg_e", OPUS,
    { input_tokens: 1_000_000, cache_creation_input_tokens: 0, cache_read_input_tokens: 0, output_tokens: 0 }),
  // A — Opus, no iterations, a 5-minute / 1-hour split:
  // 10,000*4 + 100,000*5 + 200,000*8 + 1,000,000*0.20 + 50,000*20 = 3,340,000 / 1e6 = $3.34
  row("2026-10-04T10:00:00Z", "msg_a", OPUS, {
    input_tokens: 10_000, cache_creation_input_tokens: 300_000, cache_read_input_tokens: 1_000_000,
    output_tokens: 50_000, cache_creation: cw(100_000, 200_000),
  }),
  // B — iterations [message, advisor_message, message]. The top-level split names only the first
  // iteration's 1-hour write (as the real transcript does), so pricing must come from the iterations.
  // executor: 4*4 + 1,000*8 + 200,000*5 + 500,000*0.20 + 500*20 = 1,118,016 / 1e6 = $1.118016
  // advisor (Fable): 100,000*10 + 10,000*50 = 1,500,000 / 1e6 = $1.50
  row("2026-10-04T10:05:00Z", "msg_b", OPUS, {
    input_tokens: 4, cache_creation_input_tokens: 201_000, cache_read_input_tokens: 500_000, output_tokens: 500,
    cache_creation: cw(0, 1_000),
    iterations: [
      { type: "message", input_tokens: 2, cache_creation_input_tokens: 1_000, cache_read_input_tokens: 200_000,
        output_tokens: 100, cache_creation: cw(0, 1_000) },
      { type: "advisor_message", model: "claude-fable-5-1", input_tokens: 100_000, cache_creation_input_tokens: 0,
        cache_read_input_tokens: 0, output_tokens: 10_000, cache_creation: cw(0, 0) },
      { type: "message", input_tokens: 2, cache_creation_input_tokens: 200_000, cache_read_input_tokens: 300_000,
        output_tokens: 400, cache_creation: cw(200_000, 0) },
    ],
  }),
  // C — the same message id as A, the same usage: counted once
  row("2026-10-04T10:00:01Z", "msg_a", OPUS, {
    input_tokens: 10_000, cache_creation_input_tokens: 300_000, cache_read_input_tokens: 1_000_000,
    output_tokens: 50_000, cache_creation: cw(100_000, 200_000),
  }),
  // D — a model with no price row: 1,000 + 200 = 1,200 tokens unpriced
  row("2026-10-04T10:10:00Z", "msg_d", "claude-haiku-4-5-20251001",
    { input_tokens: 1_000, cache_creation_input_tokens: 0, cache_read_input_tokens: 0, output_tokens: 200 }),
  // S — a zero-token synthetic row: a call, a model, not unpriced
  row("2026-10-04T10:11:00Z", "msg_s", "<synthetic>",
    { input_tokens: 0, cache_creation_input_tokens: 0, cache_read_input_tokens: 0, output_tokens: 0 }),
  // F — no iterations, no split: the whole write at the 1-hour rate, 100,000*8 = $0.80
  row("2026-10-04T10:12:00Z", "msg_f", OPUS,
    { input_tokens: 0, cache_creation_input_tokens: 100_000, cache_read_input_tokens: 0, output_tokens: 0 }),
];
const FIXTURE = join(dir, "t.jsonl");
writeFileSync(FIXTURE, rows.map((r) => JSON.stringify(r)).join("\n") + "\n");

function run(...args: string[]) {
  const r = spawnSync("node", [SCRIPT, FIXTURE, ...args], { encoding: "utf8", timeout: 10_000 });
  expect(r.status, r.stderr).toBe(0);
  const out = r.stdout.trim().split("\n");
  expect(out).toHaveLength(1);
  return JSON.parse(out[0]);
}

describe("usage.mjs — tokens and their list-price cost", () => {
  it("--from: executor sums unchanged in meaning, advisor block, usd, unpriced", () => {
    const j = run("--from", "2026-10-04T09:00:00Z");
    expect(j.lines).toBe(8);
    expect(j.bad).toBe(0);
    expect(j.models).toEqual([OPUS, "claude-haiku-4-5-20251001", "<synthetic>"]);
    // A + B + D + S + F; executor iterations only
    expect(j.calls).toBe(5);
    expect(j.input).toBe(11_004);
    expect(j.cacheWrite).toBe(601_000);
    expect(j.cacheRead).toBe(1_500_000);
    expect(j.output).toBe(50_700);
    expect(j.new).toBe(11_004 + 601_000 + 50_700);
    expect(j.advisor).toEqual({
      calls: 1, input: 100_000, cacheWrite: 0, cacheRead: 0, output: 10_000, models: ["claude-fable-5-1"],
    });
    // 3.34 + 1.118016 + 1.50 + 0.80 = 6.758016
    expect(j.usd).toBe(6.76);
    expect(j.unpriced).toEqual({ "claude-haiku-4-5-20251001": 1_200 });
  });

  it("without --from the early row counts", () => {
    const j = run();
    expect(j.calls).toBe(6);
    expect(j.input).toBe(1_011_004);
    // 6.758016 + 4.00
    expect(j.usd).toBe(10.76);
  });
});
