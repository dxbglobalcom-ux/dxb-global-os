#!/usr/bin/env node
// Prints the tokens of a Claude Code transcript (JSONL) and their list-price cost, one row per assistant
// message id. Each row's usage.iterations (else [usage]) is walked: type "message" (or none) is the
// executor's, priced at message.model; any other type (advisor_message) is the advisor's, at its own model.
// calls/input/cacheWrite/cacheRead/output count the executor only; "advisor" sums the advisor iterations.
// "new" = uncached input + cache writes + output — the tokens the weekly quota is fitted on.
// "usd" = executor + advisor at list price; "unpriced" = tokens of a model with no PRICES row (not guessed).
// Usage: node usage.mjs <transcript.jsonl> [--from ISO] [--to ISO]
import { readFileSync } from "node:fs";

// USD per million tokens — claude-api skill bundled with Claude Code 2.1.288, read 2026-10-04
const PRICES = {
  "claude-opus-5-5": { input: 4, w5m: 5, w1h: 8, read: 0.2, output: 20 },
  "claude-fable-5-1": { input: 10, w5m: 12.5, w1h: 20, read: 0.25, output: 50 },
  "claude-sonnet-5": { input: 2, w5m: 2.5, w1h: 4, read: 0.2, output: 10 },
  "claude-sonnet-5-5": { input: 2, w5m: 2.5, w1h: 4, read: 0.2, output: 10 },
};

const [file, ...rest] = process.argv.slice(2);
const opt = (k) => { const i = rest.indexOf(k); return i >= 0 ? rest[i + 1] : undefined; };
const from = opt("--from"), to = opt("--to");
const seen = new Map();
let first, last, lines = 0, bad = 0;
for (const line of readFileSync(file, "utf8").split("\n")) {
  if (!line.trim()) continue;
  lines++;
  let e;
  try { e = JSON.parse(line); } catch { bad++; continue; }
  const ts = e.timestamp;
  if (ts && from && ts < from) continue;
  if (ts && to && ts > to) continue;
  if (ts) { if (!first || ts < first) first = ts; if (!last || ts > last) last = ts; }
  const m = e.message;
  if (e.type !== "assistant" || !m?.usage) continue;
  seen.set(m.id ?? `${ts}-${seen.size}`, { u: m.usage, model: m.model });
}
const s = { calls: 0, input: 0, cacheWrite: 0, cacheRead: 0, output: 0 };
const a = { calls: 0, input: 0, cacheWrite: 0, cacheRead: 0, output: 0, models: [] };
const models = new Set();
const unpriced = {};
let usd = 0;
const add = (t, it) => {
  t.input += it.input_tokens ?? 0;
  t.cacheWrite += it.cache_creation_input_tokens ?? 0;
  t.cacheRead += it.cache_read_input_tokens ?? 0;
  t.output += it.output_tokens ?? 0;
};
// cache writes split 5-minute / 1-hour when the split is present, else all at the 1-hour rate (cost.py)
const price = (it, model) => {
  const w = it.cache_creation_input_tokens ?? 0, c = it.cache_creation;
  const p = PRICES[model];
  if (!p) {
    const n = (it.input_tokens ?? 0) + w + (it.cache_read_input_tokens ?? 0) + (it.output_tokens ?? 0);
    if (n) unpriced[model] = (unpriced[model] ?? 0) + n;
    return;
  }
  const w5 = c ? c.ephemeral_5m_input_tokens ?? 0 : 0, w1 = c ? c.ephemeral_1h_input_tokens ?? 0 : w;
  usd += ((it.input_tokens ?? 0) * p.input + w5 * p.w5m + w1 * p.w1h
    + (it.cache_read_input_tokens ?? 0) * p.read + (it.output_tokens ?? 0) * p.output) / 1e6;
};
for (const { u, model } of seen.values()) {
  s.calls++;
  if (model) models.add(model);
  for (const it of Array.isArray(u.iterations) && u.iterations.length ? u.iterations : [u]) {
    if (it.type == null || it.type === "message") { add(s, it); price(it, model); continue; }
    a.calls++;
    add(a, it);
    if (!a.models.includes(it.model)) a.models.push(it.model);
    price(it, it.model);
  }
}
const minutes = first && last ? ((Date.parse(last) - Date.parse(first)) / 60000).toFixed(1) : "?";
console.log(JSON.stringify({ file: file.split("/").pop(), lines, bad, first, last, minutes, models: [...models],
  ...s, new: s.input + s.cacheWrite + s.output, advisor: a, usd: Math.round(usd * 100) / 100, unpriced }));
