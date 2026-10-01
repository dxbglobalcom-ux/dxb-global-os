// The drift review: a tool's approved text against its live text, and a verdict the pin check acts on
// (CEO 2026-10-01: a tool must not be locked needlessly again, and he must hear when one is).
//
// Deterministic on purpose — no model call, no network: a model asked to judge an untrusted tool text
// can be steered by that very text, and the pin check's contract is that the same input always gives
// the same answer. The rules look at what the change ADDED. A phrase, address or word the approved text
// already carried is not news; one the live text brings for the first time is. When there is no
// approved text to compare against, everything in the live text counts as added.
//
// The known limit, said once: a keyword rule can be phrased around by someone who sets out to. What
// bounds that is the direction of every doubt — a rule that fires locks the tool and raises a high
// alert; nothing here can approve a tool a rule fired on.

export interface ToolText {
  description: string;
  inputSchema: unknown;
}

export interface DriftVerdict {
  verdict: "clean" | "suspect";
  /** Names of the rules that fired; empty when clean. */
  rules: string[];
  /** A short, human-readable account of the change (for the audit row and the alert). */
  summary: string[];
}

// Zero-width, bidirectional-override and control characters (tab, LF and CR are ordinary text).
const HIDDEN = new RegExp(
  "[\\u200B-\\u200F\\u2028\\u2029\\u202A-\\u202E\\u2060-\\u2064\\u2066-\\u2069\\uFEFF\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F]",
  "u",
);

// Text aimed at the model reading the tool list rather than describing the tool.
const INSTRUCTION =
  /\b(?:ignore|disregard|forget|override)\s+(?:all\s+|any\s+|the\s+)?(?:previous|prior|above|earlier|other)\b|\byou\s+(?:must|should\s+always|are\s+required\s+to)\b|\balways\s+(?:call|use|send|include|run|pass|forward)\b|\bnever\s+(?:reveal|tell|mention|disclose|inform)\b|\bdo\s+not\s+(?:tell|inform|mention|reveal|disclose)\b|\bwithout\s+(?:telling|informing|asking|notifying)\b|\bsystem\s+prompt\b|<\/?\s*(?:system|instructions?|important|secret)\s*>|\binstructions?\b|\bbefore\s+(?:using|calling)\s+(?:this|any|another|other)\s+tools?\b|\bnote\s+to\s+(?:the\s+)?(?:assistant|ai|model|agent)\b|\bas\s+an\s+ai\b/giu;

// Network addresses: URLs, bare domains with a common top-level domain, and IPv4 addresses.
const ADDRESS =
  /\b[a-z][a-z0-9+.-]*:\/\/[^\s"'<>`)\]]+|\b(?:[a-z0-9-]+\.)+(?:com|net|org|io|ai|dev|app|co|xyz|ru|cn|me|info|biz|site|online|top|sh|gg|ly|to)\b|\b\d{1,3}(?:\.\d{1,3}){3}\b/giu;

// Words that name something a tool should not quietly start asking for or sending.
const SENSITIVE =
  /\b(?:\.?env|ssh|credentials?|secrets?|tokens?|api[ _-]?keys?|passwords?|passwd|cookies?|private[ _-]?keys?|wallets?|seed\s+phrase|keychain|keyring|session[ _-]?ids?)\b/giu;

// A parameter whose name says it carries data somewhere else.
const OUTBOUND_PARAM = /(?:url|uri|endpoint|webhook|callback|upload|post|forward|send|remote|host|server|destination|target|exfil)/iu;

/** How much a description may grow in one change before the growth itself is a finding. */
const GROWTH_FLOOR = 1500;

/** Every string in a value, depth-first (descriptions inside an input schema count as text). */
function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) strings(v, out);
  else if (value !== null && typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out.push(k);
      strings(v, out);
    }
  }
  return out;
}

