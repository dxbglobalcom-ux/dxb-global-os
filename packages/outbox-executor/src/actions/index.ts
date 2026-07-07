// action_type → handler registry. The executor refuses unknown types loudly
// (the tick() lookup throws, the transaction rolls back, the row stays visible).
// v1 ships ONLY the harmless proof handler; Stripe/DocuSign/Gmail handlers do
// not exist before Phase 11 (master-plan LOCKED decision).
import { testWriteFile } from "./test-write-file.js";

export type ActionHandler = (payload: unknown, idempotencyKey: string) => Promise<unknown>;

export const handlers: Record<string, ActionHandler> = {
  "test.write_file": testWriteFile,
};
