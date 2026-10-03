#!/usr/bin/env node
// Sums message.usage over a Claude Code transcript (JSONL), one row per assistant message id.
// "new" = uncached input + cache writes + output — the tokens the weekly quota is fitted on.
// Usage: node usage.mjs <transcript.jsonl> [--from ISO] [--to ISO]
import { readFileSync } from "node:fs";

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
const models = new Set();
for (const { u, model } of seen.values()) {
  s.calls++;
  s.input += u.input_tokens ?? 0;
  s.cacheWrite += u.cache_creation_input_tokens ?? 0;
  s.cacheRead += u.cache_read_input_tokens ?? 0;
  s.output += u.output_tokens ?? 0;
  if (model) models.add(model);
}
const minutes = first && last ? ((Date.parse(last) - Date.parse(first)) / 60000).toFixed(1) : "?";
console.log(JSON.stringify({ file: file.split("/").pop(), lines, bad, first, last, minutes, models: [...models],
  ...s, new: s.input + s.cacheWrite + s.output }));
