#!/usr/bin/env node
// dxb — human-only decision CLI (GATE-01). Two live commands + one placeholder:
//   dxb approve <id>
//   dxb reject <id> --note <text>
//   dxb breaker reset          (arrives in 04-04 with the velocity breaker)
// Hand-rolled arg parsing: two commands do not justify a dependency.
import { closeDb } from "@dxb/shared";
import { approve, reject, DecisionError } from "./approve.js";

function usage(): never {
  console.error("usage: dxb approve <id> | dxb reject <id> --note <text> | dxb breaker reset");
  process.exit(2);
}

async function main(): Promise<number> {
  const [cmd, ...rest] = process.argv.slice(2);
  switch (cmd) {
    case "approve": {
      const [id] = rest;
      if (!id) usage();
      const row = await approve(id);
      console.log(`approved ${row.id} (outbox row born by trigger)`);
      return 0;
    }
    case "reject": {
      const [id, flag, ...noteParts] = rest;
      if (!id || flag !== "--note" || noteParts.length === 0) usage();
      const row = await reject(id, noteParts.join(" "));
      console.log(`rejected ${row.id} (note recorded)`);
      return 0;
    }
    case "breaker": {
      if (rest[0] !== "reset") usage();
      console.error("dxb breaker reset arrives in 04-04 (velocity breaker)");
      return 2;
    }
    default:
      usage();
  }
}

try {
  const code = await main();
  await closeDb();
  process.exit(code);
} catch (e) {
  console.error(e instanceof DecisionError ? `error: ${e.message}` : e);
  await closeDb().catch(() => {});
  process.exit(1);
}
