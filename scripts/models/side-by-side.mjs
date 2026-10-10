#!/usr/bin/env node
// B51 step 3 · P7 — Haiku 5.5 beside Sonnet 5.5 on the same mechanical jobs; the result goes to the CEO and the
// decision is his (plan approved 2026-10-09: "aynı mekanik işlerde … Sonnet 5.5 ile yan yana denenir, sonuç ona
// gelir, karar sonra"). No seat moves.
//
//   DXB_DATABASE_URL=<company, read-only use> node scripts/models/side-by-side.mjs [--n 20] \
//     [--evidence <file.json>] [--private <file.md>]
//
// Jobs — each with the production lane's own system prompt and its own strict parser:
//   memory.classify  (packages/memory-router classify-read.ts) over his own chat lines as queries;
//   summarize        (packages/orchestrator context-budget.ts, fact extraction) over finished task results.
// The production lanes call through LiteLLM (no key exists — subscriptions only, his word); this trial calls both
// models through the company's Agent SDK under companyIsolation(), at effort low, so it measures the MODELS on the
// job, not the lane's wire. Inputs are read from the company and never written back; the same input goes to both
// models, in an order shuffled by a fixed seed.
//
// What lands where: the evidence file (in the repository) carries ids, input hashes, validity, the classifier's
// store/kind, fact counts, times and tokens — never his words or an employee's work. The full pairs go to the
// private file outside the repository (default ~/Desktop), for his eye. "Agreement" means the two models gave the
// same answer — not that either is right; who is right is his to see in the pairs.
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : fallback;
};
const N = Number(arg("n", "20"));
const day = new Date().toISOString().slice(0, 10);
const EVIDENCE = arg("evidence", join(REPO, ".planning/quick/20261009-masa-b51/evidence", `p7-side-by-side-${day}.json`));
const PRIVATE = arg("private", join(homedir(), "Desktop", `B51-P7-Haiku-Sonnet-${day}.md`));
const url = process.env.DXB_DATABASE_URL;
if (!url || !Number.isInteger(N) || N < 1) {
  console.error("usage: DXB_DATABASE_URL=<engine> node scripts/models/side-by-side.mjs [--n 20] [--evidence f] [--private f]");
  process.exit(2);
}

const MODELS = ["claude-haiku-5-5", "claude-sonnet-5-5"];
const SUMMARY_INPUT_CHARS = 8000;

const req = createRequire(join(REPO, "packages", "kernel", "package.json"));
const { query } = await import(req.resolve("@anthropic-ai/claude-agent-sdk"));
const pg = createRequire(join(REPO, "packages", "shared", "package.json"))("pg");
const { companyIsolation } = await import(join(REPO, "packages/kernel/dist/sdk-isolation.js"));
const { CLASSIFY_SYSTEM_PROMPT, parseClassification } = await import(join(REPO, "packages/memory-router/dist/classify-read.js"));
const { FACTS_SYSTEM_PROMPT, parseFacts } = await import(join(REPO, "packages/orchestrator/dist/context-budget.js"));

const hash = (s) => createHash("sha256").update(s).digest("hex").slice(0, 12);
// a fixed-seed shuffle: the same run orders the same way
let seed = 20261010;
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);

async function call(model, system, input) {
  const q = query({
    prompt: input,
    options: { ...(companyIsolation() ?? {}), model, systemPrompt: system, effort: "low", tools: [], maxTurns: 2 },
  });
  let served = null;
  for await (const m of q) {
    if (m.type === "assistant" && m.message?.model) served = m.message.model;
    if (m.type === "result") {
      return {
        served,
        subtype: m.subtype,
        is_error: m.is_error,
        text: String(m.result ?? ""),
        duration_ms: m.duration_ms ?? null,
        duration_api_ms: m.duration_api_ms ?? null,
        ttft_ms: m.ttft_ms ?? null,
        tokens_in: (m.usage?.input_tokens ?? 0) + (m.usage?.cache_read_input_tokens ?? 0) + (m.usage?.cache_creation_input_tokens ?? 0),
        tokens_out: m.usage?.output_tokens ?? null,
      };
    }
  }
  return { served, subtype: "no-result", is_error: true, text: "" };
}

const client = new pg.Client({ connectionString: url });
await client.connect();
let inputs;
try {
  const ceo = (
    await client.query(
      `SELECT id::text AS id, content FROM chat_messages
        WHERE role = 'ceo' AND length(content) BETWEEN 10 AND 600
        ORDER BY created_at, id LIMIT $1`,
      [N],
    )
  ).rows.map((r) => ({ job: "memory.classify", id: `chat_messages:${r.id}`, text: r.content }));
  const work = (
    await client.query(
      `SELECT id::text AS id, result::text AS result FROM tasks
        WHERE status = 'done' AND result IS NOT NULL AND length(result::text) > 200
        ORDER BY updated_at DESC, id LIMIT $1`,
      [N],
    )
  ).rows.map((r) => ({ job: "summarize", id: `tasks:${r.id}`, text: r.result.slice(0, SUMMARY_INPUT_CHARS) }));
  inputs = [...ceo, ...work];
} finally {
  await client.end();
}

