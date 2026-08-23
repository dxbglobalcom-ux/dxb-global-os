/**
 * generated-workforce — the construction site's people, invented here.
 *
 * B36 Block 2, and the independent auditor's third FAIL on it (2026-08-23):
 *
 *   "The seed must not copy the real persona and employee-record entries; it
 *    must generate entirely synthetic data."
 *
 * He was right, and it was the biggest of the three: measured before this file
 * existed, 199 of 199 persona bodies on the construction engine were a dossier
 * file byte for byte, and 975 sicil field values were the CEO's own words. The
 * approved plan says what the construction database must hold — "a complete but
 * entirely fictional holding … and not one row of his" (PLAN.md:222) — and a
 * verbatim copy of 199 authored dossiers is the opposite of that.
 *
 * WHAT TRAVELS AND WHAT DOES NOT.
 *
 *   travels      the SLUG, the department, the role level. These arrive through
 *                db/migrations — the same chain a deploy runs — and the E12.5
 *                workforce gate holds 67 of those slugs to account by name. A
 *                slug is a key, not a record: `cfo` names a seat, it does not
 *                repeat a word the CEO wrote.
 *   never        the authored persona body, the sicil entries, the dossier's
 *                own title. Those are what he had written, and they are what
 *                this file replaces with fiction.
 *
 * EVERYTHING HERE IS DETERMINISTIC. The same slug produces the same document,
 * character for character, on every run and on every machine — otherwise the
 * seed would open a fresh persona version every time it ran, and an earlier
 * draft of the seed left 796 versions of 199 people behind exactly that way.
 * Nothing is drawn from a clock or a random number.
 */

export interface Seat {
  slug: string;
  department: string | null;
  role_level: string | null;
}

/**
 * A small, stable hash. FNV-1a — chosen because it is short and has no state.
 * Exported because `generated-holding-core.ts` invents the company and its
 * projects from the same two primitives: one fixture, one vocabulary, one rule.
 */
export function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

export const pick = <T>(from: readonly T[], slug: string, salt: string): T =>
  from[hash(`${salt}:${slug}`) % from.length];

/**
 * THE SEAT'S TITLE, INVENTED — and why it is not merely derived from the slug.
 *
 * It was, until the last code review of 2026-08-23. Title-casing the key looks
 * synthetic and is not: measured against the 113 dossiers that carry a Title
 * row, **12 of them came out byte for byte identical** to what the CEO's own
 * dossier says — `head-of-commerce` → "Head of Commerce", `sales-coach` →
 * "Sales Coach". A generator that reproduces his wording 12 times has not
 * generated anything.
 *
 * So the title is built from a fixture vocabulary instead: a place, a craft and
 * the seat's RANK, which is the one real thing in it (`role_level` is a
 * structural key the org tree and the gates read). English and Turkish are
 * indexed by the SAME two salts, so the pair belongs together instead of being
 * two unrelated inventions — the `_tr` column is a CEO-visible surface and must
 * be whole Turkish, not a half-translated string.
 *
 * 8 places × 8 crafts × 4 ranks = 256 titles for 205 seats.
 */
const PLACE_EN = ["Blue Harbour", "Long Bridge", "North Field", "Still Water", "Open Yard", "Grey Gate", "Low Meadow", "Old Quarry"] as const;
const PLACE_TR = ["Mavi Liman", "Uzun Köprü", "Kuzey Tarla", "Durgun Su", "Açık Avlu", "Gri Kapı", "Alçak Çayır", "Eski Ocak"] as const;
const CRAFT_EN = ["Operations", "Delivery", "Records", "Intake", "Assembly", "Signals", "Ledger", "Rotation"] as const;
const CRAFT_TR = ["Operasyon", "Teslimat", "Kayıt", "Kabul", "Montaj", "Sinyal", "Defter", "Nöbet"] as const;
const RANK: Record<string, readonly [string, string]> = {
  orchestrator: ["Orchestrator", "Orkestratörü"],
  director: ["Director", "Direktörü"],
  senior_specialist: ["Senior Specialist", "Kıdemli Uzmanı"],
  specialist: ["Specialist", "Uzmanı"],
};

