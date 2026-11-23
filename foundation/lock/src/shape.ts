// What a value read from a file is seen to be before it is believed: the lock files and the result share these.

export const isText = (value: unknown): value is string => typeof value === "string";
export const isTexts = (value: unknown): value is string[] => Array.isArray(value) && value.every(isText);
export const isNumber = (value: unknown): value is number => typeof value === "number";
export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** A list whose every member is an object that `isOne` accepts. */
export const isListOf = (value: unknown, isOne: (one: Record<string, unknown>) => boolean): value is Record<string, unknown>[] =>
  Array.isArray(value) && value.every((one) => isObject(one) && isOne(one));

/** What a JSON text spells, or undefined when it is not JSON. */
export function readJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}
