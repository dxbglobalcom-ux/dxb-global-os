// Sol's A on this job (2026-10-04): prove the disclosure is in Hamza's REAL answer — the chat lane's
// own drain and model, a question that does not depend on memory, and a recall that fails. Run through
// run-lanes-probe.sh (the resident's shape, the construction engine). The thread is removed at the end.
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..", "..", "..");
const fail = (why) => {
  console.log(`PROBE_ABORT ${why}`);
  process.exit(2);
};
const dbUrl = new URL(process.env.DXB_DATABASE_URL ?? "postgresql://x@nowhere:1/x");
if (dbUrl.port !== "54422") fail(`DXB_DATABASE_URL is not the construction engine (port ${dbUrl.port})`);
if (process.env.DXB_COMPANY_DATABASE_URL) fail("DXB_COMPANY_DATABASE_URL is set — the company must not be reachable");

const dist = (pkg, file) => join(ROOT, "packages", pkg, "dist", file);
const { getDb } = await import(dist("shared", "index.js"));
const { drainChatMessages } = await import(dist("orchestrator", "chat-drain.js"));

const receipts = [];
const log = console.log.bind(console);
console.log = (...a) => {
  const line = a.map(String).join(" ");
  if (line.startsWith("[isolation]")) receipts.push(line);
  log(...a);
};
const warned = [];
console.warn = (...a) => {
  warned.push(a.map(String).join(" "));
};

const db = getDb();
const pending = await db.selectFrom("chat_messages").select("id").where("role", "=", "ceo").where("status", "=", "pending").execute();
if (pending.length > 0) fail(`${pending.length} pending CEO messages already in the construction engine`);

const question = "Merhaba Hamza, bugün haftanın hangi günü?";
const session = await db.insertInto("chat_sessions").values({ title: "memory-unreachable probe 2026-10-04" }).returning("id").executeTakeFirstOrThrow();
await db.insertInto("chat_messages").values({ role: "ceo", content: question, session_id: session.id }).execute();
const drained = await drainChatMessages({
  db,
  recall: async () => {
    throw new Error("note-store unreachable (probe)");
  },
});
const reply = await db
  .selectFrom("chat_messages")
  .select(["content"])
  .where("session_id", "=", session.id)
  .where("role", "=", "hamza")
  .executeTakeFirst();
console.log(`chat lane: drain=${JSON.stringify(drained)}`);
console.log(`the CEO asked: ${JSON.stringify(question)}`);
console.log(`Hamza answered: ${JSON.stringify(reply?.content ?? null)}`);
console.log(`journal line: ${JSON.stringify(warned.find((w) => w.startsWith("[memory]")) ?? null)}`);
const said = /not(lar)?[ıi]m|hafıza/i.test(reply?.content ?? "");
console.log(said ? "ANSWER_SAYS_IT=yes" : "ANSWER_SAYS_IT=no");

await db.deleteFrom("chat_messages").where("session_id", "=", session.id).execute();
await db.deleteFrom("chat_sessions").where("id", "=", session.id).execute();
console.log(`SESSIONS ${receipts.map((r) => r.match(/session=(\S+)/)?.[1]).join(" ")}`);
await db.destroy();
console.log("PROBE_DONE");
if (!said) process.exit(1);
