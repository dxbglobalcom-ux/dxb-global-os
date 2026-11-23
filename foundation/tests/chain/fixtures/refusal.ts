/**
 * The refusal of one kind that a call ends in — thrown at once or by its promise.
 * Anything else the call ends in fails the case as itself: another error is
 * thrown on as it is, so a case is red by what really happened.
 */
export async function refusalOf<Refusal extends Error>(kind: abstract new (...given: never[]) => Refusal, call: () => unknown): Promise<Refusal> {
  let answered: unknown;
  try {
    answered = await call();
  } catch (failure) {
    if (failure instanceof kind) return failure;
    throw failure;
  }
  throw new Error(`the call was not refused: it answered ${JSON.stringify(answered)}`);
}
