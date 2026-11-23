// A run in a process of its own, started by path by fixtures/command.ts: what
// a case uses when the thing it tests is the environment a run is started in.
// Its words are the target's address, the target's list file, the root and —
// when the case asks one — a question. It prints one line of JSON: how the run
// ended, and what a session this process opened with no care taken — the
// driver left to itself — answered to the question. That answer is how a case
// sees that the variables it planted do reach a session nobody guards.
import { Client } from "pg";
import { applyChain } from "@dxb-foundation/chain";
import type { RanApart } from "./command.ts";

const [connectionString, statePath, root, asked] = process.argv.slice(2);
if (!connectionString || !statePath || !root) throw new Error("three words, or four: <address> <list file> <root> [<question>]");

async function answeredByAPlainSession(question: string): Promise<Record<string, unknown>> {
  const plain = new Client({ connectionString });
  await plain.connect();
  try {
    const { rows } = await plain.query(question);
    return rows[0] ?? {};
  } finally {
    await plain.end();
  }
}

const outcome = await applyChain({ target: { connectionString, statePath }, root });
const ran: RanApart = asked === undefined ? { outcome } : { outcome, aPlainSessionAnswered: await answeredByAPlainSession(asked) };
console.log(JSON.stringify(ran));
