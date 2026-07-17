// R2.4 — the FIRST staging provider handler (audit F-06): a real outward
// email transaction against a sandbox SMTP provider (Mailpit) — no money, no
// real customers, no external network. The Phase-11 LOCKED rule stands: real
// Gmail/Stripe/DocuSign handlers do not exist before Phase 11; this handler
// is staging-only by NAME and by TARGET (the provider URL points at the
// sandbox container and lives ONLY in the executor's env — F-06 step 7).
//
// Provider-side idempotency (F-06 step 5): the outbox idempotency_key rides
// the message as a Mailpit tag; a re-fired handler finds the tag and returns
// the EXISTING message id instead of sending again — the external transaction
// happens at most once per key.
import { z } from "zod";

const Payload = z.object({
  to: z.string().email(),
  subject: z.string().min(1).max(200),
  text: z.string().min(1).max(10_000),
});

const FROM = "os@dxb-staging.local";

function baseUrl(): string {
  // Executor-side credential surface ONLY (F-06 step 7): agents never see
  // this env; the gateway profiles carry no mail capability.
  return process.env.DXB_STAGING_MAIL_URL ?? "http://127.0.0.1:8025";
}

/** Mailpit tags: keep [a-z0-9-] so `tag:` search stays exact. */
function tagFor(idempotencyKey: string): string {
  return idempotencyKey.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 100);
}

export async function emailSendStaging(
  payload: unknown,
  idempotencyKey: string,
): Promise<unknown> {
  const p = Payload.parse(payload);
  const tag = tagFor(idempotencyKey);

  // Step 5 — at-most-once against the provider: an existing tagged message
  // means a previous attempt already sent; return its ref, send nothing.
  const search = await fetch(
    `${baseUrl()}/api/v1/search?query=${encodeURIComponent(`tag:${tag}`)}`,
  );
  if (!search.ok) {
    throw new Error(`staging mail provider unreachable (search ${search.status})`);
  }
  const found = (await search.json()) as {
    messages_count: number;
    messages?: { ID: string }[];
  };
  if (found.messages_count > 0 && found.messages?.[0]) {
    return {
      provider: "mailpit-staging",
      message_id: found.messages[0].ID,
      replayed: true, // external transaction NOT repeated
    };
  }

  const res = await fetch(`${baseUrl()}/api/v1/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      From: { Email: FROM },
      To: [{ Email: p.to }],
      Subject: p.subject,
      Text: p.text,
      Tags: [tag],
    }),
  });
  if (!res.ok) {
    throw new Error(`staging mail send failed (${res.status}): ${await res.text()}`);
  }
  const sent = (await res.json()) as { ID: string };
  // The provider response ref lands in outbox.execution_result and the
  // outbox.executed audit row (F-06 step 6) via the LOCKED tick loop.
  return { provider: "mailpit-staging", message_id: sent.ID, replayed: false };
}
