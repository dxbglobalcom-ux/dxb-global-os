#!/usr/bin/env node
// B51 step 3 · B2 — one live call per catalogue model through the company's own runtime; a pass stamps the
// row (fn_model_smoke_passed), and only a stamped model can take seats through the succession door.
//
//   DXB_DATABASE_URL=<the engine whose catalogue is stamped> node scripts/models/smoke.mjs <catalogue-id> …
//
// agent-sdk lane: the company's Agent SDK under companyIsolation(), as every company call runs. A pass is a
// result of subtype success, is_error false, served by the model asked for, answering "OK". Measured
// 2026-10-10: the SDK's CLI 2.1.259 returned its refusal of claude-opus-5-5 as subtype success with is_error
// true and a synthetic served model — the result text alone is not a pass.
// codex-cli lane: the critical gate's own runner (`codex exec` from the company's Codex home), effort low; a
// pass is a verdict the gate's own schema (ChallengerVerdict) accepts — scripts/models/smoke-verdict.mjs.
// Other lanes are not smoked here and are never stamped. The database URL is required, never defaulted: a
// stamp on the wrong engine is a false record. One JSON line per model; exit 1 when any model fails.
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { codexSmokePasses } from "./smoke-verdict.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const ids = process.argv.slice(2);
const url = process.env.DXB_DATABASE_URL;
if (!url || ids.length === 0) {
  console.error("usage: DXB_DATABASE_URL=<engine> node scripts/models/smoke.mjs <catalogue-id> …");
  process.exit(2);
}

const req = createRequire(join(REPO, "packages", "kernel", "package.json"));
const sdkPath = req.resolve("@anthropic-ai/claude-agent-sdk");
const sdkVersion = createRequire(sdkPath)("./package.json").version;
const pg = createRequire(join(REPO, "packages", "shared", "package.json"))("pg");
const { companyIsolation, isolationReceipt } = await import(join(REPO, "packages", "kernel", "dist", "sdk-isolation.js"));

async function smokeSdk(apiModelId) {
  const { query } = await import(sdkPath);
  const receipt = isolationReceipt(`smoke:${apiModelId}`, (line) => console.error(line));
  const q = query({
    prompt: "Reply with the single word OK.",
    options: { ...(companyIsolation() ?? {}), model: apiModelId, tools: [], maxTurns: 2 },
  });
  let served = null;
  let cli = null;
  for await (const m of q) {
    receipt(m);
    if (m.type === "system" && m.subtype === "init") cli = m.claude_code_version ?? null;
    if (m.type === "assistant" && m.message?.model) served = m.message.model;
    if (m.type === "result") {
      const result = String(m.result ?? "");
      const pass = m.subtype === "success" && m.is_error === false && served === apiModelId && /^\s*OK\W*$/i.test(result);
      return { pass, cli, evidence: { sdk: sdkVersion, served, subtype: m.subtype, is_error: m.is_error, result: result.slice(0, 300) } };
    }
  }
  return { pass: false, cli, evidence: { sdk: sdkVersion, served, error: "the stream ended without a result" } };
}

async function smokeCodex(apiModelId) {
  const { codexRunnerWith, ChallengerVerdict } = await import(join(REPO, "packages", "orchestrator", "dist", "critical-gate.js"));
  const runner = codexRunnerWith((line) => console.error(line));
  const prompt =
    "Smoke test of the reviewer seat. Review this one-line change: `const x = 1;` becomes `const x = 2;`. Return your verdict in the required JSON.";
  const res = await runner({ model: apiModelId, prompt, timeoutMs: 180_000, effort: "low" });
  let cli = null;
  try {
    cli = execFileSync("codex", ["--version"], { encoding: "utf8" }).trim();
  } catch {
    cli = null;
  }
  return { pass: codexSmokePasses({ ok: res.ok, raw: res.raw, cli }, ChallengerVerdict), cli, evidence: { ok: res.ok, error: res.error ?? null, raw: String(res.raw ?? "").slice(0, 300) } };
}

const client = new pg.Client({ connectionString: url });
await client.connect();
let failed = 0;
try {
  for (const id of ids) {
    const at = new Date().toISOString();
    const row = (await client.query("SELECT id, lane, status, api_model_id FROM model_catalog WHERE id = $1", [id])).rows[0];
    if (!row || row.status === "retired" || !row.api_model_id) {
      console.log(JSON.stringify({ model: id, at, pass: false, stamped: false, error: row ? `status ${row.status}, api ${row.api_model_id}` : "not in the catalogue" }));
      failed++;
      continue;
    }
    let out;
    try {
      if (row.lane === "agent-sdk") out = await smokeSdk(row.api_model_id);
      else if (row.lane === "codex-cli") out = await smokeCodex(row.api_model_id);
      else out = { pass: false, cli: null, evidence: { error: `lane ${row.lane} is not smoked by this script` } };
    } catch (e) {
      out = { pass: false, cli: null, evidence: { error: e instanceof Error ? e.message : String(e) } };
    }
    let stamp = null;
    if (out.pass) {
      stamp = (await client.query("SELECT fn_model_smoke_passed($1, $2, $3::jsonb) AS r", [id, out.cli, JSON.stringify({ at, lane: row.lane, ...out.evidence })])).rows[0].r;
    }
    if (!out.pass || !stamp?.ok) failed++;
    console.log(JSON.stringify({ model: id, api: row.api_model_id, lane: row.lane, at, pass: out.pass, cli: out.cli, ...out.evidence, stamped: stamp?.ok ?? false, stamp }));
  }
} finally {
  await client.end();
}
process.exit(failed ? 1 : 0);
