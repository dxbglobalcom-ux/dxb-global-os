// One copy of the registrars' CEO-seat call (register-arsenal, register-design-skills,
// register-media-engines): control_library_action under the CEO's claims, in its own
// transaction, with an idempotency key of `<keyPrefix>-<md5 of the payload>`.
import { createHash } from "node:crypto";

/**
 * A ceoAction(client, payload, label) bound to one registrar's key prefix. `stampKey` appends
 * `-<Date.now()>` to the key, so a replay never returns a stored answer (register-design-skills).
 */
export function ceoActionFor({ keyPrefix, stampKey = false }) {
  return async function ceoAction(client, payload, label) {
    const hash = createHash("md5").update(JSON.stringify(payload)).digest("hex");
    const key = stampKey ? `${keyPrefix}-${hash}-${Date.now()}` : `${keyPrefix}-${hash}`;
    await client.query("BEGIN");
    try {
      await client.query(
        `SELECT set_config('request.jwt.claims',
         '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true)`,
      );
      const { rows } = await client.query("SELECT control_library_action($1::jsonb, $2) AS resp", [
        JSON.stringify(payload),
        key,
      ]);
      if (!rows[0].resp.ok) {
        throw new Error(`${label}: ${rows[0].resp.error} ${rows[0].resp.detail ?? ""}`);
      }
      await client.query("COMMIT");
      return rows[0].resp;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    }
  };
}