const items = [];
for (const it of inputs) {
  const system = it.job === "memory.classify" ? CLASSIFY_SYSTEM_PROMPT : FACTS_SYSTEM_PROMPT;
  const order = rand() < 0.5 ? MODELS : [...MODELS].reverse();
  const out = {};
  for (const model of order) {
    const r = await call(model, system, it.text);
    let valid = false;
    let parsed = null;
    try {
      parsed = it.job === "memory.classify" ? parseClassification(r.text) : { facts: parseFacts(r.text) };
      valid = r.subtype === "success" && r.is_error === false;
    } catch {
      valid = false;
    }
    out[model] = { ...r, valid, parsed };
  }
  items.push({ ...it, order, out });
  const a = out[MODELS[0]];
  const b = out[MODELS[1]];
  console.error(`${it.job} ${it.id} haiku ${a.valid ? "ok" : "INVALID"} ${a.duration_api_ms}ms · sonnet ${b.valid ? "ok" : "INVALID"} ${b.duration_api_ms}ms`);
}

const median = (xs) => {
  const v = xs.filter((x) => typeof x === "number").sort((x, y) => x - y);
  return v.length ? v[Math.floor((v.length - 1) / 2)] : null;
};
const summary = {};
for (const job of ["memory.classify", "summarize"]) {
  const js = items.filter((x) => x.job === job);
  const per = {};
  for (const m of MODELS) {
    const rs = js.map((x) => x.out[m]);
    per[m] = {
      n: rs.length,
      valid: rs.filter((r) => r.valid).length,
      served_as_asked: rs.filter((r) => r.served === m).length,
      median_duration_api_ms: median(rs.map((r) => r.duration_api_ms)),
      median_duration_ms: median(rs.map((r) => r.duration_ms)),
      median_ttft_ms: median(rs.map((r) => r.ttft_ms)),
      tokens_in: rs.reduce((s, r) => s + (r.tokens_in ?? 0), 0),
      tokens_out: rs.reduce((s, r) => s + (r.tokens_out ?? 0), 0),
      ...(job === "summarize" ? { facts_total: rs.reduce((s, r) => s + (r.parsed?.facts?.length ?? 0), 0) } : {}),
    };
  }
  const both = js.filter((x) => x.out[MODELS[0]].valid && x.out[MODELS[1]].valid);
  summary[job] = {
    per_model: per,
    both_valid: both.length,
    ...(job === "memory.classify"
      ? { same_answer: both.filter((x) => x.out[MODELS[0]].parsed.store === x.out[MODELS[1]].parsed.store && x.out[MODELS[0]].parsed.kind === x.out[MODELS[1]].parsed.kind).length }
      : {}),
  };
}

const evidence = {
  at: new Date().toISOString(),
  models: MODELS,
  effort: "low",
  path: "Agent SDK under companyIsolation() (the production lanes call LiteLLM, which has no key)",
  agreement_note: "same_answer counts identical answers, not correct ones",
  summary,
  items: items.map((x) => ({
    job: x.job,
    id: x.id,
    input_sha256_12: hash(x.text),
    input_chars: x.text.length,
    order: x.order,
    out: Object.fromEntries(
      MODELS.map((m) => {
        const r = x.out[m];
        return [m, {
          served: r.served, subtype: r.subtype, is_error: r.is_error, valid: r.valid,
          duration_ms: r.duration_ms, duration_api_ms: r.duration_api_ms, ttft_ms: r.ttft_ms,
          tokens_in: r.tokens_in, tokens_out: r.tokens_out,
          ...(x.job === "memory.classify" ? { answer: r.parsed } : { facts: r.parsed?.facts?.length ?? null }),
        }];
      }),
    ),
  })),
};
mkdirSync(dirname(EVIDENCE), { recursive: true });
writeFileSync(EVIDENCE, JSON.stringify(evidence, null, 2) + "\n", "utf8");

const lines = [
  `# Haiku 5.5 ile Sonnet 5.5 — aynı mekanik işler, yan yana (${day})`,
  "",
  "Karar sizin; hiçbir koltuk taşınmadı. \"Aynı cevap\" iki modelin aynı şeyi söylemesidir, doğru olması değil — kimin haklı olduğunu aşağıdaki çiftlerde siz görürsünüz.",
  "",
];
for (const it of items) {
  lines.push(`## ${it.job} · ${it.id}`, "", "**Girdi:**", "", "```", it.text, "```", "");
  for (const m of MODELS) {
    const r = it.out[m];
    lines.push(`**${m}** — ${r.valid ? "geçerli" : "GEÇERSİZ"}, ${r.duration_api_ms ?? "?"} ms:`, "", "```", r.text, "```", "");
  }
}
mkdirSync(dirname(PRIVATE), { recursive: true });
writeFileSync(PRIVATE, lines.join("\n"), "utf8");
console.log(JSON.stringify({ evidence: EVIDENCE, private: PRIVATE, summary }, null, 2));
