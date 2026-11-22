import { expect } from "vitest";
import { TargetRefused } from "@dxb-foundation/bench";

/** The refusal a guarded call ends in; fails the test when the call ends any other way. */
export async function refusalOf(call: Promise<unknown>): Promise<TargetRefused> {
  const outcome = await call.then(
    (value) => ({ resolved: value }),
    (error: unknown) => error,
  );
  expect(outcome).toBeInstanceOf(TargetRefused);
  return outcome as TargetRefused;
}