export interface TitlePair {
  title: string;
  title_tr: string;
}

/** The seat's two names — invented, paired, and stable for that slug. */
export function titlePairFor(seat: Seat): TitlePair {
  const place = hash(`place:${seat.slug}`) % PLACE_EN.length;
  const craft = hash(`craft:${seat.slug}`) % CRAFT_EN.length;
  const [rankEn, rankTr] = RANK[seat.role_level ?? "specialist"] ?? RANK.specialist;
  return {
    title: `${PLACE_EN[place]} ${CRAFT_EN[craft]} ${rankEn}`,
    title_tr: `${PLACE_TR[place]} ${CRAFT_TR[craft]} ${rankTr}`,
  };
}

/**
 * WHERE THE SEAT'S PERSONA DOCUMENT LIVES on the construction side.
 *
 * `agents.persona_path` used to point straight into `personas/<dept>/<slug>.md`
 * — the CEO's own authored dossiers, 205 of them — which is a link into his
 * record even after the stored body stopped being a copy of it. The last code
 * review of 2026-08-23 named it, and it is the last of the copies.
 *
 * The path must still be a real file: `tests/e125/workforce-gate.test.ts` case
 * (4) opens every stored path on disk, `tests/phase3/registry.test.ts` reads one
 * and requires the path to contain `personas/`, and the live answer lane
 * (`packages/voice/src/persona.ts`) reads it to give an employee its identity.
 * So the seed WRITES the generated document to this path — one file per seat,
 * archived seats included — under `var/`, which is not in the repository
 * (`.gitignore:76`): a fixture is a build artefact, not something to commit.
 */
export const personaPathFor = (slug: string): string =>
  `var/construction-fixtures/personas/${slug}.md`;

/** A short, stable stamp so a generated document can name its own revision. */
export const revision = (slug: string): string =>
  `build-seed/${hash(slug).toString(16).padStart(8, "0")}`;

const PURPOSE = [
  "This seat exists so that work arriving in its department is picked up by somebody rather than nobody.",
  "This seat carries one lane of its department's work from the moment it is claimed to the moment it is closed.",
  "This seat is the department's answer when a piece of work needs an owner with a name.",
  "This seat holds the part of its department's workload that cannot wait for a meeting.",
  "This seat turns an instruction that arrives in words into work that can be measured.",
  "This seat keeps its department's queue moving when nobody is watching it.",
] as const;

const METHOD = [
  "It reads the request first, states what it understood, and only then starts — a misunderstanding caught early costs nothing.",
  "It works in small finished pieces, each one measurable on its own, rather than one large piece nobody can check.",
  "It measures before it claims, and writes down the measurement beside the claim.",
  "It asks once when the answer would change the work, and never asks twice for the same thing.",
  "It finishes what it starts, and says plainly which part it could not finish and why.",
  "It leaves the next worker a record that can be read without asking it anything.",
] as const;

const AUTHORITY = [
  "It decides how its own work is done and in what order, inside the brief it was given.",
  "It chooses its own method and its own sequence; it does not choose the objective.",
  "It may reorder its queue, split a task, and stop a task that has become the wrong task.",
  "It may spend its own time freely and nothing else freely.",
] as const;

const KPI = [
  "work finished against work claimed, counted per week",
  "how long a claimed piece of work waits before it moves",
  "how often a finished piece comes back for rework",
  "how much of its queue is still moving without a reminder",
] as const;

const ESCALATION = [
  "It escalates the moment a task needs something outside its own hands, and never after the deadline it would have missed.",
  "It escalates when the instruction and the constraint contradict each other, naming both.",
  "It escalates once, with the measurement that made it escalate attached.",
] as const;

const SCOPE = [
  "Inside its own lane it decides; outside it, it proposes and waits.",
  "It decides on method and sequence; objectives, money and outward messages are decided above it.",
  "Its decisions bind its own work and nothing anybody else has claimed.",
] as const;

const STANDARD = [
  "A piece of work is finished when it can be checked by somebody who was not there.",
  "A piece of work is finished when the claim and the evidence for it are in the same place.",
  "A piece of work is finished when the next worker needs no explanation to continue it.",
] as const;

