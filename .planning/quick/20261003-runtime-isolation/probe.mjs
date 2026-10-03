// Evidence for done-list item 4: one real model call with Hamza's lane options as they stood, and one
// with the BUILT `companyIsolation()` spread in — from the residents' working directory. Prints what
// each run loaded (the SDK's init message), the receipt line, and the four construction canaries.
// Run: node .planning/quick/20261003-runtime-isolation/probe.mjs
import { createRequire } from "node:module";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..", "..", "..");
const require = createRequire(join(ROOT, "packages", "kernel", "package.json"));
const { query } = await import(require.resolve("@anthropic-ai/claude-agent-sdk"));
const { companyIsolation, isolationReceipt } = await import(join(ROOT, "packages", "kernel", "dist", "sdk-isolation.js"));

const ASK = [
  "Look ONLY at text you were given before this message (system prompt, project instructions, memory files, session reminders), not general knowledge.",
  'For each phrase answer PRESENT or ABSENT: (1) "anti-baby-sitting" (2) "Hitap protokol" (3) "graphify" (4) "THE CUPBOARD".',
  "One line each, nothing else.",
].join("\n");

async function run(label, isolation) {
  const seen = isolationReceipt(label, (line) => console.log(line));
  const q = query({
    prompt: ASK,
    // Hamza's lane options (chat-drain.ts / answer.ts): tools off, four turns; the model is a probe's
    options: { ...(isolation ?? {}), model: "claude-sonnet-5-5", effort: "low", tools: [], maxTurns: 4, cwd: ROOT, ...(isolation ? {} : { persistSession: false }) },
  });
  for await (const msg of q) {
    seen(msg);
    if (msg.type === "result") console.log(`${label} canaries:`, JSON.stringify(msg.result));
  }
}

console.log("companyIsolation() =", JSON.stringify(companyIsolation()));
await run("before", null);
await run("after", companyIsolation());