/** Every property name declared anywhere in a JSON schema (nested objects and array items included). */
function paramNames(schema: unknown, out = new Set<string>()): Set<string> {
  if (Array.isArray(schema)) for (const v of schema) paramNames(v, out);
  else if (schema !== null && typeof schema === "object") {
    const obj = schema as Record<string, unknown>;
    const props = obj.properties;
    if (props !== null && typeof props === "object" && !Array.isArray(props)) {
      for (const name of Object.keys(props as Record<string, unknown>)) out.add(name);
    }
    for (const v of Object.values(obj)) paramNames(v, out);
  }
  return out;
}

function counts(text: string, re: RegExp): Map<string, number> {
  const m = new Map<string, number>();
  for (const hit of text.matchAll(re)) {
    const k = hit[0].toLowerCase().replace(/\s+/g, " ");
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return m;
}

/** What `after` holds more of than `before` — the additions. */
function added(before: Map<string, number>, after: Map<string, number>): string[] {
  const out: string[] = [];
  for (const [k, n] of after) if (n > (before.get(k) ?? 0)) out.push(k);
  return out;
}

const clip = (s: string, n = 160) => (s.length > n ? `${s.slice(0, n)}…` : s);

/** The sentences of the live description that the approved description did not have. */
function addedSentences(before: string, after: string): string[] {
  const split = (s: string) =>
    s.split(/(?<=[.!?:])\s+|\n+/u).map((x) => x.trim()).filter((x) => x.length > 0);
  const old = new Set(split(before));
  return split(after).filter((x) => !old.has(x));
}

export function classifyDrift(approved: ToolText | null, live: ToolText): DriftVerdict {
  const rules: string[] = [];
  const summary: string[] = [];
  const before = approved ? strings(approved.description).concat(strings(approved.inputSchema)).join("\n") : "";
  const after = strings(live.description).concat(strings(live.inputSchema)).join("\n");

  if (!approved) summary.push("no approved text was stored for this tool; the whole live text is judged");

  if (HIDDEN.test(after)) rules.push("hidden-characters");

  const instr = added(counts(before, INSTRUCTION), counts(after, INSTRUCTION));
  if (instr.length) {
    rules.push("reader-instruction");
    summary.push(`new instruction-like text: ${instr.slice(0, 5).join(", ")}`);
  }

  const addr = added(counts(before, ADDRESS), counts(after, ADDRESS));
  if (addr.length) {
    rules.push("new-address");
    summary.push(`new address: ${addr.slice(0, 5).map((a) => clip(a, 80)).join(", ")}`);
  }

  const sens = added(counts(before, SENSITIVE), counts(after, SENSITIVE));
  if (sens.length) {
    rules.push("new-sensitive-word");
    summary.push(`new sensitive word: ${sens.slice(0, 5).join(", ")}`);
  }

  const oldParams = approved ? paramNames(approved.inputSchema) : new Set<string>();
  const newParams = [...paramNames(live.inputSchema)].filter((p) => !oldParams.has(p));
  const goneParams = [...oldParams].filter((p) => !paramNames(live.inputSchema).has(p));
  if (newParams.length) summary.push(`new parameters: ${newParams.slice(0, 10).join(", ")}`);
  if (goneParams.length) summary.push(`removed parameters: ${goneParams.slice(0, 10).join(", ")}`);
  const outbound = newParams.filter((p) => OUTBOUND_PARAM.test(p));
  if (outbound.length) {
    rules.push("new-outbound-parameter");
    summary.push(`new parameter that can carry data out: ${outbound.join(", ")}`);
  }

  const oldLen = approved ? approved.description.length : 0;
  const growth = live.description.length - oldLen;
  if (approved && growth > Math.max(GROWTH_FLOOR, oldLen)) {
    rules.push("description-growth");
    summary.push(`description grew from ${oldLen} to ${live.description.length} characters`);
  }

  if (approved) {
    const sentences = addedSentences(approved.description, live.description);
    for (const s of sentences.slice(0, 3)) summary.push(`added: "${clip(s)}"`);
    if (sentences.length > 3) summary.push(`… and ${sentences.length - 3} more added sentences`);
  }

  return { verdict: rules.length ? "suspect" : "clean", rules, summary };
}
