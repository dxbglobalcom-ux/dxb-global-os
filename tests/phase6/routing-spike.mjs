// 06-02 routing-quality spike (master PHASE-06 step 2 gate).
// PROMPT CONTRACT: the CLASSIFY_SYSTEM_PROMPT block below is written ONCE here and
// lifted VERBATIM into packages/memory-router/src/classify-read.ts at 06-05.
// Production design exactly: model comes from routing_rules task_class='memory.classify'
// (no model literal in this file), call goes through shared llmCall with department 'os'
// (DXB_LITELLM_KEY_OS), strict JSON parse — a parse failure counts as MISS, never a crash.
// Gate: SCORE >= 16/20 -> exit 0; below -> exit 1 (composition decision returns to Fable, ⛔).
import { readFileSync } from "node:fs";
import { llmCall, getDb, closeDb } from "file:///home/ghost/DxB%20Global%20OS/packages/shared/dist/index.js";

const CLASSIFY_SYSTEM_PROMPT = `You route a memory query to exactly one store. Stores and their contracts:
- pgvector: atomic facts — short factual statements looked up semantically (numbers, ports, settings, single-line truths)
- graphify: entity relations — which component connects to / depends on / gates which; pipelines; links between things
- obsidian: authored artifacts — documents, notes, reports, templates that were written and are retrieved whole
- notebook: research corpus and procedures — how-to steps, research conclusions, long-form investigation material
Kind hints: fact->pgvector, relation->graphify, artifact->obsidian, procedure->notebook.
Reply with STRICT JSON only, no prose, no code fences: {"store":"pgvector"|"graphify"|"obsidian"|"notebook","kind":"fact"|"relation"|"artifact"|"procedure"}`;

const STORES = new Set(["pgvector", "graphify", "obsidian", "notebook"]);

async function classifyRow() {
  const db = getDb();
  const row = await db
    .selectFrom("routing_rules")
    .select(["model", "mode", "effort", "model_tier"])
    .where("task_class", "=", "memory.classify")
    .where("enabled", "=", true)
    .orderBy("priority", "desc")
    .limit(1)
    .executeTakeFirst();
  if (!row) throw new Error("routing_rules has no enabled memory.classify row — seed it first (06-02 Task 1)");
  return row;
}

function strictParse(text) {
  // strict: exactly one JSON object, no fences/prose tolerated beyond surrounding whitespace
  const t = text.trim();
  if (!t.startsWith("{") || !t.endsWith("}")) return null;
  try {
    const o = JSON.parse(t);
    if (typeof o.store !== "string" || !STORES.has(o.store)) return null;
    return o;
  } catch {
    return null;
  }
}

const fixture = JSON.parse(readFileSync(new URL("./fixtures/known-facts.json", import.meta.url), "utf8"));
const rule = await classifyRow();
console.log(`rule: task_class=memory.classify model=${rule.model} mode=${rule.mode} effort=${rule.effort} tier=${rule.model_tier}`);

let hits = 0;
const results = [];
for (const q of fixture) {
  let got = "PARSE_FAIL";
  try {
    const res = await llmCall({
      department: "os",
      model: rule.model,
      // max_tokens >= 200: the classifier model spends reasoning tokens before content (06-01 pitfall, litellm.md card)
      maxTokens: 400,
      messages: [
        { role: "system", content: CLASSIFY_SYSTEM_PROMPT },
        { role: "user", content: q.question },
      ],
    });
    const parsed = strictParse(res.content);
    got = parsed ? parsed.store : "PARSE_FAIL";
  } catch (e) {
    got = `CALL_FAIL(${String(e.message).slice(0, 40)})`;
  }
  const ok = got === q.correct_store;
  if (ok) hits += 1;
  results.push({ id: q.id, want: q.correct_store, got, ok });
  console.log(`Q${q.id} want=${q.correct_store} got=${got} ${ok ? "OK" : "MISS"}`);
}

console.log(`SCORE=${hits}/20`);
await closeDb?.();
process.exit(hits >= 16 ? 0 : 1);
