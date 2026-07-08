#!/usr/bin/env node
// dxb — human-only decision CLI (GATE-01 + COST-03). Three live commands:
//   dxb approve <id>
//   dxb reject <id> --note <text>
//   dxb breaker reset --confirm
// Hand-rolled arg parsing: three commands do not justify a dependency.
import { closeDb } from "@dxb/shared";
import { approve, reject, DecisionError } from "./approve.js";
import { resetBreaker } from "./breaker.js";

function usage(): never {
  console.error(
    "usage: dxb approve <id> | dxb reject <id> --note <text> | dxb breaker reset --confirm",
  );
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
      const result = await resetBreaker({ confirm: rest.includes("--confirm") });
      console.log(
        `breaker reset (was_tripped=${result.was_tripped}); ` +
          `unblocked: ${result.unblocked_aliases.join(", ") || "none"}` +
          (result.unblock_errors.length ? `; errors: ${result.unblock_errors.join(" | ")}` : ""),
      );
      return result.unblock_errors.length ? 1 : 0;
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
