// action_type → handler registry. The executor refuses unknown types loudly
// (the tick() lookup throws, the transaction rolls back, the row stays visible).
// Stripe/DocuSign/Gmail handlers do not exist before Phase 11 (master-plan
// LOCKED decision). R2.4 adds the FIRST staging provider handler (audit F-06):
// a sandboxed outward email transaction — staging by name and by target, the
// Phase-11 rule untouched.
import { testWriteFile } from "./test-write-file.js";
import { emailSendStaging } from "./email-send-staging.js";

export type ActionHandler = (payload: unknown, idempotencyKey: string) => Promise<unknown>;

export const handlers: Record<string, ActionHandler> = {
  "test.write_file": testWriteFile,
  "email.send.staging": emailSendStaging,
};
