// What a company run writes into the Claude home while it runs (2026-10-03, after lanes-probe.mjs saw
// ~/.claude.json change during the probe): one tool-less call with companyIsolation(), in the
// scheduler's own shape. While it answers, the peer registry (~/.claude/sessions/*.json) is searched
// for its session id; around it, ~/.claude.json is compared key by key — paths and kinds only, no
// values (the file holds the account's identity). Run through systemd-run like lanes-probe.mjs.
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..", "..", "..");
const require = createRequire(join(ROOT, "packages", "kernel", "package.json"));
const { query } = await import(require.resolve("@anthropic-ai/claude-agent-sdk"));
const { companyIsolation, isolationReceipt } = await import(join(ROOT, "packages", "kernel", "dist", "sdk-isolation.js"));

const CONFIG = join(homedir(), ".claude.json");
const SESSIONS = join(homedir(), ".claude", "sessions");
const flat = (o, at = "", out = new Map()) => {
  if (o && typeof o === "object" && !Array.isArray(o)) for (const [k, v] of Object.entries(o)) flat(v, at ? `${at}.${k}` : k, out);
  else out.set(at, JSON.stringify(o));
  return out;
};
const read = () => flat(JSON.parse(readFileSync(CONFIG, "utf8")));
const registry = () =>
  readdirSync(SESSIONS)
    .filter((f) => f.endsWith(".json"))
    .map((f) => ({ f, text: readFileSync(join(SESSIONS, f), "utf8") }));

const before = read();
const seen = isolationReceipt("footprint");
const q = query({
  prompt: "Reply with the single word: ok",
  options: { ...companyIsolation(), model: "claude-sonnet-5", effort: "low", tools: [], maxTurns: 2 },
});
let id = null;
for await (const m of q) {
  seen(m);
  if (m.type === "system" && m.subtype === "init") {
    id = m.session_id;
    const hits = registry().filter((r) => r.text.includes(id));
    console.log(`while running: peer-registry files holding this run's session id = ${hits.length}${hits.length ? ` (${hits.map((h) => h.f)})` : ""}`);
  }
}
await new Promise((r) => setTimeout(r, 1500)); // the CLI writes its config on exit
const after = read();
const changed = [...new Set([...before.keys(), ...after.keys()])].filter((k) => before.get(k) !== after.get(k));
console.log(`~/.claude.json paths changed around the run: ${changed.length}`);
for (const k of changed) console.log(`  ${k}: ${before.has(k) ? "changed" : "added"}${after.get(k)?.includes(id) ? " (holds this run's session id)" : ""}`);
console.log(`after exit: peer-registry files holding it = ${registry().filter((r) => r.text.includes(id)).length}`);
console.log("PROBE_DONE");
