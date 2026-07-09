// dxb kill-switch on|off|status — the one command that halts every autonomous
// spender (07-06, master LOCKED decision): budget_state.hard_stopped + every
// LiteLLM virtual key blocked + hermes systemd unit stopped. Both directions
// are audited (T-07-22); `status` reports each effect INDEPENDENTLY so a
// half-applied switch is visible, not hidden (T-07-23). Reachability: until
// the Phase-8 dashboard/phone surface, SSH + this CLI is the access path.
// Deps seam: LiteLLM + systemctl are injectable so the decision/audit path is
// testable deterministically; live halves are proven on the VPS (07-06 T3).
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { sql, type Kysely } from "kysely";
import { getDb, keyUpdate, listDxbKeys, type DB } from "@dxb/shared";

const execFileP = promisify(execFile);

export interface KillSwitchDeps {
  db: Kysely<DB>;
  listKeys: () => Promise<Array<{ token: string; key_alias: string; blocked?: boolean | null }>>;
  setKeyBlocked: (token: string, blocked: boolean) => Promise<void>;
  systemctl: (action: "stop" | "start" | "is-active") => Promise<string>;
  /** hermes unit control is skipped when the unit isn't installed (local dev). */
}

export interface KillSwitchResult {
  action: "on" | "off" | "status";
  hard_stopped: boolean;
  keys_changed: string[];
  key_errors: string[];
  hermes: string;
}

export function realDeps(): KillSwitchDeps {
  return {
    db: getDb(),
    listKeys: () => listDxbKeys(),
    setKeyBlocked: (token, blocked) => keyUpdate({ key: token, blocked }),
    systemctl: async (action) => {
      try {
        const { stdout } = await execFileP("sudo", ["systemctl", action, "hermes"]);
        return action === "is-active" ? stdout.trim() : "ok";
      } catch (e) {
        // is-active exits non-zero for inactive units — that IS the answer.
        const out = (e as { stdout?: string }).stdout?.trim();
        if (action === "is-active" && out) return out;
        throw e;
      }
    },
  };
}

export async function killSwitch(
  action: "on" | "off" | "status",
  deps: KillSwitchDeps,
): Promise<KillSwitchResult> {
  const { db } = deps;
  const result: KillSwitchResult = {
    action,
    hard_stopped: false,
    keys_changed: [],
    key_errors: [],
    hermes: "unknown",
  };

  if (action === "status") {
    const state = await db.selectFrom("budget_state").selectAll().executeTakeFirstOrThrow();
    result.hard_stopped = state.hard_stopped;
    try {
      const keys = await deps.listKeys();
      result.keys_changed = keys.filter((k) => k.blocked === true).map((k) => k.key_alias);
    } catch (e) {
      result.key_errors.push(`key listing failed: ${String(e).slice(0, 200)}`);
    }
    result.hermes = await deps.systemctl("is-active").catch((e) => `error: ${String(e).slice(0, 80)}`);
    return result;
  }

  const engaging = action === "on";
  await db
    .updateTable("budget_state")
    .set({ hard_stopped: engaging, updated_at: sql`now()` })
    .execute();
  result.hard_stopped = engaging;

  try {
    for (const key of await deps.listKeys()) {
      if (key.blocked === engaging) continue; // already in target state
      try {
        await deps.setKeyBlocked(key.token, engaging);
        result.keys_changed.push(key.key_alias);
      } catch (e) {
        result.key_errors.push(`${key.key_alias}: ${String(e).slice(0, 200)}`);
      }
    }
  } catch (e) {
    result.key_errors.push(`key listing failed: ${String(e).slice(0, 200)}`);
  }

  result.hermes = await deps
    .systemctl(engaging ? "stop" : "start")
    .then(() => (engaging ? "stopped" : "started"))
    .catch((e) => `error: ${String(e).slice(0, 120)}`);

  await db
    .insertInto("audit_log")
    .values({
      actor: "ceo:cli",
      actor_type: "ceo",
      action: engaging ? "kill_switch.on" : "kill_switch.off",
      task_id: null,
      payload: JSON.stringify(result),
    })
    .execute();

  return result;
}
