import { getDict, type Locale } from "./i18n";

// CEO order 2026-11-22: the personas are removed. The database's old chain is
// not migrated — it leaves with the foundation's rebuild — so it still holds
// the pre-gate's retired check and still words some refusals around a persona.
// What of that chain the dashboard keeps off his screen is said here, once.

/** The hook_policies row of the check the hook loader no longer runs. */
export const RETIRED_HOOK_POLICY_ID = "std.persona_gate";

const OLD_CHAIN_WORDING = /persona/i;

/**
 * A control answer as the screen may show it: a refusal the old chain words
 * around a persona becomes the plain sentence of the reader's locale; every
 * other answer is handed on as it is.
 */
export function inPlainWords<Answer extends { detail?: string }>(
  answer: Answer,
  locale: Locale,
): Answer {
  if (!answer.detail || !OLD_CHAIN_WORDING.test(answer.detail)) return answer;
  return { ...answer, detail: getDict(locale).command.oldRuleRefusal };
}
