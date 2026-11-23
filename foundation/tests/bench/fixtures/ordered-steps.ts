import { it } from "vitest";

export type Step = (name: string, timeoutMs: number, body: () => Promise<void>) => void;

/**
 * The steps of one file's sequence on the real bench, each standing on what the
 * one before it left. Once a step has failed, the later ones fail at once and
 * say which — they do not wait, and they do nothing to a bench in an unknown state.
 */
export function orderedSteps(): Step {
  let failedStep: string | undefined;
  return (name, timeoutMs, body) => {
    it(name, { timeout: timeoutMs }, async () => {
      if (failedStep !== undefined) throw new Error(`not run: the step "${failedStep}" failed before it`);
      failedStep = name; // stays so when the body throws or never comes back
      await body();
      failedStep = undefined;
    });
  };
}
