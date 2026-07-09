#!/usr/bin/env node
// dxb — human-only decision CLI (GATE-01 + COST-03) + the KERN-01 front door:
//   dxb intent "<text>"
//   dxb approve <id>
//   dxb reject <id> --note <text>
//   dxb breaker reset --confirm
//   dxb promote <index-id>
// Hand-rolled arg parsing: five commands do not justify a dependency.
import { closeDb } from "@dxb/shared";
import { approve, reject, DecisionError } from "./approve.js";
import { resetBreaker } from "./breaker.js";
import { intent, IntentError } from "./intent.js";
import { killSwitch, realDeps } from "./kill-switch.js";
import { promote, PromoteError } from "./promote.js";

function usage(): never {
  console.error(
    'usage: dxb intent "<text>" | dxb approve <id> | dxb reject <id> --note <text> | dxb breaker reset --confirm | dxb promote <index-id>',
  );
  process.exit(2);
}

async function main(): Promise<number> {
  const [cmd, ...rest] = process.argv.slice(2);
  switch (cmd) {
    case "intent": {
      // Exactly one non-flag argument — the intent text, quoted by the shell.
      const [text, ...extra] = rest;
      if (!text || text.startsWith("-") || extra.length > 0) {
        console.error('intent text required: dxb intent "<one quoted sentence>"');
        process.exit(2);
      }
      const out = await intent(text);
      console.log(
        `classified: task_class=${out.task_class} departments=${out.departments.join(",")} complexity=${out.complexity}`,
      );
      for (const t of out.tasks) {
        console.log(
          `queued ${t.id} dept=${t.department} tier=${t.model_tier} deps=[${t.depends_on.join(",")}]`,
        );
      }
      return 0;
    }
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
    case "promote": {
      const [id, ...extra] = rest;
      if (!id || extra.length > 0) usage();
      const out = await promote(id);
      console.log(
        out.action === "promoted"
          ? `promoted ${out.promoted} to trusted` +
              (out.superseded ? ` (superseded ${out.superseded})` : "") +
              ` — ${out.model}: ${out.reason}`
          : `promotion declined for ${out.promoted} (stays quarantined) — ${out.model}: ${out.reason}`,
      );
      return 0;
    }
    case "kill-switch": {
      const [sub] = rest;
      if (sub !== "on" && sub !== "off" && sub !== "status") usage();
      const r = await killSwitch(sub, realDeps());
      console.log(
        `kill-switch ${r.action}: hard_stopped=${r.hard_stopped} hermes=${r.hermes}; ` +
          `keys ${r.action === "status" ? "blocked" : "changed"}: ${r.keys_changed.join(", ") || "none"}` +
          (r.key_errors.length ? `; errors: ${r.key_errors.join(" | ")}` : ""),
      );
      return r.key_errors.length ? 1 : 0;
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
  console.error(
    e instanceof DecisionError || e instanceof IntentError || e instanceof PromoteError
      ? `error: ${e.message}`
      : e,
  );
  await closeDb().catch(() => {});
  process.exit(1);
}