const REPORTING = [
  "It reports what changed, what it measured, and what it left undone — in that order and in one page.",
  "It reports the number first and the story after it, and never the story alone.",
  "It reports at the end of a piece of work, not at the end of a day.",
] as const;

/**
 * The persona document stored for a generated seat. It announces what it is in
 * its own second line: a reader who finds this text anywhere can tell in one
 * glance that it is a fixture and not a person's record.
 */
export function personaBodyFor(seat: Seat): string {
  const title = titlePairFor(seat).title;
  const dept = seat.department ?? "unassigned";
  const level = seat.role_level ?? "specialist";
  const rev = revision(seat.slug);
  return `# PERSONA — ${title} (${seat.slug})

> GENERATED FIXTURE. Written by db/seed/build-seed.ts for the DxB_Build
> construction engine. The holding described here does not exist, and not one
> line of this document comes from the company's own dossiers. It may not be
> read as the record of a real employee, and it may not be copied back into one.

## 1. The seat
${title}, working in the ${dept} department at the ${level} level. Employee key
\`${seat.slug}\`. Opened by the build seed, revision ${rev}.

## 2. Why the seat exists
${pick(PURPOSE, seat.slug, "purpose")}

## 3. How it works
${pick(METHOD, seat.slug, "method")}
${pick(METHOD, seat.slug, "method-2")}

## 4. What it decides on its own
${pick(AUTHORITY, seat.slug, "authority")}
${pick(SCOPE, seat.slug, "scope")}

## 5. Where it stops
Money leaving the holding, contracts, outward identity and anything a person
outside the holding would receive stop above this seat. That limit belongs to
the fixture and cannot be argued away inside it.

## 6. When it raises its hand
${pick(ESCALATION, seat.slug, "escalation")}

## 7. How it is judged
${pick(STANDARD, seat.slug, "standard")} Its running measure is ${pick(KPI, seat.slug, "kpi")}.
${pick(REPORTING, seat.slug, "reporting")}

## 8. Revision
v2.0-fable, generated as ${rev}. Running the seed again produces this document
again, character for character; nothing in it was written by hand for this seat.
`;
}

export interface Sicil {
  responsibilities: string[];
  authority_limits: string[];
  decision_scope: string;
  expertise: string[];
  methodology: string;
  reporting_standard: string;
  quality_standard: string;
  escalation_rules: string;
  kpis: string;
  version_history: string;
}

/**
 * The sicil (employee record) for a generated seat. The operational columns —
 * performance, errors, reviews, training needs — are NOT filled here: those fill
 * with real operation on this engine or they stay empty, exactly as they do on
 * the company side.
 */
export function sicilFor(seat: Seat): Sicil {
  const dept = seat.department ?? "unassigned";
  const title = titlePairFor(seat).title;
  const rev = revision(seat.slug);
  return {
    responsibilities: [
      `Carry the ${dept} work that is claimed under \`${seat.slug}\` from claim to close.`,
      `Keep the measurement beside every claim this seat makes.`,
      `Hand the next worker a record that needs no explanation.`,
    ],
    authority_limits: [
      `Decides method and sequence inside its own brief; decides no objective and no spend.`,
      `Nothing leaving the holding — money, contract, identity, outward message — passes this seat.`,
    ],
    decision_scope: pick(SCOPE, seat.slug, "scope"),
    expertise: [
      `${dept} operations, as the construction fixture models them`,
      `reading an instruction and stating what it understood before acting`,
      `finishing a small piece of work so it can be checked by somebody who was not there`,
    ],
    methodology: pick(METHOD, seat.slug, "method"),
    reporting_standard: pick(REPORTING, seat.slug, "reporting"),
    quality_standard: pick(STANDARD, seat.slug, "standard"),
    escalation_rules: pick(ESCALATION, seat.slug, "escalation"),
    kpis: JSON.stringify([{ ref: pick(KPI, seat.slug, "kpi") }]),
    version_history: JSON.stringify([
      { note: `${title} — generated fixture, revision ${rev}; no dossier was read to write it.` },
    ]),
  };
}
